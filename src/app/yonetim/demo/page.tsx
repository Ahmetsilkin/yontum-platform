import{cookies}from'next/headers';import'@/app/admin-modern.css';import{ADMIN_COOKIE_NAME,isValidAdminSession}from'@/lib/admin-gate';import DemoSiteGenerator from'@/components/DemoSiteGenerator';import AdminGateForm from'@/components/AdminGateForm';
export const dynamic='force-dynamic';
export const metadata={title:'Demo Site Üretici',robots:{index:false,follow:false}};
export default async function YonetimDemo(){
  const store=await cookies();
  if(!isValidAdminSession(store.get(ADMIN_COOKIE_NAME)?.value))return <AdminGateForm/>;
  return <DemoSiteGenerator/>;
}
