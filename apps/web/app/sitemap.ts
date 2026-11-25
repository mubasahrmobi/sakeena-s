import type { MetadataRoute } from "next";
import { prisma } from "@sakeena/db";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, select: { slug: true, createdAt: true } }),
    prisma.brand.findMany({ where: { active: true }, select: { slug: true } }),
  ]);
  const fixed = ["", "/shop", "/brands", "/about", "/track", "/policies/delivery", "/policies/returns", "/policies/privacy", "/policies/terms"];
  return [
    ...fixed.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...brands.map((b) => ({ url: `${SITE_URL}/brand/${b.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${SITE_URL}/product/${p.slug}`, lastModified: p.createdAt, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
