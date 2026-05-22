export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("212")) return digits;
  if (digits.startsWith("0")) return "212" + digits.slice(1);
  return "212" + digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return "https://wa.me/" + formatPhone(phone) + "?text=" + encodeURIComponent(message);
}
