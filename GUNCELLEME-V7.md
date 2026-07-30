# Yontum V7

Bu paket yalnızca V7 güncellemesinde değişen dosyaları içerir.

## Özellikler
- Çalışan daveti sonrası şifre oluşturma
- Şifremi unuttum ve şifre yenileme
- Güvenli auth callback yönlendirmesi
- Logo konumu, hero düzeni ve metin hizası
- Grid, masonry, slider ve showcase galeri
- MP4/WebM video yükleme ve gösterme
- Kullanıcının satın aldığı özel domaini Vercel API ile bağlaması
- TXT/A/CNAME doğrulama altyapısı

## Veritabanı
Mevcut V6 veritabanında `supabase/migration-007-builder-media-domains.sql` bir kez çalıştırılmalıdır.

## Vercel değişkenleri
- VERCEL_TOKEN
- VERCEL_PROJECT_ID
- VERCEL_TEAM_ID
