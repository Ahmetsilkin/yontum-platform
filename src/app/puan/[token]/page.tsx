'use client';
import{useEffect,useState}from'react';
import{useParams}from'next/navigation';
import'@/components/tenant.css';

export default function RatingPage(){
  const{token}=useParams<{token:string}>();
  const[data,setData]=useState<any>(null);
  const[error,setError]=useState('');
  const[stars,setStars]=useState(0);
  const[hover,setHover]=useState(0);
  const[comment,setComment]=useState('');
  const[photo,setPhoto]=useState<File|null>(null);
  const[photoPreview,setPhotoPreview]=useState('');
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
    const fd=new FormData();
    fd.append('stars',String(stars));fd.append('comment',comment);
    if(photo)fd.append('photo',photo);
    const r=await fetch(`/api/customer/ratings/${token}`,{method:'POST',body:fd});
    const j=await r.json();
    setLoading(false);
    if(r.ok)setDone(true);else setError(j.error);
  }

  if(error&&!data)return <main className="ratingPublicPage"><section><p className="ratingError">{error}</p></section></main>;
  if(!data)return <main className="ratingPublicPage"><section><p>Yükleniyor…</p></section></main>;

  const SCHEME_COLORS:Record<string,{bg:string;text:string}>={light:{bg:'#f8f7f3',text:'#171717'},dark:{bg:'#0d0d0d',text:'#f6f2e9'},warm:{bg:'#f4eadb',text:'#39261d'},natural:{bg:'#eef3ea',text:'#243328'},soft:{bg:'#fff3f7',text:'#422531'},vivid:{bg:'#fff5df',text:'#27152c'},luxury:{bg:'#14110e',text:'#f2e3c5'}};
  const FAMILY_DEFAULT_SCHEME:Record<string,string>={zen:'light',modern:'light',editorial:'light',vitrin:'dark',mega:'dark',prestij:'light',atolye:'light',atlas:'light'};
  const b=data.appointment?.businesses||{};
  const family=(b.selected_theme_id||'modern').split('_').at(-1);
  const scheme=SCHEME_COLORS[b.background_scheme&&b.background_scheme!=='theme_default'?b.background_scheme:(FAMILY_DEFAULT_SCHEME[family as string]||'light')];
  const style={'--appointment-accent':b.primary_color||'#111','--appointment-bg':scheme?.bg||b.background_color||'#f4f4ef','--appointment-text':scheme?.text||b.text_color||'#111'}as React.CSSProperties;
  const alreadyRated=data.existingRating;

  return (
    <main className={`ratingPublicPage appointmentTheme appointment-${family} font-${b.font_family||'serif'}`} style={style}>
      <section>
        <header className="appointmentBrand appointmentBrandSimple">
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
            <label className="ratingPhotoUpload">
              {photoPreview?<img src={photoPreview} alt=""/>:<span>📷</span>}
              <small>{photoPreview?'Fotoğrafı değiştir':'Profil fotoğrafı ekle (opsiyonel)'}</small>
              <input type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files?.[0];if(f){setPhoto(f);setPhotoPreview(URL.createObjectURL(f))}}}/>
            </label>
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
