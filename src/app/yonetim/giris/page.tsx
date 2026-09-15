'use client';
import { useEffect, useState } from 'react';
import '@/app/admin-modern.css';
import { createClient } from '@/lib/supabase-browser';

export default function AdminBusinessLogin() {
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenHash = new URLSearchParams(window.location.search).get('token_hash');
    if (!tokenHash) { setError('Bağlantı geçersiz.'); return }
    createClient().auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' }).then(({ error }) => {
      if (error) { setError('Giriş bağlantısının süresi dolmuş. Yönetim panelinden tekrar dene.'); return }
      location.href = '/panel';
    });
  }, []);

  return (
    <main className="authPage">
      <section className="authMain">
        <div className="authCard">
          <div className="platformLogo"><span>M</span><b>MEGSAK</b></div>
          <h2>{error ? 'Giriş yapılamadı' : 'Panele yönlendiriliyorsun…'}</h2>
          {error && <p className="formError">{error}</p>}
        </div>
      </section>
    </main>
  );
}
