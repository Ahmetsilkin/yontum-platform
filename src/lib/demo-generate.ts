import type{SupabaseClient}from'@supabase/supabase-js';
import{DEMO_DEFAULT_THEME,cleanInstagram,demoSlug,parseOsmHours}from'@/lib/demo-leads';
import{getImageSet,guessImageSet}from'@/lib/demo-images';
import{buildSampleReviews}from'@/lib/demo-reviews';

/* Bir aday işletmeden "örnek taslak" site üretir. Mevcut kayıt akışı (create_business_v2) yeniden kullanılır:
   her demo kendi sahte hesabına bağlanır (gerçek telefonla eşleşmez, şifresi hiçbir yerde tutulmaz). Sonra
   ad/adres/telefon/saatler yazılır, tema seçilir, site is_demo=true (arama motoru dışı + etiketli + randevusuz)
   işaretlenir. Google içeriği kaydedilmez; yalnızca (anahtar varsa) place_id bulunup canlı yorumlar bağlanır. */
export type DemoResult={leadId:string;ok:boolean;slug?:string;url?:string;googleLinked?:boolean;error?:string};

async function findPlaceId(lead:any):Promise<string|null>{
  const key=process.env.GOOGLE_PLACES_API_KEY;
  if(!key||lead.lat==null||lead.lng==null)return null;
  try{
    const r=await fetch('https://places.googleapis.com/v1/places:searchText',{
      method:'POST',
      headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.id'},   // yalnızca kimlik alanı
      body:JSON.stringify({textQuery:`${lead.name} ${lead.address||'Etimesgut Ankara'}`,languageCode:'tr',maxResultCount:1,locationBias:{circle:{center:{latitude:lead.lat,longitude:lead.lng},radius:300}}}),
    });
    if(!r.ok)return null;
    const j=await r.json();
    return j.places?.[0]?.id||null;
  }catch{return null}
}

/* Seçilen tema bu işletme türüne aitse (ve aktifse) onu, değilse türün varsayılan demo temasını döndürür;
   tema renklerini (palet) de getirir. */
export async function resolveTheme(db:SupabaseClient,businessType:string,wanted?:string|null){
  const tryIds=[wanted,DEMO_DEFAULT_THEME[businessType]].filter(Boolean) as string[];
  for(const id of tryIds){
    const{data}=await db.from('theme_catalog').select('id,config,business_type,is_active').eq('id',id).maybeSingle();
    if(data&&data.is_active&&data.business_type===businessType)return{id:data.id as string,palette:(data.config as any)?.palette||{}};
  }
  return null;
}
export const themePatch=(t:{id:string;palette:any}|null)=>t?{
  selected_theme_id:t.id,
  ...(t.palette.primary?{primary_color:t.palette.primary}:{}),
  ...(t.palette.background?{background_color:t.palette.background}:{}),
  ...(t.palette.text?{text_color:t.palette.text}:{}),
}:{};

/* Kapak + galeriyi seçilen görsel setiyle değiştirir. Yalnızca demo örnek (Unsplash) görselleri silinir;
   işletmenin kendi yüklediği (Supabase) galeri görsellerine dokunulmaz. */
export async function applyImageSet(db:SupabaseClient,businessId:string,businessType:string,setId:string|null|undefined,name:string,opts?:{keepCover?:boolean}){
  const set=getImageSet(setId,businessType);
  if(!opts?.keepCover)await db.from('businesses').update({cover_url:set.cover,cover_type:'image'}).eq('id',businessId);
  await db.from('gallery_images').delete().eq('business_id',businessId).like('image_url','https://images.unsplash.com/%');
  await db.from('gallery_images').insert(set.gallery.map((image_url,i)=>({business_id:businessId,image_url,alt_text:`${name} örnek görsel`,sort_order:i})));
  return set.id;
}

/* Sitedeki "Müşteri değerlendirmeleri" boş kalmasın diye kategoriye uygun ÖRNEK yorumlar (is_sample=true).
   Gerçek yorumlara dokunmaz; demo devredilirken removeSampleReviews ile hepsi silinir. */
export async function removeSampleReviews(db:SupabaseClient,businessId:string){
  await db.from('appointment_ratings').delete().eq('business_id',businessId).eq('is_sample',true);
}
export async function applySampleReviews(db:SupabaseClient,businessId:string,businessType:string,setId?:string|null,count=7){
  await removeSampleReviews(db,businessId);
  const rows=buildSampleReviews(businessType,setId,count).map(r=>({business_id:businessId,customer_name:r.name,stars:r.stars,comment:r.comment,service_label:r.service,is_manual:true,is_sample:true,created_at:r.createdAt}));
  const{error}=await db.from('appointment_ratings').insert(rows);
  return error?0:rows.length;
}

/* OSM biçimindeki çalışma saatlerini işletmenin (ve sahibinin) takvimine yazar. Okunamazsa dokunmaz. */
export async function applyHours(db:SupabaseClient,businessId:string,opening:string|null|undefined){
  const rows=parseOsmHours(opening);
  if(!rows)return false;
  const{data:staff}=await db.from('staff_profiles').select('id').eq('business_id',businessId);
  for(const r of rows){
    const hours={is_open:r.open,start_time:r.start,end_time:r.end};
    await db.from('working_hours').update(hours).eq('business_id',businessId).eq('day_of_week',r.day);
    for(const s of staff||[])await db.from('staff_working_hours').update(hours).eq('staff_id',s.id).eq('day_of_week',r.day);
  }
  return true;
}

export async function generateDemoBusiness(db:SupabaseClient,lead:any,origin:string):Promise<DemoResult>{
  const slug=demoSlug(lead.name);
  const email=`demo-${slug}@demo.megsak.invalid`;
  const password=`${crypto.randomUUID()}${crypto.randomUUID()}`;
  const{data:created,error:userErr}=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{demo:true}});
  if(userErr||!created.user)return{leadId:lead.id,ok:false,error:userErr?.message||'Hesap açılamadı.'};
  const uid=created.user.id;
  try{
    const{data:bid,error:bizErr}=await db.rpc('create_business_v2',{p_name:String(lead.name).slice(0,80),p_slug:slug,p_phone:lead.phone||'',p_business_type:lead.business_type,p_owner_user_id:uid});
    if(bizErr||!bid)throw new Error(bizErr?.message||'İşletme oluşturulamadı.');
    const businessId=bid as string;

    const theme=await resolveTheme(db,lead.business_type,lead.theme_id);
    const set=getImageSet(lead.image_set||guessImageSet(lead.business_type,lead.name),lead.business_type);
    const placeId=await findPlaceId(lead);
    const instagram=cleanInstagram(lead.instagram);
    const patch:Record<string,any>={
      address:lead.address||null,phone:lead.phone||'',
      ...themePatch(theme),
      cover_url:set.cover,cover_type:'image',
      ...(instagram?{instagram}:{}),
      is_demo:true,is_published:true,
      demo_meta:{lead_id:lead.id,source:lead.source,generated_at:new Date().toISOString()},
      ...(placeId?{google_place_id:placeId,google_maps_url:`https://www.google.com/maps/place/?q=place_id:${placeId}`,show_google_reviews:true}:{}),
    };
    const{error:upErr}=await db.from('businesses').update(patch).eq('id',businessId);
    if(upErr)throw new Error(upErr.message);

    await applyImageSet(db,businessId,lead.business_type,set.id,lead.name,{keepCover:true});
    await applySampleReviews(db,businessId,lead.business_type,set.id);
    await applyHours(db,businessId,lead.opening_hours);
    await db.from('demo_leads').update({status:'generated',business_id:businessId}).eq('id',lead.id);
    return{leadId:lead.id,ok:true,slug,url:`${origin}/site/${slug}`,googleLinked:!!placeId};
  }catch(e:any){
    await db.auth.admin.deleteUser(uid);   // yarım kalan hesabı temizle
    return{leadId:lead.id,ok:false,error:e?.message||'Üretilemedi.'};
  }
}

export type DemoSiteEdit={name?:string;phone?:string|null;address?:string|null;instagram?:string|null;theme_id?:string|null;image_set?:string|null;opening_hours?:string|null;reviews?:'regenerate'|'remove'};

/* Üretilmiş bir demo siteyi (henüz devredilmediyse) düzenler; ilgili aday kaydını da senkron tutar. */
export async function updateDemoSite(db:SupabaseClient,businessId:string,edit:DemoSiteEdit):Promise<{ok:boolean;error?:string}>{
  const{data:biz}=await db.from('businesses').select('id,name,business_type,is_demo,demo_meta').eq('id',businessId).maybeSingle();
  if(!biz?.is_demo)return{ok:false,error:'Bu işletme bir demo değil (devredilmiş olabilir).'};
  const patch:Record<string,any>={};
  const leadPatch:Record<string,any>={};
  if(edit.name){patch.name=edit.name;leadPatch.name=edit.name}
  if(edit.phone!==undefined){patch.phone=edit.phone||'';leadPatch.phone=edit.phone||null}
  if(edit.address!==undefined){patch.address=edit.address||null;leadPatch.address=edit.address||null}
  if(edit.instagram!==undefined){const ig=cleanInstagram(edit.instagram);patch.instagram=ig||null;leadPatch.instagram=ig||null}
  if(edit.theme_id){
    const theme=await resolveTheme(db,biz.business_type,edit.theme_id);
    if(!theme||theme.id!==edit.theme_id)return{ok:false,error:'Bu tema bu işletme türü için uygun değil.'};
    Object.assign(patch,themePatch(theme));leadPatch.theme_id=theme.id;
  }
  if(Object.keys(patch).length){
    const{error}=await db.from('businesses').update(patch).eq('id',businessId);
    if(error)return{ok:false,error:error.message};
  }
  if(edit.image_set){
    const set=getImageSet(edit.image_set,biz.business_type);
    await applyImageSet(db,businessId,biz.business_type,set.id,edit.name||biz.name);
    leadPatch.image_set=set.id;
    // görsel seti değişince (ör. kafe → fırın) örnek yorumlar da yeni türe uygun olsun; yorumlar kapatıldıysa dokunma
    if(edit.reviews!=='remove'){const{count}=await db.from('appointment_ratings').select('id',{count:'exact',head:true}).eq('business_id',businessId).eq('is_sample',true);if(count)await applySampleReviews(db,businessId,biz.business_type,set.id)}
  }
  if(edit.reviews==='remove')await removeSampleReviews(db,businessId);
  if(edit.reviews==='regenerate'){
    const{data:cur}=await db.from('demo_leads').select('image_set').eq('id',(biz.demo_meta as any)?.lead_id||'00000000-0000-0000-0000-000000000000').maybeSingle();
    await applySampleReviews(db,businessId,biz.business_type,edit.image_set||cur?.image_set||guessImageSet(biz.business_type,biz.name));
  }
  if(edit.opening_hours!==undefined){
    leadPatch.opening_hours=edit.opening_hours||null;
    if(edit.opening_hours)await applyHours(db,businessId,edit.opening_hours);
  }
  const leadId=(biz.demo_meta as any)?.lead_id;
  if(leadId&&Object.keys(leadPatch).length)await db.from('demo_leads').update(leadPatch).eq('id',leadId);
  return{ok:true};
}
