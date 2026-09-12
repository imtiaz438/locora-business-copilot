import { pgTable, text, timestamp, integer, doublePrecision, jsonb, boolean, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // System User UID
  email: text('email').notNull(),
  name: text('name'),
  companyName: text('company_name'),
  role: text('role').default('customer'),
  planTier: text('plan_tier').default('free'),
  seoLookupsPerMonth: integer('seo_lookups_per_month').default(10),
  seoLookupsUsed: integer('seo_lookups_used').default(0),
  seoLookupsResetAt: timestamp('seo_lookups_reset_at'),
  aiVisibilityRunsPerMonth: integer('ai_visibility_runs_per_month').default(1),
  aiVisibilityRunsUsed: integer('ai_visibility_runs_used').default(0),
  aiVisibilityResetAt: timestamp('ai_visibility_reset_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const businessProfileTable = pgTable('business_profile', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tagline: text('tagline'),
  industry: text('industry'),
  description: text('description'),
  targetAudience: text('target_audience'),
  toneOfVoice: text('tone_of_voice'),
  website: text('website'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  country: text('country'),
  currency: text('currency').default('USD'),
  taxRate: doublePrecision('tax_rate').default(0),
  taxId: text('tax_id'),
  logoUrl: text('logo_url'),
  logoConfig: jsonb('logo_config').$type<any>(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const settingsTable = pgTable('settings', {
  id: text('id').primaryKey(),
  activeProvider: text('active_provider').default('groq').notNull(),
  providerKeys: jsonb('provider_keys').$type<Record<string, string>>().notNull(),
  theme: text('theme').default('dark').notNull(),
  autoSave: boolean('auto_save').default(true).notNull(),
  defaultCurrency: text('default_currency').default('USD').notNull(),
  defaultTaxRate: doublePrecision('default_tax_rate').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customersTable = pgTable('customers', {
  id: text('id').primaryKey(),
  businessId: text('business_id'),
  userEmail: text('user_email'),
  name: text('name').notNull(),
  company: text('company'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  source: text('source').default('manual').notNull(),
  status: text('status').default('lead').notNull(), // 'lead' | 'prospect' | 'customer' | 'inactive' | 'lost'
  value: doublePrecision('value').default(0).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  notes: text('notes'),
  lastContactAt: timestamp('last_contact_at'),
  pipelineStage: text('pipeline_stage').default('new_lead'),
  service: text('service'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Leads table for inquiries, website form submissions, and prospect capture
export const leadsTable = pgTable('leads', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').references(() => customersTable.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  source: text('source').default('website_form').notNull(), // 'website_form' | 'manual' | 'imported' | 'connected_crm'
  status: text('status').default('new').notNull(), // 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  inquiryType: text('inquiry_type'),
  message: text('message'),
  budget: text('budget'),
  value: doublePrecision('value').default(0),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customer Notes
export const customerNotesTable = pgTable('customer_notes', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull().references(() => customersTable.id, { onDelete: 'cascade' }),
  author: text('author'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customer Activities (Timeline & Audit Trail)
export const customerActivitiesTable = pgTable('customer_activities', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull().references(() => customersTable.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'lead_created' | 'email_received' | 'call_logged' | 'note_added' | 'status_changed' | 'proposal_created' | 'proposal_sent' | 'invoice_created' | 'invoice_paid' | 'task_created' | 'meeting_logged'
  title: text('title').notNull(),
  description: text('description'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customer Tags
export const customerTagsTable = pgTable('customer_tags', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').references(() => customersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').default('slate'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customer Sources
export const customerSourcesTable = pgTable('customer_sources', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // 'website_form' | 'manual' | 'imported' | 'connected_crm'
  label: text('label').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customer Tasks
export const customerTasksTable = pgTable('customer_tasks', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull().references(() => customersTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  dueDate: text('due_date'),
  completed: boolean('completed').default(false).notNull(),
  priority: text('priority').default('medium').notNull(), // 'low' | 'medium' | 'high'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const projectsTable = pgTable('projects', {
  id: text('id').primaryKey(),
  businessId: text('business_id').references(() => businessesTable.id, { onDelete: 'cascade' }),
  clientBusinessId: text('client_business_id'),
  userEmail: text('user_email'),
  name: text('name'),
  title: text('title').notNull(),
  customerId: text('customer_id').references(() => customersTable.id),
  customerName: text('customer_name'),
  client: text('client'),
  status: text('status').default('planning').notNull(),
  priority: text('priority').default('medium').notNull(),
  budget: doublePrecision('budget').default(0).notNull(),
  startDate: text('start_date'),
  targetDate: text('target_date'),
  dueDate: text('due_date'),
  owner: text('owner'),
  progress: doublePrecision('progress').default(0),
  description: text('description'),
  tasks: jsonb('tasks').$type<{ id: string; title: string; completed: boolean }[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workTasksTable = pgTable('work_tasks', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  clientBusinessId: text('client_business_id'),
  projectId: text('project_id').references(() => projectsTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('todo').notNull(), // 'todo' | 'in_progress' | 'blocked' | 'completed'
  priority: text('priority').default('medium').notNull(), // 'low' | 'medium' | 'high'
  dueDate: text('due_date'),
  assignedTo: text('assigned_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const notesTable = pgTable('notes', {
  id: text('id').primaryKey(),
  userEmail: text('user_email'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').default('general').notNull(),
  entityId: text('entity_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoicesTable = pgTable('invoices', {
  id: text('id').primaryKey(),
  businessId: text('business_id').references(() => businessesTable.id, { onDelete: 'cascade' }),
  clientBusinessId: text('client_business_id'),
  userEmail: text('user_email'),
  invoiceNumber: text('invoice_number').notNull(),
  customerId: text('customer_id'),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email'),
  customerAddress: text('customer_address'),
  issueDate: text('issue_date').notNull(),
  dueDate: text('due_date').notNull(),
  currency: text('currency').default('USD').notNull(),
  status: text('status').default('draft').notNull(),
  subtotal: doublePrecision('subtotal').default(0).notNull(),
  taxRate: doublePrecision('tax_rate').default(0).notNull(),
  taxAmount: doublePrecision('tax_amount').default(0).notNull(),
  discountAmount: doublePrecision('discount_amount').default(0).notNull(),
  total: doublePrecision('total').default(0).notNull(),
  notes: text('notes'),
  paymentTerms: text('payment_terms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoiceItemsTable = pgTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => invoicesTable.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  unitPrice: doublePrecision('unit_price').default(0).notNull(),
  amount: doublePrecision('amount').default(0).notNull(),
});

export const proposalsTable = pgTable('proposals', {
  id: text('id').primaryKey(),
  businessId: text('business_id').references(() => businessesTable.id, { onDelete: 'cascade' }),
  clientBusinessId: text('client_business_id'),
  userEmail: text('user_email'),
  title: text('title').notNull(),
  type: text('type').default('proposal').notNull(),
  customerId: text('customer_id'),
  customerName: text('customer_name'),
  status: text('status').default('draft').notNull(),
  summary: text('summary'),
  scopeOfWork: text('scope_of_work'),
  deliverables: jsonb('deliverables').$type<string[]>().default([]),
  timeline: text('timeline'),
  pricingBreakdown: jsonb('pricing_breakdown').$type<{ item: string; cost: number }[]>().default([]),
  totalAmount: doublePrecision('total_amount').default(0),
  termsAndConditions: text('terms_and_conditions'),
  generatedContent: text('generated_content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documentsTable = pgTable('documents', {
  id: text('id').primaryKey(),
  businessId: text('business_id').references(() => businessesTable.id, { onDelete: 'cascade' }),
  clientBusinessId: text('client_business_id'),
  userEmail: text('user_email'),
  customerId: text('customer_id'),
  leadId: text('lead_id'),
  projectId: text('project_id'),
  proposalId: text('proposal_id'),
  title: text('title').notNull(),
  type: text('type').notNull(),
  content: text('content').notNull(),
  prompt: text('prompt'),
  targetAudience: text('target_audience'),
  tone: text('tone'),
  source: text('source').default('manual'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workTemplatesTable = pgTable('work_templates', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  clientBusinessId: text('client_business_id'),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'proposal' | 'document' | 'invoice' | 'task_list'
  description: text('description'),
  content: text('content'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiConversationsTable = pgTable('ai_conversations', {
  id: text('id').primaryKey(),
  userEmail: text('user_email'),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiMessagesTable = pgTable('ai_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').references(() => aiConversationsTable.id, { onDelete: 'cascade' }),
  sender: text('sender').notNull(), // 'user' | 'assistant'
  text: text('text').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  contextAttached: jsonb('context_attached').$type<{
    type: 'customer' | 'project' | 'document' | 'invoice';
    id: string;
    label: string;
  }>(),
});

export const activityLogsTable = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userEmail: text('user_email'),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const newsletterSubscribersTable = pgTable('newsletter_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  source: text('source').default('website'),
  status: text('status').default('active'),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
});

export const transactionsTable = pgTable('payment_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userEmail: text('user_email').notNull(),
  userName: text('user_name'),
  planTier: text('plan_tier').notNull(),
  billingCycle: text('billing_cycle').notNull(),
  amount: doublePrecision('amount').notNull(),
  currency: text('currency').default('USD').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'whop' | 'card' | 'apple_pay' | 'google_pay' | 'paypal'
  whopDetails: jsonb('whop_details').$type<{
    membershipId?: string;
    subscriptionId?: string;
    paymentId?: string;
    planId?: string;
    companyId?: string;
    status?: string;
    customerPortalUrl?: string;
    receiptUrl?: string;
    paymentMethodBrand?: string;
  }>(),
  lemonSqueezyDetails: jsonb('lemon_squeezy_details').$type<{
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
  }>(),
  cardDetails: jsonb('card_details').$type<{
    brand?: string;
    last4?: string;
    expMonth?: string;
    expYear?: string;
    cardholderName?: string;
    country?: string;
    postalCode?: string;
    isTestCard?: boolean;
    walletType?: 'apple_pay' | 'google_pay' | 'none';
  }>(),
  payoneerDetails: jsonb('payoneer_details').$type<any>(),
  bankTransferDetails: jsonb('bank_transfer_details').$type<any>(),
  status: text('status').notNull(), // 'success' | 'failed' | 'cancelled' | 'pending' | 'refunded'
  failureReason: text('failure_reason'),
  refundedAmount: doublePrecision('refunded_amount'),
  refundReason: text('refund_reason'),
  refundedAt: text('refunded_at'),
  invoiceId: text('invoice_id'),
  isTestMode: boolean('is_test_mode').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const seoCacheTable = pgTable('seo_cache', {
  id: text('id').primaryKey(),
  cacheKey: text('cache_key').notNull().unique(),
  cacheType: text('cache_type').notNull(), // 'keyword_matrix' | 'domain_traffic' | 'backlinks' | 'serp_ranking'
  tier: text('tier').notNull(), // 'free' | 'pro'
  domainOrQuery: text('domain_or_query').notNull(),
  data: jsonb('data').$type<any>().notNull(),
  provider: text('provider').notNull(), // 'serper' | 'serpapi' | 'scaleserp' | 'valueserp' | 'dataforseo' | 'dom_heuristic'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const seoDataCacheTable = pgTable('seo_data_cache', {
  id: text('id').primaryKey(),
  cacheKey: text('cache_key').notNull().unique(),
  payload: jsonb('payload').$type<any>().notNull(),
  fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const aiVisibilityChecksTable = pgTable('ai_visibility_checks', {
  id: text('id').primaryKey(),
  businessId: text('business_id'),
  userId: text('user_id').notNull(),
  userEmail: text('user_email'),
  businessName: text('business_name'),
  query: text('query').notNull(),
  date: text('date').notNull(),
  location: text('location').notNull(),
  provider: text('provider').notNull(),
  businessMentioned: boolean('business_mentioned').notNull(),
  position: integer('position'),
  competitorsMentioned: jsonb('competitors_mentioned').$type<string[]>().default([]),
  citationSources: jsonb('citation_sources').$type<string[]>().default([]),
  rawObservation: text('raw_observation').notNull(),
  // Backward compatibility fields
  prompt: text('prompt'),
  mentioned: boolean('mentioned'),
  responseSnippet: text('response_snippet'),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
});

// ================= PRODUCTION DATA ARCHITECTURE ENTITIES =================
// Every record belongs to the authenticated business_id.

// 1. Businesses
export const businessesTable = pgTable('businesses', {
  id: text('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  name: text('name').notNull(),
  slug: text('slug'),
  industry: text('industry').default('Local Services'),
  category: text('category').default('Local Business'),
  tagline: text('tagline'),
  description: text('description'),
  targetAudience: text('target_audience'),
  toneOfVoice: text('tone_of_voice'),
  website: text('website'),
  phone: text('phone'),
  email: text('email'),
  legalName: text('legal_name'),
  services: jsonb('services').$type<string[]>(),
  serviceAreas: jsonb('service_areas').$type<string[]>(),
  goals: jsonb('goals').$type<string[]>(),
  brandVoice: text('brand_voice'),
  planTier: text('plan_tier').default('pro').notNull(), // 'free' | 'pro' | 'agency'
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Locations
export const locationsTable = pgTable('locations', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  country: text('country').default('United States'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  phone: text('phone'),
  hours: jsonb('hours').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Business Brain (AI Core Synthesis)
export const businessBrainTable = pgTable('business_brain', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  score: integer('score').default(0).notNull(),
  readinessScore: integer('readiness_score').default(0).notNull(),
  summary: text('summary'),
  swot: jsonb('swot').$type<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  }>(),
  priorities: jsonb('priorities').$type<any[]>(),
  lastSynthesizedAt: timestamp('last_synthesized_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Data Connections (Central Provider Integration State)
export const dataConnectionsTable = pgTable('data_connections', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'google_gbp' | 'google_search_console' | 'google_analytics' | 'crawler'
  status: text('status').default('disconnected').notNull(), // 'connected' | 'disconnected' | 'syncing' | 'error'
  connectedAt: timestamp('connected_at'),
  lastSyncedAt: timestamp('last_synced_at'),
  credentialsEncrypted: text('credentials_encrypted'),
  config: jsonb('config').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Google Connections
export const googleConnectionsTable = pgTable('google_connections', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  accountId: text('account_id'),
  email: text('email'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  status: text('status').default('active').notNull(),
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Google Business Locations
export const googleBusinessLocationsTable = pgTable('google_business_locations', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  connectionId: text('connection_id'),
  locationId: text('location_id').notNull(),
  locationName: text('location_name').notNull(),
  address: text('address'),
  rating: doublePrecision('rating').default(0).notNull(),
  reviewCount: integer('review_count').default(0).notNull(),
  completenessScore: integer('completeness_score').default(0).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  attributes: jsonb('attributes').$type<string[]>(),
  hours: jsonb('hours').$type<string[]>(),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
});

// 7. Google Reviews
export const googleReviewsTable = pgTable('google_reviews', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  locationId: text('location_id'),
  reviewId: text('review_id').notNull(),
  authorName: text('author_name').notNull(),
  authorPhotoUrl: text('author_photo_url'),
  rating: integer('rating').notNull(),
  text: text('text'),
  sentiment: text('sentiment').default('neutral'), // 'positive' | 'neutral' | 'negative'
  publishedAt: timestamp('published_at').notNull(),
  replyText: text('reply_text'),
  repliedAt: timestamp('replied_at'),
  isAnswered: boolean('is_answered').default(false).notNull(),
  source: text('source').default('google_gbp'), // 'google_gbp' | 'yelp' | 'facebook' | 'trustpilot' | 'user_entered'
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
});

// 8. Google Profile Metrics
export const googleProfileMetricsTable = pgTable('google_profile_metrics', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  locationId: text('location_id'),
  metricDate: text('metric_date').notNull(),
  viewsSearch: integer('views_search').default(0).notNull(),
  viewsMaps: integer('views_maps').default(0).notNull(),
  actionsWebsite: integer('actions_website').default(0).notNull(),
  actionsPhone: integer('actions_phone').default(0).notNull(),
  actionsDirections: integer('actions_directions').default(0).notNull(),
  period: text('period').default('daily').notNull(),
});

// 9. Search Console Connections
export const searchConsoleConnectionsTable = pgTable('search_console_connections', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  siteUrl: text('site_url').notNull(),
  permissionLevel: text('permission_level').default('siteOwner'),
  status: text('status').default('connected').notNull(),
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 10. Search Console Queries
export const searchConsoleQueriesTable = pgTable('search_console_queries', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  query: text('query').notNull(),
  clicks: integer('clicks').default(0).notNull(),
  impressions: integer('impressions').default(0).notNull(),
  ctr: doublePrecision('ctr').default(0).notNull(),
  position: doublePrecision('position').default(0).notNull(),
  date: text('date').notNull(),
  device: text('device'),
  country: text('country'),
});

// 11. Search Console Pages
export const searchConsolePagesTable = pgTable('search_console_pages', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  pageUrl: text('page_url').notNull(),
  clicks: integer('clicks').default(0).notNull(),
  impressions: integer('impressions').default(0).notNull(),
  ctr: doublePrecision('ctr').default(0).notNull(),
  position: doublePrecision('position').default(0).notNull(),
  date: text('date').notNull(),
});

// 12. Analytics Connections
export const analyticsConnectionsTable = pgTable('analytics_connections', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  propertyId: text('property_id').notNull(),
  streamId: text('stream_id'),
  status: text('status').default('connected').notNull(),
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 13. Analytics Metrics
export const analyticsMetricsTable = pgTable('analytics_metrics', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  metricDate: text('metric_date').notNull(),
  sessions: integer('sessions').default(0).notNull(),
  pageviews: integer('pageviews').default(0).notNull(),
  users: integer('users').default(0).notNull(),
  bounceRate: doublePrecision('bounce_rate').default(0).notNull(),
  avgSessionDuration: doublePrecision('avg_session_duration').default(0).notNull(),
  channels: jsonb('channels').$type<{ channel: string; percentage: number }[]>(),
});

// 14. Competitors
export const competitorsTable = pgTable('competitors', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  website: text('website'),
  address: text('address'),
  googlePlaceId: text('google_place_id'),
  rating: doublePrecision('rating').default(0),
  reviewCount: integer('review_count').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 15. Competitor Snapshots
export const competitorSnapshotsTable = pgTable('competitor_snapshots', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  competitorId: text('competitor_id').notNull().references(() => competitorsTable.id, { onDelete: 'cascade' }),
  snapshotDate: text('snapshot_date').notNull(),
  rating: doublePrecision('rating').default(0),
  reviewCount: integer('review_count').default(0),
  estTraffic: integer('est_traffic').default(0),
  rankingKeywordsCount: integer('ranking_keywords_count').default(0),
  sharedKeywords: jsonb('shared_keywords').$type<string[]>(),
  strengths: jsonb('strengths').$type<string[]>(),
  weaknesses: jsonb('weaknesses').$type<string[]>(),
});

// 16. Website Projects
export const websiteProjectsTable = pgTable('website_projects', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  targetUrl: text('target_url').notNull(),
  sitemapUrl: text('sitemap_url'),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 17. Crawl Runs
export const crawlRunsTable = pgTable('crawl_runs', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  projectId: text('project_id').notNull().references(() => websiteProjectsTable.id, { onDelete: 'cascade' }),
  status: text('status').default('completed').notNull(), // 'pending' | 'running' | 'completed' | 'failed'
  pagesCrawled: integer('pages_crawled').default(1).notNull(),
  issuesFound: integer('issues_found').default(0).notNull(),
  perfScore: integer('perf_score').default(0).notNull(),
  seoScore: integer('seo_score').default(0).notNull(),
  accessibilityScore: integer('accessibility_score').default(0).notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// 18. Website Pages
export const websitePagesTable = pgTable('website_pages', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  projectId: text('project_id').notNull(),
  crawlRunId: text('crawl_run_id'),
  url: text('url').notNull(),
  path: text('path').notNull(),
  statusCode: integer('status_code').default(200).notNull(),
  title: text('title'),
  metaDescription: text('meta_description'),
  h1: text('h1'),
  wordCount: integer('word_count').default(0),
  loadTimeMs: integer('load_time_ms').default(0),
  hasSchema: boolean('has_schema').default(false).notNull(),
});

// 19. Website Issues
export const websiteIssuesTable = pgTable('website_issues', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  projectId: text('project_id').notNull(),
  crawlRunId: text('crawl_run_id'),
  severity: text('severity').notNull(), // 'critical' | 'warning' | 'info'
  category: text('category').notNull(), // 'seo' | 'performance' | 'schema' | 'security'
  title: text('title').notNull(),
  description: text('description').notNull(),
  recommendation: text('recommendation'),
  pageUrl: text('page_url'),
  isResolved: boolean('is_resolved').default(false).notNull(),
});

// 20. Schema Data
export const schemaDataTable = pgTable('schema_data', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  projectId: text('project_id').notNull(),
  pageUrl: text('page_url').notNull(),
  schemaType: text('schema_type').notNull(), // 'LocalBusiness' | 'Organization' | 'FAQPage'
  rawJsonld: jsonb('raw_jsonld').$type<Record<string, any>>().notNull(),
  validationErrors: jsonb('validation_errors').$type<string[]>(),
  isValid: boolean('is_valid').default(true).notNull(),
});

// 21. Tracked Keywords
export const trackedKeywordsTable = pgTable('tracked_keywords', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  keyword: text('keyword').notNull(),
  targetLocation: text('target_location'),
  searchVolume: integer('search_volume').default(0),
  difficulty: integer('difficulty').default(0),
  intent: text('intent').default('commercial'), // 'commercial' | 'informational' | 'navigational' | 'transactional'
  tags: jsonb('tags').$type<string[]>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 22. Rank Snapshots
export const rankSnapshotsTable = pgTable('rank_snapshots', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  keywordId: text('keyword_id').notNull().references(() => trackedKeywordsTable.id, { onDelete: 'cascade' }),
  snapshotDate: text('snapshot_date').notNull(),
  rankPosition: integer('rank_position').default(0).notNull(),
  previousPosition: integer('previous_position').default(0),
  searchEngine: text('search_engine').default('google').notNull(),
  device: text('device').default('desktop').notNull(),
});

// 23. SERP Results
export const serpResultsTable = pgTable('serp_results', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  keywordId: text('keyword_id').notNull(),
  snapshotDate: text('snapshot_date').notNull(),
  rank: integer('rank').notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  snippet: text('snippet'),
  isClient: boolean('is_client').default(false).notNull(),
  isCompetitor: boolean('is_competitor').default(false).notNull(),
});

// 24. Visibility Snapshots
export const visibilitySnapshotsTable = pgTable('visibility_snapshots', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  snapshotDate: text('snapshot_date').notNull(),
  localPackRank: integer('local_pack_rank').default(0),
  threePackPresent: boolean('three_pack_present').default(false).notNull(),
  aiVisibilityScore: integer('ai_visibility_score').default(0).notNull(),
  shareOfVoice: doublePrecision('share_of_voice').default(0),
  score: integer('score').default(0).notNull(),
});

// 25. Growth Opportunities
export const growthOpportunitiesTable = pgTable('growth_opportunities', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'review_reply' | 'schema_fix' | 'content_gap' | 'citation' | 'speed' | 'gbp_profile' | 'ranking'
  urgency: text('urgency').default('opportunity').notNull(), // 'high' | 'opportunity' | 'good'
  title: text('title').notNull(),
  description: text('description').notNull(),
  whyItMatters: text('why_it_matters'),
  evidence: text('evidence').notNull(),
  expectedImpact: text('expected_impact'),
  actionType: text('action_type').notNull(),
  status: text('status').default('open').notNull(), // 'open' | 'in_progress' | 'completed' | 'dismissed'
  source: text('source').notNull().default('detector'), // 'google_business_profile' | 'reputation' | 'technical_seo' | 'local_visibility' | 'competitor_intelligence'
  severity: text('severity').notNull().default('medium'), // 'critical' | 'high' | 'medium' | 'low'
  confidence: doublePrecision('confidence').notNull().default(0.95),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
});

// 26. Growth Plans
export const growthPlansTable = pgTable('growth_plans', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  objective: text('objective').notNull(),
  status: text('status').default('active').notNull(), // 'draft' | 'active' | 'completed' | 'paused'
  startDate: text('start_date'),
  targetDate: text('target_date'),
  progress: integer('progress').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 27. Growth Tasks
export const growthTasksTable = pgTable('growth_tasks', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  planId: text('plan_id').references(() => growthPlansTable.id, { onDelete: 'cascade' }),
  opportunityId: text('opportunity_id').references(() => growthOpportunitiesTable.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority').default('medium').notNull(), // 'high' | 'medium' | 'low'
  status: text('status').default('todo').notNull(), // 'todo' | 'in_progress' | 'done'
  assignedTo: text('assigned_to'),
  dueDate: text('due_date'),
  completedAt: timestamp('completed_at'),
});

// 28. AI Actions
export const aiActionsTable = pgTable('ai_actions', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  actionType: text('action_type').notNull(),
  title: text('title').notNull(),
  payload: jsonb('payload').$type<Record<string, any>>(),
  status: text('status').default('completed').notNull(), // 'pending' | 'completed' | 'failed'
  executedAt: timestamp('executed_at').defaultNow().notNull(),
  result: jsonb('result').$type<Record<string, any>>(),
});

// 29. Reports
export const reportsTable = pgTable('reports', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type').default('audit').notNull(), // 'audit' | 'ranking' | 'monthly' | 'executive'
  dateRange: text('date_range'),
  summary: text('summary'),
  pdfUrl: text('pdf_url'),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
});

// 30. Notifications
export const notificationsTable = pgTable('notifications', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businessesTable.id, { onDelete: 'cascade' }),
  userEmail: text('user_email').notNull(),
  type: text('type').notNull(), // 'opportunity' | 'alert' | 'review' | 'system'
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});





