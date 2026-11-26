import Link from "next/link";
import Image from "next/image";
import { prisma } from "@sakeena/db";
import { ProductCard } from "@/components/ProductCard";
import { BrandTile } from "@/components/BrandTile";
import { BrandMarquee } from "@/components/BrandMarquee";
import { Carousel } from "@/components/Carousel";
import { Tilt } from "@/components/Tilt";
import { HeroImageSlider } from "@/components/HeroImageSlider";
import { HERO_SLIDES, SECTION_IMAGES } from "@/lib/images";

export const revalidate = 60; // served from cache; refreshed at most once a minute (or instantly by the admin)

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923028037807";

const perks = [
  { icon: "✦", title: "Top brands, one store", text: "Your favourite labels, together in one place." },
  { icon: "◈", title: "Pay your way", text: "Cash on delivery, JazzCash, Easypaisa or bank transfer." },
  { icon: "❖", title: "Delivered nationwide", text: "3–5 working days. Flat Rs. 250 delivery." },
  { icon: "❀", title: "Easy exchange", text: "7-day exchange if it isn’t the right fit." },
];

const edit = [
  { img: SECTION_IMAGES.embroidery, title: "Details that speak", text: "Thread-work, mirror-work and finishing you can see and feel.", tall: true },
  { img: SECTION_IMAGES.fabric, title: "Fabrics that feel right", text: "Breathable lawn, soft cotton, rich chiffon." },
  { img: SECTION_IMAGES.sewing, title: "Tailored to flatter", text: "Clean cuts and careful stitching, size by size." },
  { img: SECTION_IMAGES.boutique, title: "Effortless everyday", text: "Easy pieces you’ll reach for again and again.", tall: true },
];

const steps = [
  { n: "01", title: "Choose your pieces", text: "Browse by brand, category or sale. Pick your size and colour." },
  { n: "02", title: "Pay the way you like", text: "Cash on delivery, JazzCash, Easypaisa or bank transfer." },
  { n: "03", title: "We pack & dispatch", text: "Every order is checked and packed by hand, then sent to your city." },
  { n: "04", title: "Track it live", text: "Get a private tracking link and follow your order to your door." },
];

const faqs = [
  { q: "How long does delivery take?", a: "Orders reach most cities across Pakistan in 3–5 working days. Delivery is a flat Rs. 250 on every order, anywhere in Pakistan." },
  { q: "Which payment methods do you accept?", a: "Cash on Delivery, JazzCash, Easypaisa and bank transfer. For wallet and bank payments, send the amount and enter your transaction ID at checkout — we verify it before dispatch." },
  { q: "Can I exchange an item?", a: "Yes. If the size or fit isn’t right, message us within 7 days of delivery and we’ll arrange an exchange." },
  { q: "How do I track my order?", a: "As soon as you order you get a private tracking link. You can also use Track Order in the menu with your order number and mobile number." },
  { q: "Do you stock more than one brand?", a: "Yes — we bring together several labels plus our own Sakeena’s line. Visit the Brands page to explore each one." },
];

export default async function Home() {
  const visible = { active: true, OR: [{ brandId: null }, { brand: { active: true } }] };
  const [latest, featured, sale, categories, brands, banners] = await Promise.all([
    prisma.product.findMany({ where: visible, include: { brand: true }, take: 10, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { ...visible, featured: true }, include: { brand: true }, take: 4, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { ...visible, discountPercent: { gt: 0 } }, include: { brand: true }, take: 10, orderBy: { discountPercent: "desc" } }),
    prisma.category.findMany(),
    prisma.brand.findMany({
      where: { active: true, products: { some: { active: true } } }, orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { active: true } } } } },
    }),
    prisma.banner.findMany({ where: { active: true }, orderBy: { sort: "asc" }, take: 6 }),
  ]);
  const maxDiscount = sale[0]?.discountPercent ?? 0;
  // Banners added in the admin replace the default photos.
  const heroSlides = banners.length
    ? banners.map((b) => ({ src: b.image, caption: b.title, sub: b.subtitle, href: b.href }))
    : HERO_SLIDES;

  return (
    <>
      {/* HERO */}
      <section className="pattern-star relative overflow-hidden bg-emerald text-cream">
        {/* floating 3D shapes behind the hero for depth */}
        <div aria-hidden className="persp pointer-events-none absolute inset-0 overflow-hidden">
          <span className="float-3d absolute -left-12 top-24 h-44 w-44 border border-gold/30" />
          <span className="float-3d-slow absolute bottom-12 left-[38%] h-24 w-24 border border-gold/40 bg-gold/5" />
          <span className="float-3d absolute right-8 top-8 h-28 w-28 border border-cream/20" />
          <span className="float-3d-slow absolute -bottom-10 right-[22%] h-36 w-36 border border-gold/20" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold-light">Sakeena’s · Tranquil Elegance</p>
            <h1 className="text-5xl leading-[1.08] md:text-7xl">
              The finest Pakistani fashion, <em className="text-gold-light">all in one place.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-cream/80">
              Shop top brands and our own label — lawn, formal wear, kurtas and shawls, delivered to your door across Pakistan.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-gold">Shop now</Link>
              <Link href="/brands" className="btn border border-cream/50 text-cream hover:bg-cream hover:text-emerald">Explore brands</Link>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.2em] text-cream/70">
              <li><span className="text-gold-light">✓</span> Cash on delivery</li>
              <li><span className="text-gold-light">✓</span> JazzCash · Easypaisa</li>
              <li><span className="text-gold-light">✓</span> 7-day exchange</li>
            </ul>
          </div>
          <HeroImageSlider slides={heroSlides} />
        </div>
      </section>

      <BrandMarquee brands={brands} />

      {/* PERKS */}
      <section className="border-b border-ink/10 bg-cream-dark">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-2 md:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="coin-host flex items-start gap-4">
              <span className="coin flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold bg-cream text-gold shadow-md">{p.icon}</span>
              <div>
                <p className="font-display text-lg leading-tight">{p.title}</p>
                <p className="mt-1 text-sm text-ink/60">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {brands.length > 0 && (
        <section className="reveal mx-auto max-w-7xl px-5 pt-20">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-gold">Shop by label</p>
            <h2 className="mt-2 text-4xl md:text-5xl">Top Brands</h2>
          </div>
          <Carousel itemClass="w-[46%] md:w-[19%]">
            {brands.map((b) => <BrandTile key={b.id} b={b} />)}
          </Carousel>
          <div className="mt-8 text-center"><Link href="/brands" className="btn-outline">View all brands</Link></div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="reveal mx-auto max-w-7xl px-5 pt-24">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-gold">Just in</p>
              <h2 className="mt-2 text-4xl md:text-5xl">New Arrivals</h2>
            </div>
            <Link href="/shop" className="text-sm uppercase tracking-widest text-emerald underline underline-offset-8">View all</Link>
          </div>
          <Carousel>{latest.map((p) => <ProductCard key={p.id} p={p} />)}</Carousel>
        </section>
      )}

      {/* NEW SECTION 1 — CRAFT */}
      <section className="reveal mx-auto mt-28 grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2">
        <Tilt max={7} scale={1.02} glare={false} className="mx-4 md:mx-0">
          {/* frame sits behind the photo, a gold plate floats in front */}
          <div className="absolute inset-0 border border-gold/60" style={{ transform: "translate3d(-18px,18px,-60px)" }} />
          <div className="relative aspect-[4/5] overflow-hidden shadow-[0_40px_60px_-25px_rgba(0,0,0,0.5)]">
            <Image src={SECTION_IMAGES.embroidery} alt="Close-up of colourful embroidery" fill sizes="(max-width:768px) 90vw, 560px" className="object-cover" />
          </div>
          <div className="absolute -right-3 bottom-8 bg-gold px-5 py-3 text-xs uppercase tracking-[0.3em] text-white shadow-2xl" style={{ transform: "translateZ(80px)" }}>
            Made with care
          </div>
        </Tilt>
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-gold">The Sakeena’s standard</p>
          <h2 className="mt-3 text-4xl leading-tight md:text-5xl">Beautiful on the outside, <em className="text-emerald">careful all the way through.</em></h2>
          <p className="mt-6 leading-relaxed text-ink/70">
            We choose every piece for how it looks, how it feels and how long it lasts. Fabric, stitching and finishing are checked before anything leaves our shelf.
          </p>
          <dl className="mt-8 space-y-6">
            {[
              ["Fabric first", "Soft, breathable fabrics suited to Pakistan’s seasons."],
              ["Detail you can see", "Embroidery, prints and finishing that hold up wash after wash."],
              ["Honest sizing", "Clear size options on every product, with easy exchange if it isn’t right."],
            ].map(([t, d], i) => (
              <div key={t} className="flex gap-5">
                <span className="font-display text-3xl text-gold">0{i + 1}</span>
                <div><dt className="font-display text-xl">{t}</dt><dd className="mt-1 text-sm text-ink/60">{d}</dd></div>
              </div>
            ))}
          </dl>
          <Link href="/about" className="btn-outline mt-10">Our story</Link>
        </div>
      </section>

      {maxDiscount > 0 && (
        <section className="reveal mx-auto mt-28 max-w-7xl px-5">
          <div className="pattern-star relative overflow-hidden bg-emerald px-8 py-14 text-center text-cream shadow-[0_40px_60px_-30px_rgba(15,61,51,0.7)] md:py-20">
            <p className="text-xs uppercase tracking-[0.5em] text-gold-light">Sale is on</p>
            <h2 className="mt-3 text-4xl md:text-6xl">Up to <span className="italic text-gold-light">{maxDiscount}% off</span> top brands</h2>
            <Link href="/shop?sale=1" className="btn-gold mt-8">Shop the sale</Link>
          </div>
        </section>
      )}

      {/* NEW SECTION 2 — THE EDIT (editorial grid) */}
      <section className="reveal mx-auto mt-28 max-w-7xl px-5">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-gold">The Edit</p>
          <h2 className="mt-2 text-4xl md:text-5xl">What we love this season</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {edit.map((e) => (
            <Link key={e.title} href="/shop" className="group block md:[&:nth-child(even)]:mt-10">
              <Tilt max={10} scale={1.04} className={`lift ${e.tall ? "aspect-[3/4] md:aspect-[3/4.4]" : "aspect-[3/4]"}`}>
                <div className="absolute inset-0 overflow-hidden">
                  <Image src={e.img} alt={e.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-cream" style={{ transform: "translateZ(45px)" }}>
                  <p className="font-display text-xl leading-tight drop-shadow md:text-2xl">{e.title}</p>
                  <p className="mt-1 hidden text-xs text-cream/80 md:block">{e.text}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-gold-light">Shop now →</p>
                </div>
              </Tilt>
            </Link>
          ))}
        </div>
      </section>

      <section className="reveal mx-auto max-w-7xl px-5 pt-28">
        <h2 className="text-center text-4xl md:text-5xl">Shop by category</h2>
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
          {categories.map((c, i) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="group block">
              <Tilt max={12} scale={1.05} className={`lift flex aspect-[4/3] items-center justify-center p-4 text-center ${i % 2 ? "bg-cream-dark" : "bg-emerald text-cream"}`}>
                <span className="pattern-star absolute inset-0 overflow-hidden opacity-70 transition duration-700 group-hover:scale-110" />
                <span className="relative font-display text-2xl" style={{ transform: "translateZ(50px)" }}>{c.name}</span>
              </Tilt>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="reveal mx-auto max-w-7xl px-5 pt-28">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-gold">Hand-picked</p>
            <h2 className="mt-2 text-4xl md:text-5xl">Featured</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {sale.length > 0 && (
        <section className="reveal mx-auto max-w-7xl px-5 pt-28">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-4xl md:text-5xl">On Sale</h2>
            <Link href="/shop?sale=1" className="text-sm uppercase tracking-widest text-emerald underline underline-offset-8">All offers</Link>
          </div>
          <Carousel>{sale.map((p) => <ProductCard key={p.id} p={p} />)}</Carousel>
        </section>
      )}

      {/* NEW SECTION 3 — HOW IT WORKS */}
      <section className="reveal pattern-star mt-28 bg-emerald-dark py-24 text-cream">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-14 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-gold-light">Simple &amp; safe</p>
            <h2 className="mt-2 text-4xl md:text-5xl">From our shelf to your door</h2>
          </div>
          <ol className="relative grid gap-10 md:grid-cols-4">
            <span className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-gold/40 md:block" />
            {steps.map((s) => (
              <li key={s.n} className="coin-host relative text-center">
                <span className="coin relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold bg-emerald-dark font-display text-xl text-gold-light shadow-[0_10px_20px_-6px_rgba(0,0,0,0.6)]">{s.n}</span>
                <h3 className="mt-5 text-xl">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm text-cream/70">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap justify-center gap-3 text-xs uppercase tracking-[0.25em]">
            {["Cash on Delivery", "JazzCash", "Easypaisa", "Bank Transfer"].map((m) => (
              <span key={m} className="border border-cream/30 px-4 py-2 text-cream/80">{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* NEW SECTION 4 — FAQ + CONTACT */}
      <section className="reveal mx-auto grid max-w-7xl gap-12 px-5 py-28 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-gold">Good to know</p>
          <h2 className="mt-3 text-4xl leading-tight md:text-5xl">Questions, answered.</h2>
          <p className="mt-5 text-ink/70">Can’t find what you need? Message us on WhatsApp and a real person will help you choose your size, colour or brand.</p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Assalam-o-Alaikum! I have a question about Sakeena’s.")}`}
            target="_blank" rel="noopener noreferrer"
            className="btn mt-8 bg-[#25D366] text-white hover:brightness-95"
          >
            Chat on WhatsApp
          </a>
          <Tilt max={8} scale={1.03} className="lift mt-10 aspect-[16/10]">
            <div className="absolute inset-0 overflow-hidden">
              <Image src={SECTION_IMAGES.boutique} alt="Clothes on a boutique rack" fill sizes="(max-width:768px) 90vw, 420px" className="object-cover" />
            </div>
          </Tilt>
        </div>
        <div className="divide-y divide-ink/15 border-y border-ink/15">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl">
                {f.q}
                <span className="text-2xl text-gold transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-xl text-ink/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pattern-star bg-emerald-dark py-20 text-center text-cream">
        <p className="mx-auto max-w-3xl px-5 font-display text-3xl leading-snug md:text-4xl">
          “Sakeena” means <span className="text-gold-light">inner peace</span>. Shopping should feel the same — easy, trusted and calm.
        </p>
        <Link href="/shop" className="btn-gold mt-8">Start shopping</Link>
      </section>
    </>
  );
}
