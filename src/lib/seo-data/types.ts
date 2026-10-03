/**
 * Real SEO Data, Credit Metering & AI Visibility Types
 * Strictly normalized according to specification
 */

export interface DomainOverviewData {
  rank: number; // 0–100 normalized score
  rawRank?: number;
  estimatedTraffic: number;
  organicKeywordsCount: number;
  paidKeywordsCount?: number;
  trend: Array<{ date: string; traffic: number; keywords: number }>;
}

export interface BacklinkSummaryData {
  total: number;
  referringDomains: number;
  spamScore: number;
  rank: number; // DataForSEO 0–1,000 scale
  dofollowCount?: number;
  historical?: Array<{ month: string; backlinks: number; refDomains: number }>;
}

export interface KeywordItemData {
  keyword: string;
  volume: number;
  cpc: number;
  competition: string; // 'LOW' | 'MEDIUM' | 'HIGH'
  intent: string; // 'informational' | 'navigational' | 'commercial' | 'transactional'
  difficulty?: number;
}

export interface SerpResultItem {
  position: number;
  title: string;
  url: string;
  snippet: string;
}

export interface SerpOverviewData {
  keyword: string;
  results: SerpResultItem[];
  peopleAlsoAsk: Array<{ question: string; snippet?: string }>;
  relatedSearches: string[];
  /** Google Maps local pack entries (from SerpApi local_results), in pack order. */
  localPack: Array<{ position: number; title: string; address?: string; rating?: number; reviews?: number }>;
}

export interface AiOverviewPresenceData {
  domain: string;
  totalCitations: number;
  citedKeywords: Array<{
    keyword: string;
    position: number;
    url: string;
    searchVolume: number;
    citedInAiOverview: boolean;
  }>;
}

export type ProviderStatus =
  | 'success'
  | 'not_configured'
  | 'authentication_error'
  | 'quota_exceeded'
  | 'unavailable'
  | 'connected_no_data';

export interface NormalizedSeoAudit {
  domainOverview: DomainOverviewData;
  backlinks: BacklinkSummaryData;
  keywords: KeywordItemData[];
  serp: Array<{ keyword: string; position: number; url: string }>;
  serpDetails?: SerpOverviewData;
  aiOverview: AiOverviewPresenceData;
  fetchedAt: string;
  provider: string;
  provider_status?: ProviderStatus;
  providerStatusMessage?: string;
  attribution: string; // "Powered by DataForSEO" & "Powered by SerpApi"
  isCached: boolean;
  refreshCooldownUntil?: string;
}

export interface LocationResolution {
  location_code: number;
  language_code: string;
  country_iso_code: string;
}

/** Freshness windows in milliseconds */
export const FRESHNESS_WINDOWS = {
  DOMAIN_OVERVIEW_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  BACKLINK_SUMMARY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  KEYWORDS_MS: 14 * 24 * 60 * 60 * 1000, // 14 days
  SERP_MS: 24 * 60 * 60 * 1000, // 24 hours
  AI_OVERVIEW_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

/** Lookup Costs for Metering (Proportionally Weighted by Real API Cost) */
export const SEO_LOOKUP_COSTS = {
  DOMAIN_OVERVIEW: 1, // Domain rank overview = 1 unit
  KEYWORD_BATCH: 1, // Keyword overview (batch up to 700 keywords) = 1 unit
  AI_OVERVIEW_CHECK: 1, // AI Overview presence check = 1 unit
  SERP_CHECK_PER_KEYWORD: 1, // Live SERP position = 1 unit
  BACKLINK_SUMMARY: 2, // Backlink summary = 2 units (costs 2x live API fee)
  BACKLINK_LIST: 2, // Full backlink list = 2 units (costs 2x live API fee)
  FULL_AUDIT_BASE: 6, // Combined fresh audit = 6 units (1+1+1+1+2)
} as const;

export interface AiVisibilityObservation {
  id: string;
  businessId?: string;
  userId: string;
  userEmail?: string;
  businessName?: string;
  query: string;
  date: string;
  location: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'perplexity' | 'groq' | string;
  business_mentioned: boolean;
  position: number | null;
  competitors_mentioned: string[];
  citation_sources: string[];
  raw_observation: string;
  // Compatibility fields
  prompt?: string;
  mentioned?: boolean;
  responseSnippet?: string;
  checkedAt?: string;
}

export type AiVisibilityCheckItem = AiVisibilityObservation;
