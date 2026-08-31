import 'dotenv/config';
import { ensureSession, sendText } from './session-manager.js';
import { fetchAutomationBusinesses, fetchPendingMessages, markMessageSent } from './api-client.js';

const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 60000);

function randomDelay(minMs = 3000, maxMs = 5000) {
  return new Promise((resolve) => setTimeout(resolve, minMs + Math.random() * (maxMs - minMs)));
}

async function ensureAllSessions() {
  let businesses = [];
  try {
    businesses = await fetchAutomationBusinesses();
  } catch (e) {
    console.error('İşletme listesi alınamadı:', e.message);
    return;
  }
  for (const b of businesses) {
    try {
      await ensureSession(b.id, b.name);
    } catch (e) {
      console.error(`[${b.name}] oturum başlatılamadı:`, e.message);
    }
  }
}

async function sendPendingMessages() {
  let messages = [];
  try {
    messages = await fetchPendingMessages();
  } catch (e) {
    console.error('Bekleyen mesajlar alınamadı:', e.message);
    return;
  }
  if (!messages.length) return;
  console.log(`${messages.length} mesaj gönderilecek…`);
  for (const m of messages) {
    try {
      // Spama takılmamak için her mesaj arasında rastgele 3-5 saniye bekle.
      await randomDelay();
      await sendText(m.businessId, m.phone, m.text);
      await markMessageSent(m.appointmentId, m.type);
      console.log(`  ✓ ${m.type} → ${m.phone}`);
    } catch (e) {
      console.error(`  ✗ ${m.type} → ${m.phone}:`, e.message);
      // Bu mesajı işaretlemiyoruz, bir sonraki turda tekrar denenecek.
    }
  }
}

async function tick() {
  await ensureAllSessions();
  await sendPendingMessages();
}

console.log('Yontum WhatsApp Otomasyon Servisi başlatılıyor…');
console.log(`Kontrol aralığı: ${POLL_INTERVAL_MS / 1000} saniye`);

tick();
setInterval(tick, POLL_INTERVAL_MS);
