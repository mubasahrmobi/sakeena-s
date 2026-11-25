import { notFound } from "next/navigation";
import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { BrandForm } from "@/components/BrandForm";
import { deleteBrand } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditBrand({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await prisma.brand.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!b) notFound();
  return (
    <Shell
      title={b.name}
      action={
        <form action={deleteBrand}>
          <input type="hidden" name="id" value={b.id} />
          <button className="text-sm uppercase tracking-widest text-red-700 underline">{b._count.products > 0 ? "Hide" : "Delete"}</button>
        </form>
      }
    >
      <BrandForm b={b} />
    </Shell>
  );
}
