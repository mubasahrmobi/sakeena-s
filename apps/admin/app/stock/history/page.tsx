import Link from "next/link";
import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { DataTable, FilterPills, type Column } from "@/components/DataTable";
import { tableParams, type SP } from "@/lib/table";

export const dynamic = "force-dynamic";

async function load(sp: SP) {
  const t = tableParams(sp, { sorts: ["createdAt", "change", "after", "reason"], defaultSort: "createdAt" });
  const where = {
    ...(sp.reason ? { reason: sp.reason } : {}),
    ...(t.q ? { OR: [{ ref: { contains: t.q, mode: "insensitive" as const } }, { product: { name: { contains: t.q, mode: "insensitive" as const } } }] } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.stockMovement.findMany({ where, orderBy: { [t.sort]: t.dir }, include: { product: true }, skip: t.skip, take: t.take }),
    prisma.stockMovement.count({ where }),
  ]);
  return { t, rows, total };
}
type Row = Awaited<ReturnType<typeof load>>["rows"][number];

const LABEL: Record<string, string> = { ORDER: "Order placed", CANCEL: "Order cancelled", RESTORE: "Order re-opened", MANUAL: "Manual edit" };

export default async function History({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { t, rows, total } = await load(sp);
  const columns: Column<Row>[] = [
    { key: "date", label: "When", sortKey: "createdAt", render: (m) => m.createdAt.toLocaleString("en-PK") },
    { key: "p", label: "Product", render: (m) => <Link href={`/products/${m.productId}`} className="text-emerald underline">{m.product.name}</Link> },
    { key: "sz", label: "Size", render: (m) => m.size ?? "—" },
    { key: "r", label: "Reason", sortKey: "reason", render: (m) => LABEL[m.reason] ?? m.reason },
    { key: "ref", label: "Order", render: (m) => m.ref ?? "—" },
    { key: "c", label: "Change", sortKey: "change", render: (m) => <span className={m.change < 0 ? "text-red-700" : "text-emerald"}>{m.change > 0 ? `+${m.change}` : m.change}</span> },
    { key: "a", label: "Stock after", sortKey: "after", render: (m) => m.after },
  ];
  return (
    <Shell title="Stock history" action={<Link href="/stock" className="btn-outline">Back to stock</Link>}>
      <DataTable
        path="/stock/history" sp={sp} columns={columns} rows={rows} total={total} {...t}
        placeholder="Search product or order no…" empty="No stock movements yet."
        filters={<FilterPills path="/stock/history" sp={sp} param="reason" options={[{ value: "", label: "All" }, ...Object.entries(LABEL).map(([value, label]) => ({ value, label }))]} />}
      />
    </Shell>
  );
}
