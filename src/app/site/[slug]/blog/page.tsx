import{notFound}from'next/navigation';import{createClient}from'@/lib/supabase-server';import'@/components/themes/radical-themes.css';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const{slug}=await params,db=await createClient();
  const{data:b}=await db.from('businesses').select('name').eq('slug',slug).single();
  if(!b)return{title:'Yontum'};
  return{title:`Journal — ${b.name}`};
}
export default async function BlogIndex({params}:{params:Promise<{slug:string}>}){
  const{slug}=await params,db=await createClient();
  const{data:b}=await db.from('businesses').select('*').eq('slug',slug).single();
  if(!b)notFound();
  const{data:posts}=await db.from('blog_posts').select('*').eq('business_id',b.id).eq('is_published',true).order('published_at',{ascending:false});
  return <main className="tAtelier">
    <header className="atNav">
      <a className="atBrand" href={`/site/${b.slug}`}><b>{b.name}</b><small>BARBER ATELIER</small></a>
      <nav><a href={`/site/${b.slug}`}>Home</a><a href={`/site/${b.slug}#hizmetler`}>Services</a><a href={`/site/${b.slug}/blog`}>Journal</a></nav>
      <a className="atNavBtn" href={`/site/${b.slug}#randevu`}>{b.booking_button_text||'Book Now'}</a>
    </header>
    <section className="atJournalSection" style={{paddingTop:70}}>
      <header><small>THE JOURNAL</small><h2>Grooming, written down.</h2></header>
      <div className="atJournalGrid">
        {(posts||[]).map(post=><article key={post.id}>
          <a href={`/site/${b.slug}/blog/${post.slug}`}>
            <div className="atJournalCover">{post.cover_url?<img src={post.cover_url} alt={post.title}/>:<i>✂</i>}</div>
            {post.category&&<small>{post.category.toUpperCase()}</small>}
            <h3>{post.title}</h3>
            {post.excerpt&&<p>{post.excerpt}</p>}
          </a>
        </article>)}
        {!posts?.length&&<p style={{color:'var(--at-muted)'}}>Henüz yazı eklenmedi.</p>}
      </div>
    </section>
    <footer className="atFooter"><div className="atFooterBottom">© {new Date().getFullYear()} {b.name}</div></footer>
  </main>;
}
