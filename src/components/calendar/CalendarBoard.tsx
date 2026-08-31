'use client';
import{useEffect,useMemo,useRef,useState}from'react';
import{createClient}from'@/lib/supabase-browser';
import{Calendar,dateFnsLocalizer,Views}from'react-big-calendar';
import withDragAndDrop from'react-big-calendar/lib/addons/dragAndDrop';
import{format,parse,startOfWeek,getDay}from'date-fns';
import{tr}from'date-fns/locale';
import type{Appointment}from'@/lib/types';
import{Phone,MessageCircle,X,Check,Ban,ChevronLeft,ChevronRight,Loader2}from'lucide-react';
import'react-big-calendar/lib/css/react-big-calendar.css';
import'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import'@/app/admin-modern.css';
import'./calendar-board.css';

const localizer=dateFnsLocalizer({format,parse,startOfWeek:()=>startOfWeek(new Date(),{weekStartsOn:1}),getDay,locales:{tr}});
const DnDCalendar=withDragAndDrop(Calendar as any) as any;
const MIN_TIME=new Date(1970,0,1,8,0),MAX_TIME=new Date(1970,0,1,22,0);
const SERVICE_COLORS=['#e0955a','#5b8c6e','#5c80bc','#c76b98','#c9a13b','#8069b0','#4bab9e','#c1666b','#4f8fb0','#7a9e4f','#b0724f','#5d6bc9'];
function waPhone(raw:string){let p=String(raw||'').replace(/\D/g,'');if(p.startsWith('0'))p='90'+p.slice(1);if(p&&!p.startsWith('90')&&p.length===10)p='90'+p;return p}
/* "Ana Takvim" işletmenin kendi otomatik takvim kaydıdır, gerçek bir çalışan
   değildir; davet gönderilmemiş (user_id'siz) gerçek çalışanlar da yanlışlıkla
   elenmesin diye dedup sadece gerçek user_id çakışmasında devreye giriyor. */
function visibleStaffList(staff:any[]){
  return staff.filter((s:any,i:number)=>!s.is_default&&s.title!=='Ana Takvim'&&s.username!=='ana-takvim'&&staff.findIndex((x:any)=>s.user_id?x.user_id===s.user_id:x.id===s.id)===i);
}

type CalEvent={id:string;title:string;start:Date;end:Date;resourceId:string;appointment:Appointment};
type Pending={appointmentId:string;oldStart:Date;oldEnd:Date;oldResourceId:string;newStart:Date;newEnd:Date;newResourceId:string};

const db=createClient();

export default function CalendarBoard({businessId}:{businessId:string}){
  const[business,setBusiness]=useState<any>(null);
  const[staffList,setStaffList]=useState<any[]>([]);
  const[services,setServices]=useState<any[]>([]);
  const[appointments,setAppointments]=useState<Appointment[]>([]);
  const[loading,setLoading]=useState(true);
  const[tabMode,setTabMode]=useState<'day'|'week'|'resource'>('day');
  const[date,setDate]=useState(new Date());
  const[pending,setPending]=useState<Pending|null>(null);
  const[applying,setApplying]=useState(false);
  const[selected,setSelected]=useState<CalEvent|null>(null);
  const[toastMsg,setToastMsg]=useState('');
  const toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);

  function toast(t:string){setToastMsg(t);if(toastTimer.current)clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToastMsg(''),3200)}

  async function load(silent?:boolean){
    if(!silent)setLoading(true);
    const[b,st,sv,ap]=await Promise.all([
      db.from('businesses').select('*').eq('id',businessId).single(),
      db.from('staff_profiles').select('*').eq('business_id',businessId).order('sort_order'),
      db.from('services').select('*').eq('business_id',businessId).order('sort_order'),
      db.from('appointments').select('*,services(name,duration_minutes),staff_profiles(name)').eq('business_id',businessId).neq('status','cancelled').order('start_at'),
    ]);
    setBusiness(b.data);setStaffList(st.data||[]);setServices(sv.data||[]);setAppointments((ap.data as Appointment[])||[]);
    setLoading(false);
  }
  useEffect(()=>{load()},[businessId]);
  useEffect(()=>{
    let t:ReturnType<typeof setTimeout>|null=null;
    const channel=db.channel(`calendar-${businessId}`).on('postgres_changes',{event:'*',schema:'public',table:'appointments',filter:`business_id=eq.${businessId}`},()=>{if(t)clearTimeout(t);t=setTimeout(()=>load(true),1000)}).subscribe();
    return()=>{if(t)clearTimeout(t);db.removeChannel(channel)};
  },[businessId]);

  const resources=useMemo(()=>visibleStaffList(staffList).map(s=>({resourceId:s.id,resourceTitle:s.name})),[staffList]);
  const events=useMemo<CalEvent[]>(()=>appointments.map(a=>({id:a.id,title:`${a.customer_first_name} ${a.customer_last_name}`,start:new Date(a.start_at),end:new Date(a.end_at),resourceId:a.staff_id||'__unassigned',appointment:a})),[appointments]);
  // Renk, servisin id'sinden hash'lenmiyor (az sayıda renkle çakışma çok olası
  // oluyordu) — bunun yerine işletmenin hizmet listesindeki SIRAYA göre veriliyor,
  // böylece aynı işletmedeki farklı hizmetler palet bitene kadar hep farklı renk alır.
  const serviceColorMap=useMemo(()=>{const m=new Map<string,string>();services.forEach((s,i)=>m.set(s.id,SERVICE_COLORS[i%SERVICE_COLORS.length]));return m},[services]);

  const today=new Date().toLocaleDateString('en-CA');
  const todaysAppointments=useMemo(()=>appointments.filter(a=>a.start_at.slice(0,10)===today),[appointments,today]);
  const expectedRevenue=todaysAppointments.reduce((n,a)=>n+Number(a.total_price||0),0);

  function eventPropGetter(event:CalEvent){
    const bg=serviceColorMap.get(event.appointment.service_id)||'#8a8a8a';
    return{style:{backgroundColor:bg,borderColor:bg,opacity:event.appointment.status==='completed'?0.55:1}};
  }

  function applyOptimistic(id:string,startAt:string,endAt:string,staffId:string|null){
    setAppointments(prev=>prev.map(a=>a.id===id?{...a,start_at:startAt,end_at:endAt,staff_id:staffId??a.staff_id}:a));
  }
  function handleMove({event,start,end,resourceId}:{event:CalEvent;start:Date;end:Date;resourceId?:string}){
    const oldResourceId=event.resourceId,newResourceId=resourceId||event.resourceId;
    applyOptimistic(event.id,start.toISOString(),end.toISOString(),newResourceId!=='__unassigned'?newResourceId:null);
    setPending({appointmentId:event.id,oldStart:event.start,oldEnd:event.end,oldResourceId,newStart:start,newEnd:end,newResourceId});
  }
  function revertPending(p:Pending){
    applyOptimistic(p.appointmentId,p.oldStart.toISOString(),p.oldEnd.toISOString(),p.oldResourceId!=='__unassigned'?p.oldResourceId:null);
  }
  function cancelPending(){if(pending)revertPending(pending);setPending(null)}

  async function commitPending(sendWhatsapp:boolean){
    if(!pending)return;
    setApplying(true);
    const patch:any={start_at:pending.newStart.toISOString(),end_at:pending.newEnd.toISOString(),previous_start_at:pending.oldStart.toISOString(),previous_end_at:pending.oldEnd.toISOString(),rescheduled_at:new Date().toISOString(),updated_at:new Date().toISOString()};
    if(pending.newResourceId!==pending.oldResourceId&&pending.newResourceId!=='__unassigned')patch.staff_id=pending.newResourceId;
    const{error}=await db.from('appointments').update(patch).eq('id',pending.appointmentId);
    if(error){
      revertPending(pending);
      toast(error.code==='23P01'?'Bu saatte çalışanın başka randevusu var, taşınamadı.':'Randevu güncellenemedi.');
      setApplying(false);setPending(null);return;
    }
    toast('Randevu güncellendi.');
    if(sendWhatsapp){
      const r=await fetch('/api/whatsapp/notify-reschedule',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appointmentId:pending.appointmentId})}).catch(()=>null);
      toast(r&&r.ok?'WhatsApp mesajı kuyruğa eklendi, birazdan gidecek.':'Randevu güncellendi ama WhatsApp mesajı kuyruğa eklenemedi.');
    }
    setApplying(false);setPending(null);
  }

  async function patchStatus(id:string,body:any){
    const r=await fetch(`/api/admin/appointments/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const j=await r.json().catch(()=>({}));
    if(!r.ok){toast(j.error||'İşlem yapılamadı.');return false}
    await load(true);return true;
  }
  async function completeSelected(){if(!selected)return;if(await patchStatus(selected.id,{action:'status',status:'completed'})){toast('Randevu tamamlandı.');setSelected(null)}}
  async function cancelSelected(){if(!selected)return;const reason=prompt('İptal nedeni (müşteriye gösterilir):','İşletme tarafından iptal edildi.');if(reason==null)return;if(await patchStatus(selected.id,{action:'cancel',reason})){toast('Randevu iptal edildi.');setSelected(null)}}

  const rbcView=tabMode==='resource'?Views.DAY:tabMode;
  const rbcResources=tabMode==='resource'?resources:undefined;

  function shiftDate(days:number){const d=new Date(date);d.setDate(d.getDate()+days);setDate(d)}
  const dateLabel=tabMode==='week'
    ?`${startOfWeek(date,{weekStartsOn:1}).toLocaleDateString('tr-TR',{day:'2-digit',month:'short'})} haftası`
    :date.toLocaleDateString('tr-TR',{weekday:'long',day:'2-digit',month:'long'});

  if(loading)return <div className="calBoardLoading">Takvim hazırlanıyor…</div>;

  return <div className="calBoard">
    <header className="calBoardHead">
      <div className="calBoardTabs">
        <button className={tabMode==='day'?'active':''} onClick={()=>setTabMode('day')}>Günlük</button>
        <button className={tabMode==='week'?'active':''} onClick={()=>setTabMode('week')}>Haftalık</button>
        <button className={tabMode==='resource'?'active':''} onClick={()=>setTabMode('resource')}>Usta Bazlı</button>
      </div>
      <div className="calBoardBadges">
        <div className="calBadge"><small>BUGÜNKÜ BEKLENEN CİRO</small><b>{expectedRevenue.toLocaleString('tr-TR')} ₺</b></div>
        <div className="calBadge"><small>BUGÜNKÜ RANDEVU</small><b>{todaysAppointments.length}</b></div>
      </div>
    </header>

    <div className="calBoardNav">
      <button onClick={()=>shiftDate(tabMode==='week'?-7:-1)} aria-label="Önceki"><ChevronLeft size={18}/></button>
      <span>{dateLabel}</span>
      <button onClick={()=>shiftDate(tabMode==='week'?7:1)} aria-label="Sonraki"><ChevronRight size={18}/></button>
      <button className="calBoardToday" onClick={()=>setDate(new Date())}>Bugün</button>
      <div className="calLegend">{services.map(s=><span key={s.id}><i style={{background:serviceColorMap.get(s.id)}}/>{s.name}</span>)}</div>
    </div>

    <div className="calBoardCalendarWrap">
      <DnDCalendar
        localizer={localizer}
        culture="tr"
        events={events}
        date={date}
        onNavigate={setDate}
        view={rbcView}
        onView={()=>{}}
        views={[rbcView]}
        toolbar={false}
        min={MIN_TIME}
        max={MAX_TIME}
        step={15}
        timeslots={2}
        resources={rbcResources}
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        eventPropGetter={eventPropGetter}
        onEventDrop={handleMove}
        onEventResize={handleMove}
        onSelectEvent={(e:CalEvent)=>setSelected(e)}
        resizable
        popup
        style={{height:'72vh'}}
      />
    </div>

    {pending&&<div className="calModalBackdrop" onClick={applying?undefined:cancelPending}>
      <div className="calModal" onClick={e=>e.stopPropagation()}>
        <button className="calModalX" onClick={cancelPending} disabled={applying} aria-label="Vazgeç"><X size={16}/></button>
        <h3>Randevu saati değişti</h3>
        <p>
          <b>{pending.oldStart.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</b>
          {' → '}
          <b>{pending.newStart.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</b>
          {' '}olarak değiştirildi. Müşteriye bildirim gitsin mi?
        </p>
        <div className="calModalActions">
          <button className="calBtnPrimary" disabled={applying} onClick={()=>commitPending(true)}>{applying?<Loader2 className="spin" size={16}/>:<MessageCircle size={16}/>} Evet, WhatsApp Gönder</button>
          <button className="calBtnGhost" disabled={applying} onClick={()=>commitPending(false)}>Sadece Takvimi Güncelle</button>
        </div>
      </div>
    </div>}

    {selected&&<div className="calDrawerBackdrop" onClick={()=>setSelected(null)}>
      <div className="calDrawer" onClick={e=>e.stopPropagation()}>
        <button className="calModalX" onClick={()=>setSelected(null)} aria-label="Kapat"><X size={16}/></button>
        <small className="calDrawerOverline">RANDEVU</small>
        <h3>{selected.appointment.customer_first_name} {selected.appointment.customer_last_name}</h3>
        <div className="calDrawerRow"><span>Hizmet</span><b>{selected.appointment.services?.name||'—'}</b></div>
        <div className="calDrawerRow"><span>Çalışan</span><b>{selected.appointment.staff_profiles?.name||selected.appointment.staff_name_snapshot||'Atanmamış'}</b></div>
        <div className="calDrawerRow"><span>Tarih</span><b>{selected.start.toLocaleString('tr-TR',{dateStyle:'long',timeStyle:'short'})}</b></div>
        <div className="calDrawerRow"><span>Tutar</span><b>{selected.appointment.total_price!=null?`${Number(selected.appointment.total_price).toLocaleString('tr-TR')} ₺`:'—'}</b></div>
        {selected.appointment.customer_note&&<div className="calDrawerNote">📝 {selected.appointment.customer_note}</div>}
        <div className="calDrawerContact">
          <a href={`tel:${selected.appointment.customer_phone}`}><Phone size={16}/> Ara</a>
          <a href={`https://wa.me/${waPhone(selected.appointment.customer_phone)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/> WhatsApp</a>
        </div>
        {selected.appointment.status!=='completed'&&selected.appointment.status!=='no_show'&&<div className="calDrawerActions">
          <button className="calBtnPrimary" onClick={completeSelected}><Check size={16}/> Ödeme Al / Tamamla</button>
          <button className="calBtnDanger" onClick={cancelSelected}><Ban size={16}/> İptal Et</button>
        </div>}
      </div>
    </div>}

    {toastMsg&&<div className="calToast">{toastMsg}</div>}
  </div>;
}
