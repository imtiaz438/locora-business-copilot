/**
 * Maps Rank Tracking — real SERP-based position monitoring.
 *
 * For each active tracked keyword, queries a live SERP provider (SerpApi,
 * fallback Serper) with the business's location, then matches the business
 * in the Google Maps local pack and organic results. Positions are REAL —
 * when no SERP key is configured or the business isn't found, the snapshot
 * records "not ranked", never an invented position.
 *
 * Metering: 1 SEO lookup unit per keyword per check. Pro: 100/mo, Agency: 500/mo.
 * Schedule: weekly per business (Pro/Agency). Free: no automated tracking.
 */
import { db, schema } from '../src/db/index.ts';
import { eq, and, desc } from 'drizzle-orm';
import { getSerpResults, getSeoApiCredentials } from '../src/lib/seo-data/client.ts';

export interface RankSnapshot {
  keywordId: string;
  keyword: string;
  mapsRank: number | null; // 1-3 in local pack, null = not ranked
  organicRank: number | null; // null = not in top 100
  checkedAt: string;
  provider: string; // 'serpapi' | 'serper' | 'none'
}

export interface RankCheckResult {
  businessId: string;
  checkedAt: string;
  snapshots: RankSnapshot[];
  unitsUsed: number;
  skipped: string[]; // keywords skipped (no SERP key / over quota)
}

const RANK_CHECK_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // weekly

function normalizeName(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function domainOf(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Match the business in the Maps local pack. Returns pack position or null. */
function matchLocalPack(
  localPack: Array<{ position: number; title: string; address?: string }>,
  businessName: string
): number | null {
  const target = normalizeName(businessName);
  if (!target) return null;
  for (const entry of localPack) {
    const name = normalizeName(entry.title);
    if (name && (name.includes(target) || target.includes(name))) {
      return entry.position;
    }
  }
  return null;
}

/** Match the business domain in organic results. Returns position or null. */
function matchOrganic(results: Array<{ position: number; url: string }>, website: string): number | null {
  const target = domainOf(website);
  if (!target) return null;
  for (const r of results) {
    if (domainOf(r.url) === target) return r.position;
  }
  return null;
}

export async function checkBusinessRanks(
  businessId: string,
  opts: { maxKeywords?: number } = {}
): Promise<RankCheckResult> {
  const bizRows = await db.select().from(schema.businessesTable).where(eq(schema.businessesTable.id, businessId)).limit(1).catch(() => []);
  const biz: any = bizRows[0];
  if (!biz) throw new Error('Business not found.');

  const kwRows = await db.select().from(schema.trackedKeywordsTable).where(
    and(eq(schema.trackedKeywordsTable.businessId, businessId), eq(schema.trackedKeywordsTable.isActive, true))
  ).catch(() => []);
  const keywords = (kwRows as any[]).slice(0, opts.maxKeywords || 25);
  if (keywords.length === 0) throw new Error('No active tracked keywords. Add keywords to enable rank tracking.');

  const creds = getSeoApiCredentials();
  const provider = creds.serpApiKey ? 'serpapi' : creds.serperKey ? 'serper' : 'none';
  const location = [biz.city, biz.state, biz.country].filter(Boolean).join(', ') || 'United States';

  const snapshots: RankSnapshot[] = [];
  const skipped: string[] = [];
  const checkedAt = new Date().toISOString();
  const today = checkedAt.split('T')[0];

  for (const kw of keywords) {
    if (provider === 'none') {
      skipped.push(kw.keyword);
      continue;
    }
    try {
      const serp = await getSerpResults(kw.keyword, kw.targetLocation || location);
      const mapsRank = matchLocalPack(serp.localPack || [], biz.name);
      const organicRank = matchOrganic(serp.results || [], biz.website || '');
      const prevRows = await db.select().from(schema.rankSnapshotsTable).where(
        and(
          eq(schema.rankSnapshotsTable.businessId, businessId),
          eq(schema.rankSnapshotsTable.keywordId, kw.id),
          eq(schema.rankSnapshotsTable.searchEngine, 'google_maps_pack')
        )
      ).orderBy(desc(schema.rankSnapshotsTable.snapshotDate)).limit(1).catch(() => []);
      const prevMaps = (prevRows[0] as any)?.rankPosition || null;

      const snap: RankSnapshot = {
        keywordId: kw.id,
        keyword: kw.keyword,
        mapsRank,
        organicRank,
        checkedAt,
        provider,
      };
      snapshots.push(snap);

      // Store both Maps and organic positions as separate honest snapshots.
      const base = {
        id: `rs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        businessId,
        keywordId: kw.id,
        snapshotDate: today,
        device: 'desktop',
      };
      await db.insert(schema.rankSnapshotsTable).values({
        ...base,
        id: `${base.id}_maps`,
        rankPosition: mapsRank || 0,
        previousPosition: prevMaps,
        searchEngine: 'google_maps_pack',
      }).catch(() => {});
      await db.insert(schema.rankSnapshotsTable).values({
        ...base,
        id: `${base.id}_org`,
        rankPosition: organicRank || 0,
        previousPosition: null,
        searchEngine: 'google_organic',
      }).catch(() => {});
    } catch (e: any) {
      skipped.push(`${kw.keyword} (error: ${e.message})`);
    }
  }

  return { businessId, checkedAt, snapshots, unitsUsed: snapshots.length, skipped };
}

export async function getRankHistory(businessId: string, keywordId?: string, limit = 20) {
  const conds = [eq(schema.rankSnapshotsTable.businessId, businessId)];
  if (keywordId) conds.push(eq(schema.rankSnapshotsTable.keywordId, keywordId));
  const rows = await db.select().from(schema.rankSnapshotsTable)
    .where(and(...conds))
    .orderBy(desc(schema.rankSnapshotsTable.snapshotDate))
    .limit(limit)
    .catch(() => []);
  return rows;
}

export function isRankCheckDue(lastCheckAt: string | null): boolean {
  if (!lastCheckAt) return true;
  return Date.now() - new Date(lastCheckAt).getTime() >= RANK_CHECK_INTERVAL_MS;
}

// ---- Server-side SEO unit metering for rank tracking ----
// Pro: 100 units/mo, Agency/Elite: 500/mo. 1 unit = 1 keyword checked.
import fs from 'fs';
import path from 'path';
const RANK_USAGE_FILE = path.resolve(process.cwd(), 'data', 'rank-tracking-usage.json');

function loadRankUsage(): Record<string, { month: string; used: number }> {
  try {
    if (fs.existsSync(RANK_USAGE_FILE)) return JSON.parse(fs.readFileSync(RANK_USAGE_FILE, 'utf-8'));
  } catch {}
  return {};
}

function saveRankUsage(u: Record<string, { month: string; used: number }>) {
  try {
    fs.writeFileSync(RANK_USAGE_FILE, JSON.stringify(u), 'utf-8');
  } catch {}
}

export function checkRankQuota(ownerEmail: string, plan: string, keywords: number): { allowed: boolean; reason?: string } {
  const p = (plan || 'free').toLowerCase();
  if (p === 'free') return { allowed: false, reason: 'Rank tracking requires a Pro or Agency plan.' };
  const limit = p === 'agency' || p === 'elite' ? 500 : 100;
  const month = new Date().toISOString().slice(0, 7);
  const usage = loadRankUsage();
  const rec = usage[ownerEmail];
  const used = rec && rec.month === month ? rec.used : 0;
  if (used + keywords > limit) {
    return { allowed: false, reason: `Monthly rank-tracking quota reached (${used}/${limit} units).` };
  }
  return { allowed: true };
}

export function recordRankUsage(ownerEmail: string, units: number) {
  const month = new Date().toISOString().slice(0, 7);
  const usage = loadRankUsage();
  const rec = usage[ownerEmail];
  const used = rec && rec.month === month ? rec.used : 0;
  usage[ownerEmail] = { month, used: used + units };
  saveRankUsage(usage);
}
