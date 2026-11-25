export const metadata = { title: "Our Story" };
export default function About() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.5em] text-gold">Our story</p>
      <h1 className="mt-4 text-5xl">Tranquil Elegance</h1>
      <p className="mt-8 leading-loose text-ink/80">
        Sakeena’s was born from a simple belief: clothing should feel as good as it looks. Our designs blend traditional Pakistani craft with a calm, modern eye — soft fabrics, honest prices and careful stitching.
      </p>
      <p className="mt-6 leading-loose text-ink/80">
        Every order is packed by hand and shipped across Pakistan, with easy payment through cash on delivery, JazzCash, Easypaisa or bank transfer.
      </p>
    </div>
  );
}
