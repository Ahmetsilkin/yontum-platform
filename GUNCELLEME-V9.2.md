# Yontum V9.2 — Mobil Panel ve Gelişmiş Galeri

## Mobil panel
- Alt menü kaldırıldı; solda 78px sabit ikon rayı.
- Menü düğmesiyle 240px açılır/kapanır.
- Menü kendi içinde dikey kaydırılır; Siteyi Düzenle, Çalışanlar ve Domain kaybolmaz.
- İçerik sidebar altında kalmaz; tablolar yatay scroll kullanır.

## Galeri
- Konum: after_hero, after_services, after_staff, before_booking, before_footer.
- Genişlik: compact, standard, large, fullscreen.
- Oran: 1:1, 4:3, 16:9, 3:4, original.
- Mobil sütun: auto, one, two.
- Dokuz radikal layout ortak flex/order sistemiyle galeri konumunu uygular.
- Fotoğraf ve MP4/WebM editörde birlikte görünür; video silinebilir.

Supabase'de migration-023-mobile-gallery-controls.sql bir kez çalıştırılmalıdır.
