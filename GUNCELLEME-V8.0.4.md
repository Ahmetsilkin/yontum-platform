# Yontum V8.0.4 — Site Adını Serbest Bırakma

- Auth hesabı/owner üyeliği silinen işletme otomatik arşivlenir.
- Eski slug `deleted-<id>-<slug>` biçimine taşınır.
- original_slug ve deleted_at saklanır.
- Site yayından kaldırılır.
- Eski site adı yeni hesap tarafından tekrar seçilebilir.
- Mevcut sahipsiz test işletmeleri migration çalışınca otomatik arşivlenir.
