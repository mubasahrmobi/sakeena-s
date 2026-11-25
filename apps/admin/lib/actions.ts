"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, ORDER_STATUSES, PAYMENT_STATUSES } from "@sakeena/db";
import { isAuthed } from "./auth";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
async function guard() { if (!(await isAuthed())) redirect("/login"); }
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => Math.max(0, Math.round(Number(f.get(k) ?? 0)) || 0);

export async function saveProduct(form: FormData) {
  await guard();
  const id = str(form, "id");
  const name = str(form, "name");
  const data = {
    name,
    description: str(form, "description"),
    price: int(form, "price"),
    discountPercent: Math.min(90, int(form, "discountPercent")),
    images: str(form, "images"),
    sizes: str(form, "sizes"),
    colors: str(form, "colors"),
    stock: int(form, "stock"),
    featured: form.get("featured") === "on",
    active: form.get("active") === "on",
    categoryId: str(form, "categoryId"),
    brandId: str(form, "brandId") || null,
  };
  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    let slug = slugify(name) || "product";
    if (await prisma.product.findUnique({ where: { slug } })) slug += "-" + Math.floor(Math.random() * 900 + 100);
    await prisma.product.create({ data: { ...data, slug } });
  }
  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(form: FormData) {
  await guard();
  const id = str(form, "id");
  const used = await prisma.orderItem.count({ where: { productId: id } });
  // Products that appear in past orders are hidden instead of deleted to keep order history intact.
  if (used > 0) await prisma.product.update({ where: { id }, data: { active: false } });
  else await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
  redirect("/products");
}

/** Set a product's stock to an exact number (manual count) and log the difference. */
export async function setStock(form: FormData) {
  await guard();
  const id = str(form, "id");
  const stock = int(form, "stock");
  await prisma.$transaction(async (tx) => {
    const p = await tx.product.findUnique({ where: { id } });
    if (!p || p.stock === stock) return;
    await tx.product.update({ where: { id }, data: { stock } });
    await tx.stockMovement.create({ data: { productId: id, change: stock - p.stock, after: stock, reason: "MANUAL" } });
  });
  revalidatePath("/stock");
  revalidatePath("/products");
}

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
  revalidatePath("/brands");
  redirect("/brands");
}

export async function deleteBrand(form: FormData) {
  await guard();
  const id = str(form, "id");
  // A brand that still has products is hidden instead of deleted.
  if ((await prisma.product.count({ where: { brandId: id } })) > 0) await prisma.brand.update({ where: { id }, data: { active: false } });
  else await prisma.brand.delete({ where: { id } });
  revalidatePath("/brands");
  redirect("/brands");
}

export async function addCategory(form: FormData) {
  await guard();
  const name = str(form, "name");
  if (name) await prisma.category.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name) } });
  revalidatePath("/categories");
}
export async function deleteCategory(form: FormData) {
  await guard();
  const id = str(form, "id");
  if ((await prisma.product.count({ where: { categoryId: id } })) === 0) await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
}

export async function addCoupon(form: FormData) {
  await guard();
  const code = str(form, "code").toUpperCase();
  const percent = Math.min(90, int(form, "percent"));
  if (code && percent > 0) await prisma.coupon.upsert({ where: { code }, update: { percent, active: true }, create: { code, percent } });
  revalidatePath("/coupons");
}
export async function toggleCoupon(form: FormData) {
  await guard();
  const id = str(form, "id");
  const c = await prisma.coupon.findUnique({ where: { id } });
  if (c) await prisma.coupon.update({ where: { id }, data: { active: !c.active } });
  revalidatePath("/coupons");
}

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

    // Cancelling returns the items to stock; un-cancelling takes them out again.
    const cancelling = status === "CANCELLED" && prev.status !== "CANCELLED";
    const restoring = prev.status === "CANCELLED" && status !== "CANCELLED";
    if (!cancelling && !restoring) return;
    for (const i of prev.items) {
      const change = cancelling ? i.qty : -i.qty;
      if (restoring) {
        const ok = await tx.product.updateMany({ where: { id: i.productId, stock: { gte: i.qty } }, data: { stock: { decrement: i.qty } } });
        if (ok.count === 0) throw new Error(`Not enough stock of ${i.name} to re-open this order.`);
      } else {
        await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.qty } } });
      }
      const p = await tx.product.findUnique({ where: { id: i.productId } });
      await tx.stockMovement.create({
        data: { productId: i.productId, change, after: p?.stock ?? 0, reason: cancelling ? "CANCEL" : "RESTORE", ref: prev.orderNo },
      });
    }
  });
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/sales");
  revalidatePath("/stock");
}
