import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const categories = await prisma.category.findMany();
  return (
    <Shell title="New product">
      {categories.length === 0 ? <p>Create a category first.</p> : <ProductForm categories={categories} />}
    </Shell>
  );
}
