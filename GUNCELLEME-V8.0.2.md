# Yontum V8.0.2 — Auth Session Missing Kesin Düzeltme

- Davet URL hash'indeki access token istemcide okunur.
- Şifre, session cookie'ye bağlı updateUser yerine güvenli sunucu API'siyle kaydedilir.
- Sunucu access token'ı Supabase ile doğrular, kullanıcının invited_staff olduğunu kontrol eder ve Admin API ile şifreyi günceller.
- Token URL'den temizlenir ve kullanıcı yeni şifresiyle giriş ekranına gönderilir.
- Ham token loglanmaz veya veritabanına yazılmaz.

Yeni migration gerekmez. Güvenlik için daha önce paylaşılan/test edilen davet oturumları iptal edilip yeni davet oluşturulmalıdır.
