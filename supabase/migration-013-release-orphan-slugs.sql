-- Yontum V8.0.4: silinen hesapların site adlarını tekrar kullanılabilir yap
alter table public.businesses
 add column if not exists deleted_at timestamptz,
 add column if not exists original_slug text;

create or replace function public.release_business_slug(bid uuid) returns void
language plpgsql security definer set search_path=public as $$
declare current_slug text;
begin
 if exists(select 1 from business_members where business_id=bid and role='owner') then return; end if;
 select slug into current_slug from businesses where id=bid;
 if current_slug is null or current_slug like 'deleted-%' then return; end if;
 update businesses set original_slug=current_slug,slug='deleted-'||replace(id::text,'-','')||'-'||current_slug,deleted_at=now(),is_published=false,updated_at=now() where id=bid;
end $$;

create or replace function public.release_slug_after_owner_delete() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if old.role='owner' then perform public.release_business_slug(old.business_id);end if;
 return old;
end $$;
drop trigger if exists business_member_release_slug on public.business_members;
create trigger business_member_release_slug after delete on public.business_members for each row execute function public.release_slug_after_owner_delete();

-- Daha önce Auth hesabı silinmiş ve sahibi kalmamış işletmeleri şimdi arşivle.
do $$ declare r record; begin
 for r in select b.id from businesses b where b.deleted_at is null and not exists(select 1 from business_members m where m.business_id=b.id and m.role='owner') loop
  perform public.release_business_slug(r.id);
 end loop;
end $$;
