import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getActiveBrands, getCategories, getFacets, queryProducts } from "@/lib/cache";

export const metadata = { title: "Shop" };

const PAGE_SIZE = 24;
type SP = { category?: string; sale?: string; sort?: string; q?: string; brand?: string; size?: string; color?: string; min?: string; max?: string; stock?: string; page?: string };

export default async function Shop({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { category, sale, sort, q, brand, size, color, stock } = sp;
  const min = Number(sp.min) > 0 ? Math.floor(Number(sp.min)) : 0;
  const max = Number(sp.max) > 0 ? Math.floor(Number(sp.max)) : 0;
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);

  const orderBy =
    sort === "price-asc" ? { price: "asc" as const }
    : sort === "price-desc" ? { price: "desc" as const }
    : { createdAt: "desc" as const };

  const where = {
    active: true,
    OR: [{ brandId: null }, { brand: { active: true } }],
    ...(category ? { category: { slug: category } } : {}),
    ...(brand ? { brand: { slug: brand } } : {}),
    ...(sale ? { discountPercent: { gt: 0 } } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(color ? { colors: { contains: color, mode: "insensitive" as const } } : {}),
    ...(size ? { sizeStocks: { some: { size, stock: { gt: 0 } } } } : {}),
    ...(stock ? { stock: { gt: 0 } } : {}),
    ...(min || max ? { price: { ...(min ? { gte: min } : {}), ...(max ? { lte: max } : {}) } } : {}),
  };

  // categories, brands and filter options come from the cache; only the product list itself is fetched fresh
  const [{ items: products, total }, categories, brands, facets] = await Promise.all([
    queryProducts({ where, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    getCategories(),
    getActiveBrands(),
    getFacets(),
  ]);
  const sizeOptions = facets.sizes;
  const colorOptions = facets.colors;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtersOn = !!(brand || size || color || min || max || stock || q);

  const href = (o: Partial<SP>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...o })) if (v) p.set(k, v);
    const s = p.toString();
    return `/shop${s ? `?${s}` : ""}`;
  };
  const pill = (active: boolean) =>
    `border px-4 py-2 text-xs uppercase tracking-widest transition ${active ? "border-emerald bg-emerald text-cream" : "border-ink/20 hover:border-emerald"}`;

  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <h1 className="text-center text-5xl">{sale ? "Sale" : "The Collection"}</h1>
      <p className="mt-2 text-center text-sm text-ink/60">{total} {total === 1 ? "piece" : "pieces"}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href={href({ category: undefined, sale: undefined, page: undefined })} className={pill(!category && !sale)}>All</Link>
        <Link href={href({ sale: "1", category: undefined, page: undefined })} className={pill(!!sale)}>Sale</Link>
        {categories.map((c) => (
          <Link key={c.id} href={href({ category: c.slug, sale: undefined, page: undefined })} className={pill(category === c.slug)}>{c.name}</Link>
        ))}
      </div>

      <details className="group mt-6 border border-ink/15 bg-white" open={filtersOn}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-xs uppercase tracking-[0.25em]">
          <span>Filter &amp; sort{filtersOn && <span className="ml-2 text-gold">· active</span>}</span>
          <span className="text-lg text-gold transition group-open:rotate-45">+</span>
        </summary>
        <form className="grid gap-4 border-t border-ink/10 p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {category && <input type="hidden" name="category" value={category} />}
          {sale && <input type="hidden" name="sale" value={sale} />}
          <div><label className="label">Search</label><input name="q" defaultValue={q} placeholder="Name…" className="input" /></div>
          <div>
            <label className="label">Brand</label>
            <select name="brand" defaultValue={brand ?? ""} className="input">
              <option value="">All brands</option>
              {brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Size (in stock)</label>
            <select name="size" defaultValue={size ?? ""} className="input">
              <option value="">Any size</option>
              {sizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Colour</label>
            <select name="color" defaultValue={color ?? ""} className="input">
              <option value="">Any colour</option>
              {colorOptions.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <div><label className="label">Min price</label><input name="min" type="number" min={0} defaultValue={min || ""} placeholder="0" className="input" /></div>
            <div><label className="label">Max price</label><input name="max" type="number" min={0} defaultValue={max || ""} placeholder="Any" className="input" /></div>
          </div>
          <div>
            <label className="label">Sort by</label>
            <select name="sort" defaultValue={sort ?? ""} className="input">
              <option value="">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
          <label className="flex items-end gap-2 pb-3"><input type="checkbox" name="stock" value="1" defaultChecked={!!stock} className="accent-emerald" /> In stock only</label>
          <div className="flex items-end gap-3">
            <button className="btn-primary !px-6">Apply</button>
            {filtersOn && <Link href={href({ q: undefined, brand: undefined, size: undefined, color: undefined, min: undefined, max: undefined, stock: undefined, sort: undefined, page: undefined })} className="text-xs uppercase tracking-widest underline">Clear</Link>}
          </div>
        </form>
      </details>

      {products.length === 0 ? (
        <p className="py-24 text-center text-ink/60">No pieces found. Try changing your filters.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-14 flex items-center justify-center gap-2 text-sm">
          {page > 1 && <Link href={href({ page: String(page - 1) })} className="border border-ink/20 px-4 py-2">‹ Previous</Link>}
          <span className="px-3 text-ink/60">Page {page} of {pages}</span>
          {page < pages && <Link href={href({ page: String(page + 1) })} className="border border-ink/20 px-4 py-2">Next ›</Link>}
        </div>
      )}
    </div>
  );
}
