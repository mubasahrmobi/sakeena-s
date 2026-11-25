import Link from "next/link";
import { prisma, formatPKR } from "@sakeena/db";
import { Shell } from "@/components/Shell";

export const dynamic = "force-dynamic";

export default async function Orders() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <Shell title="Orders">
      <div className="overflow-x-auto bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-widest text-ink/50">
            <tr><th className="p-4">Order</th><th>Customer</th><th>City</th><th>Total</th><th>Payment</th><th>Pay status</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="p-4"><Link href={`/orders/${o.id}`} className="text-emerald underline">{o.orderNo}</Link></td>
                <td>{o.name}</td><td>{o.city}</td><td>{formatPKR(o.total)}</td><td>{o.paymentMethod}</td>
                <td className={o.paymentStatus === "AWAITING_VERIFICATION" ? "font-medium text-gold" : ""}>{o.paymentStatus.replace("_", " ")}</td>
                <td>{o.status}</td><td>{o.createdAt.toLocaleDateString("en-PK")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-ink/50">No orders yet.</p>}
      </div>
    </Shell>
  );
}
