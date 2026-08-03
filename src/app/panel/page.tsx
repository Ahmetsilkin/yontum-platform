import{redirect}from'next/navigation';import{createClient}from'@/lib/supabase-server';import BusinessDashboard from'@/components/BusinessDashboard';
export const dynamic='force-dynamic';export default async function Panel(){const db=await createClient(),{data:{user}}=await db.auth.getUser();if(!user)redirect('/giris');return <BusinessDashboard userEmail={user.email||''}/>}
