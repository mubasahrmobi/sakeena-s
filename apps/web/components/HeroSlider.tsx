"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";

export type Slide = {
  kind: "brand" | "brands" | "sale" | "new";
  eyebrow: string;
  title: string;
  text: string;
  ctas: { label: string; href: string; ghost?: boolean }[];
  brands?: string[];
  discount?: number;
};

const BG: Record<Slide["kind"], string> = {
  brand: "bg-emerald",
  brands: "bg-ink",
  sale: "bg-[#4A1626]",
  new: "bg-emerald-dark",
};

function Visual({ s }: { s: Slide }) {
  if (s.kind === "brands") {
    return (
      <div className="space-y-3 text-right md:text-left">
        {(s.brands ?? []).slice(0, 5).map((b) => (
          <p key={b} className="font-display text-3xl tracking-[0.2em] text-cream/90 md:text-5xl">{b.toUpperCase()}</p>
        ))}
        <p className="pt-2 text-xs uppercase tracking-[0.5em] text-gold-light">& many more</p>
      </div>
    );
  }
  if (s.kind === "sale") {
    return (
      <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-full border border-gold/60 md:h-80 md:w-80">
        <div className="absolute inset-3 rounded-full border border-gold/30" />
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-gold-light">Up to</p>
          <p className="font-display text-7xl text-cream md:text-8xl">{s.discount ?? 30}<span className="text-4xl">%</span></p>
          <p className="text-xs uppercase tracking-[0.5em] text-gold-light">Off</p>
        </div>
      </div>
    );
  }
  if (s.kind === "new") {
    return (
      <div className="text-center">
        <p className="font-display text-7xl italic text-gold-light md:text-9xl">Winter</p>
        <p className="font-display text-7xl text-transparent md:text-9xl" style={{ WebkitTextStroke: "1px #FAF6EF" }}>’26</p>
      </div>
    );
  }
  return (
    <div className="relative mx-auto aspect-[4/5] w-64 md:w-80">
      <div className="absolute inset-0 rotate-3 border border-gold/60" />
      <div className="absolute inset-4 flex items-center justify-center bg-emerald-dark text-gold-light">
        <div className="text-center">
          <LogoMark size={120} />
          <p className="mt-5 font-display text-2xl tracking-[0.3em]">SAKEENA’S</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.5em] text-cream/60">Tranquil Elegance</p>
        </div>
      </div>
    </div>
  );
}

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const go = (n: number) => setI((n + slides.length) % slides.length);

  return (
    <section
      className="relative overflow-hidden text-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="grid">
        {slides.map((s, n) => (
          <div
            key={n}
            aria-hidden={n !== i}
            className={`pattern-star col-start-1 row-start-1 transition-opacity duration-1000 ${BG[s.kind]} ${n === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-5 py-20 pb-24 md:grid-cols-2 md:py-24">
              <div>
                <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold-light">{s.eyebrow}</p>
                <h1 className="text-4xl leading-[1.1] md:text-6xl">{s.title}</h1>
                <p className="mt-6 max-w-md text-cream/80">{s.text}</p>
                <div className="mt-9 flex flex-wrap gap-4">
                  {s.ctas.map((c) => (
                    <Link key={c.label} href={c.href} tabIndex={n === i ? 0 : -1}
                      className={c.ghost ? "btn border border-cream/50 text-cream hover:bg-cream hover:text-emerald" : "btn-gold"}>
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden md:block"><Visual s={s} /></div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={() => go(i - 1)} aria-label="Previous slide" className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/40 text-xl hover:bg-cream hover:text-emerald md:flex">‹</button>
          <button onClick={() => go(i + 1)} aria-label="Next slide" className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/40 text-xl hover:bg-cream hover:text-emerald md:flex">›</button>
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
            {slides.map((_, n) => (
              <button key={n} onClick={() => setI(n)} aria-label={`Go to slide ${n + 1}`}
                className={`h-1.5 rounded-full transition-all ${n === i ? "w-10 bg-gold" : "w-4 bg-cream/40 hover:bg-cream/70"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
