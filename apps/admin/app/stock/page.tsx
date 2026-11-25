import Link from "next/link";
import { prisma, parseLines } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { DataTable, FilterPills, type Column } from "@/components/DataTable";
import { tableParams, type SP } from "@/lib/table";
import { setStock } from "@/lib/actions";

export const dynamic = "force-dynamic";

const OPEN = ["PENDING", "CONFIRMED", "SHIPPED"]; // orders that are placed but not yet delivered

async function load(sp: SP) {
  const t = tableParams(sp, { sorts: ["name", "category", "stock"], defaultSort: "stock", defaultDir: "asc" });
  const where = {
    ...(sp.f === "low" ? { stock: { gt: 0, lte: 5 } } : {}),
    ...(sp.f === "out" ? { stock: 0 } : {}),
    ...(t.q ? { OR: [{ name: { contains: t.q } }, { category: { name: { contains: t.q } } }] } : {}),
  };
  const orderBy = t.sort === "category" ? { category: { name: t.dir } } : { [t.sort]: t.dir };
  const [products, total, all] = await Promise.all([
    prisma.product.findMany({ where, orderBy, include: { category: true }, skip: t.skip, take: t.take }),
    prisma.product.count({ where }),
    prisma.product.findMany({ select: { stock: true } }),
  ]);
  const ids = products.map((p) => p.id);
  const [soldRows, openRows] = await Promise.all([
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { qty: true }, where: { productId: { in: ids }, order: { status: "DELIVERED" } } }),
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { qty: true }, where: { productId: { in: ids }, order: { status: { in: OPEN } } } }),
  ]);
  const sold = new Map(soldRows.map((r) => [r.productId, r._sum.qty ?? 0]));
  const open = new Map(openRows.map((r) => [r.productId, r._sum.qty ?? 0]));
  const rows = products.map((p) => ({ ...p, sold: sold.get(p.id) ?? 0, open: open.get(p.id) ?? 0 }));
  return {
    t, rows, total,
    units: all.reduce((n, p) => n + p.stock, 0),
    low: all.filter((p) => p.stock > 0 && p.stock <= 5).length,
    out: all.filter((p) => p.stock === 0).length,
  };
}
type Row = Awaited<ReturnType<typeof load>>["rows"][number];

export default async function Stock({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { t, rows, total, units, low, out } = await load(sp);

  const columns: Column<Row>[] = [
    {
      key: "name", label: "Product", sortKey: "name",
      render: (p) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {parseLines(p.images)[0] && <img src={parseLines(p.images)[0]} alt="" className="h-12 w-9 object-cover" />}
          <Link href={`/products/${p.id}`} className="text-emerald underline">{p.name}</Link>
        </div>
      ),
    },
    { key: "cat", label: "Category", sortKey: "category", render: (p) => p.category.name },
    {
      key: "stock", label: "In stock", sortKey: "stock",
      render: (p) => (
        <form action={setStock} className="flex items-center gap-2">
          <input type="hidden" name="id" value={p.id} />
          <input type="number" min={0} name="stock" defaultValue={p.stock} className="input !w-20 !py-1.5" />
          <button className="text-xs uppercase tracking-widest text-emerald underline">Save</button>
        </form>
      ),
    },
    { key: "open", label: "In open orders", render: (p) => p.open },
    { key: "sold", label: "Sold (delivered)", render: (p) => p.sold },
    {
      key: "status", label: "Status",
      render: (p) => <span className={p.stock === 0 ? "text-red-700" : p.stock <= 5 ? "text-gold" : "text-emerald"}>{p.stock === 0 ? "Out of stock" : p.stock <= 5 ? "Low" : "In stock"}</span>,
    },
  ];

  const card = (label: string, value: number, cls: string) => (
    <div className="bg-white p-5"><p className="text-xs uppercase tracking-widest text-ink/50">{label}</p><p className={`mt-1 font-display text-3xl ${cls}`}>{value}</p></div>
  );

  return (
    <Shell title="Stock" action={<Link href="/stock/history" className="btn-outline">Stock history</Link>}>
      <div className="mb-6 grid max-w-2xl gap-4 md:grid-cols-3">
        {card("Units in stock", units, "text-emerald")}
        {card("Low (5 or less)", low, "text-gold")}
        {card("Out of stock", out, "text-red-700")}
      </div>
      <DataTable
        path="/stock" sp={sp} columns={columns} rows={rows} total={total} {...t}
        placeholder="Search product or category…" empty="No products match."
        filters={<FilterPills path="/stock" sp={sp} param="f" options={[{ value: "", label: "All" }, { value: "low", label: "Low" }, { value: "out", label: "Out" }]} />}
      />
      <p className="mt-4 max-w-3xl text-xs text-ink/50">
        Stock is taken off the moment a customer places an order, and returned if you cancel it. “In open orders” are units reserved in orders not yet delivered; “Sold” counts only delivered orders. Every change is logged in Stock history.
      </p>
    </Shell>
  );
}
