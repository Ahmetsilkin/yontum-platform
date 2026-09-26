import{NextRequest,NextResponse}from'next/server';import{z}from'zod';import{createServiceClient}from'@/lib/supabase-server';import{adminDenied}from'@/lib/admin-api';
import{DEMO_TYPES,cleanPhone}from'@/lib/demo-leads';
/* Aday listesi: listele / elle ekle (satır satır "Ad; Tür; Telefon; Adres") / düzelt / atla */
export async function GET(){
  const denied=await adminDenied();if(denied)return denied;
  const db=createServiceClient();
  const{data:leads,error}=await db.from('demo_leads').select('*').order('created_at',{ascending:false}).limit(1000);
  if(error)return NextResponse.json({error:error.message},{status:400});
  const ids=(leads||[]).map((l:any)=>l.business_id).filter(Boolean);
  const{data:biz}=ids.length?await db.from('businesses').select('id,slug,is_demo,is_published,deleted_at').in('id',ids):{data:[] as any[]};
  const bmap=new Map((biz||[]).map((b:any)=>[b.id,b]));
  return NextResponse.json({leads:(leads||[]).map((l:any)=>({...l,business:l.business_id?bmap.get(l.business_id)||null:null}))});
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
export async function POST(req:NextRequest){
  const denied=await adminDenied();if(denied)return denied;
  try{
    const{lines}=z.object({lines:z.string().min(3).max(20000)}).parse(await req.json());
    const rows:any[]=[],bad:string[]=[];
    for(const raw of lines.split('\n').map(x=>x.trim()).filter(Boolean)){
      const[name,type,phone,...addr]=raw.split(';').map(x=>x.trim());
      const t=guessType(type||'');
      if(!name||!t){bad.push(raw);continue}
      rows.push({source:'manual',name:name.slice(0,80),business_type:t,phone:cleanPhone(phone)||null,address:addr.join('; ')||null,area:'Elle eklendi'});
    }
    if(rows.length){const{error}=await createServiceClient().from('demo_leads').insert(rows);if(error)return NextResponse.json({error:error.message},{status:400})}
    return NextResponse.json({ok:true,added:rows.length,bad});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Liste boş ya da çok uzun.'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
const patchSchema=z.object({id:z.string().uuid(),patch:z.object({name:z.string().trim().min(2).max(80).optional(),business_type:z.enum(DEMO_TYPES).optional(),phone:z.string().max(20).optional(),address:z.string().max(200).optional(),status:z.enum(['new','skipped']).optional()})});
export async function PATCH(req:NextRequest){
  const denied=await adminDenied();if(denied)return denied;
  try{
    const{id,patch}=patchSchema.parse(await req.json());
    const upd:Record<string,any>={...patch};
    if(patch.phone!==undefined)upd.phone=cleanPhone(patch.phone)||null;
    if(patch.address!==undefined)upd.address=patch.address.trim()||null;
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
