import{NextRequest,NextResponse}from'next/server';
import{createServiceClient}from'@/lib/supabase-server';
import{authorizedService}from'../_auth';
import{z}from'zod';
const schema=z.object({
  businessId:z.string().uuid(),
  status:z.enum(['disconnected','qr_pending','connected']),
  qrData:z.string().nullable().optional(),
  connectedPhone:z.string().nullable().optional(),
});
// Yerel servis, Baileys'ten gelen her durum değişikliğinde (QR üretildi,
// bağlandı, koptu) bu rotayı çağırır — panel bu tabloyu okuyup canlı gösterir.
export async function POST(req:NextRequest){
  if(!authorizedService(req))return NextResponse.json({error:'Yetkisiz.'},{status:401});
  const x=schema.parse(await req.json());
  const db=createServiceClient();
  const row:any={
    business_id:x.businessId,
    status:x.status,
    qr_data:x.status==='qr_pending'?(x.qrData??null):null,
    connected_phone:x.status==='connected'?(x.connectedPhone??null):null,
    last_seen_at:new Date().toISOString(),
    updated_at:new Date().toISOString(),
  };
  const{error}=await db.from('whatsapp_sessions').upsert(row,{onConflict:'business_id'});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
