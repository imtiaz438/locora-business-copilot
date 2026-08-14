export type AIProviderId = 'gemini' | 'openai' | 'claude' | 'perplexity' | 'opus' | 'cursor' | 'grok';

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  description: string;
  apiKeyEnv: string;
  isCustomKeySet: boolean;
  model: string;
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
  providerKeys: Record<AIProviderId, string>;
  theme: 'dark' | 'light' | 'system';
  autoSave: boolean;
  defaultCurrency: string;
  defaultTaxRate: number;
  siteLogoUrl?: string;
  siteLogoConfig?: CustomLogoConfig;
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
    imageAltMissingCount: number;
    sslActive: boolean;
  };
  keyIssues: {
    type: 'error' | 'warning' | 'pass';
    category: 'SEO' | 'Performance' | 'Accessibility' | 'Security';
    title: string;
    description: string;
    recommendation: string;
  }[];
  aiSummary: string;
  actionableSteps: string[];
}

export interface LocalSeoItem {
  id: string;
  type: 'gbp_description' | 'service_item' | 'category' | 'review_reply' | 'post' | 'qa' | 'local_landing' | 'schema';
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

export type UserPlan = 'free' | 'pro' | 'agency';
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
  invoicesCreatedCount?: number;
  memberSince: string;
  nextBillingDate: string;
  autoRenew?: boolean;
  paymentMethod?: {
    cardLast4: string;
    cardBrand: string;
    expDate: string;
  };
  isAuthenticated: boolean;
}

export interface SubscriptionInvoice {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  planName: string;
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

