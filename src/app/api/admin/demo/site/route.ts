import{NextRequest,NextResponse}from'next/server';import{z}from'zod';import{createServiceClient}from'@/lib/supabase-server';import{adminDenied}from'@/lib/admin-api';import{updateDemoSite}from'@/lib/demo-generate';
import{DEMO_IMAGE_SETS}from'@/lib/demo-images';
/* Üretilmiş (henüz devredilmemiş) demo sitenin bilgilerini / temasını / görsel setini / saatlerini düzenler. */
const schema=z.object({businessId:z.string().uuid(),edit:z.object({
  name:z.string().trim().min(2).max(80).optional(),
  phone:z.string().max(20).nullable().optional(),
  address:z.string().max(200).nullable().optional(),
  instagram:z.string().max(120).nullable().optional(),
  theme_id:z.string().trim().max(60).optional(),
  image_set:z.string().refine(v=>DEMO_IMAGE_SETS.some(s=>s.id===v)).optional(),
  opening_hours:z.string().regex(/^Mo-Su \d{2}:\d{2}-\d{2}:\d{2}$/).nullable().optional(),
})});
export async function PATCH(req:NextRequest){
  const denied=await adminDenied();if(denied)return denied;
  try{
    const{businessId,edit}=schema.parse(await req.json());
    const r=await updateDemoSite(createServiceClient(),businessId,edit);
    return r.ok?NextResponse.json({ok:true}):NextResponse.json({error:r.error||'Kaydedilemedi.'},{status:400});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Bilgileri kontrol et.'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
