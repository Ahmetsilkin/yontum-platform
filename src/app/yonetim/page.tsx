import{redirect}from'next/navigation';import{createClient}from'@/lib/supabase-server';import'@/app/admin-modern.css';import AdminBusinessManager from'@/components/AdminBusinessManager';
export const dynamic='force-dynamic';
export default async function Yonetim(){
  const db=await createClient();
  const{data:{user}}=await db.auth.getUser();
  if(!user)redirect('/giris');
  const{data:admin}=await db.from('platform_admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(!admin)redirect('/panel');
  return <AdminBusinessManager/>;
}
