/**
 * Locora AI - Production GA4 Analytics & UTM Attribution Engine
 *
 * Implements a measurable acquisition funnel:
 * Marketing Traffic (UTMs) -> /checkup -> Signup -> Product Usage -> Subscription
 *
 * Requirements:
 * - First-touch and latest-touch UTM persistence (localStorage + sessionStorage)
 * - Safe parameter handling (no passwords, payment details, or personal data)
 * - Anti-duplication guards for React re-renders
 * - 15 dedicated GA4 event helpers compatible with GA4 Key Events
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface UtmParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface StoredTouchRecord extends UtmParameters {
  landing_page: string;
  referrer: string;
  timestamp: string;
}

export interface UtmAttributionPayload {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  first_utm_source?: string;
  first_utm_medium?: string;
  first_utm_campaign?: string;
  first_utm_content?: string;
  first_utm_term?: string;
  latest_utm_source?: string;
  latest_utm_medium?: string;
  latest_utm_campaign?: string;
  latest_utm_content?: string;
  latest_utm_term?: string;
  acquisition_landing_page?: string;
  referrer_domain?: string;
}

const STORAGE_KEY_FIRST = 'locora_utm_first';
const STORAGE_KEY_LATEST = 'locora_utm_latest';
const DEDUPE_WINDOW_MS = 1200;

// Task 5 (2026-11-26): durable dedupe registries + consent gate.
// - Session once-registry: funnel events that must fire at most once per
//   browser session / per business object (checkup session, submission id,
//   audit id, signup) regardless of React re-renders or page refreshes.
// - Persistent transaction registry: purchase / subscription events deduped
//   by verified transaction id across sessions (payment-return revisits).
// - Consent: the cookie-consent banner stores an explicit analytics opt-out
//   under 'locora_cookie_consent'; an explicit analytics:false choice must
//   suppress GA dispatch entirely (previously the banner never gated events).
const CONSENT_STORAGE_KEY = 'locora_cookie_consent';
const SESSION_ONCE_KEY = 'locora_ga_once_keys';
const TXN_REGISTRY_KEY = 'locora_ga_txn_keys';
const TXN_REGISTRY_MAX = 100;

// In-memory deduplication cache
const recentEventsCache = new Map<string, number>();

/**
 * True only when the visitor has explicitly saved cookie preferences with
 * analytics turned OFF. No stored choice (banner not yet answered) keeps the
 * historical behaviour; an explicit opt-out always wins.
 */
function hasAnalyticsOptOut(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return false;
    const prefs = JSON.parse(raw);
    return Boolean(prefs) && prefs.analytics === false;
  } catch {
    return false;
  }
}

function readKeyRegistry(storage: Storage, key: string): string[] {
  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Claims `id` in a storage-backed registry. Returns true the first time an id
 * is claimed (caller should fire), false on every subsequent claim (caller
 * must suppress). Falls back to an in-memory set when storage is unavailable.
 */
const memoryRegistries = new Map<string, Set<string>>();
function claimKey(storageKind: 'session' | 'local', registryKey: string, id: string): boolean {
  const memoryKey = `${storageKind}:${registryKey}`;
  let memorySet = memoryRegistries.get(memoryKey);
  if (!memorySet) {
    memorySet = new Set<string>();
    memoryRegistries.set(memoryKey, memorySet);
  }
  if (memorySet.has(id)) return false;

  try {
    const storage = storageKind === 'session' ? sessionStorage : localStorage;
    const existing = readKeyRegistry(storage, registryKey);
    if (existing.includes(id)) {
      memorySet.add(id);
      return false;
    }
    existing.push(id);
    const trimmed = existing.slice(-TXN_REGISTRY_MAX);
    storage.setItem(registryKey, JSON.stringify(trimmed));
  } catch {
    // Storage unavailable (private mode / SSR): in-memory claim still applies.
  }
  memorySet.add(id);
  return true;
}

/** Fire-at-most-once per browser session for the given funnel key. */
function claimSessionOnce(id: string): boolean {
  return claimKey('session', SESSION_ONCE_KEY, id);
}

/** Fire-at-most-once ever (per browser profile) for a verified transaction id. */
function claimTransactionOnce(id: string): boolean {
  return claimKey('local', TXN_REGISTRY_KEY, id);
}

/**
 * Parses UTM parameters from the current window location search string.
 */
function parseCurrentUtms(): UtmParameters | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source')?.trim();
    const utm_medium = params.get('utm_medium')?.trim();
    const utm_campaign = params.get('utm_campaign')?.trim();
    const utm_content = params.get('utm_content')?.trim();
    const utm_term = params.get('utm_term')?.trim();

    if (utm_source || utm_medium || utm_campaign || utm_content || utm_term) {
      return {
        utm_source: utm_source || undefined,
        utm_medium: utm_medium || undefined,
        utm_campaign: utm_campaign || undefined,
        utm_content: utm_content || undefined,
        utm_term: utm_term || undefined,
      };
    }
  } catch (err) {
    console.warn('[Analytics] Error parsing UTMs:', err);
  }
  return null;
}

/**
 * Captures and persists first-touch and latest-touch attribution without breaking query parameters.
 */
export function initUtmAttribution(): void {
  if (typeof window === 'undefined') return;

  const currentUtms = parseCurrentUtms();
  if (!currentUtms) return;

  const touchRecord: StoredTouchRecord = {
    ...currentUtms,
    landing_page: window.location.pathname,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    timestamp: new Date().toISOString(),
  };

  const payloadStr = JSON.stringify(touchRecord);

  try {
    // 1. First-Touch Attribution: Preserve earliest original source
    const existingFirst = localStorage.getItem(STORAGE_KEY_FIRST) || sessionStorage.getItem(STORAGE_KEY_FIRST);
    if (!existingFirst) {
      localStorage.setItem(STORAGE_KEY_FIRST, payloadStr);
      sessionStorage.setItem(STORAGE_KEY_FIRST, payloadStr);
    }

    // 2. Latest-Touch Attribution: Always update to most recent campaign touchpoint
    localStorage.setItem(STORAGE_KEY_LATEST, payloadStr);
    sessionStorage.setItem(STORAGE_KEY_LATEST, payloadStr);
  } catch (err) {
    console.warn('[Analytics] Storage write restricted:', err);
  }
}

/**
 * Returns available first-touch and latest-touch attribution parameters.
 */
export function getUtmAttribution(): UtmAttributionPayload {
  if (typeof window === 'undefined') return {};

  let first: StoredTouchRecord | null = null;
  let latest: StoredTouchRecord | null = null;

  try {
    const firstRaw = localStorage.getItem(STORAGE_KEY_FIRST) || sessionStorage.getItem(STORAGE_KEY_FIRST);
    if (firstRaw) first = JSON.parse(firstRaw);

    const latestRaw = localStorage.getItem(STORAGE_KEY_LATEST) || sessionStorage.getItem(STORAGE_KEY_LATEST);
    if (latestRaw) latest = JSON.parse(latestRaw);
  } catch (err) {
    console.warn('[Analytics] Error reading stored UTMs:', err);
  }

  // Active touch is latest touch if present, falling back to first touch
  const active = latest || first;

  const payload: UtmAttributionPayload = {};

  if (active?.utm_source) payload.utm_source = active.utm_source;
  if (active?.utm_medium) payload.utm_medium = active.utm_medium;
  if (active?.utm_campaign) payload.utm_campaign = active.utm_campaign;
  if (active?.utm_content) payload.utm_content = active.utm_content;
  if (active?.utm_term) payload.utm_term = active.utm_term;

  if (first?.utm_source) payload.first_utm_source = first.utm_source;
  if (first?.utm_medium) payload.first_utm_medium = first.utm_medium;
  if (first?.utm_campaign) payload.first_utm_campaign = first.utm_campaign;
  if (first?.utm_content) payload.first_utm_content = first.utm_content;
  if (first?.utm_term) payload.first_utm_term = first.utm_term;
  if (first?.landing_page) payload.acquisition_landing_page = first.landing_page;

  if (latest?.utm_source) payload.latest_utm_source = latest.utm_source;
  if (latest?.utm_medium) payload.latest_utm_medium = latest.utm_medium;
  if (latest?.utm_campaign) payload.latest_utm_campaign = latest.utm_campaign;
  if (latest?.utm_content) payload.latest_utm_content = latest.utm_content;
  if (latest?.utm_term) payload.latest_utm_term = latest.utm_term;

  // Referrer: hostname ONLY. The full referrer URL is never sent — it can
  // carry query strings with personal data (search terms, tokens, emails).
  const rawReferrer = first?.referrer || latest?.referrer;
  if (rawReferrer) {
    try {
      const host = new URL(rawReferrer).hostname;
      if (host) payload.referrer_domain = host;
    } catch {
      // Unparseable referrer: omit rather than send raw.
    }
  }

  return payload;
}

/**
 * Core GA4 event dispatcher with automatic deduplication, page context, and UTM merging.
 */
export function trackEvent(
  eventName: string,
  eventParams: Record<string, any> = {},
  dedupeKey?: string
): void {
  if (typeof window === 'undefined') return;

  // Consent gate: an explicit analytics opt-out saved via the cookie-consent
  // banner suppresses all GA dispatch (gtag + dataLayer).
  if (hasAnalyticsOptOut()) return;

  // Deduplication check
  if (dedupeKey) {
    const now = Date.now();
    const lastFired = recentEventsCache.get(dedupeKey);
    if (lastFired && now - lastFired < DEDUPE_WINDOW_MS) {
      return; // Suppress duplicate event caused by quick re-renders
    }
    recentEventsCache.set(dedupeKey, now);
  }

  const attribution = getUtmAttribution();

  // Clean parameters (omit sensitive fields or raw credentials)
  const cleanParams: Record<string, any> = {
    page_path: window.location.pathname,
    page_title: typeof document !== 'undefined' ? document.title : '',
    ...attribution,
  };

  for (const [key, value] of Object.entries(eventParams)) {
    if (value === undefined || value === null) continue;
    // Omit sensitive parameter names
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('card') ||
      lowerKey.includes('token') ||
      lowerKey.includes('email') ||
      lowerKey.includes('phone')
    ) {
      continue;
    }
    cleanParams[key] = value;
  }

  // 1. Dispatch via window.gtag if available
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, cleanParams);
    } catch (err) {
      console.warn(`[Analytics] gtag dispatch failed for ${eventName}:`, err);
    }
  }

  // 2. Also push to dataLayer for GTM / tag continuity
  if (Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({
        event: eventName,
        ...cleanParams,
      });
    } catch (err) {
      console.warn(`[Analytics] dataLayer push failed for ${eventName}:`, err);
    }
  }
}

// ============================================================================
// 15 SPECIFIC GA4 EVENT HELPERS
// ============================================================================

/**
 * 1. cta_click
 * Triggered on primary and strategic call-to-action clicks.
 */
export function trackCtaClick(
  ctaName: string,
  sourcePage?: string,
  targetDestination?: string,
  extra?: Record<string, any>
): void {
  trackEvent(
    'cta_click',
    {
      cta_name: ctaName,
      source_page: sourcePage || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      destination: targetDestination,
      ...extra,
    },
    `cta_click_${ctaName}_${targetDestination || ''}`
  );
}

/**
 * 2. checkup_started
 * Triggered when a visitor GENUINELY begins the checkup workflow: the first
 * form interaction in which they have actually entered content (callers fire
 * this from change handlers once a field holds a value — never on mere focus
 * / field touch). Fires at most once per source page per browser session,
 * enforced here via a sessionStorage-backed claim so re-renders, remounts
 * and page refreshes cannot re-fire it. Funnel-analysis event (not a key
 * event). Callers must not pass form contents (names, URLs, emails).
 */
export function trackCheckupStarted(sourcePage: string = '/checkup', details?: Record<string, any>): void {
  if (!claimSessionOnce(`checkup_started:${sourcePage}`)) return;
  trackEvent('checkup_started', {
    source_page: sourcePage,
    form_name: 'local_visibility_checkup',
    ...details,
  });
}

/**
 * 3. checkup_submitted (GA4 Key Event)
 * MUST be called only after a checkup submission has succeeded and been
 * accepted by the application (successful API response + result produced).
 * Never call on click, validation failure, or API error. Deduped per
 * submission via the caller-supplied checkupId (generated at the success
 * point and stored with the pending-checkup record). Payload deliberately
 * contains NO form contents: no business name, no website, no city, no
 * email — only the controlled-vocabulary category and the submission id.
 */
export function trackCheckupSubmitted(details: {
  checkupId?: string;
  category?: string;
  sourcePage?: string;
}): void {
  if (details.checkupId) {
    if (!claimSessionOnce(`checkup_submitted:${details.checkupId}`)) return;
  }
  trackEvent('checkup_submitted', {
    form_name: 'local_visibility_checkup',
    category: details.category,
    source_page: details.sourcePage,
    checkup_id: details.checkupId,
  });
}

/**
 * 4. checkup_result_viewed (legacy)
 * Fired from the checkup success handler at the moment a result is produced.
 * Kept for continuity; the canonical "user actually saw the result" funnel
 * event is first_audit_viewed below. Payload carries no form contents.
 */
export function trackCheckupResultViewed(details: {
  overallScore?: number;
  auditId?: string;
}): void {
  trackEvent(
    'checkup_result_viewed',
    {
      overall_score: details.overallScore,
    },
    details.auditId ? `checkup_result_viewed_${details.auditId}` : undefined
  );
}

/**
 * 4b. first_audit_viewed
 * Triggered when a COMPLETED audit/checkup result is actually rendered for
 * the user (result state displayed — not loading, incomplete, or failed).
 * Fires at most once per audit, keyed by the audit/checkup id, so returning
 * to a session-restored result in the same session does not re-fire, and a
 * genuinely new audit does.
 */
export function trackFirstAuditViewed(details: {
  auditId: string;
  overallScore?: number;
  sourcePage?: string;
}): void {
  if (!details.auditId) return;
  if (!claimSessionOnce(`first_audit_viewed:${details.auditId}`)) return;
  trackEvent('first_audit_viewed', {
    audit_id: details.auditId,
    overall_score: details.overallScore,
    source_page: details.sourcePage,
  });
}

/**
 * 5. signup_started
 * Triggered when user opens the signup dialog or starts the signup flow.
 */
export function trackSignupStarted(sourcePage?: string, method: string = 'email'): void {
  trackEvent(
    'signup_started',
    {
      source_page: sourcePage || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      method,
    },
    'signup_started_session'
  );
}

/**
 * 6. sign_up (GA4 Key Event — standard GA4 event name)
 * Triggered ONLY on successful account registration completion (callers fire
 * after the registration API confirms the new account; never on form open,
 * button click, or login). Emits the GA4-recommended `sign_up` event; the
 * former non-standard `signup_completed` name was never a configured key
 * event and is superseded by this. The user's email is accepted in the
 * argument for caller compatibility but is NEVER sent to GA4 and is no
 * longer used as a dedupe key — dedupe is a session-scoped once-claim.
 */
export function trackSignupCompleted(user: {
  email?: string;
  planTier?: string;
  companyName?: string;
  method?: string;
}): void {
  if (!claimSessionOnce('sign_up')) return;
  trackEvent('sign_up', {
    method: user.method || 'email',
    plan_tier: user.planTier || 'free',
    has_company: Boolean(user.companyName),
  });
}

/**
 * 7. business_added (GA4 Key Event)
 * Triggered when a client or business workspace is successfully added.
 */
export function trackBusinessAdded(business: {
  id: string;
  name?: string;
  industry?: string;
}): void {
  trackEvent(
    'business_added',
    {
      business_id: business.id,
      business_name: business.name,
      industry: business.industry,
    },
    `business_added_${business.id}`
  );
}

/**
 * 8. audit_started
 * Triggered when a website or SEO audit actually begins execution.
 */
export function trackAuditStarted(targetUrl: string, context: string = 'website_review'): void {
  trackEvent(
    'audit_started',
    {
      target_url: targetUrl,
      audit_context: context,
    },
    `audit_started_${targetUrl}`
  );
}

/**
 * 9. audit_completed (GA4 Key Event)
 * Triggered when an audit finishes successfully with real scores.
 */
export function trackAuditCompleted(targetUrl: string, score?: number, summary?: Record<string, any>): void {
  trackEvent(
    'audit_completed',
    {
      target_url: targetUrl,
      overall_score: score,
      ...summary,
    },
    `audit_completed_${targetUrl}_${score || ''}`
  );
}

/**
 * 10. visibility_check
 * Triggered when a Google Maps / local rank visibility check actually runs.
 */
export function trackVisibilityCheck(businessId?: string, businessName?: string): void {
  trackEvent(
    'visibility_check',
    {
      business_id: businessId,
      business_name: businessName,
    },
    `visibility_check_${businessId || 'active'}_${Date.now()}`
  );
}

/**
 * 11. ai_chat_started
 * Triggered when user prompts the AI Manager copilot.
 */
export function trackAiChatStarted(topicOrPrompt?: string, mode?: string): void {
  // Truncate query to avoid PII or excessive parameter lengths
  const sanitizedTopic = topicOrPrompt ? topicOrPrompt.substring(0, 80) : 'general';
  trackEvent(
    'ai_chat_started',
    {
      topic: sanitizedTopic,
      chat_mode: mode || 'ai_manager',
    },
    `ai_chat_${Date.now()}`
  );
}

/**
 * 12. proposal_generated
 * Triggered when a digital proposal is successfully generated.
 */
export function trackProposalGenerated(proposalId?: string, clientName?: string, value?: number): void {
  trackEvent(
    'proposal_generated',
    {
      proposal_id: proposalId,
      client_name: clientName,
      value: value || 0,
    },
    `proposal_generated_${proposalId || Date.now()}`
  );
}

/**
 * 13. pricing_viewed
 * Triggered when pricing options or plan matrix are viewed.
 */
export function trackPricingViewed(planSelected?: string, sourcePage?: string): void {
  trackEvent(
    'pricing_viewed',
    {
      plan_selected: planSelected || 'all',
      source_page: sourcePage || (typeof window !== 'undefined' ? window.location.pathname : '/pricing'),
    },
    `pricing_viewed_${planSelected || 'all'}`
  );
}

/**
 * 14. checkout_started
 * Fired from CheckoutModal when the user submits the checkout form to
 * request a Whop checkout session (a checkout-initiation CLICK action — it
 * does not mean a session was created, paid, or a subscription exists).
 * The hosted Whop checkout itself happens off-site and has no client event.
 */
export function trackCheckoutStarted(planTier: string, billingCycle?: string): void {
  trackEvent(
    'checkout_started',
    {
      plan_tier: planTier,
      billing_cycle: billingCycle || 'monthly',
      currency: 'USD',
    },
    `checkout_started_${planTier}_${billingCycle || 'monthly'}`
  );
}

/**
 * 15. subscription_started (GA4 Key Event)
 * Fired ONLY at the verified subscription-activation point: the payment
 * return flow after the backend (/api/whop/verify-session) returns a
 * server-issued invoice for the subscription. Never fire from plan-state
 * changes, checkout clicks, or unverified fallbacks. `value` is taken
 * verbatim from the server invoice — this helper NEVER invents a price;
 * when no verified value is supplied the event fires without value/currency
 * rather than with a fabricated amount. Deduped by verified transaction id
 * (persistent registry) when provided.
 */
export function trackSubscriptionStarted(
  planTier: string,
  billingCycle?: string,
  value?: number,
  transactionId?: string
): void {
  if (transactionId) {
    if (!claimTransactionOnce(`sub:${transactionId}`)) return;
  }
  const hasVerifiedValue = typeof value === 'number' && Number.isFinite(value) && value >= 0;
  trackEvent('subscription_started', {
    plan_tier: planTier,
    billing_cycle: billingCycle || 'monthly',
    ...(hasVerifiedValue ? { value, currency: 'USD' } : {}),
    ...(transactionId ? { transaction_id: transactionId } : {}),
  });
}

/**
 * 16. purchase (GA4 Key Event — GA4 recommended ecommerce event)
 * Fired ONLY from a verified completed-transaction state: the payment
 * return flow when the backend returns a server-issued invoice receipt.
 * transaction_id and value come verbatim from that invoice record — never
 * invented, never taken from URL parameters or list prices. Requires both a
 * transaction id and a finite value; otherwise it does not fire. Deduped
 * persistently by transaction_id so payment-return revisits, refreshes and
 * repeat logins cannot double-count revenue.
 */
export function trackPurchase(details: {
  transactionId?: string;
  value?: number;
  currency?: string;
  itemId?: string;
  itemName?: string;
}): void {
  const txnId = (details.transactionId || '').trim();
  const hasValue = typeof details.value === 'number' && Number.isFinite(details.value) && details.value >= 0;
  if (!txnId || !hasValue) return;
  if (!claimTransactionOnce(`purchase:${txnId}`)) return;
  trackEvent('purchase', {
    transaction_id: txnId,
    currency: details.currency || 'USD',
    value: details.value,
    items: [
      {
        item_id: details.itemId || 'subscription',
        item_name: details.itemName || 'LocoraAI Subscription',
        price: details.value,
        quantity: 1,
      },
    ],
  });
}

// Automatically capture UTMs upon script initialization in browser environment
if (typeof window !== 'undefined') {
  initUtmAttribution();
}
