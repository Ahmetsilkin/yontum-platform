// İşletme hesapları artık e-posta yerine telefon numarasıyla giriş yapıyor. Supabase Auth
// projesinde SMS sağlayıcı kurmadan (Twilio vb. maliyet/kurulum gerektirir) çalışması için,
// telefon numarasını asla gerçek postaya gitmeyen sabit bir sözde e-postaya çeviriyoruz
// (.invalid uzantısı RFC 2606 ile hiçbir zaman gerçek bir alan adına çözülmeyeceği garanti
// edilen bir uzantıdır). Kullanıcıya hiçbir yerde bu e-posta gösterilmez.
export function normalizePhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('5')) return '90' + digits;
  if (digits.length === 11 && digits.startsWith('0')) return '90' + digits.slice(1);
  if (digits.length === 12 && digits.startsWith('90')) return digits;
  return digits;
}

export function phoneLoginEmail(rawPhone: string): string {
  return `${normalizePhoneDigits(rawPhone)}@phone.megsak.invalid`;
}
