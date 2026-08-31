// Vercel'de yayınlanan Yontum sitesindeki /api/whatsapp-service/* rotalarıyla konuşan
// küçük yardımcı. Kimlik doğrulama, her istekte gönderilen paylaşılan gizli anahtarla yapılır.
const BASE = (process.env.YONTUM_SITE_URL || '').replace(/\/$/, '');
const SECRET = process.env.WHATSAPP_SERVICE_SECRET || '';

async function call(path, options = {}) {
  if (!BASE) throw new Error('YONTUM_SITE_URL .env dosyasında ayarlı değil.');
  if (!SECRET) throw new Error('WHATSAPP_SERVICE_SECRET .env dosyasında ayarlı değil.');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-service-secret': SECRET,
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `İstek başarısız: ${res.status}`);
  return json;
}

export function fetchAutomationBusinesses() {
  return call('/api/whatsapp-service/businesses').then((j) => j.businesses || []);
}

export function fetchPendingMessages() {
  return call('/api/whatsapp-service/pending').then((j) => j.messages || []);
}

export function markMessageSent(appointmentId, type) {
  return call('/api/whatsapp-service/mark-sent', {
    method: 'POST',
    body: JSON.stringify({ appointmentId, type }),
  });
}

export function fetchInstantMessages() {
  return call('/api/whatsapp-service/instant').then((j) => j.messages || []);
}

export function markInstantSent(id, ok, error) {
  return call('/api/whatsapp-service/instant/mark-sent', {
    method: 'POST',
    body: JSON.stringify({ id, ok, error }),
  });
}

export function reportSessionStatus(businessId, status, extra = {}) {
  return call('/api/whatsapp-service/session', {
    method: 'POST',
    body: JSON.stringify({ businessId, status, ...extra }),
  });
}
