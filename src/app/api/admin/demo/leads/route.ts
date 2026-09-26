import{NextRequest,NextResponse}from'next/server';import{z}from'zod';import{createServiceClient}from'@/lib/supabase-server';import{adminDenied}from'@/lib/admin-api';
import{DEMO_TYPES,DEMO_DEFAULT_THEME,cleanInstagram,cleanPhone,hoursToOsm}from'@/lib/demo-leads';import{DEMO_IMAGE_SETS,guessImageSet}from'@/lib/demo-images';
/* Aday listesi: listele / elle ekle (form ya da satır satır "Ad; Tür; Telefon; Adres") / düzelt / atla */
export async function GET(){
  const denied=await adminDenied();if(denied)return denied;
  const db=createServiceClient();
  const{data:leads,error}=await db.from('demo_leads').select('*').order('created_at',{ascending:false}).limit(1000);
  if(error)return NextResponse.json({error:error.message},{status:400});
  const ids=(leads||[]).map((l:any)=>l.business_id).filter(Boolean);
  const{data:biz}=ids.length?await db.from('businesses').select('id,slug,is_demo,is_published,deleted_at').in('id',ids):{data:[] as any[]};
  const bmap=new Map((biz||[]).map((b:any)=>[b.id,b]));
  const{data:themes}=await db.from('theme_catalog').select('id,business_type,name').eq('is_active',true).in('business_type',[...DEMO_TYPES]).order('sort_order');
  return NextResponse.json({leads:(leads||[]).map((l:any)=>({...l,business:l.business_id?bmap.get(l.business_id)||null:null})),themes:themes||[]});
}
function guessType(label:string):string|null{
  const s=label.toLocaleLowerCase('tr').trim();
  if((DEMO_TYPES as readonly string[]).includes(s))return s;
  if(/berber/.test(s))return 'barber';
  if(/kuaför|kuafor/.test(s))return 'hair_salon';
  if(/güzellik|guzellik|estetik/.test(s))return 'beauty';
  if(/nail|tırnak|tirnak|kirpik|kaş|kas/.test(s))return 'nail_lash';
  if(/spa|masaj/.test(s))return 'spa_massage';
  if(/araba|oto|yıkama|yikama|detay|araç|arac/.test(s))return 'car_care';
  if(/restoran|kafe|cafe|lokanta|kebap|pizza|fırın|firin|pastane|yemek/.test(s))return 'restaurant';
  return null;
}
const TIME=z.string().regex(/^\d{2}:\d{2}$/);
const formSchema=z.object({
  name:z.string().trim().min(2).max(80),
  business_type:z.enum(DEMO_TYPES),
  theme_id:z.string().trim().max(60).nullable().optional(),
  image_set:z.string().trim().max(30).nullable().optional(),
  phone:z.string().max(20).optional(),
  address:z.string().max(200).optional(),
  instagram:z.string().max(120).optional(),
  hours_start:TIME.nullable().optional(),hours_end:TIME.nullable().optional(),
});
export async function POST(req:NextRequest){
  const denied=await adminDenied();if(denied)return denied;
  try{
    const body=await req.json();
    const db=createServiceClient();
    // 1) Kutucuklu form: tek işletme
    if(body&&typeof body==='object'&&body.lead){
      const x=formSchema.parse(body.lead);
      const set=DEMO_IMAGE_SETS.find(s=>s.id===x.image_set&&s.type===x.business_type)?.id||guessImageSet(x.business_type,x.name);
      let theme_id:string|null=null;
      if(x.theme_id){const{data:t}=await db.from('theme_catalog').select('id').eq('id',x.theme_id).eq('business_type',x.business_type).eq('is_active',true).maybeSingle();theme_id=t?.id||null}
      const{data:row,error}=await db.from('demo_leads').insert({source:'manual',name:x.name,business_type:x.business_type,theme_id:theme_id||DEMO_DEFAULT_THEME[x.business_type]||null,image_set:set,phone:cleanPhone(x.phone)||null,address:x.address?.trim()||null,instagram:cleanInstagram(x.instagram)||null,opening_hours:hoursToOsm(x.hours_start,x.hours_end),area:'Elle eklendi'}).select('id').single();
      if(error)return NextResponse.json({error:error.message},{status:400});
      return NextResponse.json({ok:true,added:1,id:row.id});
    }
    // 2) Toplu: satır satır "Ad; Tür; Telefon; Adres"
    const{lines}=z.object({lines:z.string().min(3).max(20000)}).parse(body);
    const rows:any[]=[],bad:string[]=[];
    for(const raw of lines.split('\n').map(x=>x.trim()).filter(Boolean)){
      const[name,type,phone,...addr]=raw.split(';').map(x=>x.trim());
      const t=guessType(type||'');
      if(!name||!t){bad.push(raw);continue}
      rows.push({source:'manual',name:name.slice(0,80),business_type:t,theme_id:DEMO_DEFAULT_THEME[t]||null,image_set:guessImageSet(t,name),phone:cleanPhone(phone)||null,address:addr.join('; ')||null,area:'Elle eklendi'});
    }
    if(rows.length){const{error}=await db.from('demo_leads').insert(rows);if(error)return NextResponse.json({error:error.message},{status:400})}
    return NextResponse.json({ok:true,added:rows.length,bad});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Ad (en az 2 harf) ve kategori zorunlu; alanları kontrol et.'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
const patchSchema=z.object({id:z.string().uuid(),patch:z.object({
  name:z.string().trim().min(2).max(80).optional(),
  business_type:z.enum(DEMO_TYPES).optional(),
  theme_id:z.string().trim().max(60).nullable().optional(),
  image_set:z.string().trim().max(30).nullable().optional(),
  phone:z.string().max(20).optional(),
  address:z.string().max(200).optional(),
  instagram:z.string().max(120).optional(),
  hours_start:TIME.nullable().optional(),hours_end:TIME.nullable().optional(),
  status:z.enum(['new','skipped']).optional(),
})});
export async function PATCH(req:NextRequest){
  const denied=await adminDenied();if(denied)return denied;
  try{
    const{id,patch}=patchSchema.parse(await req.json());
    const{hours_start,hours_end,...rest}=patch;
    const upd:Record<string,any>={...rest};
    if(patch.phone!==undefined)upd.phone=cleanPhone(patch.phone)||null;
    if(patch.address!==undefined)upd.address=patch.address.trim()||null;
    if(patch.instagram!==undefined)upd.instagram=cleanInstagram(patch.instagram)||null;
    if(hours_start!==undefined||hours_end!==undefined)upd.opening_hours=hoursToOsm(hours_start,hours_end);
    // tür değişirse tema/görsel seti yeni türün varsayılanına döner (geçersiz kombinasyon kalmasın)
    if(patch.business_type&&patch.theme_id===undefined)upd.theme_id=DEMO_DEFAULT_THEME[patch.business_type]||null;
    if(patch.business_type&&patch.image_set===undefined){
      const{data:cur}=await createServiceClient().from('demo_leads').select('name').eq('id',id).maybeSingle();
      upd.image_set=guessImageSet(patch.business_type,patch.name||cur?.name||'');
    }
    if(patch.theme_id){
      const{data:cur}=await createServiceClient().from('demo_leads').select('business_type').eq('id',id).maybeSingle();
      const type=patch.business_type||cur?.business_type;
      const{data:t}=await createServiceClient().from('theme_catalog').select('id').eq('id',patch.theme_id).eq('business_type',type).eq('is_active',true).maybeSingle();
      if(!t)return NextResponse.json({error:'Bu tema seçilen kategori için uygun değil.'},{status:400});
    }
    if(patch.image_set&&!DEMO_IMAGE_SETS.some(s=>s.id===patch.image_set))return NextResponse.json({error:'Bilinmeyen görsel seti.'},{status:400});
    const q=createServiceClient().from('demo_leads').update(upd).eq('id',id);
    // üretilmiş bir aday yalnızca sitesi silindiyse (business_id boş) yeniden 'new' yapılabilir
    const{error}=await(patch.status==='new'?q.is('business_id',null):q.neq('status','generated'));
    if(error)return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json({ok:true});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Bilgileri kontrol et.'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
