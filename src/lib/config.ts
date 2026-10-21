export const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? '';
export const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? '';
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '';

export const QR_PREFIX = 'PE1.';
export const QR_REFRESH_MS = 100_000; // il token vale 120 s; si rinnova prima della scadenza
