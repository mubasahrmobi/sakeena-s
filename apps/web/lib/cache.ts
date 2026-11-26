import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma, parseList } from "@sakeena/db";

/**
 * Data that changes rarely is cached so most clicks never wait for the database.
 * Everything tagged "catalog" is refreshed instantly when the admin (or a checkout) changes something,
 * and otherwise refreshes on its own every few minutes.
 */
const TAG = ["catalog"];

export const getCategories = unstable_cache(
  () => prisma.category.findMany({ orderBy: { name: "asc" } }),
  ["categories"], { revalidate: 300, tags: TAG }
);

export const getActiveBrands = unstable_cache(
  () => prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ["brands-active"], { revalidate: 300, tags: TAG }
);

/** Sizes and colours offered across the shop, for the filter drop-downs. */
export const getFacets = unstable_cache(
  async () => {
    const rows = await prisma.product.findMany({ where: { active: true }, select: { sizes: true, colors: true } });
    return {
      sizes: Array.from(new Set(rows.flatMap((r) => parseList(r.sizes)))),
      colors: Array.from(new Set(rows.flatMap((r) => parseList(r.colors).map((c) => c.toLowerCase())))).sort(),
    };
  },
  ["facets"], { revalidate: 300, tags: TAG }
);

type ProductQuery = {
  where: Prisma.ProductWhereInput;
  orderBy: Prisma.ProductOrderByWithRelationInput;
  skip: number;
  take: number;
};

/**
 * A page of products (with their brand) plus the total count. The same filter + sort + page
 * is answered from the cache for a minute, so browsing and re-visiting is instant.
 */
export const queryProducts = unstable_cache(
  async (q: ProductQuery) => {
    const [items, total] = await Promise.all([
      prisma.product.findMany({ ...q, include: { brand: true } }),
      prisma.product.count({ where: q.where }),
    ]);
    return { items, total };
  },
  ["products-query"], { revalidate: 60, tags: TAG }
);

/** Categories a brand actually has products in (for the brand page filter buttons). */
export const getBrandCategories = unstable_cache(
  (brandId: string) => prisma.category.findMany({ where: { products: { some: { brandId, active: true } } } }),
  ["brand-categories"], { revalidate: 300, tags: TAG }
);

/** One product with everything its page needs. React cache() makes the page and its metadata share a single query. */
export const getProduct = cache((slug: string) =>
  prisma.product.findUnique({
    where: { slug },
    include: { category: true, brand: true, sizeStocks: true, reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } } },
  })
);

export const getBrand = unstable_cache(
  (slug: string) => prisma.brand.findUnique({ where: { slug } }),
  ["brand"], { revalidate: 300, tags: TAG }
);
