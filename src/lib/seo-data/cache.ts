import { getSeoDataCache, saveSeoDataCache } from '../../db/service.ts';
import { FRESHNESS_WINDOWS } from './types.ts';

// In-memory fallback map (handles transient DB disconnects and ultra-fast reads)
const memoryCache = new Map<string, { payload: any; fetchedAt: string; expiresAt: number }>();

/**
 * Checks cache table first before any provider call.
 * If fresh-enough row exists, returns it (zero API calls, zero credits consumed).
 */
export async function getCachedData<T>(cacheKey: string, freshnessMs: number): Promise<{ data: T; fetchedAt: string } | null> {
  const now = Date.now();

  // 1. Check memory cache first
  const mem = memoryCache.get(cacheKey);
  if (mem) {
    if (now < mem.expiresAt) {
      return {
        data: mem.payload as T,
        fetchedAt: mem.fetchedAt,
      };
    } else {
      memoryCache.delete(cacheKey);
    }
  }

  // 2. Check Database Cache table: seo_data_cache
  try {
    const row = await getSeoDataCache(cacheKey);
    if (row && row.payload) {
      const fetchedTime = new Date(row.fetchedAt).getTime();
      const expiresTime = new Date(row.expiresAt).getTime();

      // Ensure it is within the specified freshness window
      if (now - fetchedTime < freshnessMs && now < expiresTime) {
        // Sync back to memory cache
        memoryCache.set(cacheKey, {
          payload: row.payload,
          fetchedAt: new Date(row.fetchedAt).toISOString(),
          expiresAt: expiresTime,
        });

        return {
          data: row.payload as T,
          fetchedAt: new Date(row.fetchedAt).toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn(`[SeoCache] DB cache read error for key ${cacheKey}:`, err);
  }

  return null;
}

/**
 * Stores normalized data into seo_data_cache table and memory cache.
 */
export async function setCachedData<T>(cacheKey: string, payload: T, ttlMs: number): Promise<void> {
  const now = new Date();
  const expiresAtMs = Date.now() + ttlMs;

  // Save to memory
  memoryCache.set(cacheKey, {
    payload,
    fetchedAt: now.toISOString(),
    expiresAt: expiresAtMs,
  });

  // Save to Database
  try {
    await saveSeoDataCache(cacheKey, payload, ttlMs);
  } catch (err) {
    console.warn(`[SeoCache] DB cache write error for key ${cacheKey}:`, err);
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  domainOverview: (domain: string, locationCode = 2840) =>
    `domain:${domain.toLowerCase().trim()}:overview:${locationCode}`,
  backlinks: (domain: string) =>
    `backlinks:${domain.toLowerCase().trim()}:summary`,
  keywords: (keywordsHashOrJoined: string, locationCode = 2840) =>
    `keywords:${locationCode}:${keywordsHashOrJoined.toLowerCase().trim()}`,
  serp: (keyword: string, locationCode = 2840) =>
    `serp:${locationCode}:${keyword.toLowerCase().trim()}`,
  aiOverview: (domain: string, locationCode = 2840) =>
    `ai_overview:${domain.toLowerCase().trim()}:${locationCode}`,
  fullAudit: (domain: string, locationCode = 2840) =>
    `full_audit:${domain.toLowerCase().trim()}:${locationCode}`,
};

/**
 * Clears in-memory SEO cache entries (optionally filtered by domain substring).
 */
export function clearSeoCache(domainSubstring?: string): void {
  if (!domainSubstring) {
    memoryCache.clear();
    return;
  }
  const clean = domainSubstring.toLowerCase().trim();
  for (const key of memoryCache.keys()) {
    if (key.includes(clean)) {
      memoryCache.delete(key);
    }
  }
}

export { FRESHNESS_WINDOWS };
