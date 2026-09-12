export type ReportType =
  | 'business_health'
  | 'local_seo'
  | 'seo_performance'
  | 'reputation'
  | 'growth'
  | 'content_performance'
  | 'customer_lead'
  | 'agency_client';

export interface ReportTypeDefinition {
  id: ReportType;
  title: string;
  description: string;
  category: string;
  primarySources: string[];
}

export const REPORT_TYPE_DEFINITIONS: ReportTypeDefinition[] = [
  {
    id: 'business_health',
    title: 'Business Health Report',
    description: 'Overall diagnostic covering entity accuracy, operational readiness, customer pipeline, and foundational visibility.',
    category: 'Diagnostic',
    primarySources: ['Business Brain', 'Google Business Profile', 'Website Crawl', 'Customers', 'Work Activity'],
  },
  {
    id: 'local_seo',
    title: 'Local SEO Report',
    description: 'Geo-grid rankings, Google Maps 3-Pack placement, NAP citation consistency, and LocalBusiness schema health.',
    category: 'Local Visibility',
    primarySources: ['Google Business Profile', 'Local Rankings', 'Website Crawl', 'Competitors'],
  },
  {
    id: 'seo_performance',
    title: 'SEO Performance Report',
    description: 'Organic search impressions, click-through rates, indexed keywords, crawl issues, and Core Web Vitals.',
    category: 'Search Engine',
    primarySources: ['Search Console', 'GA4', 'Website Crawl', 'Tracked Keywords'],
  },
  {
    id: 'reputation',
    title: 'Reputation Report',
    description: 'Review volume, star rating velocity, unanswered review count, sentiment distribution, and customer feedback trends.',
    category: 'Reputation',
    primarySources: ['Google Business Profile', 'Reviews', 'Customers'],
  },
  {
    id: 'growth',
    title: 'Growth Report',
    description: 'Monthly business revenue collected, deal win rates, customer pipeline flow, and prioritized market expansion opportunities.',
    category: 'Executive Growth',
    primarySources: ['Work Activity', 'Customers', 'Business Brain', 'GA4'],
  },
  {
    id: 'content_performance',
    title: 'Content Performance Report',
    description: 'Editorial volume, published local blog & social drafts, keyword targeting coverage, and schema deployment.',
    category: 'Content',
    primarySources: ['Content', 'Business Brain', 'Website Crawl'],
  },
  {
    id: 'customer_lead',
    title: 'Customer/Lead Report',
    description: 'Lead generation volume, acquisition channels, conversion rates, customer lifetime value, and active deals in CRM.',
    category: 'Pipeline',
    primarySources: ['Customers', 'Work Activity', 'GA4'],
  },
  {
    id: 'agency_client',
    title: 'Agency Client Report',
    description: 'Client-facing executive rollup with brand voice verification, deliverables completed, billable invoices, and ROI.',
    category: 'Agency Client',
    primarySources: ['Work Activity', 'Business Brain', 'Google Business Profile', 'Website Crawl'],
  },
];

export interface DataSourceStatus {
  id: string; // 'business_brain' | 'google_gbp' | 'reviews' | 'search_console' | 'ga4' | 'website_crawl' | 'local_rankings' | 'competitors' | 'content' | 'customers' | 'work_activity'
  name: string;
  providerLabel: string;
  isConnected: boolean;
  status: 'synced' | 'not_connected' | 'syncing' | 'stale' | 'no_data';
  lastSyncedAt: string | null;
  version?: string;
  recordCount?: number;
  coverageDetail?: string;
}

export interface ReportMetric {
  id: string;
  label: string;
  value: string | number | null;
  previousValue?: string | number | null;
  delta?: string | null;
  deltaType?: 'positive' | 'negative' | 'neutral';
  source: string; // e.g. 'Google Search Console', 'Google Business Profile', 'Locora Website Crawl', 'Locora CRM', 'Locora Work Billing', 'Locora Business Brain'
  period: string; // e.g. 'Aug 1–31, 2026', 'Current Period', 'Last 30 Days'
  status: 'synced' | 'not_connected' | 'stale' | 'no_data';
  notConnectedMessage?: string; // e.g. "Not available — connect Google Search Console"
  lastSyncedAt?: string | null;
  unit?: string;
  benchmark?: string;
}

export interface ReportProblem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  source: string;
  suggestedAction?: string;
}

export interface ReportOpportunity {
  id: string;
  impact: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedGain: string;
  source: string;
}

export interface ReportRecommendedAction {
  id: string;
  priority: number;
  action: string;
  rationale: string;
  targetArea: string;
  source: string;
}

export interface ReportDetailedFinding {
  id: string;
  category: string;
  title: string;
  findings: string[];
  metrics: ReportMetric[];
  evidence?: string;
  source: string;
}

export interface ReportExecutiveSummary {
  overview: string;
  whatChanged: string;
  whyItMatters: string;
  whatShouldHappenNext: string;
}

export interface ReportSnapshot {
  id: string;
  businessId: string;
  businessName: string;
  businessCity?: string;
  businessState?: string;
  businessWebsite?: string;
  reportType: ReportType;
  reportTitle: string;
  period: string;
  reportGeneratedAt: string;
  dataSnapshotAt: string;
  sourceVersions: Record<string, string>;
  dataSourcesUsed: DataSourceStatus[];
  isStale: boolean;
  staleReason?: string;
  lastDataSyncAt?: string;
  executiveSummary: ReportExecutiveSummary;
  whatChangedItems: Array<{
    title: string;
    delta: string;
    detail: string;
    source: string;
    type: 'positive' | 'negative' | 'neutral';
  }>;
  keyMetrics: ReportMetric[];
  problemsDetected: ReportProblem[];
  opportunities: ReportOpportunity[];
  recommendedActions: ReportRecommendedAction[];
  detailedFindings: ReportDetailedFinding[];
}
