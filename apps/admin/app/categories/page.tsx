import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { addCategory, deleteCategory } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Categories() {
  const cats = await prisma.category.findMany({ include: { _count: { select: { products: true } } } });
  return (
    <Shell title="Categories">
      <form action={addCategory} className="mb-8 flex max-w-md gap-3">
        <input name="name" required placeholder="New category name" className="input" />
        <button className="btn-primary">Add</button>
      </form>
      <ul className="max-w-md divide-y divide-ink/10 bg-white">
        {cats.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-4 text-sm">
            <span>{c.name} <span className="text-ink/40">({c._count.products})</span></span>
            {c._count.products === 0 && (
              <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><button className="text-xs uppercase tracking-widest text-red-700">Delete</button></form>
            )}
          </li>
        ))}
      </ul>
    </Shell>
  );
}
