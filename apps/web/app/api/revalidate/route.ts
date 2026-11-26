import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "crypto";

/**
 * The admin calls this after changing products, stock, brands, banners or reviews,
 * so the storefront shows the change straight away instead of waiting for the cache to expire.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const sent = req.headers.get("x-revalidate-secret") ?? "";
  const ok = !!secret && sent.length === secret.length && timingSafeEqual(Buffer.from(sent), Buffer.from(secret));
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  revalidateTag("catalog");
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}
