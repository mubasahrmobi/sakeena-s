import { notFound } from "next/navigation";
import { prisma, formatPKR } from "@sakeena/db";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

/** Printable invoice, or (with ?slip=1) a packing slip without prices. */
export default async function Invoice({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ slip?: string }> }) {
  const { id } = await params;
  const { slip } = await searchParams;
  const o = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!o) notFound();
  const isSlip = !!slip;
  return (
    <div className="mx-auto max-w-3xl bg-white p-10 text-sm text-black print:p-0">
      <div className="flex items-start justify-between border-b border-black/20 pb-6">
        <div>
          <p className="font-display text-3xl tracking-[0.25em] text-emerald">SAKEENA’S</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.4em] text-gold">Tranquil Elegance</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl">{isSlip ? "Packing slip" : "Invoice"}</p>
          <p className="mt-1">Order <b>{o.orderNo}</b></p>
          <p>{o.createdAt.toLocaleDateString("en-PK", { dateStyle: "long" })}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-black/50">Ship to</p>
          <p className="mt-1 text-base font-medium">{o.name}</p>
          <p>{o.address}</p>
          <p>{o.city}</p>
          <p className="mt-1">Phone: {o.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-black/50">Payment</p>
          <p className="mt-1 font-medium">{o.paymentMethod === "COD" ? "Cash on Delivery" : o.paymentMethod}</p>
          {o.paymentMethod === "COD" && <p className="mt-2 text-base font-bold">COLLECT: {formatPKR(o.total)}</p>}
          {o.paymentMethod !== "COD" && <p>{o.paymentStatus === "PAID" ? "Paid" : o.paymentStatus.replace("_", " ")}</p>}
          {o.courier && <p className="mt-2">Courier: {o.courier}{o.courierTrackingNo ? ` · ${o.courierTrackingNo}` : ""}</p>}
        </div>
      </div>

      <table className="mt-8 w-full text-left">
        <thead className="border-y border-black/20 text-xs uppercase tracking-widest text-black/50">
          <tr><th className="py-2">Item</th><th>Size</th><th>Colour</th><th className="text-center">Qty</th>{!isSlip && <th className="text-right">Price</th>}</tr>
        </thead>
        <tbody>
          {o.items.map((i) => (
            <tr key={i.id} className="border-b border-black/10">
              <td className="py-3">{isSlip && <span className="mr-2 inline-block h-3 w-3 border border-black" />}{i.name}</td>
              <td>{i.size}</td><td>{i.color ?? "—"}</td><td className="text-center">{i.qty}</td>
              {!isSlip && <td className="text-right">{formatPKR(i.price * i.qty)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {!isSlip && (
        <dl className="ml-auto mt-6 w-64 space-y-1">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPKR(o.subtotal)}</dd></div>
          {o.discount > 0 && <div className="flex justify-between"><dt>Discount ({o.couponCode})</dt><dd>− {formatPKR(o.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Delivery</dt><dd>{o.shipping === 0 ? "Free" : formatPKR(o.shipping)}</dd></div>
          <div className="flex justify-between border-t border-black/20 pt-2 text-base font-bold"><dt>Total</dt><dd>{formatPKR(o.total)}</dd></div>
        </dl>
      )}
      {o.notes && <p className="mt-6">Customer note: {o.notes}</p>}
      <p className="mt-10 text-center text-xs text-black/50">Thank you for shopping with Sakeena’s.</p>
      <div className="mt-8 text-center print:hidden"><PrintButton /></div>
    </div>
  );
}
