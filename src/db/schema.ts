import { pgTable, text, timestamp, integer, doublePrecision, jsonb, boolean, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // System User UID
  email: text('email').notNull(),
  name: text('name'),
  companyName: text('company_name'),
  role: text('role').default('customer'),
  planTier: text('plan_tier').default('free'),
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
  userEmail: text('user_email'),
  name: text('name').notNull(),
  company: text('company'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  status: text('status').default('lead').notNull(),
  value: doublePrecision('value').default(0).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectsTable = pgTable('projects', {
  id: text('id').primaryKey(),
  userEmail: text('user_email'),
  title: text('title').notNull(),
  customerId: text('customer_id').references(() => customersTable.id),
  customerName: text('customer_name'),
  status: text('status').default('planning').notNull(),
  budget: doublePrecision('budget').default(0).notNull(),
  startDate: text('start_date'),
  targetDate: text('target_date'),
  description: text('description'),
  tasks: jsonb('tasks').$type<{ id: string; title: string; completed: boolean }[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
  userEmail: text('user_email'),
  invoiceNumber: text('invoice_number').notNull(),
  customerId: text('customer_id'),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email'),
  customerAddress: text('customer_address'),
  issueDate: text('issue_date').notNull(),
  dueDate: text('due_date').notNull(),
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
});

export const documentsTable = pgTable('documents', {
  id: text('id').primaryKey(),
  userEmail: text('user_email'),
  title: text('title').notNull(),
  type: text('type').notNull(),
  content: text('content').notNull(),
  prompt: text('prompt'),
  targetAudience: text('target_audience'),
  tone: text('tone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
  paymentMethod: text('payment_method').notNull(), // 'whop' | 'paddle' | 'lemonsqueezy' | 'card' | 'apple_pay' | 'google_pay' | 'paypal'
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
  paddleDetails: jsonb('paddle_details').$type<{
    subscriptionId?: string;
    transactionId?: string;
    customerId?: string;
    priceId?: string;
    status?: string;
    customerPortalUrl?: string;
    updatePaymentMethodUrl?: string;
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
