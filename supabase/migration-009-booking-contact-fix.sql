-- Yontum V7.7: yeni işletmelerde varsayılan çalışan ve iletişim konumu
alter table public.businesses add column if not exists contact_layout text not null default 'footer';
do $$ begin alter table public.businesses add constraint contact_layout_check check(contact_layout in('footer','section','both')); exception when duplicate_object then null; end $$;

create or replace function public.ensure_default_staff(bid uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare sid uuid; owner_id uuid;
begin
 select id into sid from staff_profiles where business_id=bid order by sort_order limit 1;
 if sid is null then
  select user_id into owner_id from business_members where business_id=bid and role='owner' limit 1;
  insert into staff_profiles(business_id,user_id,name,title,sort_order,is_active)
  select b.id,owner_id,b.name,'Ana Takvim',0,true from businesses b where b.id=bid returning id into sid;
 end if;
 insert into staff_services(staff_id,service_id) select sid,id from services where business_id=bid on conflict do nothing;
 insert into staff_working_hours(staff_id,day_of_week,is_open,start_time,end_time)
 select sid,day_of_week,is_open,start_time,end_time from working_hours where business_id=bid on conflict(staff_id,day_of_week) do update set is_open=excluded.is_open,start_time=excluded.start_time,end_time=excluded.end_time;
 return sid;
end $$;

create or replace function public.sync_default_staff_trigger() returns trigger language plpgsql security definer set search_path=public as $$ begin perform public.ensure_default_staff(new.business_id);return new;end $$;
drop trigger if exists services_ensure_default_staff on public.services;
create trigger services_ensure_default_staff after insert on public.services for each row execute function public.sync_default_staff_trigger();

-- Mevcut ama çalışanı olmayan işletmeleri düzelt.
do $$ declare r record; begin for r in select id from businesses loop perform public.ensure_default_staff(r.id);end loop;end $$;
