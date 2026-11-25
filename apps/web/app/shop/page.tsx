import Link from "next/link";
import { prisma } from "@sakeena/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sale?: string; sort?: string; q?: string; brand?: string }>;
}) {
  const { category, sale, sort, q, brand } = await searchParams;
  const orderBy =
    sort === "price-asc" ? { price: "asc" as const }
    : sort === "price-desc" ? { price: "desc" as const }
    : { createdAt: "desc" as const };

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        OR: [{ brandId: null }, { brand: { active: true } }],
        ...(category ? { category: { slug: category } } : {}),
        ...(brand ? { brand: { slug: brand } } : {}),
        ...(sale ? { discountPercent: { gt: 0 } } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      },
      orderBy,
      include: { brand: true },
    }),
    prisma.category.findMany(),
    prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const pill = (active: boolean) =>
    `border px-4 py-2 text-xs uppercase tracking-widest transition ${active ? "border-emerald bg-emerald text-cream" : "border-ink/20 hover:border-emerald"}`;

  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <h1 className="text-center text-5xl">{sale ? "Sale" : "The Collection"}</h1>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Link href="/shop" className={pill(!category && !sale)}>All</Link>
          <Link href="/shop?sale=1" className={pill(!!sale)}>Sale</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className={pill(category === c.slug)}>{c.name}</Link>
          ))}
        </div>
        <form className="flex gap-2 text-sm">
          {category && <input type="hidden" name="category" value={category} />}
          <select name="brand" defaultValue={brand ?? ""} className="input !w-44">
            <option value="">All brands</option>
            {brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
          </select>
          {sale && <input type="hidden" name="sale" value={sale} />}
          <input name="q" defaultValue={q} placeholder="Search…" className="input !w-44" />
          <select name="sort" defaultValue={sort} className="input !w-44">
            <option value="">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
          <button className="btn-primary !px-4">Go</button>
        </form>
      </div>
      {products.length === 0 ? (
        <p className="py-24 text-center text-ink/60">No pieces found. Try another filter.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
