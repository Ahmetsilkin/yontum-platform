-- Yontum V5: işletmeye özel WhatsApp iletişim butonu
alter table public.businesses
  add column if not exists whatsapp_enabled boolean not null default true,
  add column if not exists whatsapp_phone text,
  add column if not exists whatsapp_message text not null default 'Merhaba, hizmetleriniz ve uygun randevu saatleri hakkında bilgi almak istiyorum.',
  add column if not exists whatsapp_button_text text not null default 'WhatsApp ile yazın';

-- Mevcut işletmelerde WhatsApp numarası olarak işletme telefonu kullanılır.
update public.businesses
set whatsapp_phone=phone
where whatsapp_phone is null and phone is not null;
