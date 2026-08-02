import Link from'next/link';
export default function PlatformHeader(){return <header className="platformHeader"><Link className="platformLogo" href="/"><span>Y</span><b>YONTUM</b></Link><nav><Link href="/giris">Giriş Yap</Link><Link className="navCta" href="/kayit">Ücretsiz Başla →</Link></nav></header>}
