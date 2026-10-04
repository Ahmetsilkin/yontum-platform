'use client';
/* Platformun ana sayfası (megsak). Görsel dil, renkler, yazı tipleri ve kaydırma davranışları developios.com'dan
   uyarlandı: açık gri zemin + siyah/koyu yeşil yuvarlak bloklar + limon yeşili vurgu, Inter Tight başlıklar ve
   italik serif vurgu kelimeleri, yüzen beyaz nav, çerçeveli hero, sticky üst üste binen vaka kartları, akordeon
   hizmetler, kaydırdıkça kelime kelime koyulaşan cümle, kaydırdıkça büyüyen görsel, genişleyen süreç kartları,
   koyu yeşil yetenekler bloğu ve dev logolu siyah footer. Metinler ve görseller bize ait: fotoğraf yerine kodla
   çizilmiş panel/tema/telefon mockup'ları; uydurma yorum/puan/proje sayısı yok (sayılar gerçek: tema ailesi ve
   sektör sayısı). Animasyonlar rAF'lı scroll dinleyicileri ve IntersectionObserver ile; hareket azaltma
   tercihinde kapalı. */
import Link from'next/link';
import{useEffect,useRef,useState}from'react';
import{ArrowUpRight,Calendar,Palette,UtensilsCrossed,MessageCircle,Users,Star,ChevronDown,ChevronLeft,ChevronRight,Scissors,Sparkles,Gem,HeartPulse,Store,Car,Coffee,Check,Play}from'lucide-react';

const THEME_COUNT=25,SECTOR_COUNT=7;
function reduced(){return typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}
/* Bir öğenin ekrandaki ilerlemesini (0→1) --p değişkenine yazar. pass: ekrana girişten çıkışa · pin: sticky süresi */
function useScrollP(ref:React.RefObject<HTMLElement|null>,mode:'pass'|'pin'|'center'='pass',onP?:(p:number)=>void){
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    if(reduced()){el.style.setProperty('--p','1');onP?.(1);return}
    let raf=0;
    const tick=()=>{raf=0;const r=el.getBoundingClientRect(),vh=window.innerHeight;
      let p=mode==='pin'?-r.top/Math.max(1,r.height-vh):mode==='center'?(vh*.9-r.top)/(vh*.55):(vh-r.top)/(vh+r.height);
      p=Math.min(1,Math.max(0,p));el.style.setProperty('--p',p.toFixed(4));onP?.(p)};
    const on=()=>{if(!raf)raf=requestAnimationFrame(tick)};
    tick();window.addEventListener('scroll',on,{passive:true});window.addEventListener('resize',on);
    return()=>{window.removeEventListener('scroll',on);window.removeEventListener('resize',on);if(raf)cancelAnimationFrame(raf)};
  },[]);// eslint-disable-line react-hooks/exhaustive-deps
}
/* Ekrana girince bir kere .in sınıfı ekler (başlık kelime kelime yükselme, kart belirme vb.) */
function useInView<T extends HTMLElement>(threshold=.2){
  const ref=useRef<T>(null);const[inView,setIn]=useState(false);
  useEffect(()=>{const el=ref.current;if(!el)return;if(reduced()){setIn(true);return}
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){setIn(true);io.disconnect()}}),{threshold,rootMargin:'0px 0px -6% 0px'});
    io.observe(el);return()=>io.disconnect()},[threshold]);
  return[ref,inView]as const;
}
/* Başlık: kelimeler alttan maskeli şekilde sırayla yükselir. *yıldızlı* kelimeler italik serif vurgu olur. */
function SplitHead({text,as='h2',className='',children}:{text:string;as?:'h1'|'h2';className?:string;children?:React.ReactNode}){
  const[ref,inView]=useInView<HTMLHeadingElement>(.3);const Tag=as as any;
  let i=0;
  const lines=text.split('\n');
  return <Tag ref={ref} className={`hpSplit ${inView?'in':''} ${className}`}>
    {lines.map((line,li)=><span key={li} className="hpLine">{line.split(/(\s+)/).map((w,wi)=>{
      if(/^\s+$/.test(w))return ' ';
      if(w==='{slot}')return <span key={wi} className="hpWord" style={{'--i':i++}as React.CSSProperties}><span>{children}</span></span>;
      const em=/^\*.*\*[.,]?$/.test(w);const clean=w.replace(/\*/g,'');
      return <span key={wi} className="hpWord" style={{'--i':i++}as React.CSSProperties}><span>{em?<em>{clean}</em>:clean}</span></span>;
    })}</span>)}
  </Tag>;
}
function Counter({to,suffix=''}:{to:number;suffix?:string}){
  const[ref,inView]=useInView<HTMLSpanElement>(.5);const[v,setV]=useState(0);
  useEffect(()=>{if(!inView)return;if(reduced()){setV(to);return}let raf=0;const t0=performance.now();
    const f=(t:number)=>{const k=Math.min(1,(t-t0)/1400);setV(Math.round(to*(1-Math.pow(1-k,3))));if(k<1)raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);return()=>cancelAnimationFrame(raf)},[inView,to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

/* ---------- kodla çizilmiş görseller ---------- */
type MiniKind='smash'|'bostan'|'detay'|'zarafet';
function MiniSite({kind}:{kind:MiniKind}){
  const c={
    smash:{name:'SMASH',title:'BURGER',sub:'Taze smash · cesur lezzet',cta:'Sipariş Ver'},
    bostan:{name:'bostan',title:'İyi beslen, iyi hisset.',sub:'yerel · taze · günlük',cta:'Menüyü Gör'},
    detay:{name:'DETAY',title:'ARACINIZ PARLASIN',sub:'Seramik kaplama · iç temizlik',cta:'Randevu Al'},
    zarafet:{name:'Zarafet',title:'Güzelliğin zarif hali',sub:'Cilt bakımı · makyaj · kirpik',cta:'Randevu Al'},
  }[kind];
  return <div className={`hpMini hpMini-${kind}`} aria-hidden="true">
    <div className="hpMiniNav"><b>{c.name}</b><i/><i/><i/><span>{c.cta}</span></div>
    <div className="hpMiniHero">
      <div className="hpMiniText"><small>{c.sub}</small><strong>{c.title}</strong><span className="hpMiniBtn">{c.cta}</span></div>
      <div className="hpMiniArt"><i/><i/><i/></div>
    </div>
    <div className="hpMiniCards"><i/><i/><i/></div>
  </div>;
}
function Laptop({children}:{children:React.ReactNode}){
  return <div className="hpLaptop" aria-hidden="true"><div className="hpLaptopScreen"><div className="hpBrowserBar"><i/><i/><i/><span/></div>{children}</div><div className="hpLaptopBase"/></div>;
}
function PanelMock(){
  const rows=[['10:00','Ayşe Y.','Saç Kesimi','Onaylı'],['11:30','Elif K.','Fön','Onaylı'],['13:00','Mert D.','Sakal','Bekliyor'],['14:30','Merve A.','Manikür','Onaylı'],['16:00','Can T.','Saç + Sakal','Onaylı']];
  return <div className="hpPanel" aria-hidden="true">
    <aside><b className="hpPanelLogo"><Check size={12}/></b>{[Calendar,Users,Palette,Star,MessageCircle].map((I,i)=><i key={i} className={i===0?'on':''}><I size={14}/></i>)}</aside>
    <div className="hpPanelMain">
      <div className="hpPanelHead"><div><small>Bugün</small><b>Randevular</b></div><span>+ Yeni randevu</span></div>
      <div className="hpPanelStats">{[['Bugün','6'],['Bu hafta','34'],['Doluluk','%82'],['Yeni müşteri','9']].map(([k,v])=><div key={k}><small>{k}</small><b>{v}</b></div>)}</div>
      <div className="hpPanelGrid">
        <div className="hpPanelList">{rows.map(r=><div key={r[0]}><em>{r[0]}</em><b>{r[1]}</b><small>{r[2]}</small><span className={r[3]==='Onaylı'?'ok':''}>{r[3]}</span></div>)}</div>
        <div className="hpPanelChart">{[40,62,48,80,70,92,58].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div>
      </div>
    </div>
  </div>;
}
function PhoneMock(){
  return <div className="hpPhone" aria-hidden="true"><div className="hpPhoneNotch"/>
    <div className="hpPhoneBody">
      <small>Randevu al</small><b>Saç Kesimi · 45 dk</b>
      <div className="hpPhoneDays">{['Pzt','Sal','Çar','Per','Cum'].map((d,i)=><span key={d} className={i===2?'on':''}>{d}<em>{12+i}</em></span>)}</div>
      <div className="hpPhoneSlots">{['10:00','10:45','11:30','13:00','14:15','15:00'].map((t,i)=><span key={t} className={i===3?'on':''}>{t}</span>)}</div>
      <span className="hpPhoneBtn">Randevuyu onayla</span>
      <div className="hpPhoneToast"><Check size={12}/> WhatsApp hatırlatması gönderildi</div>
    </div>
  </div>;
}

const SECTORS=[[Scissors,'Berberler'],[Sparkles,'Kuaförler'],[Store,'Güzellik Salonları'],[Gem,'Nail & Kirpik'],[HeartPulse,'Spa & Masaj'],[Coffee,'Restoran & Kafe'],[Car,'Oto Bakım & Detailing']]as const;
const CASES:{kind:MiniKind;title:string;text:string;tags:string[]}[]=[
  {kind:'smash',title:'Smash',text:'Burger dükkânları için hardal-kırmızı, kaydırdıkça katmanlarına ayrılan burger ve uçaklı menü rotasıyla oyunbaz bir restoran teması.',tags:['Restoran','Menü & Sipariş']},
  {kind:'bostan',title:'Bostan',text:'Krem zemin, orman yeşili ve limon vurguyla "çiftlik standı" havasında; fotoğraflı ürün kartlı kafe teması.',tags:['Kafe','Ürün Kartları']},
  {kind:'detay',title:'Detay',text:'Oto yıkama ve detailing işletmeleri için koyu, köşeli, güçlü; online randevusu gömülü servis teması.',tags:['Oto Bakım','Online Randevu']},
  {kind:'zarafet',title:'Zarafet',text:'Güzellik ve kuaför salonları için yumuşak tonlu, bento hizmet ızgaralı zarif bir randevu teması.',tags:['Güzellik','Bento Hizmetler']},
];
const SERVICES=[
  {t:'Online Randevu',d:'Müşterin telefonundan saniyeler içinde boş saati seçer; hizmet süreleri, çalışan takvimleri ve mola saatleri otomatik hesaplanır.',tags:['7/24 randevu','Çalışan bazlı takvim','Çakışma koruması'],icon:Calendar},
  {t:`${THEME_COUNT}+ Hazır Temayla Site`,d:'Sektörüne göre hazırlanmış temalardan birini seç; logo, renk, fotoğraf ve metinleri panelden değiştir, siten dakikalar içinde yayında.',tags:['Kod yok','Mobil uyumlu','Kendi alan adın'],icon:Palette},
  {t:'Menü & Sipariş Linkleri',d:'Restoran ve kafeler için fotoğraflı menü, fiyatlar ve Yemeksepeti/Getir gibi sipariş linkleri tek bir butonda.',tags:['Restoran','Kafe','Çoklu sipariş linki'],icon:UtensilsCrossed},
  {t:'WhatsApp & Hatırlatmalar',d:'Sitende yüzen WhatsApp butonu; müşterine randevusunu hatırlat, gelmeyen randevuları azalt.',tags:['WhatsApp','Hatırlatma'],icon:MessageCircle},
  {t:'Çalışan & Hizmet Yönetimi',d:'Her çalışanın hizmetlerini, çalışma saatlerini ve izinlerini ayrı ayrı tanımla; ekibin takvimi tek panelde.',tags:['Ekip','Hizmet süreleri'],icon:Users},
  {t:'Yorumlar & Google',d:'Randevu sonrası puan topla, Google yorumlarını sitende göster, "Bizi değerlendir" butonuyla yeni yorum kazan.',tags:['Puanlama','Google yorumları'],icon:Star},
];
const MOMENTS=[
  {h:'23:40',who:'Kuaför · İstanbul',t:'Salon kapalıyken bir müşteri yarın sabah 10:00 için fön randevusu aldı. Sabah panelini açtığında takvimde hazır bekliyordu.'},
  {h:'12:15',who:'Burger dükkânı · Ankara',t:'Öğle yoğunluğunda menüye bakan müşteri "Sipariş Ver"e bastı, hangi uygulamadan sipariş vereceğini seçti — telefonla tek tek anlatmaya gerek kalmadı.'},
  {h:'09:05',who:'Oto detailing · İzmir',t:'Seramik kaplama için 3 saatlik randevu, ustanın boş günü otomatik bulunarak açıldı; aynı saate ikinci araç düşmedi.'},
  {h:'18:30',who:'Nail stüdyosu · Bursa',t:'Randevudan bir gün önce giden hatırlatma sayesinde gelemeyecek müşteri saatini iptal etti, boşalan saat başka biriyle doldu.'},
];
const STEPS=[
  {t:'Ücretsiz\nKayıt Ol',d:'E-posta ya da telefonla iki dakikada hesabını aç. Kredi kartı istemiyoruz.'},
  {t:'İşletmeni\nTanıt',d:'Hizmetlerini, fiyatlarını, çalışanlarını ve çalışma saatlerini ekle — panel adım adım yönlendirir.'},
  {t:'Temanı Seç &\nKişiselleştir',d:`${THEME_COUNT}+ temadan birini seç; logon, renklerin ve fotoğraflarınla sana özel hale getir.`},
  {t:'Randevu Almaya\nBaşla',d:'Siteni Instagram biyografine, Google profiline ve WhatsApp’a ekle; randevular kendiliğinden gelsin.'},
];
const TOOLS=['Online Randevu','Site Oluşturucu','WhatsApp','Google Yorumlar','Google Haritalar','Instagram','Menü & Sipariş','Mobil Uyum','SSL Güvenlik'];

export default function HomeLanding(){
  const navRef=useRef<HTMLElement>(null),casesRef=useRef<HTMLDivElement>(null),statementRef=useRef<HTMLDivElement>(null),growRef=useRef<HTMLDivElement>(null);
  const[openSvc,setOpenSvc]=useState(0);
  const[step,setStep]=useState(1);
  const sliderRef=useRef<HTMLDivElement>(null);
  useScrollP(growRef,'pass');
  /* kaydırdıkça kelime kelime koyulaşan cümle */
  useScrollP(statementRef,'center',p=>{
    const words=statementRef.current?.querySelectorAll<HTMLElement>('.hpRevealWord');if(!words)return;
    const n=words.length;words.forEach((w,i)=>w.classList.toggle('on',p*n*1.08>i));
  });
  /* sticky vaka kartları: arkada kalan kart hafifçe küçülür ve kararır */
  useEffect(()=>{
    const wrap=casesRef.current;if(!wrap||reduced())return;
    const cards=[...wrap.querySelectorAll<HTMLElement>('.hpCase')];let raf=0;
    const tick=()=>{raf=0;cards.forEach((c,i)=>{const next=cards[i+1];if(!next){c.style.setProperty('--s','0');return}
      const r=next.getBoundingClientRect(),vh=window.innerHeight,k=Math.min(1,Math.max(0,(vh-r.top)/vh));c.style.setProperty('--s',k.toFixed(3))})};
    const on=()=>{if(!raf)raf=requestAnimationFrame(tick)};tick();
    window.addEventListener('scroll',on,{passive:true});window.addEventListener('resize',on);
    return()=>{window.removeEventListener('scroll',on);window.removeEventListener('resize',on);if(raf)cancelAnimationFrame(raf)};
  },[]);
  /* nav: kaydırınca gölgelenir */
  useEffect(()=>{const on=()=>navRef.current?.toggleAttribute('data-scrolled',window.scrollY>20);on();window.addEventListener('scroll',on,{passive:true});return()=>window.removeEventListener('scroll',on)},[]);
  const slide=(d:number)=>{const s=sliderRef.current;if(!s)return;const card=s.querySelector<HTMLElement>('.hpMoment');s.scrollBy({left:d*((card?.offsetWidth||320)+20),behavior:reduced()?'auto':'smooth'})};
  const statement=`Türkiye’nin ${SECTOR_COUNT} hizmet sektöründeki işletmeler için randevu, site ve müşteri iletişimini tek panelde topluyoruz. {logos} Güvenli altyapı, hızlı sayfalar ve her cihazda kusursuz bir deneyim.`;
  return <div className="hp">
    <header ref={navRef} className="hpNav">
      <Link href="/" className="hpLogo"><span><Check size={14} strokeWidth={3}/></span>Megsak</Link>
      <nav className="hpNavLinks" aria-label="Ana menü">
        <a href="#hakkimizda">Hakkımızda</a><a href="#temalar">Temalar</a><a href="#hizmetler">Özellikler</a><a href="#surec">Nasıl Çalışır</a>
      </nav>
      <div className="hpNavRight"><Link href="/giris" className="hpNavLogin">Giriş Yap</Link><Link href="/kayit" className="hpBtnDark">Ücretsiz Başla <ArrowUpRight size={16}/></Link></div>
    </header>

    <section className="hpHeroWrap">
      <div className="hpHero">
        <div className="hpHeroBg" aria-hidden="true">
          {[0,1,2].map(col=><div key={col} className={`hpHeroCol hpHeroCol${col}`}>{[...CASES,...CASES].map((c,i)=><div key={i} className="hpHeroTile"><MiniSite kind={c.kind}/></div>)}</div>)}
        </div>
        <div className="hpHeroInner">
          <div className="hpHeroBadge">
            <svg viewBox="0 0 40 60" className="hpLaurel" aria-hidden="true"><path d="M30 56 C10 46 6 24 16 6"/>{[0,1,2,3,4].map(i=><ellipse key={i} cx={14+i*.5} cy={46-i*9} rx="6" ry="3" transform={`rotate(${-40+i*8} ${14+i*.5} ${46-i*9})`}/>)}</svg>
            <div><b>{THEME_COUNT}+ tema · {SECTOR_COUNT} sektör</b><span><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></span><small>Kod yok, kredi kartı yok</small></div>
            <svg viewBox="0 0 40 60" className="hpLaurel hpLaurelR" aria-hidden="true"><path d="M30 56 C10 46 6 24 16 6"/>{[0,1,2,3,4].map(i=><ellipse key={i} cx={14+i*.5} cy={46-i*9} rx="6" ry="3" transform={`rotate(${-40+i*8} ${14+i*.5} ${46-i*9})`}/>)}</svg>
          </div>
          <SplitHead as="h1" className="hpHeroTitle" text={'Randevu & Site *Otomasyonu*\nİşletmeler {slot} İçin'}><span className="hpHeroPill"><Play size={18} fill="currentColor"/></span></SplitHead>
          <p className="hpHeroSub">Berberden restorana, oto yıkamadan güzellik salonuna — <b>online randevu</b>, <b>hazır web sitesi</b> ve <b>müşteri iletişimi</b> tek bir uygulamada.</p>
          <div className="hpHeroCtas"><Link href="/kayit" className="hpBtnLime">14 Gün Ücretsiz Dene <ArrowUpRight size={18}/></Link><a href="#temalar" className="hpBtnGhost">Temaları Gör</a></div>
        </div>
      </div>
      <div className="hpLogos">
        <span className="hpLogosLabel">Kimler için…</span>
        <div className="hpLogosTrack"><div>{[...SECTORS,...SECTORS].map(([I,t],i)=><span key={i}><I size={20}/>{t}</span>)}</div></div>
      </div>
    </section>

    <section id="hakkimizda" className="hpAbout">
      <div className="hpAboutLeft">
        <p className="hpLabel">Megsak Hakkında</p>
        <div className="hpAboutArt"><div className="hpAboutArc"/><div className="hpAboutCircle"><PhoneMock/></div></div>
      </div>
      <div className="hpAboutRight">
        <h2 className="hpAboutLead"><span>Küçük işletmeler için bir dijital ekibiz.</span> Randevu sistemini, web siteni ve müşteri iletişimini kuruyoruz — sen sadece işine odaklan.</h2>
        <p className="hpAboutText">Çoğu işletme randevuyu hâlâ deftere, telefona ve DM’lere dağılmış şekilde yönetiyor. Biz bunu tek bir panelde topladık: müşterin sitenden randevusunu alır, sen takvimini telefondan yönetirsin.</p>
        <div className="hpStats">
          <div className="hpStat"><small>/01</small><b><Counter to={THEME_COUNT} suffix="+"/></b><span>Hazır site teması</span></div>
          <div className="hpStat"><small>/02</small><b><Counter to={SECTOR_COUNT}/></b><span>Desteklenen sektör</span></div>
        </div>
      </div>
    </section>

    <section id="temalar" className="hpCasesWrap">
      <div className="hpCasesHead"><p className="hpLabel hpLabelLight">Temalar</p><SplitHead className="hpH2 hpH2Light" text={'Her sektöre *özel* tasarlanmış\nhazır siteler'}/></div>
      <div ref={casesRef} className="hpCases">
        {CASES.map((c,i)=><article key={c.kind} className="hpCase" style={{'--k':i}as React.CSSProperties}>
          <div className={`hpCaseStage hpCaseStage-${c.kind}`}><Laptop><MiniSite kind={c.kind}/></Laptop></div>
          <div className="hpCaseCard"><h3>{c.title}</h3><p>{c.text}</p><div className="hpTags">{c.tags.map(t=><span key={t}>{t}</span>)}</div></div>
        </article>)}
      </div>
    </section>

    <section id="hizmetler" className="hpServices">
      <div className="hpServicesHead"><p className="hpLabel">Özelliklerimiz</p><SplitHead className="hpH2" text={'Randevu, Site & Büyüme *Araçları*\nİşletmeni Büyütür'}/></div>
      <div className="hpAcc">
        {SERVICES.map((s,i)=>{const open=openSvc===i;const I=s.icon;return <div key={s.t} className={`hpAccItem ${open?'open':''}`}>
          <button type="button" className="hpAccHead" aria-expanded={open} onClick={()=>setOpenSvc(open?-1:i)}><small>0{i+1}/</small><span>{s.t}</span><i><ChevronDown size={18}/></i></button>
          <div className="hpAccBody"><div><div className="hpAccInner"><div className="hpAccIcon"><I size={28}/></div><div><p>{s.d}</p><div className="hpTags hpTagsDark">{s.tags.map(t=><span key={t}>{t}</span>)}</div></div></div></div></div>
        </div>})}
      </div>
    </section>

    <section className="hpMomentsWrap">
      <div className="hpMomentsTop">
        <div className="hpMomentsCount"><b><Counter to={THEME_COUNT} suffix="+"/></b><div className="hpAvatars">{['#BEE870','#00584D','#F2B45A','#DC2626'].map(c=><i key={c} style={{background:c}}/>)}</div><small>tema, her biri gerçek işletme ihtiyacından doğdu</small></div>
        <div><p className="hpLabel hpLabelLight">Bir gün Megsak’la</p><SplitHead className="hpH2 hpH2Light" text={'Bir *performans* zihniyetiyle\ntasarlandı'}/></div>
      </div>
      <div ref={sliderRef} className="hpMoments" data-smooth-off>
        {MOMENTS.map(m=><article key={m.h} className="hpMoment"><em>{m.h}</em><p>{m.t}</p><div className="hpMomentWho"><i>{m.who[0]}</i><div><b>Örnek senaryo</b><small>{m.who}</small></div></div></article>)}
      </div>
      <div className="hpMomentsNav"><button type="button" aria-label="Önceki" onClick={()=>slide(-1)}><ChevronLeft size={18}/></button><button type="button" aria-label="Sonraki" onClick={()=>slide(1)}><ChevronRight size={18}/></button></div>
    </section>

    <section className="hpStatementWrap">
      <div ref={statementRef} className="hpStatement">
        <p>{statement.split(' ').map((w,i)=>w==='{logos}'?<span key={i} className="hpInlineLogos" aria-hidden="true"><i>N</i><i>S</i><i>V</i></span>:<span key={i} className="hpRevealWord">{w} </span>)}</p>
      </div>
    </section>

    <section className="hpGrowWrap">
      <div ref={growRef} className="hpGrow"><div className="hpGrowInner"><PanelMock/></div></div>
    </section>

    <section id="surec" className="hpProcess">
      <div className="hpProcessHead">
        <SplitHead className="hpH2" text={'Dört {slot} Adımda\nSiten *Yayında*'}><span className="hpInlineBadge"><Check size={20} strokeWidth={3}/></span></SplitHead>
        <p>Kurulum için teknik bilgi gerekmiyor. Panel seni adım adım yönlendirir; çoğu işletme ilk randevusunu aynı gün alır.</p>
      </div>
      <div className="hpSteps">
        {STEPS.map((s,i)=><article key={i} className={`hpStep ${step===i?'on':''}`} onMouseEnter={()=>setStep(i)} onFocus={()=>setStep(i)} tabIndex={0}>
          <h3>{s.t.split('\n').map((l,j)=><span key={j}>{l}</span>)}</h3>
          <div className="hpStepMore"><p>{s.d}</p><div className={`hpStepArt hpStepArt${i}`} aria-hidden="true">{i===0&&<div className="hpFormMock"><i/><i/><b>Hesap oluştur</b></div>}{i===1&&<div className="hpListMock">{['Saç Kesimi · 45 dk','Sakal · 20 dk','Boya · 90 dk'].map(t=><span key={t}>{t}</span>)}</div>}{i===2&&<div className="hpSwatchMock">{['#DC2626','#1E3932','#0E9C21','#5D2E46'].map(c=><i key={c} style={{background:c}}/>)}</div>}{i===3&&<div className="hpBellMock"><Calendar size={26}/><b>Yeni randevu!</b></div>}</div></div>
          <small>0{i+1}</small>
        </article>)}
      </div>
    </section>

    <section className="hpCapWrap">
      <div className="hpCap">
        <div className="hpCapArt"><PhoneMock/></div>
        <div className="hpCapRight">
          <p className="hpLabel hpLabelLight">Neler Var</p>
          <SplitHead className="hpH2 hpH2Light hpCapTitle" text={'Tasarım, *otomasyon* ve\nmüşteri iletişimi — hepsi\ntek panelde.'}/>
          <div className="hpTools">{TOOLS.map(t=><span key={t}><Check size={14} strokeWidth={3}/>{t}</span>)}</div>
        </div>
      </div>
    </section>

    <footer className="hpFooter">
      <div className="hpFooterCta">
        <SplitHead className="hpFooterTitle" text={'İşletmeni *Bugün*\nDijitale Taşı {slot}'}><Link href="/kayit" className="hpFooterArrow" aria-label="Ücretsiz başla"><ArrowUpRight size={34}/></Link></SplitHead>
      </div>
      <div className="hpFooterCols">
        <div><h4>Ürün</h4><a href="#hizmetler">Online Randevu</a><a href="#temalar">Site Temaları</a><a href="#hizmetler">Menü & Sipariş</a><a href="#hizmetler">Yorumlar</a></div>
        <div><h4>Sektörler</h4>{SECTORS.slice(0,5).map(([,t])=><a key={t} href="#temalar">{t}</a>)}</div>
        <div><h4>Megsak</h4><a href="#hakkimizda">Hakkımızda</a><a href="#surec">Nasıl Çalışır</a><Link href="/kosullar">Kullanım Koşulları</Link><Link href="/gizlilik">Gizlilik Politikası</Link></div>
        <div><h4>Hesap</h4><Link href="/kayit">Ücretsiz Başla</Link><Link href="/giris">Giriş Yap</Link><Link href="/sifremi-unuttum">Şifremi Unuttum</Link></div>
      </div>
      <div className="hpFooterCards">
        <Link href="/kayit" className="hpFooterCard"><div><b>14 gün ücretsiz</b><span>Kredi kartı gerekmeden tüm özellikleri dene.</span></div><Sparkles size={34}/></Link>
        <Link href="/giris" className="hpFooterCard"><div><b>Zaten üye misin?</b><span>Paneline giriş yap, randevularını yönet.</span></div><Calendar size={34}/></Link>
      </div>
      <div className="hpFooterBottom"><span>© {new Date().getFullYear()} Megsak. Tüm hakları saklıdır.</span></div>
      <div className="hpWordmark" aria-hidden="true">Megsak</div>
    </footer>
  </div>;
}
