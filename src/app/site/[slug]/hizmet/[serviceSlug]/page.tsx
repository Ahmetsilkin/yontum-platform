import{notFound}from'next/navigation';import{createClient}from'@/lib/supabase-server';import{ServiceDetailSite}from'@/components/themes/RadicalTenantSite';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string;serviceSlug:string}>}){
  const{slug,serviceSlug}=await params,db=await createClient();
  const{data:b}=await db.from('businesses').select('id,name').eq('slug',slug).single();
  if(!b)return{title:'Yontum'};
  const{data:s}=await db.from('services').select('name,description,image_url').eq('business_id',b.id).eq('slug',serviceSlug).single();
  if(!s)return{title:b.name};
  const title=`${s.name} — ${b.name}`,description=s.description||`${s.name} hizmeti hakkında detaylı bilgi.`;
  return{title,description,openGraph:{title,description,images:s.image_url?[s.image_url]:undefined}};
}
export default async function ServiceDetailPage({params}:{params:Promise<{slug:string;serviceSlug:string}>}){
  const{slug,serviceSlug}=await params,db=await createClient();
  const{data:b}=await db.from('businesses').select('*').eq('slug',slug).single();
  if(!b||!b.is_published)notFound();
  const{data:service}=await db.from('services').select('*').eq('business_id',b.id).eq('slug',serviceSlug).eq('is_active',true).single();
  if(!service)notFound();
  const hasDetail=!!(service.detail_intro||service.detail_how||service.detail_benefits||service.detail_suitable||service.detail_tip_title||service.detail_before||service.detail_after);
  if(!hasDetail)notFound();
  const[{data:gallery},{data:media},{data:services},{data:hours}]=await Promise.all([
    db.from('gallery_images').select('*').eq('business_id',b.id).order('sort_order'),
    db.from('media_items').select('*').eq('business_id',b.id).eq('is_published',true).order('sort_order'),
    db.from('services').select('*').eq('business_id',b.id).eq('is_active',true).order('sort_order'),
    db.from('working_hours').select('*').eq('business_id',b.id).order('day_of_week'),
  ]);
  return <ServiceDetailSite b={b} service={service} gallery={gallery||[]} media={media||[]} services={services||[]} hours={hours||[]}/>;
}
