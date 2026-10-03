/**
 * Automated Health Scans — real, scheduled business health evaluation.
 *
 * Every check performs a LIVE verification (website reachability, SSL,
 * connection states from the database, review metrics from stored reviews).
 * A check that cannot run reports 'unknown' — never a fabricated pass/fail.
 *
 * Schedule: Pro = weekly per owned business; Agency = weekly per client business.
 * Free = manual scans only. Regressions trigger an email alert to the owner.
 */
import fs from 'fs';
import path from 'path';
import { db, schema } from '../src/db/index.ts';
import { eq, and, desc } from 'drizzle-orm';

export type HealthCheckStatus = 'pass' | 'warn' | 'fail' | 'unknown';

export interface HealthCheck {
  id: string;
  label: string;
  status: HealthCheckStatus;
  detail: string;
}

export interface HealthScan {
  id: string;
  businessId: string;
  businessName: string;
  ranAt: string;
  triggeredBy: 'scheduled' | 'manual';
  score: number; // 0-100, computed only from checks that actually ran
  checks: HealthCheck[];
  regressions: string[]; // human-readable regression notes vs previous scan
}

const HEALTH_SCANS_FILE = path.resolve(process.cwd(), 'data', 'health-scans.json');
const SCAN_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // weekly
const MANUAL_COOLDOWN_MS = 60 * 60 * 1000; // 1/hour for manual runs

function ensureDataDir() {
  const dir = path.dirname(HEALTH_SCANS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadScans(): HealthScan[] {
  try {
    if (fs.existsSync(HEALTH_SCANS_FILE)) {
      return JSON.parse(fs.readFileSync(HEALTH_SCANS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveScans(scans: HealthScan[]) {
  ensureDataDir();
  // Keep last 26 scans per business (6 months weekly)
  const byBiz = new Map<string, HealthScan[]>();
  for (const s of scans) {
    const arr = byBiz.get(s.businessId) || [];
    arr.push(s);
    byBiz.set(s.businessId, arr);
  }
  const trimmed: HealthScan[] = [];
  for (const arr of byBiz.values()) {
    arr.sort((a, b) => b.ranAt.localeCompare(a.ranAt));
    trimmed.push(...arr.slice(0, 26));
  }
  fs.writeFileSync(HEALTH_SCANS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
}

export function getHealthScans(businessId: string): HealthScan[] {
  return loadScans()
    .filter((s) => s.businessId === businessId)
    .sort((a, b) => b.ranAt.localeCompare(a.ranAt));
}

export function getLastScanAt(businessId: string): string | null {
  const scans = getHealthScans(businessId);
  return scans.length > 0 ? scans[0].ranAt : null;
}

async function checkWebsite(url: string): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];
  if (!url) {
    checks.push({ id: 'site_reachable', label: 'Website reachable', status: 'unknown', detail: 'No website URL on file.' });
    checks.push({ id: 'site_ssl', label: 'SSL certificate', status: 'unknown', detail: 'No website URL on file.' });
    return checks;
  }
  const target = url.startsWith('http') ? url : `https://${url}`;
  const started = Date.now();
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(target, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    clearTimeout(t);
    const ms = Date.now() - started;
    if (res.ok) {
      checks.push({
        id: 'site_reachable', label: 'Website reachable', status: ms > 3000 ? 'warn' : 'pass',
        detail: `HTTP ${res.status} in ${ms}ms${ms > 3000 ? ' (slow)' : ''}.`,
      });
    } else {
      checks.push({ id: 'site_reachable', label: 'Website reachable', status: 'fail', detail: `HTTP ${res.status} in ${ms}ms.` });
    }
    const finalUrl = res.url || target;
    checks.push({
      id: 'site_ssl', label: 'SSL certificate', status: finalUrl.startsWith('https://') ? 'pass' : 'fail',
      detail: finalUrl.startsWith('https://') ? 'Site serves over HTTPS.' : 'Site does not use HTTPS.',
    });
  } catch (e: any) {
    checks.push({ id: 'site_reachable', label: 'Website reachable', status: 'fail', detail: `Fetch failed: ${e.message || 'timeout'}.` });
    checks.push({ id: 'site_ssl', label: 'SSL certificate', status: 'unknown', detail: 'Could not verify (site unreachable).' });
  }
  return checks;
}

async function checkConnections(businessId: string): Promise<HealthCheck[]> {
  try {
    const rows = await db.select().from(schema.dataConnectionsTable).where(eq(schema.dataConnectionsTable.businessId, businessId)).catch(() => []);
    const byProvider = new Map<string, any>(rows.map((r: any) => [r.provider, r.status] as [string, any]));
    const defs: Array<[string, string]> = [
      ['google_gbp', 'Google Business Profile'],
      ['google_search_console', 'Google Search Console'],
      ['google_analytics', 'Google Analytics'],
    ];
    return defs.map(([provider, label]) => {
      const status = byProvider.get(provider);
      if (status === 'connected') {
        return { id: `conn_${provider}`, label: `${label} connected`, status: 'pass' as HealthCheckStatus, detail: 'Connection active in workspace.' };
      }
      if (status === 'error' || status === 'syncing') {
        return { id: `conn_${provider}`, label: `${label} connected`, status: 'warn' as HealthCheckStatus, detail: `Connection state: ${status}.` };
      }
      return { id: `conn_${provider}`, label: `${label} connected`, status: 'unknown' as HealthCheckStatus, detail: 'Not connected — connect it to include in scans.' };
    });
  } catch {
    return [{ id: 'conn_check', label: 'Data connections', status: 'unknown', detail: 'Could not read connection state.' }];
  }
}

async function checkReviews(businessId: string): Promise<HealthCheck> {
  try {
    const rows = await db.select().from(schema.googleReviewsTable).where(eq(schema.googleReviewsTable.businessId, businessId)).catch(() => []);
    const reviews: any[] = rows;
    if (reviews.length === 0) {
      return { id: 'reviews', label: 'Review health', status: 'unknown', detail: 'No synced reviews on file.' };
    }
    const avg = reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length;
    const unanswered = reviews.filter((r: any) => !r.isAnswered && (r.rating || 5) <= 3).length;
    if (avg < 3.5) {
      return { id: 'reviews', label: 'Review health', status: 'fail', detail: `Average rating ${avg.toFixed(1)} across ${reviews.length} reviews.` };
    }
    if (unanswered > 0) {
      return { id: 'reviews', label: 'Review health', status: 'warn', detail: `${unanswered} low-rating review(s) awaiting a reply.` };
    }
    return { id: 'reviews', label: 'Review health', status: 'pass', detail: `Average rating ${avg.toFixed(1)} across ${reviews.length} reviews.` };
  } catch {
    return { id: 'reviews', label: 'Review health', status: 'unknown', detail: 'Could not read review data.' };
  }
}

async function checkKeywords(businessId: string): Promise<HealthCheck> {
  try {
    const rows = await db.select().from(schema.trackedKeywordsTable).where(
      and(eq(schema.trackedKeywordsTable.businessId, businessId), eq(schema.trackedKeywordsTable.isActive, true))
    ).catch(() => []);
    if (rows.length === 0) {
      return { id: 'keywords', label: 'Keyword tracking', status: 'unknown', detail: 'No tracked keywords yet.' };
    }
    return { id: 'keywords', label: 'Keyword tracking', status: 'pass', detail: `${rows.length} active tracked keyword(s).` };
  } catch {
    return { id: 'keywords', label: 'Keyword tracking', status: 'unknown', detail: 'Could not read keyword data.' };
  }
}

function computeScore(checks: HealthCheck[]): number {
  const scored = checks.filter((c) => c.status !== 'unknown');
  if (scored.length === 0) return 0;
  const points: Record<HealthCheckStatus, number> = { pass: 100, warn: 60, fail: 0, unknown: 0 };
  const total = scored.reduce((s, c) => s + points[c.status], 0);
  return Math.round(total / scored.length);
}

export async function runHealthScan(businessId: string, triggeredBy: 'scheduled' | 'manual' = 'manual'): Promise<HealthScan> {
  const bizRows = await db.select().from(schema.businessesTable).where(eq(schema.businessesTable.id, businessId)).limit(1).catch(() => []);
  const biz: any = bizRows[0];
  if (!biz) throw new Error('Business not found.');

  const checks: HealthCheck[] = [
    ...(await checkWebsite(biz.website || '')),
    ...(await checkConnections(businessId)),
    await checkReviews(businessId),
    await checkKeywords(businessId),
  ];

  const score = computeScore(checks);
  const prev = getHealthScans(businessId)[0];

  // Regression detection vs previous scan
  const regressions: string[] = [];
  if (prev) {
    if (prev.score - score >= 10) {
      regressions.push(`Health score dropped from ${prev.score} to ${score}.`);
    }
    for (const c of checks) {
      const old = prev.checks.find((p) => p.id === c.id);
      if (old && old.status !== 'fail' && c.status === 'fail') {
        regressions.push(`"${c.label}" is now failing: ${c.detail}`);
      }
    }
  }

  const scan: HealthScan = {
    id: `hs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    businessId,
    businessName: biz.name,
    ranAt: new Date().toISOString(),
    triggeredBy,
    score,
    checks,
    regressions,
  };

  const all = loadScans();
  all.push(scan);
  saveScans(all);
  return scan;
}

export function isManualScanAllowed(businessId: string): boolean {
  const last = getLastScanAt(businessId);
  if (!last) return true;
  return Date.now() - new Date(last).getTime() >= MANUAL_COOLDOWN_MS;
}

export function isScheduledScanDue(businessId: string): boolean {
  const last = getLastScanAt(businessId);
  if (!last) return true;
  return Date.now() - new Date(last).getTime() >= SCAN_INTERVAL_MS;
}
