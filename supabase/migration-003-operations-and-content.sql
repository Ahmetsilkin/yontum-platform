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
