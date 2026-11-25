import Link from "next/link";
import { prisma, finalPrice, formatPKR } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { DataTable, FilterPills, type Column } from "@/components/DataTable";
import { tableParams, type SP } from "@/lib/table";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof load>>["rows"][number];

async function load(sp: SP) {
  const t = tableParams(sp, { sorts: ["name", "brand", "category", "price", "discountPercent", "stock", "createdAt"], defaultSort: "createdAt" });
  const where = {
    ...(sp.show === "sale" ? { discountPercent: { gt: 0 } } : {}),
    ...(sp.show === "hidden" ? { active: false } : {}),
    ...(sp.brand ? { brandId: sp.brand } : {}),
    ...(t.q ? { OR: [{ name: { contains: t.q, mode: "insensitive" as const } }, { category: { name: { contains: t.q, mode: "insensitive" as const } } }, { brand: { name: { contains: t.q, mode: "insensitive" as const } } }] } : {}),
  };
  const orderBy = t.sort === "category" ? { category: { name: t.dir } } : t.sort === "brand" ? { brand: { name: t.dir } } : { [t.sort]: t.dir };
  const [rows, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, include: { category: true, brand: true }, skip: t.skip, take: t.take }),
    prisma.product.count({ where }),
  ]);
  return { t, rows, total };
}

export default async function Products({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { t, rows, total } = await load(sp);
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", sortKey: "name", render: (p) => <Link href={`/products/${p.id}`} className="text-emerald underline">{p.name}</Link> },
    { key: "brand", label: "Brand", sortKey: "brand", render: (p) => p.brand?.name ?? "—" },
    { key: "cat", label: "Category", sortKey: "category", render: (p) => p.category.name },
    { key: "price", label: "Price", sortKey: "price", render: (p) => formatPKR(p.price) },
    { key: "disc", label: "Discount", sortKey: "discountPercent", render: (p) => (p.discountPercent ? `${p.discountPercent}%` : "—") },
    { key: "sale", label: "Sale price", render: (p) => formatPKR(finalPrice(p.price, p.discountPercent)) },
    { key: "stock", label: "Stock", sortKey: "stock", render: (p) => <span className={p.stock <= 5 ? "text-red-700" : ""}>{p.stock}</span> },
    { key: "status", label: "Status", render: (p) => (p.active ? "Live" : "Hidden") },
  ];
  return (
    <Shell title="Products" action={<Link href="/products/new" className="btn-primary">Add product</Link>}>
      <DataTable
        path="/products" sp={sp} columns={columns} rows={rows} total={total} {...t}
        placeholder="Search name, brand or category…" empty="No products found."
        filters={<FilterPills path="/products" sp={sp} param="show" options={[{ value: "", label: "All" }, { value: "sale", label: "On sale" }, { value: "hidden", label: "Hidden" }]} />}
      />
    </Shell>
  );
}
