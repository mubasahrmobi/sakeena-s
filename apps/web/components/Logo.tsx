export function LogoMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="26" stroke="#B8924A" strokeWidth="0.75" />
      {/* crescent */}
      <path d="M40 14c-9 1-16 8-16 18s7 17 16 18c-12 3-24-5-24-18S28 11 40 14z" fill="currentColor" opacity="0.12" />
      {/* S monogram */}
      <path
        d="M41 22c-2-3-5-4-9-4-5 0-8 2.6-8 6 0 8 18 5 18 14 0 3.800-3.600 6-9 6-4 0-7.500-1.500-9.500-4.500"
        stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" fill="none"
      />
      {/* star */}
      <path d="M46 18l1.200 2.800 3 .4-2.300 2 .7 3-2.600-1.600L43.400 26l.7-3-2.300-2 3-.4z" fill="#B8924A" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2 sm:gap-3 ${light ? "text-cream" : "text-emerald"}`}>
      <LogoMark className="h-8 w-8 shrink-0 sm:h-11 sm:w-11" />
      <span className="leading-none">
        <span className="block font-display text-lg tracking-[0.16em] sm:text-2xl sm:tracking-[0.28em]">SAKEENA’S</span>
        <span className="mt-1 block text-[7px] uppercase tracking-[0.3em] text-gold sm:text-[9px] sm:tracking-[0.5em]">Tranquil Elegance</span>
      </span>
    </span>
  );
}
