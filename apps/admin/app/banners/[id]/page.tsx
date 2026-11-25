import { notFound } from "next/navigation";
import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { BannerForm } from "@/components/BannerForm";
import { deleteBanner } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditBanner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await prisma.banner.findUnique({ where: { id } });
  if (!b) notFound();
  return (
    <Shell
      title={b.title}
      action={
        <form action={deleteBanner}>
          <input type="hidden" name="id" value={b.id} />
          <button className="text-sm uppercase tracking-widest text-red-700 underline">Delete</button>
        </form>
      }
    >
      <BannerForm b={b} />
    </Shell>
  );
}
