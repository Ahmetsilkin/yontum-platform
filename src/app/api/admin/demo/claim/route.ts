import{NextRequest,NextResponse}from'next/server';import{z}from'zod';import{createServiceClient}from'@/lib/supabase-server';import{adminDenied}from'@/lib/admin-api';import{normalizePhoneDigits,phoneLoginEmail}from'@/lib/phone-auth';
/* Demo → gerçek işletme: işletme kabul edince gerçek telefon + şifre atanır, etiket kalkar (isteğe bağlı güzel adres). */
const schema=z.object({businessId:z.string().uuid(),phone:z.string().trim().min(10),password:z.string().min(8),slug:z.string().trim().min(3).max(40).regex(/^[a-z0-9][a-z0-9-]*$/).optional()});
export async function POST(req:NextRequest){
  const denied=await adminDenied();if(denied)return denied;
  try{
    const x=schema.parse(await req.json());
    const db=createServiceClient();
    const{data:biz}=await db.from('businesses').select('id,is_demo,slug').eq('id',x.businessId).maybeSingle();
    if(!biz?.is_demo)return NextResponse.json({error:'Bu işletme bir demo değil.'},{status:400});
    const{data:owner}=await db.from('business_members').select('user_id').eq('business_id',x.businessId).eq('role','owner').maybeSingle();
    if(!owner)return NextResponse.json({error:'Sahip hesabı bulunamadı.'},{status:400});
    if(x.slug&&x.slug!==biz.slug){
      const{data:taken}=await db.from('businesses').select('id').eq('slug',x.slug).maybeSingle();
      if(taken)return NextResponse.json({error:'Bu site adresi alınmış.'},{status:400});
    }
    const{error:uErr}=await db.auth.admin.updateUserById(owner.user_id,{email:phoneLoginEmail(x.phone),password:x.password,email_confirm:true,user_metadata:{phone_login:true,business_phone:normalizePhoneDigits(x.phone)}});
    if(uErr)return NextResponse.json({error:/already|registered/i.test(uErr.message)?'Bu telefon numarasıyla zaten bir hesap var.':uErr.message},{status:400});
    const slug=x.slug||biz.slug;
    const{error:bErr}=await db.from('businesses').update({phone:x.phone,slug,is_demo:false,demo_meta:{claimed_at:new Date().toISOString()},updated_at:new Date().toISOString()}).eq('id',x.businessId);
    if(bErr)return NextResponse.json({error:bErr.message},{status:400});
    const site=process.env.NEXT_PUBLIC_SITE_URL||req.nextUrl.origin;
    return NextResponse.json({ok:true,slug,siteUrl:`${site}/site/${slug}`,loginUrl:`${site}/giris`});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Telefon, en az 8 karakterli şifre ve (varsa) küçük harf/rakam/tireli adres gir.'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
