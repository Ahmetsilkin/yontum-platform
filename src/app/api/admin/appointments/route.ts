import{NextRequest,NextResponse}from'next/server';import{createClient,createServiceClient}from'@/lib/supabase-server';import{z}from'zod';
const schema=z.object({
  businessId:z.string().uuid(),
  serviceId:z.preprocess(v=>(v==null||v==='')?undefined:v,z.string().uuid().optional()),
  staffId:z.preprocess(v=>(v==null||v==='')?undefined:v,z.string().uuid().optional()),
  date:z.preprocess(v=>(v==null||v==='')?undefined:v,z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  time:z.preprocess(v=>(v==null||v==='')?undefined:v,z.string().regex(/^\d{2}:\d{2}$/).optional()),
  firstName:z.string().trim().min(1).max(60),
  lastName:z.preprocess(v=>v==null?'':v,z.string().trim().max(60).optional()),
  phone:z.preprocess(v=>v==null||v===''?'0000000000':v,z.string().trim().min(1).max(25)),
  email:z.preprocess(v=>v==null?'':v,z.string().email().optional().or(z.literal(''))),
  note:z.preprocess(v=>v==null?'':v,z.string().max(500).optional()),
  forceOverlap:z.boolean().default(false),
});
export async function POST(req:NextRequest){try{
  const x=schema.parse(await req.json());
  const auth=await createClient(),{data:{user}}=await auth.auth.getUser();
  if(!user)return NextResponse.json({error:'Giriş gerekli.'},{status:401});
  const{data:member}=await auth.from('business_members').select('business_id').eq('business_id',x.businessId).eq('user_id',user.id).maybeSingle();
  if(!member)return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
  const db=createServiceClient();

  let service:any=null;
  if(x.serviceId){
    const{data}=await db.from('services').select('*').eq('id',x.serviceId).eq('business_id',x.businessId).single();
    service=data;
    if(!service)return NextResponse.json({error:'Hizmet bulunamadı.'},{status:404});
  }else{
    const{data}=await db.from('services').select('*').eq('business_id',x.businessId).eq('is_active',true).order('sort_order').limit(1);
    service=data?.[0]||null;
  }
  const duration=service?.duration_minutes||30;

  const now=new Date();
  const dateStr=x.date||now.toLocaleDateString('en-CA',{timeZone:'Europe/Istanbul'});
  const timeStr=x.time||now.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Europe/Istanbul'});
  const start=new Date(`${dateStr}T${timeStr}:00+03:00`),end=new Date(start.getTime()+duration*60000);

  const{data,error}=await db.from('appointments').insert({
    business_id:x.businessId,
    service_id:service?.id||null,
    staff_id:x.staffId||null,
    customer_first_name:x.firstName,
    customer_last_name:x.lastName||'',
    customer_phone:x.phone,
    customer_email:x.email||null,
    customer_note:x.note||null,
    start_at:start.toISOString(),
    end_at:end.toISOString(),
    total_price:service?.price??null,
    status:'confirmed',
    source:'manual',
    allow_overlap:x.forceOverlap,
  }).select('id,start_at,end_at').single();
  if(error){
    if(error.code==='23P01')return NextResponse.json({error:'Bu saatte başka bir randevu var.',conflict:true},{status:409});
    if(error.code==='23502')return NextResponse.json({error:'Bu işletmede hiç hizmet tanımlı değil, önce bir hizmet ekleyin.'},{status:400});
    return NextResponse.json({error:'Randevu eklenemedi.'},{status:500});
  }
  return NextResponse.json({ok:true,appointment:data},{status:201});
}catch(e){if(e instanceof z.ZodError)return NextResponse.json({error:'İsim gerekli.'},{status:400});return NextResponse.json({error:'Beklenmeyen hata.'},{status:500})}}
