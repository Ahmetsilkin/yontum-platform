import{NextRequest,NextResponse}from'next/server';import{cookies}from'next/headers';import{createServiceClient}from'@/lib/supabase-server';import{ADMIN_COOKIE_NAME,isValidAdminSession}from'@/lib/admin-gate';
export async function DELETE(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const store=await cookies();
    if(!isValidAdminSession(store.get(ADMIN_COOKIE_NAME)?.value))return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
    const{id:businessId}=await params;
    const db=createServiceClient();
    const{data:owner}=await db.from('business_members').select('user_id').eq('business_id',businessId).eq('role','owner').maybeSingle();
    const{error}=await db.from('businesses').delete().eq('id',businessId);
    if(error)return NextResponse.json({error:error.message},{status:400});
    if(owner)await db.auth.admin.deleteUser(owner.user_id);
    return NextResponse.json({ok:true});
  }catch{
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
