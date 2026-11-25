import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma, formatPKR } from "@sakeena/db";
import { ClearCart } from "@/components/ClearCart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order placed" };

export default async function OrderPage({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;
  const o = await prisma.order.findUnique({ where: { orderNo }, include: { items: true } });
  if (!o) notFound();
  const manual = o.paymentMethod !== "COD";
  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <ClearCart />
      <p className="text-center text-xs uppercase tracking-[0.5em] text-gold">Thank you, {o.name.split(" ")[0]}</p>
      <h1 className="mt-3 text-center text-5xl">Order received</h1>
      <p className="mt-4 text-center text-ink/70">
        Order <b>{o.orderNo}</b>. {manual ? "We’ll verify your payment and confirm shortly." : "Please keep the amount ready for the rider."} We’ll call or message you on {o.phone}.
      </p>
      <div className="mt-10 bg-white p-6 text-sm">
        <ul className="divide-y divide-ink/10">
          {o.items.map((i) => (
            <li key={i.id} className="flex justify-between py-3">
              <span>{i.name} <span className="text-ink/50">×{i.qty} · {i.size}{i.color ? ` · ${i.color}` : ""}</span></span>
              <span>{formatPKR(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-ink/10 pt-4">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPKR(o.subtotal)}</dd></div>
          {o.discount > 0 && <div className="flex justify-between"><dt>Discount ({o.couponCode})</dt><dd>− {formatPKR(o.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Delivery</dt><dd>{o.shipping === 0 ? "Free" : formatPKR(o.shipping)}</dd></div>
          <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd>{formatPKR(o.total)}</dd></div>
        </dl>
        <p className="mt-4 text-ink/60">Payment: {o.paymentMethod} · {o.paymentStatus.replace("_", " ")}</p>
        <p className="text-ink/60">Deliver to: {o.address}, {o.city}</p>
      </div>
      <div className="mt-8 text-center"><Link href="/shop" className="btn-outline">Continue shopping</Link></div>
    </div>
  );
}
