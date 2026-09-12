import fs from 'fs';
import path from 'path';
import type { PublicCheckupResult } from '../src/types.ts';

export type PublicAuditStatus =
  | 'queued'
  | 'scanning'
  | 'analyzing'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'expired';

export interface PublicAuditRecord {
  id: string;
  website_url: string;
  normalized_url: string;
  visitor_id?: string;
  user_id?: string | null;
  business_id?: string | null;
  status: PublicAuditStatus;
  started_at: string;
  completed_at?: string | null;
  overall_score: number;
  technical_score: number;
  onpage_score: number;
  local_score: number;
  content_score: number;
  performance_score: number;
  schema_score: number;
  pages_analyzed: number;
  findings: any[];
  discovered_business_data: any;
  data_sources: string[];
  crawler_version: string;
  created_at: string;
  updated_at: string;
  data_age?: string;
  cache_status?: 'live' | 'cached';
  errorMessage?: string;
  fullResult?: PublicCheckupResult;
}

export interface PublicCheckupSettings {
  maxScansPerWindow: number; // e.g. 12
  windowMinutes: number; // e.g. 15
  maxPagesPerScan: number; // e.g. 2
  maxScanDurationMs: number; // e.g. 15000
  maxConcurrentCrawls: number; // e.g. 3
  cooldownSeconds: number; // e.g. 60
  cacheTtlMinutes: number; // e.g. 30
}

const DEFAULT_SETTINGS: PublicCheckupSettings = {
  maxScansPerWindow: 12,
  windowMinutes: 15,
  maxPagesPerScan: 2,
  maxScanDurationMs: 15000,
  maxConcurrentCrawls: 3,
  cooldownSeconds: 60,
  cacheTtlMinutes: 30,
};

let currentSettings: PublicCheckupSettings = { ...DEFAULT_SETTINGS };

const DATA_DIR = path.join(process.cwd(), 'data');
const AUDITS_FILE = path.join(DATA_DIR, 'public_audits.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'public_checkup_settings.json');

const memoryAudits = new Map<string, PublicAuditRecord>();

// Initialize disk storage
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[publicAuditsDb] Could not ensure data directory:', err);
  }
}

function loadPersistedAudits() {
  try {
    ensureDataDir();
    if (fs.existsSync(AUDITS_FILE)) {
      const raw = fs.readFileSync(AUDITS_FILE, 'utf8');
      const parsed: PublicAuditRecord[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((rec) => {
          if (rec && rec.id) {
            memoryAudits.set(rec.id, rec);
          }
        });
      }
    }
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('[publicAuditsDb] Error loading audits from disk:', err);
  }
}

function persistAudits() {
  try {
    ensureDataDir();
    const records = Array.from(memoryAudits.values());
    fs.writeFileSync(AUDITS_FILE, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.warn('[publicAuditsDb] Error persisting audits to disk:', err);
  }
}

function persistSettings() {
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(currentSettings, null, 2), 'utf8');
  } catch (err) {
    console.warn('[publicAuditsDb] Error persisting settings to disk:', err);
  }
}

// Load on startup
loadPersistedAudits();

export function savePublicAuditRecord(record: PublicAuditRecord): PublicAuditRecord {
  record.updated_at = new Date().toISOString();
  memoryAudits.set(record.id, record);
  persistAudits();
  return record;
}

export function getPublicAuditRecord(id: string): PublicAuditRecord | null {
  return memoryAudits.get(id) || null;
}

export function getRecentAuditByNormalizedUrl(
  normalizedUrl: string,
  maxAgeMinutes = currentSettings.cacheTtlMinutes
): PublicAuditRecord | null {
  const norm = normalizedUrl.toLowerCase().trim().replace(/\/+$/, '');
  const now = Date.now();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;

  for (const record of memoryAudits.values()) {
    if (record.status !== 'completed') continue;
    const recNorm = (record.normalized_url || record.website_url).toLowerCase().trim().replace(/\/+$/, '');
    if (recNorm === norm) {
      const completedTime = new Date(record.completed_at || record.created_at).getTime();
      const ageMs = now - completedTime;
      if (ageMs <= maxAgeMs) {
        const minutesAgo = Math.max(1, Math.round(ageMs / (60 * 1000)));
        return {
          ...record,
          cache_status: 'cached',
          data_age: `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`,
        };
      }
    }
  }
  return null;
}

export function claimPublicAuditRecord(
  auditId: string,
  userId: string,
  businessId: string
): PublicAuditRecord | null {
  const record = memoryAudits.get(auditId);
  if (!record) return null;
  record.user_id = userId;
  record.business_id = businessId;
  record.updated_at = new Date().toISOString();
  persistAudits();
  return record;
}

export function listPublicAuditsForUser(userId: string): PublicAuditRecord[] {
  return Array.from(memoryAudits.values()).filter(
    (a) => a.user_id?.toLowerCase() === userId.toLowerCase()
  );
}

export function getPublicCheckupSettings(): PublicCheckupSettings {
  return { ...currentSettings };
}

export function updatePublicCheckupSettings(
  updated: Partial<PublicCheckupSettings>
): PublicCheckupSettings {
  currentSettings = { ...currentSettings, ...updated };
  persistSettings();
  return { ...currentSettings };
}
