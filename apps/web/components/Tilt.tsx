"use client";
import { useRef, type ReactNode } from "react";

/**
 * Wraps anything in a 3D card that tilts toward your mouse, with a moving highlight.
 * Children can sit at different depths with style={{ transform: "translateZ(40px)" }}.
 * Only reacts to a real mouse (not touch) and respects "reduce motion".
 */
export function Tilt({
  children, className = "", max = 8, scale = 1.02, glare = true,
}: { children: ReactNode; className?: string; max?: number; scale?: number; glare?: boolean }) {
  const card = useRef<HTMLDivElement>(null);
  const shine = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const allowed = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const move = (e: React.MouseEvent) => {
    if (!allowed() || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!card.current) return;
      card.current.style.transform = `perspective(900px) rotateX(${((0.5 - py) * max * 2).toFixed(2)}deg) rotateY(${((px - 0.5) * max * 2).toFixed(2)}deg) scale3d(${scale},${scale},${scale})`;
      if (shine.current) {
        shine.current.style.opacity = "1";
        shine.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.38), transparent 55%)`;
      }
    });
  };
  const leave = () => {
    cancelAnimationFrame(raf.current);
    if (card.current) card.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    if (shine.current) shine.current.style.opacity = "0";
  };

  return (
    <div
      ref={card}
      onMouseMove={move}
      onMouseLeave={leave}
      className={`relative will-change-transform [transform-style:preserve-3d] transition-transform duration-200 ease-out ${className}`}
    >
      {children}
      {glare && <div ref={shine} aria-hidden className="pointer-events-none absolute inset-0 z-30 opacity-0 transition-opacity duration-300" />}
    </div>
  );
}
