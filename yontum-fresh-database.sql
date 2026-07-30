-- YONTUM TEMİZ KURULUM VERİTABANI
-- Yalnızca boş ve yeni bir Supabase projesinde tek sefer çalıştırın.

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


-- V2-V5 güncellemelerinin temiz kurulum uyumluluk katmanı
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

-- Yontum v3: manuel randevu, iptal, hazır düzen ve tam metin yönetimi
alter table public.businesses
  add column if not exists layout_preset text not null default 'showcase',
  add column if not exists hero_label text not null default 'ERKEK BAKIM · ONLINE RANDEVU',
  add column if not exists visual_label text not null default 'PROFESYONEL BAKIM',
  add column if not exists services_label text not null default 'HİZMETLER',
  add column if not exists services_title text not null default 'Tarzını seç.',
  add column if not exists services_description text not null default 'İhtiyacına uygun hizmeti seç, randevunu hemen oluştur.',
  add column if not exists about_label text not null default 'HAKKIMIZDA',
  add column if not exists about_title text not null default 'Ustalık detaylarda gizli.',
  add column if not exists booking_label text not null default 'ONLINE RANDEVU',
  add column if not exists booking_title text not null default 'Saatini ayır.',
  add column if not exists booking_description text not null default 'Hizmetini, gününü ve saatini seç. Randevun anında kesinleşsin.',
  add column if not exists phone_label text not null default 'Telefon',
  add column if not exists address_label text not null default 'Adres',
  add column if not exists instagram_label text not null default 'Instagram',
  add column if not exists footer_note text default 'Yontum ile hazırlandı';

do $$ begin
 alter table public.businesses add constraint businesses_layout_preset_check
 check(layout_preset in ('showcase','booking_first','portfolio'));
exception when duplicate_object then null; end $$;

alter table public.appointments
  add column if not exists source text not null default 'online',
  add column if not exists allow_overlap boolean not null default false,
  add column if not exists cancellation_reason text,
  add column if not exists cancelled_at timestamptz,
  add column if not exists archived_at timestamptz;

do $$ begin
 alter table public.appointments add constraint appointments_source_check
 check(source in ('online','manual'));
exception when duplicate_object then null; end $$;

-- Berberin açıkça onayladığı manuel randevu, çakışma kontrolünün dışında tutulabilir.
alter table public.appointments drop constraint if exists appointments_no_overlap_per_business;
alter table public.appointments add constraint appointments_no_overlap_per_business
exclude using gist (business_id with =,tstzrange(start_at,end_at,'[)') with &&)
where(status<>'cancelled' and allow_overlap=false);

create index if not exists appointments_status_idx on public.appointments(business_id,status,start_at);

-- Yontum V4: çoklu sektör, sektörel hazır temalar ve varsayılan içerikler
alter table public.businesses
  add column if not exists business_type text not null default 'barber';

do $$ begin
 alter table public.businesses add constraint businesses_type_check
 check(business_type in ('barber','hair_salon','beauty','nail_lash','spa_massage','other'));
exception when duplicate_object then null; end $$;

-- Yeni dört parametreli işletme kurulum fonksiyonu.
create or replace function public.create_business(p_name text,p_slug text,p_phone text,p_business_type text) returns uuid
language plpgsql security definer set search_path=public as $$
declare bid uuid; clean_slug text; bt text; color text; bg text; txt text; selected_theme text; selected_font text; hero text; highlight text; label text;
begin
 if auth.uid() is null then raise exception 'Giriş gerekli'; end if;
 if exists(select 1 from business_members where user_id=auth.uid()) then raise exception 'Bu hesapta zaten işletme var'; end if;
 clean_slug:=lower(trim(p_slug)); bt:=coalesce(nullif(p_business_type,''),'other');
 if bt not in ('barber','hair_salon','beauty','nail_lash','spa_massage','other') then bt:='other'; end if;
 if clean_slug!~'^[a-z0-9][a-z0-9-]{2,39}$' then raise exception 'Geçersiz site adresi'; end if;
 if exists(select 1 from businesses where slug=clean_slug) then raise exception 'Bu site adresi daha önce alınmış'; end if;

 color:=case bt when 'barber' then '#111111' when 'hair_salon' then '#7c3157' when 'beauty' then '#a46b78' when 'nail_lash' then '#9b4d88' when 'spa_massage' then '#43685d' else '#222222' end;
 bg:=case bt when 'barber' then '#f5f5f1' when 'hair_salon' then '#fbf4f7' when 'beauty' then '#faf2f0' when 'nail_lash' then '#fff5fc' when 'spa_massage' then '#f0f5f1' else '#f7f7f4' end;
 txt:=case bt when 'spa_massage' then '#17352c' when 'beauty' then '#352226' else '#111111' end;
 selected_theme:=case when bt in ('beauty','hair_salon') then 'classic' when bt='spa_massage' then 'minimal' else 'modern' end;
 selected_font:=case when bt in ('beauty','hair_salon') then 'serif' when bt='spa_massage' then 'sans' else 'display' end;
 hero:=case bt when 'barber' then 'Tarzını' when 'hair_salon' then 'Işığını' when 'beauty' then 'Güzelliğini' when 'nail_lash' then 'Tarzını' when 'spa_massage' then 'Kendine' else 'Kendini' end;
 highlight:=case bt when 'barber' then 'yeniden keşfet' when 'hair_salon' then 'yansıt' when 'beauty' then 'ortaya çıkar' when 'nail_lash' then 'detaylarda göster' when 'spa_massage' then 'iyi bak' else 'özel hisset' end;
 label:=case bt when 'barber' then 'ERKEK BAKIM' when 'hair_salon' then 'SAÇ · RENK · BAKIM' when 'beauty' then 'GÜZELLİK · BAKIM' when 'nail_lash' then 'NAIL · LASH · BROW' when 'spa_massage' then 'SPA · MASAJ · WELLNESS' else 'PROFESYONEL BAKIM' end;

 insert into businesses(name,slug,phone,email,business_type,primary_color,background_color,text_color,theme,font_family,hero_title,hero_highlight,hero_label,visual_label)
 values(trim(p_name),clean_slug,trim(p_phone),(select email from auth.users where id=auth.uid()),bt,color,bg,txt,selected_theme,selected_font,hero,highlight,label,label)
 returning id into bid;
 insert into business_members(business_id,user_id,role) values(bid,auth.uid(),'owner');
 insert into subscriptions(business_id) values(bid);
 insert into working_hours(business_id,day_of_week,is_open,start_time,end_time) select bid,d,d between 1 and 6,'09:00','20:00' from generate_series(0,6)d;

 if bt='barber' then
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Saç Kesimi','Profesyonel saç kesimi',30,null,1),(bid,'Sakal Tıraşı','Sakal şekillendirme ve bakım',20,null,2),(bid,'Saç + Sakal','Eksiksiz bakım paketi',50,null,3);
 elsif bt='hair_salon' then
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Saç Kesimi','Kişiye özel kesim ve şekillendirme',45,null,1),(bid,'Saç Boyama','Profesyonel renklendirme',120,null,2),(bid,'Fön ve Şekillendirme','Günlük veya özel gün şekillendirme',45,null,3);
 elsif bt='beauty' then
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Cilt Bakımı','Cilt tipine özel profesyonel bakım',60,null,1),(bid,'Kaş Tasarımı','Yüz hatlarına uygun kaş tasarımı',30,null,2),(bid,'Kirpik Lifting','Doğal kirpiklere kıvrım ve görünüm',60,null,3);
 elsif bt='nail_lash' then
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Kalıcı Oje','Uzun süre kalıcı renk uygulaması',60,null,1),(bid,'Protez Tırnak','Kişiye özel protez tırnak uygulaması',120,null,2),(bid,'Manikür','El ve tırnak bakımı',45,null,3);
 elsif bt='spa_massage' then
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Klasik Masaj','Rahatlatıcı klasik masaj',60,null,1),(bid,'Aromaterapi Masajı','Aromatik yağlarla rahatlama',75,null,2),(bid,'Sırt ve Boyun Masajı','Bölgesel rahatlatıcı uygulama',30,null,3);
 else
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Standart Hizmet','Profesyonel hizmet',60,null,1);
 end if;
 return bid;
exception when unique_violation then raise exception 'Bu site adresi daha önce alınmış';
end $$;
grant execute on function public.create_business(text,text,text,text) to authenticated;

-- Eski istemciler için geriye uyumlu üç parametreli fonksiyon.
create or replace function public.create_business(p_name text,p_slug text,p_phone text) returns uuid
language sql security definer set search_path=public as $$
 select public.create_business(p_name,p_slug,p_phone,'barber');
$$;

-- Yontum V5: işletmeye özel WhatsApp iletişim butonu
alter table public.businesses
  add column if not exists whatsapp_enabled boolean not null default true,
  add column if not exists whatsapp_phone text,
  add column if not exists whatsapp_message text not null default 'Merhaba, hizmetleriniz ve uygun randevu saatleri hakkında bilgi almak istiyorum.',
  add column if not exists whatsapp_button_text text not null default 'WhatsApp ile yazın';

-- Mevcut işletmelerde WhatsApp numarası olarak işletme telefonu kullanılır.
update public.businesses
set whatsapp_phone=phone
where whatsapp_phone is null and phone is not null;
-- Yontum V6: çalışanlar, roller, çalışana özel takvim ve müşteri iptali
alter table public.business_members drop constraint if exists business_members_role_check;
alter table public.business_members add constraint business_members_role_check check(role in ('owner','manager','staff'));

create table if not exists public.staff_profiles(
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 user_id uuid references auth.users(id) on delete set null, name text not null, username text,
 email text, phone text, title text, bio text, photo_url text, is_active boolean not null default true,
 sort_order int not null default 0, created_at timestamptz not null default now(),
 unique(business_id,user_id), unique(business_id,username)
);
create table if not exists public.staff_services(
 staff_id uuid not null references public.staff_profiles(id) on delete cascade,
 service_id uuid not null references public.services(id) on delete cascade,
 primary key(staff_id,service_id)
);
create table if not exists public.staff_working_hours(
 id uuid primary key default gen_random_uuid(), staff_id uuid not null references public.staff_profiles(id) on delete cascade,
 day_of_week smallint not null check(day_of_week between 0 and 6), is_open boolean not null default true,
 start_time time not null default '09:00', end_time time not null default '20:00', unique(staff_id,day_of_week),check(start_time<end_time)
);
create table if not exists public.staff_time_off(
 id uuid primary key default gen_random_uuid(),staff_id uuid not null references public.staff_profiles(id) on delete cascade,
 start_at timestamptz not null,end_at timestamptz not null,reason text,status text not null default 'approved' check(status in('pending','approved','rejected')),check(start_at<end_at)
);

alter table public.appointments add column if not exists staff_id uuid references public.staff_profiles(id) on delete set null;
alter table public.appointments add column if not exists cancelled_by text check(cancelled_by in('customer','business','staff'));
alter table public.businesses add column if not exists customer_cancellation_enabled boolean not null default true;
alter table public.businesses add column if not exists cancellation_limit_minutes int not null default 180 check(cancellation_limit_minutes>=0);

-- Mevcut işletmelere varsayılan çalışan oluştur.
insert into public.staff_profiles(business_id,name,title,sort_order)
select b.id,b.name,'Ana Takvim',0 from public.businesses b
where not exists(select 1 from public.staff_profiles s where s.business_id=b.id);
update public.staff_profiles s set user_id=m.user_id
from public.business_members m where m.business_id=s.business_id and m.role='owner' and s.user_id is null;
insert into public.staff_services(staff_id,service_id)
select st.id,sv.id from public.staff_profiles st join public.services sv on sv.business_id=st.business_id on conflict do nothing;
insert into public.staff_working_hours(staff_id,day_of_week,is_open,start_time,end_time)
select st.id,w.day_of_week,w.is_open,w.start_time,w.end_time from public.staff_profiles st join public.working_hours w on w.business_id=st.business_id on conflict do nothing;
update public.appointments a set staff_id=(select s.id from public.staff_profiles s where s.business_id=a.business_id order by s.sort_order limit 1) where staff_id is null;

alter table public.appointments drop constraint if exists appointments_no_overlap_per_business;
do $$ begin
 alter table public.appointments add constraint appointments_no_overlap_per_staff exclude using gist
 (staff_id with =,tstzrange(start_at,end_at,'[)') with &&) where(status<>'cancelled' and allow_overlap=false and staff_id is not null);
exception when duplicate_object then null; end $$;

create or replace function public.member_role(bid uuid) returns text language sql stable security definer set search_path=public as $$
 select role from business_members where business_id=bid and user_id=auth.uid() limit 1;
$$;
grant execute on function public.member_role(uuid) to authenticated;

alter table public.staff_profiles enable row level security;
alter table public.staff_services enable row level security;
alter table public.staff_working_hours enable row level security;
alter table public.staff_time_off enable row level security;
create policy "public reads active staff" on public.staff_profiles for select using(is_active or public.is_business_member(business_id));
create policy "managers manage staff" on public.staff_profiles for all using(public.member_role(business_id) in('owner','manager')) with check(public.member_role(business_id) in('owner','manager'));
create policy "public reads staff services" on public.staff_services for select using(true);
create policy "managers manage staff services" on public.staff_services for all using(exists(select 1 from staff_profiles s where s.id=staff_id and public.member_role(s.business_id) in('owner','manager'))) with check(exists(select 1 from staff_profiles s where s.id=staff_id and public.member_role(s.business_id) in('owner','manager')));
create policy "public reads staff hours" on public.staff_working_hours for select using(true);
create policy "managers manage staff hours" on public.staff_working_hours for all using(exists(select 1 from staff_profiles s where s.id=staff_id and public.member_role(s.business_id) in('owner','manager'))) with check(exists(select 1 from staff_profiles s where s.id=staff_id and public.member_role(s.business_id) in('owner','manager')));
create policy "members see time off" on public.staff_time_off for select using(exists(select 1 from staff_profiles s where s.id=staff_id and public.is_business_member(s.business_id)));
create policy "staff requests time off" on public.staff_time_off for insert with check(exists(select 1 from staff_profiles s where s.id=staff_id and s.user_id=auth.uid()));
create policy "managers manage time off" on public.staff_time_off for all using(exists(select 1 from staff_profiles s where s.id=staff_id and public.member_role(s.business_id) in('owner','manager'))) with check(exists(select 1 from staff_profiles s where s.id=staff_id and public.member_role(s.business_id) in('owner','manager')));

-- Randevu erişimini role göre daralt.
drop policy if exists "members manage appointments" on public.appointments;
create policy "owners managers manage appointments" on public.appointments for all using(public.member_role(business_id) in('owner','manager')) with check(public.member_role(business_id) in('owner','manager'));
create policy "staff sees own appointments" on public.appointments for select using(exists(select 1 from staff_profiles s where s.id=staff_id and s.user_id=auth.uid()));
create policy "staff updates own appointments" on public.appointments for update using(exists(select 1 from staff_profiles s where s.id=staff_id and s.user_id=auth.uid())) with check(exists(select 1 from staff_profiles s where s.id=staff_id and s.user_id=auth.uid()));
-- Yontum V7: gelişmiş düzen, video galeri ve özel domain
alter table public.businesses
 add column if not exists logo_alignment text not null default 'left',
 add column if not exists hero_layout text not null default 'text_left',
 add column if not exists text_alignment text not null default 'left',
 add column if not exists gallery_layout text not null default 'grid',
 add column if not exists section_order text[] not null default array['services','staff','gallery','about','booking','contact'],
 add column if not exists custom_domain text unique,
 add column if not exists domain_status text not null default 'none',
 add column if not exists domain_verified_at timestamptz,
 add column if not exists domain_verification_type text,
 add column if not exists domain_verification_domain text,
 add column if not exists domain_verification_value text;

do $$ begin alter table public.businesses add constraint logo_alignment_check check(logo_alignment in('left','center','right','hidden')); exception when duplicate_object then null; end $$;
do $$ begin alter table public.businesses add constraint hero_layout_check check(hero_layout in('text_left','text_right','centered','full_image','text_only')); exception when duplicate_object then null; end $$;
do $$ begin alter table public.businesses add constraint text_alignment_check check(text_alignment in('left','center','right')); exception when duplicate_object then null; end $$;
do $$ begin alter table public.businesses add constraint gallery_layout_check check(gallery_layout in('grid','masonry','slider','showcase')); exception when duplicate_object then null; end $$;

create table if not exists public.media_items(
 id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,
 type text not null check(type in('image','video','youtube','instagram')),url text not null,thumbnail_url text,
 title text,description text,alt_text text,aspect_ratio text,sort_order int not null default 0,
 is_published boolean not null default true,created_at timestamptz not null default now()
);
alter table public.media_items enable row level security;
create policy "public media" on public.media_items for select using(is_published or public.is_business_member(business_id));
create policy "managers manage media" on public.media_items for all using(public.member_role(business_id) in('owner','manager')) with check(public.member_role(business_id) in('owner','manager'));
update storage.buckets set file_size_limit=31457280,allowed_mime_types=array['image/jpeg','image/png','image/webp','video/mp4','video/webm'] where id='business-media';
