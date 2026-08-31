'use client';import{useState,useRef,useEffect}from'react';import type{Business,Service,WorkingHour}from'@/lib/types';import{eligibleStaffFor,useBookingDays,useAvailableSlots,fetchBusyTimes,submitAppointment,type Busy}from'@/lib/booking-slots';
/* Zarafet teması için, adımların tek tek (kaydırarak) açıldığı randevu widget'ı —
   çalışan seçimi olmadığında (visibleEligible boşsa) "uzman" adımı hiç
   gösterilmez, tarih/saat direkt hizmet seçiminin ardından açılır. */
function useStepReveal<T>(dep:T){
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(dep)ref.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[dep]);
  return ref;
}
export default function ZarafetBooking({business,services,hours,staff,staffServices,staffHours}:{business:Business;services:Service[];hours:WorkingHour[];staff:any[];staffServices:any[];staffHours:any[]}){
  const[service,setService]=useState<Service|null>(null);
  const[staffId,setStaffId]=useState('');
  const[date,setDate]=useState('');
  const[time,setTime]=useState('');
  const[busy,setBusy]=useState<Busy[]>([]);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[cancelUrl,setCancelUrl]=useState('');
  const[submitting,setSubmitting]=useState(false);
  const[modalOpen,setModalOpen]=useState(false);
  const{eligible,visibleEligible}=eligibleStaffFor(staff,staffServices,service);
  const needsStaffStep=visibleEligible.length>0;
  const staffDone=!!staffId;
  const days=useBookingDays(hours,staffHours,eligible,staffId||'any');
  const slots=useAvailableSlots({service,date,staffId:staffId||'any',busy,eligible,staffHours,hours,slotInterval:business.slot_interval,services});
  const staffRef=useStepReveal(service&&needsStaffStep);
  const dateRef=useStepReveal(service&&staffDone);
  const summaryRef=useStepReveal(!!time);
  function chooseService(s:Service){setService(s);const{visibleEligible:ve}=eligibleStaffFor(staff,staffServices,s);setStaffId(ve.length?'':'any');setDate('');setTime('')}
  async function chooseDate(v:string){setDate(v);setTime('');setLoading(true);setBusy(await fetchBusyTimes(business.id,v));setLoading(false)}
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();if(!service||!date||!time)return;
    setSubmitting(true);setError('');
    const f=new FormData(e.currentTarget);
    const{ok,json:j}=await submitAppointment(business.id,{serviceId:service.id,staffId:staffId==='any'?null:staffId,date,time,firstName:String(f.get('firstName')||''),lastName:String(f.get('lastName')||''),phone:String(f.get('phone')||''),email:String(f.get('email')||''),note:String(f.get('note')||'')});
    setSubmitting(false);
    if(!ok){setError(j.error)}else{setModalOpen(false);setCancelUrl(j.cancelUrl)}
  }
  const trDate=date?new Intl.DateTimeFormat('tr-TR',{weekday:'long',day:'numeric',month:'long'}).format(new Date(date+'T12:00:00')):'';
  if(cancelUrl)return <div className="zfBookDone"><span>✓</span><h3>Görüşmek üzere.</h3><p>{service?.name} · {trDate} · Saat {time}</p><a href={cancelUrl}>Randevuyu görüntüle veya iptal et →</a></div>;
  return <div className="zfBooking">
    <div className="zfBookStep">
      <small>1 — HİZMET SEÇ</small>
      <div className="zfBookServiceGrid">
        {services.map(s=><button type="button" key={s.id} className={service?.id===s.id?'selected':''} onClick={()=>chooseService(s)}>
          <b>{s.name}</b>{business.show_prices&&s.price!=null&&<em>{Number(s.price).toLocaleString('tr-TR')} ₺</em>}
          <small>🕐 {s.duration_minutes} dk</small>
        </button>)}
      </div>
    </div>

    {service&&needsStaffStep&&<div className="zfBookStep zfBookStepIn" ref={staffRef}>
      <small>2 — UZMANINI SEÇ</small>
      <div className="zfBookStaffRow">
        <button type="button" className={staffId==='any'?'selected':''} onClick={()=>setStaffId('any')}><b>Fark Etmez</b><small>İlk uygun</small></button>
        {visibleEligible.map(s=><button type="button" key={s.id} className={staffId===s.id?'selected':''} onClick={()=>setStaffId(s.id)}><b>{s.name}</b><small>{s.title||'Uzman'}</small></button>)}
      </div>
    </div>}

    {service&&staffDone&&<div className="zfBookStep zfBookStepIn" ref={dateRef}>
      <small>{needsStaffStep?'3':'2'} — TARİH VE SAAT</small>
      <div className="zfBookDayRow">
        {days.map(d=><button type="button" key={d.value} disabled={!d.open} className={`${date===d.value?'selected':''} ${!d.open?'closed':''}`} onClick={()=>chooseDate(d.value)}><small>{d.name.slice(0,3).toUpperCase()}</small><b>{d.n}</b></button>)}
      </div>
      <div className="zfBookTimeGrid">
        {loading?<p>Yükleniyor…</p>:!date?<p>Önce bir gün seç.</p>:slots.length?slots.map(s=><button type="button" key={s} className={time===s?'selected':''} onClick={()=>setTime(s)}>{s}</button>):<p>Uygun saat kalmadı.</p>}
      </div>
    </div>}

    {time&&<div className="zfBookSummary zfBookStepIn" ref={summaryRef}>
      <span>{service?.name}{service&&` · ${service.duration_minutes} dk`}</span>
      {business.show_prices&&service?.price!=null&&<b>{Number(service.price).toLocaleString('tr-TR')} ₺</b>}
      <em>{trDate} · {time}</em>
      <button type="button" className="zfBookSubmit" onClick={()=>setModalOpen(true)}>Randevuyu Onayla →</button>
    </div>}

    {modalOpen&&<div className="zfModalBackdrop" onClick={()=>setModalOpen(false)}>
      <div className="zfModal" onClick={e=>e.stopPropagation()}>
        <button type="button" className="zfModalClose" onClick={()=>setModalOpen(false)} aria-label="Kapat">✕</button>
        <h3>Randevunu onayla</h3>
        <p>{service?.name} · {trDate} · Saat {time}</p>
        <form onSubmit={submit} className="zfBookForm">
          <div className="zfBookFormRow">
            <input name="firstName" placeholder="Ad" required/>
            <input name="lastName" placeholder="Soyad" required/>
          </div>
          <div className="zfBookFormRow">
            <input name="phone" placeholder="Telefon" required={business.booking_require_phone!==false}/>
            <input name="email" type="email" placeholder="E-posta"/>
          </div>
          {business.booking_show_note!==false&&<textarea name="note" className="zfBookNote" rows={2} placeholder="Not (isteğe bağlı)"/>}
          {error&&<p className="zfBookError">{error}</p>}
          <button className="zfBookSubmit" disabled={submitting}>{submitting?'Gönderiliyor…':'Randevuyu Onayla →'}</button>
        </form>
      </div>
    </div>}
  </div>;
}
