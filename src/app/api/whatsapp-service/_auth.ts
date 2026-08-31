import{NextRequest}from'next/server';
// Yerel WhatsApp mikroservisinin bu rotalara erişebilmesi için paylaşılan gizli anahtar.
// Bu, bir işletme sahibinin oturumu değil — sadece senin lokal servisinin kimliğidir.
export function authorizedService(req:NextRequest):boolean{
  const secret=process.env.WHATSAPP_SERVICE_SECRET;
  if(!secret)return false;
  const got=req.headers.get('x-service-secret');
  return got===secret;
}
