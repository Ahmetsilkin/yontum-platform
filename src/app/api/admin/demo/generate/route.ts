import{NextRequest,NextResponse}from'next/server';import{z}from'zod';import{createServiceClient}from'@/lib/supabase-server';import{adminDenied}from'@/lib/admin-api';import{generateDemoBusiness}from'@/lib/demo-generate';
export const maxDuration=60;
/* Seçilen adaylardan örnek taslak siteleri üretir (istek başına en fazla 6; arayüz partiler halinde çağırır). */
export async function POST(req:NextRequest){
  const denied=await adminDenied();if(denied)return denied;
  try{
    const{leadIds}=z.object({leadIds:z.array(z.string().uuid()).min(1).max(6)}).parse(await req.json());
    const db=createServiceClient();
    const{data:leads,error}=await db.from('demo_leads').select('*').in('id',leadIds).neq('status','generated');
    if(error)return NextResponse.json({error:error.message},{status:400});
    const origin=process.env.NEXT_PUBLIC_SITE_URL||req.nextUrl.origin;
    const results=[];
    for(const lead of leads||[])results.push(await generateDemoBusiness(db,lead,origin));
    return NextResponse.json({ok:true,results});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Seçimi kontrol et (en fazla 6).'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
