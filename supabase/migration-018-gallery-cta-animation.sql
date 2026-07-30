-- Yontum V8.3.4: eşit galeri ve CTA animasyonu
alter table public.businesses
 add column if not exists cta_animation text not null default 'none';

do $$ begin
 alter table public.businesses add constraint cta_animation_check
 check(cta_animation in('none','pulse','float','shine','bounce'));
exception when duplicate_object then null; end $$;
