-- ============================================================
-- 026 - Berbere özel yeni tema ailesi serisinin ilki: Usta
--   Referans: "Modern Mane" tarzı berber sitesi (kullanıcının gönderdiği
--   görseller) — hero'da randevu önizleme kartı, koyu "hizmet" tanıtım
--   bölümü + harita, krem galeri, turuncu vurgulu fiyat/yorum satırı,
--   ekip kart ızgarası + "ekibe katıl" kartı.
--
--   Kod tarafı: src/components/themes/RadicalTenantSite.tsx içindeki
--   Usta bileşeni + radical-themes.css içindeki .tUsta kuralları.
--   Temaya özel metin alanları (theme_decorations.usta_*) artık
--   panelde "Siteyi Düzenle" > "Bu temaya özel alanlar" bloğunda
--   düzenlenebiliyor (sadece bu tema seçiliyken görünür).
-- ============================================================

insert into public.theme_catalog(
  id,business_type,layout_family,name,description,config,preview_class,sort_order,is_active
)
values(
  'barber_usta',
  'barber',
  'usta',
  'Berber — Usta',
  'Randevu önizleme kartlı hero, koyu hizmet tanıtım bölümü ve ekip ızgaralı modern berber yerleşimi',
  jsonb_build_object(
    'header','usta_nav','hero','usta_card_hero','services','usta_price_list',
    'staff','usta_team_grid','gallery','usta_works','about','usta_intro',
    'booking','usta_booking','footer','usta_footer',
    'heading_font','sans','body_font','sans','radius','0px',
    'palette',jsonb_build_object('primary','#111111','secondary','#c2ab86','background','#f4f1ea','surface','#ffffff','text','#151515','muted','#737373'),
    'profession','barber'
  ),
  'theme-barber-usta',
  20,
  true
)
on conflict (id) do update set
  name=excluded.name,
  description=excluded.description,
  config=excluded.config,
  preview_class=excluded.preview_class,
  sort_order=excluded.sort_order,
  is_active=true,
  updated_at=now();
