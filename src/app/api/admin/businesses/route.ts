import{NextRequest,NextResponse}from'next/server';import{cookies}from'next/headers';import{createServiceClient}from'@/lib/supabase-server';import{ADMIN_COOKIE_NAME,isValidAdminSession}from'@/lib/admin-gate';import{normalizePhoneDigits,phoneLoginEmail}from'@/lib/phone-auth';import{z}from'zod';
const schema=z.object({businessType:z.enum(['barber','hair_salon','beauty','nail_lash','spa_massage','dietitian','psychologist','restaurant','car_care','other']),name:z.string().trim().min(2),slug:z.string().trim().min(3).max(40),phone:z.string().trim().min(10),password:z.string().min(8)});
export async function GET(){
  const store=await cookies();
  if(!isValidAdminSession(store.get(ADMIN_COOKIE_NAME)?.value))return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
  const db=createServiceClient();
  const{data,error}=await db.from('businesses').select('id,name,slug,phone,business_type,is_published,created_at,is_demo').order('created_at',{ascending:false});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({businesses:data||[]});
}
export async function POST(req:NextRequest){
  try{
    const store=await cookies();
    if(!isValidAdminSession(store.get(ADMIN_COOKIE_NAME)?.value))return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
    const x=schema.parse(await req.json());

    const cleanSlug=x.slug.toLowerCase().replace(/[^a-z0-9-]/g,'');
    const loginEmail=phoneLoginEmail(x.phone);
    const db=createServiceClient();
    const{data:created,error:createError}=await db.auth.admin.createUser({email:loginEmail,password:x.password,email_confirm:true,user_metadata:{phone_login:true,business_phone:normalizePhoneDigits(x.phone)}});
    if(createError||!created.user){
      const msg=/already been registered|already registered/i.test(createError?.message||'')?'Bu telefon numarasıyla zaten bir hesap var.':(createError?.message||'Hesap oluşturulamadı.');
      return NextResponse.json({error:msg},{status:400});
    }

    const{data:businessId,error:bizError}=await db.rpc('create_business_v2',{p_name:x.name,p_slug:cleanSlug,p_phone:x.phone,p_business_type:x.businessType,p_owner_user_id:created.user.id});
    if(bizError){
      await db.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({error:bizError.message},{status:400});
    }

    const site=process.env.NEXT_PUBLIC_SITE_URL||req.nextUrl.origin;
    return NextResponse.json({ok:true,businessId,slug:cleanSlug,phone:x.phone,password:x.password,loginUrl:`${site}/giris`,siteUrl:`${site}/site/${cleanSlug}`},{status:201});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Bilgileri kontrol edin.'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
