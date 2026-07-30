# Yontum V8.4.3 — Kaybolan İleri Butonları

Radikal tema root'u `--accent` kullanırken TenantBooking `--brand` bekliyordu. Bu nedenle bazı temalarda Gün ve Saat Seç / Bilgilerimi Gir / Randevuyu Oluştur butonlarının arka planı şeffaf, metni beyaz kalıyor ve buton kaybolmuş gibi görünüyordu.

Düzeltme:
- RadicalTenantSite hem `--accent` hem `--brand` tanımlar.
- TenantBooking ileri butonlarına bağımsız temel width/display/padding/min-height/background/text kuralları eklendi.
- Buton yazıları korunur; stil ve animasyon seçenekleri çalışmaya devam eder.

Yeni migration gerekmez.
