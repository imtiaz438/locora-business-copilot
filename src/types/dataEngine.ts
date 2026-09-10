export type DataProviderTier = 'free' | 'pro' | 'agency_elite';

export type ExternalDataSource =
  | 'own_crawler'
  | 'google_places'
  | 'google_gbp'
  | 'google_psi'
  | 'search_console'
  | 'ga4'
  | 'dataforseo'
  | 'ai_synthesis'
  | 'locora_db';

export interface ProviderCapability {
  dataType: string;
  free: string;
  pro: string;
  agencyElite: string;
}

export interface WebsiteAuditData {
  url: string;
  isSsl: boolean;
  httpStatus: number;
  latencyMs: number;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  mobileFriendly: boolean;
  wordCount: number;
  hasSchema: boolean;
  schemaTypes: string[];
  schemaSnippet?: string;
  metaTitle: string;
  metaDescription: string;
  h1Matches: string[];
  h2Matches: string[];
  issues: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    category: 'security' | 'seo' | 'performance' | 'content' | 'schema';
    title: string;
    description: string;
    recommendation: string;
  }>;
  lastCrawledAt: string;
  source: 'own_crawler';
}

export interface GbpData {
  connected: boolean;
  listingName: string;
  placeId?: string;
  mapsUrl?: string;
  rating: number;
  reviewCount: number;
  unansweredReviews: number;
  category: string;
  businessHours: string[];
  photosCount: number;
  primaryPhone: string;
  address: string;
  attributes: string[];
  lastSyncedAt: string;
  source: 'google_places' | 'google_gbp';
}

export interface NormalizedReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  publishedAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywordsMentioned: string[];
  isAnswered: boolean;
  replyText?: string;
  repliedAt?: string;
  source: 'google_gbp' | 'enriched';
}

export interface LocalPackResult {
  query: string;
  location: string;
  businessName: string;
  rankPosition: number | null; // 1, 2, 3, or null if outside top 20
  inThreePack: boolean;
  competitorsInPack: Array<{
    name: string;
    position: number;
    rating: number;
    reviewCount: number;
    address: string;
  }>;
  lastTrackedAt: string;
  source: 'google_places' | 'low_cost_serp' | 'dataforseo' | 'cached';
}

export interface CompetitorIntel {
  id: string;
  name: string;
  website: string;
  rating: number;
  reviewCount: number;
  estimatedTrafficMonthly: number;
  rankingKeywordsCount: number;
  sharedKeywords: string[];
  reviewGap: number; // difference in reviews vs our business
  strengths: string[];
  weaknesses: string[];
  lastAnalyzedAt: string;
  source: 'google_places' | 'own_crawler' | 'paid_dataforseo';
}

export interface KeywordIdea {
  keyword: string;
  searchVolume: number;
  rank: number | null;
  previousRank?: number | null;
  intent: 'commercial' | 'transactional' | 'informational' | 'local';
  impressions: number;
  clicks: number;
  ctr: number;
  difficultyScore: number;
  source: 'gsc' | 'ai' | 'paid_dataforseo';
}

export interface TrafficMetrics {
  sessions: number;
  pageviews: number;
  bounceRate: number;
  avgDurationSec: number;
  topChannels: Array<{ channel: string; percentage: number }>;
  gscClicks: number;
  gscImpressions: number;
  avgPosition: number;
  lastSyncedAt: string;
  source: 'ga4' | 'gsc' | 'estimated';
  ga4Connected?: boolean;
  ga4PropertyId?: string;
  ga4PropertyName?: string;
  ga4AccountName?: string;
  gscConnected?: boolean;
}

export interface AiVisibilityScore {
  score: number; // 0-100 visibility index in AI engines
  chatGptMentioned: boolean;
  perplexityRank: number | null;
  geminiCitation: boolean;
  claudeRecommendation: boolean;
  brandSentimentScore: number; // 0-100
  samplePromptEvaluated: string;
  monitoringFrequency: 'manual' | 'scheduled_weekly' | 'full_realtime';
  lastCheckedAt: string;
}

export interface HistoricalMetricSnapshot {
  date: string; // YYYY-MM-DD
  healthScore: number;
  seoScore: number;
  googleRating: number;
  reviewCount: number;
  unansweredReviews: number;
  estTraffic: number;
  localPackRank: number | null;
  aiVisibilityScore: number;
}

export interface BusinessBrainState {
  score: number; // 0 - 100 Overall Health
  readinessScore: number; // 0 - 100
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  priorityActions: Array<{
    id: string;
    urgency: 'high' | 'opportunity' | 'good';
    urgencyLabel: string;
    title: string;
    problem: string;
    whyItMatters: string;
    evidence: string;
    expectedImpact: string;
    actionType: 'create_page' | 'respond_reviews' | 'gbp_details' | 'schema_fix' | 'quote_followup' | 'competitor_gap' | 'custom';
    actionLabel: string;
    recommendationTitle: string;
    isFixed?: boolean;
    fixedAt?: string;
  }>;
  targetKeywords: string[];
  activeOffers: string[];
  voicePersona: string;
  executiveSummary: string;
  lastSynthesizedAt: string;
}

export interface B2BLeadRecord {
  id: string;
  businessName: string;
  website: string;
  category: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  hasWebsite: boolean;
  hasSsl: boolean;
  hasSchema: boolean;
  validationStatus: 'verified' | 'unverified' | 'deliverable' | 'catch_all';
  leadScore: number; // 1-100 based on digital gaps (e.g. missing website/schema = higher propensity)
  acquiredAt: string;
}

export interface LocoraLeadCache {
  totalCount: number;
  leads: B2BLeadRecord[];
  exports: Array<{
    batchId: string;
    exportType: 'csv' | 'pdf';
    leadCount: number;
    exportedAt: string;
  }>;
}

export interface OneTimeProductsState {
  businessAudit: {
    available: boolean;
    price: number; // $19
    purchasedCount: number;
    lastGeneratedAt?: string;
  };
  whiteLabelAudit: {
    available: boolean;
    price: number; // $29
    purchasedCount: number;
    lastExportedAt?: string;
  };
  leadPacks: {
    pack250Purchased: number;
    pack500Purchased: number;
    pack1000Purchased: number;
  };
  aiActionTopUps: {
    actions50Purchased: number;
    actions150Purchased: number;
    actions500Purchased: number;
    remainingBalance: number;
  };
}

// THE SINGLE SOURCE OF TRUTH IN LOCORA DATABASE
export interface LocoraBusinessRecord {
  id: string;
  userId?: string;
  userEmail?: string;
  planTier: DataProviderTier;
  createdAt: string;
  updatedAt: string;

  // 1. Identity & Profile
  identity: {
    name: string;
    tagline: string;
    website: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    category: string;
    industry: string;
    targetLocations: string[];
    services: string[];
  };

  // 2. Technical & Website Crawl (Own Crawler + PSI)
  websiteAudit: WebsiteAuditData;

  // 3. Google Business Profile & Places
  gbpData: GbpData;

  // 4. Reputation & Reviews
  reviews: NormalizedReview[];

  // 5. Local Pack & SERP Rankings
  localPack: LocalPackResult;

  // 6. Competitor Intelligence
  competitors: CompetitorIntel[];

  // 7. Keywords & Queries (GSC + AI + SERP)
  keywords: KeywordIdea[];

  // 8. Traffic & Analytics (GA4 + GSC)
  traffic: TrafficMetrics;

  // 9. AI Visibility & Search Engines
  aiVisibility: AiVisibilityScore;

  // 10. Business Brain (Computed from Locora DB)
  businessBrain: BusinessBrainState;

  // 11. Historical Data Snapshots (Stored in Locora DB)
  history: HistoricalMetricSnapshot[];

  // 12. Lead Cache & One-Time Products
  leadCache: LocoraLeadCache;
  oneTimeProducts: OneTimeProductsState;

  // 13. Data Sources Tracking
  dataSources?: Record<string, DataSourceRecord>;
}

// -------------------------------------------------------------
// DATA SOURCES RECORD (Section 9)
// -------------------------------------------------------------
export interface DataSourceRecord {
  provider: string; // 'google_places' | 'own_crawler' | 'dataforseo' | 'low_cost_serp' | 'search_console' | 'ga4' | 'gemini_ai'
  last_sync: string;
  data_freshness: 'realtime' | 'fresh' | 'cached' | 'stale';
  cost: number; // Cost in USD (e.g. 0.00 for free, 0.002 for SERP)
  confidence: number; // 0 - 100% confidence score
  status: 'active' | 'warning' | 'error' | 'rate_limited';
  errorDetails?: string;
}

// -------------------------------------------------------------
// PROVIDER LAYER INTERFACES (Section 10)
// -------------------------------------------------------------
export interface SearchProvider {
  name: string;
  searchRankings(query: string, location: string, domain: string): Promise<{ rank: number | null; inThreePack: boolean; competitors: any[] }>;
  getSerpResults(query: string, location: string): Promise<any>;
}

export interface GoogleProvider {
  name: string;
  getBusinessProfile(placeIdOrName: string, address: string): Promise<Partial<GbpData>>;
  getGoogleReviews(placeId: string): Promise<NormalizedReview[]>;
  getPlacesCompetitors(category: string, city: string, state: string): Promise<CompetitorIntel[]>;
}

export interface ReviewProvider {
  name: string;
  fetchReviews(businessId: string): Promise<NormalizedReview[]>;
  analyzeSentimentAndTopics(reviews: NormalizedReview[]): Promise<{
    sentiment: { positive: number; neutral: number; negative: number };
    commonComplaints: string[];
    customerLanguage: string[];
    suggestedReplies: Array<{ reviewId: string; reply: string }>;
  }>;
}

export interface AnalyticsProvider {
  name: string;
  getTrafficMetrics(domain: string): Promise<TrafficMetrics>;
  getSearchQueries(domain: string): Promise<KeywordIdea[]>;
}

export interface CrawlerProvider {
  name: string;
  crawlWebsite(url: string): Promise<WebsiteAuditData>;
  validateSchema(html: string): Promise<{ hasSchema: boolean; types: string[]; snippet?: string }>;
}

export interface AIProvider {
  name: string;
  synthesizeBusinessBrain(business: LocoraBusinessRecord): Promise<BusinessBrainState>;
  generateContent(type: 'gbp_post' | 'service_page' | 'location_page' | 'faq' | 'review_reply' | 'social_post' | 'email' | 'offer', context: any): Promise<string>;
  executeFunctionCall(functionName: string, args: Record<string, any>, context: LocoraBusinessRecord): Promise<{ result: any; explanation: string }>;
}

// LowCost and DataForSEO providers implementing SearchProvider
export interface LowCostSearchProvider extends SearchProvider {
  tier: 'pro';
  cachedOnly: boolean;
}

export interface DataForSEOProvider extends SearchProvider {
  tier: 'agency_elite';
  bulkEnabled: boolean;
}

// -------------------------------------------------------------
// CORE BACKEND TABLE TYPES (Section 9)
// -------------------------------------------------------------
export interface BusinessTableRecord {
  id: string;
  name: string;
  category: string;
  website: string;
  phone: string;
  ownerEmail: string;
  planTier: DataProviderTier;
  createdAt: string;
  updatedAt: string;
}

export interface LocationTableRecord {
  id: string;
  businessId: string;
  name: string;
  isMain: boolean;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export interface ReviewTableRecord {
  id: string;
  businessId: string;
  author: string;
  rating: number;
  text: string;
  publishedAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  isAnswered: boolean;
  replyText?: string;
  repliedAt?: string;
}

export interface CompetitorTableRecord {
  id: string;
  businessId: string;
  name: string;
  website: string;
  rating: number;
  reviewCount: number;
  reviewGap: number;
}

export interface TrackedKeywordTableRecord {
  id: string;
  businessId: string;
  keyword: string;
  searchVolume: number;
  currentRank: number | null;
  previousRank: number | null;
  intent: string;
}

export interface GrowthOpportunityTableRecord {
  id: string;
  businessId: string;
  urgency: 'high' | 'opportunity' | 'healthy';
  title: string;
  problem: string;
  expectedImpact: string;
  isFixed: boolean;
}

export interface CrawlRunTableRecord {
  id: string;
  businessId: string;
  targetUrl: string;
  httpStatus: number;
  latencyMs: number;
  seoScore: number;
  crawledAt: string;
}

