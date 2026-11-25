"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@sakeena/db";
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

export async function updateStock(form: FormData) {
  await guard();
  const updates: Promise<unknown>[] = [];
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("stock_")) continue;
    const stock = Math.max(0, Math.round(Number(value)) || 0);
    updates.push(prisma.product.update({ where: { id: key.slice(6) }, data: { stock } }));
  }
  await Promise.all(updates);
  revalidatePath("/stock");
  revalidatePath("/products");
  redirect("/stock?saved=1");
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
  const prev = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!prev) return;
  await prisma.order.update({ where: { id }, data: { status, paymentStatus } });
  // Cancelling an order returns its items to stock.
  if (status === "CANCELLED" && prev.status !== "CANCELLED") {
    for (const i of prev.items) await prisma.product.update({ where: { id: i.productId }, data: { stock: { increment: i.qty } } });
  }
  if (prev.status === "CANCELLED" && status !== "CANCELLED") {
    for (const i of prev.items) await prisma.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.qty } } });
  }
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
}
