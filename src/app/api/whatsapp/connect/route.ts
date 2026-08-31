import{NextRequest,NextResponse}from'next/server';
import{createClient,createServiceClient}from'@/lib/supabase-server';
// İşletme sahibi/çalışanı panelden "Bağlan" butonuna basınca çağrılır.
// Sadece "bu işletme WhatsApp bağlantısı istiyor" bayrağını kaldırır —
// gerçek QR kodu, bilgisayarındaki servis bu isteği görüp Baileys
// oturumunu başlatınca gelir (bkz. /api/whatsapp-service/businesses).
export async function POST(req:NextRequest){
  const{businessId}=await req.json().catch(()=>({businessId:null}));
  if(!businessId)return NextResponse.json({error:'İşletme belirtilmedi.'},{status:400});
  const auth=await createClient();
  const{data:{user}}=await auth.auth.getUser();
  if(!user)return NextResponse.json({error:'Giriş gerekli.'},{status:401});
  const{data:member}=await auth.from('business_members').select('business_id').eq('business_id',businessId).eq('user_id',user.id).maybeSingle();
  if(!member)return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
  const db=createServiceClient();
  const{error}=await db.from('whatsapp_sessions').upsert({
    business_id:businessId,
    status:'qr_pending',
    qr_data:null,
    updated_at:new Date().toISOString(),
  },{onConflict:'business_id'});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
