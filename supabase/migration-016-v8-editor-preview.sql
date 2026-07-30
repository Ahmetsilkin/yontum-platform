-- Yontum V8.3.1: parçalı tema dekorları ve editör önizleme
alter table public.businesses
 add column if not exists theme_decorations jsonb not null default '{}'::jsonb;

update public.businesses
set theme_decorations=jsonb_strip_nulls(jsonb_build_object(
  'line1',nullif(decorative_badge,''),
  'line2',case when established_year is not null then established_year::text else null end,
  'line3',null,
  'kicker',nullif(decorative_label,''),
  'sideLabel',nullif(hero_label,'')
))
where theme_decorations='{}'::jsonb;
