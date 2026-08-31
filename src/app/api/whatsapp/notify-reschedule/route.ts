import{NextRequest,NextResponse}from'next/server';
import{createClient,createServiceClient}from'@/lib/supabase-server';
// Takvimde bir randevu sürüklenip saati değiştiğinde, panel kullanıcısı
// "Evet, WhatsApp Gönder" derse buraya düşer. Randevunun GÜNCEL (zaten
// değişmiş) start_at değerini veritabanından okuyup mesajı ona göre
// oluşturur ve whatsapp_instant_queue'ya ekler — bilgisayardaki servis
// bu kuyruğu hızlı aralıklarla kontrol edip gönderiyor (bkz. whatsapp-service/index.js).
function waPhone(raw:string){let p=String(raw||'').replace(/\D/g,'');if(p.startsWith('0'))p='90'+p.slice(1);if(p&&!p.startsWith('90')&&p.length===10)p='90'+p;return p}
export async function POST(req:NextRequest){
  const{appointmentId}=await req.json().catch(()=>({appointmentId:null}));
  if(!appointmentId)return NextResponse.json({error:'Randevu belirtilmedi.'},{status:400});
  const auth=await createClient();
  const{data:{user}}=await auth.auth.getUser();
  if(!user)return NextResponse.json({error:'Giriş gerekli.'},{status:401});

  const db=createServiceClient();
  const{data:a}=await db.from('appointments').select('id,business_id,customer_first_name,customer_phone,start_at,cancel_token').eq('id',appointmentId).single();
  if(!a)return NextResponse.json({error:'Randevu bulunamadı.'},{status:404});

  const{data:member}=await auth.from('business_members').select('business_id').eq('business_id',a.business_id).eq('user_id',user.id).maybeSingle();
  if(!member)return NextResponse.json({error:'Yetkiniz yok.'},{status:403});

  const{data:biz}=await db.from('businesses').select('name').eq('id',a.business_id).single();
  const phone=waPhone(a.customer_phone);
  if(!phone)return NextResponse.json({error:'Müşterinin telefon numarası yok.'},{status:400});

  const site=process.env.NEXT_PUBLIC_SITE_URL||req.nextUrl.origin;
  const dt=new Date(a.start_at);
  const dateTr=dt.toLocaleDateString('tr-TR',{day:'2-digit',month:'long',timeZone:'Europe/Istanbul'});
  const timeTr=dt.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Istanbul'});
  const link=a.cancel_token?`${site}/randevu/${a.cancel_token}`:'';
  const message=`Merhaba ${a.customer_first_name}, ${biz?.name||'İşletmeniz'} dükkanındaki randevu saatiniz ${dateTr} saat ${timeTr} olarak güncellenmiştir.${link?`\nRandevu bağlantınız: ${link}`:''}`;

  const{error}=await db.from('whatsapp_instant_queue').insert({business_id:a.business_id,appointment_id:a.id,phone,message,status:'pending'});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
