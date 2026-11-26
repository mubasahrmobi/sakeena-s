import Image from "next/image";

const tones = [
  ["#DCE8E1", "#0F3D33"], ["#F0E1D2", "#8A5A2B"], ["#E9D8DC", "#6B2D3A"],
  ["#E4E2D3", "#4F5B2E"], ["#DDE3EC", "#27405F"], ["#EFE6C9", "#8A6B1F"],
];
function hash(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

/** Shows the product photo, or an elegant garment illustration until a photo is added. */
export function ProductImage({ src, name, className = "", natural = false }: { src?: string; name: string; className?: string; natural?: boolean }) {
  // Product page: show the whole photo at its own shape, nothing cropped.
  if (src && natural) {
    return (
      <div className={`overflow-hidden bg-cream-dark ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} loading="lazy" className="block h-auto w-full" />
      </div>
    );
  }
  // Grid cards: a fixed shape so rows line up. object-top keeps heads and faces in view.
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-cream-dark ${className}`}>
        <Image src={src} alt={name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover object-top transition duration-700 group-hover:scale-105" />
      </div>
    );
  }
  const [bg, fg] = tones[hash(name) % tones.length];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(160deg, ${bg}, #fff 140%)` }}>
      <svg viewBox="0 0 200 260" className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105" preserveAspectRatio="xMidYMid slice">
        <path d="M70 30l-30 24 14 36 14-8v140h56V82l14 8 14-36-30-24c-4 14-16 22-30 22S74 44 70 30z" fill={fg} opacity="0.9" />
        <path d="M100 52v190" stroke={bg} strokeWidth="1" opacity="0.5" />
        <path d="M78 150h44M74 180h52" stroke="#B8924A" strokeWidth="1.5" opacity="0.8" />
        <circle cx="100" cy="120" r="6" fill="none" stroke="#B8924A" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
