/**
 * PLAN-BASED PROVIDER ACCESS & DATA INTEGRITY ENGINE
 * 
 * Strict Provider Access Rules by Subscription Tier:
 * 
 * FREE:
 * - Google Business Profile (GBP / Places)
 * - Google Search Console (GSC)
 * - Google Analytics 4 (GA4)
 * - Website Crawler (Technical SEO / PageSpeed Insights)
 * - Basic AI (Gemini basic suggestions & action drafts)
 * - Limited Monitoring (Single business, manual sync)
 * 
 * PRO:
 * - All Free sources
 * - Plus Expanded Monitoring (multi-location, scheduled health checks, competitor alerts)
 * - Plus Low-Cost SERP usage where configured (Serper / SerpApi live rank checks)
 * 
 * AGENCY ELITE:
 * - All Pro sources
 * - Plus DataForSEO (deep domain rank overview, keyword volume, live backlinks, AI overview citations)
 * - Plus Advanced SERP & Local tracking (geo-grid coordinate tracking, Map 3-pack radii)
 * - Plus Bulk Client Processing (multi-client batch analysis, white-label client PDF reporting)
 * 
 * STRICT DATA INTEGRITY POLICY:
 * If a premium provider is unavailable:
 * Show the feature as unavailable / upgrade / connect provider.
 * NEVER use fake data to make the premium feature appear functional.
 */

export type PlanTier = 'free' | 'pro' | 'agency' | 'agency_elite' | 'elite';

export type NormalizedPlanTier = 'free' | 'pro' | 'agency_elite';

export type ProviderFeatureId =
  // Free Sources
  | 'google_business_profile'
  | 'google_places'
  | 'google_search_console'
  | 'google_analytics_4'
  | 'website_crawler'
  | 'basic_ai'
  | 'limited_monitoring'
  // Pro Sources
  | 'expanded_monitoring'
  | 'low_cost_serp'
  | 'competitor_monitoring'
  // Agency Elite Sources
  | 'dataforseo'
  | 'advanced_serp'

  | 'bulk_client_processing';

export interface ProviderFeatureDefinition {
  id: ProviderFeatureId;
  name: string;
  category: 'core' | 'monitoring' | 'serp' | 'enterprise';
  requiredPlan: NormalizedPlanTier;
  requiredPlanLabel: string;
  providerName: string;
  providerKey: string;
  description: string;
  requiresApiKey: boolean;
  configKeyLabel?: string;
  upgradeBenefit: string;
}

export const PROVIDER_FEATURE_REGISTRY: Record<ProviderFeatureId, ProviderFeatureDefinition> = {
  // FREE TIER SOURCES
  google_business_profile: {
    id: 'google_business_profile',
    name: 'Google Business Profile',
    category: 'core',
    requiredPlan: 'free',
    requiredPlanLabel: 'Free Plan',
    providerName: 'Google Business Profile API',
    providerKey: 'google_gbp',
    description: 'Real-time synchronization of business hours, categories, reviews, and star ratings.',
    requiresApiKey: false,
    upgradeBenefit: 'Standard connection for all active businesses.',
  },
  google_places: {
    id: 'google_places',
    name: 'Google Maps & Places',
    category: 'core',
    requiredPlan: 'free',
    requiredPlanLabel: 'Free Plan',
    providerName: 'Google Places API',
    providerKey: 'google_places',
    description: 'Verified geocoding, address normalization, and Google Maps CID verification.',
    requiresApiKey: false,
    upgradeBenefit: 'Included in all workspace plans.',
  },
  google_search_console: {
    id: 'google_search_console',
    name: 'Search Console Telemetry',
    category: 'core',
    requiredPlan: 'free',
    requiredPlanLabel: 'Free Plan',
    providerName: 'Google Search Console API',
    providerKey: 'search_console',
    description: 'First-party impression telemetry, organic click rates, and indexing validation.',
    requiresApiKey: false,
    upgradeBenefit: 'Direct authorization with Google Workspace.',
  },
  google_analytics_4: {
    id: 'google_analytics_4',
    name: 'Google Analytics 4',
    category: 'core',
    requiredPlan: 'free',
    requiredPlanLabel: 'Free Plan',
    providerName: 'Google Analytics 4 Data API',
    providerKey: 'ga4',
    description: 'First-party website traffic volume, engagement rate, and conversion paths.',
    requiresApiKey: false,
    upgradeBenefit: 'Direct authorization with Google Analytics.',
  },
  website_crawler: {
    id: 'website_crawler',
    name: 'Technical SEO & PageSpeed',
    category: 'core',
    requiredPlan: 'free',
    requiredPlanLabel: 'Free Plan',
    providerName: 'Locora Crawler & Google PSI',
    providerKey: 'own_crawler',
    description: 'Deep audit of Core Web Vitals, H1/H2 hierarchy, SSL headers, and LocalBusiness schema.',
    requiresApiKey: false,
    upgradeBenefit: 'Included in all workspace tiers.',
  },
  basic_ai: {
    id: 'basic_ai',
    name: 'Basic AI Growth Suggestions',
    category: 'core',
    requiredPlan: 'free',
    requiredPlanLabel: 'Free Plan',
    providerName: 'Groq LPU Engine',
    providerKey: 'basic_ai',
    description: 'Single-business content recommendations and review reply suggestions.',
    requiresApiKey: false,
    upgradeBenefit: 'Available to all registered accounts.',
  },
  limited_monitoring: {
    id: 'limited_monitoring',
    name: 'Standard Telemetry Monitoring',
    category: 'monitoring',
    requiredPlan: 'free',
    requiredPlanLabel: 'Free Plan',
    providerName: 'Locora Telemetry Engine',
    providerKey: 'limited_monitoring',
    description: 'Single-location manual refresh and core reputation tracking.',
    requiresApiKey: false,
    upgradeBenefit: 'Default monitoring configuration.',
  },

  // PRO TIER SOURCES
  expanded_monitoring: {
    id: 'expanded_monitoring',
    name: 'Expanded Multi-Location Monitoring',
    category: 'monitoring',
    requiredPlan: 'pro',
    requiredPlanLabel: 'Pro Plan',
    providerName: 'Locora Multi-Location Engine',
    providerKey: 'expanded_monitoring',
    description: 'Multi-location business management with per-location visibility tracking.',
    requiresApiKey: false,
    upgradeBenefit: 'Manage multi-location networks from one workspace.',
  },
  low_cost_serp: {
    id: 'low_cost_serp',
    name: 'Low-Cost SERP Telemetry',
    category: 'serp',
    requiredPlan: 'pro',
    requiredPlanLabel: 'Pro Plan',
    providerName: 'Low-Cost SERP (Serper / SerpApi)',
    providerKey: 'low_cost_serp',
    description: 'Live search engine results observation where API credentials are configured.',
    requiresApiKey: true,
    configKeyLabel: 'Serper.dev or SerpApi API Key',
    upgradeBenefit: 'On-demand live SERP snapshots via SerpApi where your key is configured.',
  },
  competitor_monitoring: {
    id: 'competitor_monitoring',
    name: 'Competitor Intel & Gap Analysis',
    category: 'monitoring',
    requiredPlan: 'pro',
    requiredPlanLabel: 'Pro Plan',
    providerName: 'Locora Competitor Intel Engine',
    providerKey: 'competitor_monitoring',
    description: 'Track local competitors, rating margins, review velocity gaps, and visibility comparison.',
    requiresApiKey: false,
    upgradeBenefit: 'Automatic competitor tracking across local service zones.',
  },

  // AGENCY ELITE TIER SOURCES
  dataforseo: {
    id: 'dataforseo',
    name: 'DataForSEO Enterprise Index',
    category: 'enterprise',
    requiredPlan: 'agency_elite',
    requiredPlanLabel: 'Agency Elite',
    providerName: 'DataForSEO Labs API',
    providerKey: 'dataforseo',
    description: 'Direct access to global SERP indices, monthly keyword volume, backlink metrics, and AI overview references.',
    requiresApiKey: true,
    configKeyLabel: 'DataForSEO Login & Password',
    upgradeBenefit: 'Full access to deep keyword databases, live backlinks, and historical domain authority.',
  },
  advanced_serp: {
    id: 'advanced_serp',
    name: 'Advanced SERP & Local Tracking',
    category: 'serp',
    requiredPlan: 'agency_elite',
    requiredPlanLabel: 'Agency Elite',
    providerName: 'DataForSEO & Global SERP Matrix',
    providerKey: 'advanced_serp',
    description: 'On-demand SERP result lookups via SerpApi and DataForSEO where credentials are configured.',
    requiresApiKey: true,
    configKeyLabel: 'DataForSEO Credentials',
    upgradeBenefit: 'On-demand SERP snapshots for tracked keywords via your API keys.',
  },
  bulk_client_processing: {
    id: 'bulk_client_processing',
    name: 'Bulk Client Processing & PDF Exports',
    category: 'enterprise',
    requiredPlan: 'agency_elite',
    requiredPlanLabel: 'Agency Elite',
    providerName: 'Locora Agency Batch Processor',
    providerKey: 'bulk_client_processing',
    description: 'Multi-client workspaces (up to 10 businesses) with agency branding and team member seats.',
    requiresApiKey: false,
    upgradeBenefit: 'Run up to 10 client businesses from one agency workspace.',
  },
};

/**
 * Normalizes any plan tier string into 'free' | 'pro' | 'agency_elite'
 */
export function normalizePlanTier(rawPlan?: string): NormalizedPlanTier {
  if (!rawPlan) return 'free';
  const p = rawPlan.toLowerCase().trim();
  if (p === 'agency' || p === 'agency_elite' || p === 'elite') return 'agency_elite';
  if (p === 'pro') return 'pro';
  return 'free';
}

/**
 * Checks plan hierarchy: agency_elite (3) > pro (2) > free (1)
 */
export function planMeetsRequirement(userPlan: NormalizedPlanTier, requiredPlan: NormalizedPlanTier): boolean {
  const rank: Record<NormalizedPlanTier, number> = {
    free: 1,
    pro: 2,
    agency_elite: 3,
  };
  return rank[userPlan] >= rank[requiredPlan];
}

export interface ProviderAccessEvaluation {
  allowed: boolean;
  state: 'granted' | 'upgrade_required' | 'not_configured' | 'unavailable';
  featureId: ProviderFeatureId;
  featureName: string;
  providerName: string;
  requiredPlan: NormalizedPlanTier;
  requiredPlanLabel: string;
  currentPlan: NormalizedPlanTier;
  reason: string;
  canUpgrade: boolean;
  canConfigure: boolean;
  configKeyLabel?: string;
  neverUseFakeData: true; // Strictly guaranteed
}

/**
 * Evaluates whether a user can access a specific provider feature based on:
 * 1. User Subscription Plan (Free, Pro, Agency Elite)
 * 2. Provider Configuration State (API Key / Connection)
 * 3. Provider Operational Health (Upstream outages / Network)
 */
export function evaluateProviderAccess(params: {
  featureId: ProviderFeatureId;
  userPlanTier?: string;
  userRole?: string;
  isConfigured?: boolean;
  hasUpstreamError?: boolean;
  upstreamErrorMessage?: string;
}): ProviderAccessEvaluation {
  const {
    featureId,
    userPlanTier,
    userRole,
    isConfigured = true,
    hasUpstreamError = false,
    upstreamErrorMessage,
  } = params;

  const def = PROVIDER_FEATURE_REGISTRY[featureId] || PROVIDER_FEATURE_REGISTRY.google_business_profile;
  const currentPlan = normalizePlanTier(userPlanTier);
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  // 1. Evaluate Subscription Tier (Admins bypass plan tier gate, but not API configuration)
  const satisfiesPlan = isAdmin || planMeetsRequirement(currentPlan, def.requiredPlan);

  if (!satisfiesPlan) {
    return {
      allowed: false,
      state: 'upgrade_required',
      featureId: def.id,
      featureName: def.name,
      providerName: def.providerName,
      requiredPlan: def.requiredPlan,
      requiredPlanLabel: def.requiredPlanLabel,
      currentPlan,
      reason: `${def.name} is exclusive to the ${def.requiredPlanLabel}. ${def.upgradeBenefit}`,
      canUpgrade: true,
      canConfigure: false,
      configKeyLabel: def.configKeyLabel,
      neverUseFakeData: true,
    };
  }

  // 2. Evaluate API Key / Provider Configuration State
  if (def.requiresApiKey && !isConfigured) {
    return {
      allowed: false,
      state: 'not_configured',
      featureId: def.id,
      featureName: def.name,
      providerName: def.providerName,
      requiredPlan: def.requiredPlan,
      requiredPlanLabel: def.requiredPlanLabel,
      currentPlan,
      reason: `${def.providerName} feed has not been connected yet. It is activated automatically with your plan — no setup needed on your end.`,
      canUpgrade: false,
      canConfigure: true,
      configKeyLabel: def.configKeyLabel,
      neverUseFakeData: true,
    };
  }

  // 3. Evaluate Upstream Operational Status
  if (hasUpstreamError) {
    return {
      allowed: false,
      state: 'unavailable',
      featureId: def.id,
      featureName: def.name,
      providerName: def.providerName,
      requiredPlan: def.requiredPlan,
      requiredPlanLabel: def.requiredPlanLabel,
      currentPlan,
      reason: upstreamErrorMessage || `${def.providerName} is temporarily unreachable or returned an upstream error. In accordance with our data integrity policy, synthetic data is strictly disabled.`,
      canUpgrade: false,
      canConfigure: true,
      configKeyLabel: def.configKeyLabel,
      neverUseFakeData: true,
    };
  }

  // 4. Access Granted
  return {
    allowed: true,
    state: 'granted',
    featureId: def.id,
    featureName: def.name,
    providerName: def.providerName,
    requiredPlan: def.requiredPlan,
    requiredPlanLabel: def.requiredPlanLabel,
    currentPlan,
    reason: `Access authorized via ${currentPlan === 'agency_elite' ? 'Agency Elite' : currentPlan.toUpperCase()} Plan.`,
    canUpgrade: false,
    canConfigure: false,
    configKeyLabel: def.configKeyLabel,
    neverUseFakeData: true,
  };
}
