import Link from "next/link";
import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";

export const dynamic = "force-dynamic";

export default async function Banners() {
  const banners = await prisma.banner.findMany({ orderBy: { sort: "asc" } });
  return (
    <Shell title="Homepage banners" action={<Link href="/banners/new" className="btn-primary">Add banner</Link>}>
      <p className="mb-6 max-w-2xl text-sm text-ink/60">
        These photos make up the slider at the top of your homepage. Add up to 6. With no banners, the website shows its default photos.
      </p>
      <div className="grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
        {banners.map((b) => (
          <Link key={b.id} href={`/banners/${b.id}`} className="block bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.image} alt="" className="aspect-[4/5] w-full object-cover" />
            <div className="p-3 text-sm">
              <p className="font-medium">{b.title}</p>
              <p className="text-xs text-ink/50">#{b.sort} · {b.active ? "Live" : "Hidden"}</p>
            </div>
          </Link>
        ))}
        {banners.length === 0 && <p className="text-ink/50">No banners yet.</p>}
      </div>
    </Shell>
  );
}
