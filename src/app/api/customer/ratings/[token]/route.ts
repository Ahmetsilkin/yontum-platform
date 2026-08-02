import{NextRequest,NextResponse}from'next/server';
import{createServiceClient}from'@/lib/supabase-server';

export async function GET(_:NextRequest,{params}:{params:Promise<{token:string}>}){
  const{token}=await params,db=createServiceClient();
  const{data:ap}=await db.from('appointments')
    .select('id,customer_first_name,start_at,status,service_id,staff_id,business_id,services(name),staff_profiles(name),businesses(name,logo_url,primary_color,background_color,text_color,background_scheme,selected_theme_id)')
    .eq('rating_token',token).single();
  if(!ap)return NextResponse.json({error:'Randevu bulunamadı.'},{status:404});
  if(ap.status!=='completed')return NextResponse.json({error:'Bu randevu henüz tamamlanmadı.'},{status:400});
  const{data:existing}=await db.from('appointment_ratings').select('id,stars,comment').eq('appointment_id',ap.id).maybeSingle();
  return NextResponse.json({appointment:ap,existingRating:existing||null});
}

export async function POST(req:NextRequest,{params}:{params:Promise<{token:string}>}){
  const{token}=await params;
  const form=await req.formData();
  const stars=Number(form.get('stars')),comment=String(form.get('comment')||'').trim().slice(0,600),photo=form.get('photo')as File|null;
  if(!stars||stars<1||stars>5)return NextResponse.json({error:'Geçersiz veri.'},{status:400});
  const db=createServiceClient();
  const{data:ap}=await db.from('appointments').select('id,business_id,staff_id,customer_first_name,customer_last_name,status').eq('rating_token',token).single();
  if(!ap)return NextResponse.json({error:'Randevu bulunamadı.'},{status:404});
  if(ap.status!=='completed')return NextResponse.json({error:'Bu randevu henüz tamamlanmadı.'},{status:400});
  const{data:existing}=await db.from('appointment_ratings').select('id').eq('appointment_id',ap.id).maybeSingle();
  if(existing)return NextResponse.json({error:'Bu randevu için zaten değerlendirme yapılmış.'},{status:409});
  let avatarUrl:string|null=null;
  if(photo&&photo.size>0&&photo.size<5*1024*1024){
    const ext=photo.name.split('.').pop()||'jpg',path=`ratings/${ap.id}-${Date.now()}.${ext}`;
    const{error:upErr}=await db.storage.from('business-media').upload(path,photo);
    if(!upErr)avatarUrl=db.storage.from('business-media').getPublicUrl(path).data.publicUrl;
  }
  const{error}=await db.from('appointment_ratings').insert({
    appointment_id:ap.id,
    business_id:ap.business_id,
    staff_id:ap.staff_id,
    customer_name:[ap.customer_first_name,ap.customer_last_name].filter(Boolean).join(' ')||null,
    stars,
    comment:comment||null,
    avatar_url:avatarUrl,
  });
  if(error)return NextResponse.json({error:'Değerlendirme kaydedilemedi.'},{status:500});
  return NextResponse.json({ok:true});
}
