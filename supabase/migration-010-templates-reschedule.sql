-- Yontum V7.8: gerçek şablonlar ve randevu değişiklik geçmişi
alter table public.businesses add column if not exists template_key text not null default 'barber_modern';
alter table public.appointments add column if not exists rescheduled_at timestamptz;
alter table public.appointments add column if not exists previous_start_at timestamptz;
alter table public.appointments add column if not exists previous_end_at timestamptz;

do $$ begin alter table public.businesses add constraint template_key_check check(template_key in('barber_heritage','barber_modern','hair_editorial','beauty_soft','beauty_luxury','nail_pop','spa_zen','dietitian_fresh','psychology_calm')); exception when duplicate_object then null; end $$;
