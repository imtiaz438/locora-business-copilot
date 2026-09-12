import { ReportSnapshot, ReportType } from '../types/reports';

const LOCAL_STORAGE_KEY_PREFIX = 'locora_report_snapshots_';

/**
 * Loads snapshots for a business from localStorage and backend
 */
export async function getSavedReportSnapshots(businessId: string): Promise<ReportSnapshot[]> {
  const cleanId = (businessId || 'default').trim();
  const localKey = `${LOCAL_STORAGE_KEY_PREFIX}${cleanId}`;

  // 1. Read local storage first for instant rendering
  let localSnapshots: ReportSnapshot[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localSnapshots = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[ReportStorage] Error parsing local snapshots:', err);
  }

  // 2. Try fetching from backend
  try {
    const res = await fetch(`/api/reports/snapshots/${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.snapshots)) {
        // Merge backend snapshots with local ones (unique by id)
        const map = new Map<string, ReportSnapshot>();
        for (const s of localSnapshots) {
          map.set(s.id, s);
        }
        for (const s of data.snapshots) {
          map.set(s.id, s);
        }
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.reportGeneratedAt).getTime() - new Date(a.reportGeneratedAt).getTime()
        );
        try {
          localStorage.setItem(localKey, JSON.stringify(merged));
        } catch {
          // quota ignore
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('[ReportStorage] Backend snapshot fetch error, using local:', err);
  }

  return localSnapshots.sort(
    (a, b) => new Date(b.reportGeneratedAt).getTime() - new Date(a.reportGeneratedAt).getTime()
  );
}

/**
 * Saves an immutable report snapshot.
 * Historical reports remain snapshots — NEVER silently rewritten!
 */
export async function saveReportSnapshot(snapshot: ReportSnapshot): Promise<void> {
  const cleanId = (snapshot.businessId || 'default').trim();
  const localKey = `${LOCAL_STORAGE_KEY_PREFIX}${cleanId}`;

  // 1. Save locally
  try {
    const existing = await getSavedReportSnapshots(cleanId);
    // Add new snapshot at start without overwriting old snapshots
    const updated = [snapshot, ...existing.filter((s) => s.id !== snapshot.id)];
    localStorage.setItem(localKey, JSON.stringify(updated.slice(0, 50))); // Keep up to 50 historical snapshots
  } catch (err) {
    console.warn('[ReportStorage] Error writing local snapshot:', err);
  }

  // 2. Persist to backend database
  try {
    await fetch('/api/reports/snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    });
  } catch (err) {
    console.warn('[ReportStorage] Error syncing snapshot to backend:', err);
  }
}

/**
 * Deletes a snapshot if the user wants to remove an old report
 */
export async function deleteReportSnapshot(businessId: string, reportId: string): Promise<void> {
  const cleanId = (businessId || 'default').trim();
  const localKey = `${LOCAL_STORAGE_KEY_PREFIX}${cleanId}`;

  try {
    const existing = await getSavedReportSnapshots(cleanId);
    const updated = existing.filter((s) => s.id !== reportId);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (err) {
    console.warn('[ReportStorage] Error deleting local snapshot:', err);
  }

  try {
    await fetch(`/api/reports/snapshots/${encodeURIComponent(reportId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('[ReportStorage] Error deleting backend snapshot:', err);
  }
}
