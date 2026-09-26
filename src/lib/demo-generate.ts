import type{SupabaseClient}from'@supabase/supabase-js';
import{DEMO_DEFAULT_THEME,demoSlug,parseOsmHours}from'@/lib/demo-leads';import{DEMO_IMAGES}from'@/lib/demo-images';

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

    const themeId=DEMO_DEFAULT_THEME[lead.business_type];
    let pal:any={};
    if(themeId){const{data:cat}=await db.from('theme_catalog').select('config').eq('id',themeId).maybeSingle();pal=cat?.config?.palette||{}}
    const placeId=await findPlaceId(lead);
    const img=DEMO_IMAGES[lead.business_type];
    const patch:Record<string,any>={
      address:lead.address||null,phone:lead.phone||'',
      ...(themeId?{selected_theme_id:themeId}:{}),
      ...(pal.primary?{primary_color:pal.primary}:{}),...(pal.background?{background_color:pal.background}:{}),...(pal.text?{text_color:pal.text}:{}),
      ...(img?{cover_url:img.cover,cover_type:'image'}:{}),
      is_demo:true,is_published:true,
      demo_meta:{lead_id:lead.id,source:lead.source,generated_at:new Date().toISOString()},
      ...(placeId?{google_place_id:placeId,google_maps_url:`https://www.google.com/maps/place/?q=place_id:${placeId}`,show_google_reviews:true}:{}),
    };
    const{error:upErr}=await db.from('businesses').update(patch).eq('id',businessId);
    if(upErr)throw new Error(upErr.message);

    // kategoriye uygun örnek galeri görselleri
    if(img)await db.from('gallery_images').insert(img.gallery.map((image_url,i)=>({business_id:businessId,image_url,alt_text:`${lead.name} örnek görsel`,sort_order:i})));

    // OSM'den saat okunabildiyse çalışma saatlerini (ve sahibin takvimini) buna göre yaz
    const rows=parseOsmHours(lead.opening_hours);
    if(rows){
      const{data:staff}=await db.from('staff_profiles').select('id').eq('business_id',businessId);
      for(const r of rows){
        const hours={is_open:r.open,start_time:r.start,end_time:r.end};
        await db.from('working_hours').update(hours).eq('business_id',businessId).eq('day_of_week',r.day);
        for(const s of staff||[])await db.from('staff_working_hours').update(hours).eq('staff_id',s.id).eq('day_of_week',r.day);
      }
    }
    await db.from('demo_leads').update({status:'generated',business_id:businessId}).eq('id',lead.id);
    return{leadId:lead.id,ok:true,slug,url:`${origin}/site/${slug}`,googleLinked:!!placeId};
  }catch(e:any){
    await db.auth.admin.deleteUser(uid);   // yarım kalan hesabı temizle
    return{leadId:lead.id,ok:false,error:e?.message||'Üretilemedi.'};
  }
}
