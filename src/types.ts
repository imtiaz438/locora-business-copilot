export type AIProviderId = 'gemini' | 'openai' | 'claude' | 'perplexity' | 'deepseek' | 'groq' | 'opus' | 'cursor' | 'grok' | 'llama4' | 'apple_intelligence';

export interface AIModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  isDefault?: boolean;
}

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  description: string;
  apiKeyEnv: string;
  isCustomKeySet: boolean;
  model: string;
  models?: AIModelOption[];
  isUpcoming?: boolean;
  statusTag?: string;
  category?: string;
}

export interface BrandAssetConfig {
  url?: string;
  height?: number;
  bgStyle?: 'transparent' | 'light' | 'dark' | 'glass';
  padding?: 'none' | 'compact' | 'normal' | 'spacious';
  fit?: 'contain' | 'cover' | 'scale-down';
}

export interface CustomLogoConfig {
  url: string;
  format?: 'svg' | 'png' | 'jpg' | 'webp' | 'other';
  fileName?: string;
  height: number;
  alignment: 'left' | 'center' | 'right';
  padding: 'none' | 'compact' | 'normal' | 'spacious';
  bgStyle: 'transparent' | 'light' | 'dark' | 'glass';
  fit: 'contain' | 'cover' | 'scale-down';
  showText?: boolean;
  showTagline?: boolean;
  // Specialized Brand Assets
  faviconUrl?: string;
  heroIconConfig?: BrandAssetConfig;
  authLogoConfig?: BrandAssetConfig;
}

export interface BusinessProfile {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  description: string;
  targetAudience: string;
  toneOfVoice: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  currency: string;
  taxRate: number;
  taxId: string;
  logoUrl?: string;
  logoConfig?: CustomLogoConfig;
  updatedAt: string;
}

export interface AppSettings {
  activeProvider: AIProviderId;
  activeModelVersion?: string;
  providerModels?: Record<string, string>;
  providerKeys: Record<string, string>;
  theme: 'dark' | 'light' | 'system';
  autoSave: boolean;
  defaultCurrency: string;
  defaultTaxRate: number;
  siteLogoUrl?: string;
  siteLogoConfig?: CustomLogoConfig;
  userKeyStatus?: Record<string, { isValid: boolean; lastTested?: string; warning?: string; modelDetected?: string }>;
  detectedProviderModels?: Record<string, AIModelOption[]>;
}

export type CustomerStatus = 'lead' | 'contacted' | 'proposal_sent' | 'client' | 'inactive';

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: CustomerStatus;
  value: number;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  status: ProjectStatus;
  budget: number;
  startDate: string;
  targetDate: string;
  description: string;
  tasks: { id: string; title: string; completed: boolean }[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'customer' | 'project' | 'meeting' | 'idea';
  entityId?: string; // customerId or projectId
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes: string;
  paymentTerms: string;
  createdAt: string;
}

export type ProposalType = 'proposal' | 'quotation' | 'contract';

export interface Proposal {
  id: string;
  title: string;
  type: ProposalType;
  customerId?: string;
  customerName: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  summary: string;
  scopeOfWork: string;
  deliverables: string[];
  timeline: string;
  pricingBreakdown: { item: string; cost: number }[];
  totalAmount: number;
  termsAndConditions: string;
  generatedContent: string;
  createdAt: string;
}

export type DocumentType =
  | 'email'
  | 'linkedin_post'
  | 'facebook_post'
  | 'instagram_caption'
  | 'google_business_post'
  | 'review_reply'
  | 'blog_post'
  | 'business_plan'
  | 'meeting_summary'
  | 'marketing_plan'
  | 'cold_email'
  | 'service_description'
  | 'landing_page_copy'
  | 'faq_page';

export interface DocumentItem {
  id: string;
  title: string;
  type: DocumentType;
  content: string;
  prompt: string;
  targetAudience?: string;
  tone?: string;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  contextAttached?: {
    type: 'customer' | 'project' | 'document' | 'invoice';
    id: string;
    label: string;
  };
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteAuditResult {
  url: string;
  analyzedAt: string;
  overallScore: number;
  scores: {
    seo: number;
    performance: number;
    accessibility: number;
    bestPractices: number;
  };
  metadata: {
    title: string;
    description: string;
    ogTitle?: string;
    ogDescription?: string;
    canonical?: string;
    viewport?: string;
    hasH1: boolean;
    h1Count: number;
    h1Text?: string;
    h2Count?: number;
    totalImages?: number;
    imageAltMissingCount: number;
    sslActive: boolean;
    hasSchema?: boolean;
    schemaTypes?: string[];
    hasOpenGraph?: boolean;
    hasTwitterCard?: boolean;
    ogImage?: string;
    latencyMs?: number;
    htmlSizeKb?: number;
    httpStatus?: number;
    hasTelLinks?: boolean;
    telLinksCount?: number;
    hasMailtoLinks?: boolean;
    hasForms?: boolean;
    formInputCount?: number;
    hasMapEmbed?: boolean;
    hasFavicon?: boolean;
    hasAppleTouchIcon?: boolean;
    hasHsts?: boolean;
    hasCsp?: boolean;
    hasXFrameOptions?: boolean;
    contentEncoding?: string;
    cacheControl?: string;
    scriptCount?: number;
    blockingScriptsCount?: number;
    hasAggregateRating?: boolean;
    hasLocalBusiness?: boolean;
    hasOrganization?: boolean;
    hasWebsiteSchema?: boolean;
    hasMixedContent?: boolean;
    hasAddress?: boolean;
    hasPhoneText?: boolean;
    robotsMeta?: string;
  };
  audit?: any;
  keyIssues: {
    type: 'error' | 'warning' | 'pass';
    category: 'SEO' | 'Performance' | 'Accessibility' | 'Security';
    title: string;
    description: string;
    recommendation: string;
  }[];
  seoRecommendations?: SeoRecommendation[];
  seoMatrix?: SeoMatrixAuditData;
  aiSummary: string;
  actionableSteps: string[];
}

export interface SeoKeywordMatrixItem {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: 'Low' | 'Medium' | 'High';
  competitionIndex: number; // 0 - 100
  difficultyKd: number; // Keyword difficulty (0 - 100)
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  position: number | null; // Global ranking position
  positionChange: number; // Position change relative to previous scan
  trafficShare: number; // % of total domain organic traffic
  volumeTrend: number[]; // 6-month historical search volume sparkline
  url?: string | null;
  snippet?: string;
}

export interface TopTrafficPage {
  url?: string;
  path: string;
  title: string;
  estimatedVisits: number;
  trafficSharePercent: number;
  topKeyword?: string;
  primaryKeyword?: string;
  keywordsCount?: number;
  rankedKeywordsCount?: number;
  changeRate: number; // % growth or change
}

export interface BacklinkItem {
  sourceUrl: string;
  sourceDomain: string;
  sourceTitle?: string;
  targetUrl: string;
  anchorText: string;
  domainRating?: number; // 0 - 100
  domainAuthority?: number; // 0 - 100
  isDofollow?: boolean;
  linkType: 'dofollow' | 'nofollow';
  firstSeen?: string;
  firstSeenDate?: string;
}

export interface TrafficChannelBreakdown {
  organic: number; // %
  direct: number;  // %
  referral: number;// %
  social: number;  // %
  paid: number;    // %
}

export interface AiVisibilityProfile {
  score: number; // 0 - 100 AI Visibility rating
  sentiment: 'Positive' | 'Neutral' | 'Mixed' | 'Unranked';
  citationsCount: number;
  aiReadinessScore: number;
  topMentionSources: string[];
}

export interface BrandTrustProfile {
  trustScore: number; // 0 - 100
  domainAuthority: number; // 0 - 100 (DA / DR)
  spamScore: number; // 0 - 100 (low is clean)
  indexedPages: number;
  brandSearchShare: number; // % of searches branded
}

export interface SeoTrafficAnalytics {
  monthlyVisits: number;
  organicKeywordsCount: number;
  paidKeywordsCount: number;
  averagePosition: number;
  trafficCostUsd: number;
  domainRank: number; // 0 - 100
  historicalTraffic?: { month: string; visits: number; keywords: number }[];
  channels: TrafficChannelBreakdown;
  topPages: TopTrafficPage[];
  aiVisibility: AiVisibilityProfile;
  brandTrust: BrandTrustProfile;
  rankingDistribution: {
    top3: number;
    pos4_10: number;
    pos11_20: number;
    pos21_50: number;
    pos51_100: number;
  };
  topCompetitors?: {
    domain: string;
    commonKeywords: number;
    organicTraffic: number;
    domainAuthority: number;
    trafficShare: number;
  }[];
}

export interface BacklinkProfile {
  totalBacklinks: number;
  referringDomains: number;
  dofollowBacklinks: number;
  nofollowBacklinks: number;
  referringIps: number;
  domainTrustScore: number; // 0 - 100
  historicalBacklinks?: { month: string; backlinks: number; refDomains: number }[];
  links: BacklinkItem[];
}

export interface SeoMatrixAuditData {
  tier: 'free' | 'pro';
  provider: 'serper' | 'serpapi' | 'scaleserp' | 'valueserp' | 'dataforseo' | 'google_search' | 'google_custom_search' | 'dom_heuristic' | 'dns_verification' | 'global_authority_index';
  providerName: string;
  isCached: boolean;
  cachedAt?: string;
  cacheTtlHours: number;
  queryOrDomain: string;
  keywords: SeoKeywordMatrixItem[];
  traffic: SeoTrafficAnalytics;
  backlinks: BacklinkProfile;
  serpFeatures: string[];
  relatedSearches: string[];
  peopleAlsoAsk: { question: string; snippet?: string }[];
  competitorGap?: {
    commonCount: number;
    yourUniqueCount: number;
    competitorUniqueCount: number;
    keywordOverlapPercent: number;
  };
  warning?: string;
  isDnsResolved?: boolean;
  dnsStatus?: 'active' | 'unreachable' | 'not_found' | 'error';
  typoSuggestion?: string;
  indexStatus?: 'indexed' | 'unindexed' | 'new_domain' | 'dns_error';
  liveStatusMessage?: string;
}

export interface SeoRecommendation {
  id: string;
  title: string;
  metricCode: 'TBT' | 'CLS' | 'VIEWPORT' | 'TAP_TARGETS' | 'LCP' | 'HTTPS' | 'FONT_SIZE';
  metricName: string;
  seoImpact: 'Critical' | 'High' | 'Medium' | 'Low';
  technicalDifficulty: 'Easy' | 'Moderate' | 'Advanced';
  role: 'Frontend Developer' | 'SEO Specialist' | 'Web Designer' | 'DevOps Engineer';
  pagesAffectedCount: number;
  affectedPages: { path: string; title?: string; issueDetail: string }[];
  benchmark: string;
  description: string;
  howToFix: string;
  codeSnippet?: string;
  recommendedBy: 'Google Lighthouse';
  status: 'needs_fix' | 'in_progress' | 'resolved';
}

export interface LocalSeoItem {
  id: string;
  type: 'gbp_description' | 'service_item' | 'category' | 'review_reply' | 'post' | 'qa' | 'local_landing' | 'schema' | 'lighthouse_recs';
  title: string;
  content: string;
  createdAt: string;
}

export type MarketingPlannerOutput = {
  id: string;
  businessName: string;
  generatedAt: string;
  thirtyDayPlan: { week: number; focus: string; tasks: string[] }[];
  ninetyDayRoadmap: { month: number; objective: string; milestones: string[] }[];
  campaignIdeas: { title: string; objective: string; channels: string[]; expectedRoi: string }[];
  promotionCalendar: { event: string; targetDate: string; channel: string; offer: string }[];
  growthRoadmapSummary: string;
};

export type UserPlan = 'free' | 'pro' | 'agency' | 'elite';
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled';
export type BillingCycle = 'monthly' | 'yearly';
export type UserRole = 'admin' | 'customer' | 'subscriber' | 'owner' | 'member' | 'client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  companyName: string;
  role: UserRole;
  planTier: UserPlan;
  subscriptionStatus: SubscriptionStatus;
  billingCycle: BillingCycle;
  monthlyAiCredits: number;
  aiCreditsUsed: number;
  creditsUsed?: number;
  invoicesCreatedCount?: number;
  memberSince: string;
  nextBillingDate: string;
  autoRenew?: boolean;
  cancelAtPeriodEnd?: boolean;
  paymentProvider?: 'whop' | 'card' | 'apple_pay' | 'google_pay';
  whopSubscriptionId?: string;
  whopMembershipId?: string;
  whopCustomerId?: string;
  whopUserId?: string;
  whopCustomerPortalUrl?: string;
  lemonSqueezySubscriptionId?: string;
  lemonSqueezyCustomerId?: string;
  lemonSqueezyCustomerPortalUrl?: string;
  lemonSqueezyUpdatePaymentMethodUrl?: string;
  paymentMethod?: {
    cardLast4: string;
    cardBrand: string;
    expDate: string;
  };
  seoLookupsPerMonth?: number;
  seoLookupsUsed?: number;
  seoLookupsResetAt?: string;
  aiVisibilityRunsPerMonth?: number;
  aiVisibilityRunsUsed?: number;
  aiVisibilityResetAt?: string;
  isAuthenticated: boolean;
}

export type {
  NormalizedSeoAudit,
  DomainOverviewData,
  BacklinkSummaryData,
  KeywordItemData,
  SerpOverviewData,
  AiOverviewPresenceData,
  AiVisibilityCheckItem,
} from './lib/seo-data/types.ts';


export type PaymentMethodType = 'whop' | 'card' | 'apple_pay' | 'google_pay' | 'paypal';
export type PaymentTransactionStatus = 'success' | 'failed' | 'cancelled' | 'pending' | 'refunded';

export interface PaymentTransaction {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  planTier: UserPlan;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  whopDetails?: {
    membershipId?: string;
    subscriptionId?: string;
    paymentId?: string;
    planId?: string;
    companyId?: string;
    status?: string;
    customerPortalUrl?: string;
    receiptUrl?: string;
    paymentMethodBrand?: string;
  };
  lemonSqueezyDetails?: {
    subscriptionId?: string;
    orderId?: string;
    customerId?: string;
    variantId?: string;
    productId?: string;
    status?: string;
    customerPortalUrl?: string;
    updatePaymentMethodUrl?: string;
    paymentMethodBrand?: string;
    receiptUrl?: string;
  };
  cardDetails?: {
    brand?: string;
    last4?: string;
    expMonth?: string;
    expYear?: string;
    cardholderName?: string;
    country?: string;
    postalCode?: string;
    isTestCard?: boolean;
    walletType?: 'apple_pay' | 'google_pay' | 'none';
  };
  status: PaymentTransactionStatus;
  failureReason?: string;
  refundedAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  invoiceId?: string;
  isTestMode?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionInvoice {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  planName: string;
  planTier?: UserPlan;
  transactionId?: string;
  paymentMethod?: string;
  whopMembershipId?: string;
  whopPaymentId?: string;
  whopReceiptId?: string;
  billingCycle?: BillingCycle;
  userEmail?: string;
  userName?: string;
  subtotal?: number;
  taxAmount?: number;
  receiptUrl?: string;
  createdAt?: string;
}

export interface ActivityLogItem {
  id: string;
  userId?: string;
  type: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

