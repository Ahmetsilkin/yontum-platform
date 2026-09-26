/* Örnek taslak (demo) site üretimi için ortak yardımcılar.
   Veri kaynağı yalnızca OpenStreetMap (ODbL, kaydedilebilir) ve elle girilen kayıtlardır. Google Places içeriği
   (ad/adres/telefon/saat/foto) burada kaydedilmez: Google şartları place_id dışında saklamayı yasaklıyor. */

export const DEMO_TYPES=['restaurant','barber','hair_salon','beauty','nail_lash','spa_massage','car_care'] as const;
export type DemoType=typeof DEMO_TYPES[number];

export const DEMO_TYPE_LABELS:Record<string,string>={
  restaurant:'Restoran / Kafe',barber:'Erkek Berberi',hair_salon:'Kadın Kuaförü',beauty:'Güzellik Merkezi',
  nail_lash:'Nail / Kirpik / Kaş',spa_massage:'Spa / Masaj',car_care:'Araba Bakım / Detailing',
};

/* Demo site için varsayılan tema (fotoğraf yokken de iyi görünen, kendi hero görseli olan temalar tercih edildi) */
export const DEMO_DEFAULT_THEME:Record<string,string>={
  restaurant:'restaurant_ember',barber:'barber_keskin',hair_salon:'hair_salon_zarafet',beauty:'beauty_zarafet',
  nail_lash:'nail_lash_zarafet',spa_massage:'spa_massage_zarafet',car_care:'car_care_detay',
};

export const DEMO_AREAS=[
  {key:'baglica',label:'Bağlıca + Yenibağlıca (Etimesgut)',lat:39.889,lng:32.636,radius:3500},
];

/* Overpass sorgusu: yalnızca hizmet/yemek kategorileri; hepsi tek istekte. Ana sunucu 4+ ayrı koşulda 504 veriyor,
   bu yüzden car_wash amenity listesine katıldı (3 koşul). */
export function buildOverpassQuery(lat:number,lng:number,radius:number):string{
  const a=`around:${Math.round(radius)},${lat},${lng}`;
  return `[out:json][timeout:25];(
 nwr(${a})["amenity"~"^(restaurant|cafe|fast_food|bar|pub|food_court|ice_cream|spa|beauty_salon|car_wash)$"];
 nwr(${a})["shop"~"^(hairdresser|barber|beauty|massage|nail|cosmetics|bakery|pastry|confectionery|car_repair|tyres)$"];
 nwr(${a})["leisure"="spa"];
);out center tags;`;
}

const has=(s:string|undefined,re:RegExp)=>!!s&&re.test(s.toLocaleLowerCase('tr'));

/* OSM etiketlerinden işletme türü tahmini (null → kapsam dışı). Sonradan listede elle düzeltilebilir. */
export function classifyOsm(tags:Record<string,string>):DemoType|null{
  const name=tags.name;
  const amenity=tags.amenity,shop=tags.shop,leisure=tags.leisure;
  if(amenity==='car_wash'||shop==='car_repair'||shop==='tyres')return 'car_care';
  if(amenity==='spa'||leisure==='spa'||shop==='massage')return 'spa_massage';
  if(shop==='nail'||has(name,/nail|tırnak|tirnak|manikür|manikur|kirpik|lash/))return 'nail_lash';
  if(shop==='barber')return 'barber';
  if(shop==='hairdresser'||amenity==='beauty_salon'){
    if(has(name,/berber|barber|erkek/)||tags['hairdresser']==='male'||tags['female']==='no')return 'barber';
    if(has(name,/güzellik|guzellik|beauty|estetik|epilasyon/))return 'beauty';
    return 'hair_salon';
  }
  if(shop==='beauty'||shop==='cosmetics')return 'beauty';
  if(['restaurant','cafe','fast_food','bar','pub','food_court','ice_cream'].includes(amenity||'')||['bakery','pastry','confectionery'].includes(shop||''))return 'restaurant';
  return null;
}

export function osmHasWebsite(tags:Record<string,string>):boolean{
  return !!(tags.website||tags['contact:website']||tags.url||tags['contact:url']);
}

export function osmAddress(tags:Record<string,string>):string{
  const street=tags['addr:street']||'';
  const no=tags['addr:housenumber']||'';
  const hood=tags['addr:suburb']||tags['addr:neighbourhood']||'';
  const district=tags['addr:district']||tags['addr:city']||'';
  const parts=[hood,[street,no].filter(Boolean).join(' '),district].map(x=>x.trim()).filter(Boolean);
  return parts.join(', ');
}

/* "0532 123 45 67" / "+90 312 281 05 05" → "0532 123 45 67" biçimine yakın, yalnızca rakamlı temiz metin */
export function cleanPhone(raw:unknown):string{
  const d=String(raw??'').replace(/[^\d+]/g,'');
  if(!d)return '';
  let n=d.replace(/^\+90/,'0').replace(/^90(?=\d{10}$)/,'0');
  if(/^\d{10}$/.test(n))n='0'+n;
  return /^0\d{10}$/.test(n)?n:'';
}

export type HourRow={day:number;open:boolean;start:string;end:string};

/* OSM opening_hours → 7 günlük çalışma saati. Desteklenmeyen biçim → null (varsayılan saatler kalır).
   Desteklenen: "24/7", "Mo-Su 09:00-22:00", "Mo-Fr 09:00-18:00; Sa 10:00-16:00; Su off" */
export function parseOsmHours(raw:string|null|undefined):HourRow[]|null{
  if(!raw)return null;
  const txt=raw.trim();
  const DAYS=['Su','Mo','Tu','We','Th','Fr','Sa'];   // 0=Pazar
  const rows:HourRow[]=DAYS.map((_,i)=>({day:i,open:false,start:'09:00',end:'20:00'}));
  if(/^24\/7$/i.test(txt)){return rows.map(r=>({...r,open:true,start:'00:00',end:'23:59'}))}
  let any=false;
  for(const part of txt.split(';').map(x=>x.trim()).filter(Boolean)){
    const m=part.match(/^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:\s*,\s*(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)\s+(off|closed|\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})$/i);
    if(!m)return null;
    const days:number[]=[];
    for(const seg of m[1].split(',')){
      const [a,b]=seg.split('-').map(x=>x.trim());
      const i=DAYS.findIndex(d=>d.toLowerCase()===a.toLowerCase());
      if(i<0)return null;
      if(!b){days.push(i);continue}
      const j=DAYS.findIndex(d=>d.toLowerCase()===b.toLowerCase());
      if(j<0)return null;
      // Mo-Su gibi aralıklar Pazartesi'den başlayarak sarar
      const order=[1,2,3,4,5,6,0];
      let s=order.indexOf(i),e=order.indexOf(j);
      if(s<0||e<0)return null;
      for(let k=s;;k=(k+1)%7){days.push(order[k]);if(k===e)break}
    }
    const v=m[2].toLowerCase();
    if(v==='off'||v==='closed'){days.forEach(d=>{rows[d].open=false});any=true;continue}
    const [st,en]=v.split('-').map(x=>x.trim());
    const pad=(t:string)=>{const[h,mm]=t.split(':');return `${h.padStart(2,'0')}:${mm}`};
    let start=pad(st),end=pad(en);
    if(end<=start)end='23:59';   // gece yarısını aşan aralık (DB kısıtı yüzünden) günün sonuna kırpılır
    days.forEach(d=>{rows[d]={day:d,open:true,start,end}});
    any=true;
  }
  return any?rows:null;
}

const TR_MAP:Record<string,string>={ğ:'g',ü:'u',ş:'s',ı:'i',ö:'o',ç:'c',â:'a',î:'i',û:'u'};
export function slugifyTr(v:string):string{
  return v.toLocaleLowerCase('tr').replace(/[ğüşıöçâîû]/g,c=>TR_MAP[c]||c).replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}
/* Tahmin edilmesi zor demo adresi: ad + 5 rastgele karakter (toplam ≤ 40) */
export function demoSlug(name:string):string{
  const base=(slugifyTr(name)||'isletme').slice(0,28).replace(/-+$/,'');
  const alphabet='abcdefghjkmnpqrstuvwxyz23456789';
  let r='';for(let i=0;i<5;i++)r+=alphabet[Math.floor(Math.random()*alphabet.length)];
  return `${base}-${r}`;
}

/* Yönetim formundaki "açılış – kapanış" saatleri ↔ OSM opening_hours metni (her gün aynı) */
export function hoursToOsm(start?:string|null,end?:string|null):string|null{
  if(!start||!end||!/^\d{2}:\d{2}$/.test(start)||!/^\d{2}:\d{2}$/.test(end))return null;
  return `Mo-Su ${start}-${end}`;
}
export function osmToHoursRange(raw?:string|null):{start:string;end:string}|null{
  const m=(raw||'').trim().match(/^Mo-Su\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if(!m)return null;
  const pad=(t:string)=>t.padStart(5,'0');
  return{start:pad(m[1]),end:pad(m[2])};
}
/* "@kullanici", "instagram.com/kullanici/" → "kullanici" */
export function cleanInstagram(raw:unknown):string{
  const s=String(raw??'').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i,'').replace(/[/?#].*$/,'').replace(/^@/,'').trim();
  return /^[A-Za-z0-9._]{1,30}$/.test(s)?s:'';
}
