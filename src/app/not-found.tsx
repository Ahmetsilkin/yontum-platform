import Link from 'next/link';
import PlatformHeader from '@/components/PlatformHeader';

export default function NotFound() {
  return (
    <>
      <PlatformHeader />
      <main className="statusPage">
        <p className="pubEyebrow">404 · SAYFA BULUNAMADI</p>
        <h1>Bu sayfa <mark className="pubMark">kayıp.</mark></h1>
        <p>Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. Anasayfaya dönüp yeniden deneyebilirsin.</p>
        <Link className="navCta pub-tap" href="/">Anasayfaya Dön →</Link>
      </main>
    </>
  );
}
