-- Yontum V8.0.3: sistemsel Ana Takvim kaydını müşteriden gizle
update public.staff_profiles
set is_default=true
where title='Ana Takvim' or username='ana-takvim';

-- İşletme sahibiyle eşleşen ilk sistem takvimlerini de düzelt.
update public.staff_profiles s
set is_default=true
from public.business_members m
where m.business_id=s.business_id
  and m.user_id=s.user_id
  and m.role='owner'
  and s.sort_order=0
  and (s.title='Ana Takvim' or s.email is null);
