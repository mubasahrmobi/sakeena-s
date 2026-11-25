import Link from "next/link";

/** Slowly scrolling strip of the brands we stock. */
export function BrandMarquee({ brands }: { brands: { name: string; slug: string }[] }) {
  if (brands.length === 0) return null;
  // repeat the list so the strip is always wider than the screen, then double it for a seamless loop
  const reps = Math.max(1, Math.ceil(10 / brands.length));
  const row = Array.from({ length: reps }, () => brands).flat();
  const items = [...row, ...row];
  return (
    <div className="pause-on-hover overflow-hidden bg-ink py-5 text-cream">
      <div className="animate-marquee flex w-max items-center">
        {items.map((b, i) => (
          <Link key={i} href={`/brand/${b.slug}`} className="flex items-center whitespace-nowrap font-display text-2xl tracking-[0.25em] text-cream/90 transition hover:text-gold-light md:text-3xl">
            <span className="px-8">{b.name.toUpperCase()}</span>
            <span className="text-gold">✦</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
