/**
 * Payment account details shown to customers for manual wallet / bank payments.
 * Set these in apps/web/.env (see .env.example). Orders paid this way are marked
 * AWAITING_VERIFICATION until an admin confirms the money arrived.
 */
export function paymentInstructions(method: string) {
  switch (method) {
    case "JAZZCASH":
      return {
        title: "Pay with JazzCash",
        lines: [
          `Account title: ${process.env.JAZZCASH_TITLE ?? "Sakeena's"}`,
          `JazzCash number: ${process.env.JAZZCASH_NUMBER ?? "03XX-XXXXXXX"}`,
        ],
      };
    case "EASYPAISA":
      return {
        title: "Pay with Easypaisa",
        lines: [
          `Account title: ${process.env.EASYPAISA_TITLE ?? "Sakeena's"}`,
          `Easypaisa number: ${process.env.EASYPAISA_NUMBER ?? "03XX-XXXXXXX"}`,
        ],
      };
    case "BANK":
      return {
        title: "Pay by bank transfer",
        lines: [
          `Bank: ${process.env.BANK_NAME ?? "Your Bank"}`,
          `Account title: ${process.env.BANK_TITLE ?? "Sakeena's"}`,
          `IBAN: ${process.env.BANK_IBAN ?? "PK00XXXX0000000000000000"}`,
        ],
      };
    default:
      return null;
  }
}
