'use client';import{useState}from'react';import type{Business,Service,WorkingHour}from'@/lib/types';import{eligibleStaffFor,useBookingDays,useAvailableSlots,fetchBusyTimes,submitAppointment,type Busy}from'@/lib/booking-slots';
/* Atölye teması için tek ekranlı randevu widget'ı — TenantBooking ile aynı
   veri/mantığı (booking-slots.ts) kullanır, sadece görünümü farklı: hizmet,
   berber, gün ve saat aynı anda tek panelde. Onay bilgileri (ad/soyad/telefon)
   "Randevuyu Onayla" butonuna basılınca açılan bir modalda alınır. */
export default function AtelierBooking({business,services,hours,staff,staffServices,staffHours}:{business:Business;services:Service[];hours:WorkingHour[];staff:any[];staffServices:any[];staffHours:any[]}){
  const[service,setService]=useState<Service|null>(services[0]||null);
  const[staffId,setStaffId]=useState('any');
  const[date,setDate]=useState('');
  const[time,setTime]=useState('');
  const[busy,setBusy]=useState<Busy[]>([]);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[cancelUrl,setCancelUrl]=useState('');
  const[submitting,setSubmitting]=useState(false);
  const[modalOpen,setModalOpen]=useState(false);
  const{eligible,visibleEligible}=eligibleStaffFor(staff,staffServices,service);
  const days=useBookingDays(hours,staffHours,eligible,staffId);
  const slots=useAvailableSlots({service,date,staffId,busy,eligible,staffHours,hours,slotInterval:business.slot_interval,services});
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
  if(cancelUrl)return <div className="atBookDone"><span>✓</span><h3>Görüşmek üzere.</h3><p>{service?.name} · {trDate} · Saat {time}</p><a href={cancelUrl}>Randevuyu görüntüle veya iptal et →</a></div>;
  return <div className="atBooking">
    <div className="atBookCol">
      <small>1 — HİZMET SEÇ</small>
      <div className="atBookServiceGrid">
        {services.map(s=><button type="button" key={s.id} className={service?.id===s.id?'selected':''} onClick={()=>{setService(s);setStaffId('any');setDate('');setTime('')}}>
          <b>{s.name}</b>{business.show_prices&&s.price!=null&&<em>{Number(s.price).toLocaleString('tr-TR')} ₺</em>}
          <small>🕐 {s.duration_minutes} dk</small>
        </button>)}
      </div>
      {visibleEligible.length>0&&<><small>2 — BERBERİNİ SEÇ</small>
      <div className="atBookStaffRow">
        <button type="button" className={staffId==='any'?'selected':''} onClick={()=>setStaffId('any')}><b>Fark Etmez</b><small>İlk uygun</small></button>
        {visibleEligible.map(s=><button type="button" key={s.id} className={staffId===s.id?'selected':''} onClick={()=>setStaffId(s.id)}><b>{s.name}</b><small>{s.title||'Uzman'}</small></button>)}
      </div></>}
    </div>
    <div className="atBookCol">
      <small>3 — TARİH VE SAAT</small>
      <div className="atBookDayRow">
        {days.map(d=><button type="button" key={d.value} disabled={!d.open} className={`${date===d.value?'selected':''} ${!d.open?'closed':''}`} onClick={()=>chooseDate(d.value)}><small>{d.name.slice(0,3).toUpperCase()}</small><b>{d.n}</b></button>)}
      </div>
      <div className="atBookTimeGrid">
        {loading?<p>Yükleniyor…</p>:!date?<p>Önce bir gün seç.</p>:slots.length?slots.map(s=><button type="button" key={s} className={time===s?'selected':''} onClick={()=>setTime(s)}>{s}</button>):<p>Uygun saat kalmadı.</p>}
      </div>
    </div>
    <div className="atBookSummary">
      <span>{service?.name}{service&&` · ${service.duration_minutes} dk`}</span>
      {business.show_prices&&service?.price!=null&&<b>{Number(service.price).toLocaleString('tr-TR')} ₺</b>}
      <em>{time?`${trDate} · ${time}`:'SAAT SEÇ'}</em>
      <button type="button" className="atBookSubmit" disabled={!service||!date||!time} onClick={()=>setModalOpen(true)}>Randevuyu Onayla →</button>
    </div>
    {modalOpen&&<div className="atModalBackdrop" onClick={()=>setModalOpen(false)}>
      <div className="atModal" onClick={e=>e.stopPropagation()}>
        <button type="button" className="atModalClose" onClick={()=>setModalOpen(false)} aria-label="Kapat">✕</button>
        <h3>Randevunu onayla</h3>
        <p>{service?.name} · {trDate} · Saat {time}</p>
        <form onSubmit={submit} className="atBookForm">
          <div className="atBookFormRow">
            <input name="firstName" placeholder="Ad" required/>
            <input name="lastName" placeholder="Soyad" required/>
          </div>
          <div className="atBookFormRow">
            <input name="phone" placeholder="Telefon" required={business.booking_require_phone!==false}/>
            <input name="email" type="email" placeholder="E-posta"/>
          </div>
          {business.booking_show_note!==false&&<textarea name="note" className="atBookNote" rows={2} placeholder="Not (isteğe bağlı)"/>}
          {error&&<p className="atBookError">{error}</p>}
          <button className="atBookSubmit" disabled={submitting}>{submitting?'Gönderiliyor…':'Randevuyu Onayla →'}</button>
        </form>
      </div>
    </div>}
  </div>;
}
