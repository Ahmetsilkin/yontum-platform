'use client';
import{useState}from'react';
import{MAX_ORDER_LINKS,normalizeOrderLinks,type OrderLink}from'@/lib/orderLinks';

/* İşletme panelinde "Siteyi düzenle" formunun içinde çalışır (restoran işletmeleri). Kullanıcı bir ya da
   daha fazla sipariş sitesi ekler: sitenin adı + bağlantısı. Form gönderilirken liste `order_links` adlı
   gizli alanda JSON olarak gider; doğrulama/temizlik kaydederken saveBusiness'te yapılır. */
export default function OrderLinksEditor({initial}:{initial:OrderLink[]}){
  const[rows,setRows]=useState<OrderLink[]>(()=>{const l=normalizeOrderLinks(initial);return l.length?l:[]});
  const update=(i:number,patch:Partial<OrderLink>)=>setRows(prev=>prev.map((r,idx)=>idx===i?{...r,...patch}:r));
  const remove=(i:number)=>setRows(prev=>prev.filter((_,idx)=>idx!==i));
  const add=()=>setRows(prev=>prev.length>=MAX_ORDER_LINKS?prev:[...prev,{name:'',url:''}]);
  return <div className="field full orderLinksEditor">
    <b>Sipariş linkleri</b>
    {rows.length===0&&<p className="builderHelp" style={{margin:'8px 0'}}>Henüz sipariş linki eklenmedi. Eklemezsen sitede "Sipariş Ver" butonu görünmez.</p>}
    {rows.map((r,i)=><div key={i} className="orderLinkRow" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,2fr) auto',gap:8,alignItems:'end',margin:'10px 0'}}>
      <label className="field" style={{margin:0}}>Sipariş sitesinin adı<input className="input" value={r.name} maxLength={40} placeholder="Yemeksepeti" onChange={e=>update(i,{name:e.target.value})}/></label>
      <label className="field" style={{margin:0}}>Sipariş linki<input className="input" type="text" inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={r.url} placeholder="https://www.yemeksepeti.com/..." onChange={e=>update(i,{url:e.target.value})}/></label>
      <button type="button" onClick={()=>remove(i)} aria-label={`${r.name||'Sipariş'} linkini sil`}>Sil</button>
    </div>)}
    {rows.length<MAX_ORDER_LINKS&&<button type="button" onClick={add}>＋ Sipariş linki ekle</button>}
    <input type="hidden" name="order_links" value={JSON.stringify(rows)}/>
    <small style={{display:'block',marginTop:8,opacity:.75}}>Birden fazla link eklersen, müşteri sitedeki "Sipariş Ver" butonuna basınca hangi siteden sipariş vereceğini seçer. Tek link varsa buton doğrudan o siteyi açar. Adı boş bırakırsan link adresinden otomatik yazılır.</small>
  </div>;
}
