# Yontum V8.3.4 — Nizami Eşit Galeri ve CTA Animasyonları

- Tüm medya kartları aynı 4:3 oranında ve eşit boyutta render edilir.
- 1 medya tek tam satır; 2 medya iki eşit sütun; 3 medya üç eşit sütun; 4 medya 2x2; 5+ auto-fit eşit grid.
- Mobilde tek sayılı medya setleri tek sütun, çift sayılı setler iki sütun kullanır; boş hücre kalmaz.
- Fotoğraf ve MP4/WebM aynı kart ölçülerini kullanır.
- Editör yükleme butonu “Fotoğraf / Video Ekle” olarak güncellendi.
- CTA görünümü: dolu, outline, pill, underline, floating.
- CTA animasyonu: none, pulse, float, shine, bounce.
- Buton stil/animasyon seçimi anında önizlemeye uygulanır.

Supabase'de migration-018-gallery-cta-animation.sql bir kez çalıştırılmalıdır. Daha önce uygulanmadıysa migration-016 ve 017 önce çalıştırılır.
