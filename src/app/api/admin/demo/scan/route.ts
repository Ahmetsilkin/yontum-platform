import{NextRequest,NextResponse}from'next/server';import{z}from'zod';import{createServiceClient}from'@/lib/supabase-server';import{adminDenied}from'@/lib/admin-api';
import{buildOverpassQuery,classifyOsm,osmHasWebsite,osmAddress,cleanPhone,DEMO_DEFAULT_THEME}from'@/lib/demo-leads';import{guessImageSet}from'@/lib/demo-images';
export const maxDuration=60;
const schema=z.object({lat:z.number().min(-90).max(90),lng:z.number().min(-180).max(180),radius:z.number().min(200).max(6000),area:z.string().trim().max(60).optional()});
// Herkese açık Overpass sunucuları zaman zaman 504 verir: ana sunucu, yedek, ana sunucu (tekrar), ikinci yedek
const ENDPOINTS=['https://overpass-api.de/api/interpreter','https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
/* Bölgeyi OpenStreetMap'ten (Overpass) tarar; yeni işletmeleri demo_leads'e ekler. Var olanlara (ve üzerlerindeki
   elle düzeltmelere) dokunmaz. Google verisi kullanılmaz/saklanmaz. */
export async function POST(req:NextRequest){
  const denied=await adminDenied();if(denied)return denied;
  try{
    const x=schema.parse(await req.json());
    let json:any=null,lastErr='';
    const deadline=Date.now()+52000;
    for(const url of ENDPOINTS){
      const left=deadline-Date.now();if(left<4000)break;
      try{
        const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'megsak-demo-scan/1.0'},body:new URLSearchParams({data:buildOverpassQuery(x.lat,x.lng,x.radius)}),signal:AbortSignal.timeout(Math.min(24000,left))});
        if(!r.ok){lastErr=`HTTP ${r.status}`;continue}
        json=await r.json();break;
      }catch(e:any){lastErr=e?.message||'bağlantı hatası'}
    }
    if(!json)return NextResponse.json({error:`Harita verisi alınamadı (${lastErr}). Biraz sonra tekrar dene.`},{status:502});
    const els:any[]=json.elements||[];
    let noName=0,outOfScope=0,chains=0;
    const rows:any[]=[];
    for(const e of els){
      const t:Record<string,string>=e.tags||{};
      if(!t.name){noName++;continue}
      if(t['brand:wikidata']){chains++;continue}   // zincir markalar (Starbucks, Domino's…) demo hedefi değil
      const type=classifyOsm(t);
      if(!type){outOfScope++;continue}
      const pt=e.center||{lat:e.lat,lon:e.lon};
      rows.push({source:'osm',source_ref:`${e.type}/${e.id}`,name:t.name.slice(0,80),business_type:type,theme_id:DEMO_DEFAULT_THEME[type]||null,image_set:guessImageSet(type,t.name,t),phone:cleanPhone(t.phone||t['contact:phone'])||null,address:osmAddress(t)||null,lat:pt?.lat??null,lng:pt?.lon??null,opening_hours:t.opening_hours||null,has_website:osmHasWebsite(t),area:x.area||null});
    }
    const db=createServiceClient();
    const{data:existing}=await db.from('demo_leads').select('source_ref').eq('source','osm').in('source_ref',rows.map(r=>r.source_ref));
    const have=new Set((existing||[]).map((r:any)=>r.source_ref));
    const fresh=rows.filter(r=>!have.has(r.source_ref));
    if(fresh.length){const{error}=await db.from('demo_leads').insert(fresh);if(error)return NextResponse.json({error:error.message},{status:400})}
    return NextResponse.json({ok:true,found:els.length,added:fresh.length,alreadyKnown:rows.length-fresh.length,noName,outOfScope,chains});
  }catch(e){
    if(e instanceof z.ZodError)return NextResponse.json({error:'Konum bilgisini kontrol et.'},{status:400});
    return NextResponse.json({error:'Beklenmeyen hata.'},{status:500});
  }
}
