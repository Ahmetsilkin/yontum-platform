import Link from'next/link';
export const metadata={title:'E-posta Doğrulandı'};
export default function Verified(){return <main className="verifiedPage"><section><div className="verifiedIcon">✓</div><p className="overline">HESABIN HAZIR</p><h1>E-postan doğrulandı.</h1><p>Yontum hesabın başarıyla etkinleştirildi. Şimdi işletmeni oluşturup siteni yayınlayabilirsin.</p><Link className="primaryBtn" href="/panel">İşletmemi Oluştur →</Link></section></main>}
