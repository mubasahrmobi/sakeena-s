import Link from "next/link";
import { prisma, finalPrice, formatPKR } from "@sakeena/db";
import { Shell } from "@/components/Shell";

export const dynamic = "force-dynamic";

export default async function Products() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  return (
    <Shell title="Products" action={<Link href="/products/new" className="btn-primary">Add product</Link>}>
      <div className="overflow-x-auto bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-widest text-ink/50">
            <tr><th className="p-4">Name</th><th>Category</th><th>Price</th><th>Discount</th><th>Sale price</th><th>Stock</th><th>Status</th></tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-4"><Link href={`/products/${p.id}`} className="text-emerald underline">{p.name}</Link></td>
                <td>{p.category.name}</td><td>{formatPKR(p.price)}</td>
                <td>{p.discountPercent ? `${p.discountPercent}%` : "—"}</td>
                <td>{formatPKR(finalPrice(p.price, p.discountPercent))}</td>
                <td className={p.stock <= 5 ? "text-red-700" : ""}>{p.stock}</td>
                <td>{p.active ? "Live" : "Hidden"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-ink/50">No products yet.</p>}
      </div>
    </Shell>
  );
}
