'use client';import{useEffect,useState}from'react';
export default function OwnRatings({businessId}:{businessId:string}){
  const[data,setData]=useState<any>(null);
  useEffect(()=>{fetch(`/api/ratings/${businessId}`).then(r=>r.json()).then(setData).catch(()=>{})},[businessId]);
  if(!data?.enabled)return null;
  const full=Math.round(data.average);
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
              <div className="ownReviewStars">{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</div>
              <p>{r.comment}</p>
              <small>{r.customer_name||'Müşterimiz'}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
