-- Yontum V8.4: özelleştirilebilir randevu akışı
alter table public.businesses
 add column if not exists booking_ui_style text not null default 'cards',
 add column if not exists booking_texts jsonb not null default '{}'::jsonb,
 add column if not exists booking_require_email boolean not null default false,
 add column if not exists booking_show_note boolean not null default true;

do $$ begin
 alter table public.businesses add constraint booking_ui_style_check
 check(booking_ui_style in('cards','calendar','pills','timeline','minimal'));
exception when duplicate_object then null; end $$;

update public.businesses
set booking_texts=jsonb_build_object(
 'serviceTitle','Hizmet seç',
 'serviceDescription','Almak istediğin hizmeti seç.',
 'staffTitle','Çalışan seç',
 'staffDescription','Dilersen bir uzman seç veya ilk uygun çalışanı tercih et.',
 'dateTitle','Gün ve saat seç',
 'dateDescription','Sana uygun günü ve saati seç.',
 'formTitle','Bilgilerini gir',
 'formDescription','Randevunu tamamlamak için bilgilerini gir.',
 'firstNameLabel','Ad',
 'lastNameLabel','Soyad',
 'phoneLabel','Telefon',
 'emailLabel','E-posta',
 'noteLabel','Not',
 'consentText','Bilgilerimin randevu amacıyla işlenmesini kabul ediyorum.',
 'submitText','Randevuyu Oluştur',
 'successTitle','Görüşmek üzere!',
 'successDescription','Randevun başarıyla oluşturuldu.'
) || coalesce(booking_texts,'{}'::jsonb)
where booking_texts='{}'::jsonb or booking_texts is null;
