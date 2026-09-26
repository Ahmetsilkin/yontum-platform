/* Demo (örnek taslak) sitelerde "Müşteri değerlendirmeleri" bölümü boş kalmasın diye eklenen ÖRNEK yorumlar.
   Bunlar gerçek müşteri yorumu değildir: veritabanında `is_sample=true` ile işaretlenir, sitede "gerçek site
   değildir, yorumlar ve içerikler örnektir" şeridi görünür ve demo işletmeye DEVREDİLİRKEN hepsi silinir
   (işletme kendi gerçek yorumlarını toplar). Metinler bilerek genel tutuldu: ad, fiyat, saat, ödül gibi
   doğrulanamayacak somut iddia içermez. */

type Pool={gender:'m'|'f'|'mix';items:{s:5|4;t:string;l?:string}[]};

const POOLS:Record<string,Pool>={
  barber:{gender:'m',items:[
    {s:5,l:'Saç kesimi',t:'Yıllardır düzgün bir berber arıyordum, sonunda buldum galiba. Makas işi çok temiz, kenarları da tertemiz aldı.'},
    {s:5,t:'Randevuyu telefondan alıp gittim, sırada beklemedim. Saatinde başlamaları bile başlı başına artı.'},
    {s:4,l:'Saç ve sakal',t:'Kesim gayet iyi oldu, sakalı da güzel şekillendirdiler. Hafta sonu biraz yoğun oluyor, erken gelin derim.'},
    {s:5,l:'Saç kesimi',t:'Oğlumu da getirdim, çocukla çok sabırlı ilgilendiler. Ağlamadan çıktık :) eline sağlık'},
    {s:5,l:'Saç kesimi',t:'Fade konusunda iddialıyımdır, ilk seferde tam istediğim gibi çıktı. Fotoğraf gösterdim, hemen anladılar.'},
    {s:5,l:'Sakal tıraşı',t:'Düğün öncesi tıraş oldum, özenle uğraştılar. Fotoğraflarda çok iyi çıktım.'},
    {s:4,t:'Temiz bir yer, aletler her müşteriden sonra temizleniyor. Hijyen benim için önemli, memnun kaldım.'},
    {s:5,t:'İş yerine yakın olduğu için denedim, artık başka yere gitmiyorum.'},
    {s:5,l:'Sakal tıraşı',t:'Sakal şekli için ne istediğimi sordular, önerileri de isabetliydi. Fiyat performans olarak yerinde.'},
    {s:5,t:'Kesimden sonra da uzun süre şeklini korudu. Bir sonraki sefer yine buradayım.'},
  ]},
  hair_salon:{gender:'f',items:[
    {s:5,l:'Saç boyama',t:'Rengi tam hayal ettiğim gibi çıkardılar, saçım hiç yıpranmadı. Kaç yıldır kuaför değiştiriyordum, buradan sonra durdum.'},
    {s:5,l:'Saç kesimi',t:'Kesimden önce ne istediğimi uzun uzun dinlediler, fikir de verdiler. Sonuç harika oldu.'},
    {s:4,l:'Fön',t:'Fönüm bir hafta gitmedi. Randevu saatinden biraz geç başlandı ama sonuca değdi.'},
    {s:5,l:'Saç kesimi',t:'Kızımın ilk kesimi için gittik, çok tatlı davrandılar. Kızım da memnun çıktı.'},
    {s:5,l:'Saç tasarım',t:'Düğün için saç yaptırdım, sabaha kadar dağılmadan durdu. Çok teşekkürler.'},
    {s:5,t:'Ortam temiz ve rahat. Kimse acele ettirmedi, keyifli bir gündü.'},
    {s:4,l:'Saç boyama',t:'Boya sonrası bakım çok iyi geldi, saçım yumuşacık oldu. Fiyatlar makul.'},
    {s:5,l:'Röfle',t:'Sarıya çalan tonlardan hep korkardım, istediğim soğuk tonu ilk seferde yakaladılar.'},
    {s:5,t:'Arkadaşım tavsiye etmişti, iyi ki dinlemişim.'},
    {s:5,l:'Keratin bakım',t:'Saçım bayağı yorgundu, keratin bakımıyla toparladı. İlk günkü gibi parlıyor.'},
  ]},
  beauty:{gender:'f',items:[
    {s:5,l:'Cilt bakımı',t:'Cilt bakımından sonra yüzüm ışıl ışıl oldu, kullandıkları ürünleri de tek tek anlattılar.'},
    {s:5,l:'Kaş tasarımı',t:'Kaş tasarımında yüz hatlarıma uygun bir form verdiler, çok doğal durdu.'},
    {s:4,t:'İşlemler sırasında elinden geleni yaptılar, ortam da hijyenik. Sadece randevu saatinde biraz bekledim.'},
    {s:5,t:'Uzun zamandır düzgün bir güzellik merkezi arıyordum, aradığımı buldum.'},
    {s:5,l:'Lazer epilasyon',t:'Lazer için kararsızdım, önce ayrıntılı bilgi verdiler, hiç baskı yapmadılar. Güvenim arttı.'},
    {s:5,l:'Ağda',t:'Ağdayı çok hızlı ve nazik yaptı hanım, teşekkürler.'},
    {s:5,l:'Cilt bakımı',t:'Gelin bakımı için gittim, hepsi çok ilgiliydi. Cildim harika oldu.'},
    {s:4,t:'Genel olarak memnunum, personel güler yüzlü. Bir sonraki bakım için yine gelirim.'},
    {s:5,t:'Hijyen konusunda hassasımdır, tek kullanımlık malzemeler kullandılar, rahat ettim.'},
    {s:5,t:'Arkadaşlarımla gittik, hepimiz memnun kaldık.'},
  ]},
  nail_lash:{gender:'f',items:[
    {s:5,l:'Kalıcı oje',t:'Kalıcı oje üç hafta durdu, hiç kalkmadı. Renk seçiminde de yardımcı oldular.'},
    {s:5,l:'Protez tırnak',t:'Protez tırnak yaptırdım, çok doğal görünüyor. Şekil konusunda çok titizler.'},
    {s:4,l:'Kirpik lifting',t:'Kirpik lifting çok güzel oldu, gözlerim daha açık görünüyor. İşlem biraz uzun sürdü ama sonuç güzel.'},
    {s:5,l:'Nail art',t:'Nail art\'ı fotoğraftan birebir yaptı, inanamadım.'},
    {s:5,t:'Temiz ve düzenli bir yer. Aletlerin hijyenine dikkat ediliyor, bu benim için çok önemliydi.'},
    {s:5,t:'Her ay geliyorum, elim hep bakımlı.'},
    {s:5,t:'Arkadaşlarımla geldik, çok eğlendik. Sonuç mükemmel.'},
    {s:4,l:'Manikür',t:'Tırnaklarım kırılgandı, güçlendirici bakım önerdiler. Farkını gördüm.'},
    {s:5,l:'İpek kirpik',t:'İpek kirpik yaptırdıktan sonra maskara sürmeye gerek kalmadı.'},
    {s:5,t:'İnce işçilik, çok sabırlı çalışıyorlar.'},
  ]},
  spa_massage:{gender:'mix',items:[
    {s:5,l:'Klasik masaj',t:'Bütün gün masa başında çalışıyorum, sırtım bir saatte düzeldi. Çıkarken çok hafiflemiştim.'},
    {s:5,t:'Sessiz, sakin bir ortam. Telefonu kapatıp gerçekten dinlendim.'},
    {s:4,l:'Klasik masaj',t:'Masaj çok iyiydi, oda sıcaklığı biraz daha yüksek olsaydı tam olurdu. Onun dışında sorun yok.'},
    {s:5,l:'Derin doku masajı',t:'Derin doku masajı için gitmiştim, nokta atışı yapıyorlar. Belimdeki ağrı geçti.'},
    {s:5,l:'Aromaterapi masajı',t:'Aromaterapi masajından sonra uykum düzeldi, üç gündür böyle uyuyamamıştım.'},
    {s:5,t:'Eşimle birlikte gittik, ikimiz de çok memnun kaldık.'},
    {s:5,t:'Personel çok kibar, ne istediğimi sürekli sordular.'},
    {s:4,t:'Temiz ve düzenli. Süre dolu dolu kullanıldı, acele ettirmediler.'},
    {s:5,t:'Yorucu bir haftanın ardından tam ihtiyacım olan şeydi.'},
    {s:5,t:'Kısa bir mola olsun diye girdim, uzun süre unutamayacağım.'},
  ]},
  car_care:{gender:'m',items:[
    {s:5,l:'Detaylı iç temizlik',t:'Araç yeni gibi oldu, koltuklardaki lekeler tamamen çıktı. Detaya bu kadar özen gösteren yer az.'},
    {s:5,l:'Seramik kaplama',t:'Seramik kaplamadan sonra su boncuk boncuk akıyor. Çok memnun kaldım.'},
    {s:4,l:'Pasta cila',t:'Pasta cila güzel çıktı, çizikler büyük oranda gitti. Teslim biraz gecikti ama önceden haber verdiler.'},
    {s:5,t:'Arabayı bıraktım, söylenen saatte hazırdı. Ne yapıldığını da tek tek anlattılar.'},
    {s:5,l:'Detaylı iç temizlik',t:'İç temizlikte kokular gitti, tavan bile pırıl pırıl olmuş.'},
    {s:5,l:'Detaylı iç temizlik',t:'İkinci el araç aldım, kullanmadan önce detaylı temizlik yaptırdım. Fark çok büyük.'},
    {s:5,t:'Fiyat baştan net söylendi, sonradan sürpriz çıkmadı. Güven verdi.'},
    {s:4,l:'İç dış yıkama',t:'Jantlar parıl parıl oldu. Yoğunluk olabiliyor, randevu alarak gitmek lazım.'},
    {s:5,l:'Boya koruma',t:'Boya koruma yaptırdım, arabayı görenler yeni aldım sanıyor.'},
    {s:5,t:'Ustalar işini biliyor. Araca zarar vermeden, özenle temizlediler.'},
  ]},
  rest_kebab:{gender:'mix',items:[
    {s:5,t:'Etler çok lezzetli, tam kıvamında pişmiş. Porsiyonlar da doyurucu.'},
    {s:5,t:'Ailecek gittik, servis hızlıydı. Çocuklara da ilgi gösterdiler.'},
    {s:4,t:'Yemekler güzel, sadece akşam saatlerinde biraz kalabalık oluyor. Erken gitmekte fayda var.'},
    {s:5,t:'Lahmacun ve pide çok iyiydi, hamuru ince ve çıtır.'},
    {s:5,t:'İş arkadaşlarımla öğle yemeğine gidiyoruz, hızlı ve temiz. Fiyatlar da makul.'},
    {s:5,t:'Izgara etin lezzeti ayrı, ince acı dengesi tam yerinde.'},
    {s:4,t:'Garsonlar ilgili, yemekler sıcak geldi. Tatlıya yer kalmadı ama bir dahaki sefere.'},
    {s:5,t:'Mahallenin en iyi kebapçısı bence, hiç hayal kırıklığı yaşamadık.'},
    {s:5,t:'Ayranı bile ayrı güzeldi :) eline sağlık.'},
    {s:5,t:'Misafirimiz vardı, çok beğendiler. Sonra tekrar geldik.'},
  ]},
  rest_cafe:{gender:'mix',items:[
    {s:5,t:'Kahvesi gerçekten güzel, çekirdek kalitesi belli oluyor. Ders çalışmak için de ideal.'},
    {s:5,t:'Tatlıları taze ve porsiyonu güzel. Cheesecake favorim oldu.'},
    {s:4,t:'Ortam sakin, çalışmaya uygun. Hafta sonu öğleden sonra biraz kalabalık oluyor.'},
    {s:5,t:'Arkadaşlarla buluştuk, sohbet ede ede saatler geçti. Personel çok ilgiliydi.'},
    {s:5,t:'Latte sanatı bile güzeldi :) fotoğraf çektik.'},
    {s:5,t:'Kahvaltı tabağı doyurucu ve taze. Çayı da tam kıvamında.'},
    {s:4,t:'Kahve güzel, servis hızlıydı. Fiyatlar biraz yüksek ama kalite iyi.'},
    {s:5,t:'Yakınlarda çalışıyorum, öğleden sonra kahve molası için uğruyorum.'},
    {s:5,t:'Limonata ve tatlı çok iyiydi, çocuklar da beğendi.'},
    {s:5,t:'Sıcak, samimi bir yer. Sık sık gelirim.'},
  ]},
  rest_bakery:{gender:'mix',items:[
    {s:5,t:'Sabah tazecik ekmek kokusuyla karşılandık. Poğaçalar hâlâ sıcaktı.'},
    {s:5,t:'Simit ve poğaça favorim, sabahları sık sık uğruyorum.'},
    {s:4,t:'Ürünler taze ve lezzetli, öğleden sonra bazı çeşitler bitiyor. Erken gitmek lazım.'},
    {s:5,t:'Doğum günü pastası sipariş verdik, hem güzel hem lezzetliydi. Misafirler çok beğendi.'},
    {s:5,t:'Böreklerin tadı ev yapımı gibi, yağı tam kararında.'},
    {s:5,t:'Kuru pasta ve kurabiyeler çok taze. Çay saatinin vazgeçilmezi oldu.'},
    {s:5,t:'Fiyatlar makul, kalite düzenli. Mahallenin fırını.'},
    {s:4,t:'Ekmekleri güzel, erken saatte gidince çeşit daha fazla oluyor. Personel güler yüzlü.'},
    {s:5,t:'Cheesecake ve profiterol aldım, ikisi de çok iyiydi.'},
    {s:5,t:'Çocuğum açmayı çok seviyor, hemen hemen her hafta alıyoruz.'},
  ]},
  rest_fastfood:{gender:'mix',items:[
    {s:5,t:'Burger etli ve sulu, patates çıtır çıtır geldi. Servis hızlıydı.'},
    {s:5,t:'Pizza hamuru tam istediğim gibiydi, peyniri de bol.'},
    {s:4,t:'Lezzet güzel, porsiyon doyurucu. Öğle arası çok yoğun, biraz beklemek gerekebilir.'},
    {s:5,t:'Döner çok lezzetli, ekmek arası ve dürüm çeşitleri bol.'},
    {s:5,t:'Öğrenciyiz, uygun fiyata karnımız doyuyor. Sık geliyoruz.'},
    {s:5,t:'Soslar ev yapımı gibi. Bir kez deneyeyim demiştim, şimdi müdavimiyim :)'},
    {s:4,t:'Hızlı ve lezzetli, paketleme de temizdi. Mekân basit ama sorun değil.'},
    {s:5,t:'Menü seçenekleri iyi. Çocuk menüsünü de sevdiler.'},
    {s:5,t:'Arkadaşlarla maçtan sonra uğradık, herkes memnun kaldı.'},
    {s:5,t:'Personel güler yüzlü, sipariş hatasız geldi.'},
  ]},
  rest_general:{gender:'mix',items:[
    {s:5,t:'Yemekler taze ve güzel sunulmuş. Ailece keyifle yedik.'},
    {s:5,t:'Servis düzgündü, garson önerileriyle çok yardımcı oldu.'},
    {s:4,t:'Menü çeşitli, her damak tadına uygun bir şeyler var. Akşam saatlerinde yoğun olabiliyor.'},
    {s:5,t:'Doğum günü yemeği için rezervasyon yaptık, her şey planladığımız gibiydi.'},
    {s:5,t:'Porsiyonlar dengeli, fiyatlar hak ettiği düzeyde.'},
    {s:5,t:'İş yemeği için gittik, sessiz ve düzenliydi.'},
    {s:4,t:'Yemek güzeldi, tatlı çok başarılıydı. Yer bulmak için erken gitmek iyi olur.'},
    {s:5,t:'Mahallede sık gittiğimiz yer oldu, hiç sorun yaşamadık.'},
    {s:5,t:'Çorba ve ana yemek çok lezzetliydi, hesap makul geldi.'},
    {s:5,t:'Misafirlerimizi ağırladık, herkes memnun kaldı.'},
  ]},
};

const MALE=['Emre','Burak','Murat','Kaan','Mert','Serkan','Onur','Ahmet','Mehmet','Can','Barış','Oğuz','Yusuf','Tolga','Cem','Hakan','Volkan','Selim','Furkan','Berkay','Enes','Uğur'];
const FEMALE=['Elif','Merve','Zeynep','Ayşe','Selin','Büşra','Esra','Derya','Gizem','Ceren','Buse','İrem','Tuğba','Sena','Nur','Ebru','Aslı','Pınar','Damla','Özge','Fatma','Hilal'];
const INITIALS=['A','B','C','Ç','D','E','G','H','K','M','O','S','Ş','T','U','Y','Z'];

/* Set kimliğinden (ör. rest_cafe) ya da yalnız işletme türünden yorum havuzunu seçer */
function poolFor(type:string,setId?:string|null):Pool{
  if(setId&&POOLS[setId])return POOLS[setId];
  if(type==='restaurant')return POOLS.rest_general;
  return POOLS[type]||POOLS.rest_general;
}

function shuffle<T>(a:T[],rng:()=>number):T[]{
  const b=[...a];
  for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]]}
  return b;
}

export type SampleReview={name:string;stars:number;comment:string;service:string|null;createdAt:string};

/* count adet örnek yorum: her seferinde farklı seçim/isim/tarih (rastgele), ortalama ~4,7 */
export function buildSampleReviews(type:string,setId?:string|null,count=7,rng:()=>number=Math.random):SampleReview[]{
  const pool=poolFor(type,setId);
  const items=shuffle(pool.items,rng).slice(0,Math.min(count,pool.items.length));
  const names=(g:'m'|'f')=>shuffle(g==='m'?MALE:FEMALE,rng);
  const male=names('m'),female=names('f');
  const now=Date.now(),DAY=86400000;
  // 5 ile ~270 gün önce arasında, birbirinden farklı günler
  const days=shuffle(Array.from({length:266},(_,i)=>i+5),rng).slice(0,items.length).sort((a,b)=>a-b);
  return items.map((it,i)=>{
    const g=pool.gender==='mix'?(rng()<.5?'m':'f'):pool.gender;
    const first=(g==='m'?male:female)[i%22];
    const initial=INITIALS[Math.floor(rng()*INITIALS.length)];
    return{name:`${first} ${initial}.`,stars:it.s,comment:it.t,service:it.l??null,createdAt:new Date(now-days[i]*DAY-Math.floor(rng()*DAY)).toISOString()};
  });
}
