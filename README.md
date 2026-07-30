# Yontum Platform MVP

Berberlerin kendi web sitesini ve online randevu sistemini oluşturduğu çok kiracılı SaaS platformu.

## Bu sürümde hazır olanlar

- Platform tanıtım ve fiyatlandırma sayfası
- Berber kayıt/giriş sistemi
- İşletme kurulum sihirbazı
- Tenant bazlı güvenli Supabase veritabanı ve RLS
- Her işletmeye benzersiz slug/alt alan adı
- Otomatik varsayılan hizmet ve çalışma programı
- Site adı, özel ana/vurgulu başlık, açıklama, telefon, adres ve Instagram düzenleme
- Logo ve kapak fotoğrafı yükleme/kaldırma
- Modern, klasik ve minimal şablonlar
- Serif, sans-serif ve display yazı tipi seçenekleri
- Ana renk, arka plan ve yazı rengi seçimi
- Sağ görsel alanında amblem, logo, kapak veya boş görünüm
- Çoklu galeri fotoğrafı yükleme/silme
- Hizmet, hakkımızda, galeri, iletişim ve fiyat bölümlerini göster/gizle
- Fiyatları göster/gizle
- Hizmet ekleme, düzenleme ve pasife alma
- Çalışma günleri ve saatleri
- Gün kartlarıyla müşteri randevusu
- Çakışan randevuları veritabanı seviyesinde engelleme
- Berber randevu/ciro paneli
- Abonelik ve platform yöneticisi veritabanı temeli

## Kurulum

1. Yeni ve ayrı bir Supabase projesi oluşturun.
2. SQL Editor'da `supabase/schema.sql` dosyasını çalıştırın.
3. Authentication > URL Configuration bölümünde Site URL ve Redirect URLs alanına yerel/canlı adresleri ekleyin:
   - `http://localhost:3000/auth/callback`
   - `https://alanadiniz.com/auth/callback`
4. `.env.example` dosyasını `.env.local` olarak kopyalayıp anahtarları girin.
5. `npm install && npm run dev` çalıştırın.

## Ortam değişkenleri

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_ROOT_DOMAIN=yontum.com
NEXT_PUBLIC_SITE_URL=https://yontum.com
```

## Yerel alt alan adı testi

Tarayıcı destekliyorsa `demo.localhost:3000` adresi `demo` slug işletmesini açar. Alternatif önizleme adresi her zaman çalışır:

```text
http://localhost:3000/site/demo
```

## Vercel ve wildcard domain

Ana domain Vercel'e bağlandıktan sonra DNS/Vercel Domains bölümünde wildcard domain eklenmelidir:

```text
*.yontum.com
```

Böylece `mehmetusta.yontum.com` gibi adresler aynı deployment'a gelir ve middleware doğru işletmeyi gösterir.

## Güvenlik

- Her tenant tablosunda `business_id` vardır.
- Berberler yalnızca üyesi oldukları işletmenin verisini görür.
- Müşteri bilgileri anonim kullanıcılara açılmaz.
- Randevu oluşturma sunucu API'sinden ve secret key ile yapılır.
- Secret key asla GitHub'a veya tarayıcıya eklenmemelidir.

## Sonraki faz

- Platform süper yönetici arayüzü
- Abonelik/ödeme sağlayıcısı entegrasyonu
- Deneme süresi ve otomatik hesap kısıtlama
- Galeri yükleme arayüzü
- E-posta ve SMS hatırlatmaları
- Özel domain otomasyonu
- Çoklu çalışan/şube
