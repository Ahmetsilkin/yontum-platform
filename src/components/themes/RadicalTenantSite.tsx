'use client';
import{useState,useEffect,useRef}from'react';
import TenantBooking from'@/components/TenantBooking';import AtelierBooking from'@/components/AtelierBooking';import ZarafetBooking from'@/components/ZarafetBooking';import GoogleReviews from'@/components/GoogleReviews';import OwnRatings from'@/components/OwnRatings';import'./radical-themes.css';
type P={b:any;services:any[];hours:any[];staff:any[];staffServices:any[];staffHours:any[];gallery:any[];media:any[];blogPosts?:any[]};
const SCHEME_COLORS:Record<string,{bg:string;text:string}>={light:{bg:'#f8f7f3',text:'#171717'},dark:{bg:'#0d0d0d',text:'#f6f2e9'},warm:{bg:'#f4eadb',text:'#39261d'},natural:{bg:'#eef3ea',text:'#243328'},soft:{bg:'#fff3f7',text:'#422531'},vivid:{bg:'#fff5df',text:'#27152c'},luxury:{bg:'#14110e',text:'#f2e3c5'}};
const FAMILY_DEFAULT_SCHEME:Record<string,string>={keskin:'light',atelier:'dark',vitrin:'dark',zarafet:'light',ipek:'light'};
export default function RadicalTenantSite(p:P){const family=(p.b.selected_theme_id||'barber_keskin').split('_').at(-1),C:any={keskin:Keskin,atelier:Atelier,vitrin:Vitrin,zarafet:Zarafet,ipek:Ipek},Layout=C[family]||Keskin,cfg=p.b.published_site_config||{},mode=cfg.colorMode||'light',accent=accentHex(cfg.accentColor,p.b.primary_color),effectiveScheme=p.b.background_scheme&&p.b.background_scheme!=='theme_default'?p.b.background_scheme:(FAMILY_DEFAULT_SCHEME[family]||'light'),schemeColors=SCHEME_COLORS[effectiveScheme]||SCHEME_COLORS.light;return <div className={`radical profession-${p.b.business_type} mode-${mode} scheme-${effectiveScheme} cta-${p.b.cta_style||'solid'} cta-anim-${p.b.cta_animation||'none'} font-${p.b.font_family||'serif'}`} style={{'--accent':accent,'--brand':accent,'--bg':schemeColors.bg,'--text':schemeColors.text}as React.CSSProperties}><Layout {...p}/><WhatsApp b={p.b}/></div>}
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
const trDate=(d:string)=>new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(d));
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
/* Sabitlenmiş (sticky) video hero için: t, dış (uzun) sarmalayıcının ne kadar
   kaydırıldığına göre hesaplanır — bu sayede içerideki video, sarmalayıcı
   kaydırılırken ekranda sabit kalıp (position:sticky) sadece kare değiştirir,
   sarmalayıcının kaydırma payı bitince sayfa doğal şekilde devam eder. */
function useScrollFracPinned(){
  const ref=useRef<HTMLElement>(null);
  const[t,setT]=useState(0);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    let raf=0;
    const onScroll=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
      const scrollable=el.offsetHeight-window.innerHeight,r=el.getBoundingClientRect();
      setT(scrollable>0?Math.min(1,Math.max(0,-r.top/scrollable)):0);
    })};
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
function KsHeroVideo({t,base='/keskin/hero',cls='ksHeroPhoto'}:{t:number;base?:string;cls?:string}){
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
    const src=window.matchMedia('(max-width:800px)').matches?`${base}-m.mp4`:`${base}.mp4`;
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
  },[reduced,base]);
  useEffect(()=>{
    const v=vidRef.current;if(!v||!ready||!v.duration)return;
    const target=Math.min(t*v.duration,v.duration-0.05);
    if(Math.abs(v.currentTime-target)>0.03){try{v.currentTime=target}catch{}}
  },[t,ready]);
  return <div className={cls} style={{'--ksP':t}as React.CSSProperties} aria-hidden="true">
    <img className={`ksHeroLayer ksHeroPoster ${ready?'hide':''}`} src={`${base}-poster.jpg`} alt=""/>
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
  const posts=p.blogPosts||[];
  const[openPost,setOpenPost]=useState<any>(null);
  const{ref:heroRef,t:heroT}=useScrollFrac();
  const hmMin=(v:string)=>{const[h,m]=v.slice(0,5).split(':').map(Number);return h*60+m};
  const isOpenNow=(()=>{
    const WD:Record<string,number>={Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Istanbul',weekday:'long',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    const weekday=parts.find(x=>x.type==='weekday')?.value||'';
    const hh=Number(parts.find(x=>x.type==='hour')?.value||0),mm=Number(parts.find(x=>x.type==='minute')?.value||0);
    const dayIdx=WD[weekday]??new Date().getDay(),nowMin=hh*60+mm;
    const h=(p.hours||[]).find((x:any)=>x.day_of_week===dayIdx);
    if(!h||!h.is_open)return false;
    return nowMin>=hmMin(h.start_time)&&nowMin<hmMin(h.end_time);
  })();
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
          <a className="atBtnOutline" href="#hizmetler">Hizmetlerimiz</a>
          {b.phone&&<a className="atBtnGhost" href={`tel:${b.phone}`} aria-label="Hemen ara">📞</a>}
        </div>
        <div className="atRatingBadge"><b>★ {dec(b,'at_statRating','5.0')}</b><span>Google Maps Üzerinden ({dec(b,'at_reviewCount','150')}+ Yorum)</span></div>
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
      {!openPost?<>
        <Reveal><header><h2>{dec(b,'at_journalTitle','Bakım üzerine yazılar.')}</h2></header></Reveal>
        <div className="atJournalGrid">
          {posts.map((post:any,i:number)=><Reveal as="article" key={post.id} i={i}>
            <button type="button" onClick={()=>setOpenPost(post)}>
              <div className="atJournalCover">{post.cover_url?<img src={post.cover_url} alt={post.title}/>:<i>✂</i>}</div>
              <h3>{post.title}</h3>
              {post.published_at&&<span className="atJournalDate">{trDate(post.published_at)}</span>}
            </button>
          </Reveal>)}
        </div>
      </>:<article className="atPostArticle">
        <div className="atPostHead">
          <h1>{openPost.title}</h1>
          {openPost.published_at&&<span>{trDate(openPost.published_at)}</span>}
        </div>
        {openPost.cover_url&&<div className="atPostCover"><img src={openPost.cover_url} alt={openPost.title}/></div>}
        <div className="atPostBody">
          {(openPost.content||'').split(/\n{2,}/).map((t:string)=>t.trim()).filter(Boolean).map((par:string,i:number)=><p key={i}>{par}</p>)}
          {!openPost.content&&openPost.excerpt&&<p>{openPost.excerpt}</p>}
        </div>
        <button type="button" className="atPostBack" onClick={()=>setOpenPost(null)}>← Tüm Yazılar</button>
      </article>}
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
          <div className="atContactActions">
            {b.address&&<a className="atMapBtn" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`} target="_blank" rel="noopener noreferrer">📍 Google Maps'te Aç</a>}
            {b.phone&&<a className="atCallBtn" href={`tel:${b.phone}`}>📞 Hemen Ara</a>}
          </div>
        </div>
      </Reveal>
    </section>

    <footer className="atFooter">
      <div className="atFooterGrid">
        <div><a className="atBrand" href="#top"><b>{b.name}</b><small>{dec(b,'at_brandSubtitle','BERBER ATÖLYESİ')}</small></a><p>{dec(b,'at_footerTagline','Bakımı üniformasının bir parçası sayanlar için bir berber atölyesi.')}</p></div>
        <div><small>ÇALIŞMA SAATLERİ <span className={`atOpenBadge ${isOpenNow?'open':'closed'}`}>{isOpenNow?'● Şu An Açık':'● Kapalı'}</span></small>{hourRows.map((r,i)=><div key={i} className="atHoursRow"><span>{r.label}</span><span>{r.value}</span></div>)}</div>
        <div><small>ZİYARET</small>{b.address&&<p>{b.address}</p>}{b.phone&&<p>{b.phone}</p>}{b.instagram&&<p><a href={`https://instagram.com/${String(b.instagram).replace(/^@/,'').trim()}`} target="_blank" rel="noopener noreferrer">{b.instagram}</a></p>}</div>
      </div>
      <div className="atFooterBottom">© {new Date().getFullYear()} {b.name}</div>
    </footer>

    <div className="atMobileSticky">
      <a href="#randevu">✂ Hemen Randevu Al</a>
      {b.phone&&<a className="atMobileStickyCall" href={`tel:${b.phone}`} aria-label="Hemen ara">📞</a>}
    </div>
  </main>;
}

/* ================= Vitrin — gece vitrin ışığı, kaydırma ile ileri-geri oynayan sinematik video hero, yatay kaydırmalı galeri ================= */
function VitrinGallery({p}:{p:P}){
  const all=[...p.gallery.map(x=>({id:x.id,type:'image',url:x.image_url,alt:x.alt_text})),...p.media];
  if(!p.b.show_gallery||!all.length)return null;
  return <div className="vtGalleryStrip">
    {all.map(x=>x.type==='video'?
      <div className="vtGalleryItem" key={x.id}><video src={x.url} controls playsInline preload="metadata"/></div>:
      <div className="vtGalleryItem" key={x.id}><img src={x.url} alt={x.alt||p.b.name} loading="lazy"/></div>
    )}
  </div>;
}
function Vitrin(p:P){
  const{b}=p;
  const visibleStaff=p.staff.filter((s:any)=>!s.is_default&&s.is_active&&s.title!=='Ana Takvim'&&s.username!=='ana-takvim');
  const hourRows=groupedHourRows(p.hours||[]);
  const{ref:heroRef,t:heroT}=useScrollFracPinned();
  const spotRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=spotRef.current;if(!el)return;
    const onMove=(e:MouseEvent)=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',`${e.clientX-r.left}px`);el.style.setProperty('--my',`${e.clientY-r.top}px`)};
    el.addEventListener('mousemove',onMove);
    return()=>el.removeEventListener('mousemove',onMove);
  },[]);
  const hmMin=(v:string)=>{const[h,m]=v.slice(0,5).split(':').map(Number);return h*60+m};
  const isOpenNow=(()=>{
    const WD:Record<string,number>={Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Istanbul',weekday:'long',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    const weekday=parts.find(x=>x.type==='weekday')?.value||'';
    const hh=Number(parts.find(x=>x.type==='hour')?.value||0),mm=Number(parts.find(x=>x.type==='minute')?.value||0);
    const dayIdx=WD[weekday]??new Date().getDay(),nowMin=hh*60+mm;
    const h=(p.hours||[]).find((x:any)=>x.day_of_week===dayIdx);
    if(!h||!h.is_open)return false;
    return nowMin>=hmMin(h.start_time)&&nowMin<hmMin(h.end_time);
  })();
  return <main id="top" className="tVitrin">
    <header className="vtNav">
      <a className="vtBrand" href="#top">{b.name}</a>
      <nav>
        <a href="#hizmetler">{b.services_label||'Hizmetler'}</a>
        <a href="#vtGallery">Galeri</a>
        <a href="#randevu">Randevu</a>
      </nav>
      <a className="vtNavBtn" href="#randevu">{b.booking_button_text||'Randevu Al'}</a>
    </header>

    <section ref={heroRef as any} className="vtHeroWrap">
      <div className="vtHero">
        <KsHeroVideo t={heroT} base="/vitrin/hero" cls="vtHeroPhoto"/>
        <div className="vtHeroOverlay"/>
        <div ref={spotRef} className="vtHeroSpot"/>
        <div className="vtHeroInner">
          <h1>{b.hero_title||b.name}{b.hero_highlight&&<><br/><em>{b.hero_highlight}</em></>}</h1>
          {b.hero_description&&<p>{b.hero_description}</p>}
          <div className="vtHeroActions">
            <a className="vtBtnSolid" href="#randevu">{b.booking_button_text||'Randevu Al'} ↗</a>
            <a className="vtBtnOutline" href="#hizmetler">Hizmetlerimiz</a>
          </div>
        </div>
      </div>
    </section>

    <section className="vtMission">
      <Reveal><p>{b.description||dec(b,'vt_mission','Ustura keskin, ışık alçak, zaman senin.')}</p></Reveal>
    </section>

    <section id="hizmetler" className="vtServices">
      <Reveal><header><small>{b.services_label||'HİZMETLER'}</small><h2>{b.services_title||'Açık fiyatlarla, dürüst sürelerle.'}</h2></header></Reveal>
      <div className="vtServiceList">
        {p.services.map((s,i)=><Reveal as="article" key={s.id} i={i}>
          <span>{String(i+1).padStart(2,'0')}</span>
          <h3>{s.name}</h3>
          {s.description&&<p>{s.description}</p>}
          <footer><em>{s.duration_minutes} dk</em>{b.show_prices&&s.price!=null&&<b>₺{Number(s.price).toLocaleString('tr-TR')}</b>}</footer>
        </Reveal>)}
      </div>
    </section>

    <section id="vtGallery" className="vtGallerySection">
      <Reveal><header><small>GALERİ</small><h2>{dec(b,'vt_galleryTitle','Son çalışmalarımız.')}</h2></header></Reveal>
      <VitrinGallery p={p}/>
    </section>

    {visibleStaff.length>0&&<section className="vtTeamSection">
      <Reveal><header><small>EKİP</small><h2>{dec(b,'vt_teamTitle','Ustalarımız.')}</h2></header></Reveal>
      <div className="vtTeamList">
        {visibleStaff.map((s:any,i:number)=><Reveal as="div" className="vtTeamRow" key={s.id} i={i}>
          <b>{s.name}</b><small>{s.title||'Usta Berber'}</small>
        </Reveal>)}
      </div>
    </section>}

    <Reveal><OwnRatings businessId={b.id}/></Reveal>

    <section id="randevu" className="vtBookingSection">
      <Reveal><header><small>{b.booking_label||'RANDEVU'}</small><h2>{b.booking_title||'Saatini ayır.'}</h2></header></Reveal>
      <Reveal><AtelierBooking business={b} services={p.services} hours={p.hours} staff={p.staff} staffServices={p.staffServices} staffHours={p.staffHours}/></Reveal>
    </section>

    <footer className="vtFooter">
      <div className="vtFooterGrid">
        <div><a className="vtBrand" href="#top">{b.name}</a><p>{dec(b,'vt_footerTagline','Gece geç saatlere kadar açık bir vitrin.')}</p></div>
        <div><small>ÇALIŞMA SAATLERİ <span className={`vtOpenBadge ${isOpenNow?'open':'closed'}`}>{isOpenNow?'● Şu An Açık':'● Kapalı'}</span></small>{hourRows.map((r,i)=><div key={i} className="vtHoursRow"><span>{r.label}</span><span>{r.value}</span></div>)}</div>
        <div><small>ZİYARET</small>{b.address&&<p>{b.address}</p>}{b.phone&&<p>{b.phone}</p>}{b.instagram&&<p><a href={`https://instagram.com/${String(b.instagram).replace(/^@/,'').trim()}`} target="_blank" rel="noopener noreferrer">{b.instagram}</a></p>}</div>
      </div>
      <div className="vtFooterBottom">© {new Date().getFullYear()} {b.name}</div>
    </footer>

    <div className="vtMobileSticky">
      <a href="#randevu">✂ Hemen Randevu Al</a>
      {b.phone&&<a className="vtMobileStickyCall" href={`tel:${b.phone}`} aria-label="Hemen ara">📞</a>}
    </div>
  </main>;
}

/* ================= Zarafet — ipeksi krem zemin, altın vurgulu, jaluzi-aralık geçişli, sabitlenmiş
   kademeli galeri ve dağınık yorum kartlarıyla zarif kuaför/güzellik/nail/spa teması =================
   (kuaför/güzellik/nail/spa sektörlerinin dördü de bu bileşeni paylaşır — layout_family:'zarafet') */
function ZfOrnament(){
  return <svg className="zfOrnament" viewBox="0 0 40 40" aria-hidden="true">
    <path d="M20 4v32M4 20h32M9 9l22 22M31 9L9 31" stroke="currentColor" strokeWidth="1"/>
    <circle cx="20" cy="20" r="5" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>;
}
/* Kendi kendine akan fotoğraf şeridi — kaç fotoğraf olursa olsun ve ekran ne kadar
   geniş olursa olsun asla boş görünmesin diye, gerçekten render edilen bir setin
   genişliği ölçülüp buna göre kaç kez tekrarlanması gerektiği hesaplanıyor
   (viewport genişliği değişince de yeniden hesaplanır). Tekrar sayısı her zaman
   çift tutuluyor ki -50% dönüş noktası piksel hassasiyetinde hizalı kalsın. */
function ZfMarquee({photos,alt}:{photos:string[];alt:string}){
  const trackRef=useRef<HTMLDivElement>(null);
  const[repeats,setRepeats]=useState(2);
  useEffect(()=>{
    function recalc(){
      const el=trackRef.current;if(!el)return;
      const kids=el.children;
      if(kids.length<photos.length*2)return;
      const first=(kids[0] as HTMLElement).getBoundingClientRect().left;
      const secondSetStart=(kids[photos.length] as HTMLElement).getBoundingClientRect().left;
      const setWidth=secondSetStart-first;
      if(!setWidth||setWidth<1)return;
      /* Anımasyon yalnızca yarım genişlik kadar kayıyor (translateX(-50%)) — o yüzden
         boş görünmemesi gereken, TOPLAM genişliğin YARISI, viewport'tan uzun olmalı. */
      const needed=Math.ceil((window.innerWidth*2*1.2)/setWidth);
      const even=Math.max(4,needed%2===0?needed:needed+1);
      setRepeats(r=>r===even?r:even);
    }
    recalc();
    window.addEventListener('resize',recalc);
    return()=>window.removeEventListener('resize',recalc);
  },[photos.length,repeats]);
  return <div className="zfMissionArchRow zfMarqueeRow">
    <div className="zfMarqueeTrack" ref={trackRef}>
      {Array.from({length:repeats}).flatMap((_,rep)=>photos.map((src,i)=><div key={`${rep}-${i}`} className="zfMissionArch"><img src={src} alt={alt}/></div>))}
    </div>
  </div>;
}
function ZarafetServices({p}:{p:P}){
  const scrollerRef=useRef<HTMLDivElement>(null);
  const nudge=(dir:number)=>{const el=scrollerRef.current;if(!el)return;el.scrollBy({left:dir*el.clientWidth*.82,behavior:'smooth'})};
  if(!p.services.length)return null;
  return <section id="hizmetler" className="zfServices">
    <Reveal><header>
      <div><small>{p.b.services_label||'HİZMETLER'}</small><h2>{p.b.services_title||'Duyulara dokunan bir deneyim.'}</h2></div>
      <div className="zfCarouselNav"><button type="button" onClick={()=>nudge(-1)} aria-label="Önceki">‹</button><button type="button" onClick={()=>nudge(1)} aria-label="Sonraki">›</button></div>
    </header></Reveal>
    <div className="zfServiceScroller" ref={scrollerRef}>
      {p.services.map(s=><article key={s.id} className="zfServiceCard">
        <div className="zfServiceCardPhoto">{s.image_url?<img src={s.image_url} alt={s.name}/>:<i>✂</i>}</div>
        <h3>{s.name}</h3>
        <div className="zfServiceCardFoot"><em>{s.duration_minutes} dk</em>{p.b.show_prices&&s.price!=null&&<b>₺{Number(s.price).toLocaleString('tr-TR')}</b>}</div>
      </article>)}
    </div>
  </section>;
}
function ZarafetCollage({p}:{p:P}){
  const{ref,t}=useScrollFracPinned();
  const photos=[...p.gallery.map((x:any)=>x.image_url),...p.media.filter((m:any)=>m.type!=='video').map((m:any)=>m.url)].filter(Boolean).slice(0,5);
  if(!p.b.show_gallery||!photos.length)return null;
  const positions=[{top:'10%',left:'6%'},{top:'56%',left:'3%'},{top:'14%',right:'5%'},{top:'58%',right:'9%'},{top:'36%',left:'40%'}];
  return <section ref={ref as any} id="zfGallery" className="zfCollageWrap">
    <div className="zfCollage">
      <div className="zfCollageCenter">
        <small>GALERİ</small>
        <h2>{dec(p.b,'zf_collageTitle','Her detay, bir zevk.')}</h2>
      </div>
      {photos.map((src,i)=><div key={i} className={`zfCollagePhoto ${t>.15+i*.14?'in':''}`} style={positions[i]}><img src={src} alt=""/></div>)}
    </div>
  </section>;
}
function ZarafetReviews({businessId}:{businessId:string}){
  const[data,setData]=useState<any>(null);
  useEffect(()=>{fetch(`/api/ratings/${businessId}`).then(r=>r.json()).then(setData).catch(()=>{})},[businessId]);
  const{ref,t}=useScrollFracPinned();
  if(!data?.enabled||!data.reviews?.length)return null;
  const cards=data.reviews.slice(0,4);
  const positions=[{top:'60%',left:'6%'},{top:'8%',right:'7%'},{top:'58%',right:'4%'},{top:'10%',left:'3%'}];
  return <section ref={ref as any} className="zfReviewsWrap">
    <div className="zfReviewsPin">
      <h2>{data.count}+ müşteri<br/>memnuniyetle anlatıyor.</h2>
      {cards.map((r:any,i:number)=><div key={i} className={`zfReviewCard ${t>.15+i*.15?'in':''}`} style={positions[i]}>
        <div className="zfReviewStars">{'★'.repeat(r.stars||5)}</div>
        <b>{r.customer_name||'Müşterimiz'}</b>
        <p>"{r.comment}"</p>
      </div>)}
    </div>
  </section>;
}
function ZarafetContact({businessId,bgPhoto}:{businessId:string;bgPhoto?:string}){
  const[sent,setSent]=useState(false);
  const[sending,setSending]=useState(false);
  const[error,setError]=useState('');
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    setSending(true);setError('');
    const r=await fetch('/api/contact-messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({businessId,name:String(f.get('name')||''),message:String(f.get('message')||'')})});
    const j=await r.json();
    setSending(false);
    if(!r.ok){setError(j.error||'Mesaj gönderilemedi.');return}
    setSent(true);
  }
  return <section className="zfContact" style={bgPhoto?{backgroundImage:`url(${bgPhoto})`}:undefined}>
    <div className="zfContactOverlay"/>
    <div className="zfContactGrid">
      <Reveal className="zfContactText">
        <h2>Bize Ulaş</h2>
        <p>Bir sorun mu var, özel bir isteğin mi? Adını ve mesajını bırak, sana dönelim.</p>
      </Reveal>
      <Reveal i={1} className="zfContactFormWrap">
        {sent?<div className="zfContactSent"><span>✓</span><h3>Teşekkürler.</h3><p>Mesajın iletildi, en kısa sürede sana dönüş yapacağız.</p></div>:
        <form onSubmit={submit} className="zfContactForm">
          <input className="zfContactInput" name="name" placeholder="Adın" required maxLength={80}/>
          <textarea className="zfContactInput zfContactTextarea" name="message" placeholder="Mesajın" required maxLength={1000} rows={4}/>
          {error&&<p className="zfContactError">{error}</p>}
          <button type="submit" className="zfBtnOutline" disabled={sending}>{sending?'Gönderiliyor…':'Gönder'}</button>
        </form>}
      </Reveal>
    </div>
  </section>;
}
function Zarafet(p:P){
  const{b}=p;
  const visibleStaff=p.staff.filter((s:any)=>!s.is_default&&s.is_active&&s.title!=='Ana Takvim'&&s.username!=='ana-takvim');
  const hourRows=groupedHourRows(p.hours||[]);
  const hmMin=(v:string)=>{const[h,m]=v.slice(0,5).split(':').map(Number);return h*60+m};
  const isOpenNow=(()=>{
    const WD:Record<string,number>={Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Istanbul',weekday:'long',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    const weekday=parts.find(x=>x.type==='weekday')?.value||'';
    const hh=Number(parts.find(x=>x.type==='hour')?.value||0),mm=Number(parts.find(x=>x.type==='minute')?.value||0);
    const dayIdx=WD[weekday]??new Date().getDay(),nowMin=hh*60+mm;
    const h=(p.hours||[]).find((x:any)=>x.day_of_week===dayIdx);
    if(!h||!h.is_open)return false;
    return nowMin>=hmMin(h.start_time)&&nowMin<hmMin(h.end_time);
  })();
  const missionPhotos=(()=>{
    const raw=dec(b,'zf_missionPhoto','');
    if(!raw)return p.gallery?.[0]?.image_url?[p.gallery[0].image_url]:(b.cover_url&&b.cover_type!=='video'?[b.cover_url]:[]);
    try{const arr=JSON.parse(raw);if(Array.isArray(arr)&&arr.length)return arr}catch{}
    return[raw];
  })();
  const missionPhoto=missionPhotos[0]||'';
  return <main id="top" className="tZarafet">
    <header className="zfNav">
      <a className="zfBrand" href="#top">{b.name}</a>
      <nav>
        <a href="#top">Ana Sayfa</a>
        <a href="#hizmetler">{b.services_label||'Hizmetler'}</a>
        <a href="#zfGallery">Galeri</a>
        <a href="#randevu">Randevu</a>
      </nav>
      <a className="zfNavBtn" href="#randevu">{b.booking_button_text||'Randevu Al'}</a>
    </header>

    <section className="zfHero" style={b.cover_url&&b.cover_type!=='video'?{backgroundImage:`url(${b.cover_url})`}:undefined}>
      {b.cover_url&&b.cover_type==='video'&&<video className="zfHeroVideo" src={b.cover_url} autoPlay muted loop playsInline/>}
      <div className="zfHeroOverlay"/>
      <div className="zfHeroInner">
        <h1>{b.hero_title||b.name}{b.hero_highlight&&<><br/><em>{b.hero_highlight}</em></>}</h1>
        {b.hero_description&&<p>{b.hero_description}</p>}
        <a className="zfBtnOutline" href="#randevu">{b.booking_button_text||'Randevu Al'}</a>
      </div>
    </section>

    <section className="zfMission">
      {missionPhoto&&<div className="zfMissionGhostBg" style={{backgroundImage:`url(${missionPhoto})`}} aria-hidden="true"/>}
      <Reveal i={1}><h2>{dec(b,'zf_missionTitle','Güzellik, yaşam biçimidir.')}</h2></Reveal>
      {(b.description||dec(b,'zf_missionText',''))&&<Reveal i={2}><p>{b.description||dec(b,'zf_missionText','')}</p></Reveal>}
      {missionPhotos.length>0&&<Reveal i={3} className="zfMissionArchWrap">
        <ZfOrnament/>
        {missionPhotos.length>1?
          <ZfMarquee photos={missionPhotos} alt={b.name}/>
          :<div className="zfMissionArchRow"><div className="zfMissionArch"><img src={missionPhotos[0]} alt={b.name}/></div></div>
        }
        <ZfOrnament/>
      </Reveal>}
    </section>

    <ZarafetServices p={p}/>

    <ZarafetCollage p={p}/>

    {visibleStaff.length>0&&<section className="zfTeamSection">
      <Reveal><header><small>EKİP</small><h2>{dec(b,'zf_teamTitle','Ellerine güvenebileceğin ustalar.')}</h2></header></Reveal>
      <div className="zfTeamGrid">
        {/* Kaydırma şeridi hiç boş kalmasın diye liste tekrarlanıyor — az çalışanı olan
            işletmelerde bile şerit sonuna kadar kaydırınca boşluk görünmez. */}
        {Array.from({length:3}).flatMap((_,rep)=>visibleStaff.map((s:any,i:number)=><Reveal as="article" key={`${rep}-${s.id}`} i={i}>
          <div className="zfTeamPhoto">{s.photo_url?<img src={s.photo_url} alt={s.name}/>:<i>{s.name[0]}</i>}</div>
          <b>{s.name}</b><small>{s.title||'Uzman'}</small>
        </Reveal>))}
      </div>
    </section>}

    <ZarafetReviews businessId={b.id}/>

    <section id="randevu" className="zfBookingSection">
      <Reveal><header><small>{b.booking_label||'RANDEVU'}</small><h2>{b.booking_title||'Saatini ayır.'}</h2></header></Reveal>
      <Reveal><ZarafetBooking business={b} services={p.services} hours={p.hours} staff={p.staff} staffServices={p.staffServices} staffHours={p.staffHours}/></Reveal>
    </section>

    <ZarafetContact businessId={b.id} bgPhoto={missionPhoto}/>

    <footer className="zfFooter">
      <div className="zfFooterGrid">
        <div><a className="zfBrand" href="#top">{b.name}</a><p>{dec(b,'zf_footerTagline','Kendine ayırdığın zaman, en değerli olanıdır.')}</p></div>
        <div><small>ÇALIŞMA SAATLERİ <span className={`zfOpenBadge ${isOpenNow?'open':'closed'}`}>{isOpenNow?'● Şu An Açık':'● Kapalı'}</span></small>{hourRows.map((r,i)=><div key={i} className="zfHoursRow"><span>{r.label}</span><span>{r.value}</span></div>)}</div>
        <div><small>İLETİŞİM</small>{b.address&&<p>{b.address}</p>}{b.phone&&<p>{b.phone}</p>}{b.instagram&&<p><a href={`https://instagram.com/${String(b.instagram).replace(/^@/,'').trim()}`} target="_blank" rel="noopener noreferrer">{b.instagram}</a></p>}
          <div className="zfFooterActions">
            {b.address&&<a className="zfMapBtn" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`} target="_blank" rel="noopener noreferrer">Google Maps'te Aç</a>}
            {b.phone&&<a className="zfCallBtn" href={`tel:${b.phone}`}>Hemen Ara</a>}
          </div>
        </div>
      </div>
      <div className="zfFooterBottom">© {new Date().getFullYear()} {b.name}</div>
    </footer>

    <div className="zfMobileSticky">
      <a href="#randevu">Hemen Randevu Al</a>
      {b.phone&&<a className="zfMobileStickyCall" href={`tel:${b.phone}`} aria-label="Hemen ara">📞</a>}
    </div>
  </main>;
}

/* ================= İpek — krem/altın zemin, koyu kontrastlı süreç bölümü, foto mozaik galeri,
   yorum karuseli ve SSS akordiyonuyla kapsamlı, kurumsal güzellik salonu teması =================
   (kuaför/güzellik/nail/spa sektörlerinin dördü de bu bileşeni paylaşır — layout_family:'ipek') */
function IpekServices({p}:{p:P}){
  if(!p.services.length)return null;
  return <section id="hizmetler" className="ipServices">
    <Reveal><header><small>HİZMETLERİMİZ</small><h2>{p.b.services_title||'İhtiyacınıza uygun profesyonel çözümler.'}</h2></header></Reveal>
    <div className="ipServiceGrid">
      {p.services.map((s,i)=><Reveal as="article" key={s.id} i={i}>
        <div className="ipServiceCardPhoto">{s.image_url?<img src={s.image_url} alt={s.name}/>:<i>✂</i>}</div>
        <h3>{s.name}</h3>
        {s.description&&<p>{s.description}</p>}
        <footer><em>{s.duration_minutes} dk</em>{p.b.show_prices&&s.price!=null&&<b>₺{Number(s.price).toLocaleString('tr-TR')}</b>}</footer>
      </Reveal>)}
    </div>
  </section>;
}
function IpekProcess({b}:{b:any}){
  const steps=[
    {t:dec(b,'ip_step1Title','Ücretsiz Danışmanlık'),d:dec(b,'ip_step1Text','Randevunuzun başında uzmanımız sizi dinler; yapınızı ve beklentilerinizi değerlendirir.')},
    {t:dec(b,'ip_step2Title','Kişiye Özel Planlama'),d:dec(b,'ip_step2Text','Size özel hazırlanan bakım protokolü; hangi uygulamanın, hangi sıklıkla yapılacağını netleştirir.')},
    {t:dec(b,'ip_step3Title','Profesyonel Uygulama'),d:dec(b,'ip_step3Text','Steril ekipman ve premium ürünlerle, deneyimli ellerde gerçekleştirilen uygulama.')},
    {t:dec(b,'ip_step4Title','Bakım ve Takip'),d:dec(b,'ip_step4Text','Uygulama sonrası öneriler ve bir sonraki seans planıyla yanınızda olmaya devam ederiz.')},
  ];
  return <section className="ipProcess">
    <Reveal><header><small>NASIL ÇALIŞIYORUZ</small><h2>{dec(b,'ip_processTitle','Randevunuzdan sonuca, adım adım.')}</h2></header></Reveal>
    <div className="ipProcessGrid">
      {steps.map((s,i)=><Reveal as="article" key={i} i={i}><span>{String(i+1).padStart(2,'0')}</span><h3>{s.t}</h3><p>{s.d}</p></Reveal>)}
    </div>
  </section>;
}
function IpekStats({b}:{b:any}){
  return <section className="ipStatsBand">
    <div><b>{dec(b,'ip_stat1','2.500+')}</b><small>{dec(b,'ip_stat1Label','Mutlu Müşteri')}</small></div>
    <div><b>{dec(b,'ip_stat2','11+')}</b><small>{dec(b,'ip_stat2Label','Yıllık Deneyim')}</small></div>
    <div><b>{dec(b,'ip_stat3','12+')}</b><small>{dec(b,'ip_stat3Label','Uzman Ekip')}</small></div>
    <div><b>{dec(b,'ip_stat4','480+')}</b><small>{dec(b,'ip_stat4Label','5 Yıldız Yorum')}</small></div>
  </section>;
}
function IpekGallery({p}:{p:P}){
  const all=[...p.gallery.map((x:any)=>x.image_url),...p.media.filter((m:any)=>m.type!=='video').map((m:any)=>m.url)].filter(Boolean);
  if(!p.b.show_gallery||!all.length)return null;
  return <section id="galeri" className="ipGallerySection">
    <Reveal><header><small>GALERİ</small><h2>{dec(p.b,'ip_galleryTitle','Bizden kareler.')}</h2></header></Reveal>
    <div className="ipMasonry">
      {all.map((src,i)=><Reveal key={i} i={i%6} as="div" className="ipMasonryItem"><img src={src} alt=""/></Reveal>)}
    </div>
  </section>;
}
function IpekTestimonials({businessId}:{businessId:string}){
  const[data,setData]=useState<any>(null);
  const[page,setPage]=useState(0);
  useEffect(()=>{fetch(`/api/ratings/${businessId}`).then(r=>r.json()).then(setData).catch(()=>{})},[businessId]);
  if(!data?.enabled||!data.reviews?.length)return null;
  const perPage=3;
  const pages=Math.max(1,Math.ceil(data.reviews.length/perPage));
  return <section className="ipTestimonials">
    <Reveal><header><small>REFERANSLARIMIZ</small><h2>Müşterilerimiz ne diyor?</h2></header></Reveal>
    <div className="ipTestiViewport"><div className="ipTestiTrack" style={{transform:`translateX(-${page*100}%)`}}>
      {Array.from({length:pages}).map((_,pi)=><div className="ipTestiPage" key={pi}>
        {data.reviews.slice(pi*perPage,pi*perPage+perPage).map((r:any,i:number)=><article key={i}>
          <div className="ipStars">{'★'.repeat(r.stars||5)}</div>
          <p>"{r.comment}"</p>
          <b>{r.customer_name||'Müşterimiz'}</b>
        </article>)}
      </div>)}
    </div></div>
    {pages>1&&<div className="ipTestiDots">{Array.from({length:pages}).map((_,pi)=><button type="button" key={pi} className={page===pi?'active':''} onClick={()=>setPage(pi)} aria-label={`${pi+1}. sayfa`}/>)}</div>}
  </section>;
}
function Ipek(p:P){
  const{b}=p;
  const visibleStaff=p.staff.filter((s:any)=>!s.is_default&&s.is_active&&s.title!=='Ana Takvim'&&s.username!=='ana-takvim');
  const hourRows=groupedHourRows(p.hours||[]);
  const faq=parseFaq(dec(b,'ip_faq',''));
  const years=b.established_year?Math.max(1,new Date().getFullYear()-b.established_year):null;
  const hmMin=(v:string)=>{const[h,m]=v.slice(0,5).split(':').map(Number);return h*60+m};
  const isOpenNow=(()=>{
    const WD:Record<string,number>={Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Istanbul',weekday:'long',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    const weekday=parts.find(x=>x.type==='weekday')?.value||'';
    const hh=Number(parts.find(x=>x.type==='hour')?.value||0),mm=Number(parts.find(x=>x.type==='minute')?.value||0);
    const dayIdx=WD[weekday]??new Date().getDay(),nowMin=hh*60+mm;
    const h=(p.hours||[]).find((x:any)=>x.day_of_week===dayIdx);
    if(!h||!h.is_open)return false;
    return nowMin>=hmMin(h.start_time)&&nowMin<hmMin(h.end_time);
  })();
  let waPhone=String(b.whatsapp_phone||b.phone||'').replace(/\D/g,'');
  if(waPhone.startsWith('0'))waPhone='90'+waPhone.slice(1);
  const waUrl=waPhone?`https://wa.me/${waPhone}?text=${encodeURIComponent(b.whatsapp_message||'Merhaba, bilgi almak istiyorum.')}`:'';
  return <main id="top" className="tIpek">
    <header className="ipNav">
      <a className="ipBrand" href="#top"><b>{b.name}</b><small>{dec(b,'ip_brandSubtitle','GÜZELLİK SALONU')}</small></a>
      <nav>
        <a href="#top">Ana Sayfa</a>
        <a href="#hizmetler">Hizmetler</a>
        <a href="#hakkimizda">Hakkımızda</a>
      </nav>
      <a className="ipNavBtn" href="#randevu">{b.booking_button_text||'Randevu Al'}</a>
    </header>

    <section className="ipHero">
      <Reveal className="ipHeroText">
        <small>{b.name}</small>
        <h1>{b.hero_title||'Güzellik'}{b.hero_highlight&&<><br/><em>{b.hero_highlight}</em></>}</h1>
        {b.hero_description&&<p>{b.hero_description}</p>}
        <div className="ipHeroActions">
          <a className="ipBtnSolid" href="#hizmetler">Hizmetlerimizi Keşfet</a>
          <a className="ipBtnOutline" href="#randevu">Randevu Al</a>
        </div>
      </Reveal>
      <Reveal i={1} className="ipHeroPhoto">{b.cover_url&&b.cover_type==='video'?<video src={b.cover_url} autoPlay muted loop playsInline/>:b.cover_url?<img src={b.cover_url} alt={b.name}/>:<i>✂</i>}</Reveal>
    </section>

    <section id="hakkimizda" className="ipIntro">
      <Reveal className="ipIntroPhoto">{(p.gallery?.[0]?.image_url||b.cover_url)?<img src={p.gallery?.[0]?.image_url||b.cover_url} alt={b.name}/>:<i>✂</i>}</Reveal>
      <Reveal i={1} className="ipIntroText">
        <small>HOŞ GELDİNİZ</small>
        <h2>{dec(b,'ip_introTitle','Güzelliğin İnce Detaylarına Adanmış Bir Mekân.')}</h2>
        <p>{b.description||dec(b,'ip_introText','Her müşterimizi kendi ihtiyaçları ve beklentileriyle dinliyor; ardından yalnızca size uygun, sonuç odaklı bir bakım planı tasarlıyoruz.')}</p>
        <div className="ipIntroStats">
          <div><b>{years?`${years}+`:dec(b,'ip_statYears','10+')}</b><small>Yıllık Deneyim</small></div>
          <div><b>{visibleStaff.length||dec(b,'ip_statStaff','5+')}</b><small>Uzman Ekip</small></div>
          <div><b>{dec(b,'ip_statRating','4.9')}</b><small>Müşteri Puanı</small></div>
        </div>
      </Reveal>
    </section>

    <section className="ipFeatureRow"><div className="ipFeatureRowGrid">
      {[1,2,3,4].map(n=><Reveal as="article" key={n} i={n}>
        <h3>{dec(b,`ip_feature${n}Title`,['Profesyonel Ekip','Özenli Hizmet','Hijyenik Ortam','Premium Ürünler'][n-1])}</h3>
        <p>{dec(b,`ip_feature${n}Text`,[
          'Alanında uzman, sürekli eğitim alan ekibimizle en güncel teknikleri uyguluyoruz.',
          'Her müşterimize özel ilgi gösteriyor, ihtiyaçlarınıza uygun kişiselleştirilmiş bakım sunuyoruz.',
          'Tek kullanımlık malzemeler ve titiz dezenfeksiyon protokolleriyle sağlığınızı koruyoruz.',
          'Dünya çapında tanınan kaliteli markaların profesyonel ürünlerini tercih ediyoruz.',
        ][n-1])}</p>
      </Reveal>)}
    </div></section>

    <IpekServices p={p}/>
    <IpekProcess b={b}/>
    <IpekStats b={b}/>
    <IpekGallery p={p}/>
    <IpekTestimonials businessId={b.id}/>

    {faq.length>0&&<section className="ipFaqSection">
      <Reveal><header><small>SIKÇA SORULANLAR</small><h2>Merak edilenler.</h2></header></Reveal>
      <Reveal><Faq items={faq}/></Reveal>
    </section>}

    <section id="randevu" className="ipBookingSection">
      <Reveal><header><small>{b.booking_label||'RANDEVU'}</small><h2>{b.booking_title||'Saatini ayır.'}</h2></header></Reveal>
      <Reveal><ZarafetBooking business={b} services={p.services} hours={p.hours} staff={p.staff} staffServices={p.staffServices} staffHours={p.staffHours}/></Reveal>
    </section>

    <section className="ipCtaBand">
      <Reveal><h2>Randevu Almak İster misiniz?</h2></Reveal>
      <Reveal i={1}><p>{dec(b,'ip_ctaTagline','Güzelliğinize değer katmak için bir telefon kadar yakınız.')}</p></Reveal>
      {b.phone&&<Reveal i={2}><a className="ipCtaPhone" href={`tel:${b.phone}`}>{b.phone}</a></Reveal>}
      <Reveal i={3}><div className="ipCtaActions">
        {waUrl&&<a className="ipCtaWa" href={waUrl} target="_blank" rel="noopener noreferrer">WhatsApp ile Yazın</a>}
        {b.phone&&<a className="ipCtaCall" href={`tel:${b.phone}`}>Hemen Ara</a>}
      </div></Reveal>
    </section>

    <footer className="ipFooter">
      <div className="ipFooterGrid">
        <div>
          <a className="ipBrand" href="#top"><b>{b.name}</b></a>
          <p>{dec(b,'ip_footerTagline','Premium güzellik ve bakım hizmetleri sunan salonumuz.')}</p>
          <div className="ipSocial">
            {b.instagram&&<a href={`https://instagram.com/${String(b.instagram).replace(/^@/,'').trim()}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram">◎</a>}
            {waUrl&&<a href={waUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">✆</a>}
          </div>
        </div>
        <div><small>HIZLI LİNKLER</small><a href="#top">Ana Sayfa</a><a href="#hizmetler">Hizmetler</a><a href="#hakkimizda">Hakkımızda</a><a href="#randevu">Randevu</a></div>
        <div><small>HİZMETLERİMİZ</small>{p.services.slice(0,8).map(s=><a key={s.id} href="#hizmetler">{s.name}</a>)}</div>
        <div><small>İLETİŞİM <span className={`ipOpenBadge ${isOpenNow?'open':'closed'}`}>{isOpenNow?'● Şu An Açık':'● Kapalı'}</span></small>{b.phone&&<p>{b.phone}</p>}{b.address&&<p>{b.address}</p>}{hourRows.map((r,i)=><div key={i} className="ipHoursRow"><span>{r.label}</span><span>{r.value}</span></div>)}</div>
      </div>
      <div className="ipFooterBottom">© {new Date().getFullYear()} {b.name}. Tüm hakları saklıdır.</div>
    </footer>

    <div className="ipMobileSticky">
      <a href="#randevu">Randevu Al</a>
      {b.phone&&<a className="ipMobileStickyCall" href={`tel:${b.phone}`} aria-label="Hemen ara">📞</a>}
    </div>
  </main>;
}

function WhatsApp({b}:{b:any}){if(!b.whatsapp_enabled)return null;let n=String(b.whatsapp_phone||b.phone||'').replace(/\D/g,'');if(n.startsWith('0'))n='90'+n.slice(1);if(!n)return null;return <a className="rWhatsapp" href={`https://wa.me/${n}?text=${encodeURIComponent(b.whatsapp_message||'Merhaba')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp'tan yaz"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2m0 18.14h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.28.86 5.84 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.26 8.24m4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.24-.02-.38.11-.5.11-.11.24-.29.37-.43.12-.15.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.16 0-.43.06-.65.31-.23.24-.85.83-.85 2.03s.87 2.36.99 2.52c.12.16 1.71 2.6 4.14 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28"/></svg></a>}
function accentHex(name:string,fallback:string){return({black:'#111111',burgundy:'#7c3157',pink:'#ed5da8',purple:'#7652a6',sage:'#6f8f78',blue:'#71849c',orange:'#d8753f',gold:'#9b7b3f'}as any)[name]||fallback||'#111111'}

function dec(b:any,key:string,fallback:string){const d=b.theme_decorations||{};return Object.prototype.hasOwnProperty.call(d,key)?d[key]:fallback}
