-- ============================================================
-- 026 - Yeni tema ailesi: Aura
--   Kuaför / güzellik / nail-kirpik / spa-masaj işletmeleri için,
--   kemerli (arch) görseller, ince editorial tipografi ve pudra
--   tonlarıyla premium bir butik-salon görünümü.
--   Sadece şu 4 sektöre eklenir: hair_salon, beauty, nail_lash, spa_massage.
--
--   Kod tarafı: src/components/themes/RadicalTenantSite.tsx içindeki
--   Aura bileşeni + radical-themes.css içindeki .tAura kuralları.
-- ============================================================

with sectors(business_type, sector_name, palette) as (
  values
    ('hair_salon','Kadın Kuaförü',   '{"primary":"#7c3157","secondary":"#d6a6b8","background":"#fbf4f7","surface":"#ffffff","text":"#2d1723","muted":"#806b75"}'::jsonb),
    ('beauty','Güzellik Merkezi',    '{"primary":"#b76e79","secondary":"#d8b07a","background":"#fff7f8","surface":"#ffffff","text":"#3c2429","muted":"#866f74"}'::jsonb),
    ('nail_lash','Nail / Kirpik',    '{"primary":"#ed5da8","secondary":"#8d5bd0","background":"#fff2fa","surface":"#ffffff","text":"#491534","muted":"#8b6680"}'::jsonb),
    ('spa_massage','Spa / Masaj',    '{"primary":"#6f8f78","secondary":"#b59b77","background":"#f3f6f1","surface":"#ffffff","text":"#21352a","muted":"#718078"}'::jsonb)
)
insert into public.theme_catalog(
  id,business_type,layout_family,name,description,config,preview_class,sort_order,is_active
)
select
  s.business_type || '_aura',
  s.business_type,
  'aura',
  s.sector_name || ' — Aura',
  s.sector_name || ' işletmeleri için kemerli görseller, ince editorial tipografi ve pudra tonlarıyla premium butik salon yerleşimi',
  jsonb_build_object(
    'header','pill_nav','hero','arch_split','services','elegant_menu',
    'staff','row','gallery','arch_grid','about','numbered_split_arch',
    'booking','boxed','footer','columns',
    'heading_font','serif','body_font','sans','radius','40px'
  ) || jsonb_build_object('palette',s.palette,'profession',s.business_type),
  'theme-' || s.business_type || '-aura',
  11,
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
