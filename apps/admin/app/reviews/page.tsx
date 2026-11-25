import Link from "next/link";
import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { DataTable, FilterPills, type Column } from "@/components/DataTable";
import { tableParams, type SP } from "@/lib/table";
import { setReview } from "@/lib/actions";

export const dynamic = "force-dynamic";

async function load(sp: SP) {
  const t = tableParams(sp, { sorts: ["createdAt", "rating", "name"], defaultSort: "createdAt" });
  const where = {
    ...(sp.f === "pending" ? { approved: false } : sp.f === "approved" ? { approved: true } : {}),
    ...(t.q ? { OR: [{ name: { contains: t.q, mode: "insensitive" as const } }, { comment: { contains: t.q, mode: "insensitive" as const } }, { product: { name: { contains: t.q, mode: "insensitive" as const } } }] } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.review.findMany({ where, orderBy: { [t.sort]: t.dir }, include: { product: true }, skip: t.skip, take: t.take }),
    prisma.review.count({ where }),
  ]);
  return { t, rows, total };
}
type Row = Awaited<ReturnType<typeof load>>["rows"][number];

export default async function Reviews({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { t, rows, total } = await load(sp);
  const btn = (id: string, doIt: string, label: string, cls: string) => (
    <form action={setReview} className="inline">
      <input type="hidden" name="id" value={id} /><input type="hidden" name="do" value={doIt} />
      <button className={`text-xs uppercase tracking-widest ${cls}`}>{label}</button>
    </form>
  );
  const columns: Column<Row>[] = [
    { key: "d", label: "Date", sortKey: "createdAt", render: (r) => r.createdAt.toLocaleDateString("en-PK") },
    { key: "p", label: "Product", render: (r) => <Link href={`/products/${r.productId}`} className="text-emerald underline">{r.product.name}</Link> },
    { key: "n", label: "Customer", sortKey: "name", render: (r) => r.name },
    { key: "r", label: "Rating", sortKey: "rating", render: (r) => <span className="text-gold">{"★".repeat(r.rating)}<span className="text-ink/20">{"★".repeat(5 - r.rating)}</span></span> },
    { key: "c", label: "Review", render: (r) => <span className="block max-w-sm">{r.comment}</span> },
    { key: "s", label: "Status", render: (r) => (r.approved ? "Live" : <b className="text-gold">Pending</b>) },
    {
      key: "a", label: "",
      render: (r) => (
        <div className="flex gap-3">
          {r.approved ? btn(r.id, "hide", "Hide", "text-ink/60") : btn(r.id, "approve", "Approve", "text-emerald")}
          {btn(r.id, "delete", "Delete", "text-red-700")}
        </div>
      ),
    },
  ];
  return (
    <Shell title="Reviews">
      <DataTable
        path="/reviews" sp={sp} columns={columns} rows={rows} total={total} {...t} placeholder="Search reviews…" empty="No reviews yet."
        filters={<FilterPills path="/reviews" sp={sp} param="f" options={[{ value: "", label: "All" }, { value: "pending", label: "Pending" }, { value: "approved", label: "Live" }]} />}
      />
      <p className="mt-4 text-xs text-ink/50">New reviews stay hidden until you approve them.</p>
    </Shell>
  );
}
