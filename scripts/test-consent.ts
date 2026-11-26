/**
 * Task 6 (2026-11-26) — local verification harness for the cookie-consent
 * module (src/lib/consent.ts) and its integration with the analytics gate
 * (src/lib/analytics.ts).
 *
 * Exercises the ACTUAL functions CookieConsentBanner.tsx uses:
 *   - writeCookieConsent()  — the single write path behind Accept All,
 *     Essential Only / Reject Optional, and Save Preferences.
 *   - readCookieConsent()   — what a (re)opened dialog reads from storage.
 *   - toggleStateFromConsent() — the derivation the dialog uses to set its
 *     toggle state on mount, on reopen, and immediately after a save.
 *
 * A "simulated reload" / "reopened dialog" is a fresh readCookieConsent() +
 * toggleStateFromConsent() against the same storage: the consent module is
 * stateless, so this is exactly what the component does after a real reload
 * or reopen — there is no second implementation to drift from.
 *
 * Scenarios (per the Task 6 brief):
 *   A. Accept All from clean state persists + gate allows dispatch.
 *   B. Reject All from clean state persists + gate suppresses dispatch.
 *   C. Granular selections persist exactly.
 *   D. Changing previously saved preferences persists.
 *   E. Consistency invariant: after EVERY action, post-save UI state ==
 *      reopened-dialog state == stored record. Plus Task 5 gate semantics
 *      (no record -> fires; corrupt record -> treated as no choice).
 *
 * This proves storage/gate behaviour under Node stubs only. It does NOT
 * prove the live browser UX — Scenarios A–E must be re-run in a real
 * browser after deployment (see task6-implementation-report.md).
 *
 * Run: npx tsx scripts/test-consent.ts
 */

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string): string | null {
    return this.map.has(k) ? (this.map.get(k) as string) : null;
  }
  setItem(k: string, v: string): void {
    this.map.set(k, String(v));
  }
  removeItem(k: string): void {
    this.map.delete(k);
  }
  clear(): void {
    this.map.clear();
  }
}

const gtagCalls: any[][] = [];
const localStore = new MemoryStorage();
const sessionStore = new MemoryStorage();

const fakeWindow: any = {
  location: {
    search: '?utm_source=google&utm_medium=organic&utm_campaign=launch',
    pathname: '/',
  },
  dataLayer: [] as any[],
  gtag: (...args: any[]) => {
    gtagCalls.push(args);
  },
};

(globalThis as any).window = fakeWindow;
(globalThis as any).document = {
  referrer: '',
  title: 'LocoraAI',
};
(globalThis as any).localStorage = localStore;
(globalThis as any).sessionStorage = sessionStore;

let passed = 0;
let failed = 0;
function check(label: string, cond: boolean, extra?: string) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}${extra ? ` — ${extra}` : ''}`);
  }
}

const KEY = 'locora_cookie_consent';
type Toggles = { analytics: boolean; functional: boolean; marketing: boolean };
const sameToggles = (a: Toggles, b: Toggles) =>
  a.analytics === b.analytics && a.functional === b.functional && a.marketing === b.marketing;
function rawRecord(): any {
  const raw = localStore.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
/** What a reopened dialog (or a reloaded page) would display: fresh read + derivation. */
function reopenedDialogState(consent: any): Toggles {
  return consent.toggleStateFromConsent(consent.readCookieConsent());
}

async function main() {
  const consent = await import('../src/lib/consent');
  const ga = await import('../src/lib/analytics');

  console.log('\n[A] Accept All — from clean state');
  localStore.clear();
  check('clean state: no stored record', consent.readCookieConsent() === null);
  const returnedA = consent.writeCookieConsent(consent.ACCEPT_ALL_TOGGLES);
  const rawA = rawRecord();
  check('record persisted under locora_cookie_consent', rawA !== null);
  check(
    'stored: analytics/functional/marketing all true',
    rawA.analytics === true && rawA.functional === true && rawA.marketing === true
  );
  check('stored: essential forced true', rawA.essential === true);
  check('stored: acceptedAt timestamp present', typeof rawA.acceptedAt === 'string' && rawA.acceptedAt.length > 0);
  check(
    'returned record == stored record',
    returnedA.analytics === rawA.analytics &&
      returnedA.functional === rawA.functional &&
      returnedA.marketing === rawA.marketing &&
      returnedA.acceptedAt === rawA.acceptedAt
  );
  check(
    'post-save UI state (derived from returned record) = all accepted',
    sameToggles(consent.toggleStateFromConsent(returnedA), consent.ACCEPT_ALL_TOGGLES)
  );
  check(
    'reopened dialog / simulated reload shows all accepted',
    sameToggles(reopenedDialogState(consent), consent.ACCEPT_ALL_TOGGLES)
  );
  const beforeA = gtagCalls.length;
  ga.trackEvent('consent_probe_accept_all', { probe: 'A' });
  check('GA4 gate: dispatch allowed after Accept All', gtagCalls.length === beforeA + 1);

  console.log('\n[B] Reject All (Essential Only) — from clean state');
  localStore.clear();
  consent.writeCookieConsent(consent.ESSENTIAL_ONLY_TOGGLES);
  const rawB = rawRecord();
  check(
    'stored: analytics/functional/marketing all false',
    rawB.analytics === false && rawB.functional === false && rawB.marketing === false
  );
  check('stored: essential still true', rawB.essential === true);
  check(
    'reopened dialog / simulated reload shows all optional off',
    sameToggles(reopenedDialogState(consent), consent.ESSENTIAL_ONLY_TOGGLES)
  );
  const beforeB = gtagCalls.length;
  ga.trackEvent('consent_probe_reject_all', { probe: 'B' });
  check('GA4 gate: dispatch suppressed after Reject All', gtagCalls.length === beforeB);

  console.log('\n[C] Granular preferences — exact selections persist');
  localStore.clear();
  consent.writeCookieConsent({ analytics: true, functional: false, marketing: false });
  const rawC = rawRecord();
  check(
    'stored exactly {analytics:true, functional:false, marketing:false}',
    rawC.analytics === true && rawC.functional === false && rawC.marketing === false
  );
  check(
    'reopened dialog shows exactly that selection',
    sameToggles(reopenedDialogState(consent), { analytics: true, functional: false, marketing: false })
  );
  consent.writeCookieConsent({ analytics: false, functional: true, marketing: true });
  check(
    'second granular combo {false,true,true} persists exactly (no category cross-talk)',
    sameToggles(reopenedDialogState(consent), { analytics: false, functional: true, marketing: true })
  );
  const beforeC = gtagCalls.length;
  ga.trackEvent('consent_probe_granular_optout', { probe: 'C' });
  check('GA4 gate: analytics:false in granular save still suppresses dispatch', gtagCalls.length === beforeC);

  console.log('\n[D] Changing previously saved preferences');
  localStore.clear();
  consent.writeCookieConsent(consent.ACCEPT_ALL_TOGGLES);
  check(
    'starts accepted: reopened dialog shows all on',
    sameToggles(reopenedDialogState(consent), consent.ACCEPT_ALL_TOGGLES)
  );
  // Visitor reopens, switches marketing off, clicks Save Preferences.
  consent.writeCookieConsent({ analytics: true, functional: true, marketing: false });
  const rawD = rawRecord();
  check('stored record reflects the change (marketing:false)', rawD.marketing === false && rawD.analytics === true);
  check(
    'after reload, reopened dialog shows the new state',
    sameToggles(reopenedDialogState(consent), { analytics: true, functional: true, marketing: false })
  );
  // And the reverse direction: rejection later replaced by full acceptance.
  consent.writeCookieConsent(consent.ESSENTIAL_ONLY_TOGGLES);
  consent.writeCookieConsent(consent.ACCEPT_ALL_TOGGLES);
  check(
    'reject -> accept change also persists',
    sameToggles(reopenedDialogState(consent), consent.ACCEPT_ALL_TOGGLES)
  );

  console.log('\n[E] Consistency invariant — UI state can never contradict storage');
  const actions: Array<[string, Toggles]> = [
    ['Accept All', consent.ACCEPT_ALL_TOGGLES],
    ['Reject All / Essential Only', consent.ESSENTIAL_ONLY_TOGGLES],
    ['granular {true,false,false}', { analytics: true, functional: false, marketing: false }],
    ['granular {false,true,false}', { analytics: false, functional: true, marketing: false }],
    ['granular {false,false,true}', { analytics: false, functional: false, marketing: true }],
    ['granular {true,true,false}', { analytics: true, functional: true, marketing: false }],
  ];
  for (const [label, toggles] of actions) {
    localStore.clear();
    const returned = consent.writeCookieConsent(toggles);
    const postSaveUi = consent.toggleStateFromConsent(returned);
    const reopened = reopenedDialogState(consent);
    check(
      `${label}: post-save UI == reopened dialog == stored`,
      sameToggles(postSaveUi, toggles) && sameToggles(reopened, toggles)
    );
  }
  console.log('\n[E2] Task 5 gate semantics preserved');
  localStore.clear();
  const beforeE = gtagCalls.length;
  ga.trackEvent('consent_probe_no_record', { probe: 'E' });
  check('no stored record -> dispatch allowed (no suppression)', gtagCalls.length === beforeE + 1);
  localStore.setItem(KEY, '{corrupt json');
  check('corrupt record -> readCookieConsent() returns null (treated as no choice)', consent.readCookieConsent() === null);
  check(
    'corrupt record -> dialog falls back to pre-selection defaults',
    sameToggles(consent.toggleStateFromConsent(null), { analytics: true, functional: true, marketing: false })
  );
  const beforeE2 = gtagCalls.length;
  ga.trackEvent('consent_probe_corrupt', { probe: 'E2' });
  check('corrupt record -> gate does not suppress', gtagCalls.length === beforeE2 + 1);
  localStore.clear();

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
