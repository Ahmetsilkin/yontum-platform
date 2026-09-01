'use client';import{useEffect,useMemo,useRef,useState}from'react';import type{Appointment}from'@/lib/types';import{createClient}from'@/lib/supabase-browser';import{Phone,MessageCircle,X,Check,Ban,Loader2}from'lucide-react';import'./day-schedule.css';

const dayNames=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],monthNames=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const SERVICE_COLORS=['#e0955a','#5b8c6e','#5c80bc','#c76b98','#c9a13b','#8069b0','#4bab9e','#c1666b','#4f8fb0','#7a9e4f','#b0724f','#5d6bc9'];
function waPhone(raw:string){let p=String(raw||'').replace(/\D/g,'');if(p.startsWith('0'))p='90'+p.slice(1);if(p&&!p.startsWith('90')&&p.length===10)p='90'+p;return p}

/* Çalışan sütunları — her çalışanın randevuları kendi sütununda üst üste,
   diğer çalışanınkiler yan sütunda gösterilir. "Ana Takvim" işletmenin kendi
   otomatik takvim kaydıdır, gerçek bir çalışan değildir; davet gönderilmemiş
   (user_id'siz) gerçek çalışanlar da yanlışlıkla elenmesin diye dedup sadece
   gerçek user_id çakışmasında devreye giriyor. */
function visibleStaffList(staff:any[]){
  return staff.filter((s:any,i:number)=>!s.is_default&&s.title!=='Ana Takvim'&&s.username!=='ana-takvim'&&staff.findIndex((x:any)=>s.user_id?x.user_id===s.user_id:x.id===s.id)===i);
}
function staffColumns(staff:any[],staffId:string){
  const visible=visibleStaffList(staff);
  const base=staffId==='all'?visible:visible.filter(s=>s.id===staffId);
  return base.map(s=>({id:s.id,name:s.name,matchIds:new Set([s.id,...staff.filter((x:any)=>s.user_id&&x.user_id===s.user_id).map((x:any)=>x.id)])}));
}

type Pending={appointmentId:string;oldStart:Date;oldEnd:Date;oldResourceId:string;newStart:Date;newEnd:Date;newResourceId:string};
const db=createClient();

export default function DaySchedule({appointments,staff,services,businessId}:{appointments:Appointment[];staff:any[];services:any[];businessId:string}){
  const today=new Date().toLocaleDateString('en-CA'),[date,setDate]=useState(today),[staffId,setStaffId]=useState('all');
  const[localAppts,setLocalAppts]=useState(appointments);
  useEffect(()=>{setLocalAppts(appointments)},[appointments]);
  const scheduleDays=useMemo(()=>Array.from({length:22},(_,i)=>{
    const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-7+i);
    return{value:d.toLocaleDateString('en-CA'),name:dayNames[d.getDay()],n:d.getDate(),month:monthNames[d.getMonth()],isToday:d.toLocaleDateString('en-CA')===today};
  }),[today]);
  const list=useMemo(()=>{
    const target=staff.find(s=>s.id===staffId),matchIds=staffId==='all'?null:new Set([staffId,...(target?.user_id?staff.filter((s:any)=>s.user_id===target.user_id).map((s:any)=>s.id):[])]);
    return localAppts.filter(a=>a.start_at.slice(0,10)===date&&a.status!=='cancelled'&&(!matchIds||matchIds.has(a.staff_id))).sort((a,b)=>a.start_at.localeCompare(b.start_at));
  },[localAppts,date,staffId,staff]);
  const columns=useMemo(()=>staffColumns(staff,staffId),[staff,staffId]);
  const hasUnassigned=useMemo(()=>staffId==='all'&&list.some(a=>!columns.some(c=>c.matchIds.has(a.staff_id))),[list,columns,staffId]);
  const allColumns=hasUnassigned?[...columns,{id:'__unassigned',name:'Atanmamış',matchIds:new Set<string>()}]:columns;
  const hours=Array.from({length:15},(_,i)=>i+7);
  const pickerRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const todayBtn=pickerRef.current?.querySelector<HTMLButtonElement>('button.today');
    todayBtn?.scrollIntoView({block:'nearest',inline:'start'});
  },[]);
  const gridStyle={'--staff-cols':allColumns.length||1}as React.CSSProperties;

  const serviceColorMap=useMemo(()=>{const m=new Map<string,string>();services.forEach((s,i)=>m.set(s.id,SERVICE_COLORS[i%SERVICE_COLORS.length]));return m},[services]);
  const todaysAppointments=useMemo(()=>localAppts.filter(a=>a.status!=='cancelled'&&a.start_at.slice(0,10)===today),[localAppts,today]);
  const todaysRevenue=todaysAppointments.reduce((n,a)=>n+Number(a.total_price||0),0);

  const[selected,setSelected]=useState<Appointment|null>(null);
  const[pending,setPending]=useState<Pending|null>(null);
  const[applying,setApplying]=useState(false);
  const[toastMsg,setToastMsg]=useState('');
  const toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  function toast(t:string){setToastMsg(t);if(toastTimer.current)clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToastMsg(''),3200)}
  const dragRef=useRef<{id:string;durationMs:number}|null>(null);
  // Dokunmatik (mobil) sürükleme — native HTML5 draggable/onDrop parmakla
  // çalışmıyor, bu yüzden touchstart/move/end'i kendimiz yönetiyoruz.
  const touchRef=useRef<{id:string;durationMs:number;startX:number;startY:number;dragging:boolean}|null>(null);
  const[touchDragId,setTouchDragId]=useState<string|null>(null);
  const[touchHoverKey,setTouchHoverKey]=useState<string|null>(null);

  function applyOptimistic(id:string,startAt:string,endAt:string,newStaffId:string|null){
    setLocalAppts(prev=>prev.map(a=>a.id===id?{...a,start_at:startAt,end_at:endAt,staff_id:newStaffId??a.staff_id}:a));
  }
  function revertPending(p:Pending){applyOptimistic(p.appointmentId,p.oldStart.toISOString(),p.oldEnd.toISOString(),p.oldResourceId!=='__unassigned'?p.oldResourceId:null)}
  function cancelPending(){if(pending)revertPending(pending);setPending(null)}

  function computeNewStart(hour:number,offsetY:number,cellHeight:number){
    const minuteInHour=Math.round((offsetY/cellHeight)*60/15)*15;
    const newStart=new Date(`${date}T${String(hour).padStart(2,'0')}:00:00+03:00`);
    newStart.setMinutes(minuteInHour===60?0:minuteInHour);
    if(minuteInHour===60)newStart.setHours(newStart.getHours()+1);
    return newStart;
  }
  function finalizeMove(id:string,columnId:string,newStart:Date,durationMs:number){
    const a=localAppts.find(x=>x.id===id);
    if(!a)return;
    const newEnd=new Date(newStart.getTime()+durationMs);
    const oldStart=new Date(a.start_at),oldEnd=new Date(a.end_at),oldResourceId=a.staff_id||'__unassigned';
    if(newStart.getTime()===oldStart.getTime()&&columnId===oldResourceId)return;
    applyOptimistic(a.id,newStart.toISOString(),newEnd.toISOString(),columnId!=='__unassigned'?columnId:null);
    setPending({appointmentId:a.id,oldStart,oldEnd,oldResourceId,newStart,newEnd,newResourceId:columnId});
  }

  function onDrop(e:React.DragEvent<HTMLDivElement>,columnId:string,hour:number){
    e.preventDefault();
    const drag=dragRef.current;dragRef.current=null;
    if(!drag)return;
    const rect=(e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const offsetY=Math.min(Math.max(e.clientY-rect.top,0),rect.height);
    finalizeMove(drag.id,columnId,computeNewStart(hour,offsetY,rect.height),drag.durationMs);
  }

  function onCardTouchStart(e:React.TouchEvent,a:Appointment){
    const t=e.touches[0];
    touchRef.current={id:a.id,durationMs:new Date(a.end_at).getTime()-new Date(a.start_at).getTime(),startX:t.clientX,startY:t.clientY,dragging:false};
  }
  function onCardTouchMove(e:React.TouchEvent){
    const st=touchRef.current;if(!st)return;
    const t=e.touches[0];
    if(!st.dragging){
      if(Math.abs(t.clientX-st.startX)<10&&Math.abs(t.clientY-st.startY)<10)return;
      st.dragging=true;setTouchDragId(st.id);
    }
    e.preventDefault();
    const el=document.elementFromPoint(t.clientX,t.clientY);
    const cell=el?.closest<HTMLElement>('.staffCell');
    setTouchHoverKey(cell?`${cell.dataset.col}|${cell.dataset.hour}`:null);
  }
  function onCardTouchEnd(e:React.TouchEvent){
    const st=touchRef.current;touchRef.current=null;
    setTouchDragId(null);setTouchHoverKey(null);
    if(!st||!st.dragging)return;
    const t=e.changedTouches[0];
    const el=document.elementFromPoint(t.clientX,t.clientY);
    const cell=el?.closest<HTMLElement>('.staffCell');
    if(!cell)return;
    const columnId=cell.dataset.col||'__unassigned',hour=Number(cell.dataset.hour);
    const rect=cell.getBoundingClientRect();
    const offsetY=Math.min(Math.max(t.clientY-rect.top,0),rect.height);
    finalizeMove(st.id,columnId,computeNewStart(hour,offsetY,rect.height),st.durationMs);
  }

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
    return true;
  }
  async function completeSelected(){if(!selected)return;if(await patchStatus(selected.id,{action:'status',status:'completed'})){toast('Randevu tamamlandı.');setLocalAppts(prev=>prev.map(a=>a.id===selected.id?{...a,status:'completed'}:a));setSelected(null)}}
  async function cancelSelected(){if(!selected)return;const reason=prompt('İptal nedeni (müşteriye gösterilir):','İşletme tarafından iptal edildi.');if(reason==null)return;if(await patchStatus(selected.id,{action:'cancel',reason})){toast('Randevu iptal edildi.');setLocalAppts(prev=>prev.filter(a=>a.id!==selected.id));setSelected(null)}}

  function apptCard(a:Appointment){
    const bg=serviceColorMap.get(a.service_id);
    return <article key={a.id} className={`status-${a.status}${touchDragId===a.id?' touchDragging':''}`} style={bg?{borderLeftColor:bg}:undefined}
      draggable onDragStart={()=>{dragRef.current={id:a.id,durationMs:new Date(a.end_at).getTime()-new Date(a.start_at).getTime()}}}
      onTouchStart={e=>onCardTouchStart(e,a)} onTouchMove={onCardTouchMove} onTouchEnd={onCardTouchEnd}
      onClick={()=>setSelected(a)}>
      <b>{new Date(a.start_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}–{new Date(a.end_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</b>
      <span>{a.customer_first_name} {a.customer_last_name}</span>
      <small>{a.services?.name}{allColumns.length>1?'':` · ${a.staff_profiles?.name||a.staff_name_snapshot||'Ana Takvim'}`}</small>
      <em>{a.status==='confirmed'?'Onaylı':a.status==='completed'?'Tamamlandı':a.status==='no_show'?'Gelmedi':a.status}</em>
    </article>;
  }

  return (
    <section className="daySchedule">
      <header>
        <div><small>GÜNLÜK AKIŞ</small><h2>Saat Takvimi</h2></div>
        <div className="calBadges">
          <div className="calBadge"><small>BUGÜNKÜ CİRO</small><b>{todaysRevenue.toLocaleString('tr-TR')} ₺</b></div>
          <div className="calBadge"><small>BUGÜNKÜ RANDEVU</small><b>{todaysAppointments.length}</b></div>
        </div>
        <select value={staffId} onChange={e=>setStaffId(e.target.value)}>
          <option value="all">Tüm çalışanlar</option>
          {visibleStaffList(staff).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </header>

      {services.length>0&&<div className="calLegend">{services.map(s=><span key={s.id}><i style={{background:serviceColorMap.get(s.id)}}/>{s.name}</span>)}</div>}

      <div className="scheduleDayPicker" ref={pickerRef}>
        {scheduleDays.map(d=>
          <button key={d.value} type="button" className={`${date===d.value?'selected':''} ${d.isToday?'today':''}`} onClick={()=>setDate(d.value)}>
            <small>{d.name}</small><b>{d.n}</b><span>{d.month}</span>
          </button>
        )}
      </div>

      <div className="scheduleGridScroll">
        <div className="scheduleGrid" style={gridStyle}>
          {allColumns.length>1&&<div className="scheduleColHeads">
            <span/>
            {allColumns.map(c=><b key={c.id}>{c.name}</b>)}
          </div>}
          {hours.map(h=>
            <div className="hourRow" key={h}>
              <time>{String(h).padStart(2,'0')}:00</time>
              {allColumns.length>1?allColumns.map(c=>
                <div className={`staffCell${touchHoverKey===`${c.id}|${h}`?' touchHover':''}`} key={c.id} data-col={c.id} data-hour={h} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,c.id,h)}>
                  {list.filter(a=>new Date(a.start_at).getHours()===h&&(c.id==='__unassigned'?!columns.some(cc=>cc.matchIds.has(a.staff_id)):c.matchIds.has(a.staff_id))).map(apptCard)}
                </div>
              ):<div className={`staffCell${touchHoverKey===`${columns[0]?.id||'__unassigned'}|${h}`?' touchHover':''}`} data-col={columns[0]?.id||'__unassigned'} data-hour={h} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,columns[0]?.id||'__unassigned',h)}>{list.filter(a=>new Date(a.start_at).getHours()===h).map(apptCard)}</div>}
            </div>
          )}
        </div>
      </div>
      {!list.length&&<p className="scheduleEmpty">Bu gün için randevu bulunmuyor.</p>}

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
          <h3>{selected.customer_first_name} {selected.customer_last_name}</h3>
          <div className="calDrawerRow"><span>Hizmet</span><b>{selected.services?.name||'—'}</b></div>
          <div className="calDrawerRow"><span>Çalışan</span><b>{selected.staff_profiles?.name||selected.staff_name_snapshot||'Atanmamış'}</b></div>
          <div className="calDrawerRow"><span>Tarih</span><b>{new Date(selected.start_at).toLocaleString('tr-TR',{dateStyle:'long',timeStyle:'short'})}</b></div>
          <div className="calDrawerRow"><span>Tutar</span><b>{selected.total_price!=null?`${Number(selected.total_price).toLocaleString('tr-TR')} ₺`:'—'}</b></div>
          {selected.customer_note&&<div className="calDrawerNote">📝 {selected.customer_note}</div>}
          <div className="calDrawerContact">
            <a href={`tel:${selected.customer_phone}`}><Phone size={16}/> Ara</a>
            <a href={`https://wa.me/${waPhone(selected.customer_phone)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/> WhatsApp</a>
          </div>
          {selected.status!=='completed'&&selected.status!=='no_show'&&<div className="calDrawerActions">
            <button className="calBtnPrimary" onClick={completeSelected}><Check size={16}/> Ödeme Al / Tamamla</button>
            <button className="calBtnDanger" onClick={cancelSelected}><Ban size={16}/> İptal Et</button>
          </div>}
        </div>
      </div>}

      {toastMsg&&<div className="calToast">{toastMsg}</div>}
    </section>
  );
}
