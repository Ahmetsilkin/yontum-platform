import{NextRequest,NextResponse}from'next/server';
import{createServiceClient}from'@/lib/supabase-server';
import{authorizedService}from'../_auth';
// Yerel servis bu listeyi düzenli aralıklarla çeker: otomasyonu açık olan
// her işletme için bir Baileys oturumu açık tutmaya (veya QR ile bağlanmayı
// beklemeye) çalışır.
export async function GET(req:NextRequest){
  if(!authorizedService(req))return NextResponse.json({error:'Yetkisiz.'},{status:401});
  const db=createServiceClient();
  const{data,error}=await db.from('businesses').select('id,name,phone').eq('whatsapp_automation_enabled',true);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({businesses:data||[]});
}
