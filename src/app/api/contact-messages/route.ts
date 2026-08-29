import{NextRequest,NextResponse}from'next/server';import{createServiceClient}from'@/lib/supabase-server';import{z}from'zod';
const schema=z.object({businessId:z.string().uuid(),name:z.string().trim().min(2).max(80),message:z.string().trim().min(2).max(1000)});
export async function POST(req:NextRequest){
  try{
    const x=schema.parse(await req.json()),db=createServiceClient();
    const{data:biz}=await db.from('businesses').select('id').eq('id',x.businessId).eq('is_published',true).single();
    if(!biz)return NextResponse.json({error:'İşletme bulunamadı.'},{status:404});
    const{error}=await db.from('contact_messages').insert({business_id:x.businessId,name:x.name,message:x.message});
    if(error)return NextResponse.json({error:'Mesaj gönderilemedi.'},{status:500});
    return NextResponse.json({ok:true},{status:201});
  }catch(e){
    if(e instanceof z.ZodError){const f=e.issues[0]?.path?.[0],names:Record<string,string>={name:'Ad',message:'Mesaj'};return NextResponse.json({error:`${names[String(f)]||'Bilgileri'} kontrol edin.`},{status:400})}
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
