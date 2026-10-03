import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { generateCompletion } from './aiEngine.ts';
import { db, schema } from '../src/db/index.ts';
import { eq, desc, and } from 'drizzle-orm';
import { getBusinessRecordById, getBusinessRecordFromLocoraDb } from './locoraDataEngine.ts';

// Storage paths
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCORA_EMAIL_EVENTS_FILE = path.join(DATA_DIR, 'locora_email_events.json');

// Ensure DATA_DIR exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export type GbpConnectionState = 'connected' | 'not_connected' | 'error';
export type ReviewAvailabilityState = 'available' | 'aggregate_only' | 'unavailable';
export type GscConnectionState = 'connected' | 'not_connected' | 'error';
export type Ga4ConnectionState = 'connected' | 'not_connected' | 'error';
export type WebsiteAnalyzedState = 'analyzed' | 'not_analyzed' | 'error';

export interface DirectoryEmailEvent {
  id: string;
  userId: string;
  businessId: string;
  recipientEmail?: string;
  recipient: string;
  email: string;
  eventType: 'directory_listing_updated';
  template: 'directory_listing_updated_gbp_not_connected' | 'directory_listing_updated_gbp_connected';
  variant: 'variant_a' | 'variant_b' | 'AUTO' | 'GBP_CONNECTED' | 'GBP_NOT_CONNECTED';
  timestamp: string;
  sentAt: string;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'skipped' | 'simulated';
  error: string | null;
  providerMessageId?: string;
  syncVersion: string; // e.g. 'v1'
  eventKey: string; // e.g. `dir_sync_${businessId}_v1`
  metadata?: Record<string, any>;
}

/**
 * Strict sanitizer: ensures zero OAuth tokens, SMTP passwords, or sensitive credentials are ever logged or persisted
 */
export function sanitizeLogMetadata(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeLogMetadata);
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lower = key.toLowerCase();
    if (
      lower.includes('token') ||
      lower.includes('secret') ||
      lower.includes('password') ||
      lower.includes('pass') ||
      (lower.includes('key') && !lower.includes('eventkey') && !lower.includes('keyword')) ||
      lower.includes('auth') ||
      lower.includes('credential') ||
      lower.includes('bearer')
    ) {
      continue; // Strictly omit sensitive credentials
    }
    clean[key] = typeof value === 'object' ? sanitizeLogMetadata(value) : value;
  }
  return clean;
}

export interface RealBusinessEmailContext {
  businessId: string;
  userId: string;
  ownerEmail: string;
  businessName: string;
  businessCategory: string;
  city: string;
  state: string;
  locationDisplay: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  services: string[];
  directoryStatus: string;
  directorySlug: string;
  directoryUrl: string;
  gbpStatus: GbpConnectionState;
  gscStatus: GscConnectionState;
  ga4Status: Ga4ConnectionState;
  websiteAnalyzedStatus: WebsiteAnalyzedState;
  reviewAvailabilityStatus: ReviewAvailabilityState;
  realReviewCount: number;
  realRating: number | null;
  realOpportunityCount: number;
  unansweredReviewsCount: number;
  seoOpportunitiesCount: number;
  localVisibilityOpportunitiesCount: number;
  isDeletedOrSuspended: boolean;
  topOpportunities: Array<{
    id: string;
    title: string;
    category?: string;
    impact?: string;
  }>;
  availableDirectoryFields: Array<{
    label: string;
    value: string;
  }>;
  updatedFieldsSummary: string[];
}

export interface AIPersonalizedEmailCopy {
  greeting: string;
  whatHappened: string;
  connectionSummary: string;
  nextStepsOverview: string;
  isAiGenerated: boolean;
}

// In-Memory Idempotency Cache
const emailEventsMap = new Map<string, DirectoryEmailEvent>();
let dbTableEnsured = false;

// Initialize disk storage into memory
function loadEmailEventsFromDisk(): void {
  try {
    if (fs.existsSync(LOCORA_EMAIL_EVENTS_FILE)) {
      const raw = fs.readFileSync(LOCORA_EMAIL_EVENTS_FILE, 'utf-8');
      if (raw && raw.trim().length > 0) {
        const list: DirectoryEmailEvent[] = JSON.parse(raw);
        for (const evt of list) {
          if (evt && evt.eventKey) {
            emailEventsMap.set(evt.eventKey, evt);
          }
        }
        console.log(`[Directory Email Automation] Loaded ${emailEventsMap.size} email events from disk.`);
      }
    }
  } catch (err: any) {
    console.warn('[Directory Email Automation] Error reading email events from disk:', err.message);
  }
}

// Persist events to disk
function saveEmailEventsToDisk(): void {
  try {
    const list = Array.from(emailEventsMap.values());
    fs.writeFileSync(LOCORA_EMAIL_EVENTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err: any) {
    console.error('[Directory Email Automation] Failed to save email events to disk:', err.message);
  }
}

// Load events on startup
loadEmailEventsFromDisk();

/**
 * Ensure PostgreSQL email_events table exists
 */
async function ensureDbTable(): Promise<void> {
  if (dbTableEnsured) return;
  try {
    const pool = (global as any)._postgresPool;
    if (pool) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS email_events (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          business_id TEXT NOT NULL,
          recipient_email TEXT,
          email TEXT NOT NULL,
          event_type TEXT NOT NULL,
          template TEXT NOT NULL,
          variant TEXT,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          status TEXT NOT NULL,
          error TEXT,
          provider_message_id TEXT,
          sync_version TEXT NOT NULL,
          event_key TEXT NOT NULL UNIQUE,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        ALTER TABLE email_events ADD COLUMN IF NOT EXISTS recipient_email TEXT;
        ALTER TABLE email_events ADD COLUMN IF NOT EXISTS variant TEXT;
        ALTER TABLE email_events ADD COLUMN IF NOT EXISTS provider_message_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_email_events_biz_key ON email_events(business_id, event_key);
        CREATE INDEX IF NOT EXISTS idx_email_events_msg_id ON email_events(provider_message_id);
      `);
      dbTableEnsured = true;
    }
  } catch (err: any) {
    console.warn('[Directory Email Automation] DB table ensure notice:', err.message);
  }
}

/**
 * Check if an email event has already been successfully sent/dispatched for this business + version
 */
export async function hasEmailEventBeenSent(eventKey: string): Promise<boolean> {
  // 1. Check in-memory map
  const cached = emailEventsMap.get(eventKey);
  if (cached && (cached.status === 'sent' || cached.status === 'simulated' || cached.status === 'delivered')) {
    return true;
  }

  // 2. Check PostgreSQL if available
  try {
    const rows = await db
      .select({ id: schema.emailEventsTable.id, status: schema.emailEventsTable.status })
      .from(schema.emailEventsTable)
      .where(eq(schema.emailEventsTable.eventKey, eventKey))
      .limit(1);

    if (rows.length > 0 && (rows[0].status === 'sent' || rows[0].status === 'simulated' || rows[0].status === 'delivered')) {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Persist an email event record across all storage layers (Memory, Disk, PostgreSQL)
 * Enforces strict sanitization: zero OAuth tokens, SMTP passwords, or sensitive credentials.
 */
export async function recordEmailEvent(rawEvent: DirectoryEmailEvent): Promise<DirectoryEmailEvent> {
  const timestamp = rawEvent.timestamp || rawEvent.sentAt || new Date().toISOString();
  const recipient = (rawEvent.recipientEmail || rawEvent.recipient || rawEvent.email || '').trim().toLowerCase();

  const event: DirectoryEmailEvent = {
    ...rawEvent,
    timestamp,
    sentAt: timestamp,
    recipient,
    recipientEmail: recipient,
    email: recipient,
    providerMessageId: rawEvent.providerMessageId || rawEvent.metadata?.messageId || undefined,
    metadata: sanitizeLogMetadata(rawEvent.metadata || {}),
  };

  // Structured Logging (Section 7)
  console.log(
    `[DirectoryUpdateEmailService] Event: directory_listing_updated | Variant: ${event.variant} | Template: ${event.template} | Business: ${event.businessId} | User: ${event.userId} | Recipient: ${event.recipient} | Timestamp: ${event.timestamp} | Status: ${event.status} | Version: ${event.syncVersion}${event.providerMessageId ? ` | MsgId: ${event.providerMessageId}` : ''}${event.error ? ` | Error: ${event.error}` : ''}`
  );

  // 1. In-memory
  emailEventsMap.set(event.eventKey, event);

  // 2. Disk JSON
  saveEmailEventsToDisk();

  // 3. PostgreSQL
  try {
    await ensureDbTable();
    await db
      .insert(schema.emailEventsTable)
      .values({
        id: event.id,
        userId: event.userId || null,
        businessId: event.businessId,
        recipientEmail: event.recipient,
        email: event.recipient,
        eventType: event.eventType,
        template: event.template,
        variant: event.variant,
        sentAt: new Date(event.sentAt),
        status: event.status,
        error: event.error || null,
        providerMessageId: event.providerMessageId || null,
        syncVersion: event.syncVersion,
        eventKey: event.eventKey,
        metadata: event.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.emailEventsTable.eventKey,
        set: {
          status: event.status,
          error: event.error || null,
          providerMessageId: event.providerMessageId || null,
          variant: event.variant,
          sentAt: new Date(event.sentAt),
          metadata: event.metadata || {},
          updatedAt: new Date(),
        },
      });
  } catch (err: any) {
    console.warn('[Directory Email Automation] DB insert notice:', err.message);
  }

  // 4. Record canonical directory event in directory events store
  try {
    const { recordDirectoryEvent } = await import('./locoraDataEngine.ts');
    recordDirectoryEvent({
      eventType: 'directory_listing_updated',
      businessId: event.businessId,
      userId: event.userId,
      metadata: {
        template: event.template,
        variant: event.variant,
        recipient: event.recipient,
        status: event.status,
        syncVersion: event.syncVersion,
      },
    });
  } catch {}

  // 5. System notification for user workspace
  try {
    await db
      .insert(schema.notificationsTable)
      .values({
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        businessId: event.businessId,
        userEmail: event.recipient,
        type: 'alert',
        title: 'Directory Listing Synced & Updated',
        message: `Your Locora AI directory listing was successfully updated. Email status: ${event.status}.`,
        link: `/directory`,
        isRead: false,
        createdAt: new Date(),
      })
      .catch(() => {});
  } catch {}

  return event;
}

/**
 * Update the delivery or bounce status of an email audit event by eventKey, providerMessageId, or eventId
 */
export async function updateEmailEventStatus(
  identifier: string,
  update: {
    status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'skipped' | 'simulated';
    providerMessageId?: string;
    error?: string | null;
  }
): Promise<boolean> {
  if (!identifier) return false;

  // 1. Update in-memory map
  let found = false;
  for (const [key, evt] of emailEventsMap.entries()) {
    if (
      key === identifier ||
      evt.eventKey === identifier ||
      evt.providerMessageId === identifier ||
      evt.id === identifier
    ) {
      evt.status = update.status;
      if (update.providerMessageId) evt.providerMessageId = update.providerMessageId;
      if (update.error !== undefined) evt.error = update.error;
      emailEventsMap.set(key, evt);
      found = true;
      break;
    }
  }

  // 2. Persist to disk
  saveEmailEventsToDisk();

  // 3. Update PostgreSQL
  try {
    await ensureDbTable();
    const pool = (global as any)._postgresPool;
    if (pool) {
      await pool.query(
        `UPDATE email_events
         SET status = $1,
             provider_message_id = COALESCE($2, provider_message_id),
             error = $3,
             updated_at = NOW()
         WHERE event_key = $4 OR provider_message_id = $4 OR id = $4`,
        [update.status, update.providerMessageId || null, update.error ?? null, identifier]
      );
    }
    return true;
  } catch (err: any) {
    console.warn('[Directory Email Automation] DB update status notice:', err.message);
    return found;
  }
}

/**
 * Retrieve all logged email events with optional filters
 */
export function getEmailEvents(filters?: {
  businessId?: string;
  eventType?: string;
  limit?: number;
}): DirectoryEmailEvent[] {
  let list = Array.from(emailEventsMap.values());
  if (filters?.businessId) {
    list = list.filter((e) => e.businessId === filters.businessId);
  }
  if (filters?.eventType) {
    list = list.filter((e) => e.eventType === filters.eventType);
  }
  list.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  if (filters?.limit && filters.limit > 0) {
    list = list.slice(0, filters.limit);
  }
  return list;
}

// Master Brevo / SMTP sender fallback (reusing same Brevo credentials)
const SENDER_EMAIL = 'support@locoraai.com';
const SENDER_NAME = 'Locora AI';
const DEFAULT_FROM = `${SENDER_NAME} <${SENDER_EMAIL}>`;

let defaultSendEmailFn: ((params: {
  to: string;
  subject: string;
  text?: string;
  html: string;
  replyTo?: string;
  senderName?: string;
}) => Promise<{ success: boolean; provider: string; messageId?: string; error?: string }>) | null = null;

export function registerEmailDispatcher(fn: typeof defaultSendEmailFn) {
  defaultSendEmailFn = fn;
}

/**
 * Fallback direct Brevo/Nodemailer dispatcher if not injected by server.ts
 */
async function dispatchViaBrevoOrFallback(params: {
  to: string;
  subject: string;
  text?: string;
  html: string;
}): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
  if (defaultSendEmailFn) {
    return defaultSendEmailFn(params);
  }

  const host = (process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST || 'smtp-relay.brevo.com').trim();
  const port = Number(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || 587);
  const user = (process.env.BREVO_SMTP_USER || process.env.BREVO_SMTP_LOGIN || process.env.SMTP_USER || '').trim();
  const pass = (process.env.BREVO_SMTP_PASS || process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY || '').trim();
  const fromAddress = (process.env.BREVO_FROM_EMAIL || process.env.SMTP_FROM || DEFAULT_FROM).trim();

  // Try SMTP transport if configured
  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      const info = await transporter.sendMail({
        from: fromAddress.includes('<') ? fromAddress : `Locora AI <${fromAddress}>`,
        to: params.to,
        replyTo: SENDER_EMAIL,
        subject: params.subject,
        text: params.text || params.html.replace(/<[^>]+>/g, ''),
        html: params.html,
      });
      return { success: true, provider: 'brevo_smtp', messageId: info.messageId };
    } catch (smtpErr: any) {
      console.warn('[Directory Email Automation] SMTP send error:', smtpErr.message);
    }
  }

  // Simulated fallback
  console.log(`\n================ [DIRECTORY UPDATE EMAIL DISPATCH (SIMULATED)] ================
TO: ${params.to}
FROM: ${fromAddress}
SUBJECT: ${params.subject}
STATUS: Simulated Brevo Relay
================================================================================\n`);

  return {
    success: true,
    provider: 'simulated_local',
    messageId: `sim_${Date.now()}`,
    error: 'Brevo credentials not configured in environment. Recorded in simulation mode.',
  };
}

// ============================================================================
// 1. REAL BUSINESS EMAIL CONTEXT BUILDER
// ============================================================================

/**
 * Load ONLY real data belonging to the authenticated business_id.
 * Never fabricate missing information.
 */
export async function buildRealBusinessEmailContext(
  businessId: string
): Promise<RealBusinessEmailContext | null> {
  try {
    // 1. Fetch canonical business from DB
    let biz: any = null;
    try {
      const bizRows = await db
        .select()
        .from(schema.businessesTable)
        .where(eq(schema.businessesTable.id, businessId))
        .limit(1);
      if (bizRows.length > 0) {
        biz = bizRows[0];
      }
    } catch {}

    // Fallback to in-memory business record
    const memBiz: any = getBusinessRecordById(businessId) || getBusinessRecordFromLocoraDb(businessId);
    if (!biz && !memBiz) {
      console.warn(`[Directory Email Automation] Business not found for id: ${businessId}`);
      return null;
    }

    const isDeletedOrSuspended = Boolean(
      biz?.status === 'deleted' ||
      biz?.status === 'suspended' ||
      memBiz?.status === 'deleted' ||
      memBiz?.status === 'suspended'
    );

    const businessName =
      biz?.name?.trim() ||
      memBiz?.identity?.name?.trim() ||
      'Your Business';

    const ownerEmail =
      biz?.ownerEmail?.trim() ||
      memBiz?.claimedByEmail?.trim() ||
      memBiz?.userEmail?.trim() ||
      '';

    const userId = biz?.accountId || memBiz?.claimedByEmail || ownerEmail || businessId;

    // 2. Fetch primary location
    let primaryLoc: any = null;
    try {
      const locations = await db
        .select()
        .from(schema.locationsTable)
        .where(eq(schema.locationsTable.businessId, businessId));
      primaryLoc = locations.find((l) => l.isPrimary) || locations[0] || null;
    } catch {}

    if (!primaryLoc && memBiz?.locations && memBiz.locations.length > 0) {
      primaryLoc = memBiz.locations.find((l: any) => l.isMain) || memBiz.locations[0];
    }

    // 3. Fetch Directory Profile
    let dirProfile: any = null;
    try {
      const profRows = await db
        .select()
        .from(schema.directoryProfilesTable)
        .where(eq(schema.directoryProfilesTable.businessId, businessId))
        .limit(1);
      if (profRows.length > 0) {
        dirProfile = profRows[0];
      }
    } catch {}

    // 4. Resolve Location & Category
    const category =
      dirProfile?.category?.trim() ||
      biz?.category?.trim() ||
      biz?.industry?.trim() ||
      memBiz?.identity?.category?.trim() ||
      'Local Business';

    const city =
      dirProfile?.city?.trim() ||
      primaryLoc?.city?.trim() ||
      biz?.cityName?.trim() ||
      memBiz?.identity?.city?.trim() ||
      '';

    const state =
      dirProfile?.region?.trim() ||
      primaryLoc?.state?.trim() ||
      biz?.stateCode?.trim() ||
      memBiz?.identity?.state?.trim() ||
      '';

    const locationDisplay = city && state ? `${city}, ${state}` : (city || state || 'Local Area');

    const directorySlug =
      dirProfile?.slug?.trim() ||
      biz?.slug?.trim() ||
      memBiz?.slug?.trim() ||
      businessId;

    const directoryUrl = dirProfile?.canonicalUrl || `https://directory.locoraai.com/biz/${directorySlug}`;
    const directoryStatus = dirProfile?.status || (memBiz?.isPublishedInDirectory ? 'PUBLISHED' : (memBiz?.directoryStatus || 'ACTIVE'));

    // 5. GBP Connection Status
    let gbpStatus: GbpConnectionState = 'not_connected';
    try {
      const gbpConns = await db
        .select()
        .from(schema.googleConnectionsTable)
        .where(eq(schema.googleConnectionsTable.businessId, businessId))
        .limit(1);

      if (gbpConns.length > 0) {
        const conn = gbpConns[0];
        if (conn.status === 'error') gbpStatus = 'error';
        else if (conn.status === 'connected') gbpStatus = 'connected';
      }
    } catch {}

    let gbpLocs: any[] = [];
    try {
      gbpLocs = await db
        .select()
        .from(schema.googleBusinessLocationsTable)
        .where(eq(schema.googleBusinessLocationsTable.businessId, businessId))
        .limit(1);
    } catch {}

    let dataConns: any[] = [];
    try {
      dataConns = await db
        .select()
        .from(schema.dataConnectionsTable)
        .where(
          and(
            eq(schema.dataConnectionsTable.businessId, businessId),
            eq(schema.dataConnectionsTable.provider, 'google_gbp')
          )
        )
        .limit(1);
    } catch {}

    // Distinguish authentic live Google Business Profile from owner manual input / direct place creation
    const isManualVerification = Boolean(
      memBiz?.sourceAttributions?.verification === 'Manual Input' ||
      memBiz?.sourceAttributions?.verification?.startsWith('Owner Created') ||
      memBiz?.gbpConnected === false ||
      (gbpLocs.length > 0 && gbpLocs[0].locationId?.startsWith('direct_'))
    );

    if (isManualVerification) {
      gbpStatus = 'not_connected';
    } else if (gbpStatus === 'not_connected') {
      if (gbpLocs.length > 0 && gbpLocs[0].isVerified && !gbpLocs[0].locationId?.startsWith('direct_')) {
        gbpStatus = 'connected';
      } else if (dataConns.length > 0 && dataConns[0].status === 'connected') {
        gbpStatus = 'connected';
      } else if (memBiz && (memBiz.gbpConnected || memBiz.gbpData?.connected) && (memBiz.gbpData?.reviewCount ? memBiz.gbpData.reviewCount > 0 : false)) {
        gbpStatus = 'connected';
      }
    }

    // 6. Review Availability Status & Counts
    let reviewAvailabilityStatus: ReviewAvailabilityState = 'unavailable';
    let realReviewCount = 0;
    let realRating: number | null = null;

    try {
      const reviews = await db
        .select()
        .from(schema.googleReviewsTable)
        .where(eq(schema.googleReviewsTable.businessId, businessId));

      if (reviews.length > 0) {
        reviewAvailabilityStatus = 'available';
        realReviewCount = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        realRating = Number((sum / reviews.length).toFixed(1));
      }
    } catch {}

    if (reviewAvailabilityStatus === 'unavailable') {
      if (dirProfile?.googleReviewCount != null && dirProfile.googleReviewCount > 0) {
        reviewAvailabilityStatus = 'aggregate_only';
        realReviewCount = Number(dirProfile.googleReviewCount);
        realRating = dirProfile.googleRating ? Number(dirProfile.googleRating) : null;
      } else if (memBiz?.reviews && memBiz.reviews.length > 0) {
        reviewAvailabilityStatus = 'available';
        realReviewCount = memBiz.reviews.length;
        const sum = memBiz.reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0);
        realRating = Number((sum / memBiz.reviews.length).toFixed(1));
      } else if (memBiz?.gbpData?.reviewCount && memBiz.gbpData.reviewCount > 0) {
        reviewAvailabilityStatus = 'aggregate_only';
        realReviewCount = Number(memBiz.gbpData.reviewCount);
        realRating = memBiz.gbpData.rating ? Number(memBiz.gbpData.rating) : null;
      }
    }

    // 7. GSC Connection Status
    let gscStatus: GscConnectionState = 'not_connected';
    try {
      const gscConns = await db
        .select()
        .from(schema.searchConsoleConnectionsTable)
        .where(eq(schema.searchConsoleConnectionsTable.businessId, businessId))
        .limit(1);
      if (gscConns.length > 0) {
        gscStatus = gscConns[0].status === 'error' ? 'error' : (gscConns[0].status === 'connected' ? 'connected' : 'not_connected');
      }
    } catch {}
    if (gscStatus === 'not_connected' && memBiz?.gscConnected) {
      gscStatus = 'connected';
    }

    // 8. GA4 Connection Status
    let ga4Status: Ga4ConnectionState = 'not_connected';
    try {
      const ga4Conns = await db
        .select()
        .from(schema.analyticsConnectionsTable)
        .where(eq(schema.analyticsConnectionsTable.businessId, businessId))
        .limit(1);
      if (ga4Conns.length > 0) {
        ga4Status = ga4Conns[0].status === 'error' ? 'error' : (ga4Conns[0].status === 'connected' ? 'connected' : 'not_connected');
      }
    } catch {}
    if (ga4Status === 'not_connected' && memBiz?.ga4Connected) {
      ga4Status = 'connected';
    }

    // 9. Website Analyzed Status
    let websiteAnalyzedStatus: WebsiteAnalyzedState = 'not_analyzed';
    try {
      const webProjects = await db
        .select()
        .from(schema.websiteProjectsTable)
        .where(eq(schema.websiteProjectsTable.businessId, businessId))
        .limit(1);
      if (webProjects.length > 0) {
        websiteAnalyzedStatus = 'analyzed';
      }
    } catch {}
    if (websiteAnalyzedStatus === 'not_analyzed' && memBiz?.websiteAudit && memBiz.websiteAudit.crawledPages > 0) {
      websiteAnalyzedStatus = 'analyzed';
    }

    // 10. Real Growth Opportunities
    const topOpportunities: Array<{ id: string; title: string; category?: string; impact?: string }> = [];
    try {
      const opps = await db
        .select()
        .from(schema.growthOpportunitiesTable)
        .where(eq(schema.growthOpportunitiesTable.businessId, businessId))
        .limit(10);

      for (const o of opps) {
        if (o.title && o.title.trim().length > 0) {
          topOpportunities.push({
            id: o.id,
            title: o.title.trim(),
            category: o.actionType || o.type || undefined,
            impact: o.expectedImpact || o.urgency || undefined,
          });
        }
      }
    } catch {}

    // Fallback to memory business brain priority actions if DB opps empty
    if (topOpportunities.length === 0 && memBiz?.businessBrain?.priorityActions) {
      for (const act of memBiz.businessBrain.priorityActions) {
        if (act.title) {
          topOpportunities.push({
            id: act.id,
            title: act.title,
            category: act.actionType || 'SEO',
            impact: act.urgencyLabel || 'HIGH IMPACT',
          });
        }
      }
    }

    const realOpportunityCount = topOpportunities.length;
    const topSelectedOpps = topOpportunities.slice(0, 3);

    // Calculated categorized opportunities breakdown
    const unansweredReviewsCount = Number(memBiz?.gbpData?.unansweredReviews || 0);

    let seoOpportunitiesCount = 0;
    let localVisibilityOpportunitiesCount = 0;

    for (const opp of topOpportunities) {
      const cat = (opp.category || '').toLowerCase();
      const title = opp.title.toLowerCase();
      if (
        cat.includes('seo') ||
        cat.includes('website') ||
        cat.includes('schema') ||
        title.includes('schema') ||
        title.includes('seo') ||
        title.includes('meta')
      ) {
        seoOpportunitiesCount++;
      } else if (
        cat.includes('local') ||
        cat.includes('geo') ||
        cat.includes('map') ||
        title.includes('geo') ||
        title.includes('maps') ||
        title.includes('3-pack')
      ) {
        localVisibilityOpportunitiesCount++;
      }
    }

    if (seoOpportunitiesCount === 0 && memBiz?.websiteAudit?.issues?.length) {
      seoOpportunitiesCount = memBiz.websiteAudit.issues.length;
    }

    // 11. Extract Real Available Directory Fields & Updates
    const availableDirectoryFields: Array<{ label: string; value: string }> = [];
    const updatedFieldsSummary: string[] = [];

    availableDirectoryFields.push({ label: 'Business Name', value: businessName });
    updatedFieldsSummary.push('Business Name');

    if (category && category !== 'Local Business') {
      availableDirectoryFields.push({ label: 'Category', value: category });
      updatedFieldsSummary.push('Category');
    }

    if (city || state) {
      availableDirectoryFields.push({ label: 'Location Area', value: locationDisplay });
      updatedFieldsSummary.push('Service Location');
    }

    const physicalAddress = dirProfile?.address || primaryLoc?.address || memBiz?.identity?.address;
    if (physicalAddress && physicalAddress.trim().length > 0 && physicalAddress !== businessName) {
      availableDirectoryFields.push({ label: 'Address', value: physicalAddress.trim() });
      updatedFieldsSummary.push('Physical Address');
    }

    const phone = dirProfile?.phone || primaryLoc?.phone || biz?.phone || memBiz?.identity?.phone;
    if (phone && phone.trim().length > 0) {
      availableDirectoryFields.push({ label: 'Phone', value: phone.trim() });
      updatedFieldsSummary.push('Phone Number');
    }

    const website = dirProfile?.website || biz?.website || memBiz?.identity?.website;
    if (website && website.trim().length > 0) {
      availableDirectoryFields.push({ label: 'Website', value: website.trim() });
      updatedFieldsSummary.push('Website');
    }

    const rawServices: string[] = dirProfile?.services || biz?.services || memBiz?.identity?.services || [];
    const services = Array.isArray(rawServices) ? rawServices.filter((s) => s && s !== 'Local Business') : [];
    if (services.length > 0) {
      availableDirectoryFields.push({ label: 'Services', value: services.slice(0, 4).join(', ') });
      updatedFieldsSummary.push('Services Catalog');
    }

    let hoursDisplay: string | null = null;
    const hours = dirProfile?.hours || primaryLoc?.hours || memBiz?.gbpData?.businessHours;
    if (hours) {
      if (Array.isArray(hours) && hours.length > 0) {
        hoursDisplay = hours.slice(0, 3).join(', ');
      } else if (typeof hours === 'object' && Object.keys(hours).length > 0) {
        hoursDisplay = 'Operating hours configured';
      }
    }
    if (hoursDisplay) {
      availableDirectoryFields.push({ label: 'Hours', value: hoursDisplay });
      updatedFieldsSummary.push('Operating Hours');
    }

    return {
      businessId,
      userId,
      ownerEmail,
      businessName,
      businessCategory: category,
      city,
      state,
      locationDisplay,
      address: physicalAddress || null,
      phone: phone || null,
      website: website || null,
      hours: hoursDisplay,
      services,
      directoryStatus,
      directorySlug,
      directoryUrl,
      gbpStatus,
      gscStatus,
      ga4Status,
      websiteAnalyzedStatus,
      reviewAvailabilityStatus,
      realReviewCount,
      realRating,
      realOpportunityCount,
      unansweredReviewsCount,
      seoOpportunitiesCount,
      localVisibilityOpportunitiesCount,
      isDeletedOrSuspended,
      topOpportunities: topSelectedOpps,
      availableDirectoryFields,
      updatedFieldsSummary,
    };
  } catch (err: any) {
    console.error(`[Directory Email Automation] Error building context for ${businessId}:`, err);
    return null;
  }
}

// ============================================================================
// 4. AI PERSONALIZATION LAYER (SAFETY & ZERO HALLUCINATION ARCHITECTURE)
// ============================================================================

/**
 * Use AI ONLY to personalize and explain the supplied facts.
 * The database is the single source of truth.
 * AI never invents reviews, rankings, traffic, opportunities, or connections.
 * If AI generation fails, returns a deterministic template using real data.
 */
export async function generateAIPersonalizedCopy(
  context: RealBusinessEmailContext,
  variant: 'variant_a' | 'variant_b'
): Promise<AIPersonalizedEmailCopy> {
  // Deterministic baseline
  const deterministic: AIPersonalizedEmailCopy = {
    greeting: `Hello ${context.businessName} Team,`,
    whatHappened:
      variant === 'variant_b'
        ? `Your business profile for ${context.businessName} is officially connected and updated with live Google Business Profile signals across the Locora AI directory.`
        : `The public directory listing for ${context.businessName} was successfully updated and synchronized across the Locora AI directory.`,
    connectionSummary:
      variant === 'variant_b'
        ? `Google Business Profile is connected and verified${context.realRating ? ` (${context.realRating}★ rating over ${context.realReviewCount} customer reviews)` : ''}. Verified contact info, operating hours, and local services are active.`
        : `Your directory listing is active and discoverable. Google Business Profile is currently not connected; connecting it will sync verified opening hours and customer reviews.`,
    nextStepsOverview:
      variant === 'variant_b'
        ? `Review your live dashboard metrics below. Linking Google Search Console and Analytics unlocks complete search queries and customer engagement telemetry.`
        : `Follow the recommended next steps below to connect your Google Business Profile and unlock verified Google ratings and reviews.`,
    isAiGenerated: false,
  };

  try {
    // Unified AI engine (Groq primary). Falls back to the deterministic
    // baseline copy below when AI is unavailable — never fails the email.

    const promptPayload = {
      scenario: variant === 'variant_b' ? 'GBP_CONNECTED_UPDATE' : 'GBP_NOT_CONNECTED_UPDATE',
      businessName: context.businessName,
      category: context.businessCategory,
      location: context.locationDisplay,
      gbpStatus: context.gbpStatus,
      gscStatus: context.gscStatus,
      ga4Status: context.ga4Status,
      reviewsStatus: context.reviewAvailabilityStatus,
      reviewCount: context.realReviewCount,
      rating: context.realRating,
      opportunitiesCount: context.realOpportunityCount,
      seoOpportunitiesCount: context.seoOpportunitiesCount,
      unansweredReviewsCount: context.unansweredReviewsCount,
      localVisibilityOpportunitiesCount: context.localVisibilityOpportunitiesCount,
      topOpportunities: context.topOpportunities.map((o) => o.title),
    };

    const engineResult = await generateCompletion({
      messages: [{ role: 'user', content: `You are an editorial assistant writing personalized text for a transactional notification email sent to a business owner by Locora AI.
Based STRICTLY on the real database facts below, produce concise, professional copy.

REAL FACTS:
${JSON.stringify(promptPayload, null, 2)}

ABSOLUTE CONSTRAINTS:
1. Explain ONLY the supplied real facts.
2. NEVER invent or assume any business information, reviews, ratings, rankings, traffic, or opportunities.
3. NEVER claim an integration (GBP, GSC, GA4) is connected if state is 'not_connected'.
4. If reviews are unavailable or 0, do NOT mention positive reviews or ratings.
5. NO fake urgency, NO fake statistics, NO guaranteed rankings, NO exaggerated marketing claims.
6. Keep sentences concise, punchy, and professional.

Return ONLY a JSON object with these 4 keys:
- "greeting": A professional, personal greeting line (e.g. "Hello [Business Name] Team,")
- "whatHappened": 1-2 sentences stating the listing update clearly.
- "connectionSummary": 1-2 sentences summarizing verified integrations / GBP status.
- "nextStepsOverview": 1-2 sentences guiding them on the most relevant next step (e.g. connecting Search Console/Analytics if disconnected).` }],
      jsonMode: true,
      timeoutMs: 4000,
    });
    if (!engineResult.ok) return deterministic;
    const textOutput = (engineResult.text || '').trim();
    if (!textOutput) return deterministic;

    const parsed = JSON.parse(textOutput);
    if (parsed.greeting && parsed.whatHappened && parsed.connectionSummary && parsed.nextStepsOverview) {
      return {
        greeting: String(parsed.greeting).trim(),
        whatHappened: String(parsed.whatHappened).trim(),
        connectionSummary: String(parsed.connectionSummary).trim(),
        nextStepsOverview: String(parsed.nextStepsOverview).trim(),
        isAiGenerated: true,
      };
    }
  } catch (err: any) {
    console.log(`[Directory Email Automation] AI personalization note: ${err.message} (using deterministic baseline)`);
  }

  return deterministic;
}

// ============================================================================
// 2. EMAIL VARIANT A — GBP NOT CONNECTED
// ============================================================================

export function renderEmailVariantA(
  context: RealBusinessEmailContext,
  aiCopy?: AIPersonalizedEmailCopy
): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Your ${context.businessName} listing has been updated on Locora AI`;

  const greeting = aiCopy?.greeting || `Hello ${context.businessName} Team,`;
  const whatHappened =
    aiCopy?.whatHappened ||
    `The public directory listing for ${context.businessName} was successfully updated and synchronized across the Locora AI directory network.`;

  // Real fields list HTML
  const fieldsHtml = context.availableDirectoryFields
    .map(
      (f) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px; width: 35%;">
          ${f.label}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px;">
          ${f.value}
        </td>
      </tr>
    `
    )
    .join('');

  // Opportunities HTML if legitimately available
  let opportunitiesHtml = '';
  if (context.topOpportunities.length > 0) {
    opportunitiesHtml = `
      <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; font-weight: 700;">
          Discovered Growth Opportunities (${context.realOpportunityCount} identified)
        </h4>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
          ${context.topOpportunities
            .map(
              (o) => `
            <li style="margin-bottom: 6px;">
              <strong>${o.title}</strong>
              ${o.impact ? `<span style="display: inline-block; margin-left: 6px; font-size: 11px; padding: 2px 6px; background: #ecfdf5; color: #047857; border-radius: 4px; font-weight: 600;">${o.impact}</span>` : ''}
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 32px; border-bottom: 3px solid #10b981;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">LOCORA AI</span>
                    <span style="font-size: 11px; font-weight: 700; background: #10b981; color: #ffffff; padding: 3px 8px; border-radius: 4px; margin-left: 8px; text-transform: uppercase;">Directory Engine</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #94a3b8;">Listing Update Notice</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0f172a;">
                ${greeting}
              </p>
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                Your ${context.businessName} listing has been updated
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                ${whatHappened}
              </p>

              <!-- Updated Details Box -->
              <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #f8fafc; padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">
                  <span style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                    Current Discovered & Updated Listing Details
                  </span>
                </div>
                <table width="100%" cellspacing="0" cellpadding="0">
                  ${fieldsHtml}
                </table>
              </div>

              <!-- GBP Connection Status Note (Variant A: NOT CONNECTED) -->
              <div style="margin-bottom: 24px; padding: 18px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px;">
                <table width="100%">
                  <tr>
                    <td valign="top" style="width: 24px; padding-right: 12px;">
                      <span style="font-size: 18px;">ℹ️</span>
                    </td>
                    <td>
                      <h4 style="margin: 0 0 6px 0; color: #854d0e; font-size: 14px; font-weight: 700;">
                        Google Business Profile: Not Connected
                      </h4>
                      <p style="margin: 0 0 8px 0; font-size: 13px; color: #713f12; line-height: 1.5;">
                        Your directory listing is active and discoverable. However, an official <strong>Google Business Profile (GBP)</strong> is not currently connected to your Locora account.
                      </p>
                      <p style="margin: 0 0 8px 0; font-size: 13px; color: #713f12; line-height: 1.5;">
                        Connecting your GBP allows Locora to automatically access legitimate Google business information, real opening hours, and verified Google customer reviews.
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #854d0e; font-style: italic;">
                        Notice: Google reviews and official star ratings are only pulled once an official Google Business Profile is connected. Locora does not generate or fabricate unverified review data.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              ${opportunitiesHtml}

              <!-- What You Can Do Next -->
              <div style="margin-top: 28px; margin-bottom: 28px;">
                <h3 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
                  What you can do next:
                </h3>
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #334155;">
                      <strong style="color: #0f172a;">1. Connect Google Business Profile</strong> — Sync legitimate Google maps data and customer reviews.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #334155;">
                      <strong style="color: #0f172a;">2. Connect Search Console</strong> — Monitor your keyword rankings and organic search impressions.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #334155;">
                      <strong style="color: #0f172a;">3. Connect Google Analytics</strong> — Track visitor traffic, conversion sources, and user journeys.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #334155;">
                      <strong style="color: #0f172a;">4. Continue using Locora's website/SEO/growth tools</strong> — Improve technical SEO, meta tags, and local visibility.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Optional Pro Upgrade Note -->
              <div style="margin-bottom: 28px; padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
                <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 13px; font-weight: 700;">
                  ⚡ Unlock More with Locora Pro (Optional Upgrade)
                </h4>
                <p style="margin: 0; font-size: 12px; color: #15803d; line-height: 1.5;">
                  Take your business to the next level with implemented Pro capabilities: autonomous <strong>AI Manager</strong>, local SEO & Maps 3-pack tracking, reputation and AI review responses, AI content generation, CRM lead management, and directory lead analytics.
                </p>
              </div>

              <!-- Action CTAs -->
              <div style="text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <a href="${context.directoryUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 12px;">
                  View My Business
                </a>
                <a href="https://app.locoraai.com/pricing" style="display: inline-block; background-color: #ffffff; color: #0f172a; border: 1px solid #cbd5e1; text-decoration: none; padding: 11px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Explore Locora Pro
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">
                This automated update was sent to <strong>${context.ownerEmail}</strong> regarding your business on Locora AI.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Locora AI Directory & Growth Engine • <a href="mailto:${SENDER_EMAIL}" style="color: #64748b; text-decoration: underline;">${SENDER_EMAIL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
${greeting}

${whatHappened}

Current Discovered & Updated Listing Details:
${context.availableDirectoryFields.map((f) => `- ${f.label}: ${f.value}`).join('\n')}

Google Business Profile Status: NOT CONNECTED
Your directory listing is active and discoverable. However, Google Business Profile is not currently connected to your Locora account.
Connecting GBP allows Locora to automatically access legitimate Google business information, opening hours, and verified Google customer reviews.
Note: Google reviews and official star ratings are only pulled once GBP is connected. Locora does not generate unverified review data.

What you can do next:
1. Connect Google Business Profile — Sync legitimate Google maps data and customer reviews.
2. Connect Search Console — Monitor your keyword rankings and organic search impressions.
3. Connect Google Analytics — Track visitor traffic, conversion sources, and user journeys.
4. Continue using Locora's website/SEO/growth tools — Improve technical SEO, meta tags, and local visibility.

Optional Upgrade:
Explore Locora Pro for AI Manager, local SEO monitoring, reputation tools, and directory lead analytics.

Primary Action:
View My Business: ${context.directoryUrl}

Explore Locora Pro:
https://app.locoraai.com/pricing

Sent to: ${context.ownerEmail}
Locora AI Directory Engine • ${SENDER_EMAIL}
  `.trim();

  return { subject, html, text };
}

// ============================================================================
// 3. EMAIL VARIANT B — GBP CONNECTED
// ============================================================================

export function renderEmailVariantB(
  context: RealBusinessEmailContext,
  aiCopy?: AIPersonalizedEmailCopy
): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Your ${context.businessName} listing is connected and updated`;

  const greeting = aiCopy?.greeting || `Hello ${context.businessName} Team,`;
  const whatHappened =
    aiCopy?.whatHappened ||
    `Your business profile for ${context.businessName} is connected and updated with live Google Business Profile signals across the Locora AI directory.`;

  // Real available information list (Google rating, review count, business info, services, hours, website, location)
  const realInfoRows: string[] = [];

  if (context.realRating != null && context.realReviewCount > 0) {
    realInfoRows.push(`
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px; width: 35%;">
          Google Rating
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #047857; font-size: 13px; font-weight: 700;">
          ★ ${context.realRating} (${context.realReviewCount} verified Google reviews)
        </td>
      </tr>
    `);
  } else if (context.realReviewCount > 0) {
    realInfoRows.push(`
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px; width: 35%;">
          Google Reviews
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px; font-weight: 600;">
          ${context.realReviewCount} reviews synced
        </td>
      </tr>
    `);
  }

  realInfoRows.push(`
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px;">
        Business Name
      </td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px; font-weight: 600;">
        ${context.businessName}
      </td>
    </tr>
  `);

  if (context.businessCategory && context.businessCategory !== 'Local Business') {
    realInfoRows.push(`
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px;">
          Category
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px;">
          ${context.businessCategory}
        </td>
      </tr>
    `);
  }

  if (context.locationDisplay) {
    realInfoRows.push(`
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px;">
          Location
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px;">
          ${context.locationDisplay}
        </td>
      </tr>
    `);
  }

  if (context.address && context.address !== context.businessName) {
    realInfoRows.push(`
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px;">
          Address
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px;">
          ${context.address}
        </td>
      </tr>
    `);
  }

  if (context.services.length > 0) {
    realInfoRows.push(`
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px;">
          Services
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px;">
          ${context.services.slice(0, 4).join(', ')}
        </td>
      </tr>
    `);
  }

  if (context.hours) {
    realInfoRows.push(`
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px;">
          Hours
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px;">
          ${context.hours}
        </td>
      </tr>
    `);
  }

  if (context.website) {
    realInfoRows.push(`
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px;">
          Website
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px;">
          ${context.website}
        </td>
      </tr>
    `);
  }

  if (context.phone) {
    realInfoRows.push(`
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; font-size: 13px;">
          Phone
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px;">
          ${context.phone}
        </td>
      </tr>
    `);
  }

  // Real Opportunities Breakdown HTML (Only actual stored/calculated data)
  let opportunitiesSectionHtml = '';
  const hasSpecificOpportunities =
    context.seoOpportunitiesCount > 0 ||
    context.unansweredReviewsCount > 0 ||
    context.localVisibilityOpportunitiesCount > 0 ||
    context.topOpportunities.length > 0;

  if (hasSpecificOpportunities) {
    const oppBullets: string[] = [];
    if (context.seoOpportunitiesCount > 0) {
      oppBullets.push(`<li><strong>${context.seoOpportunitiesCount} website SEO opportunities</strong></li>`);
    }
    if (context.unansweredReviewsCount > 0) {
      oppBullets.push(`<li><strong>${context.unansweredReviewsCount} unanswered reviews</strong></li>`);
    }
    if (context.localVisibilityOpportunitiesCount > 0) {
      oppBullets.push(`<li><strong>${context.localVisibilityOpportunitiesCount} local visibility opportunities</strong></li>`);
    }

    // Top 1-3 specific opportunity titles if available
    const specificOppsHtml = context.topOpportunities
      .slice(0, 3)
      .map(
        (o) => `
        <li style="margin-top: 6px; color: #334155;">
          ${o.title}
          ${o.impact ? `<span style="font-size: 11px; padding: 2px 6px; background: #ecfdf5; color: #047857; border-radius: 4px; font-weight: 600; margin-left: 6px;">${o.impact}</span>` : ''}
        </li>
      `
      )
      .join('');

    opportunitiesSectionHtml = `
      <div style="margin-top: 24px; padding: 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; font-weight: 700;">
          Locora found:
        </h4>
        <ul style="margin: 0 0 ${specificOppsHtml ? '10px' : '0'} 0; padding-left: 20px; font-size: 13px; color: #1e293b; line-height: 1.6;">
          ${oppBullets.join('')}
        </ul>
        ${
          specificOppsHtml
            ? `
          <div style="border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: 10px;">
            <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Top Recommended Actions</span>
            <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
              ${specificOppsHtml}
            </ul>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 32px; border-bottom: 3px solid #10b981;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">LOCORA AI</span>
                    <span style="font-size: 11px; font-weight: 700; background: #10b981; color: #ffffff; padding: 3px 8px; border-radius: 4px; margin-left: 8px; text-transform: uppercase;">VERIFIED & SYNCED</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #94a3b8;">Google Business Sync</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0f172a;">
                ${greeting}
              </p>
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                Your ${context.businessName} listing is connected and updated
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                ${whatHappened}
              </p>

              <!-- Real Business Information Box (Only fields actually available) -->
              <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #f8fafc; padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">
                  <span style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                    Verified Google Business Profile Information
                  </span>
                </div>
                <table width="100%" cellspacing="0" cellpadding="0">
                  ${realInfoRows.join('')}
                </table>
              </div>

              <!-- Connection / Data Status Section -->
              <div style="margin-bottom: 24px; padding: 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h4 style="margin: 0 0 14px 0; color: #0f172a; font-size: 14px; font-weight: 700;">
                  Integration & Telemetry Status
                </h4>

                <!-- Google Business Profile -->
                <div style="margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                  <div style="font-size: 13px; font-weight: 700; color: #047857;">
                    Google Business Profile ✓ Connected
                  </div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                    Verified physical address, operating hours, and customer reviews active.
                  </div>
                </div>

                <!-- Search Console -->
                <div style="margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                  ${
                    context.gscStatus === 'connected'
                      ? `
                    <div style="font-size: 13px; font-weight: 700; color: #047857;">
                      Search Console ✓ Connected
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                      Search queries and impression monitoring active.
                    </div>
                  `
                      : `
                    <div style="font-size: 13px; font-weight: 700; color: #b45309;">
                      Search Console → Not connected
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 2px;">
                      Connect Search Console to understand search queries and website visibility.
                    </div>
                  `
                  }
                </div>

                <!-- Analytics -->
                <div style="margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                  ${
                    context.ga4Status === 'connected'
                      ? `
                    <div style="font-size: 13px; font-weight: 700; color: #047857;">
                      Analytics ✓ Connected
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                      Website traffic and visitor activity tracking active.
                    </div>
                  `
                      : `
                    <div style="font-size: 13px; font-weight: 700; color: #b45309;">
                      Analytics → Not connected
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 2px;">
                      Connect Analytics to measure website activity.
                    </div>
                  `
                  }
                </div>

                <!-- Reviews -->
                <div>
                  ${
                    context.realReviewCount > 0
                      ? `
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a;">
                      Reviews → ${context.realReviewCount} available ${context.realRating ? `(${context.realRating}★)` : ''}
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 2px;">
                      Locora can help monitor and respond to reviews.
                    </div>
                  `
                      : `
                    <div style="font-size: 13px; font-weight: 700; color: #64748b;">
                      Reviews → 0 available
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                      Locora will automatically monitor and alert you when new customer reviews are posted.
                    </div>
                  `
                  }
                </div>
              </div>

              ${opportunitiesSectionHtml}

              <!-- Short Pro Value Proposition -->
              <div style="margin-top: 28px; margin-bottom: 28px; padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
                <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 13px; font-weight: 700;">
                  ⚡ Locora Pro Capabilities
                </h4>
                <p style="margin: 0; font-size: 12px; color: #15803d; line-height: 1.5;">
                  Autonomous <strong>AI Growth Manager</strong>, local Maps 3-Pack tracking, AI-assisted review responses, SEO monitoring, directory lead analytics, and automated reporting.
                </p>
              </div>

              <!-- Action CTAs -->
              <div style="text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <a href="https://app.locoraai.com/" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 12px;">
                  Open My Locora Dashboard
                </a>
                <a href="https://app.locoraai.com/growth" style="display: inline-block; background-color: #ffffff; color: #0f172a; border: 1px solid #cbd5e1; text-decoration: none; padding: 11px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  View Growth Opportunities
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">
                Sent to <strong>${context.ownerEmail}</strong> • Scoped to authorized business: ${context.businessName}.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Locora AI Directory & Growth Engine • <a href="mailto:${SENDER_EMAIL}" style="color: #64748b; text-decoration: underline;">${SENDER_EMAIL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
${greeting}

${whatHappened}

Verified Google Business Profile Information:
${context.realRating ? `- Rating: ★ ${context.realRating} (${context.realReviewCount} verified Google reviews)\n` : ''}
- Business Name: ${context.businessName}
- Category: ${context.businessCategory}
- Location: ${context.locationDisplay}
${context.address ? `- Address: ${context.address}\n` : ''}
${context.services.length > 0 ? `- Services: ${context.services.join(', ')}\n` : ''}
${context.hours ? `- Hours: ${context.hours}\n` : ''}
${context.website ? `- Website: ${context.website}\n` : ''}
${context.phone ? `- Phone: ${context.phone}\n` : ''}

Next Steps & Data State:
- Google Business Profile: ✓ Connected
- Search Console: ${context.gscStatus === 'connected' ? '✓ Connected' : '→ Not connected (Connect Search Console to understand search queries and website visibility.)'}
- Analytics: ${context.ga4Status === 'connected' ? '✓ Connected' : '→ Not connected (Connect Analytics to measure website activity.)'}
- Reviews: ${context.realReviewCount > 0 ? `${context.realReviewCount} available (Locora can help monitor and respond to reviews.)` : '0 available (Locora can monitor customer reviews as they appear.)'}

${
  hasSpecificOpportunities
    ? `Locora found:
${context.seoOpportunitiesCount > 0 ? `• ${context.seoOpportunitiesCount} website SEO opportunities\n` : ''}${context.unansweredReviewsCount > 0 ? `• ${context.unansweredReviewsCount} unanswered reviews\n` : ''}${context.localVisibilityOpportunitiesCount > 0 ? `• ${context.localVisibilityOpportunitiesCount} local visibility opportunities\n` : ''}
Top Recommended Actions:
${context.topOpportunities.map((o) => `• ${o.title}${o.impact ? ` (${o.impact})` : ''}`).join('\n')}`
    : ''
}

Primary Action:
Open My Locora Dashboard: https://app.locoraai.com/

Secondary Action:
View Growth Opportunities: https://app.locoraai.com/growth

Sent to: ${context.ownerEmail}
Locora AI Directory Engine • ${SENDER_EMAIL}
  `.trim();

  return { subject, html, text };
}

// ============================================================================
// 5. MAIN TRIGGER & AUTOMATION ORCHESTRATOR
// ============================================================================

export interface DirectoryEmailTriggerOptions {
  force?: boolean;
  syncVersion?: string;
  triggerSource?: string;
  customRecipientEmail?: string;
  variantOverride?: 'AUTO' | 'GBP_CONNECTED' | 'GBP_NOT_CONNECTED';
  isAdminManual?: boolean;
  isSuperAdmin?: boolean;
}

export interface DirectoryEmailTriggerResult {
  success: boolean;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'skipped' | 'simulated';
  reason?: string;
  event?: DirectoryEmailEvent;
  context?: RealBusinessEmailContext | null;
  aiPersonalizationUsed?: boolean;
  error?: string;
}

/**
 * 1. Recipient Safety Resolver:
 * Resolves the business -> authorized owner/account -> verified account email.
 * Never uses an arbitrary email supplied by directory/public request.
 * Verifies business_id ownership server-side.
 * Aborts if recipient cannot be safely resolved.
 */
export async function resolveVerifiedBusinessRecipient(
  businessId: string,
  options?: DirectoryEmailTriggerOptions
): Promise<{
  safe: boolean;
  recipientEmail: string;
  userId: string;
  businessName: string;
  reason?: string;
}> {
  // 1. Fetch canonical business from DB
  let biz: any = null;
  try {
    const rows = await db
      .select()
      .from(schema.businessesTable)
      .where(eq(schema.businessesTable.id, businessId))
      .limit(1);
    if (rows.length > 0) biz = rows[0];
  } catch {}

  // In-memory fallback
  const memBiz: any = getBusinessRecordById(businessId) || getBusinessRecordFromLocoraDb(businessId);
  if (!biz && !memBiz) {
    return {
      safe: false,
      recipientEmail: '',
      userId: '',
      businessName: '',
      reason: `Business '${businessId}' not found in database or directory catalog`,
    };
  }

  const businessName = biz?.name?.trim() || memBiz?.identity?.name?.trim() || 'Your Business';
  const ownerEmail = (biz?.ownerEmail?.trim() || memBiz?.claimedByEmail?.trim() || memBiz?.userEmail?.trim() || '').toLowerCase();
  const userId = biz?.accountId || memBiz?.claimedByEmail || ownerEmail || businessId;

  // If this is an explicit admin test/manual action, allow test recipient
  if (options?.isAdminManual) {
    const testRecipient = (options?.customRecipientEmail || ownerEmail).trim().toLowerCase();
    if (testRecipient && testRecipient.includes('@') && !testRecipient.startsWith('unclaimed_')) {
      return {
        safe: true,
        recipientEmail: testRecipient,
        userId,
        businessName,
      };
    }
  }

  // Strict recipient safety for automated flow:
  // Must be verified account owner email belonging to this business.
  // Never accept arbitrary public email.
  if (!ownerEmail || ownerEmail.startsWith('unclaimed_') || !ownerEmail.includes('@') || ownerEmail.includes('example.com')) {
    return {
      safe: false,
      recipientEmail: ownerEmail || '',
      userId,
      businessName,
      reason: `Business '${businessName}' (${businessId}) has no verified, active account owner email. Unclaimed or unverified listings are rejected.`,
    };
  }

  // Cross-verify with account table if present
  try {
    const accRows = await db
      .select()
      .from(schema.accountsTable)
      .where(eq(schema.accountsTable.ownerEmail, ownerEmail))
      .limit(1);
    if (accRows.length === 0 && biz?.accountId) {
      const byId = await db
        .select()
        .from(schema.accountsTable)
        .where(eq(schema.accountsTable.id, biz.accountId))
        .limit(1);
      if (byId.length > 0 && byId[0].ownerEmail) {
        return {
          safe: true,
          recipientEmail: byId[0].ownerEmail.toLowerCase().trim(),
          userId: byId[0].id,
          businessName,
        };
      }
    }
  } catch {}

  return {
    safe: true,
    recipientEmail: ownerEmail,
    userId,
    businessName,
  };
}

/**
 * Orchestrate directory_listing_updated automated email.
 *
 * Enforces:
 * 1. Automation Switch: checks DIRECTORY_UPDATE_EMAILS_ENABLED (keeps OFF while testing).
 * 2. Recipient Safety: resolves business -> authorized owner -> verified email.
 * 3. Idempotency: sends only ONE email for the business + syncVersion (default 'v1').
 * 4. Audit Logging: creates 'pending' -> 'sent' -> 'delivered/bounced/failed' lifecycle.
 * 5. Builds REAL context with zero fabricated values.
 * 6. Dispatches Variant A (GBP Not Connected) or Variant B (GBP Connected), or respects variantOverride.
 * 7. Leverages AI Personalization with deterministic safety fallback.
 * 8. Uses existing Brevo/Nodemailer service with sender Locora AI <support@locoraai.com>.
 */
export async function handleDirectoryListingUpdatedEmail(
  businessId: string,
  options?: DirectoryEmailTriggerOptions
): Promise<DirectoryEmailTriggerResult> {
  const syncVersion = options?.syncVersion || 'v1';
  const eventKey = `dir_sync_${businessId}_${syncVersion}`;

  // 1. Config Switch: DIRECTORY_UPDATE_EMAILS_ENABLED
  // Keep OFF while testing; allow explicit admin manual test actions to bypass.
  const isAutomationEnabled = (process.env.DIRECTORY_UPDATE_EMAILS_ENABLED || '').trim().toLowerCase() === 'true';
  if (!options?.isAdminManual && !isAutomationEnabled) {
    console.log(`[Directory Email Automation] Automated directory update emails currently disabled (DIRECTORY_UPDATE_EMAILS_ENABLED=false). Skipping automated send for ${businessId}.`);
    return {
      success: true,
      status: 'skipped',
      reason: 'automation_disabled_by_config',
    };
  }

  // 2. Idempotency Check
  if (!options?.force) {
    const alreadySent = await hasEmailEventBeenSent(eventKey);
    if (alreadySent) {
      console.log(`[Directory Email Automation] Email already sent for ${businessId} (${eventKey}). Skipping duplicate.`);
      return {
        success: true,
        status: 'skipped',
        reason: 'already_sent_for_version',
      };
    }
  }

  // 3. Build Real Context
  const context = await buildRealBusinessEmailContext(businessId);
  if (!context) {
    return {
      success: false,
      status: 'failed',
      reason: 'business_context_not_found',
      error: `Could not resolve real business context for id: ${businessId}`,
    };
  }

  // Safety: Check if business is deleted or suspended
  if (context.isDeletedOrSuspended) {
    console.log(`[Directory Email Automation] Business ${businessId} is deleted or suspended. Skipping email dispatch.`);
    return {
      success: false,
      status: 'skipped',
      reason: 'business_deleted_or_suspended',
      error: `Business '${context.businessName}' (${businessId}) is deleted or suspended. Email dispatch skipped.`,
      context,
    };
  }

  // 4. Strict Recipient Safety Check
  const recipientRes = await resolveVerifiedBusinessRecipient(businessId, options);
  if (!recipientRes.safe) {
    console.warn(`[Directory Email Automation] Recipient safety aborted for ${businessId}: ${recipientRes.reason}`);
    const nowIso = new Date().toISOString();
    const failedEvent: DirectoryEmailEvent = {
      id: `devt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: recipientRes.userId || context.userId,
      businessId,
      recipient: recipientRes.recipientEmail || 'unresolved',
      recipientEmail: recipientRes.recipientEmail || 'unresolved',
      email: recipientRes.recipientEmail || 'unresolved',
      eventType: 'directory_listing_updated',
      template: 'directory_listing_updated_gbp_not_connected',
      variant: (options?.variantOverride || 'AUTO') as any,
      timestamp: nowIso,
      sentAt: nowIso,
      status: 'failed',
      error: recipientRes.reason || 'Recipient safety check failed',
      syncVersion,
      eventKey,
      metadata: {
        reason: 'recipient_safety_aborted',
        triggerSource: options?.triggerSource || (options?.isAdminManual ? 'admin_manual_send' : 'directory_sync'),
        safetyAborted: true,
      },
    };
    await recordEmailEvent(failedEvent);
    return {
      success: false,
      status: 'failed',
      reason: 'recipient_safety_aborted',
      error: recipientRes.reason,
      event: failedEvent,
      context,
    };
  }

  const recipientEmail = recipientRes.recipientEmail;

  // 5. Determine Variant (AUTO / GBP_CONNECTED / GBP_NOT_CONNECTED)
  let useGbpConnected = context.gbpStatus === 'connected';
  if (options?.variantOverride === 'GBP_CONNECTED') {
    useGbpConnected = true;
  } else if (options?.variantOverride === 'GBP_NOT_CONNECTED') {
    useGbpConnected = false;
  }
  const variantType = useGbpConnected ? 'variant_b' : 'variant_a';
  const variantLabel = options?.variantOverride || (useGbpConnected ? 'GBP_CONNECTED' : 'GBP_NOT_CONNECTED');
  const templateName: 'directory_listing_updated_gbp_not_connected' | 'directory_listing_updated_gbp_connected' = useGbpConnected
    ? 'directory_listing_updated_gbp_connected'
    : 'directory_listing_updated_gbp_not_connected';

  // 6. Record Initial Audit Log as 'pending'
  const eventId = `devt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();
  const pendingEvent: DirectoryEmailEvent = {
    id: eventId,
    userId: recipientRes.userId || context.userId,
    businessId,
    recipient: recipientEmail,
    recipientEmail,
    email: recipientEmail,
    eventType: 'directory_listing_updated',
    template: templateName,
    variant: variantLabel as any,
    timestamp: nowIso,
    sentAt: nowIso,
    status: 'pending',
    error: null,
    syncVersion,
    eventKey,
    metadata: {
      provider: 'brevo_pending',
      businessName: context.businessName,
      city: context.city,
      gbpStatus: context.gbpStatus,
      triggerSource: options?.triggerSource || (options?.isAdminManual ? 'admin_manual_send' : 'directory_sync'),
      updatedFields: context.updatedFieldsSummary,
      opportunityCount: context.realOpportunityCount,
      variantOverride: options?.variantOverride || 'AUTO',
    },
  };
  await recordEmailEvent(pendingEvent);

  // 7. Generate AI Personalization (with automatic deterministic fallback)
  const aiCopy = await generateAIPersonalizedCopy(context, variantType);

  // 8. Render Email Template
  let emailContent: { subject: string; html: string; text: string };
  if (!useGbpConnected) {
    emailContent = renderEmailVariantA(context, aiCopy);
  } else {
    emailContent = renderEmailVariantB(context, aiCopy);
  }

  // 9. Dispatch Email via Brevo SMTP / API
  try {
    const dispatchRes = await dispatchViaBrevoOrFallback({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    const isSimulated = dispatchRes.provider === 'simulated_local';
    const finalStatus: 'sent' | 'simulated' | 'failed' = dispatchRes.success
      ? (isSimulated ? 'simulated' : 'sent')
      : 'failed';

    // Update audit status to 'sent' (or 'failed') with providerMessageId
    await updateEmailEventStatus(eventKey, {
      status: finalStatus,
      providerMessageId: dispatchRes.messageId,
      error: dispatchRes.error || null,
    });

    const finalEvent: DirectoryEmailEvent = {
      ...pendingEvent,
      status: finalStatus,
      providerMessageId: dispatchRes.messageId,
      error: dispatchRes.error || null,
      metadata: {
        ...pendingEvent.metadata,
        provider: dispatchRes.provider,
        messageId: dispatchRes.messageId,
        isAiGenerated: aiCopy.isAiGenerated,
      },
    };

    return {
      success: dispatchRes.success,
      status: finalStatus,
      event: finalEvent,
      context,
      aiPersonalizationUsed: aiCopy.isAiGenerated,
      error: dispatchRes.error,
    };
  } catch (err: any) {
    console.error(`[DirectoryUpdateEmailService] Failed to dispatch email for ${businessId}:`, err.message);

    await updateEmailEventStatus(eventKey, {
      status: 'failed',
      error: err.message,
    });

    const failedEvent: DirectoryEmailEvent = {
      ...pendingEvent,
      status: 'failed',
      error: err.message,
    };

    return {
      success: false,
      status: 'failed',
      error: err.message,
      event: failedEvent,
      context,
    };
  }
}

/**
 * Canonical DirectoryUpdateEmailService Object
 * Preferred Architecture:
 * Directory Update -> directory_listing_updated event -> DirectoryUpdateEmailService -> Build real BusinessEmailContext -> Determine GBP variant -> Generate safe personalized content -> Send through Brevo/Nodemailer -> Log email event
 */
export const DirectoryUpdateEmailService = {
  handleDirectoryListingUpdatedEvent: handleDirectoryListingUpdatedEmail,
  resolveVerifiedBusinessRecipient,
  buildRealBusinessEmailContext,
  generateAIPersonalizedCopy,
  renderEmailVariantA,
  renderEmailVariantB,
  hasEmailEventBeenSent,
  recordEmailEvent,
  updateEmailEventStatus,
  getEmailEvents,
  registerEmailDispatcher,
};

