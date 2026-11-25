"use server";
import { redirect } from "next/navigation";
import { prisma, finalPrice, shippingFor, PAYMENT_METHODS } from "@sakeena/db";

type Line = { productId: string; size: string; color: string; qty: number };

export type CheckoutState = { error?: string } | undefined;

export async function placeOrder(_: CheckoutState, form: FormData): Promise<CheckoutState> {
  const get = (k: string) => String(form.get(k) ?? "").trim();
  const name = get("name"), phone = get("phone").replace(/[\s-]/g, ""), address = get("address"), city = get("city");
  const email = get("email"), notes = get("notes"), method = get("paymentMethod");
  const paymentRef = get("paymentRef"), couponCode = get("coupon").toUpperCase();

  if (!name || !address || !city) return { error: "Please fill in your name, address and city." };
  if (!/^(03\d{9}|\+923\d{9})$/.test(phone)) return { error: "Enter a valid Pakistani mobile number (e.g. 03XX1234567)." };
  const pm = PAYMENT_METHODS.find((m) => m.id === method);
  if (!pm) return { error: "Choose a payment method." };
  if (pm.manual && paymentRef.length < 4) return { error: "Enter the transaction / reference ID of your payment." };

  let lines: Line[];
  try { lines = JSON.parse(get("items")); } catch { return { error: "Your bag could not be read. Please try again." }; }
  if (!Array.isArray(lines) || lines.length === 0) return { error: "Your bag is empty." };

  // Re-price everything on the server — never trust prices sent by the browser.
  const products = await prisma.product.findMany({ where: { id: { in: lines.map((l) => l.productId) }, active: true } });
  const items = [];
  let subtotal = 0;
  for (const l of lines) {
    const p = products.find((x) => x.id === l.productId);
    const qty = Math.floor(Number(l.qty));
    if (!p || !(qty > 0)) return { error: "An item in your bag is no longer available." };
    if (p.stock < qty) return { error: `Only ${p.stock} left of ${p.name}.` };
    const price = finalPrice(p.price, p.discountPercent);
    subtotal += price * qty;
    items.push({ productId: p.id, name: p.name, size: String(l.size), color: l.color ? String(l.color) : null, price, qty });
  }

  let discount = 0;
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const c = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (!c || !c.active) return { error: "That coupon code is not valid." };
    discount = Math.round((subtotal * c.percent) / 100);
    appliedCoupon = c.code;
  }
  const shipping = shippingFor(subtotal - discount);
  const total = subtotal - discount + shipping;
  const orderNo = "SK-" + Math.floor(100000 + Math.random() * 900000);

  await prisma.$transaction([
    prisma.order.create({
      data: {
        orderNo, name, phone, email: email || null, address, city, notes: notes || null,
        subtotal, discount, shipping, total, couponCode: appliedCoupon,
        paymentMethod: method,
        paymentStatus: pm.manual ? "AWAITING_VERIFICATION" : "PENDING",
        paymentRef: paymentRef || null,
        items: { create: items },
      },
    }),
    ...items.map((i) =>
      prisma.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.qty } } })
    ),
  ]);

  redirect(`/order/${orderNo}`);
}
