import { createHmac, timingSafeEqual } from 'crypto';
import { normalizePhoneDigits } from '@/lib/phone-auth';

// /yonetim tek bir operatör (sen) için — Supabase hesabına bağlı olmayan, sabit bir
// telefon numarası + şifre çiftiyle açılan basit bir kapı. Çerez değeri şifrenin kendisi
// değil, şifreden türetilmiş tek yönlü bir imza: çerezi görmek şifreyi ele vermez.
export const ADMIN_COOKIE_NAME = 'yonetim_session';

function expectedToken(): string {
  const secret = process.env.ADMIN_PANEL_PASSWORD || '';
  return createHmac('sha256', secret).update('yonetim-admin-gate').digest('hex');
}

export function checkAdminCredentials(phone: string, password: string): boolean {
  const configuredPassword = process.env.ADMIN_PANEL_PASSWORD || '';
  const configuredPhone = process.env.ADMIN_PANEL_PHONE || '';
  if (!configuredPassword || !configuredPhone) return false;
  return normalizePhoneDigits(phone) === normalizePhoneDigits(configuredPhone) && password === configuredPassword;
}

export function adminSessionToken(): string {
  return expectedToken();
}

export function isValidAdminSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = expectedToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
