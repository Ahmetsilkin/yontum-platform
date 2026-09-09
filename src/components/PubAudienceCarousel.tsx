'use client';
import{useRef,useState}from'react';
import{Scissors,Sparkles,Gem,HeartPulse,Store}from'lucide-react';
const ITEMS=[
  {icon:Scissors,title:'Berberler',color:'#0d6efd',text:'Randevu defterini bırak — müşterin telefonundan saniyeler içinde randevu alsın, sen kesime odaklan.'},
  {icon:Sparkles,title:'Kuaförler',color:'#af1763',text:'Fön, boya, bakım — her hizmete ayrı süre tanımla, çalışanlarının takvimi otomatik dolsun.'},
  {icon:Gem,title:'Nail & Kirpik Stüdyoları',color:'#198754',text:'Detaylı hizmet menünü müşterine göster, önden ödeme al, boş koltuk bırakma.'},
  {icon:HeartPulse,title:'Spa & Masaj',color:'#0dcaf0',text:'Sakin bir deneyim sunduğun kadar, arka planda düzenli bir sistemin de olsun.'},
  {icon:Store,title:'Güzellik Salonları',color:'#ffc107',text:'Birden fazla çalışan, birden fazla hizmet — hepsi tek panelde, karmaşa yok.'},
];
export default function PubAudienceCarousel(){
  const[active,setActive]=useState(2);
  const lastStep=useRef(0);
  function onWheel(e:React.WheelEvent){
    e.preventDefault();
    const now=Date.now();
    if(now-lastStep.current<380)return;
    const delta=Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX;
    if(Math.abs(delta)<4)return;
    lastStep.current=now;
    if(delta>0)setActive(a=>Math.min(a+1,ITEMS.length-1));
    else setActive(a=>Math.max(a-1,0));
  }
  return <section className="pubAudience">
    <div className="pubAudienceHead">
      <p className="pubEyebrow" style={{margin:'0 auto 16px'}}>KİMİN İÇİN</p>
      <h2>Hangi işi yapıyorsan, <em>Megsak seninle çalışır.</em></h2>
    </div>
    <div className="pubAudienceStage" onWheel={onWheel}>
      {ITEMS.map((item,i)=>{
        const offset=i-active,abs=Math.abs(offset);
        if(abs>2)return null;
        const Icon=item.icon;
        const style:React.CSSProperties={
          transform:`translateX(${offset*62}%) rotateY(${offset*-28}deg) scale(${1-abs*0.14})`,
          opacity:1-abs*0.32,
          zIndex:10-abs,
          filter:offset===0?'none':'grayscale(.35)',
        };
        return <article key={item.title} className={`pubAudienceCard${offset===0?' active':''}`} style={style} onClick={()=>setActive(i)}>
          <div className="pubAudienceIcon" style={{background:item.color+'22',color:item.color}}><Icon/></div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>;
      })}
    </div>
    <div className="pubAudienceDots">{ITEMS.map((it,i)=><button key={it.title} className={i===active?'active':''} onClick={()=>setActive(i)} aria-label={`${it.title} göster`}/>)}</div>
  </section>;
}
