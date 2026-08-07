import{NextRequest,NextResponse}from'next/server';
import{createClient,createServiceClient}from'@/lib/supabase-server';

async function authorizedForBusiness(businessId:string){
  const auth=await createClient();
  const{data:{user}}=await auth.auth.getUser();
  if(!user)return null;
  const{data:member}=await auth.from('business_members').select('business_id').eq('business_id',businessId).eq('user_id',user.id).maybeSingle();
  return member?true:null;
}

export async function GET(req:NextRequest){
  const businessId=req.nextUrl.searchParams.get('businessId');
  if(!businessId)return NextResponse.json({error:'businessId gerekli.'},{status:400});
  if(!(await authorizedForBusiness(businessId)))return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
  const db=createServiceClient();
  const{data}=await db.from('appointment_ratings').select('id,customer_name,stars,comment,avatar_url,is_manual,created_at').eq('business_id',businessId).order('created_at',{ascending:false});
  return NextResponse.json({ratings:data||[]});
}

export async function POST(req:NextRequest){
  const form=await req.formData();
  const businessId=String(form.get('businessId')||''),customerName=String(form.get('customerName')||'').trim(),stars=Number(form.get('stars')),comment=String(form.get('comment')||'').trim(),photo=form.get('photo')as File|null;
  if(!businessId||!customerName||!stars||stars<1||stars>5||!comment)return NextResponse.json({error:'Geçersiz veri.'},{status:400});
  if(!(await authorizedForBusiness(businessId)))return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
  const db=createServiceClient();
  let avatarUrl:string|null=null;
  if(photo&&photo.size>0&&photo.size<5*1024*1024){
    const ext=photo.name.split('.').pop()||'jpg',path=`ratings/manual-${businessId}-${Date.now()}.${ext}`;
    const{error:upErr}=await db.storage.from('business-media').upload(path,photo);
    if(!upErr)avatarUrl=db.storage.from('business-media').getPublicUrl(path).data.publicUrl;
  }
  const{error}=await db.from('appointment_ratings').insert({
    business_id:businessId,
    customer_name:customerName,
    stars,
    comment,
    avatar_url:avatarUrl,
    is_manual:true,
  });
  if(error)return NextResponse.json({error:'Yorum eklenemedi.'},{status:500});
  return NextResponse.json({ok:true});
}

export async function DELETE(req:NextRequest){
  const id=req.nextUrl.searchParams.get('id'),businessId=req.nextUrl.searchParams.get('businessId');
  if(!id||!businessId)return NextResponse.json({error:'Eksik parametre.'},{status:400});
  if(!(await authorizedForBusiness(businessId)))return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
  const db=createServiceClient();
  const{error}=await db.from('appointment_ratings').delete().eq('id',id).eq('business_id',businessId);
  if(error)return NextResponse.json({error:'Silinemedi.'},{status:500});
  return NextResponse.json({ok:true});
}
