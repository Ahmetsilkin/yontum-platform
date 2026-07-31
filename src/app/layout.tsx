import type{Metadata}from'next';import AuthHashRedirect from'@/components/AuthHashRedirect';import'./globals.css';
export const metadata:Metadata={title:{default:'Yontum — Berber siten hazır',template:'%s | Yontum'},description:'Berber, kuaför, güzellik, nail ve spa işletmeleri için dakikalar içinde hazır profesyonel web sitesi ve online randevu sistemi.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="tr"><body><AuthHashRedirect/>{children}</body></html>}
