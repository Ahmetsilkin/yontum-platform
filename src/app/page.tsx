import Link from'next/link';import PlatformHeader from'@/components/PlatformHeader';import PlatformFooter from'@/components/PlatformFooter';
export default function Home(){return <><PlatformHeader/><main className="pubHero">
  <div className="pubHeroText">
    <p className="pubEyebrow splashIn d1">RANDEVU &amp; SİTE OTOMASYONU</p>
    <h1 className="splashIn d2">Randevularını<br/><mark className="pubMark">otomatiğe</mark> <span className="pubCircled">bağla.</span></h1>
    <div className="pubHeroActions splashIn d4">
      <Link className="navCta pub-tap" href="/kayit">Ücretsiz Başla <b>→</b></Link>
      <Link className="pubTextLink pub-tap" href="/giris">Giriş Yap</Link>
    </div>
  </div>
  <div className="pubHeroVisual splashIn d3">
    <svg className="pubSquiggle" viewBox="0 0 120 70" fill="none" aria-hidden="true"><path d="M8 55C8 20 30 20 30 40C30 60 52 60 52 35C52 10 74 10 74 32C74 54 96 54 96 25C96 12 105 8 112 8" stroke="var(--mark-yellow)" strokeWidth="7" strokeLinecap="round"/></svg>
    <div className="pubBrowser">
      <div className="pubBrowserBar"><i/><i/><i/><span>yontum.app/panel</span></div>
      <div className="pubBrowserBody">
        <div className="pubMockHead"><b>Bugünkü randevular</b><span>6 randevu · 1.240 ₺</span></div>
        <div className="pubMockRow"><i style={{background:'#0046ff'}}/><div><b>10:00 — Ayşe Yılmaz</b><small>Saç Kesimi · Ahmet Usta</small></div><em>Onaylı</em></div>
        <div className="pubMockRow"><i style={{background:'#059669'}}/><div><b>11:30 — Elif Kaya</b><small>Fön · Selin Usta</small></div><em>Onaylı</em></div>
        <div className="pubMockRow"><i style={{background:'#d97706'}}/><div><b>14:30 — Merve Demir</b><small>Manikür · Ahmet Usta</small></div><em>Onaylı</em></div>
      </div>
    </div>
  </div>
</main><PlatformFooter/></>}
