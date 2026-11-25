import Link from "next/link";
import { notFound } from "next/navigation";

type Policy = { title: string; intro: string; sections: { h: string; p: string[] }[] };

// Plain-language policies that match how the store actually works. Edit freely to suit your business.
const POLICIES: Record<string, Policy> = {
  delivery: {
    title: "Delivery",
    intro: "We deliver across Pakistan.",
    sections: [
      { h: "How long it takes", p: ["Most orders reach you in 3–5 working days after dispatch. Remote areas can take a little longer."] },
      { h: "Delivery charges", p: ["Delivery is free on orders over Rs. 5,000. Below that, a flat charge of Rs. 250 applies."] },
      { h: "Tracking", p: ["As soon as you order you receive a private tracking link, and you can always use Track Order in the menu with your order number and mobile number. We add the courier name and tracking number once your parcel ships."] },
      { h: "Before dispatch", p: ["We may call or message you on WhatsApp to confirm your address, especially for Cash on Delivery orders. Please keep your phone reachable."] },
    ],
  },
  returns: {
    title: "Exchange & Returns",
    intro: "If something isn’t right, we’ll make it right.",
    sections: [
      { h: "7-day exchange", p: ["If the size or fit isn’t right, message us within 7 days of receiving your order and we’ll arrange an exchange, subject to stock."] },
      { h: "Condition", p: ["Items must be unworn, unwashed and in their original condition and packing, with tags attached."] },
      { h: "Damaged or wrong item", p: ["If you receive a damaged or incorrect item, contact us on WhatsApp within 48 hours with photos and we’ll fix it."] },
      { h: "How to start", p: ["Message us on WhatsApp with your order number. We’ll guide you through the next step."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "How we handle your information.",
    sections: [
      { h: "What we collect", p: ["When you order, we collect your name, phone number, delivery address, city and (optionally) email, plus payment reference details for wallet or bank payments. If you write a review, we store your name and review."] },
      { h: "How we use it", p: ["Only to process and deliver your order, contact you about it, and provide support. We don’t sell your personal information."] },
      { h: "Who sees it", p: ["Our team and the courier delivering your parcel see your delivery details. Our website and database providers process data on our behalf to run the store."] },
      { h: "Cookies & analytics", p: ["We use your browser’s storage to remember your bag and wishlist. If analytics tools are enabled, they collect anonymous usage information to help us improve the store."] },
      { h: "Your choices", p: ["You can ask us to correct or delete your details by messaging us on WhatsApp."] },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro: "The basics of shopping with us.",
    sections: [
      { h: "Orders", p: ["Placing an order is an offer to buy. We confirm it by phone, WhatsApp or by dispatching it. We may cancel an order if an item is unavailable or details can’t be verified, and refund any payment you’ve made."] },
      { h: "Prices", p: ["All prices are in Pakistani Rupees (PKR). Prices and stock can change without notice; the price at checkout is the price you pay."] },
      { h: "Payments", p: ["We accept Cash on Delivery, JazzCash, Easypaisa and bank transfer. Orders paid by wallet or bank are dispatched after we verify the payment."] },
      { h: "Colours & sizing", p: ["Screens show colours differently, so small variations can occur. Please check the size guide before ordering."] },
      { h: "Contact", p: ["Questions? Message us on WhatsApp."] },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: POLICIES[slug]?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-5xl">{policy.title}</h1>
      <p className="mt-3 text-ink/60">{policy.intro}</p>
      <div className="mt-10 space-y-8">
        {policy.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-2xl">{s.h}</h2>
            {s.p.map((t) => <p key={t} className="mt-2 leading-relaxed text-ink/75">{t}</p>)}
          </section>
        ))}
      </div>
      <nav className="mt-14 flex flex-wrap gap-4 border-t border-ink/10 pt-6 text-xs uppercase tracking-widest">
        {Object.entries(POLICIES).filter(([k]) => k !== slug).map(([k, v]) => <Link key={k} href={`/policies/${k}`} className="underline underline-offset-4 hover:text-gold">{v.title}</Link>)}
      </nav>
    </div>
  );
}
