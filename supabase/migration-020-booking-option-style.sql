-- Yontum V8.4.1: randevu seçenek butonları
alter table public.businesses
 add column if not exists booking_option_shape text not null default 'rounded',
 add column if not exists booking_option_style text not null default 'filled',
 add column if not exists booking_density text not null default 'comfortable';

do $$ begin alter table public.businesses add constraint booking_option_shape_check check(booking_option_shape in('square','rounded','pill','soft','brutal')); exception when duplicate_object then null; end $$;
do $$ begin alter table public.businesses add constraint booking_option_style_check check(booking_option_style in('filled','outline','contrast','minimal')); exception when duplicate_object then null; end $$;
do $$ begin alter table public.businesses add constraint booking_density_check check(booking_density in('compact','comfortable','spacious')); exception when duplicate_object then null; end $$;
