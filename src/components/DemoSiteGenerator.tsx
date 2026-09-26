'use client';
import{useEffect,useMemo,useState}from'react';
import{DEMO_AREAS,DEMO_TYPES,DEMO_TYPE_LABELS}from'@/lib/demo-leads';

type Lead={id:string;source:string;name:string;business_type:string;phone:string|null;address:string|null;has_website:boolean;area:string|null;status:'new'|'generated'|'skipped';business_id:string|null;business:{id:string;slug:string;is_demo:boolean;is_published:boolean;deleted_at:string|null}|null};
const STATUS_LABEL:Record<string,string>={new:'Yeni',generated:'Üretildi',skipped:'Atlandı'};
function pwd(){const c='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';let p='';for(let i=0;i<10;i++)p+=c[Math.floor(Math.random()*c.length)];return p}

export default function DemoSiteGenerator(){
  const[leads,setLeads]=useState<Lead[]>([]);
  const[loading,setLoading]=useState(true);
  const[msg,setMsg]=useState('');
  const[err,setErr]=useState('');
  const[scanning,setScanning]=useState(false);
  const[radius,setRadius]=useState(DEMO_AREAS[0].radius);
  const[manual,setManual]=useState('');
  const[filter,setFilter]=useState<'new'|'generated'|'skipped'|'all'>('new');
  const[typeFilter,setTypeFilter]=useState('all');
  const[hideWebsite,setHideWebsite]=useState(true);
  const[query,setQuery]=useState('');
  const[sel,setSel]=useState<Set<string>>(new Set());
  const[busy,setBusy]=useState('');
  const[claim,setClaim]=useState<Lead|null>(null);
  const[claimPhone,setClaimPhone]=useState('');
  const[claimPass,setClaimPass]=useState(pwd());
  const[claimSlug,setClaimSlug]=useState('');
  const[claimDone,setClaimDone]=useState<{siteUrl:string;loginUrl:string;phone:string;password:string}|null>(null);

  async function load(){
    setLoading(true);
    const r=await fetch('/api/admin/demo/leads');const j=await r.json();
    setLeads(r.ok?j.leads||[]:[]);if(!r.ok)setErr(j.error||'Liste alınamadı.');
    setLoading(false);
  }
  useEffect(()=>{load()},[]);

  const shown=useMemo(()=>leads.filter(l=>(filter==='all'||l.status===filter)&&(typeFilter==='all'||l.business_type===typeFilter)&&(!hideWebsite||!l.has_website||l.status!=='new')&&(!query||l.name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')))),[leads,filter,typeFilter,hideWebsite,query]);
  const selectable=shown.filter(l=>l.status==='new');
  const counts=useMemo(()=>({new:leads.filter(l=>l.status==='new').length,generated:leads.filter(l=>l.status==='generated').length}),[leads]);

  async function scan(){
    setScanning(true);setErr('');setMsg('');
    const a=DEMO_AREAS[0];
    const r=await fetch('/api/admin/demo/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lat:a.lat,lng:a.lng,radius,area:a.label})});
    const j=await r.json();setScanning(false);
    if(!r.ok){setErr(j.error||'Tarama yapılamadı.');return}
    setMsg(`Tarama bitti: haritada ${j.found} kayıt bulundu, ${j.added} yeni işletme eklendi (${j.alreadyKnown} zaten listedeydi, ${j.noName} adsız, ${j.chains} zincir marka, ${j.outOfScope} kapsam dışı).`);
    load();
  }
  async function addManual(){
    setErr('');setMsg('');
    const r=await fetch('/api/admin/demo/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lines:manual})});
    const j=await r.json();
    if(!r.ok){setErr(j.error||'Eklenemedi.');return}
    setMsg(`${j.added} işletme eklendi.${j.bad?.length?` Anlaşılamayan satırlar (${j.bad.length}): ${j.bad.slice(0,3).join(' | ')}`:''}`);
    if(!j.bad?.length)setManual('');
    load();
  }
  async function patch(id:string,p:Record<string,any>){
    setLeads(ls=>ls.map(l=>l.id===id?{...l,...p}:l));
    const r=await fetch('/api/admin/demo/leads',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,patch:p})});
    if(!r.ok){const j=await r.json().catch(()=>({}));setErr(j.error||'Kaydedilemedi.');load()}
  }
  function toggle(id:string){setSel(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n})}
  async function generate(){
    const ids=[...sel].filter(id=>leads.find(l=>l.id===id)?.status==='new');
    if(!ids.length)return;
    setErr('');setMsg('');let ok=0;const fails:string[]=[];
    for(let i=0;i<ids.length;i+=3){
      setBusy(`Üretiliyor… ${Math.min(i+3,ids.length)}/${ids.length}`);
      const r=await fetch('/api/admin/demo/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({leadIds:ids.slice(i,i+3)})});
      const j=await r.json().catch(()=>({}));
      if(!r.ok){fails.push(j.error||'Hata');continue}
      for(const x of j.results||[]){if(x.ok)ok++;else fails.push(x.error||'Hata')}
    }
    setBusy('');setSel(new Set());
    setMsg(`${ok} demo site üretildi.${fails.length?` ${fails.length} tanesi üretilemedi: ${fails[0]}`:''}`);
    setFilter('generated');load();
  }
  async function del(l:Lead){
    if(!l.business||!confirm(`"${l.name}" demo sitesi kalıcı olarak silinsin mi?`))return;
    const r=await fetch(`/api/admin/businesses/${l.business.id}`,{method:'DELETE'});
    if(!r.ok){const j=await r.json().catch(()=>({}));setErr(j.error||'Silinemedi.');return}
    await fetch('/api/admin/demo/leads',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:l.id,patch:{status:'new'}})});
    setMsg('Demo site silindi; işletme tekrar "Yeni" listesinde.');load();
  }
  async function doClaim(e:React.FormEvent){
    e.preventDefault();if(!claim?.business)return;setErr('');
    const r=await fetch('/api/admin/demo/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({businessId:claim.business.id,phone:claimPhone,password:claimPass,...(claimSlug?{slug:claimSlug}:{})})});
    const j=await r.json();
    if(!r.ok){setErr(j.error||'Devredilemedi.');return}
    setClaimDone({siteUrl:j.siteUrl,loginUrl:j.loginUrl,phone:claimPhone,password:claimPass});load();
  }
  const siteUrl=(slug:string)=>`${location.origin}/site/${slug}`;
  async function copy(t:string){try{await navigator.clipboard.writeText(t);setMsg('Link kopyalandı.')}catch{setMsg(t)}}

  return <div className="dashboardShell"><main className="dashboardMain noSide">
    <header className="dashboardTop"><div className="platformLogo"><span>M</span><b>MEGSAK</b></div><div className="adminTopActions"><a className="plainAction" href="/yonetim">← İşletmeler</a></div></header>
    <div className="dashboardContent">
      <section className="panel dashPanel">
        <div className="panelTitle"><div><h2>Demo site üretici</h2><p>Bölgedeki işletmeleri haritadan bul, seçtiklerinden "örnek taslak" site üret, işletmeciye gidip göster. Demo siteler arama motorlarına kapalıdır, en üstte "ÖRNEK TASARIM" etiketi taşır ve randevu/mesaj almaz. İşletmeci kabul ederse <b>Devret</b> ile gerçek hesaba çevrilir, kabul etmezse <b>Sil</b>.</p></div></div>
        {err&&<p className="formError">{err}</p>}{msg&&<p style={{margin:'10px 0',fontWeight:600}}>{msg}</p>}
        <h3 style={{marginTop:18}}>1. Bölgeyi tara</h3>
        <p className="builderHelp">Kaynak: OpenStreetMap (ücretsiz, herkese açık harita). Yalnızca adı, türü, konumu ve varsa telefon/adres/saati alınır. Google bilgileri kaydedilmez.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'end'}}>
          <label className="field" style={{margin:0}}>Bölge<select className="input" disabled><option>{DEMO_AREAS[0].label}</option></select></label>
          <label className="field" style={{margin:0}}>Yarıçap (metre)<input className="input" type="number" min={500} max={6000} step={250} value={radius} onChange={e=>setRadius(Number(e.target.value)||3500)}/></label>
          <button type="button" className="blackBtn" onClick={scan} disabled={scanning}>{scanning?'Taranıyor… (30 sn kadar sürebilir)':'Haritadan tara'}</button>
        </div>
        <h3 style={{marginTop:24}}>2. Elle ekle <small style={{fontWeight:400,opacity:.7}}>(haritada olmayanlar için)</small></h3>
        <p className="builderHelp">Her satıra bir işletme: <code>Ad; Tür; Telefon; Adres</code> — örn. <code>Yıldız Kuaför; kadın kuaförü; 0532 111 22 33; Yeni Bağlıca Mah.</code> Tür: restoran/kafe, berber, kuaför, güzellik, nail, spa, oto yıkama.</p>
        <textarea className="input" rows={4} value={manual} onChange={e=>setManual(e.target.value)} placeholder={'Yıldız Kuaför; kadın kuaförü; 0532 111 22 33; Yeni Bağlıca\nHızlı Oto Yıkama; oto yıkama; ; Bağlıca Bulvarı'}/>
        <div style={{marginTop:8}}><button type="button" className="blackBtn" onClick={addManual} disabled={manual.trim().length<3}>Listeye ekle</button></div>
      </section>

      <section className="panel dashPanel">
        <div className="panelTitle"><div><h2>3. Adaylar</h2><p>{counts.new} yeni · {counts.generated} demo üretildi. Haritada "sitesi var" işaretli olanlar varsayılan olarak gizlenir (büyük olasılıkla sitesi vardır).</p></div></div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,margin:'8px 0 14px'}}>
          {(['new','generated','skipped','all'] as const).map(f=><button type="button" key={f} className={filter===f?'blackBtn':'plainAction'} onClick={()=>{setFilter(f);setSel(new Set())}}>{f==='all'?'Hepsi':STATUS_LABEL[f]}</button>)}
          <select className="input" style={{width:'auto'}} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="all">Tüm türler</option>{DEMO_TYPES.map(t=><option key={t} value={t}>{DEMO_TYPE_LABELS[t]}</option>)}</select>
          <input className="input" style={{width:200}} placeholder="Ada göre ara" value={query} onChange={e=>setQuery(e.target.value)}/>
          <label style={{display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={hideWebsite} onChange={e=>setHideWebsite(e.target.checked)}/> "Sitesi var" olanları gizle</label>
        </div>
        {filter==='new'&&<div style={{display:'flex',flexWrap:'wrap',gap:10,alignItems:'center',marginBottom:12}}>
          <button type="button" className="plainAction" onClick={()=>setSel(new Set(selectable.map(l=>l.id)))}>Görünenlerin hepsini seç ({selectable.length})</button>
          <button type="button" className="plainAction" onClick={()=>setSel(new Set())}>Seçimi temizle</button>
          <button type="button" className="blackBtn" disabled={!sel.size||!!busy} onClick={generate}>{busy||`Seçilenlerden demo üret (${sel.size})`}</button>
        </div>}
        {loading?<p>Yükleniyor…</p>:!shown.length?<p>Bu filtrede aday yok. Önce "Haritadan tara" ya da "Elle ekle" ile aday getir.</p>:
        <div style={{display:'grid',gap:10}}>
          {shown.map(l=><div key={l.id} style={{display:'grid',gridTemplateColumns:l.status==='new'?'auto 1fr':'1fr',gap:12,padding:12,border:'1px solid rgba(128,128,128,.35)',borderRadius:8,alignItems:'start'}}>
            {l.status==='new'&&<input type="checkbox" checked={sel.has(l.id)} onChange={()=>toggle(l.id)} aria-label={`${l.name} seç`} style={{marginTop:8}}/>}
            <div style={{display:'grid',gap:8,minWidth:0}}>
              {l.status==='new'?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:8}}>
                <input className="input" defaultValue={l.name} onBlur={e=>e.target.value.trim()&&e.target.value!==l.name&&patch(l.id,{name:e.target.value.trim()})} aria-label="Ad"/>
                <select className="input" value={l.business_type} onChange={e=>patch(l.id,{business_type:e.target.value})} aria-label="Tür">{DEMO_TYPES.map(t=><option key={t} value={t}>{DEMO_TYPE_LABELS[t]}</option>)}</select>
                <input className="input" defaultValue={l.phone||''} placeholder="Telefon" onBlur={e=>e.target.value!==(l.phone||'')&&patch(l.id,{phone:e.target.value})} aria-label="Telefon"/>
                <input className="input" defaultValue={l.address||''} placeholder="Adres" onBlur={e=>e.target.value!==(l.address||'')&&patch(l.id,{address:e.target.value})} aria-label="Adres"/>
              </div>:<div><b>{l.name}</b> <small style={{opacity:.7}}>· {DEMO_TYPE_LABELS[l.business_type]||l.business_type}{l.phone?` · ${l.phone}`:''}{l.address?` · ${l.address}`:''}</small></div>}
              <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',fontSize:13}}>
                <span style={{opacity:.7}}>{l.source==='osm'?'Harita':'Elle'}{l.area?` · ${l.area}`:''}</span>
                {l.has_website&&<span style={{padding:'2px 8px',background:'rgba(255,180,0,.25)'}}>haritada web sitesi görünüyor</span>}
                {l.status!=='new'&&<span style={{padding:'2px 8px',background:'rgba(128,128,128,.2)'}}>{STATUS_LABEL[l.status]}</span>}
                {l.status==='new'&&<button type="button" className="plainAction" onClick={()=>patch(l.id,{status:'skipped'})}>Atla</button>}
                {l.status==='skipped'&&<button type="button" className="plainAction" onClick={()=>patch(l.id,{status:'new'})}>Geri al</button>}
                {l.status==='generated'&&l.business&&<>
                  <a className="plainAction" href={siteUrl(l.business.slug)} target="_blank" rel="noopener noreferrer">Siteyi aç ↗</a>
                  <button type="button" className="plainAction" onClick={()=>copy(siteUrl(l.business!.slug))}>Linki kopyala</button>
                  {l.business.is_demo?<button type="button" className="plainAction" onClick={()=>{setClaim(l);setClaimPhone(l.phone||'');setClaimPass(pwd());setClaimSlug('');setClaimDone(null);setErr('')}}>Devret</button>:<span style={{color:'#1a7f37',fontWeight:600}}>✓ Devredildi</span>}
                  <button type="button" className="plainAction" onClick={()=>del(l)}>Sil</button>
                </>}
                {l.status==='generated'&&!l.business&&<><span style={{opacity:.7}}>site silinmiş</span><button type="button" className="plainAction" onClick={()=>patch(l.id,{status:'new'})}>Yeniden aday yap</button></>}
              </div>
            </div>
          </div>)}
        </div>}
      </section>

      {claim&&<div className="modalBackdrop" role="dialog" aria-modal="true" onClick={()=>setClaim(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'grid',placeItems:'center',padding:20,zIndex:80}}>
        <form className="panel" onClick={e=>e.stopPropagation()} onSubmit={doClaim} style={{width:'min(100%,460px)',padding:24,background:'var(--bg-card,#fff)'}}>
          <h2 style={{marginTop:0}}>Demoyu işletmeye devret</h2>
          {claimDone?<>
            <p><b>{claim.name}</b> artık gerçek işletme. Giriş bilgilerini işletmeciye ilet:</p>
            <p>Telefon: <b>{claimDone.phone}</b><br/>Şifre: <b>{claimDone.password}</b><br/>Giriş: <a href={claimDone.loginUrl} target="_blank" rel="noopener noreferrer">{claimDone.loginUrl}</a><br/>Site: <a href={claimDone.siteUrl} target="_blank" rel="noopener noreferrer">{claimDone.siteUrl}</a></p>
            <button type="button" className="blackBtn" onClick={()=>setClaim(null)}>Kapat</button>
          </>:<>
            <p className="builderHelp">Gerçek telefon numarası giriş kullanıcı adı olur. "Örnek tasarım" etiketi kalkar, randevu ve mesaj alınmaya başlar.</p>
            {err&&<p className="formError">{err}</p>}
            <label className="field">Telefon (giriş için)<input className="input" value={claimPhone} onChange={e=>setClaimPhone(e.target.value)} required/></label>
            <label className="field">Şifre<input className="input" value={claimPass} onChange={e=>setClaimPass(e.target.value)} minLength={8} required/></label>
            <label className="field">Site adresi <small>(isteğe bağlı, boşsa mevcut kalır)</small><input className="input" value={claimSlug} onChange={e=>setClaimSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))} placeholder="yildizkuafor"/></label>
            <div style={{display:'flex',gap:10}}><button type="submit" className="blackBtn">Devret</button><button type="button" className="plainAction" onClick={()=>setClaim(null)}>Vazgeç</button></div>
          </>}
        </form>
      </div>}
    </div>
  </main></div>;
}
