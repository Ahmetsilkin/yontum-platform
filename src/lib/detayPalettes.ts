/* "Araba Bakım — Detay" temasının renk kombinasyonları. Serbest renk seçici yerine, otomotiv / detailing
   dünyasında yaygın kullanılan hazır kombinasyonlar (koyu zemin + tek güçlü vurgu rengi). İşletme panelden
   birini seçer; tema bu değerleri satır içi CSS değişkeni olarak alır, yani renkler tek yerde (burada) durur. */
export type DetayPalette={
  id:string;label:string;hint:string;
  accent:string;        // butonlar, şeritler, ikonlar
  accentStrong:string;  // hover
  onAccent:string;      // vurgu rengi üstündeki yazı
  accentText:string;    // açık zeminde vurgu renginde yazı (kontrast için daha koyu ton)
  dark:string;          // koyu bölümler / navbar / footer
  charcoal:string;      // yorum bandı vb.
  light:string;         // açık bölümler
};

export const DETAY_PALETTES:DetayPalette[]=[
  {id:'green',label:'Yarış Yeşili',hint:'Yeşil + antrasit',accent:'#0E9C21',accentStrong:'#0B7D1A',onAccent:'#FFFFFF',accentText:'#0B7D1A',dark:'#171717',charcoal:'#2E2E2E',light:'#F2F1F0'},
  {id:'red',label:'Performans Kırmızısı',hint:'Kırmızı + karbon siyah',accent:'#D8232A',accentStrong:'#B01C22',onAccent:'#FFFFFF',accentText:'#B01C22',dark:'#121212',charcoal:'#2B2B2B',light:'#F3F2F0'},
  {id:'orange',label:'Karbon Turuncu',hint:'Turuncu + karbon',accent:'#FF6B00',accentStrong:'#D95A00',onAccent:'#141414',accentText:'#B84900',dark:'#141414',charcoal:'#2B2B2B',light:'#F4F2EF'},
  {id:'steel',label:'Çelik Mavisi',hint:'Mavi + gece laciverti',accent:'#1E6FBF',accentStrong:'#175A9C',onAccent:'#FFFFFF',accentText:'#175A9C',dark:'#0F1A24',charcoal:'#1F2D3A',light:'#EEF1F4'},
  {id:'yellow',label:'Krom Sarı',hint:'Sarı + siyah',accent:'#FFC72C',accentStrong:'#E0AB13',onAccent:'#111111',accentText:'#7A5C00',dark:'#111111',charcoal:'#262626',light:'#F3F1EA'},
  {id:'silver',label:'Gümüş Krom',hint:'Gümüş + siyah',accent:'#C7CCD1',accentStrong:'#AEB4BA',onAccent:'#111111',accentText:'#464C52',dark:'#0E0E0E',charcoal:'#252525',light:'#F1F2F3'},
];

export const DETAY_DEFAULT_PALETTE='green';

export function getDetayPalette(id:unknown):DetayPalette{
  return DETAY_PALETTES.find(p=>p.id===id)||DETAY_PALETTES[0];
}

/* Sitede üst etiket olarak görünen işletme türü adı (panelden seçilir) */
export const DETAY_KINDS=[
  {value:'Araba Bakım',label:'Araba Bakım'},
  {value:'Oto Yıkama & Detailing',label:'Oto Yıkama & Detailing'},
  {value:'Araç Bakım & Kaplama',label:'Araç Bakım & Kaplama'},
];
