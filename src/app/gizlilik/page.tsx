import PlatformHeader from '@/components/PlatformHeader';
import PlatformFooter from '@/components/PlatformFooter';

export const metadata = { title: 'Gizlilik Politikası' };

export default function PrivacyPage() {
  return (
    <>
      <PlatformHeader />
      <main className="legalPage">
        <div className="legalWrap">
          <p className="pubEyebrow"><i />GİZLİLİK POLİTİKASI</p>
          <h1>Kişisel Verilerin Korunması</h1>
          <p className="legalUpdated">Son güncelleme: Eylül 2026</p>

          <section>
            <h2>1. Hangi Bilgileri Topluyoruz?</h2>
            <p>Randevu oluştururken adınız, soyadınız, telefon numaranız ve isteğe bağlı olarak e-posta adresiniz alınır. Bu bilgiler yalnızca randevunuzu oluşturmak, size ulaşmak ve randevu yönetimi (iptal, değişiklik, hatırlatma) amacıyla kullanılır.</p>
          </section>

          <section>
            <h2>2. Bilgileriniz Kimlerle Paylaşılır?</h2>
            <p>Bilgileriniz yalnızca randevu aldığınız işletmeyle paylaşılır. Üçüncü taraflarla pazarlama amacıyla paylaşılmaz veya satılmaz.</p>
          </section>

          <section>
            <h2>3. Verileriniz Ne Kadar Süre Saklanır?</h2>
            <p>Randevu kayıtlarınız, işletmenin sizinle olan randevu geçmişini yönetebilmesi için makul bir süre saklanır. Dilediğiniz zaman işletmeyle iletişime geçerek verilerinizin silinmesini talep edebilirsiniz.</p>
          </section>

          <section>
            <h2>4. Haklarınız</h2>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini talep etme haklarına sahipsiniz.</p>
          </section>

          <section>
            <h2>5. İletişim</h2>
            <p>Sorularınız için randevu aldığınız işletmeyle doğrudan iletişime geçebilirsiniz.</p>
          </section>
        </div>
      </main>
      <PlatformFooter />
    </>
  );
}
