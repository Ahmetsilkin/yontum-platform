import PlatformHeader from '@/components/PlatformHeader';
import PlatformFooter from '@/components/PlatformFooter';

export const metadata = { title: 'Kullanım Koşulları' };

export default function TermsPage() {
  return (
    <>
      <PlatformHeader />
      <main className="legalPage">
        <div className="legalWrap">
          <p className="pubEyebrow"><i />KULLANIM KOŞULLARI</p>
          <h1>Hizmet Şartları</h1>
          <p className="legalUpdated">Son güncelleme: Eylül 2026</p>

          <section>
            <h2>1. Hizmetin Tanımı</h2>
            <p>Yontum, işletmelerin (berber, kuaför, güzellik salonu, spa vb.) kendi tanıtım sitelerini yayınlamalarını ve online randevu almalarını sağlayan bir platformdur. Hesabınızı oluşturarak bu koşulları kabul etmiş sayılırsınız.</p>
          </section>

          <section>
            <h2>2. Hesap Sorumluluğu</h2>
            <p>Hesabınızın ve şifrenizin güvenliğinden siz sorumlusunuz. Hesabınız üzerinden yapılan tüm işlemler (randevu yönetimi, site içeriği, müşteri iletişimi) işletmenizin sorumluluğundadır. Şüpheli bir erişim fark ederseniz şifrenizi hemen değiştirin.</p>
          </section>

          <section>
            <h2>3. İçerik ve Kullanım Kuralları</h2>
            <p>Sitenize yüklediğiniz metin, görsel ve diğer içeriklerin size ait olduğunu veya kullanım hakkına sahip olduğunuzu kabul edersiniz. Yasa dışı, yanıltıcı veya üçüncü kişilerin haklarını ihlal eden içerik yayınlanamaz.</p>
          </section>

          <section>
            <h2>4. Ücretlendirme</h2>
            <p>Platform şu an ücretsiz kullanıma açıktır. İleride ücretli planlar sunulması durumunda, mevcut kullanıcılar önceden bilgilendirilecek ve fiyatlandırma değişiklikleri geriye dönük olarak uygulanmayacaktır.</p>
          </section>

          <section>
            <h2>5. Hizmetin Sürekliliği</h2>
            <p>Platformu kesintisiz ve hatasız sunmak için çaba gösteriyoruz, ancak bakım, güncelleme veya öngörülemeyen teknik sorunlar nedeniyle zaman zaman kesinti yaşanabilir. Randevu bildirimleri (WhatsApp, e-posta vb.) üçüncü taraf servislere bağlı olarak değişkenlik gösterebilir.</p>
          </section>

          <section>
            <h2>6. Hesap Kapatma</h2>
            <p>Hesabınızı istediğiniz zaman kapatabilirsiniz. Kullanım koşullarının ihlali durumunda hesabınızı askıya alma veya kapatma hakkımız saklıdır.</p>
          </section>

          <section>
            <h2>7. Sorumluluğun Sınırlandırılması</h2>
            <p>Yontum, platform üzerinden alınan randevuların işletme ile müşteri arasındaki ilişkisine taraf değildir; hizmet kalitesi, randevuya uyulmaması gibi konulardan sorumlu tutulamaz.</p>
          </section>

          <section>
            <h2>8. Uygulanacak Hukuk</h2>
            <p>Bu koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Sorularınız için bize ulaşabilirsiniz.</p>
          </section>
        </div>
      </main>
      <PlatformFooter />
    </>
  );
}
