import{redirect}from'next/navigation';import{createClient}from'@/lib/supabase-server';import CalendarBoard from'@/components/calendar/CalendarBoard';
export const dynamic='force-dynamic';
export default async function TakvimPage(){
  const db=await createClient(),{data:{user}}=await db.auth.getUser();
  if(!user)redirect('/giris');
  const{data:member}=await db.from('business_members').select('business_id').eq('user_id',user.id).limit(1).maybeSingle();
  if(!member)redirect('/panel');
  return <div className="dashboardShell calBoardShell"><a className="calBoardBack" href="/panel?tab=appointments">← Panele Dön</a><CalendarBoard businessId={member.business_id}/></div>;
}
