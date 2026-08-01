'use client';
import{useEffect,useState}from'react';
import{useParams}from'next/navigation';

export default function RatingPage(){
  const{token}=useParams<{token:string}>();
  const[data,setData]=useState<any>(null);
  const[error,setError]=useState('');
  const[stars,setStars]=useState(0);
  const[hover,setHover]=useState(0);
  const[comment,setComment]=useState('');
  const[done,setDone]=useState(false);
  const[loading,setLoading]=useState(false);

  useEffect(()=>{
    fetch(`/api/customer/ratings/${token}`)
      .then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error);setData(j)})
      .catch(e=>setError(e.message));
  },[token]);

  async function submit(){
    if(!stars)return;
    setLoading(true);setError('');
    const r=await fetch(`/api/customer/ratings/${token}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({stars,comment})});
    const j=await r.json();
    setLoading(false);
    if(r.ok)setDone(true);else setError(j.error);
  }

  if(error&&!data)return <main className="ratingPublicPage"><section><p className="ratingError">{error}</p></section></main>;
  if(!data)return <main className="ratingPublicPage"><section><p>Yükleniyor…</p></section></main>;

  const SCHEME_COLORS:Record<string,{bg:string;text:string}>={light:{bg:'#f8f7f3',text:'#171717'},dark:{bg:'#0d0d0d',text:'#f6f2e9'},warm:{bg:'#f4eadb',text:'#39261d'},natural:{bg:'#eef3ea',text:'#243328'},soft:{bg:'#fff3f7',text:'#422531'},vivid:{bg:'#fff5df',text:'#27152c'},luxury:{bg:'#14110e',text:'#f2e3c5'}};
  const b=data.appointment?.businesses||{};
  const family=(b.selected_theme_id||'modern').split('_').at(-1);
  const scheme=SCHEME_COLORS[b.background_scheme as string];
  const style={'--appointment-accent':b.primary_color||'#111','--appointment-bg':scheme?.bg||b.background_color||'#f4f4ef','--appointment-text':scheme?.text||b.text_color||'#111'}as React.CSSProperties;
  const alreadyRated=data.existingRating;

  return (
    <main className={`ratingPublicPage appointmentTheme appointment-${family}`} style={style}>
      <section>
        <header className="appointmentBrand">
          {b.logo_url?<img src={b.logo_url} alt={b.name}/>:<i>{b.name?.[0]||'Y'}</i>}
          <div><small>DENEYİMİNİZİ PAYLAŞIN</small><h1>{b.name}</h1></div>
        </header>

        {done||alreadyRated?(
          <div className="ratingDone">
            <div className="ratingStarsReadonly">{[1,2,3,4,5].map(n=><span key={n} className={n<=(alreadyRated?.stars||stars)?'filled':''}>★</span>)}</div>
            <p>Değerlendirmeniz için teşekkür ederiz{data.appointment.customer_first_name?`, ${data.appointment.customer_first_name}`:''}!</p>
          </div>
        ):(
          <>
            <p className="ratingIntro">{data.appointment.services?.name||'Randevunuz'} hizmetini nasıl buldunuz?</p>
            <div className="ratingStarsPicker">
              {[1,2,3,4,5].map(n=>(
                <button key={n} type="button" aria-label={`${n} yıldız`}
                  className={n<=(hover||stars)?'filled':''}
                  onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
                  onClick={()=>setStars(n)}>★</button>
              ))}
            </div>
            <textarea
              className="ratingComment"
              placeholder="İsterseniz birkaç kelimeyle deneyiminizi anlatın (opsiyonel)"
              value={comment}
              onChange={e=>setComment(e.target.value.slice(0,600))}
              rows={4}
            />
            {error&&<p className="ratingError">{error}</p>}
            <button className="ratingSubmit" disabled={!stars||loading} onClick={submit}>
              {loading?'Gönderiliyor…':'Değerlendirmeyi Gönder'}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
