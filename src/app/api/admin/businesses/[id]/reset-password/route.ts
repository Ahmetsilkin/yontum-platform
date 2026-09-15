import{NextRequest,NextResponse}from'next/server';import{createClient,createServiceClient}from'@/lib/supabase-server';import{z}from'zod';
const schema=z.object({password:z.string().min(8)});
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const{id:businessId}=await params;
    const{password}=schema.parse(await req.json());
    const auth=await createClient(),{data:{user}}=await auth.auth.getUser();
    if(!user)return NextResponse.json({error:'Giriş gerekli.'},{status:401});
    const{data:admin}=await auth.from('platform_admins').select('user_id').eq('user_id',user.id).maybeSingle();
    if(!admin)return NextResponse.json({error:'Yetkiniz yok.'},{status:403});

    const db=createServiceClient();
    const{data:owner}=await db.from('business_members').select('user_id').eq('business_id',businessId).eq('role','owner').maybeSingle();
    if(!owner)return NextResponse.json({error:'İşletme sahibi bulunamadı.'},{status:404});

    const{error}=await db.auth.admin.updateUserById(owner.user_id,{password});
    if(error)return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json({ok:true});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Şifre en az 8 karakter olmalı.'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
