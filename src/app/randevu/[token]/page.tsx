'use client';
import{useEffect,useMemo,useState}from'react';import{useParams}from'next/navigation';import Link from'next/link';import'@/components/tenant.css';

const names=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],months=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const iso=(d:Date)=>d.toLocaleDateString('en-CA');
const hm=(v:string)=>{const[h,m]=v.slice(0,5).split(':').map(Number);return h*60+m};
const fmt=(mins:number)=>`${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`;

const SCHEME_COLORS:Record<string,{bg:string;text:string}>={light:{bg:'#f8f7f3',text:'#171717'},dark:{bg:'#0d0d0d',text:'#f6f2e9'},warm:{bg:'#f4eadb',text:'#39261d'},natural:{bg:'#eef3ea',text:'#243328'},soft:{bg:'#fff3f7',text:'#422531'},vivid:{bg:'#fff5df',text:'#27152c'},luxury:{bg:'#14110e',text:'#f2e3c5'}};
const FAMILY_DEFAULT_SCHEME:Record<string,string>={luxury:'luxury',cinematic:'dark',zen:'light',modern:'light',editorial:'light'};

export default function AppointmentPage(){
  const{token}=useParams<{token:string}>();
  const[data,setData]=useState<any>(null);
  const[error,setError]=useState('');
  const[done,setDone]=useState('');
  const[reschedule,setReschedule]=useState(false);
  const[rDate,setRDate]=useState('');
  const[rTime,setRTime]=useState('');
  const[busy,setBusy]=useState<any[]>([]);
  const[slotsLoading,setSlotsLoading]=useState(false);

  function load(){
    fetch(`/api/customer/appointments/${token}`).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error);setData(j)}).catch(e=>setError(e.message));
  }
  useEffect(()=>{load()},[token]);

  async function cancel(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!confirm('Randevunuzu iptal etmek istediğinize emin misiniz?'))return;
    const reason=new FormData(e.currentTarget).get('reason');
    const r=await fetch(`/api/customer/appointments/${token}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'cancel',reason})}),j=await r.json();
    if(r.ok)setDone('Randevu iptal edildi.');else setError(j.error);
  }

  async function chooseDate(v:string){
    setRDate(v);setRTime('');setSlotsLoading(true);
    const r=await fetch(`/api/appointments?businessId=${data.business_id}&date=${v}`),j=await r.json();
    setBusy(j.busy||[]);setSlotsLoading(false);
  }

  async function confirmReschedule(){
    if(!rDate||!rTime)return;
    const r=await fetch(`/api/customer/appointments/${token}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reschedule',date:rDate,time:rTime})}),j=await r.json();
    if(r.ok){setDone('Randevu tarihi değiştirildi.');setReschedule(false);load()}else setError(j.error);
  }

  const days=useMemo(()=>{
    if(!data)return[];
    return Array.from({length:7},(_,i)=>{
      const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+i);
      const businessOpen=data.hours?.find((h:any)=>h.day_of_week===d.getDay())?.is_open;
      const own=data.staffHours?.find((h:any)=>h.day_of_week===d.getDay());
      const open=own?own.is_open:businessOpen;
      return{value:iso(d),name:names[d.getDay()],n:d.getDate(),month:months[d.getMonth()],open};
    });
  },[data]);

  const slots=useMemo(()=>{
    if(!data||!rDate)return[];
    const duration=data.services?.duration_minutes||30;
    const day=new Date(rDate+'T12:00:00').getDay();
    const own=data.staffHours?.find((h:any)=>h.day_of_week===day);
    const wh=own||data.hours?.find((h:any)=>h.day_of_week===day);
    if(!wh?.is_open)return[];
    const out=[];
    for(let m=0;m<1440;m+=15){
      const start=new Date(`${rDate}T${fmt(m)}:00+03:00`),end=new Date(start.getTime()+duration*60000);
      if(start.getTime()<Date.now()+300000)continue;
      if(m<hm(wh.start_time)||m+duration>hm(wh.end_time))continue;
      const conflict=busy.some((b:any)=>(!b.staff_id||b.staff_id===data.staff_id)&&start<new Date(b.end_at)&&end>new Date(b.start_at));
      if(!conflict)out.push(fmt(m));
    }
    return out;
  },[data,rDate,busy]);

  const b=data?.businesses||{};
  const family=(b.selected_theme_id||'modern').split('_').at(-1);
  const scheme=SCHEME_COLORS[b.background_scheme&&b.background_scheme!=='theme_default'?b.background_scheme:(FAMILY_DEFAULT_SCHEME[family as string]||'light')];
  const style={'--appointment-accent':b.primary_color||'#111','--appointment-bg':scheme?.bg||b.background_color||'#f4f4ef','--appointment-text':scheme?.text||b.text_color||'#111'}as React.CSSProperties;
  const trDate=rDate?new Intl.DateTimeFormat('tr-TR',{weekday:'long',day:'numeric',month:'long'}).format(new Date(rDate+'T12:00:00')):'';

  return (
    <main className={`appointmentPublicPage appointmentTheme appointment-${family} font-${b.font_family||'serif'}`} style={style}>
      <section>
        <header className="appointmentBrand appointmentBrandSimple"><div><small>RANDEVU YÖNETİMİ</small><b>{b.name||'Yontum'}</b></div></header>

        {!data&&!error?<p className="appointmentLoading">Randevu yükleniyor…</p>:
        error&&!data?<div className="appointmentState error"><b>Randevu açılamadı</b><p>{error}</p></div>:
        done?<div className="appointmentState success"><span>✓</span><h1>{done}</h1><p>İşleminiz başarıyla kaydedildi.</p><button onClick={()=>{setDone('');setError('')}}>Randevuya Dön</button></div>:
        data.status==='cancelled'?<div className="appointmentState cancelled"><h1>Randevu iptal edilmiş.</h1><p>{data.cancellation_reason}</p></div>:
        <>
          <div className="appointmentTitle"><small>RANDEVUNUZ</small><h1>{data.services?.name}</h1></div>
          {error&&<p className="formError">{error}</p>}
          <div className="publicAppointmentInfo">
            <p><small>İŞLETME</small><b>{b.name}</b></p>
            <p><small>ÇALIŞAN</small><b>{data.staff_profiles?.name||'İlk uygun çalışan'}</b></p>
            <p><small>TARİH VE SAAT</small><b>{new Date(data.start_at).toLocaleString('tr-TR',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/Istanbul'})}</b></p>
          </div>

          <div className="appointmentManageButtons"><button onClick={()=>setReschedule(!reschedule)}>{reschedule?'Değişiklikten Vazgeç':'Randevuyu Değiştir'}</button></div>

          {reschedule&&<div className="rescheduleForm tenantBooking">
            <h4>Yeni gün ve saat seç</h4>
            <div className="tbDays">
              {days.map(d=><button key={d.value} disabled={!d.open} className={`${rDate===d.value?'selected':''} ${!d.open?'closed':''}`} onClick={()=>chooseDate(d.value)}>
                <small>{d.name}</small><b>{d.n}</b><span>{d.month}</span>
              </button>)}
            </div>
            {rDate&&<>
              <h4>{trDate} · Uygun saatler</h4>
              <div className="tbSlots">
                {slotsLoading?<p>Yükleniyor…</p>:slots.length?slots.map(s=>
                  <button className={rTime===s?'selected':''} key={s} onClick={()=>setRTime(s)}>{s}</button>
                ):<p>Uygun saat kalmadı.</p>}
              </div>
            </>}
            <button className="tenantNext appointmentPrimary" disabled={!rTime} onClick={confirmReschedule}>Yeni Saati Kaydet</button>
          </div>}

          <form onSubmit={cancel} className="cancelForm">
            <h2>İptal etmek istiyor musunuz?</h2>
            <label className="field">İptal nedeni<textarea className="input" name="reason" rows={3} placeholder="İsteğe bağlı"/></label>
            <button className="appointmentDanger">Randevuyu İptal Et</button>
          </form>
        </>}

        <footer className="appointmentFooter">
          <Link href="/">Yontum ana sayfa</Link>
          {b.whatsapp_enabled&&b.whatsapp_phone&&<a href={`https://wa.me/${String(b.whatsapp_phone).replace(/\D/g,'').replace(/^0/,'90')}?text=${encodeURIComponent(b.whatsapp_message||'Merhaba')}`}>WhatsApp ile iletişim</a>}
        </footer>
      </section>
    </main>
  );
}
