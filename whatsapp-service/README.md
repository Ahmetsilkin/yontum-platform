# Yontum WhatsApp Otomasyon Servisi

Bu, bilgisayarından çalıştırdığın küçük bir programdır. İşi şudur:
Vercel'deki siteyi her dakika kontrol eder, "gönderilmesi gereken bir
mesaj var mı?" diye sorar, varsa senin WhatsApp'ından otomatik gönderir.

Üç tür mesaj gönderir:
- Randevu alındığında **anında onay** mesajı
- Randevu saatinden **2 saat önce** hatırlatma
- Randevu "Tamamlandı" olunca **30 dakika sonra** değerlendirme isteği

## Kurulum (bir kere yapılır)

1. Bilgisayarında [Node.js](https://nodejs.org) kurulu olmalı (18 veya üstü).
2. Terminal aç, bu klasöre gir:
   ```
   cd whatsapp-service
   npm install
   ```
3. `.env.example` dosyasını kopyalayıp `.env` olarak adlandır, içini doldur:
   ```
   cp .env.example .env
   ```
   - `WHATSAPP_SERVICE_SECRET` değerini Claude/Ahmet sana ayrıca verecek (Vercel'e eklenen gizli anahtarın aynısı).

## Çalıştırma

```
npm start
```

Terminalde "Yontum WhatsApp Otomasyon Servisi başlatılıyor…" yazısını görürsün.
Bu pencereyi **açık bırak** — kapatırsan mesaj gönderimi durur (bilgisayar
kapansa/uyusa bile sorun değil, tekrar açtığında kaldığı yerden devam eder,
hiçbir mesaj kaybolmaz).

## WhatsApp'ı bağlama (her işletme için bir kere)

1. Vercel'deki panelde (yontum.vercel.app/panel) ilgili işletmenin hesabıyla
   giriş yap → sol menüden **"📱 WhatsApp Otomasyonu"**na tıkla.
2. Bu servis çalışıyorsa, birkaç saniye içinde panelde bir **QR kod** belirir.
3. Telefonundan: WhatsApp → Ayarlar (⚙️) → Bağlı Cihazlar → Cihaz Bağla →
   ekrandaki QR kodu tarat.
4. Bağlanınca panelde "✓ Bağlı: 90XXXXXXXXXX" yazısını görürsün. Artık o
   işletmenin mesajları bu numaradan otomatik gidecek.

## Önemli notlar

- `sessions/` klasörü telefon bağlantı bilgilerini saklar — **asla paylaşma
  veya git'e ekleme** (zaten `.gitignore`'da hariç tutuldu). Bu klasör
  silinirse WhatsApp'ı yeniden bağlaman (QR taratman) gerekir.
- `.env` dosyası da gizli bilgiler içerir, paylaşma.
- Bu servisin çalıştığı bilgisayar ne kadar süre kapalıysa, o süre boyunca
  yeni mesaj gitmez — ama bilgisayar tekrar açılıp servis başlayınca,
  gecikmiş tüm mesajlar (henüz zamanı geçmemiş olanlar) otomatik gönderilir.
  Hiçbir randevu "unutulmaz".
- WhatsApp resmi olmayan bu tür otomasyon araçlarını (Baileys) zaman zaman
  kısıtlayabiliyor. Şablon mesajları çok sık/çok sayıda göndermemeye dikkat
  et; kod zaten her mesaj arasına 3-5 saniye rastgele bekleme koyuyor.
- Test aşaması bittiğinde, güvenilirlik için bu servisi 7/24 açık bir
  yerde (ucuz bir sunucu, ör. Railway/Fly.io, veya evde hep açık kalan bir
  mini bilgisayar) çalıştırman iyi olur — laptop kapanınca/uyuyunca
  mesajlar birikip gecikir.
