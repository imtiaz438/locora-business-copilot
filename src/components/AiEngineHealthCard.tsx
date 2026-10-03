import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Crown } from 'lucide-react';

interface LaneHealth {
  provider: string;
  lane: 'free' | 'paid';
  keyConfigured: boolean;
  healthy: boolean;
  latencyMs: number | null;
  httpStatus: number | null;
  error: string | null;
  checkedAt: string;
}

interface AiLaneStatus {
  lane: 'free' | 'paid';
  provider: string;
  model: string;
  label: string;
  metering: string;
  health: LaneHealth;
}

/**
 * Read-only AI engine status: which lanes are live, which need a key.
 * Never exposes key values. Health comes from GET /api/ai/health (cached 60s).
 */
export const AiEngineHealthCard: React.FC = () => {
  const [lanes, setLanes] = useState<AiLaneStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/ai/health${refresh ? '?refresh=1' : ''}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.lanes)) {
        setLanes(data.lanes);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600" />
          AI Engine Status
        </h3>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Checking…' : 'Recheck'}
        </button>
      </div>

      {loading && <p className="text-xs text-slate-400">Checking AI providers…</p>}
      {failed && !loading && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Could not reach the AI status service. AI features will report their own errors honestly if unavailable.
        </p>
      )}

      {lanes && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lanes.map((lane) => {
            const h = lane.health;
            const ok = h.healthy;
            return (
              <div key={lane.lane} className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {lane.lane === 'free' ? <Zap className="w-3.5 h-3.5 text-emerald-600" /> : <Crown className="w-3.5 h-3.5 text-amber-500" />}
                    {lane.label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {ok ? '● Live' : h.keyConfigured ? '● Down' : '● No key'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{lane.metering}</p>
                <p className="text-[11px] text-slate-400 font-mono">{lane.model}</p>
                {!ok && (
                  <p className="text-[11px] text-slate-500">
                    {h.keyConfigured
                      ? (h.error || 'Provider is not responding right now.')
                      : lane.lane === 'paid'
                        ? 'Optional. Add a funded Anthropic key to enable Claude.'
                        : 'Add a free Groq API key to enable AI features.'}
                  </p>
                )}
                {ok && h.latencyMs !== null && (
                  <p className="text-[10px] text-slate-400">{h.latencyMs}ms response</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-slate-400">
        The free lane powers every AI feature by default. The paid lane is only used when explicitly selected with a funded key.
      </p>
    </div>
  );
};
