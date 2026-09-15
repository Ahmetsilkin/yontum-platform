import{cookies}from'next/headers';import'@/app/admin-modern.css';import{ADMIN_COOKIE_NAME,isValidAdminSession}from'@/lib/admin-gate';import AdminBusinessManager from'@/components/AdminBusinessManager';import AdminGateForm from'@/components/AdminGateForm';
export const dynamic='force-dynamic';
export default async function Yonetim(){
  const store=await cookies();
  const token=store.get(ADMIN_COOKIE_NAME)?.value;
  if(!isValidAdminSession(token))return <AdminGateForm/>;
  return <AdminBusinessManager/>;
}
