'use client';
import { useEffect, useState } from 'react';

type BizRow = { id: string; name: string; slug: string; phone: string; business_type: string; is_published: boolean; created_at: string };

const BUSINESS_TYPES: { value: string; label: string }[] = [
  { value: 'barber', label: 'Erkek Berberi' },
  { value: 'hair_salon', label: 'Kadın Kuaförü' },
  { value: 'beauty', label: 'Güzellik Merkezi' },
  { value: 'nail_lash', label: 'Nail / Kirpik / Kaş Stüdyosu' },
  { value: 'spa_massage', label: 'Spa / Masaj' },
  { value: 'dietitian', label: 'Diyetisyen' },
  { value: 'psychologist', label: 'Psikolog / Danışman' },
  { value: 'other', label: 'Diğer Hizmet İşletmesi' },
];

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

function slugify(v: string) {
  return v.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminBusinessManager() {
  const [list, setList] = useState<BizRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('barber');
  const [password, setPassword] = useState(generatePassword());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ name: string; slug: string; phone: string; password: string; loginUrl: string; siteUrl: string } | null>(null);
  const [resetTarget, setResetTarget] = useState<BizRow | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetDone, setResetDone] = useState<string | null>(null);
  const [listError, setListError] = useState('');
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BizRow | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/businesses');
    const j = await res.json();
    setList(res.ok ? (j.businesses as BizRow[]) || [] : []);
    setLoading(false);
  }
  useEffect(() => { load() }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    const res = await fetch('/api/admin/businesses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessType, name, slug, phone, password }) });
    const j = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(j.error || 'Bir hata oluştu.'); return }
    setCreated({ name, slug: j.slug, phone, password, loginUrl: j.loginUrl, siteUrl: j.siteUrl });
    setName(''); setSlug(''); setSlugTouched(false); setPhone(''); setPassword(generatePassword());
    load();
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    setResetSubmitting(true); setResetError('');
    const res = await fetch(`/api/admin/businesses/${resetTarget.id}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: resetPassword }) });
    const j = await res.json();
    setResetSubmitting(false);
    if (!res.ok) { setResetError(j.error || 'Bir hata oluştu.'); return }
    setResetDone(resetPassword);
  }

  async function logout() { await fetch('/api/admin/gate', { method: 'DELETE' }); location.reload() }

  async function openBusinessPanel(b: BizRow) {
    setImpersonatingId(b.id); setListError('');
    const res = await fetch(`/api/admin/businesses/${b.id}/impersonate`, { method: 'POST' });
    const j = await res.json();
    setImpersonatingId(null);
    if (!res.ok) { setListError(j.error || 'Panele girilemedi.'); return }
    window.open(j.link, '_blank');
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteSubmitting(true); setDeleteError('');
    const res = await fetch(`/api/admin/businesses/${deleteTarget.id}`, { method: 'DELETE' });
    const j = await res.json().catch(() => ({}));
    setDeleteSubmitting(false);
    if (!res.ok) { setDeleteError(j.error || 'Silinemedi.'); return }
    setList(l => l.filter(x => x.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="dashboardShell">
      <main className="dashboardMain noSide">
        <header className="dashboardTop">
          <div className="platformLogo"><span>M</span><b>MEGSAK</b></div>
          <div className="adminTopActions"><button type="button" className="plainAction" onClick={logout}>Çıkış Yap</button></div>
        </header>
        <div className="dashboardContent">
          <section className="panel dashPanel">
            <div className="panelTitle"><div><h2>Yeni işletme aç</h2><p>İşletme adına siteyi ve giriş bilgilerini burada oluşturursun — işletme kendi kendine kayıt olmuyor.</p></div></div>
            {error && <p className="formError">{error}</p>}
            <form onSubmit={submit}>
              <label className="field">İşletme türü
                <select className="input" value={businessType} onChange={e => setBusinessType(e.target.value)}>
                  {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label className="field">İşletme adı
                <input className="input" value={name} onChange={e => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)) }} required placeholder="Örn. Mehmet Usta Berber" />
              </label>
              <label className="field">Site adresi
                <div className="slugInput"><input value={slug} onChange={e => { setSlugTouched(true); setSlug(slugify(e.target.value)) }} required minLength={3} maxLength={40} pattern="[a-z0-9-]+" placeholder="mehmetusta" /><span>.megsak.com</span></div>
              </label>
              <label className="field">Telefon <small>(giriş için kullanılacak)</small>
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="05__ ___ __ __" />
              </label>
              <label className="field">Şifre
                <div className="adminPasswordRow"><input className="input" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /><button type="button" className="plainAction" onClick={() => setPassword(generatePassword())}>Yeniden Oluştur</button></div>
              </label>
              <button className="blackBtn" disabled={submitting}>{submitting ? 'Oluşturuluyor…' : 'İşletmeyi Oluştur →'}</button>
            </form>
          </section>

          <section className="panel dashPanel">
            <div className="panelTitle"><div><h2>İşletmeler</h2><p>{list.length} işletme</p></div></div>
            {listError && <p className="formError">{listError}</p>}
            {loading ? <p>Yükleniyor…</p> : list.length ? (
              <div className="tableScroll">
                <table className="dashTable">
                  <thead><tr><th>İşletme</th><th>Site</th><th>Telefon</th><th>Durum</th><th></th></tr></thead>
                  <tbody>
                    {list.map(b => (
                      <tr key={b.id}>
                        <td><b>{b.name}</b></td>
                        <td><a href={`/site/${b.slug}`} target="_blank" rel="noopener noreferrer">{b.slug}</a></td>
                        <td>{b.phone}</td>
                        <td>{b.is_published ? 'Yayında' : 'Taslak'}</td>
                        <td className="adminRowActions">
                          <button type="button" className="plainAction" disabled={impersonatingId === b.id} onClick={() => openBusinessPanel(b)}>{impersonatingId === b.id ? 'Açılıyor…' : 'Panele Git'}</button>
                          <button type="button" className="plainAction" onClick={() => { setResetTarget(b); setResetPassword(generatePassword()); setResetError(''); setResetDone(null) }}>Şifreyi Sıfırla</button>
                          <button type="button" className="plainAction danger" onClick={() => { setDeleteTarget(b); setDeleteError('') }}>Sil</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="emptyDash">Henüz işletme yok.</div>}
          </section>
        </div>
      </main>

      {created && (
        <div className="dashModalBackdrop">
          <div className="dashModal newStaffModal">
            <h2>İşletme oluşturuldu ✓</h2>
            <p>{created.name} için giriş bilgileri hazır. Bu bilgileri işletmeye ilet.</p>
            <div className="credBox">
              <div><small>Giriş adresi</small><b>{created.loginUrl}</b></div>
              <div><small>Telefon</small><b>{created.phone}</b></div>
              <div><small>Şifre</small><b>{created.password}</b></div>
              <div><small>Site</small><b>{created.siteUrl}</b></div>
            </div>
            <div className="credActions">
              <button type="button" onClick={() => navigator.clipboard.writeText(`Giriş adresi: ${created.loginUrl}\nTelefon: ${created.phone}\nŞifre: ${created.password}`)}>Kopyala</button>
            </div>
            <button type="button" className="closeCredModal" onClick={() => setCreated(null)}>Kapat</button>
          </div>
        </div>
      )}

      {resetTarget && (
        <div className="dashModalBackdrop">
          <form className="dashModal" onSubmit={submitReset}>
            <button type="button" className="modalX" onClick={() => setResetTarget(null)}>×</button>
            <p className="overline">ŞİFRE SIFIRLAMA</p>
            <h2>{resetTarget.name}</h2>
            {resetError && <p className="formError">{resetError}</p>}
            {resetDone ? (
              <>
                <div className="credBox"><div><small>Yeni şifre</small><b>{resetDone}</b></div></div>
                <button type="button" className="blackBtn wideBtn" onClick={() => setResetTarget(null)}>Kapat</button>
              </>
            ) : (
              <>
                <label className="field full">Yeni şifre
                  <div className="adminPasswordRow"><input className="input" value={resetPassword} onChange={e => setResetPassword(e.target.value)} required minLength={8} /><button type="button" className="plainAction" onClick={() => setResetPassword(generatePassword())}>Yeniden Oluştur</button></div>
                </label>
                <button className="blackBtn wideBtn" disabled={resetSubmitting}>{resetSubmitting ? 'Kaydediliyor…' : 'Şifreyi Kaydet'}</button>
              </>
            )}
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="dashModalBackdrop">
          <div className="dashModal">
            <button type="button" className="modalX" onClick={() => setDeleteTarget(null)}>×</button>
            <p className="overline">İŞLETMEYİ SİL</p>
            <h2>{deleteTarget.name}</h2>
            <p>Bu işletmeyi, sitesini, randevularını ve giriş hesabını kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.</p>
            {deleteError && <p className="formError">{deleteError}</p>}
            <button type="button" className="dangerButton" disabled={deleteSubmitting} onClick={confirmDelete}>{deleteSubmitting ? 'Siliniyor…' : 'Evet, Kalıcı Olarak Sil'}</button>
            <button type="button" className="plainAction wideBtn" style={{ marginTop: 10 }} onClick={() => setDeleteTarget(null)}>Vazgeç</button>
          </div>
        </div>
      )}
    </div>
  );
}
