import { NextRequest, NextResponse } from 'next/server';
import { checkAdminPassword, adminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-gate';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({ password: '' }));
  if (!checkAdminPassword(String(body.password || ''))) {
    return NextResponse.json({ error: 'Şifre yanlış.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, adminSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return res;
}
