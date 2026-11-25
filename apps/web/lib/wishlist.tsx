"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = { slugs: string[]; has: (s: string) => boolean; toggle: (s: string) => void };
const WishCtx = createContext<Ctx | null>(null);

/** Saved products. Kept in the browser, and mirrored in a cookie so the /wishlist page can be rendered on the server. */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setSlugs(JSON.parse(localStorage.getItem("sakeena-wish") || "[]")); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem("sakeena-wish", JSON.stringify(slugs)); } catch {}
    document.cookie = `sk_wish=${encodeURIComponent(slugs.join(","))}; path=/; max-age=31536000; samesite=lax`;
  }, [slugs, ready]);

  const has = (s: string) => slugs.includes(s);
  const toggle = (s: string) => setSlugs((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  return <WishCtx.Provider value={{ slugs, has, toggle }}>{children}</WishCtx.Provider>;
}
export const useWishlist = () => {
  const c = useContext(WishCtx);
  if (!c) throw new Error("WishlistProvider missing");
  return c;
};
