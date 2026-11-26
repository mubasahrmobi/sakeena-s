import { prisma } from "@sakeena/db";
import { BrandTile } from "@/components/BrandTile";

export const revalidate = 60; // served from cache; refreshed at most once a minute (or instantly by the admin)
export const metadata = { title: "All Brands" };

export default async function Brands() {
  const brands = await prisma.brand.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <p className="text-center text-xs uppercase tracking-[0.5em] text-gold">Shop by label</p>
      <h1 className="mt-3 text-center text-5xl">Our Brands</h1>
      {brands.length === 0 ? (
        <p className="py-24 text-center text-ink/60">Brands are coming soon.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
          {brands.map((b) => <BrandTile key={b.id} b={b} />)}
        </div>
      )}
    </div>
  );
}
