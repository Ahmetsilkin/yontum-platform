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
