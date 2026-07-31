import type{Metadata}from'next';import AuthHashRedirect from'@/components/AuthHashRedirect';import'./globals.css';
export const metadata:Metadata={title:{default:'Yontum — Berber siten hazır',template:'%s | Yontum'},description:'Berber, kuaför, güzellik, nail ve spa işletmeleri için dakikalar içinde hazır profesyonel web sitesi ve online randevu sistemi.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="tr"><body><AuthHashRedirect/>{children}</body></html>}
import type{Metadata}from'next';import'./globals.css';

export const metadata:Metadata={title:{default:'Yontum — Berber siten hazır',template:'%s | Yontum'},description:'Berber, kuaför, güzellik, nail ve spa işletmeleri için dakikalar içinde hazır profesyonel web sitesi ve online randevu sistemi.'};

// Bu script, sayfa render edilmeden ve React/Supabase istemcisi hiç devreye girmeden
// ÖNCE çalışır (senkron, <head> içinde). Supabase'in kendi kütüphanesi URL'deki
// davet/şifre-sıfırlama token'ını kendiliğinden okuyup URL'den silmeden önce
// bizim burada yakalayıp doğru sayfaya (şifre oluştur/yenile) yönlendirmemiz lazım -
// bu yüzden React useEffect yerine bilinçli olarak düz bir <script> kullanılıyor.
const authHashRedirectScript = `
(function(){
  var hash = window.location.hash;
  if(!hash) return;
  var params = new URLSearchParams(hash.slice(1));
  var type = params.get('type');
  var path = window.location.pathname;
  if(type==='recovery' && path!=='/sifre-yenile'){
    window.location.replace('/sifre-yenile'+hash);
  } else if(type==='invite' && path!=='/sifre-olustur'){
    window.location.replace('/sifre-olustur'+hash);
  }
})();
`;

export default function Layout({children}:{children:React.ReactNode}){return <html lang="tr"><head><script dangerouslySetInnerHTML={{__html:authHashRedirectScript}}/></head><body>{children}</body></html>}

