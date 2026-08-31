import{NextRequest,NextResponse}from'next/server';
import{createServiceClient}from'@/lib/supabase-server';
import{authorizedService}from'../_auth';

function waPhone(raw:string){let p=String(raw||'').replace(/\D/g,'');if(p.startsWith('0'))p='90'+p.slice(1);if(p&&!p.startsWith('90')&&p.length===10)p='90'+p;return p}
function timeTr(iso:string){return new Date(iso).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Istanbul'})}
function dateTimeTr(iso:string){return new Date(iso).toLocaleString('tr-TR',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/Istanbul'})}

// Yerel servis bu rotayı düzenli aralıklarla (örn. her 1-2 dakikada) çeker.
// Vercel'in yerel bilgisayarı "çağırması" gerekmiyor — bilgisayar soruyor,
// bu yüzden bilgisayar kapalıyken hiçbir mesaj kaybolmuyor, açılınca kaldığı
// yerden devam ediyor.
export async function GET(req:NextRequest){
  if(!authorizedService(req))return NextResponse.json({error:'Yetkisiz.'},{status:401});
  const db=createServiceClient();
  const site=process.env.NEXT_PUBLIC_SITE_URL||req.nextUrl.origin;

  const{data:sessions}=await db.from('whatsapp_sessions').select('business_id').eq('status','connected');
  const activeIds=(sessions||[]).map((s:any)=>s.business_id);
  if(!activeIds.length)return NextResponse.json({messages:[]});

  const{data:businesses}=await db.from('businesses').select('id,name,google_place_id,google_maps_url').in('id',activeIds).eq('whatsapp_automation_enabled',true).is('deleted_at',null);
  const bizById=new Map((businesses||[]).map((b:any)=>[b.id,b]));
  const readyIds=[...bizById.keys()];
  if(!readyIds.length)return NextResponse.json({messages:[]});

  const nowIso=new Date().toISOString();
  const in2hIso=new Date(Date.now()+2*3600000).toISOString();
  const before30mIso=new Date(Date.now()-30*60000).toISOString();

  const[{data:confirmRows},{data:reminderRows},{data:reviewRows}]=await Promise.all([
    db.from('appointments').select('id,business_id,customer_first_name,customer_phone,start_at,services(name)').in('business_id',readyIds).eq('status','confirmed').is('confirmation_sent_at',null),
    db.from('appointments').select('id,business_id,customer_first_name,customer_phone,start_at,services(name)').in('business_id',readyIds).eq('status','confirmed').is('reminder_sent_at',null).gt('start_at',nowIso).lte('start_at',in2hIso),
    db.from('appointments').select('id,business_id,customer_first_name,customer_phone,rating_token,updated_at').in('business_id',readyIds).eq('status','completed').is('rating_request_sent_at',null).lte('updated_at',before30mIso),
  ]);

  const messages:any[]=[];
  (confirmRows||[]).forEach((a:any)=>{
    const biz=bizById.get(a.business_id);if(!biz)return;
    const phone=waPhone(a.customer_phone);if(!phone)return;
    const text=`Merhaba ${a.customer_first_name}, ${biz.name} için ${dateTimeTr(a.start_at)} tarihli randevunuz onaylandı${a.services?.name?` (${a.services.name})`:''}. Görüşmek üzere!`;
    messages.push({businessId:a.business_id,appointmentId:a.id,type:'confirmation',phone,text});
  });
  (reminderRows||[]).forEach((a:any)=>{
    const biz=bizById.get(a.business_id);if(!biz)return;
    const phone=waPhone(a.customer_phone);if(!phone)return;
    const text=`Merhaba ${a.customer_first_name}, hatırlatma: bugün saat ${timeTr(a.start_at)} için ${biz.name}'de randevunuz var${a.services?.name?` (${a.services.name})`:''}. Sizi bekliyoruz!`;
    messages.push({businessId:a.business_id,appointmentId:a.id,type:'reminder',phone,text});
  });
  (reviewRows||[]).forEach((a:any)=>{
    const biz=bizById.get(a.business_id);if(!biz)return;
    const phone=waPhone(a.customer_phone);if(!phone)return;
    const link=biz.google_maps_url||(biz.google_place_id?`https://search.google.com/local/writereview?placeid=${biz.google_place_id}`:(a.rating_token?`${site}/puan/${a.rating_token}`:''));
    const text=`Merhaba ${a.customer_first_name}, ${biz.name}'i tercih ettiğiniz için teşekkür ederiz! Deneyiminizi 1 dakikada değerlendirir misiniz?${link?`\n${link}`:''}`;
    messages.push({businessId:a.business_id,appointmentId:a.id,type:'review',phone,text});
  });

  return NextResponse.json({messages});
}
