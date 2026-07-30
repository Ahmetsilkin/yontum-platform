-- YONTUM V8.1 — Tema motoru, taslak/önizleme/yayın ve sürüm geçmişi
-- Geriye uyumludur: mevcut site alanlarını silmez veya değiştirmez.

create table if not exists public.theme_catalog (
  id text primary key,
  business_type text not null,
  layout_family text not null,
  name text not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  preview_class text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_type, layout_family)
);

alter table public.theme_catalog enable row level security;
drop policy if exists "public reads active themes" on public.theme_catalog;
create policy "public reads active themes"
on public.theme_catalog for select
using (is_active = true);

alter table public.businesses
  add column if not exists selected_theme_id text references public.theme_catalog(id) on delete set null,
  add column if not exists draft_site_config jsonb,
  add column if not exists published_site_config jsonb,
  add column if not exists site_config_version int not null default 1,
  add column if not exists draft_updated_at timestamptz,
  add column if not exists published_at timestamptz;

create table if not exists public.site_config_versions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  version int not null,
  config jsonb not null,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (business_id, version)
);

create index if not exists site_config_versions_business_idx
  on public.site_config_versions(business_id, version desc);

alter table public.site_config_versions enable row level security;
drop policy if exists "members see site versions" on public.site_config_versions;
create policy "members see site versions"
on public.site_config_versions for select
using (public.member_role(business_id) in ('owner','manager'));

-- 7 meslek paketi × 9 gerçek yerleşim ailesi = 63 tema kaydı.
with sectors(business_type, sector_name, palette) as (
  values
    ('barber','Berber',              '{"primary":"#111111","secondary":"#8b5e3c","background":"#f4f1ea","surface":"#ffffff","text":"#151515","muted":"#737373"}'::jsonb),
    ('hair_salon','Kadın Kuaförü',   '{"primary":"#7c3157","secondary":"#d6a6b8","background":"#fbf4f7","surface":"#ffffff","text":"#2d1723","muted":"#806b75"}'::jsonb),
    ('beauty','Güzellik Merkezi',    '{"primary":"#b76e79","secondary":"#d8b07a","background":"#fff7f8","surface":"#ffffff","text":"#3c2429","muted":"#866f74"}'::jsonb),
    ('nail_lash','Nail / Kirpik',    '{"primary":"#ed5da8","secondary":"#8d5bd0","background":"#fff2fa","surface":"#ffffff","text":"#491534","muted":"#8b6680"}'::jsonb),
    ('spa_massage','Spa / Masaj',    '{"primary":"#6f8f78","secondary":"#b59b77","background":"#f3f6f1","surface":"#ffffff","text":"#21352a","muted":"#718078"}'::jsonb),
    ('dietitian','Diyetisyen',       '{"primary":"#78a65a","secondary":"#e4b95f","background":"#f7faef","surface":"#ffffff","text":"#26381d","muted":"#718065"}'::jsonb),
    ('psychologist','Psikolog',      '{"primary":"#71849c","secondary":"#b7a4c8","background":"#f3f5f7","surface":"#ffffff","text":"#243140","muted":"#6f7882"}'::jsonb)
),
families(layout_family, family_name, sort_order, layout_config) as (
  values
    ('heritage','Heritage',1, '{"header":"centered","hero":"badge_centered","services":"numbered_list","staff":"portrait_classic","gallery":"framed_grid","about":"split_quote","booking":"boxed","footer":"centered","heading_font":"serif","body_font":"sans","radius":"0px"}'::jsonb),
    ('modern','Modern',2, '{"header":"split","hero":"bold_text","services":"sharp_grid","staff":"minimal_rows","gallery":"clean_grid","about":"wide_split","booking":"large_card","footer":"columns","heading_font":"display","body_font":"sans","radius":"0px"}'::jsonb),
    ('editorial','Editorial',3, '{"header":"minimal","hero":"asymmetric_editorial","services":"editorial_rows","staff":"magazine_cards","gallery":"masonry","about":"article","booking":"inline","footer":"minimal","heading_font":"serif","body_font":"sans","radius":"2px"}'::jsonb),
    ('soft','Soft',4, '{"header":"floating","hero":"soft_centered","services":"rounded_cards","staff":"round_portraits","gallery":"airy_grid","about":"soft_card","booking":"rounded_card","footer":"soft","heading_font":"serif","body_font":"sans","radius":"24px"}'::jsonb),
    ('luxury','Luxury',5, '{"header":"dark_luxury","hero":"luxury_center","services":"gold_frames","staff":"luxury_portraits","gallery":"showcase","about":"dark_split","booking":"gold_card","footer":"dark_luxury","heading_font":"serif","body_font":"sans","radius":"0px","dark_mode":true}'::jsonb),
    ('pop','Pop',6, '{"header":"pill_nav","hero":"playful","services":"color_blocks","staff":"bubble_cards","gallery":"social_grid","about":"sticker_card","booking":"pop_card","footer":"color_block","heading_font":"display","body_font":"sans","radius":"28px"}'::jsonb),
    ('zen','Zen',7, '{"header":"quiet","hero":"zen_space","services":"zen_list","staff":"calm_profiles","gallery":"wide_showcase","about":"zen_text","booking":"quiet_card","footer":"quiet","heading_font":"sans","body_font":"sans","radius":"8px"}'::jsonb),
    ('fresh','Fresh',8, '{"header":"clean","hero":"fresh_split","services":"info_cards","staff":"expert_cards","gallery":"clean_tiles","about":"fact_split","booking":"step_card","footer":"clean_columns","heading_font":"sans","body_font":"sans","radius":"14px"}'::jsonb),
    ('calm','Calm',9, '{"header":"private","hero":"narrow_calm","services":"calm_rows","staff":"private_profiles","gallery":"subtle_grid","about":"reading_column","booking":"private_card","footer":"discreet","heading_font":"serif","body_font":"sans","radius":"10px"}'::jsonb)
)
insert into public.theme_catalog(
  id,business_type,layout_family,name,description,config,preview_class,sort_order,is_active
)
select
  s.business_type || '_' || f.layout_family,
  s.business_type,
  f.layout_family,
  s.sector_name || ' — ' || f.family_name,
  s.sector_name || ' işletmeleri için ' || f.family_name || ' yerleşimi',
  f.layout_config || jsonb_build_object('palette',s.palette,'profession',s.business_type),
  'theme-' || s.business_type || '-' || f.layout_family,
  f.sort_order,
  true
from sectors s cross join families f
on conflict (id) do update set
  name=excluded.name,
  description=excluded.description,
  config=excluded.config,
  preview_class=excluded.preview_class,
  sort_order=excluded.sort_order,
  is_active=true,
  updated_at=now();

-- Mevcut alanlardan eksiksiz legacy config üretir.
create or replace function public.build_legacy_site_config(b public.businesses)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'schemaVersion', 1,
    'legacy', true,
    'businessType', b.business_type,
    'themeId', b.selected_theme_id,
    'theme', b.theme,
    'fontFamily', b.font_family,
    'colors', jsonb_build_object(
      'primary', b.primary_color,
      'background', b.background_color,
      'text', b.text_color
    ),
    'branding', jsonb_build_object(
      'name', b.name,
      'logoUrl', b.logo_url,
      'coverUrl', b.cover_url,
      'logoAlignment', b.logo_alignment
    ),
    'hero', jsonb_build_object(
      'label', b.hero_label,
      'title', b.hero_title,
      'highlight', b.hero_highlight,
      'description', b.hero_description,
      'visualMode', b.hero_visual_mode,
      'visualLabel', b.visual_label,
      'layout', b.hero_layout,
      'textAlignment', b.text_alignment,
      'buttonText', b.booking_button_text
    ),
    'sections', jsonb_build_object(
      'order', b.section_order,
      'showServices', b.show_services,
      'showGallery', b.show_gallery,
      'showAbout', b.show_about,
      'showContact', b.show_contact,
      'showPrices', b.show_prices
    ),
    'gallery', jsonb_build_object('layout', b.gallery_layout),
    'contact', jsonb_build_object(
      'layout', b.contact_layout,
      'phoneLabel', b.phone_label,
      'addressLabel', b.address_label,
      'instagramLabel', b.instagram_label,
      'whatsappEnabled', b.whatsapp_enabled,
      'whatsappPhone', b.whatsapp_phone,
      'whatsappMessage', b.whatsapp_message,
      'whatsappButtonText', b.whatsapp_button_text
    ),
    'content', jsonb_build_object(
      'servicesLabel', b.services_label,
      'servicesTitle', b.services_title,
      'servicesDescription', b.services_description,
      'aboutLabel', b.about_label,
      'aboutTitle', b.about_title,
      'aboutDescription', b.description,
      'bookingLabel', b.booking_label,
      'bookingTitle', b.booking_title,
      'bookingDescription', b.booking_description,
      'footerNote', b.footer_note
    )
  );
$$;

-- Eski sitelerin görünümünü aynen hem draft hem published config'e kopyalar.
update public.businesses b
set
  published_site_config = coalesce(b.published_site_config, public.build_legacy_site_config(b)),
  draft_site_config = coalesce(b.draft_site_config, public.build_legacy_site_config(b)),
  published_at = coalesce(b.published_at, b.updated_at, now()),
  draft_updated_at = coalesce(b.draft_updated_at, b.updated_at, now())
where b.deleted_at is null;

-- Taslak kaydetme: yalnızca owner/manager.
create or replace function public.save_site_draft(p_business_id uuid,p_config jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if public.member_role(p_business_id) not in ('owner','manager') then raise exception 'Yetkiniz yok'; end if;
  if p_config is null or jsonb_typeof(p_config)<>'object' then raise exception 'Geçersiz site ayarı'; end if;
  update businesses set draft_site_config=p_config,draft_updated_at=now(),updated_at=now() where id=p_business_id;
  return p_config;
end $$;

-- Yayınla: draft'ı published'a atomik kopyalar ve geçmişe sürüm ekler.
create or replace function public.publish_site_draft(p_business_id uuid)
returns int language plpgsql security definer set search_path=public as $$
declare next_version int; cfg jsonb;
begin
  if public.member_role(p_business_id) not in ('owner','manager') then raise exception 'Yetkiniz yok'; end if;
  select draft_site_config,site_config_version+1 into cfg,next_version from businesses where id=p_business_id for update;
  if cfg is null then raise exception 'Yayınlanacak taslak bulunamadı'; end if;
  update businesses set published_site_config=cfg,site_config_version=next_version,published_at=now(),updated_at=now(),is_published=true where id=p_business_id;
  insert into site_config_versions(business_id,version,config,published_by) values(p_business_id,next_version,cfg,auth.uid()) on conflict(business_id,version) do nothing;
  return next_version;
end $$;

-- Taslağı son yayına geri döndürür.
create or replace function public.reset_site_draft(p_business_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare cfg jsonb;
begin
  if public.member_role(p_business_id) not in ('owner','manager') then raise exception 'Yetkiniz yok'; end if;
  select published_site_config into cfg from businesses where id=p_business_id;
  update businesses set draft_site_config=cfg,draft_updated_at=now(),updated_at=now() where id=p_business_id;
  return cfg;
end $$;

grant execute on function public.save_site_draft(uuid,jsonb) to authenticated;
grant execute on function public.publish_site_draft(uuid) to authenticated;
grant execute on function public.reset_site_draft(uuid) to authenticated;
