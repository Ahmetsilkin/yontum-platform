# Yontum V7.8
- Davet kabulü ana sayfaya düşse bile middleware çalışanı zorunlu şifre oluşturma ekranına yönlendirir.
- Şifre oluşturulunca password_set bilgisi kaydedilir.
- Randevu yönetim bağlantısında iptal ve tarih/saat değiştirme çalışır.
- Geçersiz/eski randevularda anlaşılır hata gösterilir.
- 9 farklı tam site şablonu: Barber Heritage, Barber Modern, Hair Editorial, Beauty Soft, Beauty Luxury, Nail Pop, Spa Zen, Dietitian Fresh, Psychology Calm.
- Şablonlar düzen, font, kart, galeri ve hero yapısını değiştirir.
- Sağdaki çerçeveli görsel sütun tüm yeni şablonlarda kaldırıldı.

Supabase'de migration-010-templates-reschedule.sql bir kez çalıştırılmalıdır.
