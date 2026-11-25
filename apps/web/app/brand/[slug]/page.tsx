import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@sakeena/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = await prisma.brand.findUnique({ where: { slug } });
  return { title: b?.name ?? "Brand" };
}

export default async function BrandPage({
  params, searchParams,
}: { params: Promise<{ slug: string }>; searchParams: Promise<{ category?: string; sale?: string; sort?: string }> }) {
  const { slug } = await params;
  const { category, sale, sort } = await searchParams;
  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand || !brand.active) notFound();

  const orderBy =
    sort === "price-asc" ? { price: "asc" as const }
    : sort === "price-desc" ? { price: "desc" as const }
    : { createdAt: "desc" as const };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true, brandId: brand.id,
        ...(category ? { category: { slug: category } } : {}),
        ...(sale ? { discountPercent: { gt: 0 } } : {}),
      },
      orderBy, include: { brand: true },
    }),
    // only categories this brand actually has products in
    prisma.category.findMany({ where: { products: { some: { brandId: brand.id, active: true } } } }),
  ]);

  const qs = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ category, sale, sort, ...o })) if (v) p.set(k, v);
    const s = p.toString();
    return `/brand/${brand.slug}${s ? `?${s}` : ""}`;
  };
  const pill = (on: boolean) =>
    `border px-4 py-2 text-xs uppercase tracking-widest transition ${on ? "border-emerald bg-emerald text-cream" : "border-ink/20 hover:border-emerald"}`;

  return (
    <>
      <section className="bg-emerald py-16 text-center text-cream">
        <Link href="/brands" className="text-xs uppercase tracking-[0.4em] text-gold-light hover:underline">← All brands</Link>
        {brand.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logo} alt={brand.name} className="mx-auto mt-6 h-24 w-24 rounded-full bg-cream object-contain p-2" />
        )}
        <h1 className="mt-4 text-5xl">{brand.name}</h1>
        {brand.description && <p className="mx-auto mt-4 max-w-xl px-5 text-cream/80">{brand.description}</p>}
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Link href={qs({ category: undefined, sale: undefined })} className={pill(!category && !sale)}>All</Link>
            <Link href={qs({ sale: "1", category: undefined })} className={pill(!!sale)}>Sale</Link>
            {categories.map((c) => <Link key={c.id} href={qs({ category: c.slug, sale: undefined })} className={pill(category === c.slug)}>{c.name}</Link>)}
          </div>
          <div className="flex gap-2 text-xs uppercase tracking-widest">
            <Link href={qs({ sort: undefined })} className={pill(!sort)}>Newest</Link>
            <Link href={qs({ sort: "price-asc" })} className={pill(sort === "price-asc")}>Price ↑</Link>
            <Link href={qs({ sort: "price-desc" })} className={pill(sort === "price-desc")}>Price ↓</Link>
          </div>
        </div>
        {products.length === 0 ? (
          <p className="py-24 text-center text-ink/60">No pieces from {brand.name} yet.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
