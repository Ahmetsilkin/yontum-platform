import{NextRequest,NextResponse}from'next/server';
import{createClient,createServiceClient}from'@/lib/supabase-server';
import{z}from'zod';

const bodySchema=z.object({
  businessId:z.string().uuid(),
  customerName:z.string().trim().min(1).max(120),
  stars:z.number().int().min(1).max(5),
  comment:z.string().trim().min(1).max(600),
});

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
  const{data}=await db.from('appointment_ratings').select('id,customer_name,stars,comment,is_manual,created_at').eq('business_id',businessId).order('created_at',{ascending:false});
  return NextResponse.json({ratings:data||[]});
}

export async function POST(req:NextRequest){
  let body;
  try{body=bodySchema.parse(await req.json())}catch{return NextResponse.json({error:'Geçersiz veri.'},{status:400})}
  if(!(await authorizedForBusiness(body.businessId)))return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
  const db=createServiceClient();
  const{error}=await db.from('appointment_ratings').insert({
    business_id:body.businessId,
    customer_name:body.customerName,
    stars:body.stars,
    comment:body.comment,
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
