import { notFound } from "next/navigation";
import { prisma, formatPKR, ORDER_STATUSES, PAYMENT_STATUSES } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { updateOrder } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!o) notFound();
  return (
    <Shell title={`Order ${o.orderNo}`}>
      <div className="grid max-w-5xl gap-8 md:grid-cols-2">
        <section className="space-y-2 bg-white p-6 text-sm">
          <h2 className="mb-2 text-xl">Customer</h2>
          <p><b>{o.name}</b></p>
          <p>Phone: <a href={`tel:${o.phone}`} className="text-emerald underline">{o.phone}</a> · <a href={`https://wa.me/92${o.phone.replace(/^(\+92|0)/, "")}`} target="_blank" className="text-emerald underline">WhatsApp</a></p>
          {o.email && <p>Email: {o.email}</p>}
          <p>{o.address}, {o.city}</p>
          {o.notes && <p className="text-ink/60">Notes: {o.notes}</p>}
          <h2 className="!mt-6 mb-2 text-xl">Payment</h2>
          <p>Method: <b>{o.paymentMethod}</b></p>
          {o.paymentRef && <p>Customer’s transaction ID: <b>{o.paymentRef}</b></p>}
          {o.couponCode && <p>Coupon: {o.couponCode} (− {formatPKR(o.discount)})</p>}
        </section>

        <section className="bg-white p-6 text-sm">
          <h2 className="mb-2 text-xl">Items</h2>
          <ul className="divide-y divide-ink/10">
            {o.items.map((i) => (
              <li key={i.id} className="flex justify-between py-2">
                <span>{i.name} <span className="text-ink/50">×{i.qty} · {i.size}{i.color ? ` · ${i.color}` : ""}</span></span>
                <span>{formatPKR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between"><span>Delivery</span><span>{formatPKR(o.shipping)}</span></p>
          <p className="mt-1 flex justify-between text-base font-medium"><span>Total</span><span>{formatPKR(o.total)}</span></p>
        </section>

        <form action={updateOrder} className="space-y-4 bg-white p-6 md:col-span-2">
          <input type="hidden" name="id" value={o.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Order status</label>
              <select name="status" defaultValue={o.status} className="input">{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <div>
              <label className="label">Payment status</label>
              <select name="paymentStatus" defaultValue={o.paymentStatus} className="input">{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
          </div>
          <p className="text-xs text-ink/50">For JazzCash / Easypaisa / bank orders, check the transaction ID in your account, then mark payment as PAID. For COD, mark PAID after delivery.</p>
          <button className="btn-primary">Update order</button>
        </form>
      </div>
    </Shell>
  );
}
