'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function CreatePassword() {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [inviteToken, setInviteToken] = useState('');

  useEffect(() => {
    async function prepareInvitation() {
      const supabase = createClient();
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      let token = hash.get('access_token') || '';

      try {
        if (!token) {
          const code = url.searchParams.get('code');
          const tokenHash = url.searchParams.get('token_hash');
          const type = url.searchParams.get('type');

          if (code) {
            const { data, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
            token = data.session?.access_token || '';
          } else if (tokenHash) {
            const { data, error: otpError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: type === 'recovery' ? 'recovery' : 'invite',
            });
            if (otpError) throw otpError;
            token = data.session?.access_token || '';
          } else {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            token = session?.access_token || '';
          }
        }

        if (!token) {
          setError(
            'Davet bağlantısı geçersiz veya süresi dolmuş. İşletme yöneticisinden yeni davet isteyin.'
          );
          return;
        }

        setInviteToken(token);
        setReady(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Davet bağlantısı doğrulanamadı.'
        );
      }
    }

    prepareInvitation();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const form = new FormData(event.currentTarget);
    const password = String(form.get('password'));
    const confirmation = String(form.get('confirm'));

    if (password !== confirmation) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    const response = await fetch('/api/auth/accept-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inviteToken}`,
      },
      body: JSON.stringify({ password }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || 'Şifre oluşturulamadı.');
      return;
    }

    window.history.replaceState(null, '', window.location.pathname);
    await createClient().auth.signOut();
    setDone(true);
  }

  return (
    <main className="verifiedPage">
      <section>
        {done ? (
          <>
            <div className="verifiedIcon">✓</div>
            <h1>Şifren oluşturuldu.</h1>
            <p>Yeni şifrenle çalışan hesabına giriş yapabilirsin.</p>
            <a className="primaryBtn" href="/giris">
              Giriş Yap →
            </a>
          </>
        ) : (
          <form onSubmit={submit}>
            <p className="overline">ÇALIŞAN DAVETİ</p>
            <h1>Şifreni oluştur.</h1>

            {!ready && !error && (
              <p>Güvenli davet bağlantısı doğrulanıyor…</p>
            )}

            {error && <p className="formError">{error}</p>}

            <label className="field">
              Yeni şifre
              <input
                className="input"
                type="password"
                name="password"
                minLength={8}
                disabled={!ready}
                required
              />
            </label>

            <label className="field">
              Şifreyi tekrar yaz
              <input
                className="input"
                type="password"
                name="confirm"
                minLength={8}
                disabled={!ready}
                required
              />
            </label>

            <p className="passwordHint">
              En az 8 karakter; büyük harf, küçük harf ve rakam kullan.
            </p>

            <button className="formButton" disabled={!ready}>
              Şifreyi Kaydet
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
