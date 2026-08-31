import{NextRequest,NextResponse}from'next/server';
import{createServiceClient}from'@/lib/supabase-server';
import{authorizedService}from'../_auth';
import{z}from'zod';
const schema=z.object({appointmentId:z.string().uuid(),type:z.enum(['confirmation','reminder','review'])});
const columnByType:Record<string,string>={confirmation:'confirmation_sent_at',reminder:'reminder_sent_at',review:'rating_request_sent_at'};
// Mesaj gerçekten WhatsApp'tan gönderildikten SONRA çağrılır — böylece bir
// sonraki kontrolde aynı mesaj tekrar gönderilmez.
export async function POST(req:NextRequest){
  if(!authorizedService(req))return NextResponse.json({error:'Yetkisiz.'},{status:401});
  const x=schema.parse(await req.json());
  const db=createServiceClient();
  const{error}=await db.from('appointments').update({[columnByType[x.type]]:new Date().toISOString()}).eq('id',x.appointmentId);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
