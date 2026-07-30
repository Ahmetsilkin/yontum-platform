-- Yontum V8.0: çalışan yaşam döngüsü ve randevu geçmişi
alter table public.staff_profiles
 add column if not exists is_default boolean not null default false,
 add column if not exists deleted_at timestamptz;
alter table public.appointments
 add column if not exists staff_name_snapshot text;

update public.staff_profiles set is_default=true
where title='Ana Takvim' or name in(select name from businesses where businesses.id=staff_profiles.business_id)
and sort_order=0;
update public.appointments a set staff_name_snapshot=s.name
from public.staff_profiles s where s.id=a.staff_id and a.staff_name_snapshot is null;

create table if not exists public.audit_logs(
 id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,
 actor_user_id uuid references auth.users(id) on delete set null,action text not null,entity_type text not null,
 entity_id uuid,details jsonb not null default '{}'::jsonb,created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create policy "owners managers see audit" on public.audit_logs for select using(public.member_role(business_id) in('owner','manager'));

create or replace function public.snapshot_appointment_staff() returns trigger language plpgsql set search_path=public as $$
begin
 if new.staff_id is not null then select name into new.staff_name_snapshot from staff_profiles where id=new.staff_id;end if;
 return new;
end $$;
drop trigger if exists appointments_staff_snapshot on public.appointments;
create trigger appointments_staff_snapshot before insert or update of staff_id on public.appointments for each row execute function public.snapshot_appointment_staff();

-- Varsayılan takvimin aktif ve bağlı kalmasını sağla.
do $$ declare r record; sid uuid; begin
 for r in select id from businesses loop
  sid:=public.ensure_default_staff(r.id);
  update staff_profiles set is_default=true where id=sid;
 end loop;
end $$;
