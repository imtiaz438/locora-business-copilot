// ============================================================================
// PRODUCTION DATA ARCHITECTURE TYPE DEFINITIONS
// ============================================================================

export interface Business {
  id: string;
  ownerEmail: string;
  name: string;
  slug?: string | null;
  industry: string;
  category: string;
  tagline?: string | null;
  description?: string | null;
  targetAudience?: string | null;
  toneOfVoice?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  planTier: 'free' | 'pro' | 'agency';
  status: 'active' | 'suspended' | 'archived';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Location {
  id: string;
  businessId: string;
  name: string;
  isPrimary: boolean;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country: string;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  hours?: string[] | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BusinessBrain {
  id: string;
  businessId: string;
  score: number;
  readinessScore: number;
  summary?: string | null;
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  } | null;
  priorities?: Array<{
    id: string;
    urgency: 'high' | 'opportunity' | 'good';
    title: string;
    problem: string;
    expectedImpact: string;
  }> | null;
  lastSynthesizedAt: string | Date;
}

export interface DataConnection {
  id: string;
  businessId: string;
  provider: 'google_gbp' | 'google_search_console' | 'google_analytics' | 'crawler';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  connectedAt?: string | Date | null;
  lastSyncedAt?: string | Date | null;
  config?: Record<string, any> | null;
}

export interface GoogleBusinessLocation {
  id: string;
  businessId: string;
  connectionId?: string | null;
  locationId: string;
  locationName: string;
  address?: string | null;
  rating: number;
  reviewCount: number;
  completenessScore: number;
  isVerified: boolean;
  attributes?: string[] | null;
  hours?: string[] | null;
  syncedAt: string | Date;
}

export interface GoogleReview {
  id: string;
  businessId: string;
  locationId?: string | null;
  reviewId: string;
  authorName: string;
  authorPhotoUrl?: string | null;
  rating: number;
  text?: string | null;
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
  publishedAt: string | Date;
  replyText?: string | null;
  repliedAt?: string | Date | null;
  isAnswered: boolean;
  source?: string | null;
  syncedAt: string | Date;
}

export interface GoogleProfileMetric {
  id: string;
  businessId: string;
  locationId?: string | null;
  metricDate: string;
  viewsSearch: number;
  viewsMaps: number;
  actionsWebsite: number;
  actionsPhone: number;
  actionsDirections: number;
  period: string;
}

export interface SearchConsoleQuery {
  id: string;
  businessId: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
  device?: string | null;
  country?: string | null;
}

export interface AnalyticsMetric {
  id: string;
  businessId: string;
  metricDate: string;
  sessions: number;
  pageviews: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  channels?: Array<{ channel: string; percentage: number }> | null;
}

export interface Competitor {
  id: string;
  businessId: string;
  name: string;
  website?: string | null;
  address?: string | null;
  googlePlaceId?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  notes?: string | null;
}

export interface CompetitorSnapshot {
  id: string;
  businessId: string;
  competitorId: string;
  snapshotDate: string;
  rating?: number | null;
  reviewCount?: number | null;
  estTraffic?: number | null;
  rankingKeywordsCount?: number | null;
  sharedKeywords?: string[] | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
}

export interface WebsiteProject {
  id: string;
  businessId: string;
  domain: string;
  targetUrl: string;
  sitemapUrl?: string | null;
  status: 'active' | 'paused' | 'archived';
}

export interface CrawlRun {
  id: string;
  businessId: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  pagesCrawled: number;
  issuesFound: number;
  perfScore: number;
  seoScore: number;
  accessibilityScore: number;
  startedAt: string | Date;
  completedAt?: string | Date | null;
}

export interface WebsiteIssue {
  id: string;
  businessId: string;
  projectId: string;
  crawlRunId?: string | null;
  severity: 'critical' | 'warning' | 'info';
  category: 'seo' | 'performance' | 'schema' | 'security';
  title: string;
  description: string;
  recommendation?: string | null;
  pageUrl?: string | null;
  isResolved: boolean;
}

export interface SchemaData {
  id: string;
  businessId: string;
  projectId: string;
  pageUrl: string;
  schemaType: string;
  rawJsonld: Record<string, any>;
  validationErrors?: string[] | null;
  isValid: boolean;
}

export interface TrackedKeyword {
  id: string;
  businessId: string;
  keyword: string;
  targetLocation?: string | null;
  searchVolume?: number | null;
  difficulty?: number | null;
  intent?: 'commercial' | 'informational' | 'navigational' | 'transactional' | null;
  tags?: string[] | null;
  isActive: boolean;
}

export interface RankSnapshot {
  id: string;
  businessId: string;
  keywordId: string;
  snapshotDate: string;
  rankPosition: number;
  previousPosition?: number | null;
  searchEngine: string;
  device: string;
}

export interface VisibilitySnapshot {
  id: string;
  businessId: string;
  snapshotDate: string;
  localPackRank?: number | null;
  threePackPresent: boolean;
  aiVisibilityScore: number;
  shareOfVoice?: number | null;
  score: number;
}

export interface GrowthOpportunity {
  id: string;
  businessId: string;
  type: string;
  urgency: 'high' | 'opportunity' | 'good';
  title: string;
  description: string;
  whyItMatters?: string | null;
  evidence: string;
  expectedImpact?: string | null;
  actionType: string;
  status: 'open' | 'in_progress' | 'completed' | 'dismissed';
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  createdAt: string | Date;
  metadata?: Record<string, any> | null;
}

export interface GrowthPlan {
  id: string;
  businessId: string;
  title: string;
  objective: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  startDate?: string | null;
  targetDate?: string | null;
  progress: number;
}

export interface GrowthTask {
  id: string;
  businessId: string;
  planId?: string | null;
  opportunityId?: string | null;
  title: string;
  description?: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'done';
  assignedTo?: string | null;
  dueDate?: string | null;
  completedAt?: string | Date | null;
}

export interface AiAction {
  id: string;
  businessId: string;
  actionType: string;
  title: string;
  payload?: Record<string, any> | null;
  status: 'pending' | 'completed' | 'failed';
  executedAt: string | Date;
  result?: Record<string, any> | null;
}

export interface Report {
  id: string;
  businessId: string;
  title: string;
  type: 'audit' | 'ranking' | 'monthly' | 'executive';
  dateRange?: string | null;
  summary?: string | null;
  pdfUrl?: string | null;
  generatedAt: string | Date;
}

export interface Notification {
  id: string;
  businessId: string;
  userEmail: string;
  type: 'opportunity' | 'alert' | 'review' | 'system';
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

// ---------------- CALCULATED METRICS ----------------
export interface CalculatedMetrics {
  healthScore: number;
  aiReadinessScore: number;
  averageRating: number;
  reviewCount: number;
  unansweredReviewsCount: number;
  averageMapRank: number;
  threePackPresent: boolean;
  aiVisibilityScore: number;
  monthlyOrganicTraffic: number;
  googleProfileViews: number;
  rankingKeywordsCount: number;
  criticalIssuesCount: number;
  openOpportunitiesCount: number;
  pendingTasksCount: number;
}

// ---------------- NORMALIZED UNIFIED DASHBOARD PAYLOAD ----------------
export interface NormalizedDashboardData {
  business: Business;
  locations: Location[];
  primaryLocation: Location | null;
  businessBrain: BusinessBrain | null;
  dataConnections: DataConnection[];
  collectedData: {
    googleProfile: GoogleBusinessLocation | null;
    reviews: GoogleReview[];
    searchConsoleQueries: SearchConsoleQuery[];
    analyticsMetrics: AnalyticsMetric | null;
    competitors: Competitor[];
    competitorSnapshots: CompetitorSnapshot[];
    websiteProject: WebsiteProject | null;
    latestCrawlRun: CrawlRun | null;
    websiteIssues: WebsiteIssue[];
    schemaData: SchemaData[];
    trackedKeywords: TrackedKeyword[];
  };
  calculatedMetrics: CalculatedMetrics;
  opportunities: GrowthOpportunity[];
  growthPlans: GrowthPlan[];
  growthTasks: GrowthTask[];
  aiActions: AiAction[];
  reports: Report[];
  notifications: Notification[];
}
