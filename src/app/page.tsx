import Link from'next/link';import PlatformHeader from'@/components/PlatformHeader';import PlatformFooter from'@/components/PlatformFooter';import{Calendar,Palette,CreditCard,MessageCircle,Users,ShieldCheck,Zap,Smartphone,Quote}from'lucide-react';
export default function Home(){return <>
  <div className="pubTopBar">🎉 <b>Yeni:</b> Randevularını ve siteni tek panelden yönet — 14 gün ücretsiz dene.</div>
  <PlatformHeader/>
  <main className="pubHero">
    <div className="pubHeroText">
      <p className="pubEyebrow splashIn d1">RANDEVU &amp; SİTE OTOMASYONU</p>
      <h1 className="splashIn d2">Randevularını<br/><mark className="pubMark">otomatiğe</mark> <span className="pubCircled">bağla.</span></h1>
      <p className="pubHeroSub splashIn d3">Şirket kuruluşundan değil — randevu almaktan online muhasebeye, site yönetiminden müşteri hatırlatmalarına kadar berber, kuaför ve güzellik işletmelerinin tüm ihtiyaçları tek bir uygulamada.</p>
      <div className="pubHeroActions splashIn d4">
        <Link className="navCta pub-tap" href="/kayit">Ücretsiz Başla <b>→</b></Link>
        <Link className="pubTextLink pub-tap" href="/giris">Giriş Yap</Link>
      </div>
    </div>
    <div className="pubHeroVisual splashIn d3">
      <div className="pubBrowser">
        <div className="pubBrowserBar"><i/><i/><i/><span>megsak.app/panel</span></div>
        <div className="pubBrowserBody">
          <div className="pubMockSide"><i className="active"/><i/><i/><i/><i/></div>
          <div className="pubMockMain">
            <div className="pubMockHead"><b>Bugünkü randevular</b><span>6 randevu · 1.240 ₺</span></div>
            <div className="pubMockRow"><span className="pubMockAvatar" style={{background:'#0d6efd'}}>A</span><div><b>10:00 — Ayşe Yılmaz</b><small>Saç Kesimi · Ahmet Usta</small></div><em>✓ Onaylı</em></div>
            <div className="pubMockRow"><span className="pubMockAvatar" style={{background:'#198754'}}>E</span><div><b>11:30 — Elif Kaya</b><small>Fön · Selin Usta</small></div><em>✓ Onaylı</em></div>
            <div className="pubMockRow"><span className="pubMockAvatar" style={{background:'#d97706'}}>M</span><div><b>14:30 — Merve Demir</b><small>Manikür · Ahmet Usta</small></div><em>✓ Onaylı</em></div>
          </div>
        </div>
      </div>
      <div className="pubFeatureBadge pfb-1"><i><Calendar/></i>Online Randevu</div>
      <div className="pubFeatureBadge pfb-2"><i><Palette/></i>Site Oluşturucu</div>
      <div className="pubFeatureBadge pfb-3"><i><CreditCard/></i>Ödeme Takibi</div>
      <div className="pubFeatureBadge pfb-4"><i><MessageCircle/></i>WhatsApp Hatırlatma</div>
      <div className="pubFeatureBadge pfb-5"><i><Users/></i>Çalışan Yönetimi</div>
    </div>
  </main>
  <section className="pubBenefits">
    <h2>Randevu almak veya işletmeni yönetmek isteyenler için <em>eksiksiz ve özenli</em> hizmetler sunuyoruz.</h2>
    <p>Girişimcilerin ve işletme sahiplerinin hayatını kolaylaştırmaya çalışan bir uygulama olarak, randevu ve site yönetiminde karşılaşılması muhtemel sorunlara pratik çözümler geliştiriyoruz.</p>
    <div className="pubBenefitGrid">
      <article className="pubBenefitCard pbc-1"><ShieldCheck/><h3>Güvenli</h3><p>Megsak ile paylaştığın tüm bilgiler Supabase altyapısı ve güçlü şifreleme yöntemleriyle korunuyor.</p></article>
      <article className="pubBenefitCard pbc-2"><Zap/><h3>Hızlı Kurulum</h3><p>Kredi kartı gerekmeden, birkaç dakika içinde profesyonel siten ve online randevu sistemin hazır.</p></article>
      <article className="pubBenefitCard pbc-3"><Smartphone/><h3>Her Cihazda</h3><p>Panelin ve müşterilerinin randevu sayfası; telefonda, tablette ve masaüstünde sorunsuz çalışır.</p></article>
    </div>
  </section>
  <section className="pubTestimonials">
    <div className="pubTestiHead">
      <h2>Mutlu Megsak kullanıcılarıyla yakında tanışacaksın</h2>
      <p>Şu an ilk üyelerimizi ağırlıyoruz — belki de bu sayfada okuyacağın ilk hikaye seninki olur.</p>
    </div>
    <div className="pubTestiCard">
      <Quote/>
      <p>İşletmeni Megsak'a taşı, deneyimini bizimle paylaş; ilk kullanıcılarımızdan biri olarak burada yer al.</p>
      <Link className="pubTestiCta" href="/kayit">Sen de katıl →</Link>
    </div>
  </section>
  <PlatformFooter/>
</>}
