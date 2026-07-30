-- Yontum V4: çoklu sektör, sektörel hazır temalar ve varsayılan içerikler
alter table public.businesses
  add column if not exists business_type text not null default 'barber';

do $$ begin
 alter table public.businesses add constraint businesses_type_check
 check(business_type in ('barber','hair_salon','beauty','nail_lash','spa_massage','other'));
exception when duplicate_object then null; end $$;

-- Yeni dört parametreli işletme kurulum fonksiyonu.
create or replace function public.create_business(p_name text,p_slug text,p_phone text,p_business_type text) returns uuid
language plpgsql security definer set search_path=public as $$
declare bid uuid; clean_slug text; bt text; color text; bg text; txt text; selected_theme text; selected_font text; hero text; highlight text; label text;
begin
 if auth.uid() is null then raise exception 'Giriş gerekli'; end if;
 if exists(select 1 from business_members where user_id=auth.uid()) then raise exception 'Bu hesapta zaten işletme var'; end if;
 clean_slug:=lower(trim(p_slug)); bt:=coalesce(nullif(p_business_type,''),'other');
 if bt not in ('barber','hair_salon','beauty','nail_lash','spa_massage','other') then bt:='other'; end if;
 if clean_slug!~'^[a-z0-9][a-z0-9-]{2,39}$' then raise exception 'Geçersiz site adresi'; end if;
 if exists(select 1 from businesses where slug=clean_slug) then raise exception 'Bu site adresi daha önce alınmış'; end if;

 color:=case bt when 'barber' then '#111111' when 'hair_salon' then '#7c3157' when 'beauty' then '#a46b78' when 'nail_lash' then '#9b4d88' when 'spa_massage' then '#43685d' else '#222222' end;
 bg:=case bt when 'barber' then '#f5f5f1' when 'hair_salon' then '#fbf4f7' when 'beauty' then '#faf2f0' when 'nail_lash' then '#fff5fc' when 'spa_massage' then '#f0f5f1' else '#f7f7f4' end;
 txt:=case bt when 'spa_massage' then '#17352c' when 'beauty' then '#352226' else '#111111' end;
 selected_theme:=case when bt in ('beauty','hair_salon') then 'classic' when bt='spa_massage' then 'minimal' else 'modern' end;
 selected_font:=case when bt in ('beauty','hair_salon') then 'serif' when bt='spa_massage' then 'sans' else 'display' end;
 hero:=case bt when 'barber' then 'Tarzını' when 'hair_salon' then 'Işığını' when 'beauty' then 'Güzelliğini' when 'nail_lash' then 'Tarzını' when 'spa_massage' then 'Kendine' else 'Kendini' end;
 highlight:=case bt when 'barber' then 'yeniden keşfet' when 'hair_salon' then 'yansıt' when 'beauty' then 'ortaya çıkar' when 'nail_lash' then 'detaylarda göster' when 'spa_massage' then 'iyi bak' else 'özel hisset' end;
 label:=case bt when 'barber' then 'ERKEK BAKIM' when 'hair_salon' then 'SAÇ · RENK · BAKIM' when 'beauty' then 'GÜZELLİK · BAKIM' when 'nail_lash' then 'NAIL · LASH · BROW' when 'spa_massage' then 'SPA · MASAJ · WELLNESS' else 'PROFESYONEL BAKIM' end;

 insert into businesses(name,slug,phone,email,business_type,primary_color,background_color,text_color,theme,font_family,hero_title,hero_highlight,hero_label,visual_label)
 values(trim(p_name),clean_slug,trim(p_phone),(select email from auth.users where id=auth.uid()),bt,color,bg,txt,selected_theme,selected_font,hero,highlight,label,label)
 returning id into bid;
 insert into business_members(business_id,user_id,role) values(bid,auth.uid(),'owner');
 insert into subscriptions(business_id) values(bid);
 insert into working_hours(business_id,day_of_week,is_open,start_time,end_time) select bid,d,d between 1 and 6,'09:00','20:00' from generate_series(0,6)d;

 if bt='barber' then
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Saç Kesimi','Profesyonel saç kesimi',30,null,1),(bid,'Sakal Tıraşı','Sakal şekillendirme ve bakım',20,null,2),(bid,'Saç + Sakal','Eksiksiz bakım paketi',50,null,3);
 elsif bt='hair_salon' then
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Saç Kesimi','Kişiye özel kesim ve şekillendirme',45,null,1),(bid,'Saç Boyama','Profesyonel renklendirme',120,null,2),(bid,'Fön ve Şekillendirme','Günlük veya özel gün şekillendirme',45,null,3);
 elsif bt='beauty' then
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Cilt Bakımı','Cilt tipine özel profesyonel bakım',60,null,1),(bid,'Kaş Tasarımı','Yüz hatlarına uygun kaş tasarımı',30,null,2),(bid,'Kirpik Lifting','Doğal kirpiklere kıvrım ve görünüm',60,null,3);
 elsif bt='nail_lash' then
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Kalıcı Oje','Uzun süre kalıcı renk uygulaması',60,null,1),(bid,'Protez Tırnak','Kişiye özel protez tırnak uygulaması',120,null,2),(bid,'Manikür','El ve tırnak bakımı',45,null,3);
 elsif bt='spa_massage' then
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Klasik Masaj','Rahatlatıcı klasik masaj',60,null,1),(bid,'Aromaterapi Masajı','Aromatik yağlarla rahatlama',75,null,2),(bid,'Sırt ve Boyun Masajı','Bölgesel rahatlatıcı uygulama',30,null,3);
 else
  insert into services(business_id,name,description,duration_minutes,price,sort_order) values (bid,'Standart Hizmet','Profesyonel hizmet',60,null,1);
 end if;
 return bid;
exception when unique_violation then raise exception 'Bu site adresi daha önce alınmış';
end $$;
grant execute on function public.create_business(text,text,text,text) to authenticated;

-- Eski istemciler için geriye uyumlu üç parametreli fonksiyon.
create or replace function public.create_business(p_name text,p_slug text,p_phone text) returns uuid
language sql security definer set search_path=public as $$
 select public.create_business(p_name,p_slug,p_phone,'barber');
$$;
