-- Yontum V8.4.2: ekip bölümü ve randevu akış butonları
alter table public.businesses
 add column if not exists show_staff_section boolean not null default true,
 add column if not exists booking_action_style text not null default 'solid',
 add column if not exists booking_action_animation text not null default 'none';

do $$ begin alter table public.businesses add constraint booking_action_style_check check(booking_action_style in('solid','outline','pill','floating','minimal')); exception when duplicate_object then null; end $$;
do $$ begin alter table public.businesses add constraint booking_action_animation_check check(booking_action_animation in('none','pulse','float','shine','bounce')); exception when duplicate_object then null; end $$;
