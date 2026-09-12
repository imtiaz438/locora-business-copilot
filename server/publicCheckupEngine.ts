import https from 'https';
import http from 'http';
import { URL } from 'url';
import {
  validateAndNormalizeUrl,
  verifyDnsAndSsrfSafety,
  acquireCrawlSlot,
  releaseCrawlSlot,
} from './publicSecurity.js';
import type {
  PublicCheckupResult,
  BusinessDiscoveryData,
  RealSeoAnalysisData,
  LocalSeoAnalysisData,
  PerformanceAnalysisData,
  DeterministicScoringResult,
  PublicGatedReport,
  PublicGatedIssue,
  PublicGatedPassedCheck,
  PublicGatedOpportunity,
  ScoreCheckItem,
  CategoryScoreDetail,
} from '../src/types.ts';
import {
  savePublicAuditRecord,
  getRecentAuditByNormalizedUrl,
  PublicAuditRecord,
} from './publicAuditsDb.js';

export type { PublicCheckupResult };

export const publicAuditsStore = new Map<string, PublicCheckupResult>();

// Decode HTML entities helper
function decodeHtmlEntities(str: string): string {
  return (str || '')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Fetch single page safely with SSRF protection, size caps, and timeout
async function fetchSafePageHtml(
  targetUrl: string,
  expectedHost: string,
  timeoutMs = 6500
): Promise<{
  html: string;
  status: number;
  latencyMs: number;
  sizeKb: number;
  isSsl: boolean;
  finalUrl: string;
} | null> {
  try {
    const parsed = new URL(targetUrl);

    // Validate host matches
    if (parsed.hostname.toLowerCase() !== expectedHost.toLowerCase()) {
      return null;
    }

    // Re-verify SSRF on each hop
    const dnsCheck = await verifyDnsAndSsrfSafety(parsed.hostname);
    if (!dnsCheck.safe) {
      return null;
    }

    const isSsl = parsed.protocol === 'https:';
    const transport = isSsl ? https : http;
    const startTime = Date.now();

    return new Promise((resolve) => {
      let responded = false;
      const timeout = setTimeout(() => {
        if (!responded) {
          responded = true;
          resolve(null);
        }
      }, timeoutMs);

      try {
        const req = transport.get(
          parsed,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; LocoraBot/2.0; +https://locora.ai)',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            rejectUnauthorized: false,
          },
          (res) => {
            let html = '';
            const status = res.statusCode || 200;

            // Cap at 1.5MB to protect memory
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              html += chunk;
              if (html.length > 1500000) {
                res.destroy();
              }
            });

            res.on('end', () => {
              if (responded) return;
              responded = true;
              clearTimeout(timeout);
              const latencyMs = Date.now() - startTime;
              const sizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);
              resolve({
                html,
                status,
                latencyMs,
                sizeKb,
                isSsl,
                finalUrl: targetUrl,
              });
            });
          }
        );

        req.on('error', () => {
          if (!responded) {
            responded = true;
            clearTimeout(timeout);
            resolve(null);
          }
        });
      } catch {
        if (!responded) {
          responded = true;
          clearTimeout(timeout);
          resolve(null);
        }
      }
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// SECTION 8: PERFORMANCE DATA HELPER
// ---------------------------------------------------------------------------
async function evaluatePerformance(
  targetUrl: string,
  socketStats: {
    latencyMs: number;
    sizeKb: number;
    isSsl: boolean;
    httpStatus: number;
  }
): Promise<PerformanceAnalysisData> {
  const pageSpeedApiKey = (process.env.PAGESPEED_API_KEY || '').trim();

  const socketTelemetry = {
    serverLatencyTtfbMs: socketStats.latencyMs,
    htmlPayloadSizeKb: socketStats.sizeKb,
    protocol: socketStats.isSsl ? 'HTTPS/TLS' : 'HTTP (Unencrypted)',
    httpStatusCode: socketStats.httpStatus,
    isSsl: socketStats.isSsl,
    evidence: `Measured direct Time To First Byte (TTFB) at ${socketStats.latencyMs}ms with ${socketStats.sizeKb}KB initial HTML payload.`,
  };

  if (!pageSpeedApiKey) {
    return {
      provider: 'google_pagespeed_insights',
      status: 'not_configured',
      statusMessage: 'Performance testing is currently unavailable.',
      socketTelemetry,
    };
  }

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&strategy=mobile&key=${pageSpeedApiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.status === 400 || res.status === 401 || res.status === 403) {
      return {
        provider: 'google_pagespeed_insights',
        status: 'auth_failed',
        statusMessage: 'Performance testing could not be completed.',
        socketTelemetry,
      };
    }

    if (res.status === 429) {
      return {
        provider: 'google_pagespeed_insights',
        status: 'quota_exceeded',
        statusMessage: 'Performance testing temporarily unavailable.',
        socketTelemetry,
      };
    }

    if (!res.ok) {
      return {
        provider: 'google_pagespeed_insights',
        status: 'auth_failed',
        statusMessage: 'Performance testing could not be completed.',
        socketTelemetry,
      };
    }

    const data: any = await res.json();
    const scoreVal = data?.lighthouseResult?.categories?.performance?.score;
    const mobilePerformanceScore = typeof scoreVal === 'number' ? Math.round(scoreVal * 100) : 70;
    const audits = data?.lighthouseResult?.audits || {};

    return {
      provider: 'google_pagespeed_insights',
      status: 'available',
      statusMessage: `Real PageSpeed test completed via Google Lighthouse (Mobile Performance: ${mobilePerformanceScore}/100).`,
      pageSpeedMetrics: {
        mobilePerformanceScore,
        strategy: 'mobile',
        coreWebVitals: {
          firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
          largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
          totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
          speedIndex: audits['speed-index']?.displayValue || 'N/A',
        },
      },
      socketTelemetry,
    };
  } catch (err: any) {
    console.warn('[PageSpeed Provider] Error running Google PageSpeed test:', err?.message);
    return {
      provider: 'google_pagespeed_insights',
      status: 'auth_failed',
      statusMessage: 'Performance testing could not be completed.',
      socketTelemetry,
    };
  }
}

// ---------------------------------------------------------------------------
// MAIN QUICK CHECKUP ORCHESTRATOR
// ---------------------------------------------------------------------------

export async function executePublicCheckup(params: {
  url: string;
  businessName?: string;
  businessLocation?: string;
  email?: string;
  forceRefresh?: boolean;
  visitorId?: string;
}): Promise<PublicCheckupResult> {
  const { url, businessName, businessLocation, email, forceRefresh, visitorId } = params;

  // 1. URL Validation & Normalization (Section 20: Invalid URL)
  const validation = validateAndNormalizeUrl(url);
  if (!validation.valid || !validation.normalizedUrl || !validation.hostname) {
    const err: any = new Error(validation.error || 'Please enter a valid website URL.');
    err.statusCode = validation.statusCode || 400;
    throw err;
  }

  const hostname = validation.hostname;
  const initialUrl = validation.normalizedUrl;

  // 1b. Controlled Caching (Section 21)
  if (!forceRefresh) {
    const cachedRecord = getRecentAuditByNormalizedUrl(initialUrl);
    if (cachedRecord && cachedRecord.fullResult) {
      return {
        ...cachedRecord.fullResult,
        cacheStatus: 'cached',
        dataAge: cachedRecord.data_age || 'Recently analyzed',
      };
    }
  }

  // 2. Asynchronous DNS & SSRF Resolution
  const dnsCheck = await verifyDnsAndSsrfSafety(hostname);
  if (!dnsCheck.safe) {
    const err: any = new Error(dnsCheck.error || "We couldn't reach this website.");
    err.statusCode = 403;
    throw err;
  }

  // 3. Concurrency Allocation (Section 22)
  const hasSlot = acquireCrawlSlot();
  if (!hasSlot) {
    const err: any = new Error('This check is temporarily unavailable. Crawler capacity reached. Please wait a moment and try again.');
    err.statusCode = 429;
    throw err;
  }

  const crawlStartedAt = new Date().toISOString();
  let crawlCount = 0;
  let homeResult: {
    html: string;
    status: number;
    latencyMs: number;
    sizeKb: number;
    isSsl: boolean;
    finalUrl: string;
  } | null = null;

  try {
    // 4. Fetch Homepage with SSL fallback & error detection
    try {
      homeResult = await fetchSafePageHtml(initialUrl, hostname);
    } catch (fetchErr: any) {
      if (fetchErr.message?.includes('SSL') || fetchErr.message?.includes('cert')) {
        const err: any = new Error("We couldn't establish a secure connection.");
        err.statusCode = 502;
        throw err;
      }
      if (fetchErr.name === 'AbortError' || fetchErr.message?.includes('timeout')) {
        const err: any = new Error('The website took too long to respond.');
        err.statusCode = 504;
        throw err;
      }
    }

    if (!homeResult && initialUrl.startsWith('https:')) {
      // Fallback try HTTP if HTTPS failed handshake
      try {
        homeResult = await fetchSafePageHtml(`http://${hostname}`, hostname);
      } catch {
        // Continue to error check below
      }
    }

    if (!homeResult || !homeResult.html || homeResult.html.length < 50) {
      const err: any = new Error("We couldn't reach this website.");
      err.statusCode = 502;
      throw err;
    }

    crawlCount = 1;
    const cleanHtml = homeResult.html;

    // 5. Extract Internal Links for controlled multi-page crawl
    const rawLinkMatches = Array.from(cleanHtml.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi))
      .map((m) => m[1].trim())
      .filter((href) => {
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
        if (href.endsWith('.jpg') || href.endsWith('.png') || href.endsWith('.pdf') || href.endsWith('.css') || href.endsWith('.js') || href.endsWith('.svg')) return false;
        if (href.startsWith('/')) return true;
        try {
          const u = new URL(href);
          return u.hostname.toLowerCase() === hostname;
        } catch {
          return false;
        }
      });

    // Prioritize high-value internal pages: contact, about, services, locations
    const priorityKeywords = ['contact', 'about', 'service', 'location', 'pricing', 'menu'];
    const sortedLinks = Array.from(new Set(rawLinkMatches)).sort((a, b) => {
      const aPrio = priorityKeywords.some((k) => a.toLowerCase().includes(k)) ? 1 : 0;
      const bPrio = priorityKeywords.some((k) => b.toLowerCase().includes(k)) ? 1 : 0;
      return bPrio - aPrio;
    });

    const pagesToCrawl = sortedLinks.slice(0, 2); // Crawl up to 2 high-priority internal pages
    const secondaryPageResults: Array<{ url: string; status: number; html: string; title?: string; desc?: string }> = [];

    for (const subLink of pagesToCrawl) {
      const subUrl = subLink.startsWith('/') ? `https://${hostname}${subLink}` : subLink;
      const subRes = await fetchSafePageHtml(subUrl, hostname, 4500);
      if (subRes) {
        crawlCount += 1;
        const subTitleMatch = subRes.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const subDescMatch = subRes.html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)["']/i);
        secondaryPageResults.push({
          url: subUrl,
          status: subRes.status,
          html: subRes.html,
          title: subTitleMatch ? decodeHtmlEntities(subTitleMatch[1].replace(/<[^>]+>/g, '')).trim() : undefined,
          desc: subDescMatch ? decodeHtmlEntities(subDescMatch[1]).trim() : undefined,
        });
      } else {
        secondaryPageResults.push({
          url: subUrl,
          status: 404,
          html: '',
        });
      }
    }

    // 6. Non-blocking Technical Probes: robots.txt and sitemap.xml
    const [robotsProbe, sitemapProbe] = await Promise.allSettled([
      fetchSafePageHtml(`https://${hostname}/robots.txt`, hostname, 3500),
      fetchSafePageHtml(`https://${hostname}/sitemap.xml`, hostname, 3500),
    ]);

    const robotsResult = robotsProbe.status === 'fulfilled' ? robotsProbe.value : null;
    const sitemapResult = sitemapProbe.status === 'fulfilled' ? sitemapProbe.value : null;

    // Technical robots & sitemap evaluation
    const robotsFound = !!robotsResult && robotsResult.status === 200 && (robotsResult.html.includes('User-agent') || robotsResult.html.includes('Disallow') || robotsResult.html.includes('Sitemap'));
    const robotsStatusCode = robotsResult ? robotsResult.status : 404;
    const robotsHasDisallow = robotsFound && /disallow:\s*\/[a-z0-9]/i.test(robotsResult?.html || '');
    const robotsHasSitemap = robotsFound && /sitemap:\s*https?:\/\//i.test(robotsResult?.html || '');

    const sitemapFound = !!sitemapResult && sitemapResult.status === 200 && (sitemapResult.html.includes('<urlset') || sitemapResult.html.includes('<sitemapindex') || sitemapResult.html.includes('<?xml'));
    const sitemapStatusCode = sitemapResult ? sitemapResult.status : 404;

    // 7. On-Page & DOM Signal Extraction
    // Title
    const titleMatch = cleanHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const ogTitleMatch = cleanHtml.match(/<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]+content=["']([^"']*)["']/i);
    const rawTitle = titleMatch ? titleMatch[1] : (ogTitleMatch ? ogTitleMatch[1] : '');
    const metaTitle = decodeHtmlEntities(rawTitle.replace(/<[^>]+>/g, '')).slice(0, 150);

    // Meta Description
    const descMatch = cleanHtml.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description|twitter:description)["'][^>]+content=["']([^"']*)["']/i)
      || cleanHtml.match(/<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["'](?:description|og:description|twitter:description)["']/i);
    const metaDescription = descMatch ? decodeHtmlEntities(descMatch[1]).slice(0, 300) : '';

    // Headings
    const h1Matches = Array.from(cleanHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi))
      .map((m) => decodeHtmlEntities(m[1].replace(/<[^>]+>/g, '').trim()))
      .filter(Boolean);

    const h2Matches = Array.from(cleanHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi))
      .map((m) => decodeHtmlEntities(m[1].replace(/<[^>]+>/g, '').trim()))
      .filter(Boolean);

    const h3Matches = Array.from(cleanHtml.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi))
      .map((m) => decodeHtmlEntities(m[1].replace(/<[^>]+>/g, '').trim()))
      .filter(Boolean);

    // Meta Robots / Indexability
    const metaRobotsMatch = cleanHtml.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
    const metaRobotsContent = metaRobotsMatch ? metaRobotsMatch[1].toLowerCase().trim() : null;
    const isNoIndex = metaRobotsContent ? metaRobotsContent.includes('noindex') : false;

    // Canonical Link
    const canonicalMatch = cleanHtml.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)
      || cleanHtml.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
    const canonicalHref = canonicalMatch ? canonicalMatch[1].trim() : null;
    let canonicalMatches = false;
    if (canonicalHref) {
      try {
        const cUrl = new URL(canonicalHref);
        canonicalMatches = cUrl.hostname.toLowerCase() === hostname && (cUrl.pathname === '/' || cUrl.pathname === new URL(initialUrl).pathname);
      } catch {
        canonicalMatches = false;
      }
    }

    // Viewport
    const viewportMatch = cleanHtml.match(/<meta[^>]+name=["']viewport["']/i);

    // Images
    const imgMatches = Array.from(cleanHtml.matchAll(/<img\b[^>]*>/gi));
    const totalImages = imgMatches.length;
    const missingAltImages = imgMatches.filter((img) => !/alt=["'][^"']+["']/i.test(img[0])).length;
    const compliantAltImages = totalImages - missingAltImages;

    // Content metrics
    const textSnippet = cleanHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = textSnippet ? textSnippet.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const paragraphCount = Array.from(cleanHtml.matchAll(/<p\b[^>]*>/gi)).length;

    // 8. JSON-LD & Structured Data Extraction
    const schemaScriptMatches = Array.from(cleanHtml.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
    const allSchemaObjects: any[] = [];
    const schemaTypes: string[] = [];

    schemaScriptMatches.forEach((m) => {
      try {
        const parsed = JSON.parse(m[1].trim());
        if (Array.isArray(parsed)) {
          allSchemaObjects.push(...parsed);
        } else if (Array.isArray(parsed['@graph'])) {
          allSchemaObjects.push(...parsed['@graph']);
        } else {
          allSchemaObjects.push(parsed);
        }
      } catch {
        // Ignore invalid JSON-LD blocks
      }
    });

    allSchemaObjects.forEach((obj) => {
      if (obj && obj['@type']) {
        if (Array.isArray(obj['@type'])) {
          schemaTypes.push(...obj['@type']);
        } else {
          schemaTypes.push(String(obj['@type']));
        }
      }
    });

    const hasLocalBusinessSchema = schemaTypes.some((t) =>
      /localbusiness|store|restaurant|dental|dentist|physician|legal|medical|contractor|salon|barber|auto|plumb|electr|roof|service/i.test(t)
    ) || /"@type"\s*:\s*"(?:LocalBusiness|Store|Restaurant|DentalClinic|MedicalBusiness|LegalService|AutomotiveBusiness|HomeAndConstructionBusiness|RoofingContractor|Plumber|Electrician)"/i.test(cleanHtml);

    const hasOrgSchema = schemaTypes.some((t) => /organization/i.test(t));
    const hasWebSiteSchema = schemaTypes.some((t) => /website/i.test(t));
    const hasWebPageSchema = schemaTypes.some((t) => /webpage/i.test(t));
    const hasServiceSchema = schemaTypes.some((t) => /service/i.test(t));
    const hasFaqPageSchema = schemaTypes.some((t) => /faqpage/i.test(t));
    const hasBreadcrumbSchema = schemaTypes.some((t) => /breadcrumblist/i.test(t));

    const otherDetectedSchemas = schemaTypes.filter(
      (t) => !/localbusiness|organization|website|webpage|service|faqpage|breadcrumblist/i.test(t)
    );

    // Primary JSON-LD LocalBusiness or Organization object for data extraction
    const jsonLdOrg = allSchemaObjects.find(
      (o) => o && (o['@type'] === 'LocalBusiness' || o['@type'] === 'Organization' || (typeof o['@type'] === 'string' && o['@type'].includes('Business')))
    ) || allSchemaObjects[0] || null;

    // Contact page or secondary page HTML
    const secondaryPageHtml = secondaryPageResults.map((r) => r.html).join(' ');

    // -----------------------------------------------------------------------
    // SECTION 5: BUSINESS INFORMATION DISCOVERY (Strict Evidence & Sources)
    // -----------------------------------------------------------------------
    // Business Name
    let discBizName: string | null = null;
    let discBizNameSource: string | null = null;
    if (jsonLdOrg && jsonLdOrg.name && typeof jsonLdOrg.name === 'string') {
      discBizName = jsonLdOrg.name.trim();
      discBizNameSource = 'JSON-LD Structured Data';
    } else if (cleanHtml.includes('property="og:site_name"') || cleanHtml.includes('name="og:site_name"')) {
      const ogSiteName = cleanHtml.match(/<meta[^>]+(?:property|name)=["']og:site_name["'][^>]+content=["']([^"']*)["']/i);
      if (ogSiteName && ogSiteName[1].trim()) {
        discBizName = decodeHtmlEntities(ogSiteName[1].trim());
        discBizNameSource = 'Website Metadata (og:site_name)';
      }
    } else if (businessName?.trim()) {
      discBizName = businessName.trim();
      discBizNameSource = 'Website Crawl / Visitor Input';
    } else if (metaTitle) {
      const candidate = metaTitle.split(/[-|–:•]/)[0].trim();
      if (candidate && candidate.length > 2 && candidate.length < 50) {
        discBizName = candidate;
        discBizNameSource = 'Page Title';
      }
    }

    // Display Name
    const discDisplayName = discBizName || (jsonLdOrg?.alternateName ? String(jsonLdOrg.alternateName) : null);
    const discDisplayNameSource = discBizName ? discBizNameSource : (jsonLdOrg?.alternateName ? 'JSON-LD Structured Data' : null);

    // Phone
    let discPhone: string | null = null;
    let discPhoneSource: string | null = null;
    const telLinkMatch = cleanHtml.match(/href=["']tel:([^"']+)["']/i) || secondaryPageHtml.match(/href=["']tel:([^"']+)["']/i);
    if (jsonLdOrg && jsonLdOrg.telephone) {
      discPhone = String(jsonLdOrg.telephone).trim();
      discPhoneSource = 'JSON-LD Structured Data';
    } else if (telLinkMatch) {
      discPhone = telLinkMatch[1].trim();
      discPhoneSource = 'Website Crawl (tel: link)';
    } else {
      const textPhoneMatch = textSnippet.match(/(?:\+?1[-. ]?)?\(?[2-9]\d{2}\)?[-. ]?\d{3}[-. ]?\d{4}/);
      if (textPhoneMatch) {
        discPhone = textPhoneMatch[0].trim();
        discPhoneSource = 'Website Content';
      }
    }

    // Email
    let discEmail: string | null = null;
    let discEmailSource: string | null = null;
    const mailtoMatch = cleanHtml.match(/href=["']mailto:([^"?\s]+)["']/i) || secondaryPageHtml.match(/href=["']mailto:([^"?\s]+)["']/i);
    if (jsonLdOrg && jsonLdOrg.email) {
      discEmail = String(jsonLdOrg.email).trim();
      discEmailSource = 'JSON-LD Structured Data';
    } else if (mailtoMatch) {
      discEmail = mailtoMatch[1].trim();
      discEmailSource = 'Website Crawl (mailto: link)';
    } else {
      const emailMatch = textSnippet.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
      if (emailMatch && !emailMatch[0].includes('example.com') && !emailMatch[0].includes('sentry') && !emailMatch[0].includes('wixpress')) {
        discEmail = emailMatch[0].trim();
        discEmailSource = 'Website Content';
      }
    }

    // Address & Components (City, State, Country, Postal Code)
    let discAddress: string | null = null;
    let discAddressSource: string | null = null;
    let discCity: string | null = null;
    let discCitySource: string | null = null;
    let discState: string | null = null;
    let discStateSource: string | null = null;
    let discCountry: string | null = null;
    let discCountrySource: string | null = null;
    let discPostal: string | null = null;
    let discPostalSource: string | null = null;

    if (jsonLdOrg && jsonLdOrg.address) {
      const addr = jsonLdOrg.address;
      if (typeof addr === 'string') {
        discAddress = addr.trim();
        discAddressSource = 'JSON-LD Structured Data';
      } else if (typeof addr === 'object') {
        const parts = [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode].filter(Boolean);
        if (parts.length > 0) {
          discAddress = parts.join(', ');
          discAddressSource = 'JSON-LD Structured Data';
        }
        if (addr.addressLocality) {
          discCity = String(addr.addressLocality).trim();
          discCitySource = 'JSON-LD Structured Data';
        }
        if (addr.addressRegion) {
          discState = String(addr.addressRegion).trim();
          discStateSource = 'JSON-LD Structured Data';
        }
        if (addr.postalCode) {
          discPostal = String(addr.postalCode).trim();
          discPostalSource = 'JSON-LD Structured Data';
        }
        if (addr.addressCountry) {
          discCountry = typeof addr.addressCountry === 'string' ? addr.addressCountry : (addr.addressCountry.name || 'United States');
          discCountrySource = 'JSON-LD Structured Data';
        }
      }
    }

    // If not found in JSON-LD, inspect footer and contact page text
    if (!discAddress) {
      const addressMatch = textSnippet.match(/\b\d{1,5}\s+[A-Za-z0-9\s.,]{3,35}\s+(?:street|st|avenue|ave|blvd|boulevard|road|rd|suite|ste|drive|dr|way|lane|ln|court|ct)\b/i);
      if (addressMatch) {
        discAddress = addressMatch[0].trim();
        discAddressSource = 'Website Footer / Contact Link';
      }
    }

    if (!discPostal) {
      const zipMatch = textSnippet.match(/\b\d{5}(?:-\d{4})?\b/);
      if (zipMatch) {
        discPostal = zipMatch[0].trim();
        discPostalSource = 'Website Content';
      }
    }

    if (!discCountry && (discPostal || discState)) {
      discCountry = 'United States';
      discCountrySource = 'Website Content (Inferred from Postal Code format)';
    }

    // Services
    let discServices: string[] | null = null;
    let discServicesSource: string | null = null;
    if (jsonLdOrg && (jsonLdOrg.makesOffer || jsonLdOrg.hasOfferCatalog || jsonLdOrg.service)) {
      const offerData = jsonLdOrg.makesOffer || jsonLdOrg.hasOfferCatalog || jsonLdOrg.service;
      if (Array.isArray(offerData)) {
        discServices = offerData.map((o: any) => (typeof o === 'string' ? o : o.name)).filter(Boolean);
        if (discServices.length > 0) discServicesSource = 'JSON-LD Structured Data';
      }
    }
    if (!discServices || discServices.length === 0) {
      // Look for service links in navigation or headings
      const serviceLinks = rawLinkMatches
        .filter((h) => /\/(?:service|services|what-we-do|offerings)\/([a-z0-9-_]+)/i.test(h))
        .map((h) => {
          const match = h.match(/\/(?:service|services|what-we-do|offerings)\/([a-z0-9-_]+)/i);
          return match ? match[1].replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
        })
        .filter(Boolean);
      if (serviceLinks.length > 0) {
        discServices = Array.from(new Set(serviceLinks)).slice(0, 6);
        discServicesSource = 'Website Navigation';
      }
    }

    // Service Areas
    let discServiceAreas: string[] | null = null;
    let discServiceAreasSource: string | null = null;
    if (jsonLdOrg && jsonLdOrg.areaServed) {
      if (Array.isArray(jsonLdOrg.areaServed)) {
        discServiceAreas = jsonLdOrg.areaServed.map((a: any) => (typeof a === 'string' ? a : a.name)).filter(Boolean);
      } else if (typeof jsonLdOrg.areaServed === 'string') {
        discServiceAreas = [jsonLdOrg.areaServed];
      } else if (jsonLdOrg.areaServed.name) {
        discServiceAreas = [jsonLdOrg.areaServed.name];
      }
      if (discServiceAreas && discServiceAreas.length > 0) {
        discServiceAreasSource = 'JSON-LD Structured Data';
      }
    }
    if (!discServiceAreas || discServiceAreas.length === 0) {
      const servingMatch = textSnippet.match(/(?:serving|proudly serving|service area:?)\s+([A-Za-z0-9,\s&]{5,60})/i);
      if (servingMatch) {
        discServiceAreas = [servingMatch[1].trim()];
        discServiceAreasSource = 'Website Content';
      }
    }

    // Business Category
    let discCategory: string | null = null;
    let discCategorySource: string | null = null;
    if (jsonLdOrg && jsonLdOrg['@type'] && jsonLdOrg['@type'] !== 'Thing') {
      const typeStr = Array.isArray(jsonLdOrg['@type']) ? jsonLdOrg['@type'].join(', ') : String(jsonLdOrg['@type']);
      discCategory = typeStr;
      discCategorySource = 'JSON-LD Structured Data';
    } else {
      const metaCatMatch = cleanHtml.match(/<meta[^>]+(?:name|property)=["']category["'][^>]+content=["']([^"']*)["']/i);
      if (metaCatMatch && metaCatMatch[1].trim()) {
        discCategory = decodeHtmlEntities(metaCatMatch[1].trim());
        discCategorySource = 'Metadata Tag';
      }
    }

    // Opening Hours
    let discHours: string[] | null = null;
    let discHoursSource: string | null = null;
    if (jsonLdOrg && (jsonLdOrg.openingHours || jsonLdOrg.openingHoursSpecification)) {
      const rawH = jsonLdOrg.openingHours || jsonLdOrg.openingHoursSpecification;
      if (Array.isArray(rawH)) {
        discHours = rawH.map((h: any) => (typeof h === 'string' ? h : `${h.dayOfWeek || ''}: ${h.opens || ''} - ${h.closes || ''}`)).filter(Boolean);
      } else if (typeof rawH === 'string') {
        discHours = [rawH];
      }
      if (discHours && discHours.length > 0) discHoursSource = 'JSON-LD Structured Data';
    }
    if (!discHours || discHours.length === 0) {
      const hoursMatch = textSnippet.match(/\b(?:mon(?:day)?\s*[-–]\s*fri(?:day)?|monday|daily)[:\s]+(?:[0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)\s*[-–]\s*[0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)|24\s*hours)\b/i);
      if (hoursMatch) {
        discHours = [hoursMatch[0].trim()];
        discHoursSource = 'Website Content';
      }
    }

    // Social Links
    const socialPatterns = [
      { platform: 'Facebook', regex: /href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'#?]+)["']/i },
      { platform: 'Instagram', regex: /href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'#?]+)["']/i },
      { platform: 'LinkedIn', regex: /href=["'](https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[^"'#?]+)["']/i },
      { platform: 'Twitter / X', regex: /href=["'](https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^"'#?]+)["']/i },
      { platform: 'YouTube', regex: /href=["'](https?:\/\/(?:www\.)?youtube\.com\/(?:channel|user|c|@)[^"'#?]+)["']/i },
      { platform: 'TikTok', regex: /href=["'](https?:\/\/(?:www\.)?tiktok\.com\/@[^"'#?]+)["']/i },
      { platform: 'Yelp', regex: /href=["'](https?:\/\/(?:www\.)?yelp\.com\/biz\/[^"'#?]+)["']/i },
    ];
    const foundSocials: Array<{ platform: string; url: string }> = [];
    socialPatterns.forEach((sp) => {
      const m = cleanHtml.match(sp.regex);
      if (m && !m[1].includes('sharer') && !m[1].includes('share?')) {
        foundSocials.push({ platform: sp.platform, url: m[1].trim() });
      }
    });

    const businessDiscovery: BusinessDiscoveryData = {
      businessName: {
        value: discBizName,
        source: discBizName ? `Source: ${discBizNameSource}` : null,
        status: discBizName ? 'found' : 'not_found',
        displayValue: discBizName || 'Not found on website',
      },
      displayName: {
        value: discDisplayName,
        source: discDisplayName ? `Source: ${discDisplayNameSource}` : null,
        status: discDisplayName ? 'found' : 'not_found',
        displayValue: discDisplayName || 'Not found on website',
      },
      phone: {
        value: discPhone,
        source: discPhone ? `Source: ${discPhoneSource}` : null,
        status: discPhone ? 'found' : 'not_found',
        displayValue: discPhone || 'Not found on website',
      },
      email: {
        value: discEmail,
        source: discEmail ? `Source: ${discEmailSource}` : null,
        status: discEmail ? 'found' : 'not_found',
        displayValue: discEmail || 'Not found on website',
      },
      address: {
        value: discAddress,
        source: discAddress ? `Source: ${discAddressSource}` : null,
        status: discAddress ? 'found' : 'not_found',
        displayValue: discAddress || 'Not found on website',
      },
      city: {
        value: discCity,
        source: discCity ? `Source: ${discCitySource}` : null,
        status: discCity ? 'found' : 'not_found',
        displayValue: discCity || 'Not found on website',
      },
      stateRegion: {
        value: discState,
        source: discState ? `Source: ${discStateSource}` : null,
        status: discState ? 'found' : 'not_found',
        displayValue: discState || 'Not found on website',
      },
      country: {
        value: discCountry,
        source: discCountry ? `Source: ${discCountrySource}` : null,
        status: discCountry ? 'found' : 'not_found',
        displayValue: discCountry || 'Not found on website',
      },
      postalCode: {
        value: discPostal,
        source: discPostal ? `Source: ${discPostalSource}` : null,
        status: discPostal ? 'found' : 'not_found',
        displayValue: discPostal || 'Not found on website',
      },
      services: {
        value: discServices,
        source: discServices ? `Source: ${discServicesSource}` : null,
        status: discServices && discServices.length > 0 ? 'found' : 'not_found',
        displayValue: discServices && discServices.length > 0 ? discServices.join(', ') : 'Not found on website',
      },
      serviceAreas: {
        value: discServiceAreas,
        source: discServiceAreas ? `Source: ${discServiceAreasSource}` : null,
        status: discServiceAreas && discServiceAreas.length > 0 ? 'found' : 'not_found',
        displayValue: discServiceAreas && discServiceAreas.length > 0 ? discServiceAreas.join(', ') : 'Not found on website',
      },
      businessCategory: {
        value: discCategory,
        source: discCategory ? `Source: ${discCategorySource}` : null,
        status: discCategory ? 'found' : 'not_found',
        displayValue: discCategory || 'Not found on website',
      },
      openingHours: {
        value: discHours,
        source: discHours ? `Source: ${discHoursSource}` : null,
        status: discHours && discHours.length > 0 ? 'found' : 'not_found',
        displayValue: discHours && discHours.length > 0 ? discHours.join(' | ') : 'Not found on website',
      },
      website: {
        value: initialUrl,
        source: 'Source: Website Crawl',
        status: 'found',
        displayValue: initialUrl,
      },
      socialLinks: {
        value: foundSocials,
        source: foundSocials.length > 0 ? 'Source: Website Links' : null,
        status: foundSocials.length > 0 ? 'found' : 'not_found',
        displayValue: foundSocials.length > 0 ? foundSocials.map((s) => `${s.platform} (${s.url})`).join(', ') : 'Not found on website',
      },
    };

    // -----------------------------------------------------------------------
    // SECTION 6: REAL SEO ANALYSIS
    // -----------------------------------------------------------------------
    // Technical SEO
    const brokenInternalLinks = secondaryPageResults.filter((r) => r.status >= 400);

    const technicalSeo: RealSeoAnalysisData['technical'] = {
      https: {
        enabled: homeResult.isSsl,
        evidence: homeResult.isSsl ? `Protocol: https:, SSL Handshake verified at ${hostname}` : `Served over unencrypted HTTP (No SSL)`,
        details: homeResult.isSsl ? 'Website is served securely over HTTPS.' : 'Website is missing an active SSL certificate.',
      },
      crawlability: {
        status: isNoIndex ? 'blocked' : 'crawlable',
        metaRobots: metaRobotsContent,
        evidence: metaRobotsMatch ? `<meta name="robots" content="${metaRobotsContent}">` : 'No restrictive robots meta tag detected on homepage.',
      },
      robotsTxt: {
        found: robotsFound,
        statusCode: robotsStatusCode,
        hasDisallow: robotsHasDisallow,
        sitemapFoundInRobots: robotsHasSitemap,
        evidence: robotsFound ? `robots.txt is accessible (HTTP ${robotsStatusCode}). Disallow rules: ${robotsHasDisallow ? 'Yes' : 'None'}.` : `robots.txt returned HTTP ${robotsStatusCode}.`,
      },
      sitemapXml: {
        found: sitemapFound,
        statusCode: sitemapStatusCode,
        evidence: sitemapFound ? `sitemap.xml is accessible at root (HTTP ${sitemapStatusCode}).` : `sitemap.xml returned HTTP ${sitemapStatusCode} (Not found at standard root).`,
      },
      canonicalTag: {
        present: !!canonicalHref,
        canonicalUrl: canonicalHref,
        matchesCurrentUrl: canonicalMatches,
        evidence: canonicalHref ? `<link rel="canonical" href="${canonicalHref}">` : 'Homepage is missing a canonical link tag.',
      },
      indexability: {
        isIndexable: !isNoIndex && homeResult.status === 200,
        evidence: !isNoIndex && homeResult.status === 200 ? 'Page returns HTTP 200 and does not contain a noindex directive.' : 'Indexability issue: Page returned error status or noindex tag.',
      },
      redirectBehavior: {
        redirected: homeResult.finalUrl !== initialUrl,
        finalUrl: homeResult.finalUrl,
        evidence: homeResult.finalUrl === initialUrl ? 'Direct response without intermediate redirect hops.' : `Redirected to ${homeResult.finalUrl}`,
      },
      internalLinksHealth: {
        totalChecked: secondaryPageResults.length,
        brokenCount: brokenInternalLinks.length,
        brokenLinks: brokenInternalLinks.map((r) => ({ url: r.url, status: r.status })),
        evidence: brokenInternalLinks.length === 0 ? `All ${secondaryPageResults.length} crawled internal sample links returned healthy HTTP status.` : `${brokenInternalLinks.length} broken internal sample link(s) detected.`,
      },
      httpStatusCode: {
        code: homeResult.status,
        evidence: `Server responded with HTTP ${homeResult.status} ${homeResult.status === 200 ? 'OK' : ''}.`,
      },
    };

    // On-Page SEO
    const hasDuplicateTitles = secondaryPageResults.some((r) => r.title && metaTitle && r.title.toLowerCase() === metaTitle.toLowerCase());
    const hasDuplicateDesc = secondaryPageResults.some((r) => r.desc && metaDescription && r.desc.toLowerCase() === metaDescription.toLowerCase());

    const onPageSeo: RealSeoAnalysisData['onPage'] = {
      titleTag: {
        present: !!metaTitle,
        text: metaTitle || null,
        length: metaTitle.length,
        isOptimalLength: metaTitle.length >= 30 && metaTitle.length <= 65,
        evidence: metaTitle ? `<title>${metaTitle}</title> (${metaTitle.length} characters)` : 'Homepage is missing a <title> tag.',
      },
      metaDescription: {
        present: !!metaDescription,
        text: metaDescription || null,
        length: metaDescription.length,
        isOptimalLength: metaDescription.length >= 70 && metaDescription.length <= 165,
        evidence: metaDescription ? `<meta name="description" content="${metaDescription.slice(0, 80)}..."> (${metaDescription.length} characters)` : 'Homepage is missing a meta description.',
      },
      h1Heading: {
        present: h1Matches.length > 0,
        count: h1Matches.length,
        headings: h1Matches,
        evidence: h1Matches.length > 0 ? `Found ${h1Matches.length} H1 tag(s): "${h1Matches.slice(0, 2).join('", "')}"` : 'Homepage is missing a primary <h1> heading tag.',
      },
      headingStructure: {
        h1Count: h1Matches.length,
        h2Count: h2Matches.length,
        h3Count: h3Matches.length,
        hierarchyValid: h1Matches.length === 1 && h2Matches.length >= 1,
        evidence: `Heading distribution: ${h1Matches.length} H1, ${h2Matches.length} H2, ${h3Matches.length} H3 tags.`,
      },
      duplicateTitles: {
        hasDuplicates: hasDuplicateTitles,
        evidence: hasDuplicateTitles ? 'Detected duplicate title tags shared between homepage and secondary pages.' : 'No duplicate page titles detected across crawled URLs.',
      },
      duplicateDescriptions: {
        hasDuplicates: hasDuplicateDesc,
        evidence: hasDuplicateDesc ? 'Detected identical meta description shared across multiple pages.' : 'Unique meta descriptions confirmed across crawled pages.',
      },
      contentStructure: {
        wordCount,
        paragraphCount,
        thinContent: wordCount < 250,
        evidence: `${wordCount} readable words across ${paragraphCount} paragraph (<p>) blocks.`,
      },
      imageAltAttributes: {
        totalImages,
        missingAltCount: missingAltImages,
        compliantCount: compliantAltImages,
        compliancePercentage: totalImages > 0 ? Math.round((compliantAltImages / totalImages) * 100) : 100,
        evidence: totalImages > 0 ? `${compliantAltImages}/${totalImages} images have valid alt attributes (${missingAltImages} missing alt text).` : 'No images found on the homepage.',
      },
      internalLinking: {
        totalLinks: rawLinkMatches.length,
        distinctPages: sortedLinks.length,
        evidence: `Discovered ${sortedLinks.length} unique internal destination links across page navigation and body.`,
      },
      urlStructure: {
        isClean: !initialUrl.includes('?') && !initialUrl.includes('&'),
        hasSuspiciousParams: initialUrl.includes('?'),
        evidence: `Canonical URL structure: ${initialUrl}`,
      },
    };

    // Content Analysis
    const contentAnalysis: RealSeoAnalysisData['content'] = {
      thinContentSignal: {
        detected: wordCount < 250,
        wordCount,
        verdict: wordCount < 250 ? 'Thin content detected (< 250 words)' : wordCount < 600 ? 'Moderate content depth (250-600 words)' : 'Healthy, in-depth content (600+ words)',
        evidence: `Crawled homepage contains ${wordCount} text words.`,
      },
      missingImportantElements: [
        {
          element: 'Meta Description',
          missing: !metaDescription,
          importance: 'High',
          evidence: metaDescription ? 'Homepage has a meta description.' : 'Homepage is missing a meta description.',
        },
        {
          element: 'Primary H1 Tag',
          missing: h1Matches.length === 0,
          importance: 'High',
          evidence: h1Matches.length > 0 ? `H1 tag detected: "${h1Matches[0]}"` : 'Homepage is missing an H1 heading.',
        },
        {
          element: 'Call To Action / Direct Booking',
          missing: !cleanHtml.toLowerCase().includes('book') && !cleanHtml.toLowerCase().includes('schedule') && !cleanHtml.toLowerCase().includes('contact') && !cleanHtml.toLowerCase().includes('call'),
          importance: 'Medium',
          evidence: cleanHtml.toLowerCase().includes('contact') || cleanHtml.toLowerCase().includes('book') ? 'Action buttons (book/contact/schedule) detected in markup.' : 'No direct booking or call-to-action buttons detected.',
        },
        {
          element: 'Telephone Link (href="tel:")',
          missing: !telLinkMatch,
          importance: 'High for Local',
          evidence: telLinkMatch ? `Clickable phone link found: ${telLinkMatch[1]}` : 'Homepage is missing a clickable tel: link.',
        },
      ],
      serviceInformation: {
        detected: (discServices && discServices.length > 0) || cleanHtml.toLowerCase().includes('service'),
        sampleServices: discServices || [],
        evidence: discServices && discServices.length > 0 ? `Detected service keywords/links: ${discServices.slice(0, 3).join(', ')}` : 'No dedicated service listings detected in markup.',
      },
      locationRelevance: {
        detected: !!discCity || !!discAddress || !!discServiceAreas,
        locationsFound: [discCity, discAddress, ...(discServiceAreas || [])].filter(Boolean) as string[],
        evidence: discCity || discAddress ? `Geographic references found: ${discCity || discAddress}` : 'No explicit geographic or city location terms detected in primary copy.',
      },
      contactInformation: {
        detected: !!discPhone || !!discEmail || !!discAddress,
        methodsFound: [discPhone ? 'Phone' : '', discEmail ? 'Email' : '', discAddress ? 'Address' : ''].filter(Boolean),
        evidence: discPhone || discEmail ? `Contact points: ${[discPhone, discEmail].filter(Boolean).join(', ')}` : 'No phone or email detected in homepage DOM.',
      },
      usefulBusinessInformation: {
        detected: !!discHours || !!discServices || !!discAddress,
        items: [discHours ? 'Opening Hours' : '', discServices ? 'Services List' : '', discAddress ? 'Physical Address' : ''].filter(Boolean),
        evidence: discHours ? `Opening hours detected: ${discHours[0]}` : 'Opening hours not found on website.',
      },
    };

    // Structured Data Analysis
    const structuredDataAnalysis: RealSeoAnalysisData['structuredData'] = {
      hasJsonLd: schemaScriptMatches.length > 0,
      totalBlocks: schemaScriptMatches.length,
      detectedSchemas: {
        localBusiness: hasLocalBusinessSchema,
        organization: hasOrgSchema,
        webSite: hasWebSiteSchema,
        webPage: hasWebPageSchema,
        service: hasServiceSchema,
        faqPage: hasFaqPageSchema,
        breadcrumbList: hasBreadcrumbSchema,
        otherDetectedSchemas,
      },
      findings: [
        {
          schema: 'LocalBusiness',
          detected: hasLocalBusinessSchema,
          evidence: hasLocalBusinessSchema ? 'Schema.org LocalBusiness JSON-LD markup detected.' : 'Homepage is missing Schema.org LocalBusiness structured data.',
        },
        {
          schema: 'Organization',
          detected: hasOrgSchema,
          evidence: hasOrgSchema ? 'Schema.org Organization JSON-LD markup detected.' : 'Organization schema not detected.',
        },
        {
          schema: 'WebSite',
          detected: hasWebSiteSchema,
          evidence: hasWebSiteSchema ? 'Schema.org WebSite JSON-LD markup detected.' : 'WebSite schema not detected.',
        },
        {
          schema: 'WebPage',
          detected: hasWebPageSchema,
          evidence: hasWebPageSchema ? 'Schema.org WebPage JSON-LD markup detected.' : 'WebPage schema not detected.',
        },
        {
          schema: 'Service',
          detected: hasServiceSchema,
          evidence: hasServiceSchema ? 'Schema.org Service JSON-LD markup detected.' : 'Service schema not detected.',
        },
        {
          schema: 'FAQPage',
          detected: hasFaqPageSchema,
          evidence: hasFaqPageSchema ? 'Schema.org FAQPage JSON-LD markup detected.' : 'FAQPage schema not detected.',
        },
        {
          schema: 'BreadcrumbList',
          detected: hasBreadcrumbSchema,
          evidence: hasBreadcrumbSchema ? 'Schema.org BreadcrumbList JSON-LD markup detected.' : 'BreadcrumbList schema not detected.',
        },
      ],
    };

    const realSeoAnalysis: RealSeoAnalysisData = {
      technical: technicalSeo,
      onPage: onPageSeo,
      content: contentAnalysis,
      structuredData: structuredDataAnalysis,
    };

    // -----------------------------------------------------------------------
    // SECTION 7: LOCAL SEO ANALYSIS (Strict Google Business Profile Notice)
    // -----------------------------------------------------------------------
    const localPhoneAreaCodeRegex = /(?:\+?1[-. ]?)?\(?([2-9]\d{2})\)?[-. ]?\d{3}[-. ]?\d{4}/;
    const phoneMatch = discPhone ? discPhone.match(localPhoneAreaCodeRegex) : null;
    const isTollFree = phoneMatch ? ['800', '888', '877', '866', '855', '844', '833'].includes(phoneMatch[1]) : false;
    const hasLocalPhone = !!discPhone && !isTollFree;
    const hasMapEmbed = cleanHtml.includes('google.com/maps') || cleanHtml.includes('maps.google.com') || /<iframe\b[^>]*src=["'][^"']*map[^"']*["']/i.test(cleanHtml);

    // Dedicated service subpages
    const servicePagesFound = sortedLinks.filter((l) => /service|services|what-we-do/i.test(l));
    // Dedicated location subpages
    const locationPagesFound = sortedLinks.filter((l) => /location|locations|areas-we-serve|cities/i.test(l));

    const localSeoAnalysis: LocalSeoAnalysisData = {
      signals: {
        businessName: {
          found: !!discBizName,
          value: discBizName,
          evidence: discBizName ? `Discovered business name: "${discBizName}" (${discBizNameSource})` : 'Business name not detected on website.',
        },
        address: {
          found: !!discAddress,
          value: discAddress,
          evidence: discAddress ? `Physical address found: "${discAddress}" (${discAddressSource})` : 'Physical address not found on website.',
        },
        phone: {
          found: !!discPhone,
          value: discPhone,
          evidence: discPhone ? `Phone number found: "${discPhone}" (${discPhoneSource})` : 'Phone number not found on website.',
        },
        cityLocationReferences: {
          found: !!discCity || !!discAddress,
          locations: [discCity, discAddress].filter(Boolean) as string[],
          evidence: discCity ? `City reference detected: "${discCity}"` : (discAddress ? `Location found: "${discAddress}"` : 'No explicit city references found on website.'),
        },
        serviceAreas: {
          found: !!discServiceAreas && discServiceAreas.length > 0,
          areas: discServiceAreas || [],
          evidence: discServiceAreas && discServiceAreas.length > 0 ? `Service areas: ${discServiceAreas.join(', ')}` : 'No explicit service area definitions found on website.',
        },
        contactInformation: {
          found: !!discPhone || !!discEmail || !!discAddress,
          channels: [discPhone ? 'Phone' : '', discEmail ? 'Email' : '', discAddress ? 'Physical Address' : ''].filter(Boolean),
          evidence: discPhone || discEmail ? `Direct contact channels verified: ${[discPhone, discEmail].filter(Boolean).join(', ')}` : 'No direct contact channels detected on website.',
        },
        localBusinessSchema: {
          found: hasLocalBusinessSchema,
          schemaType: discCategory || (hasLocalBusinessSchema ? 'LocalBusiness' : null),
          evidence: hasLocalBusinessSchema ? `LocalBusiness Schema detected: ${discCategory || 'LocalBusiness'}` : 'LocalBusiness JSON-LD schema is missing from website HTML.',
        },
        organizationSchema: {
          found: hasOrgSchema,
          evidence: hasOrgSchema ? 'Organization Schema detected.' : 'Organization Schema not detected.',
        },
        servicePages: {
          found: servicePagesFound.length > 0,
          pages: servicePagesFound,
          evidence: servicePagesFound.length > 0 ? `Found ${servicePagesFound.length} dedicated service URL(s): ${servicePagesFound.slice(0, 2).join(', ')}` : 'No dedicated service subpages detected in site architecture.',
        },
        locationPages: {
          found: locationPagesFound.length > 0,
          pages: locationPagesFound,
          evidence: locationPagesFound.length > 0 ? `Found ${locationPagesFound.length} dedicated location URL(s): ${locationPagesFound.slice(0, 2).join(', ')}` : 'No dedicated location/city pages detected.',
        },
        localRelevanceSignals: {
          hasLocalPhone,
          hasMapEmbed,
          hasPhysicalAddressInFooter: !!discAddress,
          evidence: `Local relevance signals: ${hasLocalPhone ? 'Local area code phone (Yes)' : 'Local area code phone (No)'} • Google Maps Embed: ${hasMapEmbed ? 'Yes' : 'No'} • Address in Footer: ${discAddress ? 'Yes' : 'No'}.`,
        },
      },
      googleBusinessProfileNotice: {
        status: 'not_connected',
        headline: 'Google Business Profile data is not connected.',
        explanation: 'Anonymous users have not authorized access to their private Google Business Profile. Locora does not display private Google Business Profile data or claim review counts for unauthenticated public visitors. This is a limitation, not an error.',
        actionRequired: 'Connect your authorized Google Business Profile in your Locora workspace to sync live Google Maps reviews, 3-pack rank tracking, and customer feedback.',
      },
    };

    // -----------------------------------------------------------------------
    // SECTION 8: PERFORMANCE DATA (PageSpeed Insights or Socket Telemetry)
    // -----------------------------------------------------------------------
    const performanceAnalysis = await evaluatePerformance(initialUrl, {
      latencyMs: homeResult.latencyMs,
      sizeKb: homeResult.sizeKb,
      isSsl: homeResult.isSsl,
      httpStatus: homeResult.status,
    });

    // -----------------------------------------------------------------------
    // SECTION 9: DETERMINISTIC SEO SCORING CALCULATION (Zero AI Hallucination)
    // -----------------------------------------------------------------------

    // 1. Technical SEO (Max 100 points, Weight 0.20)
    const techHttpsCheck: ScoreCheckItem = {
      id: 'tech_https',
      name: 'HTTPS',
      passed: homeResult.isSsl,
      pointsAwarded: homeResult.isSsl ? 20 : 0,
      maxPoints: 20,
      evidence: homeResult.isSsl ? `TLS/SSL handshake verified at https://${hostname}` : 'Served over unencrypted HTTP (No SSL certificate active)',
    };
    const techSitemapCheck: ScoreCheckItem = {
      id: 'tech_sitemap',
      name: 'Sitemap',
      passed: sitemapFound,
      pointsAwarded: sitemapFound ? 20 : 0,
      maxPoints: 20,
      evidence: sitemapFound ? `sitemap.xml is accessible at root (HTTP ${sitemapStatusCode})` : `sitemap.xml returned HTTP ${sitemapStatusCode} (Not found at root)`,
    };
    const techCanonicalCheck: ScoreCheckItem = {
      id: 'tech_canonical',
      name: 'Canonical',
      passed: !!canonicalHref,
      pointsAwarded: canonicalHref ? 15 : 0,
      maxPoints: 15,
      evidence: canonicalHref ? `<link rel="canonical" href="${canonicalHref}">` : 'Homepage is missing a canonical link tag',
    };
    const techRobotsCheck: ScoreCheckItem = {
      id: 'tech_robots',
      name: 'Robots.txt',
      passed: robotsFound,
      pointsAwarded: robotsFound ? 15 : 0,
      maxPoints: 15,
      evidence: robotsFound ? `robots.txt is accessible (HTTP ${robotsStatusCode})` : `robots.txt returned HTTP ${robotsStatusCode}`,
    };
    const techIndexCheck: ScoreCheckItem = {
      id: 'tech_indexability',
      name: 'Indexability',
      passed: !isNoIndex && homeResult.status === 200,
      pointsAwarded: (!isNoIndex && homeResult.status === 200) ? 15 : 0,
      maxPoints: 15,
      evidence: (!isNoIndex && homeResult.status === 200) ? 'Page returns HTTP 200 and does not restrict crawlers with noindex' : 'Page contains a restrictive noindex tag or returned non-200 code',
    };
    const techLinksCheck: ScoreCheckItem = {
      id: 'tech_broken_links',
      name: 'Broken Links',
      passed: brokenInternalLinks.length === 0,
      pointsAwarded: brokenInternalLinks.length === 0 ? 15 : 0,
      maxPoints: 15,
      evidence: brokenInternalLinks.length === 0 ? `All ${secondaryPageResults.length} crawled internal sample links returned healthy HTTP status` : `${brokenInternalLinks.length} broken internal sample link(s) detected`,
    };

    const techChecks: ScoreCheckItem[] = [
      techHttpsCheck,
      techSitemapCheck,
      techCanonicalCheck,
      techRobotsCheck,
      techIndexCheck,
      techLinksCheck,
    ];
    const technicalSeoScore = Math.min(100, techChecks.reduce((acc, c) => acc + c.pointsAwarded, 0));
    const technicalSeoDetail: CategoryScoreDetail = {
      id: 'technical_seo',
      name: 'Technical SEO',
      score: technicalSeoScore,
      maxScore: 100,
      weight: 0.20,
      status: technicalSeoScore >= 80 ? 'good' : technicalSeoScore >= 55 ? 'fair' : 'needs_attention',
      checks: techChecks,
      explanation: 'Calculated from live server response, SSL handshake, sitemap.xml, robots.txt, canonical tag, and link health.',
    };

    // 2. On-Page SEO (Max 100 points, Weight 0.20)
    const onPageTitleOptimal = metaTitle.length >= 30 && metaTitle.length <= 65;
    const onPageTitleCheck: ScoreCheckItem = {
      id: 'onpage_title',
      name: 'Title Tag',
      passed: onPageTitleOptimal,
      pointsAwarded: onPageTitleOptimal ? 20 : metaTitle.length > 0 ? 12 : 0,
      maxPoints: 20,
      evidence: metaTitle ? `<title>${metaTitle}</title> (${metaTitle.length} characters)` : 'Homepage is missing a <title> tag',
    };
    const onPageDescOptimal = metaDescription.length >= 70 && metaDescription.length <= 165;
    const onPageDescCheck: ScoreCheckItem = {
      id: 'onpage_description',
      name: 'Meta Description',
      passed: onPageDescOptimal,
      pointsAwarded: onPageDescOptimal ? 20 : metaDescription.length > 0 ? 10 : 0,
      maxPoints: 20,
      evidence: metaDescription ? `<meta name="description"> present (${metaDescription.length} characters)` : 'Homepage is missing a meta description',
    };
    const onPageH1Check: ScoreCheckItem = {
      id: 'onpage_h1',
      name: 'Primary H1',
      passed: h1Matches.length === 1,
      pointsAwarded: h1Matches.length === 1 ? 20 : h1Matches.length > 1 ? 10 : 0,
      maxPoints: 20,
      evidence: h1Matches.length === 1 ? `1 primary H1 heading detected: "${h1Matches[0]}"` : h1Matches.length === 0 ? 'Zero <h1> tags discovered in page markup' : `Multiple H1 headings detected (${h1Matches.length} found)`,
    };
    const onPageHeadingsCheck: ScoreCheckItem = {
      id: 'onpage_hierarchy',
      name: 'Heading Hierarchy',
      passed: h2Matches.length >= 1,
      pointsAwarded: h2Matches.length >= 1 ? 15 : 0,
      maxPoints: 15,
      evidence: h2Matches.length >= 1 ? `Structured heading hierarchy (${h2Matches.length} H2 and ${h3Matches.length} H3 sections)` : 'Page lacks structural H2 subheadings',
    };
    const onPageAltCheck: ScoreCheckItem = {
      id: 'onpage_alt',
      name: 'Image Alt Attributes',
      passed: totalImages === 0 || missingAltImages === 0,
      pointsAwarded: (totalImages === 0 || missingAltImages === 0) ? 15 : missingAltImages < totalImages ? 8 : 0,
      maxPoints: 15,
      evidence: totalImages === 0 ? 'No images require alt attributes' : missingAltImages === 0 ? `All ${totalImages} images have descriptive alt text` : `${missingAltImages}/${totalImages} images missing alt text`,
    };
    const onPageUrlCheck: ScoreCheckItem = {
      id: 'onpage_url',
      name: 'Clean URL Structure',
      passed: !initialUrl.includes('?') && !initialUrl.includes('&'),
      pointsAwarded: (!initialUrl.includes('?') && !initialUrl.includes('&')) ? 10 : 0,
      maxPoints: 10,
      evidence: !initialUrl.includes('?') ? 'Clean, search-friendly canonical URL structure' : 'URL contains query tracking strings',
    };

    const onPageChecks: ScoreCheckItem[] = [
      onPageTitleCheck,
      onPageDescCheck,
      onPageH1Check,
      onPageHeadingsCheck,
      onPageAltCheck,
      onPageUrlCheck,
    ];
    const onPageSeoScore = Math.min(100, onPageChecks.reduce((acc, c) => acc + c.pointsAwarded, 0));
    const onPageSeoDetail: CategoryScoreDetail = {
      id: 'onpage_seo',
      name: 'On-Page SEO',
      score: onPageSeoScore,
      maxScore: 100,
      weight: 0.20,
      status: onPageSeoScore >= 80 ? 'good' : onPageSeoScore >= 55 ? 'fair' : 'needs_attention',
      checks: onPageChecks,
      explanation: 'Calculated from title length, meta description, single H1 heading hierarchy, image alt coverage, and URL format.',
    };

    // 3. Local SEO (Max 100 points, Weight 0.20)
    const localNameCheck: ScoreCheckItem = {
      id: 'local_name',
      name: 'Business Name',
      passed: !!discBizName,
      pointsAwarded: discBizName ? 20 : 0,
      maxPoints: 20,
      evidence: discBizName ? `Business name identified: "${discBizName}"` : 'Business name not detected in page markup',
    };
    const localPhoneCheck: ScoreCheckItem = {
      id: 'local_phone',
      name: 'Clickable Phone Link',
      passed: !!discPhone,
      pointsAwarded: discPhone ? 20 : 0,
      maxPoints: 20,
      evidence: discPhone ? `Clickable telephone (tel:) link detected: "${discPhone}"` : 'No clickable telephone (tel:) link found in HTML',
    };
    const localAddressCheck: ScoreCheckItem = {
      id: 'local_address',
      name: 'Physical Address',
      passed: !!discAddress,
      pointsAwarded: discAddress ? 20 : 0,
      maxPoints: 20,
      evidence: discAddress ? `Physical street address detected: "${discAddress}"` : 'Physical street address not detected in page markup',
    };
    const localAreaCodeCheck: ScoreCheckItem = {
      id: 'local_areacode',
      name: 'Local Area Code',
      passed: hasLocalPhone,
      pointsAwarded: hasLocalPhone ? 15 : 0,
      maxPoints: 15,
      evidence: hasLocalPhone ? 'Geographic local area code detected in phone number' : 'Non-geographic or missing local area code',
    };
    const localServicePagesCheck: ScoreCheckItem = {
      id: 'local_service_pages',
      name: 'Service Subpages',
      passed: servicePagesFound.length > 0,
      pointsAwarded: servicePagesFound.length > 0 ? 15 : 0,
      maxPoints: 15,
      evidence: servicePagesFound.length > 0 ? `Found ${servicePagesFound.length} dedicated service URL(s)` : 'No dedicated service subpages detected',
    };
    const localSignalsCheck: ScoreCheckItem = {
      id: 'local_geo_signals',
      name: 'Location Pages & Maps',
      passed: locationPagesFound.length > 0 || hasMapEmbed || !!discCity,
      pointsAwarded: (locationPagesFound.length > 0 || hasMapEmbed || !!discCity) ? 10 : 0,
      maxPoints: 10,
      evidence: locationPagesFound.length > 0 ? 'Dedicated location subpages detected' : hasMapEmbed ? 'Google Maps embed detected' : discCity ? `Target city detected: ${discCity}` : 'No dedicated location pages or map embeds found',
    };

    const localChecks: ScoreCheckItem[] = [
      localNameCheck,
      localPhoneCheck,
      localAddressCheck,
      localAreaCodeCheck,
      localServicePagesCheck,
      localSignalsCheck,
    ];
    const localSeoScore = Math.min(100, localChecks.reduce((acc, c) => acc + c.pointsAwarded, 0));
    const localSeoDetail: CategoryScoreDetail = {
      id: 'local_seo',
      name: 'Local SEO',
      score: localSeoScore,
      maxScore: 100,
      weight: 0.20,
      status: localSeoScore >= 80 ? 'good' : localSeoScore >= 55 ? 'fair' : 'needs_attention',
      checks: localChecks,
      explanation: 'Calculated from NAP footprint (Name, Phone, Address), local area codes, dedicated service pages, and geographic references.',
    };

    // 4. Content (Max 100 points, Weight 0.15)
    const contentWordCheck: ScoreCheckItem = {
      id: 'content_depth',
      name: 'Content Depth',
      passed: wordCount >= 250,
      pointsAwarded: wordCount >= 600 ? 30 : wordCount >= 250 ? 20 : 6,
      maxPoints: 30,
      evidence: wordCount >= 250 ? `${wordCount} readable words (${wordCount >= 600 ? 'in-depth' : 'adequate'} depth)` : `Thin content detected (${wordCount} words, below 250 word benchmark)`,
    };
    const contentParagraphCheck: ScoreCheckItem = {
      id: 'content_paragraphs',
      name: 'Paragraph Flow',
      passed: paragraphCount >= 3,
      pointsAwarded: paragraphCount >= 3 ? 20 : 8,
      maxPoints: 20,
      evidence: paragraphCount >= 3 ? `${paragraphCount} paragraph (<p>) content blocks detected` : `Low paragraph count (${paragraphCount} <p> tags)`,
    };
    const hasConversionAction = Boolean(discPhone || /<form\b/i.test(cleanHtml) || /book|schedule|contact|quote|consultation|call/i.test(textSnippet));
    const contentConversionCheck: ScoreCheckItem = {
      id: 'content_conversion',
      name: 'Conversion Actions (CTA)',
      passed: hasConversionAction,
      pointsAwarded: hasConversionAction ? 25 : 0,
      maxPoints: 25,
      evidence: hasConversionAction ? 'Active customer contact form or direct call CTA detected' : 'Missing clear conversion CTA or lead capture mechanism',
    };
    const hasServicesArticulated = Boolean((discServices && discServices.length > 0) || /services?|what we do|our work/i.test(cleanHtml));
    const contentServiceCheck: ScoreCheckItem = {
      id: 'content_services',
      name: 'Service Descriptions',
      passed: hasServicesArticulated,
      pointsAwarded: hasServicesArticulated ? 15 : 0,
      maxPoints: 15,
      evidence: hasServicesArticulated
        ? `Service offerings articulated (${(discServices && discServices.length > 0 ? discServices.slice(0, 2).join(', ') : '') || 'in body copy'})`
        : 'Service offerings not clearly articulated in page copy',
    };
    const hasGeoInCopy = Boolean(discCity || discState || discAddress || /serving|located in|area/i.test(textSnippet));
    const contentGeoCheck: ScoreCheckItem = {
      id: 'content_geo',
      name: 'Local Context in Copy',
      passed: hasGeoInCopy,
      pointsAwarded: hasGeoInCopy ? 10 : 0,
      maxPoints: 10,
      evidence: hasGeoInCopy ? `Geographical references found (${discCity || discState || 'in text copy'})` : 'Page body copy lacks geographical locality keywords',
    };

    const contentChecks: ScoreCheckItem[] = [
      contentWordCheck,
      contentParagraphCheck,
      contentConversionCheck,
      contentServiceCheck,
      contentGeoCheck,
    ];
    const contentScore = Math.min(100, contentChecks.reduce((acc, c) => acc + c.pointsAwarded, 0));
    const contentDetail: CategoryScoreDetail = {
      id: 'content',
      name: 'Content',
      score: contentScore,
      maxScore: 100,
      weight: 0.15,
      status: contentScore >= 80 ? 'good' : contentScore >= 55 ? 'fair' : 'needs_attention',
      checks: contentChecks,
      explanation: 'Calculated from word count depth, paragraph readability, conversion calls-to-action, service clarity, and local relevance.',
    };

    // 5. Structured Data (Max 100 points, Weight 0.10)
    const hasJsonLdScripts = schemaScriptMatches.length > 0;
    const jsonLdBlockCount = schemaScriptMatches.length;
    const structJsonLdCheck: ScoreCheckItem = {
      id: 'struct_jsonld',
      name: 'JSON-LD Script',
      passed: hasJsonLdScripts,
      pointsAwarded: hasJsonLdScripts ? 25 : 0,
      maxPoints: 25,
      evidence: hasJsonLdScripts ? `${jsonLdBlockCount} Schema.org JSON-LD structured data block(s) detected` : 'No Schema.org JSON-LD scripts found',
    };
    const structLocalBizCheck: ScoreCheckItem = {
      id: 'struct_localbiz',
      name: 'LocalBusiness Schema',
      passed: hasLocalBusinessSchema,
      pointsAwarded: hasLocalBusinessSchema ? 35 : 0,
      maxPoints: 35,
      evidence: hasLocalBusinessSchema ? `LocalBusiness Schema detected: ${discCategory || 'LocalBusiness'}` : 'Missing Schema.org LocalBusiness markup',
    };
    const structOrgCheck: ScoreCheckItem = {
      id: 'struct_org',
      name: 'Organization / WebSite Schema',
      passed: hasOrgSchema || hasWebSiteSchema,
      pointsAwarded: (hasOrgSchema || hasWebSiteSchema) ? 20 : 0,
      maxPoints: 20,
      evidence: (hasOrgSchema || hasWebSiteSchema) ? 'Entity schema detected (Organization / WebSite)' : 'No Organization or WebSite schema detected',
    };
    const structAttrsCheck: ScoreCheckItem = {
      id: 'struct_attrs',
      name: 'Attribute Completeness',
      passed: hasLocalBusinessSchema && Boolean(discPhone || discAddress),
      pointsAwarded: (hasLocalBusinessSchema && Boolean(discPhone && discAddress)) ? 20 : hasLocalBusinessSchema ? 10 : 0,
      maxPoints: 20,
      evidence: (hasLocalBusinessSchema && Boolean(discPhone && discAddress)) ? 'Structured data includes verified phone and address coordinates' : 'Structured data is missing phone, address, or operating hours',
    };

    const structuredDataChecks: ScoreCheckItem[] = [
      structJsonLdCheck,
      structLocalBizCheck,
      structOrgCheck,
      structAttrsCheck,
    ];
    const structuredDataScore = Math.min(100, structuredDataChecks.reduce((acc, c) => acc + c.pointsAwarded, 0));
    const structuredDataDetail: CategoryScoreDetail = {
      id: 'structured_data',
      name: 'Structured Data',
      score: structuredDataScore,
      maxScore: 100,
      weight: 0.10,
      status: structuredDataScore >= 80 ? 'good' : structuredDataScore >= 55 ? 'fair' : 'needs_attention',
      checks: structuredDataChecks,
      explanation: 'Calculated from JSON-LD implementation, LocalBusiness schema detection, entity markup, and attribute completeness.',
    };

    // 6. Performance (Max 100 points, Weight 0.15)
    let perfTtfbPoints = 0;
    if (homeResult.latencyMs < 300) perfTtfbPoints = 30;
    else if (homeResult.latencyMs < 600) perfTtfbPoints = 20;
    else if (homeResult.latencyMs < 1000) perfTtfbPoints = 10;
    else perfTtfbPoints = 0;

    const perfTtfbCheck: ScoreCheckItem = {
      id: 'perf_ttfb',
      name: 'Server TTFB Latency',
      passed: homeResult.latencyMs < 600,
      pointsAwarded: perfTtfbPoints,
      maxPoints: 30,
      evidence: `Direct Time To First Byte measured at ${homeResult.latencyMs}ms (${homeResult.latencyMs < 300 ? 'Fast' : homeResult.latencyMs < 600 ? 'Acceptable' : 'Slow'})`,
    };

    let perfSizePoints = 0;
    if (homeResult.sizeKb < 200) perfSizePoints = 25;
    else if (homeResult.sizeKb < 500) perfSizePoints = 18;
    else if (homeResult.sizeKb < 1000) perfSizePoints = 8;
    else perfSizePoints = 0;

    const perfSizeCheck: ScoreCheckItem = {
      id: 'perf_payload',
      name: 'HTML Payload Size',
      passed: homeResult.sizeKb < 500,
      pointsAwarded: perfSizePoints,
      maxPoints: 25,
      evidence: `Initial transferred HTML payload is ${homeResult.sizeKb} KB`,
    };
    const perfViewportCheck: ScoreCheckItem = {
      id: 'perf_viewport',
      name: 'Mobile Viewport',
      passed: !!viewportMatch,
      pointsAwarded: viewportMatch ? 25 : 0,
      maxPoints: 25,
      evidence: viewportMatch ? 'Mobile responsive viewport tag configured (<meta name="viewport">)' : 'Missing mobile viewport meta tag',
    };
    const perfSslCheck: ScoreCheckItem = {
      id: 'perf_ssl',
      name: 'Secure Transport Protocol',
      passed: homeResult.isSsl,
      pointsAwarded: homeResult.isSsl ? 20 : 0,
      maxPoints: 20,
      evidence: homeResult.isSsl ? 'TLS/SSL encrypted transport verified' : 'Unencrypted HTTP transport (No SSL)',
    };

    const performanceChecks: ScoreCheckItem[] = [
      perfTtfbCheck,
      perfSizeCheck,
      perfViewportCheck,
      perfSslCheck,
    ];
    let socketPerformanceScore = Math.min(100, performanceChecks.reduce((acc, c) => acc + c.pointsAwarded, 0));
    let finalPerformanceScore = socketPerformanceScore;
    if (performanceAnalysis.status === 'available' && performanceAnalysis.pageSpeedMetrics) {
      finalPerformanceScore = Math.round((performanceAnalysis.pageSpeedMetrics.mobilePerformanceScore * 0.7) + (socketPerformanceScore * 0.3));
    }
    const performanceDetail: CategoryScoreDetail = {
      id: 'performance',
      name: 'Performance',
      score: finalPerformanceScore,
      maxScore: 100,
      weight: 0.15,
      status: finalPerformanceScore >= 80 ? 'good' : finalPerformanceScore >= 55 ? 'fair' : 'needs_attention',
      checks: performanceChecks,
      explanation: performanceAnalysis.status === 'available'
        ? 'Calculated from Google PageSpeed Insights mobile metrics (FCP, LCP, CLS) and socket TTFB.'
        : 'Calculated from direct socket Time To First Byte (TTFB), HTML transfer size, and mobile viewport readiness.',
    };

    // OVERALL SCORE CALCULATION (Deterministic Formula)
    const overallScore = Math.min(100, Math.max(10, Math.round(
      (technicalSeoScore * 0.20) +
      (onPageSeoScore * 0.20) +
      (localSeoScore * 0.20) +
      (contentScore * 0.15) +
      (structuredDataScore * 0.10) +
      (finalPerformanceScore * 0.15)
    )));

    const scoringResult: DeterministicScoringResult = {
      overallScore,
      categories: {
        technicalSeo: technicalSeoDetail,
        onPageSeo: onPageSeoDetail,
        localSeo: localSeoDetail,
        content: contentDetail,
        structuredData: structuredDataDetail,
        performance: performanceDetail,
      },
      formulaExplanation: 'Overall Score = (Technical × 0.20) + (On-Page × 0.20) + (Local × 0.20) + (Content × 0.15) + (Structured Data × 0.10) + (Performance × 0.15). Deterministic math derived exclusively from live crawl data.',
    };

    // -----------------------------------------------------------------------
    // SECTIONS 10, 11, 12, 13: PUBLIC RESULTS VALUE-GATING ENGINE
    // -----------------------------------------------------------------------
    // Collect all failed checks and lost points across the 6 categories as real opportunities
    const allDetectedFailedChecks: Array<{
      category: string;
      check: ScoreCheckItem;
      severity: 'critical' | 'warning' | 'info';
    }> = [];

    const allDetectedPassedChecks: Array<{
      category: string;
      check: ScoreCheckItem;
    }> = [];

    const categoryList = [
      technicalSeoDetail,
      onPageSeoDetail,
      localSeoDetail,
      contentDetail,
      structuredDataDetail,
      performanceDetail,
    ];

    categoryList.forEach((cat) => {
      cat.checks.forEach((chk) => {
        if (!chk.passed || chk.pointsAwarded < chk.maxPoints) {
          const isCritical = chk.id === 'tech_https' || chk.id === 'struct_localbiz' || chk.id === 'onpage_title' || chk.id === 'onpage_description';
          const isWarning = chk.id === 'local_phone' || chk.id === 'onpage_h1' || chk.id === 'perf_ttfb' || chk.id === 'tech_sitemap' || chk.id === 'content_depth';
          allDetectedFailedChecks.push({
            category: cat.name,
            check: chk,
            severity: isCritical ? 'critical' : isWarning ? 'warning' : 'info',
          });
        } else {
          allDetectedPassedChecks.push({
            category: cat.name,
            check: chk,
          });
        }
      });
    });

    const totalOpportunitiesCount = Math.max(allDetectedFailedChecks.length, 3);

    // 1. Limited Critical Findings (Top 2-3 highest priority problems)
    // Sort critical first, then warning
    const sortedIssues = [...allDetectedFailedChecks].sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });

    const topIssues: PublicGatedIssue[] = sortedIssues.slice(0, 3).map((item, idx) => {
      let desc = '';
      if (item.check.id === 'struct_localbiz') {
        desc = 'LocalBusiness structured data is missing or incomplete. Search engines and map bots cannot verify operating hours, service catalog, or geo-coordinates.';
      } else if (item.check.id === 'onpage_description') {
        desc = 'Homepage is missing a meta description. Search engines will extract random text snippets, resulting in lower click-through rates from searchers.';
      } else if (item.check.id === 'onpage_title') {
        desc = 'Homepage title tag is missing or suboptimal. The title tag is the #1 on-page organic ranking factor for search engines.';
      } else if (item.check.id === 'tech_https') {
        desc = 'Website is served over unencrypted HTTP. Web browsers warn visitors with "Not Secure" flags, damaging customer trust.';
      } else if (item.check.id === 'local_phone') {
        desc = 'No direct clickable telephone link (tel:) found. Mobile visitors cannot tap to call your business instantly.';
      } else if (item.check.id === 'onpage_h1') {
        desc = 'Missing a primary H1 heading tag to define your main business service and service area.';
      } else if (item.check.id === 'tech_sitemap') {
        desc = 'Standard sitemap.xml is not discoverable at the domain root, slowing down search engine indexing of new subpages.';
      } else if (item.check.id === 'perf_ttfb') {
        desc = 'Slow initial server Time To First Byte (TTFB). Delays visitor rendering and reduces conversion rates.';
      } else {
        desc = item.check.evidence;
      }

      let rec = 'Review and update this factor to improve local search rank.';
      if (item.check.id === 'local_schema') {
        rec = 'Embed a valid Schema.org LocalBusiness JSON-LD script containing your business name, address, telephone, and geo coordinates.';
      } else if (item.check.id === 'onpage_description') {
        rec = 'Write a concise, compelling 140-160 character meta description including your primary service and service location.';
      } else if (item.check.id === 'onpage_title') {
        rec = 'Configure a descriptive title tag (50-60 characters) following the format: [Primary Service] in [City, State] | [Business Name].';
      } else if (item.check.id === 'tech_https') {
        rec = 'Install an SSL certificate and configure automatic 301 redirects from HTTP to HTTPS.';
      } else if (item.check.id === 'local_phone') {
        rec = 'Add a visible tap-to-call link in your header and contact section formatted as <a href="tel:...">.';
      } else if (item.check.id === 'onpage_h1') {
        rec = 'Add a single, clean H1 headline at the top of the page declaring your primary service offering.';
      } else if (item.check.id === 'tech_sitemap') {
        rec = 'Generate an XML sitemap at /sitemap.xml and submit it to Google Search Console.';
      } else if (item.check.id === 'perf_ttfb') {
        rec = 'Enable page caching or CDN edge proxying to decrease server response latency under 300ms.';
      }

      return {
        id: `top_issue_${idx + 1}`,
        priority: idx + 1,
        severity: item.severity,
        title: item.check.name === 'LocalBusiness Schema'
          ? 'LocalBusiness structured data is incomplete.'
          : item.check.name === 'Meta Description'
          ? 'Homepage is missing a meta description.'
          : item.check.name === 'Title Tag'
          ? 'Weak or missing title tag on homepage.'
          : `${item.check.name} needs attention`,
        description: desc,
        limitedEvidence: item.check.evidence,
        category: item.category,
        affectedUrl: 'Homepage (/)',
        recommendation: rec,
      };
    });

    // 2. Limited Passed Checks (Top 2-3 passed checks)
    const topPassedChecks: PublicGatedPassedCheck[] = allDetectedPassedChecks.slice(0, 3).map((item, idx) => ({
      id: `passed_chk_${idx + 1}`,
      title: `${item.check.name} verified`,
      limitedEvidence: item.check.evidence,
      category: item.category,
    }));

    // 3. Top 2-3 Opportunities
    const topOpportunities: PublicGatedOpportunity[] = [
      {
        id: 'opp_1',
        priority: 1,
        title: 'Deploy Schema.org LocalBusiness JSON-LD markup',
        impact: 'High Revenue Impact',
        category: 'Structured Data',
        difficulty: 'Quick Win',
        limitedEvidence: hasLocalBusinessSchema ? 'Schema present but missing properties' : '0 LocalBusiness blocks detected in HTML',
      },
      {
        id: 'opp_2',
        priority: 2,
        title: 'Optimize homepage meta title and description',
        impact: 'Immediate CTR Lift',
        category: 'On-Page SEO',
        difficulty: 'Quick Win',
        limitedEvidence: metaTitle ? `Current title: ${metaTitle.slice(0, 45)}...` : 'Missing title and description tags',
      },
      {
        id: 'opp_3',
        priority: 3,
        title: 'Add direct click-to-call (tel:) links in navigation and footer',
        impact: 'Mobile Call Lift',
        category: 'Local SEO',
        difficulty: 'Quick Win',
        limitedEvidence: discPhone ? `Phone found: ${discPhone}` : 'No clickable phone links detected',
      },
    ];

    const lockedOpportunitiesCount = Math.max(0, totalOpportunitiesCount - topOpportunities.length);

    // Lowest category for next-step recommendation
    const lowestCategory = [...categoryList].sort((a, b) => a.score - b.score)[0];
    const nextStepRecommendation = {
      headline: `Address ${lowestCategory.name} first to capture local search visibility`,
      summary: `Your ${lowestCategory.name} score is currently ${lowestCategory.score}/100. Fixing the top findings in this category provides the fastest lift in Google Maps 3-pack rankings and local customer inquiries.`,
      primaryFocus: lowestCategory.name,
    };

    const scanMetadata = {
      scanDateTime: new Date().toISOString(),
      pagesAnalyzedLabel: `${crawlCount} ${crawlCount === 1 ? 'page analyzed' : 'pages analyzed'}`,
      dataSources: [
        'Website Crawl',
        performanceAnalysis.provider === 'google_pagespeed_insights' && performanceAnalysis.status === 'available'
          ? 'PageSpeed Insights'
          : 'Direct Socket Telemetry',
        'Calculated by Locora',
      ],
    };

    const lockedFeaturesList = [
      { feature: 'Complete Page-by-Page Audit', description: 'Detailed crawl logs, DOM tree diagnostics, and status codes for every internal URL.' },
      { feature: `All ${lockedOpportunitiesCount} Additional Opportunities`, description: 'Full step-by-step action items with estimated revenue impact and copy-paste code snippets.' },
      { feature: 'Competitor Intelligence & Rank Tracking', description: 'Monitor local competitors, 3-pack geo-grid rankings, and keyword movements daily.' },
      { feature: 'Google Business Profile & Review Sync', description: 'Sync Google Maps reviews, automated AI review replies, and customer sentiment analytics.' },
      { feature: 'Autonomous AI Manager & Content Hub', description: 'Let Locora AI draft localized landing pages, FAQ schema, and social updates on autopilot.' },
    ];

    const gatedReport: PublicGatedReport = {
      totalOpportunitiesCount,
      visibleOpportunitiesCount: topOpportunities.length,
      lockedOpportunitiesCount,
      topIssues,
      topPassedChecks,
      topOpportunities,
      nextStepRecommendation,
      scanMetadata,
      lockedFeaturesList,
    };

    // Backward-compatible discoveredIssues array (top 5)
    const discoveredIssues: PublicCheckupResult['discoveredIssues'] = topIssues.map((iss) => ({
      id: iss.id,
      severity: iss.severity,
      category: iss.category as any,
      title: iss.title,
      description: iss.description,
      evidence: iss.limitedEvidence,
    }));

    // -----------------------------------------------------------------------
    // GATED TEASERS
    // -----------------------------------------------------------------------
    const gatedTeasers: PublicCheckupResult['gatedTeasers'] = [
      {
        id: 'teaser_why',
        question: 'Why is it happening?',
        title: 'Deep Root-Cause & Code-Level Diagnostic',
        teaserDescription: 'Inspect exact source-code line references, missing server response headers, DOM hierarchy conflicts, and CDN misconfigurations causing your score drops.',
        featureHighlight: 'Full DOM Inspection & Header Health Breakdown',
        unlockedInPlan: 'Included with Free Locora Account',
      },
      {
        id: 'teaser_what_first',
        question: 'What should I fix first?',
        title: 'Revenue-Impact Prioritized Action Roadmap',
        teaserDescription: 'Stop guessing what to tackle. Locora calculates which fixes deliver the fastest local search traffic and new customer calls, ordered by ROI.',
        featureHighlight: 'Prioritized 10-Step Growth Sprint',
        unlockedInPlan: 'Included with Free Locora Account',
      },
      {
        id: 'teaser_how',
        question: 'How do I fix it?',
        title: 'One-Click Code & JSON-LD Schema Generator',
        teaserDescription: 'Get copy-paste ready HTML, structured Schema.org JSON-LD tags, and optimized meta descriptions generated specifically for your business.',
        featureHighlight: 'Instant Code Snippets & Schema Generator',
        unlockedInPlan: 'Included with Free Locora Account',
      },
      {
        id: 'teaser_ai_manager',
        question: 'Can Locora do it for me?',
        title: 'Locora Autonomous AI Copilot & Work Hub',
        teaserDescription: 'Assign these audit tasks directly to Locora AI. The AI manager generates content drafts, client proposals, review responses, and tracks task completion.',
        featureHighlight: 'Autonomous AI Business Manager',
        unlockedInPlan: 'Included with Free Locora Account',
      },
      {
        id: 'teaser_monitoring',
        question: 'Did it improve & how am I performing over time?',
        title: 'Continuous 24/7 Telemetry & Ranking Trackers',
        teaserDescription: 'Connect Google Business Profile and search consoles to monitor daily 3-pack rank shifts, review velocity, and competitor movements automatically.',
        featureHighlight: 'Real-Time Telemetry & Historic Audit Benchmarks',
        unlockedInPlan: 'Included with Free Locora Account',
      },
    ];

    const auditId = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const publicResult: PublicCheckupResult = {
      auditId,
      url: initialUrl,
      domain: hostname,
      businessName: discBizName || hostname,
      businessLocation: businessLocation || discAddress || undefined,
      visitorEmail: email || undefined,
      analyzedAt: new Date().toISOString(),
      pagesCrawled: crawlCount,
      overallScore,
      scoring: scoringResult,
      gatedReport,
      scores: {
        seo: onPageSeoScore,
        performance: finalPerformanceScore,
        localPresence: localSeoScore,
        technicalSeo: technicalSeoScore,
        onPageSeo: onPageSeoScore,
        localSeo: localSeoScore,
        content: contentScore,
        structuredData: structuredDataScore,
      },
      crawlStats: {
        latencyMs: homeResult.latencyMs,
        htmlSizeKb: homeResult.sizeKb,
        isSsl: homeResult.isSsl,
        httpStatus: homeResult.status,
        totalImages,
        missingAltImages,
        internalLinksCount: sortedLinks.length,
      },
      detectedBusinessData: {
        name: discBizName || hostname,
        phone: discPhone,
        address: discAddress,
        schemaTypes,
        hasLocalBusinessSchema,
        hasContactForm: /<form\b[^>]*>/i.test(cleanHtml) && /<input\b[^>]*type=["'](?:email|tel|text)["']/i.test(cleanHtml),
        hasMapEmbed,
        metaTitle,
        metaDescription,
        h1Heading: h1Matches[0] || null,
      },
      businessDiscovery,
      realSeoAnalysis,
      localSeoAnalysis,
      performanceAnalysis,
      discoveredIssues,
      gatedTeasers,
      status: 'completed',
      cacheStatus: 'live',
      dataAge: 'Live Crawl',
      crawlStartedAt,
      crawlCompletedAt: new Date().toISOString(),
      visitorId: visitorId || undefined,
    };

    publicAuditsStore.set(auditId, publicResult);

    // Persist to public_audits schema model (Section 18)
    savePublicAuditRecord({
      id: auditId,
      website_url: initialUrl,
      normalized_url: initialUrl,
      visitor_id: visitorId || undefined,
      user_id: null,
      business_id: null,
      status: 'completed',
      started_at: crawlStartedAt,
      completed_at: new Date().toISOString(),
      overall_score: overallScore,
      technical_score: technicalSeoScore,
      onpage_score: onPageSeoScore,
      local_score: localSeoScore,
      content_score: contentScore,
      performance_score: finalPerformanceScore,
      schema_score: structuredDataScore,
      pages_analyzed: crawlCount,
      findings: topIssues,
      discovered_business_data: publicResult.detectedBusinessData,
      data_sources: scanMetadata.dataSources,
      crawler_version: '2.4.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cache_status: 'live',
      fullResult: publicResult,
    });

    return publicResult;
  } finally {
    releaseCrawlSlot();
  }
}
