# Yontum V8.0 — Çalışan ve Randevu Çekirdeği

- Varsayılan Ana Takvim müşteriye gösterilmez.
- Gerçek çalışan yoksa çalışan seçim adımı otomatik atlanır.
- Çalışan pasife alınabilir veya aktifleştirilebilir.
- Owner çalışanı kalıcı silebilir.
- Gelecek randevular başka çalışana aktarılır veya iptal edilir.
- Başka işletme üyeliği yoksa çalışanın Supabase Auth hesabı da silinir.
- Geçmiş randevular çalışan adı snapshot'ı ile korunur.
- Randevu panelinde çalışan sütunu ve çalışan filtresi bulunur.
- Silme işlemleri audit_logs tablosuna kaydedilir.

Supabase'de migration-011-v8-core.sql bir kez çalıştırılmalıdır. Kodlar önce v8-staging branch'ine yüklenmelidir.
