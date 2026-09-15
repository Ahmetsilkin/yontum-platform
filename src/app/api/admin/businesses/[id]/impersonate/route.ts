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

    const{data,error}=await db.auth.admin.generateLink({type:'magiclink',email:ownerUser.user.email});
    if(error||!data.properties?.hashed_token)return NextResponse.json({error:error?.message||'Giriş bağlantısı oluşturulamadı.'},{status:400});
    return NextResponse.json({ok:true,tokenHash:data.properties.hashed_token});
  }catch{
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
