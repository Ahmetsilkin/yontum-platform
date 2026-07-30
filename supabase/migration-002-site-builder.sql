-- Mevcut Yontum Supabase projesinde SQL Editor'da bir kez çalıştırın.
alter table public.businesses
  add column if not exists hero_title text,
  add column if not exists hero_highlight text,
  add column if not exists hero_description text,
  add column if not exists hero_visual_mode text not null default 'emblem',
  add column if not exists font_family text not null default 'serif',
  add column if not exists background_color text not null default '#f7f7f4',
  add column if not exists text_color text not null default '#111111',
  add column if not exists show_services boolean not null default true,
  add column if not exists show_about boolean not null default true,
  add column if not exists show_contact boolean not null default true,
  add column if not exists booking_button_text text not null default 'Randevu Al';

do $$ begin
 alter table public.businesses add constraint businesses_visual_mode_check
 check(hero_visual_mode in ('emblem','logo','cover','none'));
exception when duplicate_object then null; end $$;

do $$ begin
 alter table public.businesses add constraint businesses_font_family_check
 check(font_family in ('serif','sans','display'));
exception when duplicate_object then null; end $$;
