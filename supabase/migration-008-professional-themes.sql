-- Yontum V7.5: diyetisyen/psikolog sektörleri ve sade varsayılan hero
alter table public.businesses drop constraint if exists businesses_type_check;
alter table public.businesses drop constraint if exists businesses_business_type_check;
alter table public.businesses add constraint businesses_type_check check(business_type in ('barber','hair_salon','beauty','nail_lash','spa_massage','dietitian','psychologist','other'));
update public.businesses set hero_visual_mode='none' where hero_visual_mode='emblem';

create or replace function public.create_business_v2(p_name text,p_slug text,p_phone text,p_business_type text) returns uuid
language plpgsql security definer set search_path=public as $$
declare bid uuid; base_type text;
begin
 base_type:=case when p_business_type in('dietitian','psychologist') then 'other' else p_business_type end;
 bid:=public.create_business(p_name,p_slug,p_phone,base_type);
 if p_business_type='dietitian' then
  update businesses set business_type='dietitian',primary_color='#6f9b7a',background_color='#f5f8f2',text_color='#21362a',theme='minimal',font_family='sans',hero_title='Sağlıklı yaşam',hero_highlight='sana özel bir yolculuk',hero_label='BESLENME · DENGE · SAĞLIK',visual_label='',hero_visual_mode='none' where id=bid;
  delete from services where business_id=bid;
  insert into services(business_id,name,description,duration_minutes,sort_order) values(bid,'İlk Görüşme','Beslenme geçmişi ve hedef analizi',60,1),(bid,'Kontrol Görüşmesi','Süreç değerlendirmesi ve plan güncelleme',30,2),(bid,'Online Danışmanlık','Uzaktan bireysel görüşme',45,3);
 elsif p_business_type='psychologist' then
  update businesses set business_type='psychologist',primary_color='#71849c',background_color='#f3f5f7',text_color='#243140',theme='minimal',font_family='serif',hero_title='Kendini anlamaya',hero_highlight='güvenli bir alan',hero_label='DANIŞMANLIK · DESTEK · DENGE',visual_label='',hero_visual_mode='none' where id=bid;
  delete from services where business_id=bid;
  insert into services(business_id,name,description,duration_minutes,sort_order) values(bid,'Bireysel Görüşme','Bireysel psikolojik danışmanlık',50,1),(bid,'Çift Görüşmesi','Çiftlere yönelik danışmanlık',60,2),(bid,'Online Görüşme','Güvenli çevrim içi görüşme',50,3);
 end if;
 return bid;
end $$;
grant execute on function public.create_business_v2(text,text,text,text) to authenticated;
