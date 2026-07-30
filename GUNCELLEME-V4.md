# Yontum V4 — Çoklu Sektör ve Galeri Düzeltmesi

## Düzeltme
- Galeride 3'ten fazla fotoğraf olduğunda aşağıdaki yazılarla çakışma giderildi.
- Galeri artık fotoğraf sayısına göre otomatik büyür.
- Mobil ve masaüstünde responsive ızgara kullanır.

## Yeni sektörler
- Erkek berberi
- Kadın kuaförü
- Güzellik merkezi
- Nail / kirpik / kaş stüdyosu
- Spa / masaj
- Diğer bakım işletmeleri

## Sektörel otomasyon
Kayıtta seçilen işletme türüne göre renk, font, başlık, görsel dil ve örnek hizmetler otomatik oluşturulur. Panelden sektör ve tema sonradan değiştirilebilir.

## Kurulum
1. V3 migration henüz uygulanmadıysa önce `migration-003-operations-and-content.sql` çalıştırın.
2. Ardından `migration-004-industries-and-themes.sql` dosyasını Supabase SQL Editor'da bir kez çalıştırın.
3. Güncelleme paketindeki kaynak dosyaları GitHub depo köküne yükleyin.
