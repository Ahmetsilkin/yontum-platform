import{NextRequest,NextResponse}from'next/server';import{createClient,createServiceClient}from'@/lib/supabase-server';import{z}from'zod';
const schema=z.object({businessId:z.string().uuid(),name:z.string().trim().min(2),username:z.string().trim().min(2).max(30).optional(),email:z.string().email().optional(),phone:z.string().optional(),title:z.string().optional(),bio:z.string().optional(),photoUrl:z.string().url().optional().or(z.literal('')),serviceIds:z.array(z.string().uuid()).optional()});
function generatePassword(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';let p='';for(let i=0;i<10;i++)p+=chars[Math.floor(Math.random()*chars.length)];return p}
function slugify(name:string){return name.toLowerCase().replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'calisan'}
export async function POST(req:NextRequest){
  try{
    const x=schema.parse(await req.json());
    const auth=await createClient(),{data:{user}}=await auth.auth.getUser();
    if(!user)return NextResponse.json({error:'Giriş gerekli.'},{status:401});
    const{data:m}=await auth.from('business_members').select('role').eq('business_id',x.businessId).eq('user_id',user.id).single();
    if(!m||!['owner','manager'].includes(m.role))return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
    const db=createServiceClient();
    const username=x.username||`${slugify(x.name)}-${Date.now().toString(36).slice(-4)}`;
    const serviceIds=x.serviceIds||[];

    if(!x.email){
      /* Davetsiz (panele girişi olmayan) çalışan — sadece staff_profiles satırı,
         auth hesabı ve business_members satırı oluşturulmaz. */
      const{data:staff,error}=await db.from('staff_profiles').insert({business_id:x.businessId,name:x.name,username,phone:x.phone||null,title:x.title||null,bio:x.bio||null,photo_url:x.photoUrl||null}).select('id').single();
      if(error)return NextResponse.json({error:error.message},{status:400});
      if(serviceIds.length)await db.from('staff_services').insert(serviceIds.map(service_id=>({staff_id:staff.id,service_id})));
      const{data:hours}=await db.from('working_hours').select('day_of_week,is_open,start_time,end_time').eq('business_id',x.businessId);
      if(hours?.length)await db.from('staff_working_hours').insert(hours.map(h=>({...h,staff_id:staff.id})));
      return NextResponse.json({ok:true,staffId:staff.id},{status:201});
    }

    const password=generatePassword(),{data:created,error:createError}=await db.auth.admin.createUser({email:x.email,password,email_confirm:true,user_metadata:{invited_staff:true,business_id:x.businessId}});
    if(createError||!created.user)return NextResponse.json({error:createError?.message||'Hesap oluşturulamadı.'},{status:400});
    const{data:staff,error}=await db.from('staff_profiles').insert({business_id:x.businessId,user_id:created.user.id,name:x.name,username,email:x.email,phone:x.phone||null,title:x.title||null,bio:x.bio||null,photo_url:x.photoUrl||null}).select('id').single();
    if(error)return NextResponse.json({error:error.message},{status:400});
    await db.from('business_members').insert({business_id:x.businessId,user_id:created.user.id,role:'staff'});
    if(serviceIds.length)await db.from('staff_services').insert(serviceIds.map(service_id=>({staff_id:staff.id,service_id})));
    const{data:hours}=await db.from('working_hours').select('day_of_week,is_open,start_time,end_time').eq('business_id',x.businessId);
    if(hours?.length)await db.from('staff_working_hours').insert(hours.map(h=>({...h,staff_id:staff.id})));
    const site=process.env.NEXT_PUBLIC_SITE_URL||req.nextUrl.origin;
    return NextResponse.json({ok:true,staffId:staff.id,generatedPassword:password,loginEmail:x.email,loginUrl:`${site}/giris`},{status:201});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Bilgileri kontrol edin.'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
