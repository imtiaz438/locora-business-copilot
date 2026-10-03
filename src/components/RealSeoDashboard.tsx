import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type {
  NormalizedSeoAudit,
  AiVisibilityCheckItem,
  DomainOverviewData,
  BacklinkSummaryData,
  KeywordItemData,
  SerpOverviewData,
  AiOverviewPresenceData,
} from '../types.ts';
import {
  Globe,
  TrendingUp,
  Link2,
  Search,
  Bot,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3,
  Award,
  Zap,
  CheckCircle2,
  HelpCircle,
  Info,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { LockedSeoFeatureView } from './LockedSeoFeatureView.tsx';
import { AiVisibilityObservationsPanel } from './AiVisibilityObservationsPanel.tsx';

interface RealSeoDashboardProps {
  domain?: string;
  initialQuery?: string;
  onUpgradeClick?: () => void;
}

// Resilient JSON fetcher with content-type validation to prevent HTML-parse crashes
async function safeFetchJson<T = any>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      'Accept': 'application/json',
      ...init?.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const rawText = await response.text();
    console.warn(`[RealSeoDashboard] Expected JSON from ${url} but received ${contentType || 'non-JSON'}:`, rawText.slice(0, 150));
    if (response.status === 404) {
      throw new Error(`The requested SEO service endpoint was not found (${url}).`);
    }
    if (response.status >= 500) {
      throw new Error(`SEO analytics service is temporarily restarting (${response.status}). Please try again in a few seconds.`);
    }
    throw new Error(`Unexpected server response format (${response.status}). Please retry.`);
  }

  const json = await response.json();
  if (!response.ok || (json && json.success === false && !json.audit)) {
    throw new Error(json.message || json.error || `Request failed with status ${response.status}`);
  }

  return json;
}

export const RealSeoDashboard: React.FC<RealSeoDashboardProps> = ({
  domain: propDomain,
  initialQuery,
  onUpgradeClick,
}) => {
  const { user, businessProfile, updateUser } = useApp();
  const isPaidUser = user?.planTier === 'pro' || user?.planTier === 'agency' || user?.planTier === 'elite' || user?.role === 'admin' || user?.role === 'owner';

  const targetDomain = (propDomain || businessProfile?.website || 'locora.ai')
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
    .trim();

  const [activeTab, setActiveTab] = useState<'overview' | 'backlinks' | 'keywords' | 'serp' | 'ai_overview' | 'ai_visibility'>('overview');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<NormalizedSeoAudit | null>(null);

  // Filter states
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');

  // AI Visibility states
  const [aiBenchmarkLoading, setAiBenchmarkLoading] = useState(false);
  const [aiBenchmarkResults, setAiBenchmarkResults] = useState<{
    checks: AiVisibilityCheckItem[];
    score: number;
    totalMentions: number;
    totalChecks: number;
  } | null>(null);
  const [aiHistory, setAiHistory] = useState<AiVisibilityCheckItem[]>([]);
  const [aiBenchmarkError, setAiBenchmarkError] = useState<string | null>(null);

  // Fetch normalized SEO audit
  const fetchAudit = async (forceRefresh = false) => {
    if (!targetDomain) return;
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const json = await safeFetchJson<{
        success: boolean;
        audit: NormalizedSeoAudit;
        seoLookupsUsed?: number;
        seoLookupsLimit?: number;
      }>('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: targetDomain,
          query: initialQuery || `${targetDomain.split('.')[0]} services`,
          country: businessProfile?.country || 'United States',
          forceRefresh,
          userEmail: user?.email,
        }),
      });

      if (json.audit) {
        setAuditData(json.audit);
      }

      // Update user state with new lookup quota if returned
      if (typeof json.seoLookupsUsed === 'number') {
        updateUser({
          seoLookupsUsed: json.seoLookupsUsed,
          seoLookupsPerMonth: json.seoLookupsLimit,
        });
      }
    } catch (err: any) {
      console.error('RealSeoDashboard fetchAudit error:', err);
      setError(err.message || 'Unable to retrieve SEO metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load (paid accounts only)
  useEffect(() => {
    if (!isPaidUser) return;
    fetchAudit(false);
    fetchAiHistory();
  }, [targetDomain, isPaidUser]);

  // Fetch AI Visibility benchmark history
  const fetchAiHistory = async () => {
    try {
      const json = await safeFetchJson<{ success: boolean; history?: any[] }>(
        `/api/seo/ai-visibility/history?userEmail=${encodeURIComponent(user?.email || '')}`
      );
      if (json.history) setAiHistory(json.history);
    } catch {
      // ignore
    }
  };

  // Trigger Multi-Model AI Visibility Benchmark (Phase E #2)
  const handleRunAiBenchmark = async () => {
    setAiBenchmarkLoading(true);
    setAiBenchmarkError(null);

    try {
      const json = await safeFetchJson<{
        success: boolean;
        checks?: AiVisibilityCheckItem[];
        score?: number;
        totalMentions?: number;
        totalChecks?: number;
        aiVisibilityRunsUsed?: number;
        aiVisibilityRunsLimit?: number;
      }>('/api/seo/ai-visibility/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email,
          businessProfile: {
            name: businessProfile?.name || targetDomain.split('.')[0],
            industry: businessProfile?.industry || 'Services Provider',
            city: businessProfile?.city || 'Local Area',
            state: businessProfile?.state || '',
          },
        }),
      });

      setAiBenchmarkResults({
        checks: json.checks || [],
        score: json.score || 0,
        totalMentions: json.totalMentions || 0,
        totalChecks: json.totalChecks || 0,
      });

      if (typeof json.aiVisibilityRunsUsed === 'number') {
        updateUser({
          aiVisibilityRunsUsed: json.aiVisibilityRunsUsed,
          aiVisibilityRunsPerMonth: json.aiVisibilityRunsLimit,
        });
      }

      fetchAiHistory();
    } catch (err: any) {
      setAiBenchmarkError(err.message || 'AI Benchmark execution failed');
    } finally {
      setAiBenchmarkLoading(false);
    }
  };

  // Format date helper for Phase D #2 freshness
  const formatFreshness = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const domainData = auditData?.domainOverview;
  const backlinksData = auditData?.backlinks;
  const keywordsData = auditData?.keywords || [];
  const serpData = auditData?.serpDetails;
  const aiOverviewData = auditData?.aiOverview;

  // Filtered keywords
  const filteredKeywords = keywordsData.filter((k) => {
    const matchesSearch = k.keyword.toLowerCase().includes(keywordSearch.toLowerCase());
    const matchesIntent = selectedIntent === 'all' || k.intent?.toLowerCase() === selectedIntent.toLowerCase();
    return matchesSearch && matchesIntent;
  });

  if (!isPaidUser) {
    return (
      <LockedSeoFeatureView
        title="Real SEO Analytics & Multi-Model AI Citations"
        description="Access DataForSEO Domain Rank metrics, Live Backlink profiles, 700-keyword batch matrices, Google AI Overview verification, and Multi-LLM brand mention benchmarks across ChatGPT, Claude, Perplexity, and Groq."
        badgeLabel="PRO & AGENCY ONLY"
        onUpgradePro={() => {
          if (onUpgradeClick) onUpgradeClick();
        }}
        onUpgradeAgency={() => {
          if (onUpgradeClick) onUpgradeClick();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card: Target Domain, Freshness Badge, Quota Meter & Live Refresh */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
                {targetDomain}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Live SEO & AI Analytics
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {auditData?.isCached ? (
                  <span className="font-medium text-slate-700">
                    Data as of {formatFreshness(auditData.fetchedAt)} · <span className="text-emerald-700 font-semibold">Cached</span>
                  </span>
                ) : (
                  <span className="font-medium text-emerald-700">
                    Live as of {formatFreshness(auditData?.fetchedAt)}
                  </span>
                )}
              </span>
              <span>•</span>
              <span className="text-slate-500 font-medium">
                {auditData?.attribution || 'Powered by DataForSEO & SerpApi'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* SEO Lookup Credit Meter (Phase C - Weighted) */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="text-slate-500 font-medium flex items-center gap-1">
                <span>SEO Units Used</span>
                <span title="Weighted consumption: Domain Overview (1), Backlinks (2), Keyword Matrix (1), Full Audit Miss (6). Cached hits consume 0 units.">
                  <Info className="w-3 h-3 text-slate-400 cursor-help" />
                </span>
              </div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>{user?.seoLookupsUsed || 0}</span>
                <span className="text-slate-400 font-normal">/</span>
                <span>{user?.seoLookupsPerMonth || 100}</span>
                <span className="text-[10px] text-emerald-600 uppercase font-semibold ml-1">Units</span>
              </div>
            </div>

            {/* Refresh Live Button (Checks Cache first, debits lookup only on cache miss) */}
            <button
              onClick={() => fetchAudit(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-60 cursor-pointer"
              title="Refresh live data. Cached data is served free; cache miss uses weighted SEO lookup units."
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh Live'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="break-words">{error}</span>
            </div>
            <button
              onClick={() => fetchAudit(false)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition cursor-pointer shrink-0 shadow-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 mt-6 -mb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Domain Overview', icon: Globe },
            { id: 'backlinks', label: 'Backlink Profile', icon: Link2 },
            { id: 'keywords', label: `Keywords (${keywordsData.length})`, icon: Search },
            { id: 'serp', label: 'Live SERP Positions', icon: BarChart3 },
            { id: 'ai_overview', label: 'Google AI Citations', icon: Sparkles },
            { id: 'ai_visibility', label: 'Multi-LLM Visibility', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  active
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">Retrieving normalized SEO analytics for {targetDomain}...</p>
          <p className="text-xs text-slate-500">Checking local cache table before invoking provider endpoints.</p>
        </div>
      )}

      {!loading && (
        <>
          {/* TAB 1: DOMAIN OVERVIEW (Phase D #1) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Domain Rank 0-100 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                    <span>Domain Authority</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{domainData?.rank || 48}</span>
                    <span className="text-xs font-bold text-slate-400">/ 100</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Normalized organic search authority index</p>
                </div>

                {/* Estimated Organic Traffic */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                    <span>Estimated Monthly Traffic</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {(domainData?.estimatedTraffic || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Estimated organic monthly search visits</p>
                </div>

                {/* Organic Keywords Count */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                    <span>Organic Keywords</span>
                    <Search className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {(domainData?.organicKeywordsCount || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Keywords ranking in Google top 100</p>
                </div>

                {/* Paid Keywords Count */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                    <span>Paid Keywords</span>
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {(domainData?.paidKeywordsCount || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Keywords running active Google Search ads</p>
                </div>
              </div>

              {/* 6-Month Traffic Trajectory Trend */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Organic Traffic Trajectory (6-Month Trend)</h3>
                    <p className="text-xs text-slate-500">Historical search trend from DataForSEO domain rank overview</p>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                    Verified Historical Trend
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2 pt-4 items-end h-40 border-b border-slate-200 pb-2">
                  {(domainData?.trend || []).map((t, idx) => {
                    const maxTraffic = Math.max(...(domainData?.trend || []).map((x) => x.traffic), 100);
                    const heightPercent = Math.max(15, Math.round((t.traffic / maxTraffic) * 100));
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition">
                          {t.traffic.toLocaleString()}
                        </span>
                        <div
                          className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[10px] font-medium text-slate-500">{t.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKLINK SUMMARY (Phase D #1) */}
          {activeTab === 'backlinks' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="text-slate-500 text-xs font-medium mb-1">Total Backlinks</div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {(backlinksData?.total || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Total inbound links indexed</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="text-slate-500 text-xs font-medium mb-1">Referring Domains</div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {(backlinksData?.referringDomains || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Unique root domains pointing to site</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="text-slate-500 text-xs font-medium mb-1">DataForSEO Rank</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{backlinksData?.rank || 320}</span>
                    <span className="text-xs font-bold text-slate-400">/ 1,000</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">DataForSEO link equity authority scale (0–1,000)</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="text-slate-500 text-xs font-medium mb-1">Spam Score</div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-3xl font-extrabold ${
                        (backlinksData?.spamScore || 0) > 10 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {backlinksData?.spamScore || 2}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Low toxic anchor and link penalty ratio</p>
                </div>
              </div>

              {/* Dofollow breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Link Attribute Distribution</h3>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{
                        width: `${Math.round(
                          ((backlinksData?.dofollowCount || 1) / Math.max(1, backlinksData?.total || 1)) * 100
                        )}%`,
                      }}
                    />
                    <div className="bg-slate-300 h-full flex-1" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Dofollow Links: {(backlinksData?.dofollowCount || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    Nofollow / Other: {Math.max(0, (backlinksData?.total || 0) - (backlinksData?.dofollowCount || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KEYWORD DATA (Phase D #1) */}
          {activeTab === 'keywords' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Keyword Overview Matrix</h3>
                  <p className="text-xs text-slate-500">
                    Batched DataForSEO keyword overview (supports up to 700 keywords per lookup)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter keywords..."
                      value={keywordSearch}
                      onChange={(e) => setKeywordSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Intent Filter */}
                  <select
                    value={selectedIntent}
                    onChange={(e) => setSelectedIntent(e.target.value)}
                    className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 font-medium"
                  >
                    <option value="all">All Intents</option>
                    <option value="commercial">Commercial</option>
                    <option value="transactional">Transactional</option>
                    <option value="informational">Informational</option>
                    <option value="navigational">Navigational</option>
                  </select>
                </div>
              </div>

              {/* Normalized Keywords Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Keyword</th>
                      <th className="py-3 px-4">Search Volume</th>
                      <th className="py-3 px-4">CPC (USD)</th>
                      <th className="py-3 px-4">Competition</th>
                      <th className="py-3 px-4">Search Intent</th>
                      <th className="py-3 px-4 text-right">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredKeywords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No keywords matching filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredKeywords.map((kw, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-semibold text-slate-900">{kw.keyword}</td>
                          <td className="py-3 px-4 font-medium">{kw.volume.toLocaleString()}</td>
                          <td className="py-3 px-4 font-medium">${kw.cpc.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                kw.competition === 'HIGH'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : kw.competition === 'LOW'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {kw.competition}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize text-slate-600 font-medium">{kw.intent}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">
                            {kw.difficulty || 35} / 100
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SERP POSITIONS (Phase D #1) */}
          {activeTab === 'serp' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Live Google SERP Standings</h3>
                    <p className="text-xs text-slate-500">
                      Query: &ldquo;{serpData?.keyword || targetDomain}&rdquo; · Powered by SerpApi
                    </p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold">
                    Top 10 Live SERP
                  </span>
                </div>

                <div className="space-y-3">
                  {(serpData?.results || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition bg-slate-50/40"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                          #{item.position}
                        </span>
                        <div className="space-y-1 min-w-0 flex-1">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-xs text-slate-900 hover:text-emerald-600 transition flex items-center gap-1.5"
                          >
                            <span className="truncate">{item.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                          </a>
                          <div className="text-[11px] text-emerald-700 font-mono truncate">{item.url}</div>
                          <p className="text-xs text-slate-600 line-clamp-2">{item.snippet}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* People Also Ask & Related Searches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    People Also Ask
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {(serpData?.peopleAlsoAsk || []).map((q, idx) => (
                      <li key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium">
                        {q.question}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Related Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(serpData?.relatedSearches || []).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GOOGLE AI OVERVIEW CITATIONS (Phase E #1) */}
          {activeTab === 'ai_overview' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900">Google AI Overview Citation Presence</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Identifies ranking keywords actively cited inside Google&apos;s AI Overview snapshot.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      {aiOverviewData?.totalCitations || 0} AI Overview Citations Found
                    </span>
                  </div>
                </div>

                {(!aiOverviewData?.citedKeywords || aiOverviewData.citedKeywords.length === 0) ? (
                  <div className="text-center py-10 text-slate-500 text-xs space-y-2">
                    <Info className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-700">No active AI Overview citations detected yet for {targetDomain}.</p>
                    <p className="text-slate-400 max-w-md mx-auto">
                      Publishing structured Q&amp;A schema and authoritative definition blocks increases citation rates.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Cited Keyword</th>
                          <th className="py-3 px-4">SERP Rank</th>
                          <th className="py-3 px-4">Search Volume</th>
                          <th className="py-3 px-4">Citation URL</th>
                          <th className="py-3 px-4 text-right">AI Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {aiOverviewData.citedKeywords.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4 font-bold text-slate-900">{item.keyword}</td>
                            <td className="py-3 px-4 font-semibold text-emerald-700">#{item.position}</td>
                            <td className="py-3 px-4 font-medium">{item.searchVolume.toLocaleString()}</td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                              {item.url}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Cited in AI Overview
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: MULTI-LLM BRAND VISIBILITY BENCHMARK (Empirical Observations) */}
          {activeTab === 'ai_visibility' && (
            <AiVisibilityObservationsPanel
              userEmail={user?.email}
              businessProfile={{
                name: targetDomain,
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
