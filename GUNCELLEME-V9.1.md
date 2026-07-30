# Yontum V9.1 — Google Yorumları

- İşletme panelinde Google Place ID, Google Maps URL, yorum göster/gizle ve 3–5 yorum limiti ayarlanır.
- API anahtarı güvenlik nedeniyle işletme paneline girilmez; Yontum sahibi Vercel Environment Variables'a `GOOGLE_PLACES_API_KEY` olarak ekler.
- Server route Google Places API (New) Place Details alanlarından puan, toplam değerlendirme ve yorumları çeker.
- Yanıt 1 saat cache edilir.
- Yazar adı, fotoğraf, yıldız, tarih, metin ve Google Maps kaynak bağlantısı gösterilir.
- Google atıf metni ve kaynak bağlantısı korunur.
- Yorumlar RadicalTenantSite içinde iletişim/footer öncesinde temaya uyumlu görünür.

Supabase'de migration-022-google-reviews.sql bir kez çalıştırılmalıdır.
