import{NextResponse}from'next/server';import{cookies}from'next/headers';import{ADMIN_COOKIE_NAME,isValidAdminSession}from'@/lib/admin-gate';
/* /api/admin/* uçları için ortak yetki kontrolü: yetkisizse 403 yanıtı döner, yetkiliyse null. */
export async function adminDenied():Promise<NextResponse|null>{
  const store=await cookies();
  return isValidAdminSession(store.get(ADMIN_COOKIE_NAME)?.value)?null:NextResponse.json({error:'Yetkiniz yok.'},{status:403});
}
