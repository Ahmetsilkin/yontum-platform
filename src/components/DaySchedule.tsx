'use client';import{useEffect,useMemo,useRef,useState}from'react';import type{Appointment}from'@/lib/types';import'./day-schedule.css';

const dayNames=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],monthNames=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

export default function DaySchedule({appointments,staff}:{appointments:Appointment[];staff:any[]}){
  const today=new Date().toLocaleDateString('en-CA'),[date,setDate]=useState(today),[staffId,setStaffId]=useState('all');
  const scheduleDays=useMemo(()=>Array.from({length:22},(_,i)=>{
    const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-7+i);
    return{value:d.toLocaleDateString('en-CA'),name:dayNames[d.getDay()],n:d.getDate(),month:monthNames[d.getMonth()],isToday:d.toLocaleDateString('en-CA')===today};
  }),[today]);
  const list=useMemo(()=>{
    const target=staff.find(s=>s.id===staffId),matchIds=staffId==='all'?null:new Set([staffId,...(target?.user_id?staff.filter((s:any)=>s.user_id===target.user_id).map((s:any)=>s.id):[])]);
    return appointments.filter(a=>a.start_at.slice(0,10)===date&&a.status!=='cancelled'&&(!matchIds||matchIds.has(a.staff_id))).sort((a,b)=>a.start_at.localeCompare(b.start_at));
  },[appointments,date,staffId,staff]);
  const hours=Array.from({length:15},(_,i)=>i+7);
  const pickerRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const todayBtn=pickerRef.current?.querySelector<HTMLButtonElement>('button.today');
    todayBtn?.scrollIntoView({block:'nearest',inline:'start'});
  },[]);
  return (
    <section className="daySchedule">
      <header>
        <div><small>GÜNLÜK AKIŞ</small><h2>Saat Takvimi</h2></div>
        <select value={staffId} onChange={e=>setStaffId(e.target.value)}>
          <option value="all">Tüm çalışanlar</option>
          {staff.filter((s:any,i:number)=>!s.is_default&&staff.findIndex((x:any)=>x.user_id&&x.user_id===s.user_id)===i).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </header>
      <div className="scheduleDayPicker" ref={pickerRef}>
        {scheduleDays.map(d=>
          <button key={d.value} type="button" className={`${date===d.value?'selected':''} ${d.isToday?'today':''}`} onClick={()=>setDate(d.value)}>
            <small>{d.name}</small><b>{d.n}</b><span>{d.month}</span>
          </button>
        )}
      </div>
      <div className="scheduleGrid">
        {hours.map(h=>
          <div className="hourRow" key={h}>
            <time>{String(h).padStart(2,'0')}:00</time>
            <div>{list.filter(a=>new Date(a.start_at).getHours()===h).map(a=>
              <article key={a.id} className={`status-${a.status}`}>
                <b>{new Date(a.start_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}–{new Date(a.end_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</b>
                <span>{a.customer_first_name} {a.customer_last_name}</span>
                <small>{a.services?.name} · {a.staff_profiles?.name||a.staff_name_snapshot}</small>
                <em>{a.status==='confirmed'?'Onaylı':a.status==='completed'?'Tamamlandı':a.status==='no_show'?'Gelmedi':a.status}</em>
              </article>
            )}</div>
          </div>
        )}
      </div>
      {!list.length&&<p className="scheduleEmpty">Bu gün için randevu bulunmuyor.</p>}
    </section>
  );
}
