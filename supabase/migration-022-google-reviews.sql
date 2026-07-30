-- Yontum V9.1: Google yorumları bağlantısı
alter table public.businesses
 add column if not exists google_place_id text,
 add column if not exists google_maps_url text,
 add column if not exists show_google_reviews boolean not null default false,
 add column if not exists google_review_limit int not null default 5;

do $$ begin alter table public.businesses add constraint google_review_limit_check check(google_review_limit between 1 and 5); exception when duplicate_object then null; end $$;
