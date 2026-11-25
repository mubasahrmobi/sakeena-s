"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

type S = { src: string; caption: string; sub: string };

/** Four-photo crossfade slider shown on the right of the hero. */
export function HeroImageSlider({ slides }: { slides: S[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <div
      className="relative mx-auto w-full max-w-[420px] md:max-w-[460px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* gold offset frame */}
      <div className="absolute -inset-3 translate-x-3 translate-y-3 rounded-t-[220px] border border-gold/60" />

      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[220px] bg-emerald-dark shadow-2xl">
        {slides.map((s, n) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.caption}
            fill
            priority={n === 0}
            sizes="(max-width: 768px) 90vw, 460px"
            className={`object-cover transition-all duration-[1400ms] ${n === i ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-light">{slides[i].sub}</p>
          <p className="mt-1 font-display text-3xl">{slides[i].caption}</p>
          <div className="mt-4 flex gap-2">
            {slides.map((_, n) => (
              <button
                key={n}
                onClick={() => setI(n)}
                aria-label={`Show photo ${n + 1}`}
                className={`h-1 rounded-full transition-all ${n === i ? "w-10 bg-gold" : "w-5 bg-cream/50 hover:bg-cream"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -left-4 top-16 hidden rounded-sm bg-cream px-4 py-3 text-ink shadow-xl md:block">
        <p className="font-display text-lg leading-none text-emerald">Free delivery</p>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-ink/60">Orders over Rs. 5,000</p>
      </div>
    </div>
  );
}
