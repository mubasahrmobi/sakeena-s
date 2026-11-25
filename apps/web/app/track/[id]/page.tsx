import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma, formatPKR } from "@sakeena/db";
import { ClearCart } from "@/components/ClearCart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Track your order", robots: { index: false, follow: false } };

const STEPS = [
  { status: "PENDING", title: "Order placed", text: "We’ve received your order." },
  { status: "CONFIRMED", title: "Confirmed", text: "Your order is confirmed and being prepared." },
  { status: "SHIPPED", title: "On its way", text: "Your parcel has been handed to the courier." },
  { status: "DELIVERED", title: "Delivered", text: "Enjoy your Sakeena’s piece!" },
];

export default async function Track({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const { id } = await params;
  const { placed } = await searchParams;
  const o = await prisma.order.findUnique({ where: { trackingId: id }, include: { items: true, events: { orderBy: { createdAt: "asc" } } } });
  if (!o) notFound();

  const cancelled = o.status === "CANCELLED";
  const current = STEPS.findIndex((s) => s.status === o.status);
  const when = (status: string) => {
    const e = [...o.events].reverse().find((x) => x.status === status);
    return e ? e.createdAt.toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : null;
  };
  const manual = o.paymentMethod !== "COD";

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      {placed && <ClearCart />}
      <p className="text-center text-xs uppercase tracking-[0.5em] text-gold">{placed ? `Thank you, ${o.name.split(" ")[0]}` : "Order tracking"}</p>
      <h1 className="mt-3 text-center text-4xl md:text-5xl">{placed ? "Order received" : `Order ${o.orderNo}`}</h1>
      <p className="mt-3 text-center text-ink/70">
        Order number <b>{o.orderNo}</b>{placed && <> · Save this page — it’s your private tracking link.</>}
      </p>

      {cancelled ? (
        <div className="mt-10 border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-display text-2xl">Order cancelled</p>
          <p className="mt-1 text-sm">{when("CANCELLED")}. If this is unexpected, please contact us.</p>
        </div>
      ) : (
        <ol className="mt-12 space-y-0">
          {STEPS.map((s, i) => {
            const done = i <= current;
            const active = i === current;
            return (
              <li key={s.status} className="relative flex gap-5 pb-10 last:pb-0">
                {i < STEPS.length - 1 && <span className={`absolute left-[15px] top-8 h-full w-px ${i < current ? "bg-emerald" : "bg-ink/15"}`} />}
                <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm ${done ? "border-emerald bg-emerald text-cream" : "border-ink/20 bg-cream text-ink/30"} ${active ? "ring-4 ring-gold/30" : ""}`}>
                  {done ? "✓" : i + 1}
                </span>
                <div>
                  <p className={`font-display text-xl ${done ? "text-emerald" : "text-ink/40"}`}>{s.title}</p>
                  <p className="text-sm text-ink/60">{done ? s.text : ""}</p>
                  {when(s.status) && <p className="mt-1 text-xs uppercase tracking-widest text-gold">{when(s.status)}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-14 bg-white p-6 text-sm">
        <h2 className="mb-3 font-display text-xl">Your order</h2>
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
        <p className="mt-4 text-ink/60">
          Payment: {o.paymentMethod === "COD" ? "Cash on delivery" : o.paymentMethod} ·{" "}
          {o.paymentStatus === "PAID" ? "Paid" : o.paymentStatus === "AWAITING_VERIFICATION" ? "We’re verifying your payment" : manual ? "Pending" : "Pay the rider on delivery"}
        </p>
        <p className="text-ink/60">Delivering to: {o.city}</p>
      </div>
      <div className="mt-8 text-center"><Link href="/shop" className="btn-outline">Continue shopping</Link></div>
    </div>
  );
}
