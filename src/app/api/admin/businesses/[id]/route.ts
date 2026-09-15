import{NextRequest,NextResponse}from'next/server';import{cookies}from'next/headers';import{createServiceClient}from'@/lib/supabase-server';import{ADMIN_COOKIE_NAME,isValidAdminSession}from'@/lib/admin-gate';import{z}from'zod';
const patchSchema=z.object({is_published:z.boolean()});
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const store=await cookies();
    if(!isValidAdminSession(store.get(ADMIN_COOKIE_NAME)?.value))return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
    const{id:businessId}=await params;
    const{is_published}=patchSchema.parse(await req.json());
    const db=createServiceClient();
    const{error}=await db.from('businesses').update({is_published}).eq('id',businessId);
    if(error)return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json({ok:true});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Bilgileri kontrol edin.'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
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
