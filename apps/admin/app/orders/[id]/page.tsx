import Link from "next/link";
import { notFound } from "next/navigation";
import { randomBytes } from "crypto";
import { prisma, formatPKR, ORDER_STATUSES, PAYMENT_STATUSES } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { updateOrder, saveOrderExtras, deleteOrder } from "@/lib/actions";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let o = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!o) notFound();
  // Older orders created before tracking existed get their private link the first time they're opened.
  if (!o.trackingId) {
    o = await prisma.order.update({ where: { id }, data: { trackingId: randomBytes(10).toString("hex") }, include: { items: true } });
  }
  const trackUrl = `${(process.env.WEB_URL ?? "http://localhost:3000").replace(/\/$/, "")}/track/${o.trackingId}`;
  const waNumber = "92" + o.phone.replace(/\D/g, "").replace(/^(92|0)/, "");
  const first = o.name.split(" ")[0];
  const message = `Assalam-o-Alaikum ${first}! Your Sakeena’s order ${o.orderNo} is ${o.status.toLowerCase()}. Track it anytime here: ${trackUrl}`;
  const confirmMsg = `Assalam-o-Alaikum ${first}! Thank you for ordering from Sakeena’s. Please confirm your order ${o.orderNo} (total ${formatPKR(o.total)}) to ${o.address}, ${o.city}. Reply YES to confirm. Track it here: ${trackUrl}`;
  const shipMsg = `Assalam-o-Alaikum ${first}! Your Sakeena’s order ${o.orderNo} has been shipped${o.courier ? ` via ${o.courier}` : ""}${o.courierTrackingNo ? ` (tracking no. ${o.courierTrackingNo})` : ""}. Track it here: ${trackUrl}`;
  const wa = (text: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  const session = await getSession();
  return (
    <Shell
      title={`Order ${o.orderNo}`}
      action={
        <span className="flex gap-3">
          <Link href={`/orders/${o.id}/invoice`} target="_blank" className="btn-outline !px-4 !py-2">Invoice</Link>
          <Link href={`/orders/${o.id}/invoice?slip=1`} target="_blank" className="btn-outline !px-4 !py-2">Packing slip</Link>
        </span>
      }
    >
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

        <form action={saveOrderExtras} className="space-y-4 bg-white p-6 md:col-span-2">
          <input type="hidden" name="id" value={o.id} />
          <h2 className="text-xl">Courier &amp; confirmation</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div><label className="label">Courier</label><input name="courier" defaultValue={o.courier ?? ""} placeholder="TCS, Leopards, Trax, PostEx…" className="input" /></div>
            <div><label className="label">Courier tracking no.</label><input name="courierTrackingNo" defaultValue={o.courierTrackingNo ?? ""} className="input" /></div>
            <div><label className="label">Courier tracking link (optional)</label><input name="courierUrl" defaultValue={o.courierUrl ?? ""} placeholder="https://…" className="input" /></div>
          </div>
          {o.paymentMethod === "COD" && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="codConfirmed" defaultChecked={o.codConfirmed} className="accent-emerald" />
              I phoned / messaged the customer and they confirmed this Cash on Delivery order
            </label>
          )}
          <button className="btn-outline">Save courier details</button>
          <p className="text-xs text-ink/50">The courier name and number appear on the customer’s tracking page.</p>
        </form>

        <section className="space-y-3 bg-white p-6 md:col-span-2">
          <h2 className="text-xl">Message the customer</h2>
          <p className="text-sm text-ink/60">Private tracking link for this order. When you change the status above, the customer sees it there.</p>
          <input readOnly value={trackUrl} className="input" />
          <div className="flex flex-wrap gap-3">
            <a href={wa(confirmMsg)} target="_blank" className="btn-gold">WhatsApp: confirm order</a>
            <a href={wa(shipMsg)} target="_blank" className="btn-gold">WhatsApp: order shipped</a>
            <a href={wa(message)} target="_blank" className="btn-outline">WhatsApp: current status</a>
            <a href={trackUrl} target="_blank" className="btn-outline">Open tracking page</a>
          </div>
        </section>

        {session?.role === "OWNER" && (
          <form action={deleteOrder} className="md:col-span-2">
            <input type="hidden" name="id" value={o.id} />
            <button className="text-xs uppercase tracking-widest text-red-700 underline">Delete this order (for test orders — stock is returned)</button>
          </form>
        )}
      </div>
    </Shell>
  );
}
