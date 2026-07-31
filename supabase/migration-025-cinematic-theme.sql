-- ============================================================
-- 025 - Yeni tema ailesi: Cinematic
--   Tam ekran kapak fotoğrafı + devasa başlık, modern/sinematik
--   bir görünüm. Diğer 9 aileden farklı olarak business.cover_url
--   alanını (daha önce yüklenip hiç kullanılmayan kapak fotoğrafını)
--   tam ekran hero arka planı olarak kullanıyor.
--
--   Kod tarafı: src/components/themes/RadicalTenantSite.tsx içindeki
--   Cinematic bileşeni + radical-themes.css içindeki .tCinematic kuralları.
-- ============================================================

with sectors(business_type, sector_name, palette) as (
  values
    ('barber','Berber',              '{"primary":"#111111","secondary":"#8b5e3c","background":"#f4f1ea","surface":"#ffffff","text":"#151515","muted":"#737373"}'::jsonb),
    ('hair_salon','Kadın Kuaförü',   '{"primary":"#7c3157","secondary":"#d6a6b8","background":"#fbf4f7","surface":"#ffffff","text":"#2d1723","muted":"#806b75"}'::jsonb),
    ('beauty','Güzellik Merkezi',    '{"primary":"#b76e79","secondary":"#d8b07a","background":"#fff7f8","surface":"#ffffff","text":"#3c2429","muted":"#866f74"}'::jsonb),
    ('nail_lash','Nail / Kirpik',    '{"primary":"#ed5da8","secondary":"#8d5bd0","background":"#fff2fa","surface":"#ffffff","text":"#491534","muted":"#8b6680"}'::jsonb),
    ('spa_massage','Spa / Masaj',    '{"primary":"#6f8f78","secondary":"#b59b77","background":"#f3f6f1","surface":"#ffffff","text":"#21352a","muted":"#718078"}'::jsonb),
    ('dietitian','Diyetisyen',       '{"primary":"#78a65a","secondary":"#e4b95f","background":"#f7faef","surface":"#ffffff","text":"#26381d","muted":"#718065"}'::jsonb),
    ('psychologist','Psikolog',      '{"primary":"#71849c","secondary":"#b7a4c8","background":"#f3f5f7","surface":"#ffffff","text":"#243140","muted":"#6f7882"}'::jsonb)
)
insert into public.theme_catalog(
  id,business_type,layout_family,name,description,config,preview_class,sort_order,is_active
)
select
  s.business_type || '_cinematic',
  s.business_type,
  'cinematic',
  s.sector_name || ' — Cinematic',
  s.sector_name || ' işletmeleri için tam ekran fotoğraflı, modern sinematik yerleşim',
  jsonb_build_object(
    'header','cinematic_nav','hero','fullbleed_cinematic','services','cinematic_rows',
    'staff','cinematic_portrait','gallery','cinematic_showcase','about','cinematic_read',
    'booking','cinematic_dark','footer','cinematic_minimal',
    'heading_font','sans','body_font','sans','radius','2px','dark_mode',true
  ) || jsonb_build_object('palette',s.palette,'profession',s.business_type),
  'theme-' || s.business_type || '-cinematic',
  10,
  true
from sectors s
on conflict (id) do update set
  name=excluded.name,
  description=excluded.description,
  config=excluded.config,
  preview_class=excluded.preview_class,
  sort_order=excluded.sort_order,
  is_active=true,
  updated_at=now();
