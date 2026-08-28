import{notFound}from'next/navigation';import{createClient}from'@/lib/supabase-server';import'@/components/themes/radical-themes.css';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string;postSlug:string}>}){
  const{slug,postSlug}=await params,db=await createClient();
  const{data:b}=await db.from('businesses').select('id,name').eq('slug',slug).single();
  if(!b)return{title:'Yontum'};
  const{data:post}=await db.from('blog_posts').select('title,excerpt').eq('business_id',b.id).eq('slug',postSlug).single();
  if(!post)return{title:b.name};
  return{title:`${post.title} — ${b.name}`,description:post.excerpt||undefined};
}
export default async function BlogPost({params}:{params:Promise<{slug:string;postSlug:string}>}){
  const{slug,postSlug}=await params,db=await createClient();
  const{data:b}=await db.from('businesses').select('*').eq('slug',slug).single();
  if(!b)notFound();
  const{data:post}=await db.from('blog_posts').select('*').eq('business_id',b.id).eq('slug',postSlug).eq('is_published',true).single();
  if(!post)notFound();
  const dateStr=new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(post.published_at));
  const paragraphs=(post.content||'').split(/\n{2,}/).map((p:string)=>p.trim()).filter(Boolean);
  return <main className="tAtelier">
    <header className="atNav">
      <a className="atBrand" href={`/site/${b.slug}`}><b>{b.name}</b><small>BARBER ATELIER</small></a>
      <nav><a href={`/site/${b.slug}`}>Home</a><a href={`/site/${b.slug}#hizmetler`}>Services</a><a href={`/site/${b.slug}/blog`}>Journal</a></nav>
      <a className="atNavBtn" href={`/site/${b.slug}#randevu`}>{b.booking_button_text||'Book Now'}</a>
    </header>
    <article className="atPostArticle">
      <div className="atPostHead">
        {post.category&&<small>{post.category.toUpperCase()}</small>}
        <h1>{post.title}</h1>
        <span>{dateStr}</span>
      </div>
      {post.cover_url&&<div className="atPostCover"><img src={post.cover_url} alt={post.title}/></div>}
      <div className="atPostBody">
        {paragraphs.length?paragraphs.map((p:string,i:number)=><p key={i}>{p}</p>):post.excerpt&&<p>{post.excerpt}</p>}
      </div>
      <a className="atPostBack" href={`/site/${b.slug}/blog`}>← All Entries</a>
    </article>
    <footer className="atFooter"><div className="atFooterBottom">© {new Date().getFullYear()} {b.name}</div></footer>
  </main>;
}
