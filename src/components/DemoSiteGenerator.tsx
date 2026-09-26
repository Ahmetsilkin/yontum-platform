'use client';
import{useEffect,useMemo,useState}from'react';
import{DEMO_AREAS,DEMO_DEFAULT_THEME,DEMO_TYPES,DEMO_TYPE_LABELS,hoursToOsm,osmToHoursRange}from'@/lib/demo-leads';
import{demoThumb,getImageSet,guessImageSet,imageSetsFor}from'@/lib/demo-images';

type Biz={id:string;slug:string;is_demo:boolean;is_published:boolean;deleted_at:string|null};
type Lead={id:string;source:string;name:string;business_type:string;theme_id:string|null;image_set:string|null;phone:string|null;address:string|null;instagram:string|null;opening_hours:string|null;has_website:boolean;area:string|null;status:'new'|'generated'|'skipped';business_id:string|null;business:Biz|null};
type Theme={id:string;business_type:string;name:string};
/* Form alanlarının ortak biçimi (yeni ekleme, aday düzenleme ve üretilmiş demo düzenleme aynı bileşeni kullanır) */
type Fields={name:string;business_type:string;theme_id:string;image_set:string;phone:string;address:string;instagram:string;hours_start:string;hours_end:string};
const STATUS_LABEL:Record<string,string>={new:'Yeni',generated:'Üretildi',skipped:'Atlandı'};
function pwd(){const c='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';let p='';for(let i=0;i<10;i++)p+=c[Math.floor(Math.random()*c.length)];return p}
const themeLabel=(t:Theme)=>t.name.split('—').pop()?.trim()||t.name;
function fieldsOf(l:Lead):Fields{
  const r=osmToHoursRange(l.opening_hours);
  return{name:l.name,business_type:l.business_type,theme_id:l.theme_id||DEMO_DEFAULT_THEME[l.business_type]||'',image_set:l.image_set||guessImageSet(l.business_type,l.name),phone:l.phone||'',address:l.address||'',instagram:l.instagram||'',hours_start:r?.start||'',hours_end:r?.end||''};
}
const EMPTY=(type='restaurant'):Fields=>({name:'',business_type:type,theme_id:DEMO_DEFAULT_THEME[type]||'',image_set:guessImageSet(type,''),phone:'',address:'',instagram:'',hours_start:'',hours_end:''});

/* Yazı kutusu: draft modunda her tuşta, live modunda kutudan çıkınca değeri bildirir */
function Txt({label,value,onValue,live,...rest}:{label:string;value:string;onValue:(v:string)=>void;live?:boolean}&Omit<React.InputHTMLAttributes<HTMLInputElement>,'value'|'onChange'>){
  const[v,setV]=useState(value);
  useEffect(()=>setV(value),[value]);
  return <label className="field" style={{margin:0}}>{label}
    <input className="input" {...rest} value={v} onChange={e=>{setV(e.target.value);if(!live)onValue(e.target.value)}} onBlur={()=>{if(live&&v!==value)onValue(v)}}/>
  </label>;
}

function ImagePreview({type,setId}:{type:string;setId:string}){
  const s=getImageSet(setId,type);
  return <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:3,marginTop:6}} aria-label="Seçili görsel setinin önizlemesi">
    {[s.cover,...s.gallery].map((u,i)=><img key={u} src={demoThumb(u)} alt="" loading="lazy" style={{width:'100%',height:38,objectFit:'cover',borderRadius:3,outline:i===0?'2px solid var(--brand,#3b82f6)':'none',outlineOffset:-1}}/>)}
  </div>;
}

function LeadFields({v,onChange,themes,live,lockType}:{v:Fields;onChange:(p:Partial<Fields>)=>void;themes:Theme[];live?:boolean;lockType?:boolean}){
  const typeThemes=themes.filter(t=>t.business_type===v.business_type);
  const sets=imageSetsFor(v.business_type);
  const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:10,alignItems:'start'} as const;
  return <div style={{display:'grid',gap:10}}>
    <div style={grid}>
      <Txt label="İşletme adı *" value={v.name} live={live} onValue={x=>onChange({name:x})} maxLength={80} placeholder="Yıldız Kuaför"/>
      <label className="field" style={{margin:0}}>Kategori *
        <select className="input" value={v.business_type} disabled={lockType} onChange={e=>{const t=e.target.value;onChange({business_type:t,theme_id:DEMO_DEFAULT_THEME[t]||'',image_set:guessImageSet(t,v.name)})}}>
          {DEMO_TYPES.map(t=><option key={t} value={t}>{DEMO_TYPE_LABELS[t]}</option>)}
        </select>
      </label>
      <label className="field" style={{margin:0}}>Tema
        <select className="input" value={v.theme_id} onChange={e=>onChange({theme_id:e.target.value})}>
          {typeThemes.length===0&&<option value={v.theme_id}>{v.theme_id||'Varsayılan'}</option>}
          {typeThemes.map(t=><option key={t.id} value={t.id}>{themeLabel(t)}{t.id===DEMO_DEFAULT_THEME[v.business_type]?' (önerilen)':''}</option>)}
        </select>
      </label>
      <label className="field" style={{margin:0}}>Görsel seti
        <select className="input" value={getImageSet(v.image_set,v.business_type).id} onChange={e=>onChange({image_set:e.target.value})}>
          {sets.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <ImagePreview type={v.business_type} setId={v.image_set}/>
      </label>
    </div>
    <div style={grid}>
      <Txt label="Telefon" value={v.phone} live={live} onValue={x=>onChange({phone:x})} inputMode="tel" placeholder="0532 111 22 33"/>
      <Txt label="Adres" value={v.address} live={live} onValue={x=>onChange({address:x})} maxLength={200} placeholder="Yeni Bağlıca Mah. …"/>
      <Txt label="Instagram" value={v.instagram} live={live} onValue={x=>onChange({instagram:x})} placeholder="@kullaniciadi"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <label className="field" style={{margin:0}}>Açılış<input className="input" type="time" value={v.hours_start} onChange={e=>onChange({hours_start:e.target.value})}/></label>
        <label className="field" style={{margin:0}}>Kapanış<input className="input" type="time" value={v.hours_end} onChange={e=>onChange({hours_end:e.target.value})}/></label>
      </div>
    </div>
  </div>;
}

export default function DemoSiteGenerator(){
  const[leads,setLeads]=useState<Lead[]>([]);
  const[themes,setThemes]=useState<Theme[]>([]);
  const[loading,setLoading]=useState(true);
  const[msg,setMsg]=useState('');
  const[err,setErr]=useState('');
  const[scanning,setScanning]=useState(false);
  const[radius,setRadius]=useState(DEMO_AREAS[0].radius);
  const[draft,setDraft]=useState<Fields>(EMPTY());
  const[adding,setAdding]=useState(false);
  const[bulk,setBulk]=useState('');
  const[filter,setFilter]=useState<'new'|'generated'|'skipped'|'all'>('new');
  const[typeFilter,setTypeFilter]=useState('all');
  const[hideWebsite,setHideWebsite]=useState(true);
  const[query,setQuery]=useState('');
  const[sel,setSel]=useState<Set<string>>(new Set());
  const[busy,setBusy]=useState('');
  const[editing,setEditing]=useState<string|null>(null);
  const[editDraft,setEditDraft]=useState<Fields|null>(null);
  const[saving,setSaving]=useState(false);
  const[claim,setClaim]=useState<Lead|null>(null);
  const[claimPhone,setClaimPhone]=useState('');
  const[claimPass,setClaimPass]=useState(pwd());
  const[claimSlug,setClaimSlug]=useState('');
  const[claimDone,setClaimDone]=useState<{siteUrl:string;loginUrl:string;phone:string;password:string}|null>(null);

  async function load(){
    // ilk yüklemede "Yükleniyor…" gösterilir; sonraki yenilemeler listeyi yerinde günceller (kutular odağını kaybetmesin)
    const r=await fetch('/api/admin/demo/leads');const j=await r.json().catch(()=>({}));
    if(r.ok){setLeads(j.leads||[]);setThemes(j.themes||[])}else setErr(j.error||'Liste alınamadı.');
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
  const bodyOf=(f:Fields)=>({name:f.name.trim(),business_type:f.business_type,theme_id:f.theme_id||null,image_set:f.image_set||null,phone:f.phone,address:f.address,instagram:f.instagram,hours_start:f.hours_start&&f.hours_end?f.hours_start:null,hours_end:f.hours_start&&f.hours_end?f.hours_end:null});
  async function addOne(e:React.FormEvent){
    e.preventDefault();setErr('');setMsg('');setAdding(true);
    const r=await fetch('/api/admin/demo/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lead:bodyOf(draft)})});
    const j=await r.json();setAdding(false);
    if(!r.ok){setErr(j.error||'Eklenemedi.');return}
    setMsg(`"${draft.name.trim()}" listeye eklendi. Aşağıdaki "Yeni" listesinde düzenleyebilir, seçip demo üretebilirsin.`);
    // kategori/tema/görsel seti kalsın (art arda aynı türden eklemek kolay olsun), kişisel alanlar temizlensin
    setDraft(d=>({...EMPTY(d.business_type),theme_id:d.theme_id,image_set:guessImageSet(d.business_type,'')}));
    setFilter('new');load();
  }
  async function addBulk(){
    setErr('');setMsg('');
    const r=await fetch('/api/admin/demo/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lines:bulk})});
    const j=await r.json();
    if(!r.ok){setErr(j.error||'Eklenemedi.');return}
    setMsg(`${j.added} işletme eklendi.${j.bad?.length?` Anlaşılamayan satırlar (${j.bad.length}): ${j.bad.slice(0,3).join(' | ')}`:''}`);
    if(!j.bad?.length)setBulk('');
    load();
  }
  async function patch(id:string,p:Record<string,any>){
    setErr('');
    const r=await fetch('/api/admin/demo/leads',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,patch:p})});
    if(!r.ok){const j=await r.json().catch(()=>({}));setErr(j.error||'Kaydedilemedi.')}
    load();
  }
  /* Aday kartında alan değişimi → sunucuya (tür değişince tema/görsel seti sunucu tarafında da sıfırlanır) */
  function patchFields(l:Lead,p:Partial<Fields>){
    const out:Record<string,any>={};
    for(const[k,v]of Object.entries(p)){if(k==='hours_start'||k==='hours_end')continue;out[k]=v}
    if('hours_start' in p||'hours_end' in p){
      const cur=fieldsOf(l);const s='hours_start' in p?p.hours_start!:cur.hours_start;const e='hours_end' in p?p.hours_end!:cur.hours_end;
      out.hours_start=s&&e?s:null;out.hours_end=s&&e?e:null;
    }
    patch(l.id,out);
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
  function startEdit(l:Lead){setEditing(l.id);setEditDraft(fieldsOf(l));setErr('')}
  async function saveEdit(l:Lead){
    if(!l.business||!editDraft)return;
    setSaving(true);setErr('');
    const cur=fieldsOf(l),d=editDraft,edit:Record<string,any>={};
    if(d.name.trim()!==cur.name)edit.name=d.name.trim();
    if(d.phone!==cur.phone)edit.phone=d.phone||null;
    if(d.address!==cur.address)edit.address=d.address||null;
    if(d.instagram!==cur.instagram)edit.instagram=d.instagram||null;
    if(d.theme_id!==cur.theme_id)edit.theme_id=d.theme_id;
    if(d.image_set!==cur.image_set)edit.image_set=d.image_set;
    if(d.hours_start!==cur.hours_start||d.hours_end!==cur.hours_end)edit.opening_hours=hoursToOsm(d.hours_start,d.hours_end);
    if(!Object.keys(edit).length){setSaving(false);setEditing(null);return}
    const r=await fetch('/api/admin/demo/site',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({businessId:l.business.id,edit})});
    const j=await r.json().catch(()=>({}));setSaving(false);
    if(!r.ok){setErr(j.error||'Kaydedilemedi.');return}
    setMsg(`"${d.name.trim()}" demo sitesi güncellendi.`);setEditing(null);load();
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
  const card={padding:12,border:'1px solid rgba(128,128,128,.35)',borderRadius:8} as const;

  return <div className="dashboardShell"><main className="dashboardMain noSide">
    <header className="dashboardTop"><div className="platformLogo"><span>M</span><b>MEGSAK</b></div><div className="adminTopActions"><a className="plainAction" href="/yonetim">← İşletmeler</a></div></header>
    <div className="dashboardContent">
      <section className="panel dashPanel">
        <div className="panelTitle"><div><h2>Demo site üretici</h2><p>Bölgedeki işletmeleri haritadan bul ya da elle ekle, seçtiklerinden "örnek taslak" site üret, işletmeciye gidip göster. Demo siteler arama motorlarına kapalıdır, en üstte "ÖRNEK TASARIM" etiketi taşır ve randevu/mesaj almaz. İşletmeci kabul ederse <b>Devret</b> ile gerçek hesaba çevrilir, kabul etmezse <b>Sil</b>.</p></div></div>
        {err&&<p className="formError">{err}</p>}{msg&&<p style={{margin:'10px 0',fontWeight:600}}>{msg}</p>}
        <h3 style={{marginTop:18}}>1. Bölgeyi tara</h3>
        <p className="builderHelp">Kaynak: OpenStreetMap (ücretsiz, herkese açık harita). Yalnızca adı, türü, konumu ve varsa telefon/adres/saati alınır. Google bilgileri kaydedilmez.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'end'}}>
          <label className="field" style={{margin:0}}>Bölge<select className="input" disabled><option>{DEMO_AREAS[0].label}</option></select></label>
          <label className="field" style={{margin:0}}>Yarıçap (metre)<input className="input" type="number" min={500} max={6000} step={250} value={radius} onChange={e=>setRadius(Number(e.target.value)||3500)}/></label>
          <button type="button" className="blackBtn" onClick={scan} disabled={scanning}>{scanning?'Taranıyor… (30 sn kadar sürebilir)':'Haritadan tara'}</button>
        </div>

        <h3 style={{marginTop:24}}>2. Elle ekle <small style={{fontWeight:400,opacity:.7}}>(haritada olmayanlar için)</small></h3>
        <form onSubmit={addOne} style={{...card,marginTop:8}}>
          <LeadFields v={draft} themes={themes} onChange={p=>setDraft(d=>{
            const n={...d,...p};
            // ad yazılırken (görsel setini elle seçmediysek) restoran alt türü addan tahmin edilir
            if('name' in p&&!('image_set' in p)&&!('business_type' in p))n.image_set=guessImageSet(n.business_type,n.name);
            return n;
          })}/>
          <div style={{marginTop:12,display:'flex',flexWrap:'wrap',gap:10,alignItems:'center'}}>
            <button type="submit" className="blackBtn" disabled={adding||draft.name.trim().length<2}>{adding?'Ekleniyor…':'Listeye ekle'}</button>
            <small style={{opacity:.75}}>Açılış/kapanış boş bırakılırsa kategoriye uygun varsayılan saatler kullanılır.</small>
          </div>
        </form>
        <details style={{marginTop:12}}>
          <summary style={{cursor:'pointer',fontWeight:600}}>Çok sayıda işletmeyi tek seferde yapıştır</summary>
          <p className="builderHelp" style={{marginTop:8}}>Her satıra bir işletme: <code>Ad; Tür; Telefon; Adres</code> — örn. <code>Yıldız Kuaför; kadın kuaförü; 0532 111 22 33; Yeni Bağlıca Mah.</code> Eklendikten sonra her birini listeden düzenleyebilirsin.</p>
          <textarea className="input" rows={4} value={bulk} onChange={e=>setBulk(e.target.value)} placeholder={'Yıldız Kuaför; kadın kuaförü; 0532 111 22 33; Yeni Bağlıca\nHızlı Oto Yıkama; oto yıkama; ; Bağlıca Bulvarı'}/>
          <div style={{marginTop:8}}><button type="button" className="blackBtn" onClick={addBulk} disabled={bulk.trim().length<3}>Toplu ekle</button></div>
        </details>
      </section>

      <section className="panel dashPanel">
        <div className="panelTitle"><div><h2>3. Adaylar</h2><p>{counts.new} yeni · {counts.generated} demo üretildi. Haritada "sitesi var" işaretli olanlar varsayılan olarak gizlenir (büyük olasılıkla sitesi vardır). Her adayın kategorisini, temasını, görsel setini ve bilgilerini üretmeden önce düzenleyebilirsin.</p></div></div>
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
          {shown.map(l=><div key={l.id} style={{...card,display:'grid',gridTemplateColumns:l.status==='new'?'auto 1fr':'1fr',gap:12,alignItems:'start'}}>
            {l.status==='new'&&<input type="checkbox" checked={sel.has(l.id)} onChange={()=>toggle(l.id)} aria-label={`${l.name} seç`} style={{marginTop:8}}/>}
            <div style={{display:'grid',gap:8,minWidth:0}}>
              {l.status==='new'?<>
                <LeadFields live v={fieldsOf(l)} themes={themes} onChange={p=>patchFields(l,p)}/>
                {(()=>{const r=osmToHoursRange(l.opening_hours);return l.opening_hours&&!r?<small style={{opacity:.75}}>Haritadan alınan çalışma saatleri kullanılacak: <code>{l.opening_hours}</code> (yukarıya açılış/kapanış girersen onlar geçerli olur)</small>:null})()}
              </>:<div><b>{l.name}</b> <small style={{opacity:.7}}>· {DEMO_TYPE_LABELS[l.business_type]||l.business_type}{l.phone?` · ${l.phone}`:''}{l.address?` · ${l.address}`:''}</small></div>}
              <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',fontSize:13}}>
                <span style={{opacity:.7}}>{l.source==='osm'?'Harita':'Elle'}{l.area?` · ${l.area}`:''}</span>
                {l.has_website&&<span style={{padding:'2px 8px',background:'rgba(255,180,0,.25)'}}>haritada web sitesi görünüyor</span>}
                {l.status!=='new'&&<span style={{padding:'2px 8px',background:'rgba(128,128,128,.2)'}}>{STATUS_LABEL[l.status]}</span>}
                {l.status==='new'&&<button type="button" className="plainAction" onClick={()=>patch(l.id,{status:'skipped'})}>Atla</button>}
                {l.status==='skipped'&&<button type="button" className="plainAction" onClick={()=>patch(l.id,{status:'new'})}>Geri al</button>}
                {l.status==='generated'&&l.business&&<>
                  <a className="plainAction" href={siteUrl(l.business.slug)} target="_blank" rel="noopener noreferrer">Siteyi aç ↗</a>
                  <button type="button" className="plainAction" onClick={()=>copy(siteUrl(l.business!.slug))}>Linki kopyala</button>
                  {l.business.is_demo&&<button type="button" className="plainAction" onClick={()=>editing===l.id?setEditing(null):startEdit(l)}>{editing===l.id?'Düzenlemeyi kapat':'Düzenle'}</button>}
                  {l.business.is_demo?<button type="button" className="plainAction" onClick={()=>{setClaim(l);setClaimPhone(l.phone||'');setClaimPass(pwd());setClaimSlug('');setClaimDone(null);setErr('')}}>Devret</button>:<span style={{color:'#1a7f37',fontWeight:600}}>✓ Devredildi</span>}
                  <button type="button" className="plainAction" onClick={()=>del(l)}>Sil</button>
                </>}
                {l.status==='generated'&&!l.business&&<><span style={{opacity:.7}}>site silinmiş</span><button type="button" className="plainAction" onClick={()=>patch(l.id,{status:'new'})}>Yeniden aday yap</button></>}
              </div>
              {editing===l.id&&editDraft&&l.business?.is_demo&&<div style={{...card,marginTop:4}}>
                <p className="builderHelp" style={{marginTop:0}}>Canlı demo sitesini düzenliyorsun. Tema ya da görsel setini değiştirirsen site yeni haliyle hemen güncellenir (kategori sonradan değiştirilemez; gerekirse siteyi silip yeniden üret).</p>
                <LeadFields v={editDraft} themes={themes} lockType onChange={p=>setEditDraft(d=>d?{...d,...p}:d)}/>
                <div style={{marginTop:12,display:'flex',gap:10}}>
                  <button type="button" className="blackBtn" disabled={saving||editDraft.name.trim().length<2} onClick={()=>saveEdit(l)}>{saving?'Kaydediliyor…':'Kaydet'}</button>
                  <button type="button" className="plainAction" onClick={()=>setEditing(null)}>Vazgeç</button>
                </div>
              </div>}
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
