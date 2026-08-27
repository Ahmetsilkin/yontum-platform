'use client';
import{useState}from'react';
import TenantBooking from'@/components/TenantBooking';import GoogleReviews from'@/components/GoogleReviews';import OwnRatings from'@/components/OwnRatings';import'./radical-themes.css';
type P={b:any;services:any[];hours:any[];staff:any[];staffServices:any[];staffHours:any[];gallery:any[];media:any[]};
const SCHEME_COLORS:Record<string,{bg:string;text:string}>={light:{bg:'#f8f7f3',text:'#171717'},dark:{bg:'#0d0d0d',text:'#f6f2e9'},warm:{bg:'#f4eadb',text:'#39261d'},natural:{bg:'#eef3ea',text:'#243328'},soft:{bg:'#fff3f7',text:'#422531'},vivid:{bg:'#fff5df',text:'#27152c'},luxury:{bg:'#14110e',text:'#f2e3c5'}};
const FAMILY_DEFAULT_SCHEME:Record<string,string>={fadedistrict:'dark'};
export default function RadicalTenantSite(p:P){const family=(p.b.selected_theme_id||'barber_fadedistrict').split('_').at(-1),C:any={fadedistrict:FadeDistrict},Layout=C[family]||FadeDistrict,cfg=p.b.published_site_config||{},mode=cfg.colorMode||'light',accent=accentHex(cfg.accentColor,p.b.primary_color),effectiveScheme=p.b.background_scheme&&p.b.background_scheme!=='theme_default'?p.b.background_scheme:(FAMILY_DEFAULT_SCHEME[family]||'light'),schemeColors=SCHEME_COLORS[effectiveScheme]||SCHEME_COLORS.light;return <div className={`radical profession-${p.b.business_type} mode-${mode} scheme-${effectiveScheme} cta-${p.b.cta_style||'solid'} cta-anim-${p.b.cta_animation||'none'} font-${p.b.font_family||'serif'}`} style={{'--accent':accent,'--brand':accent,'--bg':schemeColors.bg,'--text':schemeColors.text}as React.CSSProperties}><Layout {...p}/><WhatsApp b={p.b}/></div>}
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

/* ================= Fade District — koyu, spot ışıklı, altın/bakır vurgulu premium berber teması ================= */
function FadeDistrict(p:P){
  const{b}=p;
  const visibleStaff=p.staff.filter((s:any)=>!s.is_default&&s.is_active&&s.title!=='Ana Takvim'&&s.username!=='ana-takvim');
  return <main id="top" className="tFadeDistrict">
    <header className="fdNav">
      <Brand b={b}/>
      <nav>
        <a href="#top">{dec(b,'fd_navHome','Ana Sayfa')}</a>
        <a href="#hizmetler">{b.services_label||'Hizmetler'}</a>
        <a href="#fdGallery">Galeri</a>
        <a href="#fdTeam">Ekip</a>
        <a href="#randevu">Randevu</a>
        <a href="#fdContact">İletişim</a>
      </nav>
      <a className="fdBookBtn" href="#randevu">{b.booking_button_text||'Randevu Al'}</a>
    </header>
    <section className="fdHero" style={b.cover_url?{backgroundImage:`url(${b.cover_url})`}:undefined}>
      <div className="fdHeroBlur"/>
      <div className="fdHeroSpotlight"/>
      <div className="fdHeroInner">
        {b.hero_label&&<span className="fdKicker">{b.hero_label}</span>}
        <h1>{b.hero_title||dec(b,'fd_heroLine1','Keskin Kal.')}<br/><em>{b.hero_highlight||dec(b,'fd_heroLine2','Efsane Görün.')}</em></h1>
        {b.hero_description&&<p>{b.hero_description}</p>}
        <a className="fdBookBtnGlow" href="#randevu">{b.booking_button_text||'Randevu Al'} →</a>
      </div>
    </section>
    <ServiceList p={p} variant="fdMenu"/>
    <section id="fdGallery" className="fdGallerySection">
      <header><small>GALERİ</small><h2>{dec(b,'fd_galleryTitle','İşçiliğimiz')}</h2></header>
      <Gallery p={p} variant="fdGrid"/>
    </section>
    {visibleStaff.length>0&&<section id="fdTeam" className="fdTeamSection">
      <header><small>EKİP</small><h2>{dec(b,'fd_teamTitle','Ustalarımız')}</h2></header>
      <div className="fdTeamGrid">
        {visibleStaff.map((s:any)=><article key={s.id}>
          <div className="fdTeamPhoto">{s.photo_url?<img src={s.photo_url} alt={s.name}/>:<i>{s.name[0]}</i>}</div>
          <b>{s.name}</b><small>{s.title||'Usta Berber'}</small>
        </article>)}
      </div>
    </section>}
    <Booking p={p}/>
    <OwnRatings businessId={b.id}/>
    <section id="fdContact" className="fdContact">
      <div className="fdContactInner">
        <div className="fdContactText">
          <small>İLETİŞİM</small>
          <h2>{dec(b,'fd_contactTitle','Bizi Ziyaret Et')}</h2>
          {b.address&&<p className="fdContactRow">📍 {b.address}</p>}
          {b.phone&&<p className="fdContactRow">📞 {b.phone}</p>}
          {b.instagram&&<p className="fdContactRow">◎ <a href={`https://instagram.com/${String(b.instagram).replace(/^@/,'').trim()}`} target="_blank" rel="noopener noreferrer">{b.instagram}</a></p>}
        </div>
        {b.address&&<div className="fdMap"><iframe src={`https://www.google.com/maps?q=${encodeURIComponent(b.address)}&output=embed`} loading="lazy" title="Konum"/></div>}
      </div>
      <div className="fdFooterBottom"><span>{b.name}</span><span>© {new Date().getFullYear()}</span></div>
    </section>
  </main>;
}

function WhatsApp({b}:{b:any}){if(!b.whatsapp_enabled)return null;let n=String(b.whatsapp_phone||b.phone||'').replace(/\D/g,'');if(n.startsWith('0'))n='90'+n.slice(1);return n?<a className="rWhatsapp" href={`https://wa.me/${n}?text=${encodeURIComponent(b.whatsapp_message||'Merhaba')}`}>WhatsApp</a>:null}
function accentHex(name:string,fallback:string){return({black:'#111111',burgundy:'#7c3157',pink:'#ed5da8',purple:'#7652a6',sage:'#6f8f78',blue:'#71849c',orange:'#d8753f',gold:'#9b7b3f'}as any)[name]||fallback||'#111111'}

function dec(b:any,key:string,fallback:string){const d=b.theme_decorations||{};return Object.prototype.hasOwnProperty.call(d,key)?d[key]:fallback}
