// Customer-service WhatsApp number in international format (no + or spaces).
const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923028037807";
const MESSAGE = "Assalam-o-Alaikum! I have a question about Sakeena’s.";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${NUMBER}?text=${encodeURIComponent(MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-[#25D366] p-3.5 text-white shadow-lg transition hover:scale-105 hover:shadow-xl md:px-5"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden>
        <path d="M16.04 3C9.4 3 4 8.38 4 15.01c0 2.12.56 4.19 1.62 6.01L4 29l8.17-1.58a12.03 12.03 0 0 0 3.87.64C22.68 28.06 28 22.68 28 16.05 28 9.4 22.68 3 16.04 3zm0 22.03c-1.2 0-2.38-.32-3.4-.93l-.24-.15-4.85.94.99-4.72-.16-.25a9.97 9.97 0 0 1-1.54-5.3c0-5.5 4.52-9.97 10.2-9.97 5.5 0 9.97 4.47 9.97 9.97s-4.47 10.41-10.97 10.41zm5.47-7.48c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.68-1.64-.93-2.25-.25-.58-.5-.5-.68-.5h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.48.7.3 1.26.48 1.7.62.72.23 1.37.2 1.88.12.58-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.12-.28-.2-.58-.35z" />
      </svg>
      <span className="hidden text-sm font-medium tracking-wide md:inline">Chat with us</span>
    </a>
  );
}
