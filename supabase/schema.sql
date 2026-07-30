-- YONTUM MULTI-TENANT SAAS SCHEMA
-- Yeni bir Supabase projesinde SQL Editor'da bir kez çalıştırın.
create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table public.businesses (
 id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
 business_type text not null default 'barber' check(business_type in ('barber','hair_salon','beauty','nail_lash','spa_massage','other')),
 tagline text, description text, phone text not null, email text, address text, instagram text,
 logo_url text, cover_url text, primary_color text not null default '#111111', background_color text not null default '#f7f7f4', text_color text not null default '#111111',
 theme text not null default 'modern' check(theme in ('classic','modern','minimal')),
 font_family text not null default 'serif' check(font_family in ('serif','sans','display')),
 hero_title text, hero_highlight text, hero_description text,
 hero_visual_mode text not null default 'emblem' check(hero_visual_mode in ('emblem','logo','cover','none')),
 booking_button_text text not null default 'Randevu Al', show_prices boolean not null default true,
 show_gallery boolean not null default true, show_services boolean not null default true,
 show_about boolean not null default true, show_contact boolean not null default true,
 layout_preset text not null default 'showcase' check(layout_preset in ('showcase','booking_first','portfolio')),
 hero_label text not null default 'ERKEK BAKIM · ONLINE RANDEVU', visual_label text not null default 'PROFESYONEL BAKIM',
 services_label text not null default 'HİZMETLER', services_title text not null default 'Tarzını seç.',
 services_description text not null default 'İhtiyacına uygun hizmeti seç, randevunu hemen oluştur.',
 about_label text not null default 'HAKKIMIZDA', about_title text not null default 'Ustalık detaylarda gizli.',
 booking_label text not null default 'ONLINE RANDEVU', booking_title text not null default 'Saatini ayır.',
 booking_description text not null default 'Hizmetini, gününü ve saatini seç. Randevun anında kesinleşsin.',
 phone_label text not null default 'Telefon', address_label text not null default 'Adres', instagram_label text not null default 'Instagram',
 whatsapp_enabled boolean not null default true, whatsapp_phone text,
 whatsapp_message text not null default 'Merhaba, hizmetleriniz ve uygun randevu saatleri hakkında bilgi almak istiyorum.',
 whatsapp_button_text text not null default 'WhatsApp ile yazın', footer_note text default 'Yontum ile hazırlandı',
 is_published boolean not null default false, slot_interval int not null default 30 check(slot_interval in (15,20,30,45,60)),
 timezone text not null default 'Europe/Istanbul', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(slug ~ '^[a-z0-9][a-z0-9-]{2,39}$')
);
create table public.business_members (
 business_id uuid not null references public.businesses(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'owner' check(role in ('owner','manager')),
 created_at timestamptz not null default now(), primary key(business_id,user_id)
);
create table public.services (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 name text not null, description text, duration_minutes int not null check(duration_minutes between 10 and 300),
 price numeric(10,2) check(price is null or price>=0), is_active boolean not null default true,
 sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.working_hours (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 day_of_week smallint not null check(day_of_week between 0 and 6), is_open boolean not null default true,
 start_time time not null default '09:00', end_time time not null default '20:00', unique(business_id,day_of_week), check(start_time<end_time)
);
create table public.blocked_slots (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 start_at timestamptz not null, end_at timestamptz not null, reason text, created_at timestamptz not null default now(), check(start_at<end_at)
);
create table public.appointments (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 service_id uuid not null references public.services(id), customer_first_name text not null, customer_last_name text not null,
 customer_phone text not null, customer_email text, customer_note text, start_at timestamptz not null, end_at timestamptz not null,
 status text not null default 'confirmed' check(status in ('confirmed','completed','no_show','cancelled')),
 source text not null default 'online' check(source in ('online','manual')), allow_overlap boolean not null default false,
 cancellation_reason text, cancelled_at timestamptz, archived_at timestamptz,
 total_price numeric(10,2), cancel_token uuid not null unique default gen_random_uuid(),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(start_at<end_at)
);
create table public.gallery_images (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 image_url text not null, alt_text text, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.subscriptions (
 id uuid primary key default gen_random_uuid(), business_id uuid not null unique references public.businesses(id) on delete cascade,
 plan text not null default 'trial' check(plan in ('trial','starter','professional')),
 status text not null default 'trialing' check(status in ('trialing','active','past_due','cancelled')),
 provider text, provider_customer_id text, provider_subscription_id text,
 trial_ends_at timestamptz default (now()+interval '14 days'), current_period_end timestamptz, created_at timestamptz not null default now()
);
create table public.platform_admins(user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());

do $$ begin
 alter table public.appointments add constraint appointments_no_overlap_per_business
 exclude using gist (business_id with =,tstzrange(start_at,end_at,'[)') with &&) where(status<>'cancelled' and allow_overlap=false);
exception when duplicate_object then null; end $$;
create index appointments_business_start_idx on public.appointments(business_id,start_at);
create index blocked_business_start_idx on public.blocked_slots(business_id,start_at);
create index services_business_idx on public.services(business_id);

create or replace function public.is_business_member(bid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from business_members where business_id=bid and user_id=auth.uid());
$$;
create or replace function public.is_platform_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from platform_admins where user_id=auth.uid());
$$;

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.services enable row level security;
alter table public.working_hours enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.gallery_images enable row level security;
alter table public.subscriptions enable row level security;
alter table public.platform_admins enable row level security;

create policy "published businesses are public" on public.businesses for select using(is_published or public.is_business_member(id) or public.is_platform_admin());
create policy "members update business" on public.businesses for update using(public.is_business_member(id)) with check(public.is_business_member(id));
create policy "members see memberships" on public.business_members for select using(user_id=auth.uid() or public.is_platform_admin());
create policy "public active services" on public.services for select using((is_active and exists(select 1 from businesses b where b.id=business_id and b.is_published)) or public.is_business_member(business_id));
create policy "members manage services" on public.services for all using(public.is_business_member(business_id)) with check(public.is_business_member(business_id));
create policy "public hours" on public.working_hours for select using(exists(select 1 from businesses b where b.id=business_id and b.is_published) or public.is_business_member(business_id));
create policy "members manage hours" on public.working_hours for all using(public.is_business_member(business_id)) with check(public.is_business_member(business_id));
create policy "members manage blocks" on public.blocked_slots for all using(public.is_business_member(business_id)) with check(public.is_business_member(business_id));
create policy "members manage appointments" on public.appointments for all using(public.is_business_member(business_id)) with check(public.is_business_member(business_id));
create policy "public gallery" on public.gallery_images for select using(exists(select 1 from businesses b where b.id=business_id and b.is_published) or public.is_business_member(business_id));
create policy "members manage gallery" on public.gallery_images for all using(public.is_business_member(business_id)) with check(public.is_business_member(business_id));
create policy "members see subscription" on public.subscriptions for select using(public.is_business_member(business_id) or public.is_platform_admin());
create policy "platform admins see selves" on public.platform_admins for select using(user_id=auth.uid());

grant execute on function public.is_business_member(uuid) to anon,authenticated;
grant execute on function public.is_platform_admin() to authenticated;

-- Güvenli ve atomik işletme kurulum fonksiyonu.
create or replace function public.create_business(p_name text,p_slug text,p_phone text) returns uuid
language plpgsql security definer set search_path=public as $$
declare bid uuid; clean_slug text;
begin
 if auth.uid() is null then raise exception 'Giriş gerekli'; end if;
 if exists(select 1 from business_members where user_id=auth.uid()) then raise exception 'Bu hesapta zaten işletme var'; end if;
 clean_slug:=lower(trim(p_slug));
 if clean_slug!~'^[a-z0-9][a-z0-9-]{2,39}$' then raise exception 'Geçersiz site adresi'; end if;
 insert into businesses(name,slug,phone,email) values(trim(p_name),clean_slug,trim(p_phone),(select email from auth.users where id=auth.uid())) returning id into bid;
 insert into business_members(business_id,user_id,role) values(bid,auth.uid(),'owner');
 insert into subscriptions(business_id) values(bid);
 insert into working_hours(business_id,day_of_week,is_open,start_time,end_time)
 select bid,d,d between 1 and 6,'09:00','20:00' from generate_series(0,6)d;
 insert into services(business_id,name,description,duration_minutes,price,sort_order) values
 (bid,'Saç Kesimi','Profesyonel saç kesimi',30,null,1),(bid,'Sakal Tıraşı','Sakal şekillendirme ve bakım',20,null,2),(bid,'Saç + Sakal','Eksiksiz bakım paketi',50,null,3);
 return bid;
end $$;
grant execute on function public.create_business(text,text,text) to authenticated;

-- Logo ve galeri depolama alanı.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('business-media','business-media',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "public business media" on storage.objects for select using(bucket_id='business-media');
create policy "members upload business media" on storage.objects for insert to authenticated with check(bucket_id='business-media' and public.is_business_member(((storage.foldername(name))[1])::uuid));
create policy "members update business media" on storage.objects for update to authenticated using(bucket_id='business-media' and public.is_business_member(((storage.foldername(name))[1])::uuid));
create policy "members delete business media" on storage.objects for delete to authenticated using(bucket_id='business-media' and public.is_business_member(((storage.foldername(name))[1])::uuid));
