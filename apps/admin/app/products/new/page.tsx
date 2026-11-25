import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const [categories, brands] = await Promise.all([prisma.category.findMany(), prisma.brand.findMany({ orderBy: { name: "asc" } })]);
  return (
    <Shell title="New product">
      {categories.length === 0 ? <p>Create a category first.</p> : <ProductForm categories={categories} brands={brands} />}
    </Shell>
  );
}
