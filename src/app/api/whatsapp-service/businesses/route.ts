import{NextRequest,NextResponse}from'next/server';
import{createServiceClient}from'@/lib/supabase-server';
import{authorizedService}from'../_auth';
// Yerel servis bu listeyi düzenli aralıklarla çeker: otomasyonu açık VE
// panelden "Bağlan"a basılmış (qr_pending) ya da zaten bağlı (connected)
// işletmeler için Baileys oturumu açar/açık tutar. Otomasyonu açık olsa
// bile hiç "Bağlan"a basılmamış bir işletme için oturum açmaz — böylece
// servis, kimsenin istemediği QR kodları üretmez.
export async function GET(req:NextRequest){
  if(!authorizedService(req))return NextResponse.json({error:'Yetkisiz.'},{status:401});
  const db=createServiceClient();
  const{data:sessions,error:sessionsError}=await db.from('whatsapp_sessions').select('business_id').in('status',['qr_pending','connected']);
  if(sessionsError)return NextResponse.json({error:sessionsError.message},{status:500});
  const requestedIds=(sessions||[]).map((s:any)=>s.business_id);
  if(!requestedIds.length)return NextResponse.json({businesses:[]});
  const{data,error}=await db.from('businesses').select('id,name,phone').eq('whatsapp_automation_enabled',true).is('deleted_at',null).in('id',requestedIds);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({businesses:data||[]});
}
