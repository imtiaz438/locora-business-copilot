import fs from 'fs';
import path from 'path';
import type {
  DomainOverviewData,
  BacklinkSummaryData,
  KeywordItemData,
  SerpOverviewData,
  AiOverviewPresenceData,
  LocationResolution,
} from './types.ts';
import locationsData from './locations.json';

export interface SeoClientCredentials {
  dataforseoLogin?: string;
  dataforseoPassword?: string;
  serpApiKey?: string;
  serperKey?: string;
}

/**
 * Resolves API credentials from process.env and disk settings
 */
export function getSeoApiCredentials(overrideKeys?: Record<string, string>): SeoClientCredentials {
  let diskSettings: any = {};
  try {
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const content = fs.readFileSync(settingsPath, 'utf8');
      diskSettings = JSON.parse(content);
    }
  } catch {
    // ignore
  }

  const pKeys = diskSettings.providerKeys || {};

  const login =
    overrideKeys?.DATAFORSEO_LOGIN ||
    overrideKeys?.dataforseoLogin ||
    pKeys.DATAFORSEO_LOGIN ||
    pKeys.dataforseoLogin ||
    process.env.DATAFORSEO_LOGIN ||
    process.env.DATAFORSEO_USERNAME ||
    process.env.DATAFORSEO_API_LOGIN ||
    '';

  const password =
    overrideKeys?.DATAFORSEO_PASSWORD ||
    overrideKeys?.dataforseoPassword ||
    pKeys.DATAFORSEO_PASSWORD ||
    pKeys.dataforseoPassword ||
    process.env.DATAFORSEO_PASSWORD ||
    process.env.DATAFORSEO_API_PASSWORD ||
    '';

  const serpApiKey =
    overrideKeys?.SERPAPI_API_KEY ||
    overrideKeys?.serpApiKey ||
    pKeys.SERPAPI_API_KEY ||
    pKeys.serpApiKey ||
    process.env.SERPAPI_API_KEY ||
    process.env.SERPAPI_KEY ||
    '';

  const serperKey =
    overrideKeys?.SERPER_API_KEY ||
    overrideKeys?.serperKey ||
    pKeys.SERPER_API_KEY ||
    pKeys.serperKey ||
    process.env.SERPER_API_KEY ||
    process.env.SERPER_KEY ||
    '';

  return {
    dataforseoLogin: login.trim(),
    dataforseoPassword: password.trim(),
    serpApiKey: serpApiKey.trim(),
    serperKey: serperKey.trim(),
  };
}

/**
 * Resolves location_code and language_code from static locations.json
 * (Phase A #3 - Never wastes API calls looking up static location codes)
 */
export function resolveLocationCode(country?: string): LocationResolution {
  const normCountry = (country || '').toLowerCase().trim();
  const mappings = (locationsData as any).mappings || {};
  const defaultLoc = (locationsData as any).default || {
    location_code: 2840,
    language_code: 'en',
    country_iso_code: 'US',
  };

  if (normCountry && mappings[normCountry]) {
    return mappings[normCountry];
  }

  // Check 2-letter matches
  for (const [key, val] of Object.entries(mappings)) {
    if (key === normCountry || (val as any).country_iso_code?.toLowerCase() === normCountry) {
      return val as LocationResolution;
    }
  }

  return defaultLoc;
}

/**
 * 1. Domain's own traffic/authority overview
 * Endpoint: dataforseo_labs/google/domain_rank_overview/live
 * One domain per call
 */
export async function getDomainOverview(
  domain: string,
  locationCode = 2840,
  languageCode = 'en',
  credentials?: SeoClientCredentials
): Promise<DomainOverviewData> {
  const creds = credentials || getSeoApiCredentials();
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase().trim();

  if (creds.dataforseoLogin && creds.dataforseoPassword) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${creds.dataforseoLogin}:${creds.dataforseoPassword}`).toString('base64');
      const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            target: cleanDomain,
            location_code: locationCode,
            language_code: languageCode,
          },
        ]),
      });

      if (response.ok) {
        const json = await response.json();
        const item = json?.tasks?.[0]?.result?.[0]?.items?.[0] || json?.tasks?.[0]?.result?.[0];
        if (item) {
          const metrics = item.metrics?.organic || {};
          const rawRank = item.organic_rank || metrics.pos_1 || 0;
          const etv = metrics.etv || metrics.estimated_traffic || Math.round((metrics.count || 10) * 1.8);
          const organicKeywords = metrics.count || 0;
          const paidKeywords = item.metrics?.paid?.count || 0;

          // Normalized 0–100 domain rank metric
          const normalizedRank = Math.min(99, Math.max(12, Math.round(Math.log10(Math.max(10, etv * 10 + organicKeywords * 5)) * 18)));

          // Historical trend if present from live provider
          const trend = (item.historical || []).map((h: any) => ({
            date: h.date || h.month || '',
            traffic: h.etv || h.traffic || 0,
            keywords: h.count || h.keywords || 0,
          }));

          return {
            rank: normalizedRank,
            rawRank,
            estimatedTraffic: etv,
            organicKeywordsCount: organicKeywords,
            paidKeywordsCount: paidKeywords,
            trend,
          };
        }
      }
    } catch (err) {
      console.warn('[SeoData] DataForSEO domain_rank_overview failed, using normalized heuristic:', err);
    }
  }

  // Clean empty structure when live keys are unavailable or API rate limits
  return {
    rank: 0,
    rawRank: 0,
    estimatedTraffic: 0,
    organicKeywordsCount: 0,
    paidKeywordsCount: 0,
    trend: [],
  };
}

/**
 * 2. Backlink profile
 * Endpoint: backlinks/summary/live
 * Notes: 'rank' field is 0–1,000, not comparable to Ahrefs/Moz
 */
export async function getBacklinkSummary(
  domain: string,
  credentials?: SeoClientCredentials
): Promise<BacklinkSummaryData> {
  const creds = credentials || getSeoApiCredentials();
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase().trim();

  if (creds.dataforseoLogin && creds.dataforseoPassword) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${creds.dataforseoLogin}:${creds.dataforseoPassword}`).toString('base64');
      const response = await fetch('https://api.dataforseo.com/v3/backlinks/summary/live', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            target: cleanDomain,
            internal_list_limit: 10,
          },
        ]),
      });

      if (response.ok) {
        const json = await response.json();
        const item = json?.tasks?.[0]?.result?.[0];
        if (item) {
          const totalBacklinks = item.total_backlinks || item.backlinks || 0;
          const refDomains = item.referring_domains || item.referring_main_domains || 0;
          const dfsRank = item.rank || 0; // 0–1,000 DataForSEO rank
          const spamScore = item.spam_score || 0;
          const dofollow = item.dofollow || item.dofollow_backlinks || 0;

          return {
            total: totalBacklinks,
            referringDomains: refDomains,
            spamScore,
            rank: dfsRank,
            dofollowCount: dofollow,
          };
        }
      }
    } catch (err) {
      console.warn('[SeoData] DataForSEO backlinks/summary failed, using normalized fallback:', err);
    }
  }

  // Clean empty state when live API is unavailable
  return {
    total: 0,
    referringDomains: 0,
    spamScore: 0,
    rank: 0,
    dofollowCount: 0,
  };
}

/**
 * 3. Keyword volume/CPC/intent
 * Endpoint: dataforseo_labs/google/keyword_overview/live
 * Supports up to 700 keywords in ONE call — batch, don't loop!
 */
export async function getKeywordData(
  keywords: string[],
  locationCode = 2840,
  languageCode = 'en',
  credentials?: SeoClientCredentials
): Promise<KeywordItemData[]> {
  const creds = credentials || getSeoApiCredentials();
  const cleanKeywords = Array.from(new Set(keywords.map(k => k.trim()).filter(Boolean))).slice(0, 700);

  if (cleanKeywords.length === 0) return [];

  if (creds.dataforseoLogin && creds.dataforseoPassword) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${creds.dataforseoLogin}:${creds.dataforseoPassword}`).toString('base64');
      const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_overview/live', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            keywords: cleanKeywords,
            location_code: locationCode,
            language_code: languageCode,
          },
        ]),
      });

      if (response.ok) {
        const json = await response.json();
        const items = json?.tasks?.[0]?.result?.[0]?.items || [];
        if (Array.isArray(items) && items.length > 0) {
          return items.map((item: any) => {
            const kwInfo = item.keyword_info || {};
            const intentInfo = item.search_intent_info || {};
            const props = item.keyword_properties || {};

            let comp = 'MEDIUM';
            if (kwInfo.competition_level) {
              comp = String(kwInfo.competition_level).toUpperCase();
            } else if (typeof kwInfo.competition === 'number') {
              comp = kwInfo.competition > 0.66 ? 'HIGH' : kwInfo.competition > 0.33 ? 'MEDIUM' : 'LOW';
            }

            return {
              keyword: item.keyword || '',
              volume: kwInfo.search_volume || 0,
              cpc: Number(kwInfo.cpc || 0),
              competition: comp,
              intent: intentInfo.main_intent || 'commercial',
              difficulty: props.keyword_difficulty || 0,
            };
          });
        }
      }
    } catch (err) {
      console.warn('[SeoData] DataForSEO keyword_overview failed, normalizing fallback:', err);
    }
  }

  // Clean empty array when live API is unavailable
  return [];
}

/**
 * 4. Live SERP position, PAA, related searches
 * Endpoint: SerpApi engine=google
 * URL format: https://serpapi.com/search.json?engine=google&q=...&api_key=...
 */
export async function getSerpResults(
  keyword: string,
  location = 'United States',
  credentials?: SeoClientCredentials
): Promise<SerpOverviewData> {
  const creds = credentials || getSeoApiCredentials();
  const cleanKeyword = keyword.trim();

  if (creds.serpApiKey && cleanKeyword) {
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(cleanKeyword)}&location=${encodeURIComponent(location)}&api_key=${creds.serpApiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        const organicResults: Array<{ position: number; title: string; url: string; snippet: string }> = [];

        (json.organic_results || []).forEach((res: any, idx: number) => {
          organicResults.push({
            position: res.position || idx + 1,
            title: res.title || '',
            url: res.link || '',
            snippet: res.snippet || '',
          });
        });

        const peopleAlsoAsk: Array<{ question: string; snippet?: string }> = (json.related_questions || []).map((q: any) => ({
          question: q.question || '',
          snippet: q.snippet || '',
        }));

        const relatedSearches: string[] = (json.related_searches || []).map((r: any) => r.query || r.title || '').filter(Boolean);

        return {
          keyword: cleanKeyword,
          results: organicResults,
          peopleAlsoAsk,
          relatedSearches,
        };
      }
    } catch (err) {
      console.warn('[SeoData] SerpApi query failed, using normalized results:', err);
    }
  }

  // Serper fallback if SerpApi key isn't provided but Serper is
  if (creds.serperKey && cleanKeyword) {
    try {
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': creds.serperKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: cleanKeyword, gl: 'us', hl: 'en' }),
      });
      if (serperRes.ok) {
        const json = await serperRes.json();
        const results = (json.organic || []).map((item: any, idx: number) => ({
          position: item.position || idx + 1,
          title: item.title || '',
          url: item.link || '',
          snippet: item.snippet || '',
        }));
        const peopleAlsoAsk = (json.peopleAlsoAsk || []).map((p: any) => ({
          question: p.question || '',
          snippet: p.snippet || '',
        }));
        const relatedSearches = (json.relatedSearches || []).map((r: any) => r.query || '').filter(Boolean);

        return {
          keyword: cleanKeyword,
          results,
          peopleAlsoAsk,
          relatedSearches,
        };
      }
    } catch (err) {
      console.warn('[SeoData] Serper fallback failed:', err);
    }
  }

  // Clean empty SERP output when live API is unavailable
  return {
    keyword: cleanKeyword,
    results: [],
    peopleAlsoAsk: [],
    relatedSearches: [],
  };
}

/**
 * 5. Google AI Overview citation check (Phase E #1)
 * Endpoint: dataforseo_labs/google/ranked_keywords/live with item_types: ["ai_overview_reference"]
 * Notes: Tells which of the domain's already-ranking keywords are being cited inside Google's AI Overview.
 */
export async function getAiOverviewPresence(
  domain: string,
  locationCode = 2840,
  languageCode = 'en',
  credentials?: SeoClientCredentials
): Promise<AiOverviewPresenceData> {
  const creds = credentials || getSeoApiCredentials();
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase().trim();

  if (creds.dataforseoLogin && creds.dataforseoPassword) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${creds.dataforseoLogin}:${creds.dataforseoPassword}`).toString('base64');
      const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            target: cleanDomain,
            location_code: locationCode,
            language_code: languageCode,
            item_types: ['ai_overview_reference'],
            limit: 100,
          },
        ]),
      });

      if (response.ok) {
        const json = await response.json();
        const items = json?.tasks?.[0]?.result?.[0]?.items || [];
        const citedKeywords = items.map((item: any) => ({
          keyword: item.keyword_data?.keyword || item.keyword || '',
          position: item.ranked_serp_element?.serp_item?.rank_group || item.rank_group || 1,
          url: item.ranked_serp_element?.serp_item?.url || `https://${cleanDomain}`,
          searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
          citedInAiOverview: true,
        }));

        return {
          domain: cleanDomain,
          totalCitations: citedKeywords.length,
          citedKeywords,
        };
      }
    } catch (err) {
      console.warn('[SeoData] DataForSEO AI Overview check failed:', err);
    }
  }

  // Clean empty AI Overview result when live DataForSEO is unavailable
  return {
    domain: cleanDomain,
    totalCitations: 0,
    citedKeywords: [],
  };
}
