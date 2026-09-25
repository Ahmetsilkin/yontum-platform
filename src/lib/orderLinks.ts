/* Restoran temalarındaki "Sipariş Ver" bağlantıları: işletme birden fazla sipariş sitesi ekleyebilir
   (Yemeksepeti, Getir Yemek, Trendyol Yemek …). Panel kaydederken de, site okurken de aynı doğrulama
   kullanılır: yalnızca http(s) adresleri geçer (javascript: gibi adresler asla link olmaz). */
export type OrderLink={name:string;url:string};

export const MAX_ORDER_LINKS=8;

/* "https://www.yemeksepeti.com/x" → "Yemeksepeti" (ad boş bırakılırsa yedek olarak kullanılır) */
export function orderSiteNameFromUrl(url:string):string{
  try{
    const host=new URL(url).hostname.replace(/^www\./i,'');
    const label=host.split('.')[0]||host;
    return label.charAt(0).toLocaleUpperCase('tr')+label.slice(1);
  }catch{return 'Sipariş'}
}

/* Kullanıcı "yemeksepeti.com/..." yazdıysa https:// ekler; http(s) olmayan her şeyi ('' döner) reddeder. */
export function normalizeOrderUrl(raw:unknown):string{
  const s=String(raw??'').trim();
  if(!s)return '';
  const withScheme=/^[a-z][a-z0-9+.-]*:/i.test(s)?s:`https://${s}`;
  if(!/^https?:\/\//i.test(withScheme))return '';
  try{return new URL(withScheme).toString()}catch{return ''}
}

/* Ham değeri (jsonb dizisi ya da JSON metni) temiz bir listeye çevirir: geçersiz adresler atılır,
   boş ad adresten türetilir, aynı adres iki kez eklenmez, en fazla MAX_ORDER_LINKS kayıt. */
export function normalizeOrderLinks(raw:unknown):OrderLink[]{
  let arr:any=raw;
  if(typeof raw==='string'){try{arr=JSON.parse(raw)}catch{arr=[]}}
  if(!Array.isArray(arr))return [];
  const out:OrderLink[]=[];
  const seen=new Set<string>();
  for(const item of arr){
    if(!item||typeof item!=='object')continue;
    const url=normalizeOrderUrl((item as any).url);
    if(!url||seen.has(url))continue;
    seen.add(url);
    const name=String((item as any).name??'').trim().slice(0,40)||orderSiteNameFromUrl(url);
    out.push({name,url});
    if(out.length>=MAX_ORDER_LINKS)break;
  }
  return out;
}

/* Bir işletmenin sitede gösterilecek sipariş bağlantıları. Eski tek alan (delivery_url) da geçerli sayılır. */
export function getOrderLinks(b:any):OrderLink[]{
  const list=normalizeOrderLinks(b?.order_links);
  if(list.length)return list;
  const legacy=normalizeOrderUrl(b?.delivery_url);
  return legacy?[{name:orderSiteNameFromUrl(legacy),url:legacy}]:[];
}
