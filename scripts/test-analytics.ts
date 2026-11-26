/**
 * Task 5 (2026-11-26) — local verification harness for src/lib/analytics.ts.
 *
 * Runs the REAL analytics module under Node with stubbed browser globals and
 * a capturing gtag/dataLayer, and asserts the funnel contract:
 *  - attribution capture, first-touch preservation, referrer-domain-only
 *  - checkup_started: once per source page per session
 *  - checkup_submitted: deduped per submission id, no form contents in payload
 *  - sign_up (standard name): once per session, email never in payload
 *  - first_audit_viewed: once per audit id
 *  - subscription_started: never invents a value; deduped by transaction id
 *  - purchase: requires verified transaction id + value; deduped persistently
 *  - consent: explicit analytics opt-out suppresses all dispatch
 *  - global PII scan over every captured payload
 *
 * This proves client-side dispatch behaviour only. It does NOT prove GA4
 * ingestion — that requires GA4 DebugView/Realtime after deployment.
 *
 * Run: npx tsx scripts/test-analytics.ts
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
    pathname: '/checkup',
  },
  dataLayer: [] as any[],
  gtag: (...args: any[]) => {
    gtagCalls.push(args);
  },
};

(globalThis as any).window = fakeWindow;
(globalThis as any).document = {
  referrer: 'https://www.google.com/search?q=plumber+near+me',
  title: 'Free Local SEO Checkup',
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
function eventsNamed(name: string): any[] {
  return gtagCalls.filter((c) => c[0] === 'event' && c[1] === name).map((c) => c[2]);
}

async function main() {
  const ga = await import('../src/lib/analytics');

  console.log('\n[1] Attribution capture + first-touch preservation');
  const attr1 = ga.getUtmAttribution();
  check('utm_source captured from landing URL', attr1.utm_source === 'google');
  check('first_utm_source = google', attr1.first_utm_source === 'google');
  check('acquisition_landing_page is path only', attr1.acquisition_landing_page === '/checkup');
  check('referrer_domain is hostname only', attr1.referrer_domain === 'www.google.com');
  check('referrer query string NOT in attribution', !JSON.stringify(attr1).includes('plumber'));

  fakeWindow.location.search = '?utm_source=facebook&utm_medium=cpc&utm_campaign=retarget';
  ga.initUtmAttribution();
  const attr2 = ga.getUtmAttribution();
  check('first-touch preserved after second touch', attr2.first_utm_source === 'google');
  check('latest-touch updated', attr2.latest_utm_source === 'facebook');
  check('active touch = latest', attr2.utm_source === 'facebook');

  console.log('\n[2] checkup_started — once per source page per session');
  ga.trackCheckupStarted('/checkup');
  ga.trackCheckupStarted('/checkup');
  ga.trackCheckupStarted('/checkup');
  check('3 calls -> 1 event', eventsNamed('checkup_started').length === 1);
  ga.trackCheckupStarted('/');
  check('different source page fires separately', eventsNamed('checkup_started').length === 2);
  check('payload carries attribution', eventsNamed('checkup_started')[0]?.utm_source === 'facebook');

  console.log('\n[3] checkup_submitted — per-submission dedupe, no form contents');
  ga.trackCheckupSubmitted({ checkupId: 'chk_test1', category: 'Dental Clinic', sourcePage: '/checkup' });
  ga.trackCheckupSubmitted({ checkupId: 'chk_test1', category: 'Dental Clinic', sourcePage: '/checkup' });
  check('same submission id -> 1 event', eventsNamed('checkup_submitted').length === 1);
  ga.trackCheckupSubmitted({ checkupId: 'chk_test2', sourcePage: '/' });
  check('new submission id -> fires', eventsNamed('checkup_submitted').length === 2);
  const subPayload = JSON.stringify(eventsNamed('checkup_submitted')[0]);
  check('payload has checkup_id', subPayload.includes('chk_test1'));
  check(
    'payload has NO business_name / website / city / email',
    !/business_name|website|city|@/.test(subPayload)
  );

  console.log('\n[4] sign_up — standard GA4 name, once per session, email never sent');
  ga.trackSignupCompleted({ email: 'person@example.com', planTier: 'free', companyName: 'Acme Co', method: 'email' });
  ga.trackSignupCompleted({ email: 'person@example.com', planTier: 'free', companyName: 'Acme Co', method: 'email' });
  check('event name is sign_up', eventsNamed('sign_up').length === 1);
  check('no legacy signup_completed event', eventsNamed('signup_completed').length === 0);
  check('method param present', eventsNamed('sign_up')[0]?.method === 'email');
  check('email NOT in payload', !JSON.stringify(eventsNamed('sign_up')[0]).includes('person@example.com'));
  check('company name NOT in payload', !JSON.stringify(eventsNamed('sign_up')[0]).includes('Acme'));

  console.log('\n[5] first_audit_viewed — once per audit');
  ga.trackFirstAuditViewed({ auditId: 'chk_test1', overallScore: 72, sourcePage: '/checkup' });
  ga.trackFirstAuditViewed({ auditId: 'chk_test1', overallScore: 72, sourcePage: '/checkup' });
  check('same audit -> 1 event', eventsNamed('first_audit_viewed').length === 1);
  ga.trackFirstAuditViewed({ auditId: 'chk_test2', overallScore: 55, sourcePage: '/' });
  check('new audit -> fires', eventsNamed('first_audit_viewed').length === 2);

  console.log('\n[6] subscription_started — no invented value, txn dedupe');
  ga.trackSubscriptionStarted('pro', 'monthly');
  const subNoVal = eventsNamed('subscription_started')[0];
  check('fires without value when none verified', eventsNamed('subscription_started').length === 1);
  check('NO invented value/currency', subNoVal && !('value' in subNoVal) && !('currency' in subNoVal));
  ga.trackSubscriptionStarted('pro', 'monthly', 29, 'pay_123');
  ga.trackSubscriptionStarted('pro', 'monthly', 29, 'pay_123');
  check('same transaction id -> still 2 total', eventsNamed('subscription_started').length === 2);
  check('verified value passed through', eventsNamed('subscription_started')[1]?.value === 29);

  console.log('\n[7] purchase — verified-only, persistent dedupe');
  ga.trackPurchase({ transactionId: 'pay_123', value: 29, currency: 'USD', itemId: 'pro', itemName: 'LOCORA AI PRO PLAN (MONTHLY)' });
  ga.trackPurchase({ transactionId: 'pay_123', value: 29, currency: 'USD', itemId: 'pro' });
  check('same transaction -> 1 purchase', eventsNamed('purchase').length === 1);
  const pur = eventsNamed('purchase')[0];
  check('transaction_id from record', pur?.transaction_id === 'pay_123');
  check('value from record', pur?.value === 29);
  check('items structure present', Array.isArray(pur?.items) && pur.items[0]?.item_id === 'pro' && pur.items[0]?.price === 29);
  ga.trackPurchase({ value: 29 });
  ga.trackPurchase({ transactionId: 'pay_999' });
  ga.trackPurchase({});
  check('missing txn id or value -> never fires', eventsNamed('purchase').length === 1);

  console.log('\n[8] Consent — explicit analytics opt-out suppresses dispatch');
  const before = gtagCalls.length;
  localStore.setItem('locora_cookie_consent', JSON.stringify({ essential: true, analytics: false, functional: false, marketing: false }));
  ga.trackEvent('probe_event', { probe: 1 });
  check('opt-out -> no gtag call', gtagCalls.length === before);
  localStore.removeItem('locora_cookie_consent');
  ga.trackEvent('probe_event', { probe: 1 });
  check('no stored opt-out -> fires', gtagCalls.length === before + 1);

  console.log('\n[9] Global PII scan over every captured payload');
  const everything = JSON.stringify(gtagCalls);
  check('no email address anywhere', !/[\w.+-]+@[\w-]+\.[\w.]+/.test(everything));
  check('no referrer query terms anywhere', !everything.includes('plumber'));
  check('no company name anywhere', !everything.includes('Acme'));

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
