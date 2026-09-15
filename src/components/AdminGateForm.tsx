'use client';
import { useState } from 'react';

export default function AdminGateForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/gate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    setLoading(false);
    if (!res.ok) { setError('Şifre yanlış.'); return }
    location.reload();
  }

  return (
    <main className="authPage">
      <section className="authMain">
        <form className="authCard" onSubmit={submit}>
          <div className="platformLogo"><span>M</span><b>MEGSAK</b></div>
          <h2>Yönetim Paneli</h2>
          <p>Devam etmek için şifreyi gir.</p>
          {error && <p className="formError">{error}</p>}
          <label className="field">Şifre
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
          </label>
          <button className="formButton" disabled={loading}>{loading ? 'Kontrol ediliyor…' : 'Gir →'}</button>
        </form>
      </section>
    </main>
  );
}
