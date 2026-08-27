'use client';import{useEffect,useState}from'react';
export default function OwnRatings({businessId,variant='grid'}:{businessId:string;variant?:'grid'|'quote'}){
  const[data,setData]=useState<any>(null);
  const[idx,setIdx]=useState(0);
  useEffect(()=>{fetch(`/api/ratings/${businessId}`).then(r=>r.json()).then(setData).catch(()=>{})},[businessId]);
  if(!data?.enabled)return null;
  const full=Math.round(data.average);
  if(variant==='quote'){
    if(!data.reviews.length)return null;
    const r=data.reviews[idx]||data.reviews[0];
    return (
      <div className="ownQuote">
        <span className="ownQuoteMark">”</span>
        <p>{r.comment}</p>
        <div className="ownQuoteFoot">
          <b>{r.customer_name||'Müşterimiz'}</b>
          {data.reviews.length>1&&<div className="ownQuoteNav">
            <button type="button" aria-label="Önceki" onClick={()=>setIdx(i=>(i-1+data.reviews.length)%data.reviews.length)}>←</button>
            <button type="button" aria-label="Sonraki" onClick={()=>setIdx(i=>(i+1)%data.reviews.length)}>→</button>
          </div>}
        </div>
      </div>
    );
  }
  return (
    <section className="ownReviews">
      <header>
        <div>
          <small>MÜŞTERİ DEĞERLENDİRMELERİ</small>
          <h2>{data.average} <span>{'★'.repeat(full)}{'☆'.repeat(5-full)}</span></h2>
          <p>{data.count} değerlendirme</p>
        </div>
      </header>
      {data.reviews.length>0&&(
        <div className="ownReviewGrid">
          {data.reviews.map((r:any,i:number)=>(
            <article key={i}>
              <div className="ownReviewHead">
                {r.avatar_url?<img className="ownReviewAvatar" src={r.avatar_url} alt=""/>:<span className="ownReviewAvatarFallback">{(r.customer_name||'M')[0]}</span>}
                <div><b>{r.customer_name||'Müşterimiz'}</b><div className="ownReviewStars">{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</div></div>
              </div>
              <p>{r.comment}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
