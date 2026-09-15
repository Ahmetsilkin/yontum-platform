'use client';
import { useState } from 'react';

export default function AdminGateForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/gate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, password }) });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(j.error || 'Telefon numarası veya şifre hatalı.'); return }
    location.reload();
  }

  return (
    <main className="authPage">
      <section className="authMain">
        <form className="authCard" onSubmit={submit}>
          <div className="platformLogo"><span>M</span><b>MEGSAK</b></div>
          <h2>Yönetim Paneli</h2>
          <p>Devam etmek için telefon numaranı ve şifreni gir.</p>
          {error && <p className="formError">{error}</p>}
          <label className="field">Telefon numarası
            <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required autoFocus placeholder="05__ ___ __ __" />
          </label>
          <label className="field">Şifre
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <button className="formButton" disabled={loading}>{loading ? 'Kontrol ediliyor…' : 'Gir →'}</button>
        </form>
      </section>
    </main>
  );
}
