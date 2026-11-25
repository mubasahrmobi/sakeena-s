import Link from "next/link";
import { prisma, formatPKR, ORDER_STATUSES } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { DataTable, FilterPills, type Column } from "@/components/DataTable";
import { tableParams, type SP } from "@/lib/table";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof load>>["rows"][number];

async function load(sp: SP) {
  const t = tableParams(sp, { sorts: ["orderNo", "name", "city", "total", "paymentMethod", "status", "createdAt"], defaultSort: "createdAt" });
  const where = {
    ...(sp.status ? { status: sp.status } : {}),
    ...(sp.pay === "verify" ? { paymentStatus: "AWAITING_VERIFICATION" } : {}),
    ...(t.q ? { OR: [{ orderNo: { contains: t.q } }, { name: { contains: t.q } }, { phone: { contains: t.q } }, { city: { contains: t.q } }] } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { [t.sort]: t.dir }, skip: t.skip, take: t.take }),
    prisma.order.count({ where }),
  ]);
  return { t, rows, total };
}

export default async function Orders({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { t, rows, total } = await load(sp);
  const columns: Column<Row>[] = [
    { key: "no", label: "Order", sortKey: "orderNo", render: (o) => <Link href={`/orders/${o.id}`} className="text-emerald underline">{o.orderNo}</Link> },
    { key: "name", label: "Customer", sortKey: "name", render: (o) => o.name },
    { key: "city", label: "City", sortKey: "city", render: (o) => o.city },
    { key: "total", label: "Total", sortKey: "total", render: (o) => formatPKR(o.total) },
    { key: "pm", label: "Payment", sortKey: "paymentMethod", render: (o) => o.paymentMethod },
    { key: "ps", label: "Pay status", render: (o) => <span className={o.paymentStatus === "AWAITING_VERIFICATION" ? "font-medium text-gold" : ""}>{o.paymentStatus.replace("_", " ")}</span> },
    { key: "st", label: "Status", sortKey: "status", render: (o) => o.status },
    { key: "date", label: "Date", sortKey: "createdAt", render: (o) => o.createdAt.toLocaleDateString("en-PK") },
  ];
  return (
    <Shell title="Orders">
      <DataTable
        path="/orders" sp={sp} columns={columns} rows={rows} total={total} {...t}
        placeholder="Search order, name, phone, city…" empty="No orders found."
        filters={
          <FilterPills path="/orders" sp={sp} param="status" options={[{ value: "", label: "All" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: s }))]} />
        }
      />
    </Shell>
  );
}
