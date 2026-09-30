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
}

const STORAGE_KEY_FIRST = 'locora_utm_first';
const STORAGE_KEY_LATEST = 'locora_utm_latest';
const DEDUPE_WINDOW_MS = 1200;

// In-memory deduplication cache
const recentEventsCache = new Map<string, number>();

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
      lowerKey.includes('token')
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
 * Triggered when a visitor begins interacting with the checkup form on /checkup.
 */
export function trackCheckupStarted(sourcePage: string = '/checkup', details?: Record<string, any>): void {
  trackEvent(
    'checkup_started',
    {
      source_page: sourcePage,
      form_name: 'local_visibility_checkup',
      ...details,
    },
    'checkup_started_session'
  );
}

/**
 * 3. checkup_submitted (GA4 Key Event)
 * Triggered only after successful validation and submission of the checkup form.
 */
export function trackCheckupSubmitted(details: {
  businessName?: string;
  website?: string;
  city?: string;
  category?: string;
  [key: string]: any;
}): void {
  trackEvent(
    'checkup_submitted',
    {
      business_name: details.businessName,
      website: details.website,
      city: details.city,
      category: details.category,
      form_name: 'local_visibility_checkup',
    },
    `checkup_submitted_${details.website || details.businessName || Date.now()}`
  );
}

/**
 * 4. checkup_result_viewed
 * Triggered when the live checkup analysis results are actually displayed.
 */
export function trackCheckupResultViewed(details: {
  overallScore?: number;
  businessName?: string;
  website?: string;
  [key: string]: any;
}): void {
  trackEvent(
    'checkup_result_viewed',
    {
      overall_score: details.overallScore,
      business_name: details.businessName,
      website: details.website,
    },
    `checkup_result_viewed_${details.website || ''}_${details.overallScore || ''}`
  );
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
 * 6. signup_completed (GA4 Key Event)
 * Triggered on successful user registration / signup completion.
 */
export function trackSignupCompleted(user: {
  email?: string;
  planTier?: string;
  companyName?: string;
  method?: string;
}): void {
  trackEvent(
    'signup_completed',
    {
      method: user.method || 'email',
      plan_tier: user.planTier || 'free',
      has_company: Boolean(user.companyName),
    },
    `signup_completed_${user.email || Date.now()}`
  );
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
 * Triggered when checkout flow / modal opens for a selected plan.
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
 * Triggered on successful subscription or verified payment clearance.
 */
export function trackSubscriptionStarted(planTier: string, billingCycle?: string, value?: number): void {
  trackEvent(
    'subscription_started',
    {
      plan_tier: planTier,
      billing_cycle: billingCycle || 'monthly',
      value: value || (planTier === 'agency' ? (billingCycle === 'yearly' ? 790 : 99) : (billingCycle === 'yearly' ? 290 : 29)),
      currency: 'USD',
    },
    `subscription_started_${planTier}_${Date.now()}`
  );
}

// Automatically capture UTMs upon script initialization in browser environment
if (typeof window !== 'undefined') {
  initUtmAttribution();
}
