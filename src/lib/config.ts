export const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? '';
export const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? '';
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '';

export const QR_PREFIX = 'PE1.';
export const QR_REFRESH_MS = 100_000; // il token vale 120 s; si rinnova prima della scadenza

// Soggetto che gestisce PointEarner (titolare account, fornitore del servizio, sviluppatore)
export const OWNER =
  'Immobiliare Triade S.r.l., Via Tunisi 22, 72100 Brindisi (BR), P.IVA 01613890746';
export const OWNER_NAME = 'Immobiliare Triade S.r.l.';
export const CONTACT_EMAIL = 'info@pointearner.it';
