import Link from "next/link";
import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { DataTable, type Column } from "@/components/DataTable";
import { tableParams, type SP } from "@/lib/table";

export const dynamic = "force-dynamic";

async function load(sp: SP) {
  const t = tableParams(sp, { sorts: ["name", "active"], defaultSort: "name", defaultDir: "asc" });
  const where = t.q ? { name: { contains: t.q, mode: "insensitive" as const } } : {};
  const [rows, total] = await Promise.all([
    prisma.brand.findMany({ where, orderBy: { [t.sort]: t.dir }, include: { _count: { select: { products: true } } }, skip: t.skip, take: t.take }),
    prisma.brand.count({ where }),
  ]);
  return { t, rows, total };
}
type Row = Awaited<ReturnType<typeof load>>["rows"][number];

export default async function Brands({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { t, rows, total } = await load(sp);
  const columns: Column<Row>[] = [
    {
      key: "name", label: "Brand", sortKey: "name",
      render: (b) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {b.logo ? <img src={b.logo} alt="" className="h-10 w-10 object-contain" /> : <span className="flex h-10 w-10 items-center justify-center bg-emerald font-display text-cream">{b.name[0]}</span>}
          <Link href={`/brands/${b.id}`} className="text-emerald underline">{b.name}</Link>
        </div>
      ),
    },
    { key: "n", label: "Products", render: (b) => b._count.products },
    { key: "a", label: "Status", sortKey: "active", render: (b) => (b.active ? "Live" : "Hidden") },
  ];
  return (
    <Shell title="Brands" action={<Link href="/brands/new" className="btn-primary">Add brand</Link>}>
      <DataTable path="/brands" sp={sp} columns={columns} rows={rows} total={total} {...t} placeholder="Search brands…" empty="No brands yet." />
    </Shell>
  );
}
