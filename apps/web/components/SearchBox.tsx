"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatPKR } from "@sakeena/db/utils";

type Hit = { slug: string; name: string; brand: string | null; price: number; image: string | null };

export function SearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const t = setTimeout(async () => {
      try { setHits(await (await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)).json()); } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const go = () => { if (q.trim()) { setOpen(false); router.push(`/shop?q=${encodeURIComponent(q.trim())}`); } };

  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen(!open)} aria-label="Search" className="text-sm uppercase tracking-widest hover:text-gold">
        <span className="hidden sm:inline">Search</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current sm:hidden" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-[min(92vw,380px)] border border-ink/10 bg-white p-3 shadow-xl">
          <form onSubmit={(e) => { e.preventDefault(); go(); }}>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products or brands…" className="input" />
          </form>
          {hits.length > 0 && (
            <ul className="mt-2 divide-y divide-ink/10">
              {hits.map((h) => (
                <li key={h.slug}>
                  <Link href={`/product/${h.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 py-2 hover:bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {h.image ? <img src={h.image} alt="" className="h-14 w-11 object-cover" /> : <span className="h-14 w-11 bg-cream-dark" />}
                    <span className="text-sm">
                      {h.brand && <span className="block text-[10px] uppercase tracking-widest text-gold">{h.brand}</span>}
                      {h.name}
                      <span className="block text-emerald">{formatPKR(h.price)}</span>
                    </span>
                  </Link>
                </li>
              ))}
              <li className="pt-2 text-center"><button onClick={go} className="text-xs uppercase tracking-widest text-emerald underline">See all results</button></li>
            </ul>
          )}
          {q.trim().length >= 2 && hits.length === 0 && <p className="mt-3 px-1 text-sm text-ink/50">No matches yet — press Enter to search the shop.</p>}
        </div>
      )}
    </div>
  );
}
