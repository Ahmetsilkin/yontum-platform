/* Demo (örnek taslak) sitelerde kullanılan kategoriye uygun örnek görseller. Unsplash lisanslı (ücretsiz, atıf
   zorunlu değil) ve doğrudan images.unsplash.com'dan gösterilir. İşletmenin kendi/Google fotoğrafları kullanılmaz;
   işletmeci demoyu devralınca panelden kendi fotoğraflarını yükler. */
const u=(id:string)=>`https://images.unsplash.com/photo-${id}?q=80&w=1920&auto=format&fit=crop`;

export const DEMO_IMAGES:Record<string,{cover:string;gallery:string[]}>={
  barber:{cover:u('1585747860715-2ba37e788b70'),gallery:['1621605815971-fbc98d665033','1621645582931-d1d3e6564943','1781455793310-8427c96454c7','1503951914875-452162b0f3f1'].map(u)},
  hair_salon:{cover:u('1781450090585-1a511b7066d9'),gallery:['1521590832167-7bcbfaa6381f','1600948836101-f9ffda59d250','1633681926022-84c23e8cb2d6','1637777277337-f114350fb088'].map(u)},
  beauty:{cover:u('1610289982320-3891f7c9fd6d'),gallery:['1731514771613-991a02407132','1562322140-8baeececf3df','1580618672591-eb180b1a973f','1634449571010-02389ed0f9b0'].map(u)},
  nail_lash:{cover:u('1658492055212-e1acbccfca5a'),gallery:['1619607146034-5a05296c8f9a','1696342003838-4a8f9f36588c','1659391542239-9648f307c0b1','1772322586785-3a34772cbc61'].map(u)},
  spa_massage:{cover:u('1761470575018-135c213340eb'),gallery:['1757940113920-69e3686438d3','1773924093206-9a433a14bb44','1776763255459-99ddd8eebbfc','1693578538512-fc66f318c833'].map(u)},
  restaurant:{cover:u('1709548145082-04d0cde481d4'),gallery:['1600891964599-f61ba0e24092','1568376794508-ae52c6ab3929','1457460866886-40ef8d4b42a0','1728761390316-935ffeb3fbcc'].map(u)},
  car_care:{cover:u('1608506375591-b90e1f955e4b'),gallery:['1633014041037-f5446fb4ce99','1708805282683-50a060eba80f','1605437241278-c1806d14a4d9','1708805282706-f44730b7e527'].map(u)},
};
