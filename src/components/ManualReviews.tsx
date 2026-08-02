'use client';
import{useEffect,useState}from'react';

export default function ManualReviews({businessId}:{businessId:string}){
  const[list,setList]=useState<any[]|null>(null);
  const[name,setName]=useState('');
  const[stars,setStars]=useState(5);
  const[comment,setComment]=useState('');
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState('');

  function load(){
    fetch(`/api/admin/manual-review?businessId=${businessId}`).then(r=>r.json()).then(j=>setList(j.ratings||[]));
  }
  useEffect(()=>{load()},[businessId]);

  async function add(){
    if(!name.trim()||!comment.trim())return;
    setBusy(true);setError('');
    const r=await fetch('/api/admin/manual-review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({businessId,customerName:name,stars,comment})});
    const j=await r.json();
    setBusy(false);
    if(!r.ok){setError(j.error);return}
    setName('');setComment('');setStars(5);
    load();
  }

  async function remove(id:string){
    if(!confirm('Bu yorumu silmek istediğinize emin misiniz?'))return;
    await fetch(`/api/admin/manual-review?id=${id}&businessId=${businessId}`,{method:'DELETE'});
    load();
  }

  return (
    <div className="builderBlock manualReviews">
      <div className="galleryHeader"><div><h3>Müşteri yorumları</h3></div></div>

      <div className="manualReviewForm">
        <div className="twoCol">
          <label className="field">Müşteri adı<input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Örn. Ahmet Y."/></label>
          <label className="field">Puan
            <select className="input" value={stars} onChange={e=>setStars(Number(e.target.value))}>
              {[5,4,3,2,1].map(n=><option key={n} value={n}>{n} yıldız</option>)}
            </select>
          </label>
        </div>
        <label className="field full">Yorum metni<textarea className="input" rows={2} value={comment} onChange={e=>setComment(e.target.value.slice(0,600))} placeholder="Müşterinin yorumunu buraya yapıştırın"/></label>
        {error&&<p className="ratingError">{error}</p>}
        <button type="button" className="blackBtn" disabled={busy||!name.trim()||!comment.trim()} onClick={add}>{busy?'Ekleniyor…':'＋ Yorum Ekle'}</button>
      </div>

      <div className="manualReviewList">
        {list===null&&<p className="durationHint">Yükleniyor…</p>}
        {list?.length===0&&<p className="durationHint">Henüz yorum eklenmedi.</p>}
        {list?.map(r=>(
          <div key={r.id} className="manualReviewItem">
            <div>
              <b>{r.customer_name||'Müşteri'}</b>
              <span className="manualReviewStars">{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</span>
              {r.is_manual&&<small className="manualBadge">elle eklendi</small>}
              <p>{r.comment}</p>
            </div>
            <button type="button" className="danger plainAction" onClick={()=>remove(r.id)}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}
