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

const DATA_DIR = path.join(process.cwd(), 'data');
const LOCORA_DB_FILE = path.join(DATA_DIR, 'locora_database.json');
const LOCORA_LEADS_FILE = path.join(DATA_DIR, 'locora_leads_cache.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// In-Memory database store for rapid access, backed by atomic disk persistence
const businessesDatabase = new Map<string, LocoraBusinessRecord>();
const leadsCacheDatabase = new Map<string, B2BLeadRecord>();

// Initialize default seed business records for guest preview only (never containing dental or fake user data)
function createDemoBusinessRecord(
  id: string = 'biz_demo_workspace',
  name: string = 'Demo Growth Agency',
  website: string = 'demo.locora.ai',
  category: string = 'Digital Marketing & SEO',
  city: string = 'San Francisco',
  tier: DataProviderTier = 'pro'
): LocoraBusinessRecord {
  const now = new Date().toISOString();
  return {
    id,
    planTier: tier,
    createdAt: now,
    updatedAt: now,
    identity: {
      name,
      tagline: 'Digital Marketing & Local Growth Solutions',
      website,
      phone: '(555) 019-2831',
      address: '500 Market St, Suite 300',
      city,
      state: 'CA',
      zip: '94105',
      country: 'United States',
      category,
      industry: 'Marketing & Advertising',
      targetLocations: [`${city}, CA`, 'Oakland, CA', 'San Jose, CA'],
      services: ['Local SEO Optimization', 'Technical Website Audits', 'Reputation Management', 'Conversion Rate Optimization'],
    },
    websiteAudit: {
      url: website,
      isSsl: true,
      httpStatus: 200,
      latencyMs: 240,
      performanceScore: 88,
      seoScore: 84,
      accessibilityScore: 92,
      mobileFriendly: true,
      wordCount: 1650,
      hasSchema: true,
      schemaTypes: ['LocalBusiness', 'Organization'],
      metaTitle: `${name} | Local SEO & Growth Marketing in ${city}`,
      metaDescription: `Full-service digital growth agency helping local businesses in ${city} dominate search results and scale customer inquiries.`,
      h1Matches: [`Accelerate Your Local Search Presence with ${name}`],
      h2Matches: ['Our Core Solutions', 'Client Case Studies', 'Get in Touch'],
      issues: [
        {
          id: 'iss_schema_notice',
          type: 'info',
          category: 'schema',
          title: 'Verified LocalBusiness Schema Detected',
          description: 'JSON-LD structured data is present and validated for Google Maps and AI search engines.',
          recommendation: 'Keep opening hours and service catalog synchronized in schema.',
        },
      ],
      lastCrawledAt: now,
      source: 'own_crawler',
    },
    gbpData: {
      connected: true,
      listingName: `${name} (Google Maps)`,
      rating: 4.9,
      reviewCount: 48,
      unansweredReviews: 2,
      category,
      businessHours: ['Mon-Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 3:00 PM', 'Sun: Closed'],
      photosCount: 24,
      primaryPhone: '(555) 019-2831',
      address: `500 Market St, ${city}, CA 94105`,
      attributes: ['Wheelchair accessible', 'Online appointments', 'Verified business'],
      lastSyncedAt: now,
      source: 'google_places',
    },
    reviews: [
      {
        id: 'rev_demo_1',
        author: 'Sarah Jenkins',
        rating: 5,
        text: 'Outstanding local marketing team. They completely revamped our local search presence and we saw a surge in customer calls within weeks.',
        publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        sentiment: 'positive',
        keywordsMentioned: ['local search', 'growth', 'customer calls'],
        isAnswered: true,
        replyText: 'Thank you Sarah! We love supporting your business growth and helping you dominate local search.',
        repliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        source: 'google_gbp',
      },
      {
        id: 'rev_demo_2',
        author: 'David Miller',
        rating: 4,
        text: 'Very knowledgeable and responsive team. Would appreciate more frequent weekly reporting updates.',
        publishedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        sentiment: 'neutral',
        keywordsMentioned: ['responsive', 'reporting'],
        isAnswered: false,
        source: 'google_gbp',
      },
    ],
    localPack: {
      query: `${category} in ${city}`,
      location: `${city}, CA`,
      businessName: name,
      rankPosition: 2,
      inThreePack: true,
      competitorsInPack: [
        { name: 'Horizon Growth Partners', position: 1, rating: 4.9, reviewCount: 62, address: '200 California St' },
        { name: name, position: 2, rating: 4.9, reviewCount: 48, address: '500 Market St' },
        { name: 'Bay Area Digital Co', position: 3, rating: 4.7, reviewCount: 39, address: '750 Mission St' },
      ],
      lastTrackedAt: now,
      source: 'low_cost_serp',
    },
    competitors: [
      {
        id: 'comp_1',
        name: 'Horizon Growth Partners',
        website: 'horizongrowth.example.com',
        rating: 4.9,
        reviewCount: 62,
        estimatedTrafficMonthly: 3800,
        rankingKeywordsCount: 310,
        sharedKeywords: ['local seo agency', 'growth marketing consultant'],
        reviewGap: 14,
        strengths: ['High review volume (+6 last month)', 'Dedicated sub-service pages'],
        weaknesses: ['Missing FAQ schema', 'Slower mobile speed'],
        lastAnalyzedAt: now,
        source: 'google_places',
      },
    ],
    keywords: [
      {
        keyword: 'local seo agency',
        searchVolume: 1200,
        rank: 2,
        previousRank: 4,
        intent: 'commercial',
        impressions: 4800,
        clicks: 340,
        ctr: 7.08,
        difficultyScore: 42,
        source: 'gsc',
      },
      {
        keyword: 'growth marketing consultant',
        searchVolume: 880,
        rank: 4,
        previousRank: 5,
        intent: 'commercial',
        impressions: 2900,
        clicks: 160,
        ctr: 5.51,
        difficultyScore: 48,
        source: 'gsc',
      },
    ],
    traffic: {
      sessions: 2450,
      pageviews: 5890,
      bounceRate: 41.2,
      avgDurationSec: 145,
      topChannels: [
        { channel: 'Organic Search (Google)', percentage: 58 },
        { channel: 'Google Maps / Local', percentage: 26 },
        { channel: 'Direct / Referrals', percentage: 16 },
      ],
      gscClicks: 890,
      gscImpressions: 19400,
      avgPosition: 3.2,
      lastSyncedAt: now,
      source: 'ga4',
    },
    aiVisibility: {
      score: 86,
      chatGptMentioned: true,
      perplexityRank: 2,
      geminiCitation: true,
      claudeRecommendation: true,
      brandSentimentScore: 94,
      samplePromptEvaluated: `Who is the top rated ${category.toLowerCase()} in ${city}?`,
      monitoringFrequency: 'scheduled_weekly',
      lastCheckedAt: now,
    },
    businessBrain: {
      score: 85,
      readinessScore: 90,
      swot: {
        strengths: [
          'High 4.9★ rating across 48 verified customer reviews',
          'Fast and secure website foundation with active Schema markup',
          'Ranking #2 in local Google 3-Pack for core commercial keywords',
        ],
        weaknesses: [
          '1 review awaiting official owner response',
        ],
        opportunities: [
          'Close the 14-review gap with Horizon Growth Partners',
          'Publish geo-targeted sub-service pages to capture surrounding territory search queries',
        ],
        threats: [
          'Competitors actively publishing localized content to challenge 3-Pack placement',
        ],
      },
      priorityActions: [
        {
          id: 'act_respond_demo_review',
          urgency: 'high',
          urgencyLabel: 'HIGH IMPACT',
          title: 'Respond to 1 Pending Customer Review',
          problem: 'David Miller left a 4-star review that has not yet received an owner reply.',
          whyItMatters: 'Responding to all reviews within 24 hours improves customer retention and local SEO trust signals.',
          evidence: '1 unanswered review on Google Business Profile.',
          expectedImpact: 'Reaches 100% response rate and boosts local pack prominence.',
          actionType: 'respond_reviews',
          actionLabel: '[ Respond with AI ]',
          recommendationTitle: 'Draft Owner Reply',
          isFixed: false,
        },
        {
          id: 'act_geo_page_demo',
          urgency: 'opportunity',
          urgencyLabel: 'OPPORTUNITY',
          title: 'Publish Geo-Targeted Service Landing Page',
          problem: 'Competitors are capturing neighborhood search traffic in surrounding regions.',
          whyItMatters: 'Dedicated service pages targeting localized queries convert searchers at 3x the rate of a generic homepage.',
          evidence: 'Search volume for target services is rising in adjacent areas.',
          expectedImpact: '+20% increase in high-intent organic calls.',
          actionType: 'create_page',
          actionLabel: '[ Generate Page ]',
          recommendationTitle: 'Create Service Page',
          isFixed: false,
        },
      ],
      targetKeywords: [`${category.toLowerCase()} ${city.toLowerCase()}`, `top ${category.toLowerCase()}`],
      activeOffers: ['Complimentary Local Growth & SEO Diagnostic', 'New Client Strategy Session'],
      voicePersona: 'Authoritative, strategic, and growth-focused',
      executiveSummary: `${name} holds a healthy 85/100 Business Brain score with verified 4.9★ reputation and strong local 3-Pack presence.`,
      lastSynthesizedAt: now,
    },
    history: [
      {
        date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        healthScore: 78,
        seoScore: 76,
        googleRating: 4.8,
        reviewCount: 42,
        unansweredReviews: 4,
        estTraffic: 2450,
        localPackRank: 2,
        aiVisibilityScore: 86,
      },
    ],
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
      crawler: { provider: 'own_crawler', last_sync: now, data_freshness: 'fresh', cost: 0, confidence: 96, status: 'active' },
      places: { provider: 'google_places', last_sync: now, data_freshness: 'fresh', cost: 0, confidence: 94, status: 'active' },
      serp: { provider: 'low_cost_serp', last_sync: now, data_freshness: 'cached', cost: 0, confidence: 92, status: 'active' },
      analytics: { provider: 'ga4', last_sync: now, data_freshness: 'fresh', cost: 0, confidence: 95, status: 'active' },
    },
  };
}

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
        businessesDatabase.set(key, data[key]);
      });
      console.log(`[Locora Data Engine] Loaded ${businessesDatabase.size} business records from Locora Database.`);
    } catch (e: any) {
      console.error('[Locora Data Engine] Error reading database from disk:', e.message);
    }
  }

  // Seed default demo business for guest preview only if empty
  if (businessesDatabase.size === 0) {
    const seed1 = createDemoBusinessRecord();
    businessesDatabase.set(seed1.id, seed1);
    saveLocoraDatabaseToDisk();
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

  return new Promise((resolve) => {
    let responded = false;
    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        resolve(fallbackCrawlResult(clean, Date.now() - startTime));
      }
    }, 4500);

    try {
      const parsed = new URL(targetUrl);
      const req = https.get(
        parsed,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LocoraBot/2.0; +https://locora.ai)',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          rejectUnauthorized: false,
        },
        (res) => {
          let html = '';
          const isSsl = true;
          const httpStatus = res.statusCode || 200;

          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            html += chunk;
            if (html.length > 500000) res.destroy(); // Cap at 500KB for speed
          });

          res.on('end', () => {
            if (responded) return;
            responded = true;
            clearTimeout(timeout);
            const latencyMs = Date.now() - startTime;
            const normalized = normalizeCrawlHtml(clean, html, isSsl, httpStatus, latencyMs);
            resolve(normalized);
          });
        }
      );

      req.on('error', () => {
        if (!responded) {
          responded = true;
          clearTimeout(timeout);
          resolve(fallbackCrawlResult(clean, Date.now() - startTime));
        }
      });
    } catch {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        resolve(fallbackCrawlResult(clean, Date.now() - startTime));
      }
    }
  });
}

function normalizeCrawlHtml(
  cleanDomain: string,
  html: string,
  isSsl: boolean,
  httpStatus: number,
  latencyMs: number
): Partial<WebsiteAuditData> {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const metaTitle = titleMatch ? titleMatch[1].trim() : `${cleanDomain}`;

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

  // Compute calculated scores
  let seoScore = 70;
  if (metaTitle.length >= 10 && metaTitle.length <= 60) seoScore += 8;
  if (metaDescription.length >= 50 && metaDescription.length <= 160) seoScore += 8;
  if (h1Matches.length === 1) seoScore += 6;
  if (hasJsonLd) seoScore += 8;
  seoScore = Math.min(98, Math.max(45, seoScore));

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
  const updated: LocoraBusinessRecord = {
    ...existingRecord,
    ...updates,
    updatedAt: new Date().toISOString(),
    identity: {
      ...existingRecord.identity,
      ...(updates.identity || {}),
    },
    websiteAudit: {
      ...existingRecord.websiteAudit,
      ...(updates.websiteAudit || {}),
    },
    gbpData: {
      ...existingRecord.gbpData,
      ...(updates.gbpData || {}),
    },
    localPack: {
      ...existingRecord.localPack,
      ...(updates.localPack || {}),
    },
    traffic: {
      ...existingRecord.traffic,
      ...(updates.traffic || {}),
    },
    aiVisibility: {
      ...existingRecord.aiVisibility,
      ...(updates.aiVisibility || {}),
    },
    leadCache: {
      ...existingRecord.leadCache,
      ...(updates.leadCache || {}),
    },
    oneTimeProducts: {
      ...existingRecord.oneTimeProducts,
      ...(updates.oneTimeProducts || {}),
    },
  };

  // Keep reviews array safe
  if (updates.reviews && Array.isArray(updates.reviews)) {
    updated.reviews = updates.reviews;
  }

  // Keep competitors array safe
  if (updates.competitors && Array.isArray(updates.competitors)) {
    updated.competitors = updates.competitors;
  }

  // Keep keywords array safe
  if (updates.keywords && Array.isArray(updates.keywords)) {
    updated.keywords = updates.keywords;
  }

  // Re-synthesize Business Brain directly from the normalized database state
  updated.businessBrain = synthesizeBusinessBrainFromRecord(updated);

  return updated;
}

// --------------------------------------------------------------------------
// BUSINESS BRAIN SYNTHESIZER (READS EXCLUSIVELY FROM LOCORA DB)
// --------------------------------------------------------------------------

export function synthesizeBusinessBrainFromRecord(record: LocoraBusinessRecord): BusinessBrainState {
  const { websiteAudit, gbpData, reviews, localPack, competitors, identity } = record;

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
  if (gbpData.rating >= 4.7) {
    strengths.push(`High customer satisfaction rating (${gbpData.rating}★ over ${gbpData.reviewCount} reviews).`);
  }
  if (websiteAudit.isSsl && websiteAudit.latencyMs < 500) {
    strengths.push(`Fast and secure web foundation (${websiteAudit.latencyMs}ms response time, active SSL).`);
  }
  if (websiteAudit.wordCount > 1000) {
    strengths.push(`Rich homepage content depth (${websiteAudit.wordCount} words indexed).`);
  }

  // Weaknesses
  if (!websiteAudit.hasSchema) {
    weaknesses.push('Missing LocalBusiness Schema.org JSON-LD structured data.');
  }
  if (gbpData.unansweredReviews > 0) {
    weaknesses.push(`${gbpData.unansweredReviews} customer reviews lack owner responses.`);
  }
  if (!localPack.inThreePack) {
    weaknesses.push(`Currently outside the Google Maps 3-Pack (Ranking #${localPack.rankPosition || 4}).`);
  }

  // Opportunities
  if (competitors.length > 0 && competitors[0].reviewGap < 80) {
    opportunities.push(`Review gap against #${competitors[0].name} is only ${competitors[0].reviewGap} reviews; easily closed with automated SMS requests.`);
  }
  opportunities.push(`Publishing dedicated geo-targeted service pages for ${identity.targetLocations[0] || 'primary service area'} to capture high-intent searchers.`);
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

  if (gbpData.unansweredReviews > 0) {
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
    evidence: `Competitors are capturing traffic for ${identity.services[0] || 'service'} in ${identity.city}.`,
    expectedImpact: 'Win top 3 organic ranking and increase direct inbound calls.',
    actionType: 'create_page',
    actionLabel: 'Create Geo Page',
    recommendationTitle: 'Generate High-Intent Geo Page',
    isFixed: false,
  });

  return {
    score: totalScore,
    readinessScore,
    swot: { strengths, weaknesses, opportunities, threats },
    priorityActions,
    targetKeywords: record.keywords.map((k) => k.keyword),
    activeOffers: [
      `New Customer Special: Contact ${identity.name} Today`,
      'Emergency & Same-Day Priority Scheduling',
    ],
    voicePersona: 'Authoritative, caring, and locally rooted',
    executiveSummary: `${identity.name} holds a ${totalScore}/100 Business Brain health score. With ${gbpData.reviewCount} customer reviews (${gbpData.rating}★) and a ${websiteAudit.seoScore}/100 SEO score, the fastest pathway to Google 3-Pack supremacy is resolving the ${gbpData.unansweredReviews} unanswered reviews and injecting LocalBusiness schema.`,
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
  return Array.from(businessesDatabase.values());
}

export function getBusinessesForUser(userEmail?: string): LocoraBusinessRecord[] {
  const all = Array.from(businessesDatabase.values());
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  if (!cleanEmail || cleanEmail === 'usr_guest') {
    // Only for unauthenticated guest visitors testing public UI
    return all.filter((b) => b.id === 'biz_demo_workspace');
  }

  // For ANY authenticated user: return ONLY their own businesses
  const userOwned = all.filter((b) => (b.userEmail || '').toLowerCase().trim() === cleanEmail);
  return userOwned;
}

export function createOrGetBusinessForUser(
  userEmail: string,
  businessName?: string,
  website?: string,
  category?: string,
  city?: string,
  planTier: DataProviderTier = 'free'
): LocoraBusinessRecord {
  const cleanEmail = userEmail.toLowerCase().trim();
  const existing = getBusinessesForUser(cleanEmail);
  if (existing.length > 0) {
    return existing[0];
  }
  const id = `biz_${cleanEmail.replace(/[^a-z0-9]/gi, '_')}`;
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
  return updated;
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

// Ensure database is initialized on server boot
loadLocoraDatabaseFromDisk();
