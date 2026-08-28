'use client';
import{useMemo}from'react';
export const pad=(n:number)=>String(n).padStart(2,'0');
export const iso=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
export const hm=(t:string)=>{const[a,b]=t.slice(0,5).split(':').map(Number);return a*60+b};
export const fmt=(m:number)=>`${pad(Math.floor(m/60))}:${pad(m%60)}`;
export const DAY_NAMES_TR=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
export const MONTH_NAMES_TR=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
export type Busy={start_at:string;end_at:string;staff_id?:string|null};

/* Bir hizmete uygun çalışanları bulur — servis seçilmeden önce boş, seçilince
   önce staff_services eşleşmesine bakar, hiç eşleşme yoksa herkesi uygun sayar. */
export function eligibleStaffFor(staff:any[],staffServices:any[],service:any){
  const matchedStaff=service?staff.filter(s=>staffServices.some((x:any)=>x.staff_id===s.id&&x.service_id===service.id)):[];
  const eligible=matchedStaff.length?matchedStaff:(service?staff:[]);
  const visibleEligible=eligible.filter((s:any)=>!s.is_default&&s.title!=='Ana Takvim'&&s.username!=='ana-takvim');
  return{eligible,visibleEligible};
}

/* Önümüzdeki N gün için hangi günlerin açık olduğunu hesaplar (seçilen çalışana
   veya "fark etmez" ise uygun çalışanların herhangi birine göre). */
export function useBookingDays(hours:any[],staffHours:any[],eligible:any[],staffId:string,days=7){
  return useMemo(()=>Array.from({length:days},(_,i)=>{
    const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+i);
    const ids=staffId&&staffId!=='any'?[staffId]:eligible.map((s:any)=>s.id);
    const businessOpen=hours.find(h=>h.day_of_week===d.getDay())?.is_open;
    const open=ids.some((id:string)=>{const own=staffHours.find((h:any)=>h.staff_id===id&&h.day_of_week===d.getDay());return own?own.is_open:businessOpen});
    return{value:iso(d),name:DAY_NAMES_TR[d.getDay()],n:d.getDate(),month:MONTH_NAMES_TR[d.getMonth()],open};
  }),[staffId,staffHours,eligible,hours,days]);
}

/* Seçilen gün için uygun saatleri hesaplar. Sabit aralık ızgarasının yanına,
   randevu bitiş saatlerini de aday olarak ekler; ayrıca bir saati seçmenin
   sonraki randevuya/kapanışa kadar hiçbir hizmete yetmeyecek küçük bir boşluk
   bırakıp bırakmadığını kontrol eder — bırakıyorsa o saat hiç önerilmez
   (gerçek berber/kuaför sitelerinin, örn. Fresha'nın, yaptığı gibi). */
export function useAvailableSlots(opts:{service:any;date:string;staffId:string;busy:Busy[];eligible:any[];staffHours:any[];hours:any[];slotInterval?:number;services:any[]}){
  const{service,date,staffId,busy,eligible,staffHours,hours,slotInterval,services}=opts;
  const minServiceDuration=useMemo(()=>{
    const durs=services.map(s=>s.duration_minutes).filter((n):n is number=>typeof n==='number'&&n>0);
    return durs.length?Math.min(...durs):(service?.duration_minutes||0);
  },[services,service]);
  return useMemo(()=>{
    if(!service||!date||!staffId)return[];
    const day=new Date(date+'T12:00:00').getDay();
    const ids=staffId==='any'?eligible.map((s:any)=>s.id):[staffId];
    const interval=slotInterval||30;
    const minutes=new Set<number>();
    for(let m=0;m<1440;m+=interval)minutes.add(m);
    busy.forEach(b=>{
      if(b.staff_id&&!ids.includes(b.staff_id))return;
      const e=new Date(b.end_at);
      if(e.toLocaleDateString('en-CA',{timeZone:'Europe/Istanbul'})!==date)return;
      const[eh,em]=e.toLocaleTimeString('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hour12:false}).split(':').map(Number);
      minutes.add(eh*60+em);
    });
    const out:string[]=[];
    Array.from(minutes).sort((a,b)=>a-b).forEach(m=>{
      const start=new Date(`${date}T${fmt(m)}:00+03:00`),end=new Date(start.getTime()+service.duration_minutes*60000),endMin=m+service.duration_minutes;
      if(start.getTime()<Date.now()+300000)return;
      const available=ids.some((id:string)=>{
        const own=staffHours.find((h:any)=>h.staff_id===id&&h.day_of_week===day);
        const wh=own||hours.find((h:any)=>h.day_of_week===day);
        if(!(wh?.is_open&&m>=hm(wh.start_time)&&endMin<=hm(wh.end_time)))return false;
        if(busy.some(b=>(!b.staff_id||b.staff_id===id)&&start<new Date(b.end_at)&&end>new Date(b.start_at)))return false;
        let nextBoundary=hm(wh.end_time);
        busy.forEach(b=>{
          if(b.staff_id&&b.staff_id!==id)return;
          const bs=new Date(b.start_at);
          if(bs.toLocaleDateString('en-CA',{timeZone:'Europe/Istanbul'})!==date)return;
          const[bh,bm]=bs.toLocaleTimeString('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hour12:false}).split(':').map(Number);
          const bStartMin=bh*60+bm;
          if(bStartMin>=endMin&&bStartMin<nextBoundary)nextBoundary=bStartMin;
        });
        const gap=nextBoundary-endMin;
        return gap===0||gap>=minServiceDuration;
      });
      if(available)out.push(fmt(m));
    });
    return out;
  },[service,date,staffId,busy,eligible,staffHours,hours,slotInterval,minServiceDuration]);
}

export async function fetchBusyTimes(businessId:string,date:string):Promise<Busy[]>{
  const r=await fetch(`/api/appointments?businessId=${businessId}&date=${date}`);
  const j=await r.json();
  return j.busy||[];
}

export async function submitAppointment(businessId:string,payload:{serviceId:string;staffId:string|null;date:string;time:string;firstName:string;lastName:string;phone:string;email:string;note:string}){
  const r=await fetch('/api/appointments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({businessId,...payload})});
  const j=await r.json();
  return{ok:r.ok,json:j};
}
