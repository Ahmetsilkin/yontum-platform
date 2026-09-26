/* Demo (örnek taslak) sitelerde kullanılan kategoriye uygun örnek görseller. Unsplash lisanslı (ücretsiz, atıf
   zorunlu değil) ve doğrudan images.unsplash.com'dan gösterilir. İşletmenin kendi/Google fotoğrafları kullanılmaz;
   işletmeci demoyu devralınca panelden kendi fotoğraflarını yükler.
   Her "set" bir kapak + 4 galeri görselinden oluşur. Bir işletme türünün birden fazla seti olabilir (ör. restoran:
   kebap / kafe / fırın / hızlı yemek); yönetim ekranında her demo için set önizlemesiyle seçilir. */
const u=(id:string)=>`https://images.unsplash.com/photo-${id}?q=80&w=1920&auto=format&fit=crop`;
/* Önizleme küçük resmi (yönetim ekranı) */
export const demoThumb=(url:string)=>url.replace('q=80&w=1920','q=60&w=360&h=240');

export type DemoImageSet={id:string;type:string;label:string;cover:string;gallery:string[]};

export const DEMO_IMAGE_SETS:DemoImageSet[]=[
  {id:'barber',type:'barber',label:'Berber dükkânı',cover:u('1585747860715-2ba37e788b70'),gallery:['1621605815971-fbc98d665033','1621645582931-d1d3e6564943','1781455793310-8427c96454c7','1503951914875-452162b0f3f1'].map(u)},
  {id:'hair_salon',type:'hair_salon',label:'Kuaför salonu',cover:u('1781450090585-1a511b7066d9'),gallery:['1521590832167-7bcbfaa6381f','1600948836101-f9ffda59d250','1633681926022-84c23e8cb2d6','1637777277337-f114350fb088'].map(u)},
  {id:'beauty',type:'beauty',label:'Güzellik merkezi',cover:u('1610289982320-3891f7c9fd6d'),gallery:['1731514771613-991a02407132','1562322140-8baeececf3df','1580618672591-eb180b1a973f','1634449571010-02389ed0f9b0'].map(u)},
  {id:'nail_lash',type:'nail_lash',label:'Nail / Kirpik',cover:u('1658492055212-e1acbccfca5a'),gallery:['1619607146034-5a05296c8f9a','1696342003838-4a8f9f36588c','1659391542239-9648f307c0b1','1772322586785-3a34772cbc61'].map(u)},
  {id:'spa_massage',type:'spa_massage',label:'Spa / Masaj',cover:u('1761470575018-135c213340eb'),gallery:['1757940113920-69e3686438d3','1773924093206-9a433a14bb44','1776763255459-99ddd8eebbfc','1693578538512-fc66f318c833'].map(u)},
  {id:'car_care',type:'car_care',label:'Oto yıkama / Detailing',cover:u('1608506375591-b90e1f955e4b'),gallery:['1633014041037-f5446fb4ce99','1708805282683-50a060eba80f','1605437241278-c1806d14a4d9','1708805282706-f44730b7e527'].map(u)},
  // Restoran / kafe alt türleri: kapaklar bilerek yemek/içecek yakın çekimi (belirsiz iç mekân fotoğrafı yok)
  {id:'rest_kebab',type:'restaurant',label:'Kebap / Lokanta / Izgara',cover:u('1555939594-58d7cb561ad1'),gallery:['1657053460900-3a12f32b592f','1544025162-d76694265947','1651440204296-a79fa9988007','1568376794508-ae52c6ab3929'].map(u)},
  {id:'rest_cafe',type:'restaurant',label:'Kafe / Kahve / Tatlı',cover:u('1509042239860-f550ce710b93'),gallery:['1495474472287-4d71bcdd2085','1621135177072-57c9b6242e7a','1486427944299-d1955d23e34d','1504754524776-8f4f37790ca0'].map(u)},
  {id:'rest_bakery',type:'restaurant',label:'Fırın / Pastane',cover:u('1555507036-ab1f4038808a'),gallery:['1509440159596-0249088772ff','1486427944299-d1955d23e34d','1504754524776-8f4f37790ca0','1509042239860-f550ce710b93'].map(u)},
  {id:'rest_fastfood',type:'restaurant',label:'Burger / Pizza / Döner',cover:u('1568901346375-23c9450c58cd'),gallery:['1565299624946-b28f40a0ae38','1513104890138-7c749659a591','1457460866886-40ef8d4b42a0','1651981075280-9a9e01acbff0'].map(u)},
  {id:'rest_general',type:'restaurant',label:'Restoran (genel)',cover:u('1414235077428-338989a2e8c0'),gallery:['1651440204227-a9a5b9d19712','1706650616334-97875fae8521','1504674900247-0877df9cc836','1652690772450-2cc9c53060f5'].map(u)},
];

export const DEFAULT_IMAGE_SET:Record<string,string>={
  barber:'barber',hair_salon:'hair_salon',beauty:'beauty',nail_lash:'nail_lash',spa_massage:'spa_massage',car_care:'car_care',restaurant:'rest_general',
};

export const imageSetsFor=(type:string)=>DEMO_IMAGE_SETS.filter(s=>s.type===type);
export const getImageSet=(id:string|null|undefined,type:string):DemoImageSet=>
  DEMO_IMAGE_SETS.find(s=>s.id===id&&s.type===type)||DEMO_IMAGE_SETS.find(s=>s.id===DEFAULT_IMAGE_SET[type])||DEMO_IMAGE_SETS[0];

/* Ad (ve varsa OSM etiketleri) → restoran alt türü tahmini. Yanlışsa yönetim ekranında değiştirilir. */
export function guessImageSet(type:string,name:string,tags?:Record<string,string>):string{
  if(type!=='restaurant')return DEFAULT_IMAGE_SET[type]||DEMO_IMAGE_SETS[0].id;
  const s=(name||'').toLocaleLowerCase('tr');
  const cuisine=(tags?.cuisine||'').toLowerCase();
  if(tags?.shop==='bakery'||tags?.shop==='pastry'||tags?.shop==='confectionery'||/fırın|firin|pastane|unlu mam|börek|borek|simit|ekmek/.test(s))return 'rest_bakery';
  if(tags?.amenity==='cafe'||tags?.amenity==='ice_cream'||/cafe|kafe|coffee|kahve|kafeterya|tatlı|tatli|dondurma|bistro|çay|cay bahçe/.test(s))return 'rest_cafe';
  if(/pizza|burger|döner|doner|dürüm|durum|tost|hamburger|çiğ ?köfte|cig ?kofte|fast/.test(s)||tags?.amenity==='fast_food'||/pizza|burger|kebab_?fast/.test(cuisine))return 'rest_fastfood';
  if(/kebap|kebab|kebabı|pide|lahmacun|ocakbaşı|ocakbasi|aspava|kavurma|adana|urfa|ızgara|izgara|köfte|kofte|lokanta|sofra|et lokantası|balık|balik/.test(s)||/kebab|turkish|grill|regional/.test(cuisine))return 'rest_kebab';
  return 'rest_general';
}

/* Geriye dönük uyumluluk: eski tür → varsayılan set */
export const DEMO_IMAGES:Record<string,{cover:string;gallery:string[]}>=Object.fromEntries(
  Object.entries(DEFAULT_IMAGE_SET).map(([type,setId])=>{const s=DEMO_IMAGE_SETS.find(x=>x.id===setId)!;return [type,{cover:s.cover,gallery:s.gallery}]}));
