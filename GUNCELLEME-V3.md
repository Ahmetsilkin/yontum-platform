# Yontum Operasyon ve Tam Site Yönetimi — V3

## Yeni özellikler

- Hizmet süresine göre otomatik randevu bitiş saati
- Panelde başlangıç–bitiş saatini birlikte gösterme
- Telefon/mağaza müşterisi için manuel randevu ekleme
- Çakışmada uyarı ve berber onayıyla zorla ekleme
- Aktif, iptal edilen ve arşiv randevu sekmeleri
- İptal nedeni ve 30 günlük iptal geçmişi
- Tamamen silme ve manuel arşivleme
- E-posta iptal bildirimi için Resend altyapısı
- Hazır WhatsApp iptal mesajı
- Geçmiş saatlere istemci ve sunucu düzeyinde engel
- E-posta doğrulama başarı sayfası
- Panel içinde canlı site önizlemesi
- Tek tıkla Modern, Klasik ve Portfolyo paketleri
- Vitrin, Hızlı Randevu ve Portfolyo bölüm düzenleri
- Ana ekran, hizmetler, hakkımızda, randevu ve iletişim metinlerini değiştirme/silme
- Telefon, adres ve Instagram etiketlerini değiştirme

## Kurulum

Mevcut Supabase projesinde yalnızca `supabase/migration-003-operations-and-content.sql` dosyasını bir kez çalıştırın. Sonra güncelleme paketindeki dosyaları GitHub depo köküne yükleyip `main` dalına commit edin.

## E-posta iptal bildirimi

Otomatik e-posta için Vercel ortam değişkenlerine şu değerler eklenmelidir:

```env
RESEND_API_KEY=re_...
NOTIFICATION_FROM=Yontum <bildirim@alanadiniz.com>
```

Resend/domain kurulana kadar iptal işlemi ve hazır WhatsApp mesajı çalışır; yalnızca otomatik e-posta gönderilmez.
