'use client';
import{useState,useEffect,useRef}from'react';
import TenantBooking from'@/components/TenantBooking';import AtelierBooking from'@/components/AtelierBooking';import GoogleReviews from'@/components/GoogleReviews';import OwnRatings from'@/components/OwnRatings';import'./radical-themes.css';
type P={b:any;services:any[];hours:any[];staff:any[];staffServices:any[];staffHours:any[];gallery:any[];media:any[];blogPosts?:any[]};
const SCHEME_COLORS:Record<string,{bg:string;text:string}>={light:{bg:'#f8f7f3',text:'#171717'},dark:{bg:'#0d0d0d',text:'#f6f2e9'},warm:{bg:'#f4eadb',text:'#39261d'},natural:{bg:'#eef3ea',text:'#243328'},soft:{bg:'#fff3f7',text:'#422531'},vivid:{bg:'#fff5df',text:'#27152c'},luxury:{bg:'#14110e',text:'#f2e3c5'}};
const FAMILY_DEFAULT_SCHEME:Record<string,string>={keskin:'light',atelier:'dark'};
export default function RadicalTenantSite(p:P){const family=(p.b.selected_theme_id||'barber_keskin').split('_').at(-1),C:any={keskin:Keskin,atelier:Atelier},Layout=C[family]||Keskin,cfg=p.b.published_site_config||{},mode=cfg.colorMode||'light',accent=accentHex(cfg.accentColor,p.b.primary_color),effectiveScheme=p.b.background_scheme&&p.b.background_scheme!=='theme_default'?p.b.background_scheme:(FAMILY_DEFAULT_SCHEME[family]||'light'),schemeColors=SCHEME_COLORS[effectiveScheme]||SCHEME_COLORS.light;return <div className={`radical profession-${p.b.business_type} mode-${mode} scheme-${effectiveScheme} cta-${p.b.cta_style||'solid'} cta-anim-${p.b.cta_animation||'none'} font-${p.b.font_family||'serif'}`} style={{'--accent':accent,'--brand':accent,'--bg':schemeColors.bg,'--text':schemeColors.text}as React.CSSProperties}><Layout {...p}/><WhatsApp b={p.b}/></div>}
const Brand=({b}:{b:any})=><a className="rBrand" href="#top">{b.logo_url?<img src={b.logo_url} alt={b.name}/>:<i>{b.name?.[0]}</i>}<b>{b.name}</b></a>;
const CTA=({b}:{b:any})=><a className="rCta" href="#randevu">{b.booking_button_text||'Randevu Al'} →</a>;
function ServiceList({p,variant='cards'}:{p:P;variant?:string}){return <section id="hizmetler" className={`rServices ${variant}`}><header><small>{p.b.services_label||'HİZMETLER'}</small><h2>{p.b.services_title||'Hizmetler'}</h2></header><div>{p.services.map((s,i)=><article key={s.id}><span>{String(i+1).padStart(2,'0')}</span><h3>{s.name}</h3>{s.description&&<p>{s.description}</p>}<footer><em>{s.duration_minutes} dk</em>{p.b.show_prices&&s.price!=null&&<b>{Number(s.price).toLocaleString('tr-TR')} ₺</b>}</footer></article>)}</div></section>}
function Staff({p,variant='grid'}:{p:P;variant?:string}){if(p.b.show_staff_section===false)return null;const visible=p.staff.filter(s=>!s.is_default&&s.is_active&&s.title!=='Ana Takvim'&&s.username!=='ana-takvim');if(!visible.length)return null;return <section className={`rStaff ${variant}`}><small>EKİBİMİZ</small><div>{visible.map(s=><article key={s.id}>{s.photo_url?<img src={s.photo_url} alt={s.name}/>:<i>{s.name[0]}</i>}<h3>{s.name}</h3><p>{s.title}</p></article>)}</div></section>}
function Gallery({p,variant='grid'}:{p:P;variant?:string}){
  const[lightbox,setLightbox]=useState<number|null>(null);
  const all=[...p.gallery.map(x=>({id:x.id,type:'image',url:x.image_url,alt:x.alt_text})),...p.media];
  if(!p.b.show_gallery||!all.length)return null;
  return <>
    <section className={`rGallery ${variant} media-count-${Math.min(all.length,6)} gallery-pos-${p.b.gallery_position||'after_services'} gallery-size-${p.b.gallery_size||'standard'} gallery-ratio-${p.b.gallery_ratio||'4_3'} gallery-mobile-${p.b.gallery_mobile_columns||'auto'}`}>
      {all.map((x,i)=>x.type==='video'?
        <video key={x.id} src={x.url} controls playsInline preload="metadata"/>:
        <button key={x.id} type="button" className="galleryItemBtn" onClick={()=>setLightbox(i)}><img src={x.url} alt={x.alt||p.b.name} loading="lazy"/></button>
      )}
    </section>
    {lightbox!==null&&all[lightbox]&&<div className="galleryLightbox" onClick={()=>setLightbox(null)}>
      <button className="glClose" onClick={()=>setLightbox(null)}>✕</button>
      {lightbox>0&&<button className="glNav glPrev" onClick={e=>{e.stopPropagation();setLightbox(lightbox-1)}}>‹</button>}
      {all[lightbox].type==='video'?
        <video src={all[lightbox].url} controls autoPlay onClick={e=>e.stopPropagation()}/>:
        <img src={all[lightbox].url} alt={all[lightbox].alt||p.b.name} onClick={e=>e.stopPropagation()}/>
      }
      {lightbox<all.length-1&&<button className="glNav glNext" onClick={e=>{e.stopPropagation();setLightbox(lightbox+1)}}>›</button>}
    </div>}
  </>;
}
function Booking({p}:{p:P}){return <section id="randevu" className="rBooking"><header><small>{p.b.booking_label||'ONLINE RANDEVU'}</small><h2>{p.b.booking_title||'Saatini ayır.'}</h2></header><TenantBooking business={p.b} services={p.services} hours={p.hours} staff={p.staff} staffServices={p.staffServices} staffHours={p.staffHours}/></section>}
function Contact({b}:{b:any}){const mapQuery=encodeURIComponent(b.address||b.name||'');return <><GoogleReviews businessId={b.id}/>{b.show_map!==false&&b.address&&<iframe className="rContactMap" src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" title="Konum"/>}<footer className="rContact"><Brand b={b}/><div><small>{b.address_label}</small><p>{b.address}</p></div><div><small>{b.phone_label}</small><p>{b.phone}</p></div>{b.instagram&&<div><small>{b.instagram_label}</small><p><a href={`https://instagram.com/${String(b.instagram).replace(/^@/,'').trim()}`} target="_blank" rel="noopener noreferrer">{b.instagram}</a></p></div>}</footer></>}
const HeroText=({b}:{b:any})=><><small>{b.hero_label}</small><h1>{b.hero_title||'Tarzını'} <em>{b.hero_highlight||''}</em></h1>{b.hero_description&&<p>{b.hero_description}</p>}<CTA b={b}/></>;
const DAY_NAMES=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
function groupedHourRows(hours:any[]){const order=[1,2,3,4,5,6,0],key=(h:any)=>h?`${h.is_open}|${h.start_time}|${h.end_time}`:'x';const rows:{label:string;value:string}[]=[];let i=0;while(i<order.length){const day=order[i],h=hours.find((x:any)=>x.day_of_week===day);let j=i;while(j+1<order.length){const nh=hours.find((x:any)=>x.day_of_week===order[j+1]);if(key(nh)!==key(h))break;j++}rows.push({label:i===j?DAY_NAMES[day]:`${DAY_NAMES[day]} - ${DAY_NAMES[order[j]]}`,value:h&&h.is_open?`${h.start_time.slice(0,5)} - ${h.end_time.slice(0,5)}`:'Kapalı'});i=j+1}return rows}
function parseFaq(raw:string):{q:string;a:string}[]{
  const fallback=[
    {q:'Randevusuz gelebilir miyim?',a:'Randevulu müşterilerimize öncelik veriyoruz, ancak uygun saat varsa randevusuz da hizmet alabilirsin.'},
    {q:'Randevumu nasıl iptal ederim?',a:'Randevu onayında sana gelen bağlantıya tıklayarak randevunu görüntüleyip iptal edebilirsin.'},
    {q:'Ödeme seçenekleri neler?',a:'Nakit ve kredi/banka kartıyla ödeme kabul ediyoruz.'},
    {q:'Otopark var mı?',a:'Salonumuzun yakınında otopark imkanı bulunuyor.'}
  ];
  if(!raw)return fallback;
  try{const arr=JSON.parse(raw);const cleaned=Array.isArray(arr)?arr.filter((x:any)=>x&&(x.q||x.a)):[];return cleaned.length?cleaned:fallback}catch{return fallback}
}
function Faq({items}:{items:{q:string;a:string}[]}){
  const[open,setOpen]=useState<number|null>(0);
  return <div className="ksFaqList">{items.map((it,i)=><div key={i} className={`ksFaqItem ${open===i?'open':''}`}>
    <button type="button" onClick={()=>setOpen(open===i?null:i)}><span>{it.q}</span><i>{open===i?'–':'+'}</i></button>
    {open===i&&<p>{it.a}</p>}
  </div>)}</div>;
}

function useScrollFrac(){
  const ref=useRef<HTMLElement>(null);
  const[t,setT]=useState(0);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    let raf=0;
    const onScroll=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const h=el.offsetHeight||1,r=el.getBoundingClientRect();setT(Math.min(1,Math.max(0,-r.top/h)))})};
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll);
    return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);cancelAnimationFrame(raf)};
  },[]);
  return{ref,t};
}
function Reveal({children,className='',i=0,as='div'}:{children:React.ReactNode;className?:string;i?:number;as?:'div'|'article'}){
  const ref=useRef<HTMLDivElement>(null);
  const[shown,setShown]=useState(false);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){setShown(true);io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -8% 0px'});
    io.observe(el);
    return()=>io.disconnect();
  },[]);
  const Tag=as as any;
  return <Tag ref={ref} className={`ksReveal ${shown?'in':''} ${className}`} style={{transitionDelay:`${Math.min(i,8)*70}ms`}}>{children}</Tag>;
}
/* Kaydırdıkça ileri-geri "scrub" olan berberlik klibi. Video bir blob olarak
   yüklenir (Safari/iOS'ta güvenilir currentTime araması için), poster ilk kare
   boyanana kadar görünür kalır, prefers-reduced-motion'da video hiç çekilmez. */
function KsHeroVideo({t}:{t:number}){
  const vidRef=useRef<HTMLVideoElement>(null);
  const[ready,setReady]=useState(false);
  const[reduced,setReduced]=useState(false);
  useEffect(()=>{
    const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange=()=>setReduced(mq.matches);
    mq.addEventListener('change',onChange);
    return()=>mq.removeEventListener('change',onChange);
  },[]);
  useEffect(()=>{
    if(reduced)return;
    const v=vidRef.current;if(!v)return;
    const src=window.matchMedia('(max-width:800px)').matches?'/keskin/hero-m.mp4':'/keskin/hero.mp4';
    let cancelled=false,url='';
    fetch(src).then(r=>r.blob()).then(blob=>{
      if(cancelled)return;
      url=URL.createObjectURL(blob);
      v.src=url;
      v.load();
    }).catch(()=>{});
    const onMeta=()=>{
      setReady(true);
      try{v.currentTime=Math.max(t*(v.duration||1),0.001)}catch{}
      v.play().then(()=>v.pause()).catch(()=>{});
    };
    v.addEventListener('loadedmetadata',onMeta);
    return()=>{cancelled=true;v.removeEventListener('loadedmetadata',onMeta);if(url)URL.revokeObjectURL(url)};
  },[reduced]);
  useEffect(()=>{
    const v=vidRef.current;if(!v||!ready||!v.duration)return;
    const target=Math.min(t*v.duration,v.duration-0.05);
    if(Math.abs(v.currentTime-target)>0.03){try{v.currentTime=target}catch{}}
  },[t,ready]);
  return <div className="ksHeroPhoto" style={{'--ksP':t}as React.CSSProperties} aria-hidden="true">
    <img className={`ksHeroLayer ksHeroPoster ${ready?'hide':''}`} src="/keskin/hero-poster.jpg" alt=""/>
    {!reduced&&<video ref={vidRef} className={`ksHeroLayer ksHeroClip ${ready?'show':''}`} muted playsInline preload="none"/>}
  </div>;
}

/* ================= Keskin — açık zemin, siyah tipografili modern berber teması ================= */
function Keskin(p:P){
  const{b}=p;
  const visibleStaff=p.staff.filter((s:any)=>!s.is_default&&s.is_active&&s.title!=='Ana Takvim'&&s.username!=='ana-takvim');
  const years=b.established_year?Math.max(1,new Date().getFullYear()-b.established_year):null;
  const cityRaw=b.address?b.address.split(',').pop()?.trim():'';
  const city=cityRaw&&cityRaw.length<=24?cityRaw:'';
  const hourRows=groupedHourRows(p.hours||[]);
  const faq=parseFaq(dec(b,'ks_faq',''));
  const aboutPhoto=p.gallery?.[0]?.image_url||b.cover_url||'';
  const hmMin=(v:string)=>{const[h,m]=v.slice(0,5).split(':').map(Number);return h*60+m};
  const openStatus=(()=>{
    const WD:Record<string,number>={Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Istanbul',weekday:'long',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    const weekday=parts.find(x=>x.type==='weekday')?.value||'';
    const hh=Number(parts.find(x=>x.type==='hour')?.value||0),mm=Number(parts.find(x=>x.type==='minute')?.value||0);
    const dayIdx=WD[weekday]??new Date().getDay(),nowMin=hh*60+mm;
    const h=p.hours.find((x:any)=>x.day_of_week===dayIdx);
    if(!h||!h.is_open)return 'Bugün kapalı';
    return nowMin>=hmMin(h.start_time)&&nowMin<hmMin(h.end_time)?`Bugün ${h.start_time.slice(0,5)} – ${h.end_time.slice(0,5)} açık`:'Bugün kapalı';
  })();
  const openDaysCount=(p.hours||[]).filter((h:any)=>h.is_open).length;
  const{ref:heroRef,t:heroT}=useScrollFrac();
  return <main id="top" className="tKeskin">
    <header className="ksNav">
      <a className="ksBrand" href="#top"><i>✂</i><b>{b.name}</b></a>
      <nav>
        <a href="#hizmetler">{b.services_label||'Hizmetler'}</a>
        <a href="#ksGallery">Galeri</a>
        <a href="#ksFaq">SSS</a>
        <a href="#randevu">Randevu</a>
        <a href="#ksContact">İletişim</a>
      </nav>
      <a className="ksNavBtn" href="#randevu">{b.booking_button_text||'Randevu Al'}</a>
    </header>

    <section ref={heroRef as any} className="ksHero">
      <KsHeroVideo t={heroT}/>
      <div className="ksHeroOverlay"/>
      <div className="ksHeroInner">
        {city&&<span className="ksKicker">{city.toUpperCase()}</span>}
        <h1>{b.hero_title||b.name}{b.hero_highlight&&<><br/>{b.hero_highlight}</>}</h1>
        <div className="ksHeroActions">
          <a className="ksHeroCta" href="#randevu">{b.booking_button_text||'Hemen Randevu Al'}</a>
          <span className="ksOpenStatus">🕐 {openStatus}</span>
        </div>
      </div>
    </section>

    <section id="hizmetler" className="ksServices">
      <Reveal><header><small>{b.services_label||'HİZMETLER'}</small><h2>{b.services_title||'Ne yaptıracaksın?'}</h2></header></Reveal>
      <div className="ksServiceGrid">
        {p.services.map((s,i)=><Reveal as="article" key={s.id} i={i}>
          <div className="ksServicePhoto">{s.image_url?(s.image_type==='video'?<video src={s.image_url} autoPlay muted loop playsInline/>:<img src={s.image_url} alt={s.name}/>):<i>✂</i>}</div>
          <div className="ksServiceBody">
            <div className="ksServiceHead"><h3>{s.name}</h3>{b.show_prices&&s.price!=null&&<b>₺{Number(s.price).toLocaleString('tr-TR')}</b>}</div>
            {s.description&&<p>{s.description}</p>}
            <small>🕐 {s.duration_minutes} dk</small>
          </div>
        </Reveal>)}
      </div>
    </section>

    <Reveal as="article" className="ksAboutWrap"><section id="hakkimizda" className="ksAbout">
      <div className="ksAboutPhoto">{aboutPhoto?<img src={aboutPhoto} alt={b.name}/>:<i>✂</i>}</div>
      <div className="ksAboutText">
        <small>{b.about_label||'HAKKIMIZDA'}</small>
        <h2>{b.about_title||`${city?city+"'ün ":''}Keskin Adresi`}</h2>
        <p>{b.description||'Klasik berberlik geleneğini modern bir salon deneyimiyle buluşturuyoruz. Ustura bilediğimiz kadar detaylara da özen gösteririz; koltuğa oturduğunda sadece kesim değil, kendine ayırdığın bir mola bulursun.'}</p>
        <div className="ksStats">
          <div><b>{years?`${years}+`:'—'}</b><small>Yıllık Deneyim</small></div>
          <div><b>{visibleStaff.length||1}</b><small>Usta Berber</small></div>
          <div><b>{openDaysCount||7}</b><small>Gün Açık</small></div>
        </div>
      </div>
    </section></Reveal>

    <section id="ksGallery" className="ksGallerySection">
      <Reveal><header><small>GALERİ</small><h2>{dec(b,'ks_galleryTitle','Salondan kareler')}</h2></header></Reveal>
      <Reveal><Gallery p={p} variant="ksGrid"/></Reveal>
    </section>

    {visibleStaff.length>0&&<section id="ksTeam" className="ksTeamSection">
      <Reveal><header><small>EKİP</small><h2>{dec(b,'ks_teamTitle','Ustalarımız')}</h2></header></Reveal>
      <div className="ksTeamGrid">
        {visibleStaff.map((s:any,i:number)=><Reveal as="article" key={s.id} i={i}>
          <div className="ksTeamPhoto">{s.photo_url?<img src={s.photo_url} alt={s.name}/>:<i>{s.name[0]}</i>}</div>
          <b>{s.name}</b><small>{s.title||'Usta Berber'}</small>
        </Reveal>)}
      </div>
    </section>}

    <section className="ksWhy">
      <Reveal><header><small>NEDEN {b.name.toUpperCase()}?</small></header></Reveal>
      <div className="ksWhyGrid">
        <Reveal i={0}><i>✨</i><h3>{dec(b,'ks_why1Title','Usta İşçilik')}</h3><p>{dec(b,'ks_why1Text','Her kesim, yüz hatlarına göre kişiye özel tasarlanır. Acele iş yok, kusursuz iş var.')}</p></Reveal>
        <Reveal i={1}><i>🛡</i><h3>{dec(b,'ks_why2Title','Tam Hijyen')}</h3><p>{dec(b,'ks_why2Text','Her müşteride tek kullanımlık ustura, sterilize aletler ve taze havlu standarttır.')}</p></Reveal>
        <Reveal i={2}><i>📅</i><h3>{dec(b,'ks_why3Title','Kolay Randevu')}</h3><p>{dec(b,'ks_why3Text','Sıra beklemek yok. Online randevunu al, dakikası dakikasına koltukta ol.')}</p></Reveal>
      </div>
    </section>

    <section id="ksFaq" className="ksFaqSection">
      <Reveal><header><small>MERAK EDİLENLER</small><h2>Sık sorulan sorular</h2></header></Reveal>
      <Reveal><Faq items={faq}/></Reveal>
    </section>

    <Reveal><Booking p={p}/></Reveal>

    <Reveal><OwnRatings businessId={b.id}/></Reveal>

    <section id="ksContact" className="ksFooter">
      <div className="ksFooterGrid">
        <div><a className="ksBrand" href="#top"><i>✂</i><b>{b.name}</b></a></div>
        <div><small>ÇALIŞMA SAATLERİ</small>{hourRows.map((r,i)=><div key={i} className="ksHoursRow"><span>{r.label}</span><span>{r.value}</span></div>)}</div>
        <div><small>İLETİŞİM</small>{b.address&&<p>📍 {b.address}</p>}{b.phone&&<p>📞 {b.phone}</p>}{b.instagram&&<p>◎ <a href={`https://instagram.com/${String(b.instagram).replace(/^@/,'').trim()}`} target="_blank" rel="noopener noreferrer">{b.instagram}</a></p>}</div>
      </div>
      <div className="ksFooterBottom">© {new Date().getFullYear()} {b.name}. Tüm hakları saklıdır.</div>
    </section>
  </main>;
}

/* ================= Atölye — koyu zemin, altın vurgulu, dergi tarzı Journal bölümlü lüks berber teması ================= */
function Atelier(p:P){
  const{b}=p;
  const visibleStaff=p.staff.filter((s:any)=>!s.is_default&&s.is_active&&s.title!=='Ana Takvim'&&s.username!=='ana-takvim');
  const years=b.established_year?Math.max(1,new Date().getFullYear()-b.established_year):null;
  const cityRaw=b.address?b.address.split(',').pop()?.trim():'';
  const city=cityRaw&&cityRaw.length<=24?cityRaw:'';
  const hourRows=groupedHourRows(p.hours||[]);
  const faq=parseFaq(dec(b,'at_faq',''));
  const posts=(p.blogPosts||[]).slice(0,3);
  const{ref:heroRef,t:heroT}=useScrollFrac();
  return <main id="top" className="tAtelier">
    <header className="atNav">
      <a className="atBrand" href="#top"><b>{b.name}</b><small>{dec(b,'at_brandSubtitle','BERBER ATÖLYESİ')}</small></a>
      <nav>
        <a href="#top">Ana Sayfa</a>
        <a href="#hizmetler">{b.services_label||'Hizmetler'}</a>
        <a href="#atGallery">Galeri</a>
        <a href="#atJournal">Blog</a>
      </nav>
      <a className="atNavBtn" href="#randevu">{b.booking_button_text||'Randevu Al'}</a>
    </header>

    <section ref={heroRef as any} className="atHero" style={b.cover_url?{backgroundImage:`url(${b.cover_url})`}:undefined}>
      <div className="atHeroBlur" style={{transform:`scale(${1.05+heroT*.1})`}}/>
      <div className="atHeroOverlay"/>
      <div className="atHeroInner">
        {(b.established_year||city)&&<span className="atKicker">✂ {b.established_year?`EST. ${b.established_year}`:''}{b.established_year&&city?' · ':''}{city}</span>}
        <h1>{b.hero_title||b.name}{b.hero_highlight&&<><br/><em>{b.hero_highlight}</em></>}</h1>
        {b.hero_description&&<p>{b.hero_description}</p>}
        <div className="atHeroActions">
          <a className="atBtnSolid" href="#randevu">{b.booking_button_text||'Randevu Al'} ↗</a>
          {b.phone&&<a className="atBtnOutline" href={`tel:${b.phone}`}>📞 Bizi Ara</a>}
        </div>
      </div>
      <div className="atHeroStats">
        <div><b>{years?`${years}`:dec(b,'at_statYears','10')}</b><small>Yıllık Deneyim</small></div>
        <div><b>{visibleStaff.length||dec(b,'at_statStaff','3')}</b><small>Usta Berber</small></div>
        <div><b>{dec(b,'at_statRating','4.9')}</b><small>Ortalama Puan</small></div>
      </div>
    </section>

    <section id="hizmetler" className="atServices">
      <Reveal><header><small>{b.services_label||'HİZMETLER'}</small><h2>{b.services_title||'Açık fiyatlarla, dürüst sürelerle.'}</h2></header></Reveal>
      <div className="atServiceGrid">
        {p.services.map((s,i)=><Reveal as="article" key={s.id} i={i}>
          <div className="atServiceHead"><h3>{s.name}</h3>{b.show_prices&&s.price!=null&&<b>₺{Number(s.price).toLocaleString('tr-TR')}</b>}</div>
          {s.description&&<p>{s.description}</p>}
          <small>🕐 {s.duration_minutes} dk</small>
        </Reveal>)}
      </div>
    </section>

    <section id="randevu" className="atBookingSection">
      <Reveal><header><small>{b.booking_label||'RANDEVU'}</small><h2>{b.booking_title||'Telefon açmadan, canlı müsaitlik.'}</h2></header></Reveal>
      <Reveal><AtelierBooking business={b} services={p.services} hours={p.hours} staff={p.staff} staffServices={p.staffServices} staffHours={p.staffHours}/></Reveal>
    </section>

    <section id="atGallery" className="atGallerySection">
      <Reveal><header><small>GALERİ</small><h2>{dec(b,'at_galleryTitle','Son çalışmalarımız.')}</h2></header></Reveal>
      <Reveal><Gallery p={p} variant="atGrid"/></Reveal>
    </section>

    {posts.length>0&&<section id="atJournal" className="atJournalSection">
      <Reveal><header><h2>{dec(b,'at_journalTitle','Bakım üzerine yazılar.')}</h2><a href={`/site/${b.slug}/blog`}>Tüm Yazılar →</a></header></Reveal>
      <div className="atJournalGrid">
        {posts.map((post:any,i:number)=><Reveal as="article" key={post.id} i={i}>
          <a href={`/site/${b.slug}/blog/${post.slug}`}>
            <div className="atJournalCover">{post.cover_url?<img src={post.cover_url} alt={post.title}/>:<i>✂</i>}</div>
            {post.category&&<small>{post.category.toUpperCase()}</small>}
            <h3>{post.title}</h3>
            {post.excerpt&&<p>{post.excerpt}</p>}
          </a>
        </Reveal>)}
      </div>
    </section>}

    {visibleStaff.length>0&&<section id="atTeam" className="atTeamSection">
      <Reveal><header><small>EKİP</small><h2>{dec(b,'at_teamTitle','Ustalarımız, tek bir standart.')}</h2></header></Reveal>
      <div className="atTeamGrid">
        {visibleStaff.map((s:any,i:number)=><Reveal as="article" key={s.id} i={i}>
          <div className="atTeamPhoto">{s.photo_url?<img src={s.photo_url} alt={s.name}/>:<i>{s.name[0]}</i>}</div>
          <b>{s.name}</b><small>{s.title||'Usta Berber'}</small>
        </Reveal>)}
      </div>
    </section>}

    <section id="atFaq" className="atFaqSection">
      <Reveal><header><small>SORULAR</small><h2>Koltuğa oturmadan önce bilmen gerekenler.</h2></header></Reveal>
      <Reveal><Faq items={faq}/></Reveal>
    </section>

    <Reveal><OwnRatings businessId={b.id}/></Reveal>

    <section className="atContact">
      <Reveal><h2>{city?`${city}. `:''}{dec(b,'at_contactTagline','Siyah kapının ardında.')}</h2></Reveal>
      <Reveal className="atContactRow">
        <div className="atMap">{b.address&&<iframe src={`https://www.google.com/maps?q=${encodeURIComponent(b.address)}&output=embed`} loading="lazy" title="Konum"/>}</div>
        <div className="atContactCard">
          <small>ZİYARET</small>
          {b.address&&<p>{b.address}</p>}
          {b.phone&&<p>{b.phone}</p>}
          {b.instagram&&<p><a href={`https://instagram.com/${String(b.instagram).replace(/^@/,'').trim()}`} target="_blank" rel="noopener noreferrer">{b.instagram}</a></p>}
        </div>
      </Reveal>
    </section>

    <footer className="atFooter">
      <div className="atFooterGrid">
        <div><a className="atBrand" href="#top"><b>{b.name}</b><small>{dec(b,'at_brandSubtitle','BERBER ATÖLYESİ')}</small></a><p>{dec(b,'at_footerTagline','Bakımı üniformasının bir parçası sayanlar için bir berber atölyesi.')}</p></div>
        <div><small>ÇALIŞMA SAATLERİ</small>{hourRows.map((r,i)=><div key={i} className="atHoursRow"><span>{r.label}</span><span>{r.value}</span></div>)}</div>
        <div><small>ZİYARET</small>{b.address&&<p>{b.address}</p>}{b.phone&&<p>{b.phone}</p>}{b.instagram&&<p><a href={`https://instagram.com/${String(b.instagram).replace(/^@/,'').trim()}`} target="_blank" rel="noopener noreferrer">{b.instagram}</a></p>}</div>
      </div>
      <div className="atFooterBottom">© {new Date().getFullYear()} {b.name}</div>
    </footer>
  </main>;
}

function WhatsApp({b}:{b:any}){if(!b.whatsapp_enabled)return null;let n=String(b.whatsapp_phone||b.phone||'').replace(/\D/g,'');if(n.startsWith('0'))n='90'+n.slice(1);return n?<a className="rWhatsapp" href={`https://wa.me/${n}?text=${encodeURIComponent(b.whatsapp_message||'Merhaba')}`}>WhatsApp</a>:null}
function accentHex(name:string,fallback:string){return({black:'#111111',burgundy:'#7c3157',pink:'#ed5da8',purple:'#7652a6',sage:'#6f8f78',blue:'#71849c',orange:'#d8753f',gold:'#9b7b3f'}as any)[name]||fallback||'#111111'}

function dec(b:any,key:string,fallback:string){const d=b.theme_decorations||{};return Object.prototype.hasOwnProperty.call(d,key)?d[key]:fallback}
