/**
 * HealthScansCard — displays automated health scan history for a business.
 * Scans run weekly on Pro/Agency (server scheduler); Free users can run manual scans.
 * Every check shown is a real live verification — never fabricated.
 */
import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, XCircle, HelpCircle, ChevronDown } from 'lucide-react';

interface HealthCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail' | 'unknown';
  detail: string;
}

interface HealthScan {
  id: string;
  businessId: string;
  businessName: string;
  ranAt: string;
  triggeredBy: 'scheduled' | 'manual';
  score: number;
  checks: HealthCheck[];
  regressions: string[];
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  pass: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  warn: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  fail: <XCircle className="w-4 h-4 text-red-500" />,
  unknown: <HelpCircle className="w-4 h-4 text-slate-400" />,
};

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

export const HealthScansCard: React.FC<{ businessId: string; businessName: string }> = ({ businessId, businessName }) => {
  const [scans, setScans] = useState<HealthScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/health-scans/${businessId}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setScans(data.scans || []);
      } else {
        setError(data.error || 'Could not load health scans.');
      }
    } catch {
      setError('Could not load health scans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  const runNow = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/health-scans/${businessId}/run`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.scan) {
        await load();
      } else {
        setError(data.error || 'Health scan failed.');
      }
    } catch {
      setError('Health scan failed.');
    } finally {
      setRunning(false);
    }
  };

  const latest = scans[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900">Automated Health Scans</h3>
        </div>
        <button
          type="button"
          onClick={runNow}
          disabled={running}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Scanning...' : 'Run Scan Now'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading scan history...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !latest ? (
        <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">
          <p className="font-semibold mb-1">No scans yet for {businessName}.</p>
          <p>Pro and Agency workspaces get a free automated health scan every week — website reachability, SSL, data connections, review health, and keyword tracking, all live-verified. Run your first scan now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
            <div className={`text-4xl font-bold ${scoreColor(latest.score)}`}>{latest.score}</div>
            <div className="text-sm">
              <p className="font-bold text-slate-900">Latest scan</p>
              <p className="text-slate-500">
                {new Date(latest.ranAt).toLocaleString()} · {latest.triggeredBy === 'scheduled' ? 'Automated (weekly)' : 'Manual'}
              </p>
              {latest.regressions.length > 0 && (
                <p className="text-red-600 font-semibold mt-1">⚠️ {latest.regressions.length} regression(s) detected</p>
              )}
            </div>
          </div>

          {scans.slice(0, 5).map((scan) => (
            <div key={scan.id} className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(expanded === scan.id ? null : scan.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 text-sm">
                  <span className={`font-bold ${scoreColor(scan.score)}`}>{scan.score}</span>
                  <span className="text-slate-600">{new Date(scan.ranAt).toLocaleDateString()}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {scan.triggeredBy === 'scheduled' ? 'Auto' : 'Manual'}
                  </span>
                  {scan.regressions.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                      {scan.regressions.length} regression(s)
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded === scan.id ? 'rotate-180' : ''}`} />
              </button>
              {expanded === scan.id && (
                <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
                  {scan.regressions.map((r, i) => (
                    <p key={i} className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 font-medium">⚠️ {r}</p>
                  ))}
                  {scan.checks.map((c) => (
                    <div key={c.id} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 shrink-0">{STATUS_ICON[c.status]}</span>
                      <div>
                        <span className="font-bold text-slate-800">{c.label}</span>
                        <span className="text-slate-500"> — {c.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <p className="text-[11px] text-slate-400">
            Every check is live-verified at scan time. "Unknown" means the check couldn't run (e.g. not connected) — never guessed.
          </p>
        </div>
      )}
    </div>
  );
};
