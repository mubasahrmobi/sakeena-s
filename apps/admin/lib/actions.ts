"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  prisma, parseList, ORDER_STATUSES, PAYMENT_STATUSES, takeStock, returnStock, logMovement,
} from "@sakeena/db";
import { getSession, hashPassword } from "./auth";
import { refreshStorefront } from "./revalidate";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
async function guard(ownerOnly = false) {
  const s = await getSession();
  if (!s || (ownerOnly && s.role !== "OWNER")) redirect(s ? "/" : "/login");
  return s;
}
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => Math.max(0, Math.round(Number(f.get(k) ?? 0)) || 0);

/* ───────────── Products & stock ───────────── */

export async function saveProduct(form: FormData) {
  await guard();
  const id = str(form, "id");
  const name = str(form, "name");
  const sizeList = parseList(str(form, "sizes"));
  const sizes = sizeList.length ? sizeList : ["One Size"];
  const stocks = sizes.map((s) => ({ size: s, stock: int(form, `ss_${s}`) }));
  const data = {
    name,
    description: str(form, "description"),
    price: int(form, "price"),
    discountPercent: Math.min(90, int(form, "discountPercent")),
    images: str(form, "images"),
    sizes: sizes.join(","),
    colors: str(form, "colors"),
    stock: stocks.reduce((n, s) => n + s.stock, 0),
    featured: form.get("featured") === "on",
    active: form.get("active") === "on",
    categoryId: str(form, "categoryId"),
    brandId: str(form, "brandId") || null,
  };

  await prisma.$transaction(async (tx) => {
    let productId = id;
    if (id) {
      await tx.product.update({ where: { id }, data });
    } else {
      let slug = slugify(name) || "product";
      if (await tx.product.findUnique({ where: { slug } })) slug += "-" + Math.floor(Math.random() * 900 + 100);
      productId = (await tx.product.create({ data: { ...data, slug } })).id;
    }
    const existing = await tx.productSize.findMany({ where: { productId } });
    // log changes, then write the per-size rows
    for (const s of stocks) {
      const before = existing.find((e) => e.size === s.size)?.stock ?? 0;
      await tx.productSize.upsert({
        where: { productId_size: { productId, size: s.size } },
        update: { stock: s.stock },
        create: { productId, size: s.size, stock: s.stock },
      });
      if (before !== s.stock && (id || s.stock > 0)) {
        await logMovement(tx, { productId, size: s.size, change: s.stock - before, reason: "MANUAL" });
      }
    }
    await tx.productSize.deleteMany({ where: { productId, size: { notIn: sizes } } });
  });
  await refreshStorefront();
  revalidatePath("/products");
  revalidatePath("/stock");
  redirect("/products");
}

export async function deleteProduct(form: FormData) {
  await guard();
  const id = str(form, "id");
  const used = await prisma.orderItem.count({ where: { productId: id } });
  // Products that appear in past orders are hidden instead of deleted to keep order history intact.
  if (used > 0) await prisma.product.update({ where: { id }, data: { active: false } });
  else await prisma.product.delete({ where: { id } });
  await refreshStorefront();
  revalidatePath("/products");
  redirect("/products");
}

/** Manual stock count for one product: per size (`ss_<size>`), or a single total for older products. */
export async function setStock(form: FormData) {
  await guard();
  const id = str(form, "id");
  await prisma.$transaction(async (tx) => {
    const p = await tx.product.findUnique({ where: { id }, include: { sizeStocks: true } });
    if (!p) return;
    if (p.sizeStocks.length === 0) {
      const stock = int(form, "stock");
      if (stock !== p.stock) {
        await tx.product.update({ where: { id }, data: { stock } });
        await logMovement(tx, { productId: id, change: stock - p.stock, reason: "MANUAL" });
      }
      return;
    }
    for (const row of p.sizeStocks) {
      const next = int(form, `ss_${row.size}`);
      if (next === row.stock) continue;
      await tx.productSize.update({ where: { id: row.id }, data: { stock: next } });
      await tx.product.update({ where: { id }, data: { stock: { increment: next - row.stock } } });
      await logMovement(tx, { productId: id, size: row.size, change: next - row.stock, reason: "MANUAL" });
    }
  });
  await refreshStorefront();
  revalidatePath("/stock");
  revalidatePath("/products");
}

/* ───────────── Brands, categories, coupons ───────────── */

export async function saveBrand(form: FormData) {
  await guard();
  const id = str(form, "id");
  const name = str(form, "name");
  if (!name) return;
  const data = {
    name,
    description: str(form, "description"),
    logo: str(form, "logo").split("\n")[0]?.trim() ?? "",
    active: form.get("active") === "on",
  };
  if (id) {
    await prisma.brand.update({ where: { id }, data });
  } else {
    let slug = slugify(name) || "brand";
    if (await prisma.brand.findUnique({ where: { slug } })) slug += "-" + Math.floor(Math.random() * 900 + 100);
    await prisma.brand.create({ data: { ...data, slug } });
  }
  await refreshStorefront();
  revalidatePath("/brands");
  redirect("/brands");
}

export async function deleteBrand(form: FormData) {
  await guard();
  const id = str(form, "id");
  // A brand that still has products is hidden instead of deleted.
  if ((await prisma.product.count({ where: { brandId: id } })) > 0) await prisma.brand.update({ where: { id }, data: { active: false } });
  else await prisma.brand.delete({ where: { id } });
  await refreshStorefront();
  revalidatePath("/brands");
  redirect("/brands");
}

export async function addCategory(form: FormData) {
  await guard();
  const name = str(form, "name");
  if (name) await prisma.category.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name) } });
  await refreshStorefront();
  revalidatePath("/categories");
}
export async function deleteCategory(form: FormData) {
  await guard();
  const id = str(form, "id");
  if ((await prisma.product.count({ where: { categoryId: id } })) === 0) await prisma.category.delete({ where: { id } });
  await refreshStorefront();
  revalidatePath("/categories");
}

export async function addCoupon(form: FormData) {
  await guard(true);
  const code = str(form, "code").toUpperCase();
  const percent = Math.min(90, int(form, "percent"));
  if (code && percent > 0) await prisma.coupon.upsert({ where: { code }, update: { percent, active: true }, create: { code, percent } });
  revalidatePath("/coupons");
}
export async function toggleCoupon(form: FormData) {
  await guard(true);
  const id = str(form, "id");
  const c = await prisma.coupon.findUnique({ where: { id } });
  if (c) await prisma.coupon.update({ where: { id }, data: { active: !c.active } });
  revalidatePath("/coupons");
}

/* ───────────── Orders ───────────── */

export async function updateOrder(form: FormData) {
  await guard();
  const id = str(form, "id");
  const status = str(form, "status");
  const paymentStatus = str(form, "paymentStatus");
  if (!ORDER_STATUSES.includes(status as never) || !PAYMENT_STATUSES.includes(paymentStatus as never)) return;

  await prisma.$transaction(async (tx) => {
    const prev = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!prev) return;

    // A delivered order is a completed sale: record when it happened,
    // and cash-on-delivery orders count as paid once the rider hands them over.
    const data: { status: string; paymentStatus: string; deliveredAt?: Date | null } = { status, paymentStatus };
    if (status === "DELIVERED") {
      data.deliveredAt = prev.deliveredAt ?? new Date();
      if (prev.paymentMethod === "COD") data.paymentStatus = "PAID";
    } else {
      data.deliveredAt = null;
    }
    await tx.order.update({ where: { id }, data });
    // Each status change is added to the timeline the customer sees on their tracking page.
    if (status !== prev.status) await tx.orderEvent.create({ data: { orderId: id, status } });

    // Cancelling returns the items to stock (per size); un-cancelling takes them out again.
    const cancelling = status === "CANCELLED" && prev.status !== "CANCELLED";
    const restoring = prev.status === "CANCELLED" && status !== "CANCELLED";
    if (!cancelling && !restoring) return;
    for (const i of prev.items) {
      if (restoring) {
        if (!(await takeStock(tx, i.productId, i.size, i.qty))) throw new Error(`Not enough stock of ${i.name} (${i.size}) to re-open this order.`);
      } else {
        await returnStock(tx, i.productId, i.size, i.qty);
      }
      await logMovement(tx, {
        productId: i.productId, size: i.size, change: cancelling ? i.qty : -i.qty,
        reason: cancelling ? "CANCEL" : "RESTORE", ref: prev.orderNo,
      });
    }
  });
  await refreshStorefront();
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/sales");
  revalidatePath("/stock");
}

/** Courier details and the "phone-confirmed" flag shown on the order page and the customer's tracking page. */
export async function saveOrderExtras(form: FormData) {
  await guard();
  const id = str(form, "id");
  await prisma.order.update({
    where: { id },
    data: {
      courier: str(form, "courier") || null,
      courierTrackingNo: str(form, "courierTrackingNo") || null,
      courierUrl: str(form, "courierUrl") || null,
      codConfirmed: form.get("codConfirmed") === "on",
    },
  });
  revalidatePath(`/orders/${id}`);
}

/** Owner only. Removes an order (for test orders). Stock is returned first if the order was still open. */
export async function deleteOrder(form: FormData) {
  await guard(true);
  const id = str(form, "id");
  await prisma.$transaction(async (tx) => {
    const o = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!o) return;
    if (o.status !== "CANCELLED") {
      for (const i of o.items) {
        await returnStock(tx, i.productId, i.size, i.qty);
        await logMovement(tx, { productId: i.productId, size: i.size, change: i.qty, reason: "CANCEL", ref: o.orderNo });
      }
    }
    await tx.order.delete({ where: { id } });
  });
  await refreshStorefront();
  revalidatePath("/orders");
  revalidatePath("/sales");
  revalidatePath("/stock");
  redirect("/orders");
}

/* ───────────── Banners ───────────── */

export async function saveBanner(form: FormData) {
  await guard();
  const id = str(form, "id");
  const image = str(form, "image").split("\n")[0]?.trim() ?? "";
  if (!image) return;
  const data = {
    title: str(form, "title"), subtitle: str(form, "subtitle"), image,
    href: str(form, "href") || "/shop", sort: int(form, "sort"), active: form.get("active") === "on",
  };
  if (id) await prisma.banner.update({ where: { id }, data });
  else await prisma.banner.create({ data });
  await refreshStorefront();
  revalidatePath("/banners");
  redirect("/banners");
}
export async function deleteBanner(form: FormData) {
  await guard();
  await prisma.banner.delete({ where: { id: str(form, "id") } });
  await refreshStorefront();
  revalidatePath("/banners");
  redirect("/banners");
}

/* ───────────── Reviews ───────────── */

export async function setReview(form: FormData) {
  await guard();
  const id = str(form, "id");
  if (str(form, "do") === "delete") await prisma.review.delete({ where: { id } });
  else await prisma.review.update({ where: { id }, data: { approved: str(form, "do") === "approve" } });
  await refreshStorefront();
  revalidatePath("/reviews");
}

/* ───────────── Staff (owner only) ───────────── */

export async function addStaff(form: FormData) {
  await guard(true);
  const email = str(form, "email").toLowerCase();
  const name = str(form, "name");
  const password = String(form.get("password") ?? "");
  if (!email || !name || password.length < 8) redirect("/staff?error=1");
  if (await prisma.adminUser.findUnique({ where: { email } })) redirect("/staff?error=2");
  await prisma.adminUser.create({ data: { email, name, passwordHash: hashPassword(password), role: "STAFF" } });
  revalidatePath("/staff");
  redirect("/staff");
}
export async function toggleStaff(form: FormData) {
  await guard(true);
  const id = str(form, "id");
  const u = await prisma.adminUser.findUnique({ where: { id } });
  if (u) await prisma.adminUser.update({ where: { id }, data: { active: !u.active } });
  revalidatePath("/staff");
}
export async function deleteStaff(form: FormData) {
  await guard(true);
  await prisma.adminUser.delete({ where: { id: str(form, "id") } });
  revalidatePath("/staff");
}
