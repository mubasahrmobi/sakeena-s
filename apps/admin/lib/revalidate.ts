/**
 * Tells the storefront to drop its cached pages so a change made here shows up straight away.
 * Needs WEB_URL and REVALIDATE_SECRET (same value on the storefront). If either is missing,
 * the storefront simply refreshes on its own within a minute or so.
 */
export async function refreshStorefront() {
  const url = process.env.WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(`${url.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* the storefront will catch up on its own */
  }
}
