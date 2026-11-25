import { prisma, formatPKR } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { DataTable, type Column } from "@/components/DataTable";
import { tableParams, type SP } from "@/lib/table";

export const dynamic = "force-dynamic";

type Customer = { id: string; name: string; phone: string; city: string; orders: number; spent: number; last: Date };

async function load(sp: SP) {
  const t = tableParams(sp, { sorts: ["name", "city", "orders", "spent", "last"], defaultSort: "spent" });
  // Customers are people grouped by phone number, counted from non-cancelled orders.
  const orders = await prisma.order.findMany({
    where: { status: { not: "CANCELLED" } },
    select: { name: true, phone: true, city: true, total: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  const map = new Map<string, Customer>();
  for (const o of orders) {
    const key = o.phone.replace(/\D/g, "").slice(-10);
    const c = map.get(key);
    if (c) { c.orders += 1; c.spent += o.total; }
    else map.set(key, { id: key, name: o.name, phone: o.phone, city: o.city, orders: 1, spent: o.total, last: o.createdAt });
  }
  let rows = [...map.values()];
  if (t.q) {
    const q = t.q.toLowerCase();
    rows = rows.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.city.toLowerCase().includes(q));
  }
  const dir = t.dir === "asc" ? 1 : -1;
  rows.sort((a, b) => {
    const x = a[t.sort as keyof Customer], y = b[t.sort as keyof Customer];
    return (x > y ? 1 : x < y ? -1 : 0) * dir;
  });
  return { t, total: rows.length, rows: rows.slice(t.skip, t.skip + t.take) };
}

export default async function Customers({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { t, rows, total } = await load(sp);
  const columns: Column<Customer>[] = [
    { key: "n", label: "Customer", sortKey: "name", render: (c) => c.name },
    {
      key: "p", label: "Phone",
      render: (c) => (
        <span>
          <a href={`tel:${c.phone}`} className="text-emerald underline">{c.phone}</a>{" · "}
          <a href={`https://wa.me/92${c.phone.replace(/\D/g, "").replace(/^(92|0)/, "")}`} target="_blank" className="text-emerald underline">WhatsApp</a>
        </span>
      ),
    },
    { key: "c", label: "City", sortKey: "city", render: (c) => c.city },
    { key: "o", label: "Orders", sortKey: "orders", render: (c) => <span>{c.orders}{c.orders > 1 && <span className="ml-2 bg-gold/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold">Repeat</span>}</span> },
    { key: "s", label: "Total spent", sortKey: "spent", render: (c) => <b>{formatPKR(c.spent)}</b> },
    { key: "l", label: "Last order", sortKey: "last", render: (c) => c.last.toLocaleDateString("en-PK") },
  ];
  return (
    <Shell title="Customers">
      <DataTable path="/customers" sp={sp} columns={columns} rows={rows} total={total} {...t} placeholder="Search name, phone, city…" empty="No customers yet." />
    </Shell>
  );
}
