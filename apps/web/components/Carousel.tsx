"use client";
import { Children, useRef, type ReactNode } from "react";

/** Horizontal slider with snap scrolling, arrow buttons and touch swipe. */
export function Carousel({ children, itemClass = "w-[46%] md:w-[23.5%]" }: { children: ReactNode; itemClass?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  const arrow = "absolute top-1/3 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-white/95 text-emerald shadow-lg transition hover:bg-emerald hover:text-cream md:flex";
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2">
        {Children.map(children, (c) => <div className={`shrink-0 snap-start ${itemClass}`}>{c}</div>)}
      </div>
      <button onClick={() => go(-1)} aria-label="Previous" className={`${arrow} -left-5`}>‹</button>
      <button onClick={() => go(1)} aria-label="Next" className={`${arrow} -right-5`}>›</button>
    </div>
  );
}
