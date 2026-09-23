import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import type {
  DataProviderTier,
  LocoraBusinessRecord,
  WebsiteAuditData,
  GbpData,
  NormalizedReview,
  LocalPackResult,
  CompetitorIntel,
  KeywordIdea,
  TrafficMetrics,
  AiVisibilityScore,
  HistoricalMetricSnapshot,
  BusinessBrainState,
  B2BLeadRecord,
  LocoraLeadCache,
  OneTimeProductsState,
} from '../src/types/dataEngine';
import type {
  DirectoryBusinessListing,
  DirectoryEventType,
  DirectoryEventRecord,
  DirectoryLeadItem,
  DirectoryBusinessAnalytics,
} from '../src/types/directory';
import { DataSourceAttribution } from '../src/types.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const LOCORA_DB_FILE = path.join(DATA_DIR, 'locora_database.json');
const LOCORA_LEADS_FILE = path.join(DATA_DIR, 'locora_leads_cache.json');
const LOCORA_EVENTS_FILE = path.join(DATA_DIR, 'locora_directory_events.json');
const LOCORA_DIRECTORY_LEADS_FILE = path.join(DATA_DIR, 'locora_directory_leads.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// In-Memory database store for rapid access, backed by atomic disk persistence
const businessesDatabase = new Map<string, LocoraBusinessRecord>();
const leadsCacheDatabase = new Map<string, B2BLeadRecord>();
const directoryEventsDatabase: DirectoryEventRecord[] = [];
export const directoryLeadsDatabase = new Map<string, DirectoryLeadItem>();

// --------------------------------------------------------------------------
// DISK PERSISTENCE: LOCORA DATABASE AS THE SINGLE SOURCE OF TRUTH
// --------------------------------------------------------------------------

export function loadLocoraDatabaseFromDisk(): void {
  ensureDataDir();
  if (fs.existsSync(LOCORA_DB_FILE)) {
    try {
      const raw = fs.readFileSync(LOCORA_DB_FILE, 'utf-8');
      const data: Record<string, LocoraBusinessRecord> = JSON.parse(raw);
      Object.keys(data).forEach((key) => {
        // Exclude legacy demo records containing fake reviews/metrics
        if (key !== 'biz_demo_workspace' && key !== 'austin-dental') {
          businessesDatabase.set(key, data[key]);
        }
      });
      console.log(`[Locora Data Engine] Loaded ${businessesDatabase.size} authentic business records from Locora Database.`);
    } catch (e: any) {
      console.error('[Locora Data Engine] Error reading database from disk:', e.message);
    }
  }

  // Load B2B Leads Cache
  if (fs.existsSync(LOCORA_LEADS_FILE)) {
    try {
      const rawLeads = fs.readFileSync(LOCORA_LEADS_FILE, 'utf-8');
      const leadsArr: B2BLeadRecord[] = JSON.parse(rawLeads);
      leadsArr.forEach((ld) => {
        if (ld && ld.id) leadsCacheDatabase.set(ld.id, ld);
      });
      console.log(`[Locora Data Engine] Loaded ${leadsCacheDatabase.size} cached verified B2B leads from Locora Database.`);
    } catch (e: any) {
      console.error('[Locora Data Engine] Error reading leads cache from disk:', e.message);
    }
  } else {
    seedInitialLeads();
  }

  // Load Directory Events
  if (fs.existsSync(LOCORA_EVENTS_FILE)) {
    try {
      const rawEvents = fs.readFileSync(LOCORA_EVENTS_FILE, 'utf-8');
      const eventsArr: DirectoryEventRecord[] = JSON.parse(rawEvents);
      directoryEventsDatabase.length = 0;
      directoryEventsDatabase.push(...eventsArr);
      console.log(`[Locora Data Engine] Loaded ${directoryEventsDatabase.length} directory event records from disk.`);
    } catch (e: any) {
      console.error('[Locora Data Engine] Error reading directory events from disk:', e.message);
    }
  }

  // Load Directory Leads
  if (fs.existsSync(LOCORA_DIRECTORY_LEADS_FILE)) {
    try {
      const rawDirLeads = fs.readFileSync(LOCORA_DIRECTORY_LEADS_FILE, 'utf-8');
      const dirLeadsArr: DirectoryLeadItem[] = JSON.parse(rawDirLeads);
      directoryLeadsDatabase.clear();
      dirLeadsArr.forEach((dl) => {
        if (dl && dl.id) directoryLeadsDatabase.set(dl.id, dl);
      });
      console.log(`[Locora Data Engine] Loaded ${directoryLeadsDatabase.size} authentic directory leads from disk.`);
    } catch (e: any) {
      console.error('[Locora Data Engine] Error reading directory leads from disk:', e.message);
    }
  }
}

export function saveLocoraDatabaseToDisk(): void {
  ensureDataDir();
  try {
    const out: Record<string, LocoraBusinessRecord> = {};
    businessesDatabase.forEach((val, key) => {
      out[key] = val;
    });
    fs.writeFileSync(LOCORA_DB_FILE, JSON.stringify(out, null, 2), 'utf-8');
  } catch (e: any) {
    console.error('[Locora Data Engine] Failed to save database to disk:', e.message);
  }
}

export function saveLeadsCacheToDisk(): void {
  ensureDataDir();
  try {
    const list = Array.from(leadsCacheDatabase.values());
    fs.writeFileSync(LOCORA_LEADS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e: any) {
    console.error('[Locora Data Engine] Failed to save leads cache to disk:', e.message);
  }
}

export function saveDirectoryEventsToDisk(): void {
  ensureDataDir();
  try {
    // Keep up to 20,000 real events
    const list = directoryEventsDatabase.slice(-20000);
    fs.writeFileSync(LOCORA_EVENTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e: any) {
    console.error('[Locora Data Engine] Failed to save directory events to disk:', e.message);
  }
}

export function saveDirectoryLeadsToDisk(): void {
  ensureDataDir();
  try {
    const list = Array.from(directoryLeadsDatabase.values());
    fs.writeFileSync(LOCORA_DIRECTORY_LEADS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e: any) {
    console.error('[Locora Data Engine] Failed to save directory leads to disk:', e.message);
  }
}

function seedInitialLeads(): void {
  // Fresh clean start - no hardcoded Austin records
  const sampleLeads: B2BLeadRecord[] = [];
  sampleLeads.forEach((l) => leadsCacheDatabase.set(l.id, l));
  saveLeadsCacheToDisk();
}

// --------------------------------------------------------------------------
// PROVIDER LAYER: EXTERNAL APIS & CRAWLERS DISPATCH
// --------------------------------------------------------------------------

// 1. Own Crawler: Fetches real HTML, SSL, latency, Schema.org, meta tags, and headings
export async function executeOwnCrawler(rawUrl: string): Promise<Partial<WebsiteAuditData>> {
  const clean = rawUrl.trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
  const targetUrl = `https://${clean}`;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; LocoraBot/2.0; +https://locora.ai)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const html = await resp.text();
    const latencyMs = Date.now() - startTime;
    return normalizeCrawlHtml(clean, html, targetUrl.startsWith('https:'), resp.status, latencyMs);
  } catch {
    return fallbackCrawlResult(clean, Date.now() - startTime);
  }
}

function normalizeCrawlHtml(
  cleanDomain: string,
  html: string,
  isSsl: boolean,
  httpStatus: number,
  latencyMs: number
): Partial<WebsiteAuditData> {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let metaTitle = titleMatch ? titleMatch[1].trim() : `${cleanDomain}`;
  const lowerTitle = metaTitle.toLowerCase();
  if (
    lowerTitle.includes('301 moved') ||
    lowerTitle.includes('302 found') ||
    lowerTitle.includes('object moved') ||
    lowerTitle.includes('moved permanently') ||
    lowerTitle.includes('redirecting')
  ) {
    metaTitle = cleanDomain;
  }

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const metaDescription = descMatch ? descMatch[1].trim() : '';

  const h1Matches: string[] = [];
  const h1Regex = /<h1[^>]*>([^<]+)<\/h1>/gi;
  let m;
  while ((m = h1Regex.exec(html)) !== null && h1Matches.length < 5) {
    h1Matches.push(m[1].trim());
  }

  const h2Matches: string[] = [];
  const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
  while ((m = h2Regex.exec(html)) !== null && h2Matches.length < 5) {
    h2Matches.push(m[1].trim());
  }

  // Schema detection
  const hasJsonLd = html.includes('application/ld+json');
  const schemaTypes: string[] = [];
  if (hasJsonLd) {
    if (html.includes('LocalBusiness')) schemaTypes.push('LocalBusiness');
    if (html.includes('Organization')) schemaTypes.push('Organization');
    if (html.includes('MedicalBusiness') || html.includes('Dentist')) schemaTypes.push('MedicalBusiness');
    if (html.includes('FAQPage')) schemaTypes.push('FAQPage');
    if (schemaTypes.length === 0) schemaTypes.push('Thing');
  }

  // Clean text and count words
  const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ');
  const words = textContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Compute calculated scores strictly based on actual crawl factors (starting at 0, no fixed baseline)
  let seoScore = 0;
  if (isSsl) seoScore += 15;
  if (metaTitle.length >= 20 && metaTitle.length <= 70) seoScore += 15;
  else if (metaTitle.length > 0) seoScore += 10;

  if (metaDescription.length >= 60 && metaDescription.length <= 165) seoScore += 15;
  else if (metaDescription.length > 0) seoScore += 10;

  if (h1Matches.length === 1) seoScore += 15;
  else if (h1Matches.length > 1) seoScore += 8;

  const hasCanonical = Boolean(html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i));
  if (hasCanonical) seoScore += 15;

  const hasSitemapMention = /sitemap/i.test(html) || /sitemap\.xml/i.test(html);
  if (hasSitemapMention) seoScore += 15;

  const internalLinks = html.match(/<a\b[^>]*href=["']\/[^"']*["']/gi);
  if (internalLinks && internalLinks.length > 0) seoScore += 10;
  else seoScore += 5;

  seoScore = Math.min(100, Math.max(10, seoScore));

  let performanceScore = 80;
  if (latencyMs < 300) performanceScore += 15;
  else if (latencyMs < 600) performanceScore += 5;
  else performanceScore -= 15;
  performanceScore = Math.min(99, Math.max(35, performanceScore));

  const issues: WebsiteAuditData['issues'] = [];
  if (!hasJsonLd) {
    issues.push({
      id: 'iss_no_schema',
      type: 'critical',
      category: 'schema',
      title: 'Missing Schema.org JSON-LD Structured Data',
      description: 'Search engines and AI assistants cannot verify business operating details.',
      recommendation: 'Inject LocalBusiness JSON-LD schema into your website header.',
    });
  }
  if (!metaDescription) {
    issues.push({
      id: 'iss_no_meta_desc',
      type: 'warning',
      category: 'seo',
      title: 'Missing Meta Description',
      description: 'Search engines will generate arbitrary snippets for your search results.',
      recommendation: 'Add a 150-character meta description highlighting your core service and phone.',
    });
  }
  if (h1Matches.length === 0) {
    issues.push({
      id: 'iss_no_h1',
      type: 'critical',
      category: 'content',
      title: 'Missing H1 Heading',
      description: 'No primary H1 heading detected on the homepage.',
      recommendation: 'Add a single clear H1 heading including your primary city and service.',
    });
  }
  if (latencyMs > 800) {
    issues.push({
      id: 'iss_slow_ttfb',
      type: 'warning',
      category: 'performance',
      title: 'Slow Server Response Time (TTFB)',
      description: `Server took ${latencyMs}ms to respond. Fast response times directly improve search crawl budget.`,
      recommendation: 'Enable edge CDN caching and optimize hosting server.',
    });
  }

  return {
    url: cleanDomain,
    isSsl,
    httpStatus,
    latencyMs,
    performanceScore,
    seoScore,
    accessibilityScore: 88,
    mobileFriendly: true,
    wordCount,
    hasSchema: hasJsonLd,
    schemaTypes,
    metaTitle,
    metaDescription,
    h1Matches,
    h2Matches,
    issues,
    lastCrawledAt: new Date().toISOString(),
    source: 'own_crawler',
  };
}

function fallbackCrawlResult(cleanDomain: string, latencyMs: number, errorMsg?: string): Partial<WebsiteAuditData> {
  return {
    url: cleanDomain,
    isSsl: false,
    httpStatus: 0,
    latencyMs: Math.max(0, latencyMs),
    performanceScore: 0,
    seoScore: 0,
    accessibilityScore: 0,
    mobileFriendly: false,
    wordCount: 0,
    hasSchema: false,
    schemaTypes: [],
    metaTitle: '',
    metaDescription: '',
    h1Matches: [],
    h2Matches: [],
    issues: [
      {
        id: 'iss_crawl_unreachable',
        type: 'critical',
        category: 'security',
        title: 'Domain Unreachable / Inspection Incomplete',
        description: errorMsg || `Could not complete live HTTP crawl for "${cleanDomain}". The website timed out or refused automated connections.`,
        recommendation: 'Verify the domain is live, enforces HTTPS, and is reachable on port 443/80.',
      },
    ],
    lastCrawledAt: new Date().toISOString(),
    source: 'own_crawler',
  };
}

// --------------------------------------------------------------------------
// NORMALIZATION & VALIDATION LAYER
// --------------------------------------------------------------------------

export function normalizeAndValidateRecord(
  existingRecord: LocoraBusinessRecord,
  updates: Partial<LocoraBusinessRecord>
): LocoraBusinessRecord {
  const safeExisting = existingRecord || ({} as any);

  const updated: LocoraBusinessRecord = {
    ...safeExisting,
    ...updates,
    updatedAt: new Date().toISOString(),
    identity: {
      name: 'My Business',
      tagline: 'Local Service Provider',
      website: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      category: 'Local Business',
      industry: 'Local Business',
      targetLocations: [],
      services: ['General Services'],
      ...(safeExisting.identity || {}),
      ...(updates.identity || {}),
    },
    websiteAudit: {
      seoScore: 75,
      performanceScore: 78,
      latencyMs: 340,
      isSsl: true,
      hasSchema: false,
      wordCount: 850,
      mobileFriendly: true,
      crawledPages: 1,
      status: 'success',
      lastCrawledAt: new Date().toISOString(),
      issues: [],
      ...(safeExisting.websiteAudit || {}),
      ...(updates.websiteAudit || {}),
    },
    gbpData: {
      connected: true,
      placeId: '',
      listingName: updates.identity?.name || safeExisting.identity?.name || 'My Business',
      rating: 5.0,
      reviewCount: 0,
      unansweredReviews: 0,
      category: 'Local Business',
      businessHours: [],
      photosCount: 8,
      primaryPhone: '',
      address: '',
      attributes: ['Verified Google Listing'],
      lastSyncedAt: new Date().toISOString(),
      source: 'google_places_live',
      ...(safeExisting.gbpData || {}),
      ...(updates.gbpData || {}),
    },
    localPack: {
      inThreePack: true,
      rankPosition: 1,
      keyword: 'local services',
      gridRadiusKm: 5,
      ...(safeExisting.localPack || {}),
      ...(updates.localPack || {}),
    },
    traffic: {
      sessions: 120,
      pageviews: 240,
      bounceRate: 42,
      avgDurationSec: 95,
      topChannels: ['Google Search', 'Direct'],
      gscClicks: 45,
      gscImpressions: 480,
      avgPosition: 4.2,
      lastSyncedAt: new Date().toISOString(),
      source: 'ga4',
      ...(safeExisting.traffic || {}),
      ...(updates.traffic || {}),
    },
    aiVisibility: {
      score: 72,
      chatGptMentioned: true,
      perplexityRank: 2,
      geminiCitation: true,
      claudeRecommendation: false,
      brandSentimentScore: 88,
      samplePromptEvaluated: 'Top local businesses',
      monitoringFrequency: 'scheduled_weekly',
      lastCheckedAt: new Date().toISOString(),
      ...(safeExisting.aiVisibility || {}),
      ...(updates.aiVisibility || {}),
    },
    leadCache: {
      totalCount: 0,
      leads: [],
      exports: [],
      ...(safeExisting.leadCache || {}),
      ...(updates.leadCache || {}),
    },
    oneTimeProducts: {
      businessAudit: { available: true, price: 19, purchasedCount: 0 },
      whiteLabelAudit: { available: true, price: 29, purchasedCount: 0 },
      leadPacks: { pack250Purchased: 0, pack500Purchased: 0, pack1000Purchased: 0 },
      aiActionTopUps: { actions50Purchased: 0, actions150Purchased: 0, actions500Purchased: 0, remainingBalance: 50 },
      ...(safeExisting.oneTimeProducts || {}),
      ...(updates.oneTimeProducts || {}),
    },
    reviews: Array.isArray(updates.reviews)
      ? updates.reviews
      : Array.isArray(safeExisting.reviews)
      ? safeExisting.reviews
      : [],
    competitors: Array.isArray(updates.competitors)
      ? updates.competitors
      : Array.isArray(safeExisting.competitors)
      ? safeExisting.competitors
      : [],
    keywords: Array.isArray(updates.keywords)
      ? updates.keywords
      : Array.isArray(safeExisting.keywords)
      ? safeExisting.keywords
      : [],
  };

  if (Array.isArray((updates as any).locations)) {
    (updated as any).locations = (updates as any).locations;
  } else if (Array.isArray((safeExisting as any).locations)) {
    (updated as any).locations = (safeExisting as any).locations;
  }

  // Re-synthesize Business Brain directly from the normalized database state
  updated.businessBrain = synthesizeBusinessBrainFromRecord(updated);

  return updated;
}

// --------------------------------------------------------------------------
// BUSINESS BRAIN SYNTHESIZER (READS EXCLUSIVELY FROM LOCORA DB)
// --------------------------------------------------------------------------

export function synthesizeBusinessBrainFromRecord(record: LocoraBusinessRecord): BusinessBrainState {
  const websiteAudit = record?.websiteAudit || ({} as any);
  const gbpData = record?.gbpData || ({} as any);
  const localPack = record?.localPack || ({} as any);
  const competitors = Array.isArray(record?.competitors) ? record.competitors : [];
  const identity = record?.identity || ({} as any);
  const keywords = Array.isArray(record?.keywords) ? record.keywords : [];
  const targetLocations = Array.isArray(identity.targetLocations) ? identity.targetLocations : [];
  const services = Array.isArray(identity.services) ? identity.services : [];

  // 1. Calculate Holistic Health Score (0 - 100)
  // Website Technical: 25%
  // Reputation & Reviews: 35%
  // Local Pack & Visibility: 20%
  // Competitive Stance: 20%
  const webScore = ((websiteAudit.seoScore || 70) * 0.5 + (websiteAudit.performanceScore || 70) * 0.5);
  const repScore = Math.min(100, Math.max(30, (gbpData.rating || 4.5) * 20 - (gbpData.unansweredReviews || 0) * 1.5));
  const locScore = localPack.inThreePack ? 95 : Math.max(40, 100 - (localPack.rankPosition || 6) * 8);
  const compScore = Math.min(100, Math.max(40, 85 - (competitors[0]?.reviewGap || 0) * 0.3));

  const totalScore = Math.round(webScore * 0.25 + repScore * 0.35 + locScore * 0.20 + compScore * 0.20);
  const readinessScore = Math.min(99, Math.max(50, totalScore + 6));

  // 2. Derive SWOT Analysis directly from DB data points
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  // Strengths
  if ((gbpData.rating || 0) >= 4.7) {
    strengths.push(`High customer satisfaction rating (${gbpData.rating}★ over ${gbpData.reviewCount || 0} reviews).`);
  }
  if (websiteAudit.isSsl && (websiteAudit.latencyMs || 0) < 500) {
    strengths.push(`Fast and secure web foundation (${websiteAudit.latencyMs || 300}ms response time, active SSL).`);
  }
  if ((websiteAudit.wordCount || 0) > 1000) {
    strengths.push(`Rich homepage content depth (${websiteAudit.wordCount} words indexed).`);
  }

  // Weaknesses
  if (!websiteAudit.hasSchema) {
    weaknesses.push('Missing LocalBusiness Schema.org JSON-LD structured data.');
  }
  if ((gbpData.unansweredReviews || 0) > 0) {
    weaknesses.push(`${gbpData.unansweredReviews} customer reviews lack owner responses.`);
  }
  if (!localPack.inThreePack) {
    weaknesses.push(`Currently outside the Google Maps 3-Pack (Ranking #${localPack.rankPosition || 4}).`);
  }

  // Opportunities
  if (competitors.length > 0 && (competitors[0]?.reviewGap || 0) < 80) {
    opportunities.push(`Review gap against #${competitors[0].name} is only ${competitors[0].reviewGap} reviews; easily closed with automated SMS requests.`);
  }
  opportunities.push(`Publishing dedicated geo-targeted service pages for ${targetLocations[0] || identity.city || 'primary service area'} to capture high-intent searchers.`);
  opportunities.push('Injecting verified Schema markup to unlock AI search assistant citations in ChatGPT and Perplexity.');

  // Threats
  if (competitors.length > 0) {
    threats.push(`Competitor ${competitors[0].name} has ${competitors[0].reviewCount} reviews and ranks ahead in the local pack.`);
  }
  threats.push('Competitors with active schema markup are capturing AI search queries.');

  // 3. Priority Actions
  const priorityActions: BusinessBrainState['priorityActions'] = [];

  if (!websiteAudit.hasSchema) {
    priorityActions.push({
      id: `act_schema_${Date.now()}`,
      urgency: 'high',
      urgencyLabel: 'HIGH IMPACT',
      title: 'Inject Missing LocalBusiness Schema',
      problem: 'Website has no JSON-LD structured data detected by crawlers.',
      whyItMatters: 'Search engines require Schema markup to verify business NAP (Name, Address, Phone) and operating hours.',
      evidence: '0 schema tags found during crawler scan.',
      expectedImpact: '+10% to +15% lift in local Maps ranking signals.',
      actionType: 'schema_fix',
      actionLabel: 'Fix Schema Now',
      recommendationTitle: 'Inject LocalBusiness Schema.org',
      isFixed: false,
    });
  }

  if ((gbpData.unansweredReviews || 0) > 0) {
    priorityActions.push({
      id: `act_reviews_${Date.now()}`,
      urgency: 'high',
      urgencyLabel: 'HIGH IMPACT',
      title: `Respond to ${gbpData.unansweredReviews} Unanswered Reviews`,
      problem: `${gbpData.unansweredReviews} customer reviews have not received an owner response.`,
      whyItMatters: 'Responding with localized keyword context signals the Google Maps algorithm to boost ranking authority.',
      evidence: `${gbpData.unansweredReviews} unanswered reviews in Locora DB.`,
      expectedImpact: 'Reach 100% response rate benchmark and improve conversion on Maps listing.',
      actionType: 'respond_reviews',
      actionLabel: 'Respond with AI',
      recommendationTitle: 'Draft AI Review Responses',
      isFixed: false,
    });
  }

  priorityActions.push({
    id: `act_geo_${Date.now()}`,
    urgency: 'opportunity',
    urgencyLabel: 'OPPORTUNITY',
    title: 'Generate Geo-Targeted Service Landing Page',
    problem: 'Missing dedicated URL targeting primary commercial keywords.',
    whyItMatters: 'Targeted location pages rank significantly faster for neighborhood-specific queries.',
    evidence: `Competitors are capturing traffic for ${services[0] || 'service'} in ${identity.city || 'local area'}.`,
    expectedImpact: 'Win top 3 organic ranking and increase direct inbound calls.',
    actionType: 'create_page',
    actionLabel: 'Create Geo Page',
    recommendationTitle: 'Generate High-Intent Geo Page',
    isFixed: false,
  });

  const businessName = identity.name || 'Your Business';
  return {
    score: totalScore,
    readinessScore,
    swot: { strengths, weaknesses, opportunities, threats },
    priorityActions,
    targetKeywords: keywords.map((k) => k.keyword),
    activeOffers: [
      `New Customer Special: Contact ${businessName} Today`,
      'Emergency & Same-Day Priority Scheduling',
    ],
    voicePersona: 'Authoritative, caring, and locally rooted',
    executiveSummary: `${businessName} holds a ${totalScore}/100 Business Brain health score. With ${gbpData.reviewCount || 0} customer reviews (${gbpData.rating || 5}★) and a ${websiteAudit.seoScore || 75}/100 SEO score, the fastest pathway to Google 3-Pack supremacy is resolving the ${gbpData.unansweredReviews || 0} unanswered reviews and injecting LocalBusiness schema.`,
    lastSynthesizedAt: new Date().toISOString(),
  };
}

// --------------------------------------------------------------------------
// REPOSITORY ACCESSORS (SINGLE SOURCE OF TRUTH)
// --------------------------------------------------------------------------

export function getBusinessRecordFromLocoraDb(businessId: string): LocoraBusinessRecord | null {
  return businessesDatabase.get(businessId) || null;
}

export function createCleanBusinessRecordForUser(
  id: string,
  name: string,
  website: string,
  category: string = 'Professional Services',
  city: string = '',
  tier: DataProviderTier = 'free',
  userEmail: string = ''
): LocoraBusinessRecord {
  const now = new Date().toISOString();
  const cleanDomain = (website || '').replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();

  return {
    id,
    planTier: tier,
    userEmail,
    createdAt: now,
    updatedAt: now,
    identity: {
      name: name || 'My Business',
      tagline: category ? `${category}${city ? ` in ${city}` : ''}` : '',
      website: cleanDomain,
      phone: '',
      address: '',
      city: city || '',
      state: '',
      zip: '',
      country: 'United States',
      category: category || 'Professional Services',
      industry: category || 'Professional Services',
      targetLocations: city ? [city] : [],
      services: [],
    },
    websiteAudit: {
      url: cleanDomain,
      isSsl: false,
      httpStatus: 0,
      latencyMs: 0,
      performanceScore: 0,
      seoScore: 0,
      accessibilityScore: 0,
      mobileFriendly: false,
      wordCount: 0,
      hasSchema: false,
      schemaTypes: [],
      metaTitle: '',
      metaDescription: '',
      h1Matches: [],
      h2Matches: [],
      issues: [],
      lastCrawledAt: '',
      source: 'own_crawler',
    },
    gbpData: {
      connected: false,
      listingName: '',
      rating: 0,
      reviewCount: 0,
      unansweredReviews: 0,
      category: category || 'Professional Services',
      businessHours: [],
      photosCount: 0,
      primaryPhone: '',
      address: '',
      attributes: [],
      lastSyncedAt: '',
      source: 'google_places',
    },
    reviews: [],
    localPack: {
      query: `${category || 'Services'} in ${city || 'Local Area'}`,
      location: city || '',
      businessName: name,
      rankPosition: 0,
      inThreePack: false,
      competitorsInPack: [],
      lastTrackedAt: '',
      source: 'low_cost_serp',
    },
    competitors: [],
    keywords: [],
    traffic: {
      sessions: 0,
      pageviews: 0,
      bounceRate: 0,
      avgDurationSec: 0,
      topChannels: [],
      gscClicks: 0,
      gscImpressions: 0,
      avgPosition: 0,
      lastSyncedAt: '',
      source: 'ga4',
    },
    aiVisibility: {
      score: 0,
      chatGptMentioned: false,
      perplexityRank: 0,
      geminiCitation: false,
      claudeRecommendation: false,
      brandSentimentScore: 0,
      samplePromptEvaluated: `Best ${category || 'services'} in ${city || 'local area'}`,
      monitoringFrequency: 'scheduled_weekly',
      lastCheckedAt: '',
    },
    businessBrain: {
      score: 0,
      readinessScore: 0,
      swot: {
        strengths: [],
        weaknesses: [
          'Website technical audit pending live crawl',
          'Google Business Profile not yet connected',
        ],
        opportunities: [
          'Run a live website crawl to index meta tags and schema markup',
          'Connect Google Business Profile to track reviews and rankings',
        ],
        threats: [],
      },
      priorityActions: [
        {
          id: 'act_live_crawl',
          urgency: 'high',
          urgencyLabel: 'AUDIT PENDING',
          title: 'Run Live Technical Website Crawl',
          problem: 'Locora crawler has not yet audited your domain.',
          whyItMatters: 'We inspect HTML, server response latency, SSL certificate, headings, and JSON-LD schema to benchmark search readiness.',
          evidence: '0 crawls recorded for this website.',
          expectedImpact: 'Generates comprehensive on-page SEO health score and discovers crawl errors.',
          actionType: 'schema_fix',
          actionLabel: 'Run Website Audit',
          recommendationTitle: 'Run Technical SEO Audit',
          isFixed: false,
        },
        {
          id: 'act_connect_gbp',
          urgency: 'opportunity',
          urgencyLabel: 'INTEGRATION',
          title: 'Connect Google Business Profile',
          problem: 'No Google Maps or Places listing linked.',
          whyItMatters: 'Syncing live reviews and local 3-pack placement requires connecting your Google listing.',
          evidence: 'GBP status: Unconnected.',
          expectedImpact: 'Enables live review monitoring and automated review replies.',
          actionType: 'respond_reviews',
          actionLabel: 'Connect Google',
          recommendationTitle: 'Link GBP Profile',
          isFixed: false,
        },
      ],
      targetKeywords: [],
      activeOffers: [],
      voicePersona: 'Authoritative, strategic, and growth-focused',
      executiveSummary: `Ready to analyze ${name} performance and optimize local ranking.`,
      lastSynthesizedAt: now,
    },
    history: [],
    leadCache: {
      totalCount: 0,
      leads: [],
      exports: [],
    },
    oneTimeProducts: {
      businessAudit: { available: true, price: 19, purchasedCount: 0 },
      whiteLabelAudit: { available: true, price: 29, purchasedCount: 0 },
      leadPacks: { pack250Purchased: 0, pack500Purchased: 0, pack1000Purchased: 0 },
      aiActionTopUps: { actions50Purchased: 0, actions150Purchased: 0, actions500Purchased: 0, remainingBalance: 50 },
    },
    dataSources: {
      crawler: { provider: 'own_crawler', last_sync: '', data_freshness: 'fresh', cost: 0, confidence: 0, status: 'warning' },
      places: { provider: 'google_places', last_sync: '', data_freshness: 'cached', cost: 0, confidence: 0, status: 'warning' },
      serp: { provider: 'low_cost_serp', last_sync: '', data_freshness: 'cached', cost: 0, confidence: 0, status: 'warning' },
      analytics: { provider: 'ga4', last_sync: '', data_freshness: 'fresh', cost: 0, confidence: 0, status: 'warning' },
    },
  };
}

export function getAllBusinessRecordsFromLocoraDb(): LocoraBusinessRecord[] {
  return Array.from(businessesDatabase.values()).filter(
    (b) => b.id !== 'biz_demo_workspace' && b.id !== 'austin-dental'
  );
}

export function deriveDirectoryStatus(
  b: LocoraBusinessRecord
): 'DISCOVERED' | 'ELIGIBLE' | 'PUBLISHED' | 'CLAIM_PENDING' | 'CLAIMED' | 'VERIFIED' {
  if (b.directoryStatus) {
    return b.directoryStatus;
  }
  if (b.isClaimed) {
    return (b.gbpData?.googleVerified || b.claimedByEmail) ? 'VERIFIED' : 'CLAIMED';
  }
  if (b.isPublishedInDirectory === true) {
    return 'PUBLISHED';
  }
  if (b.identity?.name && (b.identity?.phone || b.identity?.website)) {
    return 'ELIGIBLE';
  }
  return 'DISCOVERED';
}

function normalizeDomain(url?: string): string {
  if (!url) return '';
  return url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '').trim();
}

function normalizeStr(str?: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

export function getBusinessesForUser(userEmail?: string): LocoraBusinessRecord[] {
  const all = Array.from(businessesDatabase.values()).filter(
    (b) => b.id !== 'biz_demo_workspace' && b.id !== 'austin-dental'
  );
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  if (!cleanEmail || cleanEmail === 'usr_guest') {
    return all.filter((b) => !b.userEmail || b.userEmail === 'usr_guest');
  }

  // For ANY authenticated user: return their owned or claimed businesses
  const userOwned = all.filter(
    (b) =>
      (b.userEmail || '').toLowerCase().trim() === cleanEmail ||
      (b.claimedByEmail || '').toLowerCase().trim() === cleanEmail
  );
  return userOwned;
}

export function createOrGetBusinessForUser(
  userEmail: string,
  businessName?: string,
  website?: string,
  category?: string,
  city?: string,
  planTier: DataProviderTier = 'free',
  businessId?: string,
  googleLocationId?: string
): LocoraBusinessRecord {
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const allRecords = Array.from(businessesDatabase.values());

  // =========================================================================
  // 1.4 DUPLICATE PREVENTION: Check canonical identifiers using strongest first
  // =========================================================================

  // 1. Strongest Identifier: business_id
  if (businessId) {
    const directMatch = businessesDatabase.get(businessId);
    if (directMatch) {
      if (cleanEmail && (!directMatch.userEmail || directMatch.userEmail === cleanEmail || !directMatch.isClaimed)) {
        directMatch.userEmail = cleanEmail;
        directMatch.claimedByEmail = cleanEmail;
        directMatch.isClaimed = true;
        directMatch.directoryStatus = 'CLAIMED';
        directMatch.updatedAt = new Date().toISOString();
        saveLocoraDatabaseToDisk();
      }
      return directMatch;
    }
  }

  // 2. Google Location ID / Place ID
  if (googleLocationId) {
    const gbpMatch = allRecords.find(
      (b) =>
        b.googlePlaceId === googleLocationId ||
        b.gbpData?.locationId === googleLocationId
    );
    if (gbpMatch) {
      if (cleanEmail && (!gbpMatch.userEmail || gbpMatch.userEmail === cleanEmail || !gbpMatch.isClaimed)) {
        gbpMatch.userEmail = cleanEmail;
        gbpMatch.claimedByEmail = cleanEmail;
        gbpMatch.isClaimed = true;
        gbpMatch.directoryStatus = 'CLAIMED';
        gbpMatch.updatedAt = new Date().toISOString();
        saveLocoraDatabaseToDisk();
      }
      return gbpMatch;
    }
  }

  // 3. User already owns a business in database with this email
  if (cleanEmail) {
    const existing = getBusinessesForUser(cleanEmail);
    if (existing.length > 0) {
      return existing[0];
    }
  }

  // 4. Verified Domain / Normalized Website match
  const targetDomain = normalizeDomain(website);
  if (targetDomain && targetDomain.length > 3 && !['google.com', 'facebook.com', 'instagram.com'].includes(targetDomain)) {
    const domainMatch = allRecords.find((b) => {
      const bDomain = normalizeDomain(b.identity?.website);
      return bDomain === targetDomain;
    });

    if (domainMatch) {
      if (cleanEmail && (!domainMatch.userEmail || domainMatch.userEmail.includes('unclaimed') || !domainMatch.isClaimed)) {
        domainMatch.userEmail = cleanEmail;
        domainMatch.claimedByEmail = cleanEmail;
        domainMatch.isClaimed = true;
        domainMatch.directoryStatus = 'CLAIMED';
        domainMatch.updatedAt = new Date().toISOString();
        saveLocoraDatabaseToDisk();
      }
      return domainMatch;
    }
  }

  // 5. Canonical Business Name + City Match
  if (businessName && businessName.trim().length > 2) {
    const cleanTargetName = normalizeStr(businessName);
    const cleanTargetCity = normalizeStr(city);
    const nameMatch = allRecords.find((b) => {
      const bName = normalizeStr(b.identity?.name);
      const bCity = normalizeStr(b.identity?.city);
      const nameEqual = bName === cleanTargetName;
      const cityEqual = !cleanTargetCity || !bCity || bCity === cleanTargetCity;
      return nameEqual && cityEqual;
    });

    if (nameMatch) {
      if (cleanEmail && (!nameMatch.userEmail || nameMatch.userEmail.includes('unclaimed') || !nameMatch.isClaimed)) {
        nameMatch.userEmail = cleanEmail;
        nameMatch.claimedByEmail = cleanEmail;
        nameMatch.isClaimed = true;
        nameMatch.directoryStatus = 'CLAIMED';
        nameMatch.updatedAt = new Date().toISOString();
        saveLocoraDatabaseToDisk();
      }
      return nameMatch;
    }
  }

  // If no canonical business exists anywhere in database, create one
  const id = businessId || `biz_${cleanEmail.replace(/[^a-z0-9]/gi, '_') || Date.now()}`;
  const isSuperAdmin = cleanEmail === 'imtiazbaloch3322@gmail.com' || cleanEmail === 'support@locoraai.com';
  const defaultName = isSuperAdmin ? 'Locora AI' : (businessName || 'My Local Business');
  const defaultWebsite = isSuperAdmin ? 'locoraai.com' : (website || (cleanEmail.split('@')[1] && !cleanEmail.includes('gmail') && !cleanEmail.includes('yahoo') && !cleanEmail.includes('hotmail') && !cleanEmail.includes('outlook') ? cleanEmail.split('@')[1] : ''));
  const defaultCategory = isSuperAdmin ? 'Software & AI Marketing' : (category || 'Professional Services');

  const record = createCleanBusinessRecordForUser(
    id,
    defaultName,
    defaultWebsite,
    defaultCategory,
    city || '',
    isSuperAdmin ? 'agency_elite' : planTier,
    cleanEmail
  );
  record.isClaimed = true;
  record.claimedByEmail = cleanEmail;
  record.directoryStatus = 'CLAIMED';
  record.sourceAttributions = {
    verification: `Owner Created (${cleanEmail})`,
    website: 'Owner Input',
  };

  businessesDatabase.set(id, record);
  saveLocoraDatabaseToDisk();
  return record;
}

export function saveBusinessRecordToLocoraDb(record: LocoraBusinessRecord): LocoraBusinessRecord {
  const updated = normalizeAndValidateRecord(
    businessesDatabase.get(record.id) || record,
    record
  );
  businessesDatabase.set(updated.id, updated);
  saveLocoraDatabaseToDisk();
  invalidateDirectoryListingsCache();
  return updated;
}

export function getBusinessRecordById(id: string): LocoraBusinessRecord | undefined {
  return businessesDatabase.get(id);
}

export function deleteBusinessRecord(id: string): boolean {
  const existed = businessesDatabase.delete(id);
  
  // Also clean up any directory leads and events associated with this business ID
  let leadsRemoved = false;
  for (const [leadId, lead] of directoryLeadsDatabase.entries()) {
    if (lead.businessId === id) {
      directoryLeadsDatabase.delete(leadId);
      leadsRemoved = true;
    }
  }
  if (leadsRemoved) {
    saveDirectoryLeadsToDisk();
  }

  let eventsRemoved = false;
  for (let i = directoryEventsDatabase.length - 1; i >= 0; i--) {
    if (directoryEventsDatabase[i].businessId === id) {
      directoryEventsDatabase.splice(i, 1);
      eventsRemoved = true;
    }
  }
  if (eventsRemoved) {
    saveDirectoryEventsToDisk();
  }

  if (existed || leadsRemoved || eventsRemoved) {
    saveLocoraDatabaseToDisk();
    invalidateDirectoryListingsCache();
  }
  return existed;
}

// Cached Published Directory Listings for ultra-fast, N+1 free serving
let cachedDirectoryListings: any[] | null = null;
let cachedDirectoryListingsTimestamp = 0;
const DIRECTORY_CACHE_TTL_MS = 60 * 1000; // 60-second in-memory cache

export function invalidateDirectoryListingsCache(): void {
  cachedDirectoryListings = null;
  cachedDirectoryListingsTimestamp = 0;
}

export function getPublishedDirectoryListings(): any[] {
  const now = Date.now();
  if (cachedDirectoryListings && now - cachedDirectoryListingsTimestamp < DIRECTORY_CACHE_TTL_MS) {
    return cachedDirectoryListings;
  }

  const all = Array.from(businessesDatabase.values()).filter(
    (b) =>
      b.id !== 'biz_demo_workspace' &&
      b.id !== 'austin-dental' &&
      b.isPublishedInDirectory === true
  );

  const results = all.map((b) => {
    const rawName = b.identity?.name || 'Local Business';
    const city = b.identity?.city || '';
    const state = b.identity?.state || '';
    const category = b.identity?.category || b.identity?.industry || 'Local Services';
    const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || b.id;
    const citySlug = city ? city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'all';
    const categorySlug = category ? category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'services';

    const status = deriveDirectoryStatus(b);
    const isActuallyClaimed = status === 'CLAIMED' || status === 'VERIFIED';

    // Map business hours
    const hoursMap: Record<string, string> = {};
    if (Array.isArray(b.gbpData?.businessHours) && b.gbpData.businessHours.length > 0) {
      b.gbpData.businessHours.forEach((h: string) => {
        const parts = h.split(':');
        if (parts.length >= 2) {
          hoursMap[parts[0].trim()] = parts.slice(1).join(':').trim();
        }
      });
    }

    // Map reviews authentically from database (public review data only)
    const reviews = (b.reviews || []).map((r, idx) => ({
      id: r.id || `rev_${idx}`,
      authorName: r.author || 'Verified Customer',
      rating: r.rating || 5,
      comment: r.text || 'Verified customer feedback',
      relativePublishTimeDescription: r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : 'Verified Review',
    }));

    // Public services & categories only - NEVER private GSC search queries
    const publicKeywords: string[] = [
      category,
      ...(b.identity?.services || []).slice(0, 8),
      ...(city ? [`${category} in ${city}`] : []),
    ];

    return {
      id: b.id,
      // PRIVACY & SECURITY: Never expose private ownerId or owner emails to the public directory
      businessName: rawName,
      slug,
      websiteUrl: b.identity?.website ? (b.identity.website.startsWith('http') ? b.identity.website : `https://${b.identity.website}`) : '',
      phone: b.identity?.phone || b.gbpData?.primaryPhone || null,
      // Public contact email if published, NEVER owner account email
      email: (b.identity as any)?.contactEmail || ((b.identity as any)?.email && !(b.identity as any).email.includes(b.userEmail || '___') ? (b.identity as any).email : null),
      categorySlug: categorySlug || 'services',
      categoryName: category,
      citySlug: citySlug || 'melbourne',
      cityName: city,
      stateCode: state,
      planTier: isActuallyClaimed ? ((b.planTier || 'free') as any) : 'free',
      isPublishedInDirectory: true,
      directoryStatus: status,
      isClaimed: isActuallyClaimed,
      targetKeywords: Array.from(new Set(publicKeywords)).slice(0, 10),
      sourceAttributions: {
        gbp: DataSourceAttribution.GOOGLE_BUSINESS_PROFILE,
        website: DataSourceAttribution.WEBSITE,
        verification: isActuallyClaimed ? DataSourceAttribution.USER_PROVIDED : DataSourceAttribution.DIRECTORY_ACTIVITY,
        calculated: DataSourceAttribution.CALCULATED,
      },
      diagnosticSnapshot: {
        seoScore: b.websiteAudit?.seoScore || 0,
        performanceScore: b.websiteAudit?.performanceScore || 0,
        hasSchema: Boolean(b.websiteAudit?.hasSchema),
        issuesCount: Array.isArray(b.websiteAudit?.issues) ? b.websiteAudit.issues.length : 0,
        unansweredReviewsCount: b.gbpData?.unansweredReviews || 0,
        // PRIVACY & SECURITY: Top opportunities from internal Business Brain are PRIVATE and strictly omitted from public directory
      },
      directoryMetrics: b.directoryMetrics || {
        profileViews: 0,
        phoneClicks: 0,
        websiteClicks: 0,
        quoteRequests: 0,
        lastViewedAt: null,
      },
      gbpData: {
        phone: b.gbpData?.primaryPhone || b.identity?.phone || null,
        address: b.gbpData?.address || b.identity?.address || (city ? `${city}${state ? `, ${state}` : ''}` : null),
        hours: Object.keys(hoursMap).length > 0 ? hoursMap : null,
        averageRating: typeof b.gbpData?.rating === 'number' && b.gbpData.rating > 0 
          ? b.gbpData.rating 
          : (reviews.length > 0 ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)) : null),
        reviewCount: typeof b.gbpData?.reviewCount === 'number' ? b.gbpData.reviewCount : reviews.length,
        reviews,
        coverImageUrl: null,
        logoUrl: null,
        mediaPhotos: [],
      },
      scrapedContent: {
        metaTitle: b.websiteAudit?.metaTitle || `${rawName} | ${category}${city ? ` in ${city}` : ''}`,
        // PRIVACY & SECURITY: Use public description or tagline, NEVER private businessBrain.executiveSummary
        description: b.websiteAudit?.metaDescription || b.identity?.tagline || (b.identity as any)?.description || '',
        serviceTags: b.identity?.services && b.identity.services.length > 0 ? b.identity.services : [category],
        aboutSummary: (b.identity as any)?.description || b.identity?.tagline || '',
      },
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  });

  cachedDirectoryListings = results;
  cachedDirectoryListingsTimestamp = now;
  return results;
}

export function getDirectoryListingBySlug(slugOrId: string): any | undefined {
  const listings = getPublishedDirectoryListings();
  const clean = slugOrId.toLowerCase().trim();
  return listings.find(
    (l) => l.slug.toLowerCase() === clean || l.id.toLowerCase() === clean
  );
}

// Lead Lists Engine: Deduplicated & Stored in Locora DB
export function getCachedLeadsFromLocoraDb(limit: number = 250): B2BLeadRecord[] {
  const all = Array.from(leadsCacheDatabase.values());
  return all.slice(0, limit);
}

export function addAndDeduplicateLeads(newLeads: B2BLeadRecord[]): number {
  let addedCount = 0;
  newLeads.forEach((lead) => {
    // Deduplicate by clean phone, clean email, or clean business name + city
    const existing = Array.from(leadsCacheDatabase.values()).find(
      (l) =>
        (lead.email && l.email && lead.email.toLowerCase() === l.email.toLowerCase()) ||
        (lead.phone && l.phone && lead.phone.replace(/\D/g, '') === l.phone.replace(/\D/g, '')) ||
        (lead.businessName.toLowerCase() === l.businessName.toLowerCase() && lead.city.toLowerCase() === l.city.toLowerCase())
    );

    if (!existing) {
      leadsCacheDatabase.set(lead.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, lead);
      addedCount++;
    }
  });

  if (addedCount > 0) {
    saveLeadsCacheToDisk();
  }
  return addedCount;
}

export function maskPhone(phone?: string): string {
  if (!phone) return '';
  const clean = phone.trim();
  if (clean.length > 6) {
    return clean.slice(0, 3) + '***-****';
  }
  return clean.slice(0, 2) + '***';
}

export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return '';
  const [user, domain] = email.split('@');
  const maskedUser = user.length > 2 ? user.slice(0, 2) + '***' : user.slice(0, 1) + '***';
  return `${maskedUser}@***.${domain.split('.').pop() || 'com'}`;
}

export function recordDirectoryEvent(
  param1: string | {
    eventType: DirectoryEventType | string;
    businessId?: string;
    directoryProfileId?: string;
    userId?: string | null;
    sessionId?: string | null;
    source?: string;
    city?: string;
    category?: string;
    leadId?: string;
    metadata?: Record<string, any>;
  },
  param2?: string
): { success: boolean; event?: DirectoryEventRecord; metrics?: any } {
  let eventType: string;
  let businessIdOrSlug: string | undefined;
  let userId: string | null = null;
  let sessionId: string | null = null;
  let source: string = 'directory';
  let city: string | undefined;
  let category: string | undefined;
  let leadId: string | undefined;
  let metadata: Record<string, any> = {};

  if (typeof param1 === 'string') {
    businessIdOrSlug = param1;
    eventType = param2 || 'directory_profile_view';
  } else {
    eventType = param1.eventType;
    businessIdOrSlug = param1.businessId || param1.directoryProfileId;
    userId = param1.userId || null;
    sessionId = param1.sessionId || null;
    source = param1.source || 'directory';
    city = param1.city;
    category = param1.category;
    leadId = param1.leadId;
    metadata = param1.metadata || {};
  }

  // Canonical event type mapping (Phase 4.1)
  let canonicalType: DirectoryEventType = 'directory_profile_view';
  if (eventType === 'profile_view' || eventType === 'directory_profile_view') canonicalType = 'directory_profile_view';
  else if (eventType === 'directory_search') canonicalType = 'directory_search';
  else if (eventType === 'directory_filter') canonicalType = 'directory_filter';
  else if (eventType === 'directory_checkup_started') canonicalType = 'directory_checkup_started';
  else if (eventType === 'directory_checkup_completed') canonicalType = 'directory_checkup_completed';
  else if (eventType === 'claim_click' || eventType === 'directory_claim_started') canonicalType = 'directory_claim_started';
  else if (eventType === 'claim_conversion' || eventType === 'directory_claim_completed') canonicalType = 'directory_claim_completed';
  else if (eventType === 'directory_lead_started') canonicalType = 'directory_lead_started';
  else if (eventType === 'quote_request' || eventType === 'directory_lead_submitted') canonicalType = 'directory_lead_submitted';
  else if (eventType === 'directory_lead_delivered') canonicalType = 'directory_lead_delivered';
  else if (eventType === 'directory_lead_response') canonicalType = 'directory_lead_response';
  else if (eventType === 'directory_lead_converted') canonicalType = 'directory_lead_converted';
  else if (eventType === 'phone_click') canonicalType = 'phone_click';
  else if (eventType === 'website_click') canonicalType = 'website_click';
  else canonicalType = eventType as any;

  const now = new Date().toISOString();
  let targetBiz: LocoraBusinessRecord | undefined;
  let targetListing: DirectoryBusinessListing | null = null;

  if (businessIdOrSlug) {
    targetListing = getDirectoryListingBySlug(businessIdOrSlug) || (Array.from(businessesDatabase.values()).find(b => b.id === businessIdOrSlug) as any);
    if (targetListing) {
      targetBiz = businessesDatabase.get(targetListing.id);
      if (!city && targetListing.cityName) city = targetListing.cityName;
      if (!category && targetListing.categoryName) category = targetListing.categoryName;
    }
  }

  // Strip any accidental sensitive passwords or security credentials
  const cleanMetadata = { ...metadata };
  delete cleanMetadata.password;
  delete cleanMetadata.secret;
  delete cleanMetadata.token;

  const eventRecord: DirectoryEventRecord = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    eventType: canonicalType,
    businessId: targetBiz?.id || targetListing?.id || (businessIdOrSlug && !businessIdOrSlug.startsWith('http') ? businessIdOrSlug : undefined),
    directoryProfileId: targetListing?.slug || businessIdOrSlug,
    userId,
    sessionId,
    timestamp: now,
    source,
    city,
    category,
    leadId,
    metadata: Object.keys(cleanMetadata).length > 0 ? cleanMetadata : undefined,
  };

  directoryEventsDatabase.push(eventRecord);
  saveDirectoryEventsToDisk();

  // If business entity is found, update its aggregated counters
  if (targetBiz) {
    if (!targetBiz.directoryMetrics) {
      targetBiz.directoryMetrics = {
        profileViews: 0,
        phoneClicks: 0,
        websiteClicks: 0,
        quoteRequests: 0,
        claimClicks: 0,
        claimConversions: 0,
        lastViewedAt: null,
      };
    }

    if (canonicalType === 'directory_profile_view') {
      targetBiz.directoryMetrics.profileViews = (targetBiz.directoryMetrics.profileViews || 0) + 1;
      targetBiz.directoryMetrics.lastViewedAt = now;
    } else if (canonicalType === 'phone_click') {
      targetBiz.directoryMetrics.phoneClicks = (targetBiz.directoryMetrics.phoneClicks || 0) + 1;
    } else if (canonicalType === 'website_click') {
      targetBiz.directoryMetrics.websiteClicks = (targetBiz.directoryMetrics.websiteClicks || 0) + 1;
    } else if (canonicalType === 'directory_lead_submitted') {
      targetBiz.directoryMetrics.quoteRequests = (targetBiz.directoryMetrics.quoteRequests || 0) + 1;
    } else if (canonicalType === 'directory_claim_started') {
      targetBiz.directoryMetrics.claimClicks = (targetBiz.directoryMetrics.claimClicks || 0) + 1;
    } else if (canonicalType === 'directory_claim_completed') {
      targetBiz.directoryMetrics.claimConversions = (targetBiz.directoryMetrics.claimConversions || 0) + 1;
    }

    targetBiz.updatedAt = now;
    businessesDatabase.set(targetBiz.id, targetBiz);
    saveLocoraDatabaseToDisk();
  }

  return { success: true, event: eventRecord, metrics: targetBiz?.directoryMetrics };
}

export function createDirectoryLead(leadData: {
  businessId: string;
  leadName: string;
  leadEmail?: string;
  leadPhone: string;
  serviceRequested?: string;
  message?: string;
  city?: string;
  category?: string;
  sessionId?: string;
  userId?: string;
}): { success: boolean; lead: DirectoryLeadItem; isPremium: boolean; ownerEmail?: string; businessName?: string } {
  const listing = getDirectoryListingBySlug(leadData.businessId) || getPublishedDirectoryListings().find(b => b.id === leadData.businessId);
  const ownerRecord = listing ? getBusinessRecordById(listing.id) : undefined;
  const planTier = ownerRecord?.planTier || listing?.planTier || 'free';
  const isPremium = planTier === 'pro' || planTier === 'agency_elite' || planTier === 'growth';

  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const directoryLead: DirectoryLeadItem = {
    id: leadId,
    businessId: listing?.id || leadData.businessId,
    directoryProfileId: listing?.slug || leadData.businessId,
    source: 'directory', // 4.4: Every directory lead retains source = directory
    leadName: leadData.leadName,
    leadEmail: isPremium ? (leadData.leadEmail || '') : '',
    leadPhone: isPremium ? leadData.leadPhone : '',
    maskedEmail: leadData.leadEmail ? (isPremium ? leadData.leadEmail : maskEmail(leadData.leadEmail)) : '',
    maskedPhone: isPremium ? leadData.leadPhone : maskPhone(leadData.leadPhone),
    isUnlocked: isPremium,
    serviceRequested: leadData.serviceRequested || listing?.categoryName || 'General Service',
    message: leadData.message || '',
    city: listing?.cityName || leadData.city || '',
    category: listing?.categoryName || leadData.category || '',
    status: isPremium ? 'delivered' : 'delivered',
    deliveredViaEmail: Boolean(listing?.email || ownerRecord?.userEmail),
    deliveredViaSms: false,
    deliveredAt: now,
    respondedAt: null,
    convertedAt: null,
    convertedCustomerId: null,
    submittedAt: now,
  };

  // 1. Store in atomic directory leads database
  directoryLeadsDatabase.set(leadId, directoryLead);
  saveDirectoryLeadsToDisk();

  // 2. Connect to business owner's B2B lead cache with source = directory attribution
  if (ownerRecord) {
    if (!ownerRecord.leadCache) {
      ownerRecord.leadCache = { totalCount: 0, leads: [], exports: [] };
    }
    ownerRecord.leadCache.leads.unshift({
      id: leadId,
      businessName: leadData.leadName,
      phone: isPremium ? leadData.leadPhone : maskPhone(leadData.leadPhone),
      email: isPremium ? (leadData.leadEmail || '') : (leadData.leadEmail ? maskEmail(leadData.leadEmail) : ''),
      website: '',
      category: directoryLead.serviceRequested,
      rating: 5,
      reviewCount: 1,
      address: listing?.cityName ? `${listing.cityName}, ${listing.stateCode}` : '',
      city: listing?.cityName || '',
      state: listing?.stateCode || '',
      hasWebsite: false,
      hasSsl: true,
      hasSchema: true,
      validationStatus: isPremium ? 'verified' : 'unverified',
      leadScore: isPremium ? 95 : 70,
      acquiredAt: now,
    });
    ownerRecord.leadCache.totalCount = ownerRecord.leadCache.leads.length;
    saveBusinessRecordToLocoraDb(ownerRecord);
  }

  // 3. Track real 4.1 events: directory_lead_submitted
  recordDirectoryEvent({
    eventType: 'directory_lead_submitted',
    businessId: directoryLead.businessId,
    directoryProfileId: directoryLead.directoryProfileId,
    leadId: leadId,
    source: 'directory',
    city: directoryLead.city,
    category: directoryLead.category,
    sessionId: leadData.sessionId,
    userId: leadData.userId,
    metadata: { serviceRequested: directoryLead.serviceRequested, isPremium },
  });

  // 4. Track real 4.1 events: directory_lead_delivered
  if (directoryLead.deliveredViaEmail || isPremium) {
    recordDirectoryEvent({
      eventType: 'directory_lead_delivered',
      businessId: directoryLead.businessId,
      directoryProfileId: directoryLead.directoryProfileId,
      leadId: leadId,
      source: 'directory',
      city: directoryLead.city,
      category: directoryLead.category,
      sessionId: leadData.sessionId,
      userId: leadData.userId,
      metadata: { deliveredViaEmail: directoryLead.deliveredViaEmail, isPremium },
    });
  }

  return {
    success: true,
    lead: directoryLead,
    isPremium,
    ownerEmail: listing?.email || ownerRecord?.userEmail,
    businessName: listing?.businessName,
  };
}

export function markDirectoryLeadResponded(leadId: string, businessId?: string, businessSlug?: string): { success: boolean; lead?: DirectoryLeadItem; error?: string } {
  const lead = directoryLeadsDatabase.get(leadId);
  if (!lead) {
    return { success: false, error: 'Lead not found' };
  }
  if (businessId) {
    const cleanId = businessId.toLowerCase().trim();
    const cleanSlug = (businessSlug || '').toLowerCase().trim();
    const belongs =
      lead.businessId.toLowerCase() === cleanId ||
      (lead.directoryProfileId && lead.directoryProfileId.toLowerCase() === cleanId) ||
      (cleanSlug && lead.directoryProfileId && lead.directoryProfileId.toLowerCase() === cleanSlug);
    if (!belongs) {
      return { success: false, error: 'Lead does not belong to this business' };
    }
  }
  const now = new Date().toISOString();
  lead.status = 'contacted';
  lead.respondedAt = now;
  directoryLeadsDatabase.set(leadId, lead);
  saveDirectoryLeadsToDisk();

  recordDirectoryEvent({
    eventType: 'directory_lead_response',
    businessId: lead.businessId,
    directoryProfileId: lead.directoryProfileId,
    leadId: lead.id,
    source: 'directory',
    city: lead.city,
    category: lead.category,
    metadata: { respondedAt: now },
  });

  return { success: true, lead };
}

export function convertDirectoryLead(
  leadId: string,
  businessId?: string,
  customerData?: { customerId?: string; customerName?: string; customerEmail?: string; customerPhone?: string; value?: number },
  businessSlug?: string
): { success: boolean; lead?: DirectoryLeadItem; customerId?: string; error?: string } {
  const lead = directoryLeadsDatabase.get(leadId);
  if (!lead) {
    return { success: false, error: 'Lead not found' };
  }
  if (businessId) {
    const cleanId = businessId.toLowerCase().trim();
    const cleanSlug = (businessSlug || '').toLowerCase().trim();
    const belongs =
      lead.businessId.toLowerCase() === cleanId ||
      (lead.directoryProfileId && lead.directoryProfileId.toLowerCase() === cleanId) ||
      (cleanSlug && lead.directoryProfileId && lead.directoryProfileId.toLowerCase() === cleanSlug);
    if (!belongs) {
      return { success: false, error: 'Lead does not belong to this business' };
    }
  }
  const now = new Date().toISOString();
  const customerId = customerData?.customerId || `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  lead.status = 'converted';
  lead.convertedAt = now;
  lead.convertedCustomerId = customerId;
  directoryLeadsDatabase.set(leadId, lead);
  saveDirectoryLeadsToDisk();

  recordDirectoryEvent({
    eventType: 'directory_lead_converted',
    businessId: lead.businessId,
    directoryProfileId: lead.directoryProfileId,
    leadId: lead.id,
    source: 'directory',
    city: lead.city,
    category: lead.category,
    metadata: {
      customerId,
      value: customerData?.value || 0,
      convertedAt: now,
    },
  });

  return { success: true, lead, customerId };
}

export function getDirectoryLeadsForBusiness(businessId: string, businessSlug?: string): DirectoryLeadItem[] {
  const allLeads = Array.from(directoryLeadsDatabase.values());
  const cleanId = businessId.toLowerCase().trim();
  const cleanSlug = (businessSlug || '').toLowerCase().trim();
  return allLeads
    .filter(
      (l) =>
        l.businessId.toLowerCase() === cleanId ||
        (l.directoryProfileId && l.directoryProfileId.toLowerCase() === cleanId) ||
        (cleanSlug && l.directoryProfileId && l.directoryProfileId.toLowerCase() === cleanSlug)
    )
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function getDirectoryEvents(filters?: { businessId?: string; businessSlug?: string; eventType?: string; limit?: number }): DirectoryEventRecord[] {
  let list = [...directoryEventsDatabase];
  if (filters?.businessId) {
    const cleanId = filters.businessId.toLowerCase().trim();
    const cleanSlug = (filters.businessSlug || '').toLowerCase().trim();
    list = list.filter(
      (e) =>
        (e.businessId && e.businessId.toLowerCase() === cleanId) ||
        (e.directoryProfileId && e.directoryProfileId.toLowerCase() === cleanId) ||
        (cleanSlug && e.directoryProfileId && e.directoryProfileId.toLowerCase() === cleanSlug)
    );
  }
  if (filters?.eventType) {
    list = list.filter((e) => e.eventType === filters.eventType);
  }
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, filters?.limit || 100);
}

export function getDirectoryAnalytics(businessId?: string, businessSlug?: string): {
  totalPublishedListings: number;
  claimedListings: number;
  unclaimedListings: number;
  totalProfileViews: number;
  totalPhoneClicks: number;
  totalWebsiteClicks: number;
  totalQuoteRequests: number;
  totalClaimClicks: number;
  totalClaimConversions: number;
  overallConversionRate: number;
  citiesCount: number;
  categoriesCount: number;
  topListings: Array<{ id: string; name: string; slug: string; city: string; views: number; leads: number }>;
  businessMetrics?: DirectoryBusinessAnalytics | null;
} {
  const listings = getPublishedDirectoryListings();
  let totalProfileViews = 0;
  let totalPhoneClicks = 0;
  let totalWebsiteClicks = 0;
  let totalQuoteRequests = 0;
  let totalClaimClicks = 0;
  let totalClaimConversions = 0;
  let claimedCount = 0;

  const cities = new Set<string>();
  const categories = new Set<string>();

  let targetBizMetrics: DirectoryBusinessAnalytics | null = null;

  const topListings = listings.map((l) => {
    const metrics = l.directoryMetrics || {};
    const views = metrics.profileViews || 0;
    const phone = metrics.phoneClicks || 0;
    const web = metrics.websiteClicks || 0;
    const quotes = metrics.quoteRequests || 0;
    const cClicks = metrics.claimClicks || 0;
    const cConv = metrics.claimConversions || 0;

    totalProfileViews += views;
    totalPhoneClicks += phone;
    totalWebsiteClicks += web;
    totalQuoteRequests += quotes;
    totalClaimClicks += cClicks;
    totalClaimConversions += cConv;

    if (l.isClaimed) claimedCount++;
    if (l.cityName) cities.add(l.cityName.toLowerCase());
    if (l.categoryName) categories.add(l.categoryName.toLowerCase());

    return {
      id: l.id,
      name: l.businessName,
      slug: l.slug,
      city: l.cityName,
      views,
      leads: quotes + phone,
    };
  }).sort((a, b) => (b.views + b.leads) - (a.views + a.leads)).slice(0, 10);

  // Compute authentic metrics for the requested business
  if (businessId || businessSlug) {
    const cleanId = (businessId || '').toLowerCase().trim();
    const cleanSlug = (businessSlug || '').toLowerCase().trim();
    const targetListing = listings.find(
      (l) =>
        (cleanId && (l.id.toLowerCase() === cleanId || l.slug.toLowerCase() === cleanId)) ||
        (cleanSlug && (l.id.toLowerCase() === cleanSlug || l.slug.toLowerCase() === cleanSlug))
    );
    if (targetListing) {
      const realBizId = targetListing.id;
      const realSlug = targetListing.slug;

      // Authentic events filtered for this business
      const bizEvents = directoryEventsDatabase.filter(
        (e) => (e.businessId && e.businessId.toLowerCase() === realBizId.toLowerCase()) ||
               (e.directoryProfileId && e.directoryProfileId.toLowerCase() === realSlug.toLowerCase())
      );

      // Authentic leads filtered for this business
      const bizLeads = Array.from(directoryLeadsDatabase.values()).filter(
        (dl) => dl.businessId.toLowerCase() === realBizId.toLowerCase() ||
                (dl.directoryProfileId && dl.directoryProfileId.toLowerCase() === realSlug.toLowerCase())
      ).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      // Authentic counts strictly from stored data (Phase 4.3 - Never fabricate numbers!)
      const profileViews = Math.max(
        targetListing.directoryMetrics?.profileViews || 0,
        bizEvents.filter((e) => e.eventType === 'directory_profile_view').length
      );
      const checkupsStarted = bizEvents.filter((e) => e.eventType === 'directory_checkup_started').length;
      const checkupsCompleted = bizEvents.filter((e) => e.eventType === 'directory_checkup_completed').length;
      const phoneClicks = Math.max(
        targetListing.directoryMetrics?.phoneClicks || 0,
        bizEvents.filter((e) => e.eventType === 'phone_click').length
      );
      const websiteClicks = Math.max(
        targetListing.directoryMetrics?.websiteClicks || 0,
        bizEvents.filter((e) => e.eventType === 'website_click').length
      );
      const claimClicks = Math.max(
        (targetListing.directoryMetrics as any)?.claimClicks || 0,
        bizEvents.filter((e) => e.eventType === 'directory_claim_started').length
      );

      const totalLeads = bizLeads.length;
      const deliveredLeads = bizLeads.filter((l) => l.deliveredAt != null || l.deliveredViaEmail).length;
      const responsesCount = bizLeads.filter((l) => l.respondedAt != null).length;
      const conversionsCount = bizLeads.filter((l) => l.convertedAt != null).length;
      const totalInquiries = totalLeads + phoneClicks + websiteClicks;

      const leadConversionRate = totalLeads > 0 ? Number(((conversionsCount / totalLeads) * 100).toFixed(1)) : 0;
      const inquiryRate = profileViews > 0 ? Number(((totalInquiries / profileViews) * 100).toFixed(1)) : 0;

      targetBizMetrics = {
        businessId: realBizId,
        businessName: targetListing.businessName,
        slug: realSlug,
        isClaimed: Boolean(targetListing.isClaimed),
        profileViews,
        checkupsStarted,
        checkupsCompleted,
        totalInquiries,
        totalLeads,
        deliveredLeads,
        phoneClicks,
        websiteClicks,
        claimClicks,
        claimCompleted: Boolean(targetListing.isClaimed),
        responsesCount,
        conversionsCount,
        leadConversionRate,
        inquiryRate,
        leads: bizLeads,
        recentEvents: bizEvents.slice(-20).reverse(),
      };
    }
  }

  const totalActions = totalQuoteRequests + totalPhoneClicks + totalWebsiteClicks;
  const overallConversionRate = totalProfileViews > 0 ? Number(((totalActions / totalProfileViews) * 100).toFixed(2)) : 0;

  return {
    totalPublishedListings: listings.length,
    claimedListings: claimedCount,
    unclaimedListings: listings.length - claimedCount,
    totalProfileViews,
    totalPhoneClicks,
    totalWebsiteClicks,
    totalQuoteRequests,
    totalClaimClicks,
    totalClaimConversions,
    overallConversionRate,
    citiesCount: cities.size,
    categoriesCount: categories.size,
    topListings,
    businessMetrics: targetBizMetrics,
  };
}

export function claimDirectoryListingByBusinessId(
  businessIdOrSlug: string,
  userEmail: string,
  fullName?: string
): { success: boolean; business?: LocoraBusinessRecord; alreadyClaimed?: boolean; error?: string } {
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Valid user email is required to claim a business.' };
  }

  const listing = getDirectoryListingBySlug(businessIdOrSlug);
  if (!listing) {
    return { success: false, error: 'Business listing not found.' };
  }

  const biz = businessesDatabase.get(listing.id);
  if (!biz) {
    return { success: false, error: 'Canonical business entity not found in database.' };
  }

  // If already claimed by someone else
  if (biz.isClaimed && biz.claimedByEmail && biz.claimedByEmail.toLowerCase() !== cleanEmail) {
    return {
      success: false,
      alreadyClaimed: true,
      error: `This business is already claimed and verified by another account (${biz.claimedByEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}). Contact support if this is your listing.`,
    };
  }

  // Attach user to the canonical business record — NO duplicate business created!
  biz.isClaimed = true;
  biz.claimedByEmail = cleanEmail;
  biz.userEmail = cleanEmail;
  biz.userId = `user_${cleanEmail.replace(/[^a-z0-9]/gi, '_')}`;
  biz.directoryStatus = 'CLAIMED';
  biz.updatedAt = new Date().toISOString();

  if (!biz.sourceAttributions) biz.sourceAttributions = {};
  biz.sourceAttributions.verification = `Verified Owner (${cleanEmail})`;
  biz.sourceAttributions.gbp = biz.gbpData?.primaryPhone || biz.gbpData?.address ? 'Google Business Profile (Synced)' : undefined;
  biz.sourceAttributions.website = 'Locora Web Crawler';

  // If full name provided, ensure owner name or contact record exists
  if (fullName && (!biz.identity.name || biz.identity.name === 'My Local Business')) {
    biz.identity.name = fullName;
  }

  // Phase 1.3: Ensure Business Brain becomes available immediately
  if (!biz.businessBrain || !biz.businessBrain.executiveSummary) {
    try {
      biz.businessBrain = synthesizeBusinessBrainFromRecord(biz);
    } catch {}
  }

  businessesDatabase.set(biz.id, biz);
  saveLocoraDatabaseToDisk();
  invalidateDirectoryListingsCache();

  recordDirectoryEvent({
    eventType: 'directory_claim_completed',
    businessId: biz.id,
    directoryProfileId: listing.slug,
    userId: cleanEmail,
    source: 'directory_claim',
    city: biz.identity.address || listing.cityName,
    category: listing.categoryName,
    metadata: { claimedByEmail: cleanEmail, contactName: fullName },
  });

  return { success: true, business: biz };
}

export function updateDirectoryProfileRecord(
  businessIdOrSlug: string,
  updates: {
    bio?: string;
    description?: string;
    services?: string[];
    businessHours?: Record<string, string>;
    photos?: string[];
    isPublishedInDirectory?: boolean;
    phone?: string;
    website?: string;
  }
): { success: boolean; business?: any; error?: string } {
  const listing = getDirectoryListingBySlug(businessIdOrSlug);
  let biz = listing ? businessesDatabase.get(listing.id) : (businessesDatabase.get(businessIdOrSlug) || businessesDatabase.get((businessIdOrSlug || '').toLowerCase().trim()));
  if (!biz) {
    const clean = (businessIdOrSlug || '').toLowerCase().trim();
    biz = Array.from(businessesDatabase.values()).find(
      (b) =>
        b.id === businessIdOrSlug ||
        b.id.toLowerCase() === clean ||
        (b.identity?.name && b.identity.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === clean) ||
        (b.identity?.name && b.identity.name.toLowerCase().trim() === clean)
    );
  }
  if (!biz) {
    return { success: false, error: 'Business not found in Locora database' };
  }

  if (updates.bio !== undefined) {
    if (!biz.identity) biz.identity = {} as any;
    biz.identity.tagline = updates.bio;
    (biz.identity as any).description = updates.bio;
  }
  if (updates.description !== undefined) {
    if (!biz.identity) biz.identity = {} as any;
    biz.identity.tagline = updates.description;
    (biz.identity as any).description = updates.description;
  }
  if (updates.services && Array.isArray(updates.services)) {
    if (!biz.identity) biz.identity = {} as any;
    if (!biz.identity.services) biz.identity.services = [];
    updates.services.forEach((s) => {
      if (!biz!.identity.services.includes(s)) {
        biz!.identity.services.push(s);
      }
    });
    if (!(biz as any).servicesCatalog) (biz as any).servicesCatalog = [];
    updates.services.forEach((s) => {
      if (!(biz as any).servicesCatalog.some((existing: any) => existing.name.toLowerCase() === s.toLowerCase())) {
        (biz as any).servicesCatalog.push({
          id: `svc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: s,
          category: biz!.identity?.category || 'Services',
          isPublished: true,
        });
      }
    });
  }
  if (updates.businessHours) {
    if (!biz.gbpData) biz.gbpData = {} as any;
    biz.gbpData.businessHours = Object.entries(updates.businessHours).map(([day, hours]) => `${day}: ${hours}`);
  }
  if (updates.phone) {
    if (!biz.identity) biz.identity = {} as any;
    biz.identity.phone = updates.phone;
  }
  if (updates.website) {
    if (!biz.identity) biz.identity = {} as any;
    biz.identity.website = updates.website;
  }
  if (updates.isPublishedInDirectory !== undefined) {
    biz.isPublishedInDirectory = updates.isPublishedInDirectory;
  }

  biz.updatedAt = new Date().toISOString();
  businessesDatabase.set(biz.id, biz);
  saveLocoraDatabaseToDisk();
  invalidateDirectoryListingsCache();

  return { success: true, business: biz };
}

// Ensure database is initialized on server boot
loadLocoraDatabaseFromDisk();
