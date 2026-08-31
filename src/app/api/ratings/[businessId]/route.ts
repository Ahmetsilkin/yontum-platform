import{NextRequest,NextResponse}from'next/server';
import{createServiceClient}from'@/lib/supabase-server';

export async function GET(_:NextRequest,{params}:{params:Promise<{businessId:string}>}){
  // Not: "ratings_enabled" sadece randevu sonrası otomatik puanlama isteği
  // gönderilip gönderilmeyeceğini kontrol eder (bkz. dashboard'daki
  // "Randevu sonrası otomatik puanlama isteği gönder" seçeneği).
  // Sitede yorumların gösterilip gösterilmemesi bundan bağımsız olmalı —
  // işletme sahibi manuel yorum eklediğinde otomatik istek kapalı olsa
  // bile o yorumlar sitede görünmeli.
  const{businessId}=await params,db=createServiceClient();
  const[{data:summary},{data:reviews}]=await Promise.all([
    db.from('business_rating_summary').select('average_stars,rating_count').eq('business_id',businessId).maybeSingle(),
    db.from('appointment_ratings').select('stars,comment,customer_name,avatar_url,created_at').eq('business_id',businessId).not('comment','is',null).order('created_at',{ascending:false}).limit(6),
  ]);
  if(!summary||!summary.rating_count)return NextResponse.json({enabled:false});
  return NextResponse.json({enabled:true,average:summary.average_stars,count:summary.rating_count,reviews:reviews||[]});
}
