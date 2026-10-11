// Google Analytics helpers. The gtag bootstrap itself is inline in Head.astro so
// consent defaults are in place before gtag.js loads.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Time zones of the EU/EEA, the UK and Switzerland: visitors there are asked
// before analytics storage is used. Everyone else gets the banner-free default.
const CONSENT_ZONES = new Set([
  'Europe/Vienna', 'Europe/Brussels', 'Europe/Sofia', 'Europe/Zagreb', 'Europe/Nicosia', 'Asia/Nicosia',
  'Europe/Prague', 'Europe/Copenhagen', 'Europe/Tallinn', 'Europe/Helsinki', 'Europe/Paris', 'Europe/Berlin',
  'Europe/Busingen', 'Europe/Athens', 'Europe/Budapest', 'Europe/Dublin', 'Europe/Rome', 'Europe/Riga',
  'Europe/Vilnius', 'Europe/Luxembourg', 'Europe/Malta', 'Europe/Amsterdam', 'Europe/Warsaw', 'Europe/Lisbon',
  'Atlantic/Azores', 'Atlantic/Madeira', 'Europe/Bucharest', 'Europe/Bratislava', 'Europe/Ljubljana',
  'Europe/Madrid', 'Africa/Ceuta', 'Atlantic/Canary', 'Europe/Stockholm', 'Europe/Oslo', 'Europe/Reykjavik',
  'Europe/Vaduz', 'Europe/Zurich', 'Europe/London', 'Europe/Belfast', 'Europe/Guernsey', 'Europe/Jersey',
  'Europe/Isle_of_Man', 'Europe/Gibraltar',
]);

const KEY = 'analytics-consent';

export type Consent = 'granted' | 'denied';

export function consentRequired(): boolean {
  try {
    return CONSENT_ZONES.has(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return true;
  }
}

export function storedConsent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent): void {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
  window.gtag?.('consent', 'update', { analytics_storage: value });
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  window.gtag?.('event', event, params);
}
