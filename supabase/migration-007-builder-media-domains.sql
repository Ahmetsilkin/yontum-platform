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
