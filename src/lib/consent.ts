/**
 * Cookie-consent storage — the single source of truth for the consent record
 * shared by the cookie banner / preference center (CookieConsentBanner.tsx)
 * and the analytics gate (src/lib/analytics.ts reads the same key + shape).
 *
 * Task 6 (2026-11-26): extracted from CookieConsentBanner.tsx so the exact
 * read/write/derivation logic the UI uses can be exercised by
 * scripts/test-consent.ts. The record shape and storage key are unchanged
 * from the original inline implementation.
 *
 * Invariant: the preference dialog's toggle state is ALWAYS derived from the
 * stored record via toggleStateFromConsent() — on mount, on every reopen,
 * and immediately after every save (saveConsent in the banner re-derives its
 * state from the record writeCookieConsent() actually persisted). Displayed
 * state and stored state therefore cannot contradict each other.
 */

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  acceptedAt?: string;
}

/** The three user-controllable categories (essential is always active). */
export interface ConsentToggleState {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export const COOKIE_CONSENT_STORAGE_KEY = 'locora_cookie_consent';

/** What "Accept All" sets: every category the interface offers, accepted. */
export const ACCEPT_ALL_TOGGLES: ConsentToggleState = {
  analytics: true,
  functional: true,
  marketing: true,
};

/** What "Essential Only" / "Reject Optional" sets: all optional categories off. */
export const ESSENTIAL_ONLY_TOGGLES: ConsentToggleState = {
  analytics: false,
  functional: false,
  marketing: false,
};

/**
 * Pre-selection shown when no choice has been stored yet. These are the
 * defaults CookieConsentBanner has always used; they are display defaults
 * only — nothing is persisted (and no consent is implied) until the visitor
 * actively saves a choice.
 */
export const DEFAULT_TOGGLE_STATE: ConsentToggleState = {
  analytics: true,
  functional: true,
  marketing: false,
};

/** Reads and parses the stored consent record; null when absent or corrupt. */
export function readCookieConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as CookiePreferences;
  } catch {
    return null;
  }
}

/**
 * Persists a consent choice through the one write path every save action
 * uses. Essential is always forced on and the record is timestamped.
 * Returns the record exactly as stored, so callers can derive UI state
 * from what was actually persisted.
 */
export function writeCookieConsent(toggles: ConsentToggleState): CookiePreferences {
  const record: CookiePreferences = {
    essential: true, // Always required
    analytics: Boolean(toggles.analytics),
    functional: Boolean(toggles.functional),
    marketing: Boolean(toggles.marketing),
    acceptedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable (private mode / quota): the returned record still
    // reflects the visitor's choice for this page session.
  }
  return record;
}

/**
 * Derives the preference dialog's toggle state from a stored record (or the
 * pre-selection defaults when no choice exists). This is the ONLY derivation
 * the dialog uses — on mount, on reopen, and after a save.
 */
export function toggleStateFromConsent(record: CookiePreferences | null): ConsentToggleState {
  if (!record) return { ...DEFAULT_TOGGLE_STATE };
  return {
    analytics: record.analytics ?? DEFAULT_TOGGLE_STATE.analytics,
    functional: record.functional ?? DEFAULT_TOGGLE_STATE.functional,
    marketing: record.marketing ?? DEFAULT_TOGGLE_STATE.marketing,
  };
}
