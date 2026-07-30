-- Yontum V9.2: galeri konum, boyut, oran ve mobil sütun
alter table public.businesses
 add column if not exists gallery_position text not null default 'after_services',
 add column if not exists gallery_size text not null default 'standard',
 add column if not exists gallery_ratio text not null default '4_3',
 add column if not exists gallery_mobile_columns text not null default 'auto';

do $$ begin alter table public.businesses add constraint gallery_position_check check(gallery_position in('after_hero','after_services','after_staff','before_booking','before_footer')); exception when duplicate_object then null; end $$;
do $$ begin alter table public.businesses add constraint gallery_size_check check(gallery_size in('compact','standard','large','fullscreen')); exception when duplicate_object then null; end $$;
do $$ begin alter table public.businesses add constraint gallery_ratio_check check(gallery_ratio in('1_1','4_3','16_9','3_4','original')); exception when duplicate_object then null; end $$;
do $$ begin alter table public.businesses add constraint gallery_mobile_columns_check check(gallery_mobile_columns in('auto','one','two')); exception when duplicate_object then null; end $$;
