# Yontum V8.5 — Şifremi Unuttum Yönlendirme Düzeltmesi

- Reset e-postası doğrudan canonical `/sifre-yenile` adresini kullanır.
- Supabase recovery linki yanlışlıkla ana sayfaya düşerse global AuthHashRedirect URL hash'indeki `type=recovery` değerini algılayıp `/sifre-yenile` sayfasına taşır.
- Şifre yenileme sayfası PKCE code, token_hash ve access_token hash biçimlerini destekler.
- Şifre cookie session'a bağlı updateUser yerine doğrulanmış bearer token ile güvenli server API üzerinden güncellenir.
- Token URL'den temizlenir ve kullanıcı yeni şifresiyle giriş sayfasına gönderilir.

Yeni migration gerekmez. Güncellemeden önce oluşturulmuş eski reset e-postaları yerine yeni e-posta istenmelidir.
