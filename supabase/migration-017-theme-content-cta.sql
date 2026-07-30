-- Yontum V8.3.3: ortak tema yazıları ve randevu buton stili
alter table public.businesses
 add column if not exists cta_style text not null default 'solid';

do $$ begin
 alter table public.businesses add constraint cta_style_check
 check(cta_style in('solid','outline','pill','underline','floating'));
exception when duplicate_object then null; end $$;

update public.businesses
set theme_decorations=coalesce(theme_decorations,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
 'topLeft',coalesce(theme_decorations->>'topLeft','VOL. 01'),
 'topRight',coalesce(theme_decorations->>'topRight','APPOINTMENTS'),
 'ticker',coalesce(theme_decorations->>'ticker','BOOK · LOOK · REPEAT'),
 'line1',coalesce(theme_decorations->>'line1',decorative_badge),
 'kicker',coalesce(theme_decorations->>'kicker',decorative_label)
))
where deleted_at is null;
