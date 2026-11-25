import Link from "next/link";
import { prisma, formatPKR } from "@sakeena/db";
import { Shell } from "@/components/Shell";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [orders, products, pending, verify, revenue, recent, lowStock] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { paymentStatus: "AWAITING_VERIFICATION" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.product.findMany({ where: { stock: { lte: 5 }, active: true }, take: 6 }),
  ]);
  const stat = (label: string, value: string | number, href?: string) => (
    <Link href={href ?? "#"} className="bg-white p-6">
      <p className="text-xs uppercase tracking-widest text-ink/50">{label}</p>
      <p className="mt-2 font-display text-3xl text-emerald">{value}</p>
    </Link>
  );
  return (
    <Shell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-5">
        {stat("Sales (delivered)", formatPKR(revenue._sum.total ?? 0), "/sales")}
        {stat("Orders", orders, "/orders")}
        {stat("New orders", pending, "/orders")}
        {stat("Payments to verify", verify, "/orders")}
        {stat("Products", products, "/products")}
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="bg-white p-6">
          <h2 className="mb-4 text-xl">Recent orders</h2>
          <ul className="divide-y divide-ink/10 text-sm">
            {recent.map((o) => (
              <li key={o.id} className="flex justify-between py-3">
                <Link href={`/orders/${o.id}`} className="text-emerald underline">{o.orderNo}</Link>
                <span>{o.name}</span><span>{formatPKR(o.total)}</span><span className="text-ink/50">{o.status}</span>
              </li>
            ))}
            {recent.length === 0 && <li className="py-3 text-ink/50">No orders yet.</li>}
          </ul>
        </section>
        <section className="bg-white p-6">
          <h2 className="mb-4 text-xl">Low stock</h2>
          <ul className="divide-y divide-ink/10 text-sm">
            {lowStock.map((p) => (
              <li key={p.id} className="flex justify-between py-3">
                <Link href={`/products/${p.id}`} className="text-emerald underline">{p.name}</Link><span>{p.stock} left</span>
              </li>
            ))}
            {lowStock.length === 0 && <li className="py-3 text-ink/50">Stock levels look healthy.</li>}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
