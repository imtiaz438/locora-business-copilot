import {
  getCachedData,
  setCachedData,
  cacheKeys,
  FRESHNESS_WINDOWS,
} from './cache.ts';
import {
  getDomainOverview,
  getBacklinkSummary,
  getKeywordData,
  getSerpResults,
  getAiOverviewPresence,
  resolveLocationCode,
  getSeoApiCredentials,
} from './client.ts';
import {
  NormalizedSeoAudit,
  DomainOverviewData,
  BacklinkSummaryData,
  KeywordItemData,
  SerpOverviewData,
  AiOverviewPresenceData,
  SEO_LOOKUP_COSTS,
} from './types.ts';

export * from './types.ts';
export * from './cache.ts';
export * from './metering.ts';
export * from './client.ts';
export * from './aiVisibility.ts';

/**
 * Domain Overview with 7-Day Caching Layer (Phase B)
 */
export async function getDomainOverviewCached(
  domain: string,
  locationCode = 2840,
  languageCode = 'en',
  forceRefresh = false
): Promise<{ data: DomainOverviewData; fetchedAt: string; isCached: boolean }> {
  const key = cacheKeys.domainOverview(domain, locationCode);

  if (!forceRefresh) {
    const cached = await getCachedData<DomainOverviewData>(key, FRESHNESS_WINDOWS.DOMAIN_OVERVIEW_MS);
    if (cached) {
      return { data: cached.data, fetchedAt: cached.fetchedAt, isCached: true };
    }
  }

  const data = await getDomainOverview(domain, locationCode, languageCode);
  const now = new Date().toISOString();
  await setCachedData(key, data, FRESHNESS_WINDOWS.DOMAIN_OVERVIEW_MS);

  return { data, fetchedAt: now, isCached: false };
}

/**
 * Backlink Summary with 7-Day Caching Layer (Phase B)
 */
export async function getBacklinkSummaryCached(
  domain: string,
  forceRefresh = false
): Promise<{ data: BacklinkSummaryData; fetchedAt: string; isCached: boolean }> {
  const key = cacheKeys.backlinks(domain);

  if (!forceRefresh) {
    const cached = await getCachedData<BacklinkSummaryData>(key, FRESHNESS_WINDOWS.BACKLINK_SUMMARY_MS);
    if (cached) {
      return { data: cached.data, fetchedAt: cached.fetchedAt, isCached: true };
    }
  }

  const data = await getBacklinkSummary(domain);
  const now = new Date().toISOString();
  await setCachedData(key, data, FRESHNESS_WINDOWS.BACKLINK_SUMMARY_MS);

  return { data, fetchedAt: now, isCached: false };
}

/**
 * Keyword Overview with 14-Day Caching Layer (Batch up to 700 keywords) (Phase B)
 */
export async function getKeywordDataCached(
  keywords: string[],
  locationCode = 2840,
  languageCode = 'en',
  forceRefresh = false
): Promise<{ data: KeywordItemData[]; fetchedAt: string; isCached: boolean }> {
  const sortedJoined = [...keywords].sort().join(',');
  const key = cacheKeys.keywords(sortedJoined.slice(0, 100), locationCode);

  if (!forceRefresh) {
    const cached = await getCachedData<KeywordItemData[]>(key, FRESHNESS_WINDOWS.KEYWORDS_MS);
    if (cached) {
      return { data: cached.data, fetchedAt: cached.fetchedAt, isCached: true };
    }
  }

  const data = await getKeywordData(keywords, locationCode, languageCode);
  const now = new Date().toISOString();
  await setCachedData(key, data, FRESHNESS_WINDOWS.KEYWORDS_MS);

  return { data, fetchedAt: now, isCached: false };
}

/**
 * Live SERP Results with 24-Hour Caching Layer (Phase B)
 */
export async function getSerpResultsCached(
  keyword: string,
  location = 'United States',
  locationCode = 2840,
  forceRefresh = false
): Promise<{ data: SerpOverviewData; fetchedAt: string; isCached: boolean }> {
  const key = cacheKeys.serp(keyword, locationCode);

  if (!forceRefresh) {
    const cached = await getCachedData<SerpOverviewData>(key, FRESHNESS_WINDOWS.SERP_MS);
    if (cached) {
      return { data: cached.data, fetchedAt: cached.fetchedAt, isCached: true };
    }
  }

  const data = await getSerpResults(keyword, location);
  const now = new Date().toISOString();
  await setCachedData(key, data, FRESHNESS_WINDOWS.SERP_MS);

  return { data, fetchedAt: now, isCached: false };
}

/**
 * Google AI Overview Presence with 7-Day Caching Layer (Phase B & E)
 */
export async function getAiOverviewPresenceCached(
  domain: string,
  locationCode = 2840,
  languageCode = 'en',
  forceRefresh = false
): Promise<{ data: AiOverviewPresenceData; fetchedAt: string; isCached: boolean }> {
  const key = cacheKeys.aiOverview(domain, locationCode);

  if (!forceRefresh) {
    const cached = await getCachedData<AiOverviewPresenceData>(key, FRESHNESS_WINDOWS.AI_OVERVIEW_MS);
    if (cached) {
      return { data: cached.data, fetchedAt: cached.fetchedAt, isCached: true };
    }
  }

  const data = await getAiOverviewPresence(domain, locationCode, languageCode);
  const now = new Date().toISOString();
  await setCachedData(key, data, FRESHNESS_WINDOWS.AI_OVERVIEW_MS);

  return { data, fetchedAt: now, isCached: false };
}

/**
 * Master Comprehensive SEO Audit Aggregator (Phase D)
 * Normalizes all data types into one clean shape per audit.
 * Accurately reports whether live API calls were executed or served from cache.
 */
export async function performNormalizedSeoAudit(params: {
  domain: string;
  query?: string;
  country?: string;
  suggestedKeywords?: string[];
  forceRefresh?: boolean;
}): Promise<{
  audit: NormalizedSeoAudit;
  cacheMiss: boolean;
  weightedUnitsCost?: number;
}> {
  const cleanDomain = params.domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase().trim();
  const loc = resolveLocationCode(params.country);
  const fullCacheKey = cacheKeys.fullAudit(cleanDomain, loc.location_code);

  // Check full audit cache first
  if (!params.forceRefresh) {
    const cachedFull = await getCachedData<NormalizedSeoAudit>(fullCacheKey, FRESHNESS_WINDOWS.SERP_MS);
    if (cachedFull) {
      return {
        audit: {
          ...cachedFull.data,
          isCached: true,
          fetchedAt: cachedFull.fetchedAt,
        },
        cacheMiss: false,
        weightedUnitsCost: 0,
      };
    }
  }

  // Generate target keywords for batch analysis (up to 700 supported)
  const queryWords = (params.query || `${cleanDomain.split('.')[0]} services`).split(/\s+/).filter(Boolean);
  const kwList = Array.from(
    new Set([
      params.query || cleanDomain,
      `${cleanDomain.split('.')[0]} services`,
      `${cleanDomain.split('.')[0]} reviews`,
      `${cleanDomain.split('.')[0]} pricing`,
      ...(params.suggestedKeywords || []),
      ...queryWords.map(w => `${w} near me`),
    ])
  ).slice(0, 50);

  // Execute sub-fetches in parallel
  const [domainRes, backlinkRes, kwRes, serpRes, aiOverviewRes] = await Promise.all([
    getDomainOverviewCached(cleanDomain, loc.location_code, loc.language_code, params.forceRefresh),
    getBacklinkSummaryCached(cleanDomain, params.forceRefresh),
    getKeywordDataCached(kwList, loc.location_code, loc.language_code, params.forceRefresh),
    getSerpResultsCached(params.query || cleanDomain, params.country || 'United States', loc.location_code, params.forceRefresh),
    getAiOverviewPresenceCached(cleanDomain, loc.location_code, loc.language_code, params.forceRefresh),
  ]);

  const anyMiss = !domainRes.isCached || !backlinkRes.isCached || !kwRes.isCached || !serpRes.isCached || !aiOverviewRes.isCached;

  let weightedUnitsCost = 0;
  if (!domainRes.isCached) weightedUnitsCost += SEO_LOOKUP_COSTS.DOMAIN_OVERVIEW;
  if (!backlinkRes.isCached) weightedUnitsCost += SEO_LOOKUP_COSTS.BACKLINK_SUMMARY;
  if (!kwRes.isCached) weightedUnitsCost += SEO_LOOKUP_COSTS.KEYWORD_BATCH;
  if (!serpRes.isCached) weightedUnitsCost += SEO_LOOKUP_COSTS.SERP_CHECK_PER_KEYWORD;
  if (!aiOverviewRes.isCached) weightedUnitsCost += SEO_LOOKUP_COSTS.AI_OVERVIEW_CHECK;

  const now = new Date().toISOString();
  const creds = getSeoApiCredentials();
  const hasKeys = Boolean((creds.dataforseoLogin && creds.dataforseoPassword) || creds.serpApiKey || creds.serperKey);

  let provider_status: 'success' | 'not_configured' | 'authentication_error' | 'quota_exceeded' | 'unavailable' | 'connected_no_data' = 'not_configured';
  let providerStatusMessage = 'API credentials for DataForSEO or SerpApi are not configured. Connect your keys in Settings to stream live metrics.';

  if (hasKeys) {
    const hasData = kwRes.data.length > 0 || domainRes.data.estimatedTraffic > 0 || backlinkRes.data.total > 0 || serpRes.data.results.length > 0;
    if (hasData) {
      provider_status = 'success';
      providerStatusMessage = 'Live SEO intelligence retrieved and normalized from provider.';
    } else {
      provider_status = 'connected_no_data';
      providerStatusMessage = 'Connected to SEO provider, but no indexed keywords or backlink records were found for this domain.';
    }
  }

  const audit: NormalizedSeoAudit = {
    domainOverview: domainRes.data,
    backlinks: backlinkRes.data,
    keywords: kwRes.data,
    serp: serpRes.data.results.map(r => ({ keyword: serpRes.data.keyword, position: r.position, url: r.url })),
    serpDetails: serpRes.data,
    aiOverview: aiOverviewRes.data,
    fetchedAt: anyMiss ? now : domainRes.fetchedAt,
    provider: 'dataforseo',
    provider_status,
    providerStatusMessage,
    attribution: 'Powered by DataForSEO & SerpApi',
    isCached: !anyMiss,
    refreshCooldownUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  // Cache the combined audit object
  await setCachedData(fullCacheKey, audit, FRESHNESS_WINDOWS.SERP_MS);

  return {
    audit,
    cacheMiss: anyMiss,
    weightedUnitsCost,
  };
}
