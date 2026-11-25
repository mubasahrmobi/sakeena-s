import { notFound } from "next/navigation";
import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { ProductForm } from "@/components/ProductForm";
import { deleteProduct } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { sizeStocks: true } }),
    prisma.category.findMany(),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!p) notFound();
  // Older products only have a single stock total: put it on the first size so nothing is lost when saved.
  const sizeStocks: Record<string, number> = Object.fromEntries(p.sizeStocks.map((s) => [s.size, s.stock]));
  if (p.sizeStocks.length === 0 && p.stock > 0) sizeStocks[p.sizes.split(",")[0]?.trim() || "One Size"] = p.stock;
  return (
    <Shell
      title={p.name}
      action={
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={p.id} />
          <button className="text-sm uppercase tracking-widest text-red-700 underline">Delete</button>
        </form>
      }
    >
      <ProductForm p={p} categories={categories} brands={brands} sizeStocks={sizeStocks} />
    </Shell>
  );
}
