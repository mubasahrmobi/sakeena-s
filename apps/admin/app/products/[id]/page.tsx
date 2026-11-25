import { notFound } from "next/navigation";
import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { ProductForm } from "@/components/ProductForm";
import { deleteProduct } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany(),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!p) notFound();
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
      <ProductForm p={p} categories={categories} brands={brands} />
    </Shell>
  );
}
