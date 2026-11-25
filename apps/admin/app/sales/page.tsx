import Link from "next/link";
import { prisma, formatPKR } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { DataTable, FilterPills, type Column } from "@/components/DataTable";
import { tableParams, type SP } from "@/lib/table";

export const dynamic = "force-dynamic";

const RANGES: Record<string, number | undefined> = { today: 0, "7d": 7, "30d": 30 };

function since(range?: string) {
  if (range === undefined || !(range in RANGES)) return undefined;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (RANGES[range] ?? 0));
  return d;
}

async function load(sp: SP) {
  const t = tableParams(sp, { sorts: ["orderNo", "name", "city", "total", "paymentMethod", "deliveredAt"], defaultSort: "deliveredAt" });
  const from = since(sp.range);
  // A sale = a delivered order.
  const base = { status: "DELIVERED", ...(from ? { deliveredAt: { gte: from } } : {}) };
  const where = {
    ...base,
    ...(t.q ? { OR: [{ orderNo: { contains: t.q } }, { name: { contains: t.q } }, { city: { contains: t.q } }] } : {}),
  };
  const [rows, total, agg, items, openAgg] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { [t.sort]: t.dir }, include: { items: true }, skip: t.skip, take: t.take }),
    prisma.order.count({ where }),
    prisma.order.aggregate({ where: base, _sum: { total: true, discount: true }, _count: true }),
    prisma.orderItem.findMany({ where: { order: base } }),
    prisma.order.aggregate({ where: { status: { in: ["PENDING", "CONFIRMED", "SHIPPED"] } }, _sum: { total: true }, _count: true }),
  ]);
  const byProduct = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const i of items) {
    const e = byProduct.get(i.productId) ?? { name: i.name, qty: 0, revenue: 0 };
    e.qty += i.qty; e.revenue += i.qty * i.price;
    byProduct.set(i.productId, e);
  }
  const top = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  return {
    t, rows, total, top,
    revenue: agg._sum.total ?? 0, count: agg._count, discounts: agg._sum.discount ?? 0,
    units: items.reduce((n, i) => n + i.qty, 0),
    pending: openAgg._sum.total ?? 0, pendingCount: openAgg._count,
  };
}
type Row = Awaited<ReturnType<typeof load>>["rows"][number];

export default async function Sales({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const d = await load(sp);
  const columns: Column<Row>[] = [
    { key: "no", label: "Order", sortKey: "orderNo", render: (o) => <Link href={`/orders/${o.id}`} className="text-emerald underline">{o.orderNo}</Link> },
    { key: "date", label: "Delivered", sortKey: "deliveredAt", render: (o) => o.deliveredAt?.toLocaleDateString("en-PK") ?? "—" },
    { key: "name", label: "Customer", sortKey: "name", render: (o) => o.name },
    { key: "city", label: "City", sortKey: "city", render: (o) => o.city },
    { key: "items", label: "Units", render: (o) => o.items.reduce((n, i) => n + i.qty, 0) },
    { key: "pm", label: "Payment", sortKey: "paymentMethod", render: (o) => o.paymentMethod },
    { key: "ps", label: "Paid?", render: (o) => <span className={o.paymentStatus === "PAID" ? "text-emerald" : "text-red-700"}>{o.paymentStatus === "PAID" ? "Paid" : o.paymentStatus.replace("_", " ")}</span> },
    { key: "total", label: "Sale total", sortKey: "total", render: (o) => <b>{formatPKR(o.total)}</b> },
  ];
  const card = (label: string, value: string | number, sub?: string) => (
    <div className="bg-white p-5"><p className="text-xs uppercase tracking-widest text-ink/50">{label}</p><p className="mt-1 font-display text-3xl text-emerald">{value}</p>{sub && <p className="mt-1 text-xs text-ink/50">{sub}</p>}</div>
  );
  return (
    <Shell title="Sales">
      <div className="mb-4">
        <FilterPills path="/sales" sp={sp} param="range" options={[{ value: "", label: "All time" }, { value: "today", label: "Today" }, { value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }]} />
      </div>
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {card("Sales revenue", formatPKR(d.revenue), `${d.count} delivered orders`)}
        {card("Units sold", d.units)}
        {card("Average order", formatPKR(d.count ? Math.round(d.revenue / d.count) : 0))}
        {card("Still to deliver", formatPKR(d.pending), `${d.pendingCount} open orders`)}
      </div>
      <div className="mb-8 max-w-xl bg-white p-6">
        <h2 className="mb-3 text-xl">Best sellers</h2>
        <ul className="divide-y divide-ink/10 text-sm">
          {d.top.map((p) => (
            <li key={p.name} className="flex justify-between py-2"><span>{p.name} <span className="text-ink/50">×{p.qty}</span></span><span>{formatPKR(p.revenue)}</span></li>
          ))}
          {d.top.length === 0 && <li className="py-2 text-ink/50">No sales in this period yet.</li>}
        </ul>
      </div>
      <DataTable
        path="/sales" sp={sp} columns={columns} rows={d.rows} total={d.total} {...d.t}
        placeholder="Search order, customer, city…" empty="No completed sales yet. Mark an order as DELIVERED and it appears here."
      />
      <p className="mt-4 max-w-3xl text-xs text-ink/50">An order becomes a sale when you set its status to DELIVERED. Cash-on-delivery orders are marked paid automatically at that point. Cancelled orders never count.</p>
    </Shell>
  );
}
