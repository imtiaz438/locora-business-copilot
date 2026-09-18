export enum DataSourceAttribution {
  GOOGLE_BUSINESS_PROFILE = 'GOOGLE_BUSINESS_PROFILE',
  GOOGLE_SEARCH_CONSOLE = 'GOOGLE_SEARCH_CONSOLE',
  WEBSITE = 'WEBSITE',
  USER_PROVIDED = 'USER_PROVIDED',
  CALCULATED = 'CALCULATED',
  AI_RECOMMENDATION = 'AI_RECOMMENDATION',
  DIRECTORY_ACTIVITY = 'DIRECTORY_ACTIVITY',
}

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

export interface GoogleBusinessProfileInfo {
  connected: boolean;
  listingName?: string;
  rating?: number;
  reviewCount?: number;
  unansweredReviews?: number;
  mapsUrl?: string;
  category?: string;
}

export interface BusinessBrainOpportunity {
  id: string;
  type: 'review' | 'service_gap' | 'competitor' | 'seo' | 'citation';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionLabel: string;
  actionTargetTab: string;
  promptPayload?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  category?: string;
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
  gbpConnected?: boolean;
  isPublishedInDirectory?: boolean;
  directoryStatus?: 'DISCOVERED' | 'ELIGIBLE' | 'PUBLISHED' | 'CLAIM_PENDING' | 'CLAIMED' | 'VERIFIED';
  isClaimed?: boolean;
  directorySlug?: string;
  sourceAttributions?: {
    gbp?: string;
    website?: string;
    verification?: string;
    [key: string]: string | undefined;
  };
  // Core Business Brain Fields
  services?: string[];
  targetLocations?: string[];
  primaryCompetitors?: string[];
  competitors?: string[];
  currentOffers?: string[];
  businessGoals?: string[];
  googleBusiness?: GoogleBusinessProfileInfo;
  legalName?: string;
  brandVoice?: string;
  serviceAreas?: string[];
  hours?: string;
  targetCustomers?: string;
  brainReadinessScore?: number;
  lastBrainSyncAt?: string;
  updatedAt: string;
}

export interface OnboardingStep1Input {
  websiteUrl: string;
  businessName?: string;
  country: string;
  primaryLocation: string;
}

export interface DiscoveredBusinessInfo {
  businessName: string | null;
  legalName: string | null;
  website: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  postalCode: string | null;
  businessCategory: string | null;
  description: string | null;
  hours: string | null;
  services: string[];
  googleBusinessProfile: {
    connected: boolean;
    statusText: 'Connected' | 'Not connected';
    placeId?: string;
    rating?: number;
    reviewCount?: number;
    googleMapsUri?: string;
    formattedAddress?: string;
    source: 'google_places' | 'website_crawl' | 'user_input' | 'not_found';
  };
  sources: {
    businessName: 'google_places' | 'website_crawl' | 'user_input' | 'not_found';
    address: 'google_places' | 'website_crawl' | 'user_input' | 'not_found';
    phone: 'google_places' | 'website_crawl' | 'user_input' | 'not_found';
    website: 'user_input' | 'google_places' | 'website_crawl';
    category: 'google_places' | 'website_crawl' | 'user_input' | 'not_found';
    hours: 'google_places' | 'website_crawl' | 'user_input' | 'not_found';
  };
  sourcesList: string[];
  rawDiscoveredNotes?: string;
}

export interface OnboardingMissingInfoForm {
  businessName: string;
  legalName: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  services: string[];
  serviceAreas: string[];
  businessCategory: string;
  description: string;
  hours: string;
  targetCustomers: string;
  goals: string[];
  brandVoice: string;
  placeId?: string;
  googleConnected?: boolean;
}

export interface BusinessTruthLocation {
  id: string;
  name: string | null;
  isPrimary: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
  hours: string | string[] | null;
}

export interface BusinessTruthGoogleProfile {
  connected: boolean;
  placeId: string | null;
  locationName: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number | null;
  isVerified: boolean;
  status: string | null;
}

export interface BusinessTruthBrain {
  score: number | null;
  readinessScore: number | null;
  summary: string | null;
  swot: {
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
  } | null;
  priorities: any[] | null;
  lastSynthesizedAt: string | null;
}

export interface BusinessTruth {
  businessId: string;
  name: string | null;
  category: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  locations: BusinessTruthLocation[];
  services: string[] | null;
  serviceAreas: string[] | null;
  hours: string | null;
  description: string | null;
  targetCustomers: string | null;
  goals: string[] | null;
  brandVoice: string | null;
  googleProfile: BusinessTruthGoogleProfile | null;
  brain?: BusinessTruthBrain | null;
  dataSources: string[];
  lastUpdated: string | null;
}

export interface BusinessLocationItem {
  id: string;
  name: string;
  isMain?: boolean;
  address: string;
  city: string;
  state: string;
  country?: string;
  zip?: string;
  phone?: string;
}

export interface ClientBusiness {
  id: string;
  name: string;
  category: string;
  tagline: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  zip: string;
  phone: string;
  email?: string;
  description?: string;
  website: string;
  healthScore: number;
  healthDelta: number; // e.g. +6 points this month
  highImpactCount: number;
  opportunityCount: number;
  healthyAreaCount: number;
  isMainLocation?: boolean;
  locations?: BusinessLocationItem[];
  services: string[];
  competitors: string[];
  googleRating: number;
  rankingAvg?: number;
  reviewCount: number;
  unansweredReviews: number;
  gbpCompleteness: number;
  gbpConnected?: boolean;
  gbpLastSyncedAt?: string | null;
  gscConnected?: boolean;
  gscLastSyncedAt?: string | null;
  gscError?: string | null;
  localRankingsCheckedAt?: string | null;
  keywordsLastCheckedAt?: string | null;
  aiVisibilityLastCheckedAt?: string | null;
  externalDatasets?: ExternalDataset[];
  placeId?: string;
  directorySlug?: string;
  slug?: string;
  isPublishedInDirectory?: boolean;
  isClaimed?: boolean;
  reviews?: any[];
  healthBreakdown?: {
    visibility: number;
    reputation: number;
    conversion: number;
    operations: number;
  };
}

export type DatasetFreshnessStatus =
  | 'connected'
  | 'not_connected'
  | 'syncing'
  | 'error'
  | 'stale';

export interface ExternalDataset {
  id: string;
  name: string;
  source: string;
  last_synced_at: string | null;
  status: DatasetFreshnessStatus;
  error: string | null;
  category?: 'reputation' | 'search' | 'local' | 'technical' | 'ai' | 'competitors';
  recordCount?: number;
  description?: string;
  actionLabel?: string;
  actionTab?: string;
}

export interface FixItDraft {
  id: string;
  actionId: string;
  title: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  schemaType: string;
  schemaJson: string;
  headings: string[];
  bodyCopy: string;
  faqs: { question: string; answer: string }[];
  internalLinks: { anchor: string; target: string }[];
  status: 'draft' | 'reviewed' | 'published';
  createdAt: string;
}

export interface PriorityAction {
  id: string;
  urgency: 'high' | 'opportunity' | 'good';
  urgencyLabel: string; // "HIGH IMPACT" | "OPPORTUNITY" | "GOOD"
  title: string; // Problem
  problem: string;
  whyItMatters: string;
  evidence: string;
  expectedImpact: string;
  actionType: 'create_page' | 'respond_reviews' | 'gbp_details' | 'schema_fix' | 'quote_followup' | 'competitor_gap' | 'custom';
  actionLabel: string; // "[ Fix This ]" | "[ Respond to Reviews ]" | "[ View Details ]"
  recommendationTitle: string;
  category?: string;
  priorityLevel?: 'high' | 'medium' | 'low';
  aiReasoning?: string;
  itemsToCreate?: string[];
  draft?: FixItDraft;
  aiExplanation?: {
    rootCause: string;
    competitorEvidence: string;
    revenueImpact: string;
    whyNow: string;
  };
  isFixed?: boolean;
  fixedAt?: string;
  source?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  confidence?: number;
  createdAt?: string | Date;
  businessId?: string;
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

export type CustomerStatus = 'lead' | 'prospect' | 'customer' | 'inactive' | 'lost' | 'client' | 'contacted' | 'proposal_sent';
export type CustomerSource = 'website_form' | 'manual' | 'imported' | 'connected_crm' | 'website_leads' | string;
export type PipelineStage = 'new_lead' | 'contacted' | 'qualified' | 'proposal' | 'won';

export type CustomerActivityType =
  | 'lead_created'
  | 'email_received'
  | 'call_logged'
  | 'note_added'
  | 'status_changed'
  | 'proposal_created'
  | 'proposal_sent'
  | 'invoice_created'
  | 'invoice_paid'
  | 'task_created'
  | 'meeting_logged';

export interface CustomerActivity {
  id: string;
  businessId: string;
  customerId: string;
  type: CustomerActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CustomerNote {
  id: string;
  businessId: string;
  customerId: string;
  author?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerTask {
  id: string;
  businessId: string;
  customerId: string;
  title: string;
  dueDate?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface CustomerTag {
  id: string;
  businessId: string;
  customerId?: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface CustomerSourceRecord {
  id: string;
  businessId: string;
  name: string;
  label: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  businessId: string;
  customerId?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: CustomerSource;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | string;
  inquiryType?: string;
  message?: string;
  budget?: string;
  value?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  businessId?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  source?: CustomerSource;
  leadSource?: string;
  status: CustomerStatus;
  pipelineStage?: PipelineStage;
  service?: string;
  value: number;
  lastActivity?: string;
  nextAction?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  created_at?: string;
  updated_at?: string;
  lastContactAt?: string;
  last_contact_at?: string;
}

export type AgencyHealthStatus = 'need_attention' | 'improving' | 'healthy';

export interface AgencyClientSummary {
  id: string;
  name: string;
  category: string;
  city: string;
  healthScore: number;
  healthStatus: AgencyHealthStatus;
  primaryIssue?: string;
  recommendedAction?: string;
  revenue: number;
  locationsCount: number;
  unansweredReviews: number;
  visibilityTrend: number;
}

export interface LocationPerformanceMetric {
  id: string;
  city: string;
  score: number;
  status: 'healthy' | 'improving' | 'need_attention';
  visibility: number;
  calls: number;
  forms: number;
  bookings: number;
  reviewsCount: number;
  reviewRating: number;
  conversions: number;
}

export type ProjectStatus = 'planning' | 'active' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  businessId?: string;
  clientBusinessId?: string;
  name?: string;
  title?: string;
  customerId?: string;
  customerName?: string;
  client?: string;
  status: ProjectStatus;
  priority?: 'low' | 'medium' | 'high';
  budget?: number;
  startDate?: string;
  dueDate?: string;
  targetDate?: string;
  owner?: string;
  progress?: number;
  description?: string;
  tasks?: { id: string; title: string; completed: boolean }[];
  createdAt: string;
  updatedAt?: string;
}

export interface WorkTask {
  id: string;
  businessId: string;
  clientBusinessId?: string;
  projectId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
}

export interface WorkTemplate {
  id: string;
  businessId: string;
  clientBusinessId?: string;
  name: string;
  type: 'proposal' | 'document' | 'invoice' | 'task_list' | string;
  description?: string;
  content?: string;
  data?: any;
  createdAt: string;
  updatedAt: string;
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
  businessId?: string;
  clientBusinessId?: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  issueDate: string;
  dueDate: string;
  currency?: string;
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
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'declined' | 'expired' | 'archived';

export interface Proposal {
  id: string;
  businessId?: string;
  clientBusinessId?: string;
  title: string;
  type: ProposalType;
  customerId?: string;
  customerName: string;
  status: ProposalStatus;
  summary: string;
  scopeOfWork: string;
  deliverables: string[];
  timeline: string;
  pricingBreakdown: { item: string; cost: number }[];
  totalAmount: number;
  termsAndConditions: string;
  generatedContent: string;
  createdAt: string;
  updatedAt?: string;
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

export type ContentType =
  | 'google_post'
  | 'service_page'
  | 'location_page'
  | 'website_content'
  | 'faq'
  | 'blog_guide'
  | 'review_reply'
  | 'social_post'
  | 'offer'
  | 'email'
  | 'draft';

export type ContentStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'archived';

export type ContentPlatform =
  | 'gbp'
  | 'website'
  | 'email'
  | 'social'
  | 'blog'
  | 'internal';

export interface ContentPerformance {
  clicks?: number;
  impressions?: number;
  ctr?: number;
  queries?: string[];
  pageViews?: number;
  available: boolean;
  message?: string;
  lastUpdated?: string;
}

export interface ContentRecord {
  id: string;
  business_id: string;
  content_type: ContentType;
  title: string;
  body: string;
  status: ContentStatus;
  target_service: string;
  target_location: string;
  target_keyword?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  source: 'ai' | 'manual' | 'template' | 'business_brain';
  AI_generated: boolean;
  published_at?: string | null;
  scheduled_at?: string | null;
  platform: ContentPlatform;
  external_id?: string | null;
  google_location_id?: string | null;
  errorMessage?: string | null;
  performance?: ContentPerformance;
}

export interface DocumentItem {
  id: string;
  businessId?: string;
  clientBusinessId?: string;
  customerId?: string;
  leadId?: string;
  projectId?: string;
  proposalId?: string;
  title: string;
  type: DocumentType | string;
  content: string;
  prompt?: string;
  targetAudience?: string;
  tone?: string;
  source?: 'manual' | 'ai_generated' | 'template' | 'report_export' | string;
  metadata?: Record<string, any>;
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
    hasSitemap?: boolean;
    sitemapUrl?: string;
    sitemapStatus?: number;
    testedLinksCount?: number;
    brokenLinksCount?: number;
    brokenLinks?: { url: string; status: number }[];
  };
  technicalSeo?: TechnicalSeoBreakdown;
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

export interface DiscoveredField<T = string> {
  value: T | null;
  source: string | null;
  status: 'found' | 'not_found';
  displayValue: string;
}

export interface BusinessDiscoveryData {
  businessName: DiscoveredField<string>;
  displayName: DiscoveredField<string>;
  phone: DiscoveredField<string>;
  email: DiscoveredField<string>;
  address: DiscoveredField<string>;
  city: DiscoveredField<string>;
  stateRegion: DiscoveredField<string>;
  country: DiscoveredField<string>;
  postalCode: DiscoveredField<string>;
  services: DiscoveredField<string[]>;
  serviceAreas: DiscoveredField<string[]>;
  businessCategory: DiscoveredField<string>;
  openingHours: DiscoveredField<string[]>;
  website: DiscoveredField<string>;
  socialLinks: DiscoveredField<Array<{ platform: string; url: string }>>;
}

export interface TechnicalSeoAnalysis {
  https: {
    enabled: boolean;
    evidence: string;
    details: string;
  };
  crawlability: {
    status: 'crawlable' | 'restricted' | 'blocked';
    metaRobots: string | null;
    evidence: string;
  };
  robotsTxt: {
    found: boolean;
    statusCode: number;
    hasDisallow: boolean;
    sitemapFoundInRobots: boolean;
    evidence: string;
  };
  sitemapXml: {
    found: boolean;
    statusCode: number;
    evidence: string;
  };
  canonicalTag: {
    present: boolean;
    canonicalUrl: string | null;
    matchesCurrentUrl: boolean;
    evidence: string;
  };
  indexability: {
    isIndexable: boolean;
    evidence: string;
  };
  redirectBehavior: {
    redirected: boolean;
    finalUrl: string;
    evidence: string;
  };
  internalLinksHealth: {
    totalChecked: number;
    brokenCount: number;
    brokenLinks: Array<{ url: string; status: number }>;
    evidence: string;
  };
  httpStatusCode: {
    code: number;
    evidence: string;
  };
}

export interface OnPageSeoAnalysis {
  titleTag: {
    present: boolean;
    text: string | null;
    length: number;
    isOptimalLength: boolean;
    evidence: string;
  };
  metaDescription: {
    present: boolean;
    text: string | null;
    length: number;
    isOptimalLength: boolean;
    evidence: string;
  };
  h1Heading: {
    present: boolean;
    count: number;
    headings: string[];
    evidence: string;
  };
  headingStructure: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    hierarchyValid: boolean;
    evidence: string;
  };
  duplicateTitles: {
    hasDuplicates: boolean;
    evidence: string;
  };
  duplicateDescriptions: {
    hasDuplicates: boolean;
    evidence: string;
  };
  contentStructure: {
    wordCount: number;
    paragraphCount: number;
    thinContent: boolean;
    evidence: string;
  };
  imageAltAttributes: {
    totalImages: number;
    missingAltCount: number;
    compliantCount: number;
    compliancePercentage: number;
    evidence: string;
  };
  internalLinking: {
    totalLinks: number;
    distinctPages: number;
    evidence: string;
  };
  urlStructure: {
    isClean: boolean;
    hasSuspiciousParams: boolean;
    evidence: string;
  };
}

export interface ContentAnalysis {
  thinContentSignal: {
    detected: boolean;
    wordCount: number;
    verdict: string;
    evidence: string;
  };
  missingImportantElements: Array<{
    element: string;
    missing: boolean;
    importance: string;
    evidence: string;
  }>;
  serviceInformation: {
    detected: boolean;
    sampleServices: string[];
    evidence: string;
  };
  locationRelevance: {
    detected: boolean;
    locationsFound: string[];
    evidence: string;
  };
  contactInformation: {
    detected: boolean;
    methodsFound: string[];
    evidence: string;
  };
  usefulBusinessInformation: {
    detected: boolean;
    items: string[];
    evidence: string;
  };
}

export interface StructuredDataAnalysis {
  hasJsonLd: boolean;
  totalBlocks: number;
  detectedSchemas: {
    localBusiness: boolean;
    organization: boolean;
    webSite: boolean;
    webPage: boolean;
    service: boolean;
    faqPage: boolean;
    breadcrumbList: boolean;
    otherDetectedSchemas: string[];
  };
  findings: Array<{
    schema: string;
    detected: boolean;
    evidence: string;
  }>;
}

export interface RealSeoAnalysisData {
  technical: TechnicalSeoAnalysis;
  onPage: OnPageSeoAnalysis;
  content: ContentAnalysis;
  structuredData: StructuredDataAnalysis;
}

export interface LocalSeoAnalysisData {
  signals: {
    businessName: { found: boolean; value: string | null; evidence: string };
    address: { found: boolean; value: string | null; evidence: string };
    phone: { found: boolean; value: string | null; evidence: string };
    cityLocationReferences: { found: boolean; locations: string[]; evidence: string };
    serviceAreas: { found: boolean; areas: string[]; evidence: string };
    contactInformation: { found: boolean; channels: string[]; evidence: string };
    localBusinessSchema: { found: boolean; schemaType: string | null; evidence: string };
    organizationSchema: { found: boolean; evidence: string };
    servicePages: { found: boolean; pages: string[]; evidence: string };
    locationPages: { found: boolean; pages: string[]; evidence: string };
    localRelevanceSignals: {
      hasLocalPhone: boolean;
      hasMapEmbed: boolean;
      hasPhysicalAddressInFooter: boolean;
      evidence: string;
    };
  };
  googleBusinessProfileNotice: {
    status: 'not_connected';
    headline: string;
    explanation: string;
    actionRequired: string;
  };
}

export interface PerformanceAnalysisData {
  provider: 'google_pagespeed_insights' | 'socket_telemetry';
  status: 'available' | 'not_configured' | 'auth_failed' | 'quota_exceeded';
  statusMessage: string;
  pageSpeedMetrics?: {
    mobilePerformanceScore: number;
    desktopPerformanceScore?: number | null;
    strategy: 'mobile';
    coreWebVitals: {
      firstContentfulPaint: string;
      largestContentfulPaint: string;
      cumulativeLayoutShift: string;
      totalBlockingTime: string;
      speedIndex: string;
    };
  };
  socketTelemetry: {
    serverLatencyTtfbMs: number;
    htmlPayloadSizeKb: number;
    protocol: string;
    httpStatusCode: number;
    isSsl: boolean;
    evidence: string;
  };
}

export interface ScoreCheckItem {
  id: string;
  name: string;
  passed: boolean;
  evidence: string;
  pointsAwarded: number;
  maxPoints: number;
}

export interface CategoryScoreDetail {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number; // e.g. 0.20
  status: 'good' | 'fair' | 'needs_attention';
  checks: ScoreCheckItem[];
  explanation: string;
}

export interface DeterministicScoringResult {
  overallScore: number;
  categories: {
    technicalSeo: CategoryScoreDetail;
    onPageSeo: CategoryScoreDetail;
    localSeo: CategoryScoreDetail;
    content: CategoryScoreDetail;
    structuredData: CategoryScoreDetail;
    performance: CategoryScoreDetail;
  };
  formulaExplanation: string;
}

export interface PublicGatedOpportunity {
  id: string;
  priority: number; // 1, 2, 3
  title: string;
  impact: string; // 'High Revenue Impact', 'Medium Impact', etc.
  category: string;
  difficulty: 'Quick Win' | 'Moderate' | 'Technical';
  limitedEvidence: string;
}

export interface PublicGatedIssue {
  id: string;
  priority: number; // 1, 2, 3
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  limitedEvidence: string;
  affectedUrl?: string;
  recommendation?: string;
}

export interface PublicGatedPassedCheck {
  id: string;
  title: string;
  limitedEvidence: string;
  category: string;
}

export interface PublicGatedReport {
  totalOpportunitiesCount: number;
  visibleOpportunitiesCount: number;
  lockedOpportunitiesCount: number;
  topIssues: PublicGatedIssue[]; // 2-3 highest priority problems
  topPassedChecks: PublicGatedPassedCheck[]; // 2-3 passed checks
  topOpportunities: PublicGatedOpportunity[]; // 2-3 highest priority opportunities
  nextStepRecommendation: {
    headline: string;
    summary: string;
    primaryFocus: string;
  };
  scanMetadata: {
    scanDateTime: string;
    pagesAnalyzedLabel: string;
    dataSources: string[];
  };
  lockedFeaturesList: Array<{
    feature: string;
    description: string;
  }>;
}

export interface PublicCheckupResult {
  auditId: string;
  url: string;
  domain: string;
  businessName: string;
  businessLocation?: string;
  visitorEmail?: string;
  analyzedAt: string;
  pagesCrawled: number;
  overallScore: number;
  // Deterministic 6-category scoring system (Section 9)
  scoring: DeterministicScoringResult;
  // Public Results Value-Gating (Sections 10, 11, 12, 13)
  gatedReport: PublicGatedReport;
  scores: {
    seo: number;
    performance: number;
    localPresence: number;
    technicalSeo?: number;
    onPageSeo?: number;
    localSeo?: number;
    content?: number;
    structuredData?: number;
  };
  crawlStats: {
    latencyMs: number;
    htmlSizeKb: number;
    isSsl: boolean;
    httpStatus: number;
    totalImages: number;
    missingAltImages: number;
    internalLinksCount: number;
  };
  detectedBusinessData: {
    name: string;
    phone: string | null;
    address: string | null;
    schemaTypes: string[];
    hasLocalBusinessSchema: boolean;
    hasContactForm: boolean;
    hasMapEmbed: boolean;
    metaTitle: string;
    metaDescription: string;
    h1Heading: string | null;
  };
  // Sections 5, 6, 7, 8 deep authentic modules
  businessDiscovery: BusinessDiscoveryData;
  realSeoAnalysis: RealSeoAnalysisData;
  localSeoAnalysis: LocalSeoAnalysisData;
  performanceAnalysis: PerformanceAnalysisData;

  discoveredIssues: Array<{
    id: string;
    severity: 'critical' | 'warning' | 'info';
    category: 'SEO' | 'Local Presence' | 'Performance' | 'Security';
    title: string;
    description: string;
    evidence: string;
  }>;
  gatedTeasers: Array<{
    id: string;
    question: string;
    title: string;
    teaserDescription: string;
    featureHighlight: string;
    unlockedInPlan: string;
  }>;
  status?: 'queued' | 'scanning' | 'analyzing' | 'completed' | 'partial' | 'failed' | 'expired';
  cacheStatus?: 'live' | 'cached';
  dataAge?: string;
  crawlStartedAt?: string;
  crawlCompletedAt?: string;
  visitorId?: string;
}

export interface TechnicalSeoFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  status: 'passed' | 'warning' | 'failed';
  evidence: string;
  recommendation?: string;
}

export interface TechnicalSeoBreakdown {
  score: number;
  basedOn: string[];
  factors: TechnicalSeoFactor[];
  crawledAt: string;
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

export type ProviderStatus =
  | 'success'
  | 'not_configured'
  | 'authentication_error'
  | 'quota_exceeded'
  | 'unavailable'
  | 'connected_no_data';

export interface SeoMatrixAuditData {
  tier: 'free' | 'pro';
  provider: 'serper' | 'serpapi' | 'scaleserp' | 'valueserp' | 'dataforseo' | 'google_search' | 'google_custom_search' | 'dom_heuristic' | 'dns_verification' | 'global_authority_index';
  providerName: string;
  provider_status?: ProviderStatus;
  providerStatusMessage?: string;
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
  freeAuditedDomain?: string;
  freeAuditedDomains?: string[];
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

// ==========================================
// SECTION 28: HIGH-SIGNAL NOTIFICATION SYSTEM
// ==========================================
export type NotificationType = 'action_needed' | 'opportunity' | 'completed';

export interface LocoraNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  evidence?: string;
  actionLabel: string; // "[ Investigate ]", "[ View ]", "[ View Report ]"
  actionTargetTab: string;
  actionPayload?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// ==========================================
// SECTION 29: GROWTH HEALTH SCORING SYSTEM
// ==========================================
export interface ScoreComponentEvidence {
  score: number;
  weight: number; // e.g. 1/6
  status: 'healthy' | 'improving' | 'needs_attention';
  evidencePoints: string[];
  recommendation: string;
  targetTab: string;
}

export interface LocoraGrowthHealth {
  overallScore: number;
  deltaThisMonth: string;
  components: {
    visibility: ScoreComponentEvidence;
    reputation: ScoreComponentEvidence;
    website: ScoreComponentEvidence;
    conversion: ScoreComponentEvidence;
    content: ScoreComponentEvidence;
    competitiveness: ScoreComponentEvidence;
  };
}

// ==========================================
// SECTION 32 & 33: AI ACTION & APPROVAL SYSTEM
// ==========================================
export type AIActionType =
  | 'CREATE_REVIEW_REPLY'
  | 'CREATE_GBP_POST'
  | 'CREATE_SERVICE_PAGE'
  | 'CREATE_FAQ'
  | 'CREATE_PROPOSAL'
  | 'CREATE_INVOICE'
  | 'CREATE_TASK'
  | 'CREATE_REPORT'
  | 'ANALYZE_COMPETITOR'
  | 'ANALYZE_REVIEWS'
  | 'CREATE_GROWTH_PLAN'
  | 'UPDATE_DIRECTORY_PROFILE'
  | 'CREATE_DIRECTORY_TASK'
  | 'CREATE_DIRECTORY_CONTENT';

export interface AIAction {
  id: string;
  type: AIActionType;
  title: string;
  business_id: string;
  input: Record<string, any>;
  output?: Record<string, any> | string;
  status: 'draft' | 'approved' | 'completed' | 'rejected';
  created_by: 'ai' | 'user';
  isSafeInternal: boolean; // internal (safe) vs external (requires confirmation)
  explanation: {
    diagnosis: string; // 1. What's wrong?
    whyItMatters: string; // 2. What matters most?
    previewSummary: string; // 3. What should I do?
    expectedImpact: string; // 4. Did it work?
  };
  createdAt: string;
  approvedAt?: string;
  executedAt?: string;
}

// ==========================================
// SECTION 35: FIRST-TIME ONBOARDING WIZARD
// ==========================================
export interface OnboardingData {
  website: string;
  businessName: string;
  phone: string;
  city: string;
  state: string;
  services: string[];
  goals: string[];
  googleConnected: boolean;
}

// ==========================================
// SECTION 40: GROWTH STORE PRODUCTS
// ==========================================
export interface GrowthStoreItem {
  id: string;
  category: 'ai_actions' | 'audit' | 'agency' | 'leads' | 'launch_kit';
  title: string;
  subtitle: string;
  price: number;
  priceLabel: string;
  features: string[];
  badge?: string;
}


