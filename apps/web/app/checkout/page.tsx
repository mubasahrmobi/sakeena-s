import { CheckoutForm } from "@/components/CheckoutForm";
import { paymentInstructions } from "@/lib/payments";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default function Checkout() {
  const instructions = {
    JAZZCASH: paymentInstructions("JAZZCASH"),
    EASYPAISA: paymentInstructions("EASYPAISA"),
    BANK: paymentInstructions("BANK"),
  };
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="mb-10 text-4xl">Checkout</h1>
      <CheckoutForm instructions={instructions} />
    </div>
  );
}
