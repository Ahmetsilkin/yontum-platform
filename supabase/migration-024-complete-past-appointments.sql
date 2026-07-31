-- ============================================================
-- 024 - Eksik olan complete_past_appointments fonksiyonu
--   Kod içinde (BusinessDashboard.tsx) her panel açılışında bu RPC
--   çağrılıyordu ama veritabanında hiç tanımlı değildi, bu yüzden
--   sessizce hiçbir şey yapmıyordu ve geçmiş randevular "Aktif"
--   listesinde sonsuza kadar birikiyordu.
--
--   Mantık: 24 saatten eski, hâlâ "confirmed" durumunda kalmış
--   (kimse tamamlandı/gelmedi işaretlememiş) randevuları otomatik
--   "completed" yapar. Son 24 saat içindekiler otomatik dokunulmaz,
--   onlar panelde "Geçmiş" sekmesinde elle işaretlenmek üzere görünür.
-- ============================================================

create or replace function public.complete_past_appointments()
returns void as $$
begin
  update public.appointments
  set status = 'completed', updated_at = now()
  where status = 'confirmed'
    and end_at < now() - interval '24 hours'
    and business_id in (
      select business_id from public.business_members where user_id = auth.uid()
    );
end;
$$ language plpgsql security definer;

-- Panelde randevu iptali/güncellemesi anında yansısın diye (BusinessDashboard.tsx'teki
-- Realtime aboneliği bu olmadan hiçbir değişikliği görmez):
alter publication supabase_realtime add table public.appointments;
