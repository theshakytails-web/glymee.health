const WHATSAPP_NUMBER = "918452823804";
const WHATSAPP_MESSAGE =
  "Hi Glymee, I would like to know more about the 3-month personalized diabetes-management program.";

export function whatsappLink(
  message: string = WHATSAPP_MESSAGE
): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function useWhatsApp() {
  return {
    href: whatsappLink(),
    number: WHATSAPP_NUMBER,
  };
}
