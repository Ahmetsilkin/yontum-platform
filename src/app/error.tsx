'use client';

import { useEffect } from 'react';
import PlatformHeader from '@/components/PlatformHeader';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PlatformHeader />
      <main className="statusPage">
        <p className="pubEyebrow">BİR ŞEYLER TERS GİTTİ</p>
        <h1>Beklenmedik <mark className="pubMark">bir hata</mark> oluştu.</h1>
        <p>Sorun bizde — sayfayı yeniden yüklemeyi dene. Devam ederse birkaç dakika sonra tekrar dene.</p>
        <button className="navCta pub-tap" onClick={() => reset()} style={{ border: 0, cursor: 'pointer' }}>
          Tekrar Dene →
        </button>
      </main>
    </>
  );
}
