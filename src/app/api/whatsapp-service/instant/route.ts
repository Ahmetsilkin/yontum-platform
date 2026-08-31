import{NextRequest,NextResponse}from'next/server';
import{createServiceClient}from'@/lib/supabase-server';
import{authorizedService}from'../_auth';
// Yerel servis bu rotayı hızlı aralıklarla (örn. her 4 saniyede) çekiyor —
// takvimde bir randevu sürüklenip "Evet, WhatsApp Gönder" denildiğinde
// oluşan mesajlar buradan neredeyse anında gidiyor (ana randevu
// hatırlatma/onay/değerlendirme kuyruğu ayrı, 60 saniyelik döngüde kalıyor).
export async function GET(req:NextRequest){
  if(!authorizedService(req))return NextResponse.json({error:'Yetkisiz.'},{status:401});
  const db=createServiceClient();
  const{data:sessions}=await db.from('whatsapp_sessions').select('business_id').eq('status','connected');
  const activeIds=(sessions||[]).map((s:any)=>s.business_id);
  if(!activeIds.length)return NextResponse.json({messages:[]});
  const{data:rows}=await db.from('whatsapp_instant_queue').select('id,business_id,phone,message').in('business_id',activeIds).eq('status','pending').order('created_at').limit(20);
  return NextResponse.json({messages:(rows||[]).map((r:any)=>({id:r.id,businessId:r.business_id,phone:r.phone,text:r.message}))});
}
