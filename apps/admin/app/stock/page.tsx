import Link from "next/link";
import { prisma, parseLines } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { updateStock } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Stock({ searchParams }: { searchParams: Promise<{ saved?: string; low?: string }> }) {
  const { saved, low } = await searchParams;
  const all = await prisma.product.findMany({ include: { category: true }, orderBy: { stock: "asc" } });
  const products = low ? all.filter((p) => p.stock <= 5) : all;
  const out = all.filter((p) => p.stock === 0).length;
  const lowCount = all.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const units = all.reduce((n, p) => n + p.stock, 0);

  return (
    <Shell
      title="Stock"
      action={<Link href={low ? "/stock" : "/stock?low=1"} className="btn-outline">{low ? "Show all" : "Low stock only"}</Link>}
    >
      <div className="mb-6 grid max-w-2xl gap-4 md:grid-cols-3">
        <div className="bg-white p-5"><p className="text-xs uppercase tracking-widest text-ink/50">Units in stock</p><p className="mt-1 font-display text-3xl text-emerald">{units}</p></div>
        <div className="bg-white p-5"><p className="text-xs uppercase tracking-widest text-ink/50">Low (5 or less)</p><p className="mt-1 font-display text-3xl text-gold">{lowCount}</p></div>
        <div className="bg-white p-5"><p className="text-xs uppercase tracking-widest text-ink/50">Out of stock</p><p className="mt-1 font-display text-3xl text-red-700">{out}</p></div>
      </div>
      {saved && <p className="mb-4 max-w-2xl bg-emerald/10 p-3 text-sm text-emerald">Stock updated.</p>}
      <form action={updateStock} className="max-w-3xl">
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-widest text-ink/50">
              <tr><th className="p-4">Product</th><th>Category</th><th className="w-32">Stock</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {parseLines(p.images)[0] && <img src={parseLines(p.images)[0]} alt="" className="h-12 w-9 object-cover" />}
                      <Link href={`/products/${p.id}`} className="text-emerald underline">{p.name}</Link>
                    </div>
                  </td>
                  <td>{p.category.name}</td>
                  <td><input type="number" min={0} name={`stock_${p.id}`} defaultValue={p.stock} className="input !w-24 !py-2" /></td>
                  <td className={p.stock === 0 ? "text-red-700" : p.stock <= 5 ? "text-gold" : "text-emerald"}>
                    {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? "Low" : "In stock"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="p-6 text-ink/50">Nothing here.</p>}
        </div>
        {products.length > 0 && <button className="btn-primary mt-5">Save stock</button>}
        <p className="mt-3 text-xs text-ink/50">Stock goes down automatically when a customer orders, and comes back if you cancel the order.</p>
      </form>
    </Shell>
  );
}
