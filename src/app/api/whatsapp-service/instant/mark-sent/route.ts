import{NextRequest,NextResponse}from'next/server';
import{createServiceClient}from'@/lib/supabase-server';
import{authorizedService}from'../../_auth';
import{z}from'zod';
const schema=z.object({id:z.string().uuid(),ok:z.boolean(),error:z.string().optional()});
export async function POST(req:NextRequest){
  if(!authorizedService(req))return NextResponse.json({error:'Yetkisiz.'},{status:401});
  const x=schema.parse(await req.json());
  const db=createServiceClient();
  const{error}=await db.from('whatsapp_instant_queue').update({status:x.ok?'sent':'failed',sent_at:new Date().toISOString(),error:x.ok?null:(x.error||null)}).eq('id',x.id);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
