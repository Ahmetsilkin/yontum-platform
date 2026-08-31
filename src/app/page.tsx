import Link from'next/link';import PlatformHeader from'@/components/PlatformHeader';
export default function Home(){return <><PlatformHeader/><main className="pubHero">
  <div className="pubHeroText">
    <p className="pubEyebrow splashIn d1">RANDEVU &amp; SİTE OTOMASYONU</p>
    <h1 className="splashIn d2">Randevularını<br/><em>otomatiğe bağla.</em></h1>
    <p className="pubHeroSub splashIn d3">Berberin, kuaförün ya da salonun için kendi web siten, online randevu sistemin ve WhatsApp hatırlatmaların dakikalar içinde hazır.</p>
    <div className="pubHeroActions splashIn d4">
      <Link className="navCta pub-tap" href="/kayit">Ücretsiz Başla <b>→</b></Link>
      <Link className="pubTextLink pub-tap" href="/giris">Giriş Yap</Link>
    </div>
  </div>
  <div className="pubHeroVisual splashIn d3">
    <div className="pubGlassCard pubGlassChat">
      <div className="pubChatHead"><span className="pubAvatar">A</span><div><b>Ayşe · müşteri</b><small>WhatsApp</small></div><i className="pubLiveDot" aria-hidden="true"/></div>
      <div className="pubChatBubble in">Merhaba, yarın öğleden sonraya randevu alabilir miyim?</div>
      <div className="pubChatBubble out">Yarın 14:30 boş görünüyor, adınıza ayırdım. Randevudan önce hatırlatma da gelecek. ✓</div>
    </div>
    <div className="pubGlassCard pubGlassSummary">
      <span className="pubSummaryIcon">✓</span>
      <div><b>Randevu onaylandı</b><small>Bugün 6 randevu otomatik ayarlandı</small></div>
    </div>
  </div>
</main><footer className="platformFooter"><div className="platformLogo inverse"><span>Y</span><b>YONTUM</b></div><p>© 2026 Yontum.</p></footer></>}
