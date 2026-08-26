import PlatformHeader from '@/components/PlatformHeader';

export const metadata = { title: 'Gizlilik Politikası' };

export default function PrivacyPage() {
  return (
    <>
      <PlatformHeader />
      <main style={{ padding: '80px 6vw', minHeight: '80vh' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p className="overline"><i />GİZLİLİK POLİTİKASI</p>
          <h1 style={{ font: '700 44px Georgia', margin: '18px 0 34px' }}>Kişisel Verilerin Korunması</h1>

          <section style={{ marginBottom: 28, lineHeight: 1.8, color: 'var(--muted)' }}>
            <h2 style={{ color: 'var(--ink)', font: '700 20px Georgia', marginBottom: 10 }}>1. Hangi Bilgileri Topluyoruz?</h2>
            <p>Randevu oluştururken adınız, soyadınız, telefon numaranız ve isteğe bağlı olarak e-posta adresiniz alınır. Bu bilgiler yalnızca randevunuzu oluşturmak, size ulaşmak ve randevu yönetimi (iptal, değişiklik, hatırlatma) amacıyla kullanılır.</p>
          </section>

          <section style={{ marginBottom: 28, lineHeight: 1.8, color: 'var(--muted)' }}>
            <h2 style={{ color: 'var(--ink)', font: '700 20px Georgia', marginBottom: 10 }}>2. Bilgileriniz Kimlerle Paylaşılır?</h2>
            <p>Bilgileriniz yalnızca randevu aldığınız işletmeyle paylaşılır. Üçüncü taraflarla pazarlama amacıyla paylaşılmaz veya satılmaz.</p>
          </section>

          <section style={{ marginBottom: 28, lineHeight: 1.8, color: 'var(--muted)' }}>
            <h2 style={{ color: 'var(--ink)', font: '700 20px Georgia', marginBottom: 10 }}>3. Verileriniz Ne Kadar Süre Saklanır?</h2>
            <p>Randevu kayıtlarınız, işletmenin sizinle olan randevu geçmişini yönetebilmesi için makul bir süre saklanır. Dilediğiniz zaman işletmeyle iletişime geçerek verilerinizin silinmesini talep edebilirsiniz.</p>
          </section>

          <section style={{ marginBottom: 28, lineHeight: 1.8, color: 'var(--muted)' }}>
            <h2 style={{ color: 'var(--ink)', font: '700 20px Georgia', marginBottom: 10 }}>4. Haklarınız</h2>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini talep etme haklarına sahipsiniz.</p>
          </section>

          <section style={{ lineHeight: 1.8, color: 'var(--muted)' }}>
            <h2 style={{ color: 'var(--ink)', font: '700 20px Georgia', marginBottom: 10 }}>5. İletişim</h2>
            <p>Sorularınız için randevu aldığınız işletmeyle doğrudan iletişime geçebilirsiniz.</p>
          </section>
        </div>
      </main>
      <footer className="platformFooter">
        <div className="platformLogo inverse"><span>Y</span><b>YONTUM</b></div>
        <p>© 2026 Yontum.</p>
      </footer>
    </>
  );
}
