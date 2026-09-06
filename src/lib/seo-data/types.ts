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

export interface NormalizedSeoAudit {
  domainOverview: DomainOverviewData;
  backlinks: BacklinkSummaryData;
  keywords: KeywordItemData[];
  serp: Array<{ keyword: string; position: number; url: string }>;
  serpDetails?: SerpOverviewData;
  aiOverview: AiOverviewPresenceData;
  fetchedAt: string;
  provider: string;
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

/** Lookup Costs for Metering */
export const SEO_LOOKUP_COSTS = {
  DOMAIN_OVERVIEW: 1,
  BACKLINK_SUMMARY: 1,
  KEYWORD_BATCH: 1, // Batch up to 700 keywords = 1 lookup
  SERP_CHECK_PER_KEYWORD: 1,
  AI_OVERVIEW_CHECK: 1,
  FULL_AUDIT_BASE: 1,
} as const;

export interface AiVisibilityCheckItem {
  id: string;
  userId: string;
  userEmail?: string;
  businessName?: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'perplexity' | 'groq' | string;
  prompt: string;
  mentioned: boolean;
  responseSnippet?: string;
  checkedAt: string;
}
