import{NextRequest,NextResponse}from'next/server';import{cookies}from'next/headers';import{createServiceClient}from'@/lib/supabase-server';import{ADMIN_COOKIE_NAME,isValidAdminSession}from'@/lib/admin-gate';
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const store=await cookies();
    if(!isValidAdminSession(store.get(ADMIN_COOKIE_NAME)?.value))return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
    const{id:businessId}=await params;
    const db=createServiceClient();
    const{data:owner}=await db.from('business_members').select('user_id').eq('business_id',businessId).eq('role','owner').maybeSingle();
    if(!owner)return NextResponse.json({error:'İşletme sahibi bulunamadı.'},{status:404});
    const{data:ownerUser,error:userError}=await db.auth.admin.getUserById(owner.user_id);
    if(userError||!ownerUser.user?.email)return NextResponse.json({error:'Hesap bilgisi alınamadı.'},{status:400});

    const site=process.env.NEXT_PUBLIC_SITE_URL||req.nextUrl.origin;
    const{data,error}=await db.auth.admin.generateLink({type:'magiclink',email:ownerUser.user.email,options:{redirectTo:`${site}/auth/callback?next=/panel`}});
    if(error||!data.properties?.action_link)return NextResponse.json({error:error?.message||'Giriş bağlantısı oluşturulamadı.'},{status:400});
    return NextResponse.json({ok:true,link:data.properties.action_link});
  }catch{
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
