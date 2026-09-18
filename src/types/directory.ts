export interface DirectoryReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  relativePublishTimeDescription: string;
  profilePhotoUrl?: string;
}

export interface BusinessHoursMap {
  [day: string]: string;
}

export type DirectoryBusinessStatus =
  | 'DISCOVERED'
  | 'ELIGIBLE'
  | 'PUBLISHED'
  | 'CLAIM_PENDING'
  | 'CLAIMED'
  | 'VERIFIED';

export interface DirectoryBusinessListing {
  id: string;
  ownerId?: string;
  ownerEmail?: string | null;
  businessName: string;
  slug: string;
  websiteUrl: string;
  phone?: string | null;
  email?: string | null;
  categorySlug: string;
  categoryName: string;
  citySlug: string;
  cityName: string;
  stateCode: string;
  planTier: 'free' | 'pro' | 'agency' | 'starter' | 'growth';
  isPublishedInDirectory: boolean;
  isDraft?: boolean;
  directoryStatus?: DirectoryBusinessStatus;
  isClaimed?: boolean;
  claimedByEmail?: string | null;
  targetKeywords: string[];
  sourceAttributions?: {
    gbp?: string;
    website?: string;
    verification?: string;
    [key: string]: string | undefined;
  };
  
  // Real Opportunities & Diagnostic Preview
  diagnosticSnapshot?: {
    seoScore: number;
    performanceScore: number;
    hasSchema: boolean;
    issuesCount: number;
    unansweredReviewsCount: number;
    topOpportunities: string[];
  } | null;

  // Real Directory Analytics (Pageviews, inquiries, clicks)
  directoryMetrics?: {
    profileViews: number;
    phoneClicks: number;
    websiteClicks: number;
    quoteRequests: number;
    claimClicks?: number;
    claimConversions?: number;
    lastViewedAt?: string | null;
  };
  
  // Synced GBP Data
  gbpData: {
    phone: string | null;
    address: string | null;
    hours: BusinessHoursMap | null;
    averageRating: number;
    reviewCount: number;
    reviews: DirectoryReview[];
    coverImageUrl?: string | null;
    logoUrl?: string | null;
    mediaPhotos: string[];
  } | null;

  // Synced Scraped & Brain Content
  scrapedContent: {
    metaTitle?: string | null;
    description: string | null;
    serviceTags: string[];
    aboutSummary?: string | null;
  } | null;

  createdAt?: string;
  updatedAt?: string;
}

export type DirectoryEventType =
  | 'directory_profile_view'
  | 'directory_search'
  | 'directory_filter'
  | 'directory_checkup_started'
  | 'directory_checkup_completed'
  | 'directory_claim_started'
  | 'directory_claim_completed'
  | 'directory_lead_started'
  | 'directory_lead_submitted'
  | 'directory_lead_delivered'
  | 'directory_lead_response'
  | 'directory_lead_converted'
  | 'phone_click'
  | 'website_click';

export interface DirectoryEventRecord {
  id: string;
  eventType: DirectoryEventType;
  businessId?: string;
  directoryProfileId?: string;
  userId?: string | null;
  sessionId?: string | null;
  timestamp: string;
  source: string;
  city?: string;
  category?: string;
  leadId?: string;
  metadata?: Record<string, any>;
}

export interface DirectoryLeadItem {
  id: string;
  businessId: string;
  directoryProfileId?: string;
  source: 'directory';
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  maskedEmail?: string;
  maskedPhone?: string;
  isUnlocked: boolean;
  serviceRequested: string;
  message?: string;
  city?: string;
  category?: string;
  status: 'new' | 'delivered' | 'contacted' | 'converted' | 'lost';
  deliveredViaEmail: boolean;
  deliveredViaSms: boolean;
  deliveredAt?: string | null;
  respondedAt?: string | null;
  convertedAt?: string | null;
  convertedCustomerId?: string | null;
  submittedAt: string;
}

export interface DirectoryBusinessAnalytics {
  businessId: string;
  businessName: string;
  slug: string;
  isClaimed: boolean;
  profileViews: number;
  checkupsStarted: number;
  checkupsCompleted: number;
  totalInquiries: number;
  totalLeads: number;
  deliveredLeads: number;
  phoneClicks: number;
  websiteClicks: number;
  claimClicks: number;
  claimCompleted: boolean;
  responsesCount: number;
  conversionsCount: number;
  leadConversionRate: number;
  inquiryRate: number;
  leads: DirectoryLeadItem[];
  recentEvents: DirectoryEventRecord[];
}

export interface DirectoryLeadSubmission {
  businessId: string;
  fullName: string;
  email: string;
  phone: string;
  serviceNeed: string;
  customerNotes?: string;
  utmMetrics?: {
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmTerm?: string | null;
    utmContent?: string | null;
    referrer?: string | null;
  };
}

export interface DirectoryLeadRecord {
  id: string;
  businessId: string;
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  serviceNeed: string;
  customerNotes?: string | null;
  leadStatus: 'NEW' | 'DISPATCHED' | 'LOCKED_UPGRADE_REQUIRED' | 'CONTACTED' | 'CONVERTED';
  isUnlocked: boolean;
  utmSource: string;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  referrer?: string | null;
  createdAt: string;
}
