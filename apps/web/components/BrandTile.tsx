import Link from "next/link";
import { Tilt } from "./Tilt";

export function BrandTile({ b }: { b: { slug: string; name: string; logo: string; _count: { products: number } } }) {
  return (
    <Link href={`/brand/${b.slug}`} className="group block">
      <Tilt max={10} scale={1.04} className="lift flex flex-col items-center border border-emerald/20 bg-white p-6 text-center">
        <div
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-cream-dark shadow-lg"
          style={{ transform: "translateZ(50px)" }}
        >
          {b.logo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={b.logo} alt={b.name} className="h-full w-full object-contain p-2" />
            : <span className="font-display text-4xl text-emerald">{b.name[0]}</span>}
        </div>
        <h3 className="mt-4 font-display text-xl group-hover:text-emerald" style={{ transform: "translateZ(30px)" }}>{b.name}</h3>
        <p className="mt-1 text-xs uppercase tracking-widest text-ink/50" style={{ transform: "translateZ(18px)" }}>
          {b._count.products} {b._count.products === 1 ? "piece" : "pieces"}
        </p>
      </Tilt>
    </Link>
  );
}
