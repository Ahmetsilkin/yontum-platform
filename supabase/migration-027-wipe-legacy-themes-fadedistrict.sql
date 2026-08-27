-- ============================================================
-- 027 - Eski tüm jenerik temaların kaldırılması + Fade District
--   Kullanıcı isteğiyle: Heritage/Modern/Editorial/Soft/Luxury/Pop/Zen/
--   Fresh/Calm/Cinematic/Vitrin/Mega/Prestij/Atolye/Nabiz/Zeytin/Nese/
--   Aura/Usta gibi tüm eski tema aileleri ve theme_catalog'daki 7
--   işletme türüne ait tüm satırları (113 kayıt) siliniyor.
--
--   Yerine sadece berber için, bir video konseptinden ("Fade District" —
--   koyu zemin, spot ışığı, altın/bakır vurgular, parlayan "Randevu Al"
--   butonu, sinematik hero) uyarlanan TEK yeni tema ekleniyor.
--
--   Diğer 6 işletme türü (hair_salon, beauty, nail_lash, spa_massage,
--   dietitian, psychologist) kasıtlı olarak temasız bırakıldı — kendi
--   yeni temaları tasarlanana kadar "Hazır site paketleri" listesi
--   o türler için boş görünecek.
--
--   Kod tarafı: src/components/themes/RadicalTenantSite.tsx (tüm eski
--   Layout bileşenleri silindi, sadece FadeDistrict kaldı) ve
--   radical-themes.css (eski aile blokları silindi, .tFadeDistrict/.fd*
--   eklendi).
-- ============================================================

delete from public.theme_catalog;

insert into public.theme_catalog(
  id,business_type,layout_family,name,description,config,preview_class,sort_order,is_active
)
values(
  'barber_fadedistrict',
  'barber',
  'fadedistrict',
  'Berber — Fade District',
  'Koyu zemin, spot ışığı ve bakır/altın vurgularla premium berber yerleşimi — parlayan randevu butonu, sinematik hero',
  jsonb_build_object(
    'header','fd_nav','hero','fd_spotlight_hero','services','fd_menu_grid',
    'staff','fd_team_grid','gallery','fd_dark_grid','booking','fd_booking',
    'contact','fd_dark_contact',
    'heading_font','sans','body_font','sans','radius','2px','dark_mode',true,
    'palette',jsonb_build_object('primary','#c9873f','secondary','#e3a866','background','#0d0b09','surface','#17130f','text','#f3ece2','muted','#a89a89'),
    'profession','barber'
  ),
  'theme-barber-fadedistrict',
  10,
  true
);
