import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ProviderStatusDisplay } from './ProviderStatusDisplay.tsx';
import type { ProviderStatus } from '../types.ts';
import {
  Bot,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  RefreshCw,
  Search,
  EyeOff,
  Sliders,
  Building2,
  FileText
} from 'lucide-react';
import type { AiVisibilityObservation } from '../lib/seo-data/types.ts';

interface AiVisibilityObservationsPanelProps {
  userEmail?: string;
  businessProfile?: {
    id?: string;
    name: string;
    industry?: string;
    city?: string;
    state?: string;
    competitors?: string[];
  };
  onRunComplete?: (results: any) => void;
  className?: string;
}

export const AiVisibilityObservationsPanel: React.FC<AiVisibilityObservationsPanelProps> = ({
  userEmail = '',
  businessProfile,
  onRunComplete,
  className = '',
}) => {
  const { setActiveTab } = useApp();
  const [observations, setObservations] = useState<AiVisibilityObservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRunningAudit, setIsRunningAudit] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [providerStatusMessage, setProviderStatusMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [runStats, setRunStats] = useState<{ used?: number; limit?: number; remaining?: number } | null>(null);

  const activeEmail = (userEmail || '').toLowerCase().trim();
  const effectiveBusinessName = businessProfile?.name || 'Your Business';
  const effectiveLocation = [businessProfile?.city, businessProfile?.state].filter(Boolean).join(', ') || 'Local Market';

  const fetchObservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = activeEmail
        ? `/api/seo/ai-visibility/history?userEmail=${encodeURIComponent(activeEmail)}`
        : '/api/seo/ai-visibility/history';
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setObservations(data.history);
        } else {
          setObservations([]);
        }
      } else {
        setObservations([]);
      }
    } catch (err: any) {
      console.warn('[AiVisibility] Failed to fetch observation history:', err);
      setObservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeEmail]);

  useEffect(() => {
    fetchObservations();
  }, [fetchObservations]);

  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    setError(null);
    try {
      const payload = {
        userEmail: activeEmail || '',
        businessProfile: {
          id: businessProfile?.id,
          name: effectiveBusinessName,
          industry: businessProfile?.industry || 'Local Services',
          city: businessProfile?.city || '',
          state: businessProfile?.state || '',
          competitors: businessProfile?.competitors || [],
        },
      };

      const res = await fetch('/api/seo/ai-visibility/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          res.status === 504 || res.status === 408
            ? 'The live AI audit query timed out while querying models. Please try again in a few moments.'
            : `AI Service temporary response (${res.status}): ${text.slice(0, 120)}`
        );
      }

      if (!res.ok) {
        if (data?.provider_status) {
          setProviderStatus(data.provider_status);
          setProviderStatusMessage(data.providerStatusMessage || data.error);
        } else if (res.status === 401 || res.status === 403) {
          setProviderStatus('authentication_error');
          setProviderStatusMessage(data?.message || 'Authentication error or AI runs limit reached.');
        } else if (res.status === 429) {
          setProviderStatus('quota_exceeded');
          setProviderStatusMessage(data?.message || 'Rate limit exceeded for AI provider.');
        } else {
          setProviderStatus('unavailable');
          setProviderStatusMessage(data?.message || data?.error || 'AI Visibility Service temporarily unavailable.');
        }
        throw new Error(data?.message || data?.error || 'Failed to execute AI visibility audit');
      }

      if (data.success) {
        if (data.provider_status) {
          setProviderStatus(data.provider_status);
          setProviderStatusMessage(data.providerStatusMessage || null);
        } else {
          setProviderStatus('success');
          setProviderStatusMessage(null);
        }
        if (Array.isArray(data.checks) && data.checks.length > 0) {
          setObservations((prev) => {
            const map = new Map<string, AiVisibilityObservation>();
            data.checks.forEach((c: AiVisibilityObservation) => map.set(c.id, c));
            prev.forEach((c) => {
              if (!map.has(c.id)) map.set(c.id, c);
            });
            return Array.from(map.values());
          });
        } else if (data.message) {
          setError(data.message);
        }
        if (data.aiVisibilityRunsUsed !== undefined) {
          setRunStats({
            used: data.aiVisibilityRunsUsed,
            limit: data.aiVisibilityRunsLimit,
            remaining: data.aiVisibilityRunsRemaining,
          });
        }
        if (onRunComplete) {
          onRunComplete(data);
        }
        await fetchObservations();
      }
    } catch (err: any) {
      setError(err.message || 'Could not complete AI visibility audit.');
      if (!providerStatus || providerStatus === 'success') {
        setProviderStatus('unavailable');
        setProviderStatusMessage(err.message || 'Could not complete AI visibility audit.');
      }
    } finally {
      setIsRunningAudit(false);
    }
  };

  const filteredObservations = observations.filter((obs) => {
    if (filterProvider === 'all') return true;
    return obs.provider.toLowerCase() === filterProvider.toLowerCase();
  });

  // Calculate actual observed empirical metrics
  const totalObsCount = observations.length;
  const mentionsCount = observations.filter((o) => o.business_mentioned).length;
  const mentionPercentage = totalObsCount > 0 ? Math.round((mentionsCount / totalObsCount) * 100) : null;

  // Average position among mentioned rankings
  const rankedItems = observations.filter((o) => o.business_mentioned && typeof o.position === 'number');
  const avgPosition = rankedItems.length > 0
    ? (rankedItems.reduce((acc, curr) => acc + (curr.position || 0), 0) / rankedItems.length).toFixed(1)
    : null;

  // All unique competitors mentioned
  const allCompetitors = Array.from(
    new Set(observations.flatMap((o) => o.competitors_mentioned || []))
  ).filter(Boolean);

  // All unique citation sources
  const allCitations = Array.from(
    new Set(observations.flatMap((o) => o.citation_sources || []))
  ).filter(Boolean);

  const getProviderBadge = (provider: string) => {
    const prov = (provider || '').toLowerCase();
    switch (prov) {
      case 'gemini':
        return { name: 'Google Gemini', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'openai':
        return { name: 'ChatGPT (OpenAI)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'anthropic':
        return { name: 'Claude (Anthropic)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'perplexity':
        return { name: 'Perplexity AI', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      case 'groq':
        return { name: 'Groq (Llama)', color: 'bg-orange-50 text-orange-800 border-orange-200' };
      default:
        return { name: provider.toUpperCase(), color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Empirical Standards Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#059669]" />
              <h3 className="text-base font-bold font-heading text-slate-900">
                Grounded AI Visibility Monitoring
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Tracks actual queries across frontier LLMs (Gemini, ChatGPT, Claude, Perplexity).
              Metrics are strictly computed from recorded provider responses.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {runStats && (
              <div className="text-right text-xs hidden sm:block">
                <div className="text-slate-400 font-medium">Monthly Runs</div>
                <div className="font-bold text-slate-800">
                  {runStats.used || 0} / {runStats.limit || 1}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isRunningAudit}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isRunningAudit ? 'animate-spin' : ''}`} />
              <span>{isRunningAudit ? 'Querying AI Providers...' : 'Query AI Providers Now'}</span>
            </button>
          </div>
        </div>

        {/* Empirical Transparency Notice */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="text-slate-800 block">Empirical Verification Standard:</strong>
            <span>
              AI Visibility is never fabricated. A metric is only presented if Locora has successfully queried an AI provider and recorded the full observation.
            </span>
          </div>
        </div>

        {providerStatus && providerStatus !== 'success' && (
          <div className="pt-2">
            <ProviderStatusDisplay
              status={providerStatus}
              providerName="AI Visibility Monitoring (Gemini / Perplexity / Search Index)"
              customMessage={providerStatusMessage || error || undefined}
              onConfigureClick={() => setActiveTab('settings')}
              onRetryClick={handleRunAudit}
            />
          </div>
        )}

        {error && (!providerStatus || providerStatus === 'success') && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* STATE 1: NO OBSERVATIONS EXIST (Mandated Requirement) */}
      {!isLoading && totalObsCount === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 mx-auto flex items-center justify-center text-amber-600">
            <EyeOff className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-xl font-black font-heading text-slate-900">
              AI visibility monitoring has not been run yet.
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Locora will not display simulated percentages, synthetic visibility scores, or fake citations for {effectiveBusinessName}.
              Execute a real multi-model query to inspect how generative AI engines recommend your business.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-left text-xs space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
              Required Fields Stored For Every Observation:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 font-mono text-[11px]">
              <span className="p-1.5 bg-white border border-slate-200 rounded">query</span>
              <span className="p-1.5 bg-white border border-slate-200 rounded">date</span>
              <span className="p-1.5 bg-white border border-slate-200 rounded">location</span>
              <span className="p-1.5 bg-white border border-slate-200 rounded">provider</span>
              <span className="p-1.5 bg-white border border-slate-200 rounded">business_mentioned</span>
              <span className="p-1.5 bg-white border border-slate-200 rounded">position</span>
              <span className="p-1.5 bg-white border border-slate-200 rounded">competitors_mentioned</span>
              <span className="p-1.5 bg-white border border-slate-200 rounded">citation_sources</span>
              <span className="p-1.5 bg-white border border-slate-200 rounded">raw_observation</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isRunningAudit}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isRunningAudit ? 'Executing Real AI Queries...' : 'Run First Live AI Visibility Check'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: LOADING */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#059669]" />
          <p className="text-xs font-medium text-slate-600">Loading verified AI visibility observations...</p>
        </div>
      )}

      {/* STATE 3: OBSERVATIONS EXIST -> Grounded Metrics & Full Observation Log */}
      {!isLoading && totalObsCount > 0 && (
        <div className="space-y-6">
          {/* Grounded Summary Cards (Strictly Real Observations) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Mention Rate */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Observed Mention Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-heading text-slate-900">
                  {mentionPercentage}%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({mentionsCount}/{totalObsCount} queries)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Mentioned in {mentionsCount} of {totalObsCount} recorded provider observations
              </p>
            </div>

            {/* 2. Recommendation Position */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Avg Observed Rank
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-heading text-[#059669]">
                  {avgPosition ? `#${avgPosition}` : 'Unranked'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                {rankedItems.length > 0
                  ? `Based on ${rankedItems.length} numbered recommendations`
                  : 'Mentioned generally without explicit numerical list order'}
              </p>
            </div>

            {/* 3. Citations Discovered */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Cited Sources
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-heading text-blue-700">
                  {allCitations.length}
                </span>
                <span className="text-xs text-slate-500">domains</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Distinct authority citations referenced by AI answers
              </p>
            </div>

            {/* 4. Competitors Observed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Competitors Identified
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-heading text-amber-700">
                  {allCompetitors.length}
                </span>
                <span className="text-xs text-slate-500">brands</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Other local businesses recommended in same query prompts
              </p>
            </div>
          </div>

          {/* Observations Filter Bar & Table Header */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#059669]" />
                  <span>Recorded Provider Observations ({filteredObservations.length})</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full empirical records including query, date, location, provider, position, competitors, citations, and raw observation text.
                </p>
              </div>

              {/* Provider Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['all', 'gemini', 'openai', 'anthropic', 'perplexity'].map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setFilterProvider(prov)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      filterProvider === prov
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {prov === 'all' ? 'All Models' : prov.charAt(0).toUpperCase() + prov.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Observation Cards */}
            <div className="space-y-4">
              {filteredObservations.map((obs) => {
                const badge = getProviderBadge(obs.provider);
                const isExpanded = expandedId === obs.id;
                const formattedDate = new Date(obs.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={obs.id}
                    id={`obs-${obs.id}`}
                    className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all bg-slate-50/30 space-y-3"
                  >
                    {/* Top Row: Provider, Query, Date, Mention Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badge.color}`}>
                          {badge.name}
                        </span>

                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formattedDate}</span>
                        </span>

                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{obs.location || effectiveLocation}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {obs.business_mentioned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mentioned {obs.position ? `(#${obs.position})` : ''}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Not Mentioned</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Query Prompt Field */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Query Sent:
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        &ldquo;{obs.query}&rdquo;
                      </p>
                    </div>

                    {/* Meta Row: Competitors & Citations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Competitors Mentioned */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Competitors Mentioned ({obs.competitors_mentioned?.length || 0}):
                        </span>
                        {(obs.competitors_mentioned && obs.competitors_mentioned.length > 0) ? (
                          <div className="flex flex-wrap gap-1.5">
                            {obs.competitors_mentioned.map((comp, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No other specific local competitors listed</span>
                        )}
                      </div>

                      {/* Citation Sources */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Citation Sources ({obs.citation_sources?.length || 0}):
                        </span>
                        {(obs.citation_sources && obs.citation_sources.length > 0) ? (
                          <div className="flex flex-wrap gap-1.5">
                            {obs.citation_sources.map((src, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] font-mono border border-blue-200"
                              >
                                {src}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No explicit external citation domains cited</span>
                        )}
                      </div>
                    </div>

                    {/* Raw Observation Toggle & Box */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : obs.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{isExpanded ? 'Hide Raw AI Provider Output' : 'Inspect Raw AI Observation Output'}</span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto border border-slate-800">
                          {obs.raw_observation || 'No raw observation text available.'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
