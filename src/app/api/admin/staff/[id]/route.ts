import{NextRequest,NextResponse}from'next/server';import{createClient,createServiceClient}from'@/lib/supabase-server';
async function context(id:string,ownerOnly=false){const auth=await createClient(),{data:{user}}=await auth.auth.getUser();if(!user)return null;const db=createServiceClient(),{data:staff}=await db.from('staff_profiles').select('*').eq('id',id).single();if(!staff)return null;const{data:m}=await auth.from('business_members').select('role').eq('business_id',staff.business_id).eq('user_id',user.id).single();if(!m||!['owner','manager'].includes(m.role)||(ownerOnly&&m.role!=='owner'))return null;return{auth,db,user,staff,role:m.role}}
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  const{id}=await params,ctx=await context(id);
  if(!ctx)return NextResponse.json({error:'Yetkiniz yok.'},{status:403});
  const body=await req.json();
  /* İki farklı çağrı şekli aynı endpoint'i paylaşıyor: (1) sadece `is_active`
     içeren küçük payload — panel kartındaki "Pasife Al/Aktifleştir" düğmesi
     (toggleStaff), (2) profil düzenleme formunun gönderdiği daha büyük
     payload. Hangisi geldiğine `is_active in body` ile karar veriyoruz. */
  if('is_active' in body){
    if(ctx.staff.is_default)return NextResponse.json({error:'Ana Takvim pasife alınamaz.'},{status:400});
    await ctx.db.from('staff_profiles').update({is_active:!!body.is_active}).eq('id',id);
    await ctx.db.from('audit_logs').insert({business_id:ctx.staff.business_id,actor_user_id:ctx.user.id,action:body.is_active?'staff_activated':'staff_deactivated',entity_type:'staff',entity_id:id});
    return NextResponse.json({ok:true});
  }
  const{name,username,email,phone,title,bio,photoUrl,serviceIds}=body;
  const update:Record<string,any>={};
  if(typeof name==='string'&&name.trim())update.name=name.trim();
  if(typeof username==='string'&&username.trim())update.username=username.trim();
  if(typeof phone==='string')update.phone=phone||null;
  if(typeof title==='string')update.title=title||null;
  if(typeof bio==='string')update.bio=bio||null;
  if(typeof photoUrl==='string')update.photo_url=photoUrl||null;
  /* E-posta SADECE zaten panele girişi olan (user_id dolu) bir çalışan için
     değiştirilebiliyor — Supabase Auth hesabının kendisini de güncelliyoruz.
     Girişi olmayan bir çalışana buradan e-posta "eklemek" yeni bir auth
     hesabı oluşturmayı gerektirir (şifre üretme, davet gönderme...) — bu,
     basit bir profil düzenlemesinden çok "çalışanı sil, e-postalı yeniden
     ekle" akışına denk düşüyor; o yüzden bilinçli olarak burada değil. */
  if(typeof email==='string'&&email.trim()&&ctx.staff.user_id){
    const{error:authErr}=await ctx.db.auth.admin.updateUserById(ctx.staff.user_id,{email:email.trim()});
    if(authErr)return NextResponse.json({error:authErr.message},{status:400});
    update.email=email.trim();
  }
  if(Object.keys(update).length){
    const{error}=await ctx.db.from('staff_profiles').update(update).eq('id',id);
    if(error)return NextResponse.json({error:error.message},{status:400});
  }
  if(Array.isArray(serviceIds)){
    await ctx.db.from('staff_services').delete().eq('staff_id',id);
    if(serviceIds.length)await ctx.db.from('staff_services').insert(serviceIds.map((service_id:string)=>({staff_id:id,service_id})));
  }
  await ctx.db.from('audit_logs').insert({business_id:ctx.staff.business_id,actor_user_id:ctx.user.id,action:'staff_updated',entity_type:'staff',entity_id:id});
  return NextResponse.json({ok:true});
}
export async function DELETE(req:NextRequest,{params}:{params:Promise<{id:string}>}){const{id}=await params,ctx=await context(id,true);if(!ctx)return NextResponse.json({error:'Yalnızca işletme sahibi çalışan silebilir.'},{status:403});if(ctx.staff.is_default)return NextResponse.json({error:'Ana Takvim silinemez.'},{status:400});const body=await req.json().catch(()=>({})),{data:future}=await ctx.db.from('appointments').select('id').eq('staff_id',id).neq('status','cancelled').gte('start_at',new Date().toISOString());if(future?.length){if(body.strategy==='transfer'&&body.targetStaffId){const{data:target}=await ctx.db.from('staff_profiles').select('id').eq('id',body.targetStaffId).eq('business_id',ctx.staff.business_id).eq('is_active',true).single();if(!target)return NextResponse.json({error:'Hedef çalışan geçersiz.'},{status:400});await ctx.db.from('appointments').update({staff_id:target.id,updated_at:new Date().toISOString()}).in('id',future.map(x=>x.id))}else if(body.strategy==='cancel'){await ctx.db.from('appointments').update({status:'cancelled',cancelled_by:'business',cancellation_reason:'Çalışan işletmeden ayrıldığı için iptal edildi.',cancelled_at:new Date().toISOString(),updated_at:new Date().toISOString()}).in('id',future.map(x=>x.id))}else return NextResponse.json({error:'Çalışanın gelecek randevuları var.',futureCount:future.length,requiresStrategy:true},{status:409})}const authUserId=ctx.staff.user_id;await ctx.db.from('business_members').delete().eq('business_id',ctx.staff.business_id).eq('user_id',authUserId);await ctx.db.from('staff_profiles').delete().eq('id',id);await ctx.db.from('audit_logs').insert({business_id:ctx.staff.business_id,actor_user_id:ctx.user.id,action:'staff_deleted',entity_type:'staff',entity_id:id,details:{name:ctx.staff.name,strategy:body.strategy||'none'}});if(authUserId){const{count}=await ctx.db.from('business_members').select('*',{count:'exact',head:true}).eq('user_id',authUserId);if(!count)await ctx.db.auth.admin.deleteUser(authUserId)}return NextResponse.json({ok:true})}
