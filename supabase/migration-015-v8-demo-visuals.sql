-- Yontum V8.3: otomatik galeri, tema dekorları ve arka plan kombinasyonları
alter table public.businesses
 add column if not exists decorative_label text,
 add column if not exists decorative_badge text,
 add column if not exists established_year int,
 add column if not exists background_scheme text not null default 'theme_default';

do $$ begin
 alter table public.businesses add constraint background_scheme_check
 check(background_scheme in('theme_default','light','dark','warm','natural','soft','vivid','luxury'));
exception when duplicate_object then null; end $$;

do $$ begin
 alter table public.businesses add constraint established_year_check
 check(established_year is null or (established_year between 1900 and 2100));
exception when duplicate_object then null; end $$;

-- Mevcut sitelerde boş dekor alanları görünümü değiştirmez.
update public.businesses
set decorative_label=coalesce(decorative_label,hero_label),
    decorative_badge=coalesce(decorative_badge,''),
    draft_updated_at=coalesce(draft_updated_at,now())
where deleted_at is null;
