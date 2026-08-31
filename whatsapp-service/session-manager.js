import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import pino from 'pino';
import { reportSessionStatus } from './api-client.js';

// Her işletme (business_id) için ayrı bir WhatsApp oturumu tutuyoruz.
// Oturum bilgileri lokalde ./sessions/<businessId>/ klasöründe saklanır —
// bilgisayarını kapatıp açsan bile tekrar QR taratmana gerek kalmaz.
const sockets = new Map(); // businessId -> socket
const logger = pino({ level: 'silent' });

export function isConnected(businessId) {
  const sock = sockets.get(businessId);
  return !!sock;
}

export async function ensureSession(businessId, businessName) {
  if (sockets.has(businessId)) return;
  console.log(`[${businessName || businessId}] oturum başlatılıyor…`);
  const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${businessId}`);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    auth: state,
    version,
    logger,
    printQRInTerminal: false,
    browser: ['Yontum', 'Chrome', '1.0'],
  });
  sockets.set(businessId, sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        const qrData = await qrcode.toDataURL(qr, { width: 320 });
        await reportSessionStatus(businessId, 'qr_pending', { qrData });
        console.log(`[${businessName || businessId}] yeni QR kod panelde görüntülenmeye hazır.`);
      } catch (e) {
        console.error(`[${businessName || businessId}] QR raporlanamadı:`, e.message);
      }
    }

    if (connection === 'open') {
      const phone = sock.user?.id?.split(':')?.[0] || sock.user?.id || null;
      await reportSessionStatus(businessId, 'connected', { connectedPhone: phone }).catch((e) => console.error(e.message));
      console.log(`[${businessName || businessId}] bağlandı: ${phone}`);
    }

    if (connection === 'close') {
      sockets.delete(businessId);
      const statusCode = lastDisconnect?.error instanceof Boom ? lastDisconnect.error.output?.statusCode : undefined;
      const errMsg = lastDisconnect?.error?.message || String(lastDisconnect?.error || '');
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      const restartRequired = statusCode === DisconnectReason.restartRequired;
      console.log(`[${businessName || businessId}] bağlantı kapandı — statusCode=${statusCode} restartRequired=${restartRequired} mesaj="${errMsg}"`);
      if (loggedOut) {
        await reportSessionStatus(businessId, 'disconnected').catch((e) => console.error(e.message));
        console.log(`[${businessName || businessId}] oturum kapatıldı (telefondan bağlantı kesildi) — yeniden QR gerekecek.`);
      } else if (restartRequired) {
        // QR üretildikten hemen sonra WhatsApp sunucusunun bilinçli olarak
        // kapattığı, normal bir ara adım — yeni QR ÜRETMEDEN, aynı durumla
        // hemen (bekleme olmadan) yeniden bağlanmak gerekiyor.
        ensureSession(businessId, businessName);
      } else {
        await reportSessionStatus(businessId, 'disconnected').catch((e) => console.error(e.message));
        console.log(`[${businessName || businessId}] bağlantı koptu, 5sn sonra yeniden denenecek…`);
        setTimeout(() => ensureSession(businessId, businessName), 5000);
      }
    }
  });
}

export async function sendText(businessId, phoneDigits, text) {
  const sock = sockets.get(businessId);
  if (!sock) throw new Error('Bu işletme için WhatsApp bağlı değil.');
  const jid = `${phoneDigits}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text });
}
