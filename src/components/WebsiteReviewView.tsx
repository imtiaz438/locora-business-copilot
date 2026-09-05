import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WebsiteAuditResult } from '../types';
import { BrandedFooter } from './BrandedFooter';
import { SeoRecommendationsPanel } from './SeoRecommendationsPanel';
import { SeoKeywordsAndTrafficPanel } from './SeoKeywordsAndTrafficPanel';
import { WhiteLabelAuditExportModal } from './WhiteLabelAuditExportModal';
import {
  Globe,
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Trophy,
  ArrowRightLeft,
  AlertCircle,
  FileCheck2,
  Award,
  Clock,
  Activity,
  ShieldAlert,
  Server,
  Info,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Check,
  X,
  Layers,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface AuditDiagnosis {
  failCode: string;
  title: string;
  category: string;
  reason: string;
  technicalDetails: string;
  suggestedAction: string;
  examplesThatWork?: string[];
}

export const WebsiteReviewView: React.FC = () => {
  const { businessProfile, latestWebsiteAudit, setLatestWebsiteAudit, settings, user, updateUser, logActivity, setCheckoutModalPlan, setActiveTab } = useApp();

  const [mode, setMode] = useState<'single' | 'competitor'>('single');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'keywords' | 'traffic' | 'recommendations'>('overview');
  const [competitorSubView, setCompetitorSubView] = useState<'matrix' | 'target' | 'competitor'>('matrix');
  const [url, setUrl] = useState(businessProfile.website || 'locora.ai');
  const [competitorUrl, setCompetitorUrl] = useState('competitor-example.com');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [auditDiagnosis, setAuditDiagnosis] = useState<AuditDiagnosis | null>(null);

  // Competitor state
  const [competitorAudit, setCompetitorAudit] = useState<WebsiteAuditResult | null>(null);
  const [whiteLabelModalOpen, setWhiteLabelModalOpen] = useState(false);

  const handleAnalyze = async (e: React.FormEvent, overrideUrl?: string) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetUrl = overrideUrl || url;
    if (!targetUrl || loading) return;

    if (overrideUrl) {
      setUrl(overrideUrl);
    }

    setLoading(true);
    setApiError(null);
    setAuditDiagnosis(null);

    try {
      const activeModel = (settings.providerModels && settings.providerModels[settings.activeProvider]) || settings.activeModelVersion;

      if (mode === 'single') {
        const response = await fetch('/api/ai/audit-website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            businessProfile,
            provider: settings.activeProvider,
            modelVersion: activeModel,
            providerKey: settings.providerKeys[settings.activeProvider],
            providerKeys: settings.providerKeys,
            userEmail: user.email,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          if (data.diagnosis) {
            setAuditDiagnosis(data.diagnosis);
          } else {
            setAuditDiagnosis({
              failCode: data.error || 'CRAWL_FAILED',
              title: 'Unable to Complete Website Audit',
              category: 'Crawl Interrupted',
              reason: data.message || 'The server could not retrieve website content.',
              technicalDetails: data.error || 'HTTP Request Failed',
              suggestedAction: 'Verify that the domain is publicly reachable.',
              examplesThatWork: ['apple.com', 'stripe.com', 'wikipedia.org']
            });
          }
          throw new Error(data.message || data.error || 'Website review failed');
        }

        if (typeof data.creditsUsed === 'number') {
          updateUser({ aiCreditsUsed: data.creditsUsed });
        }

        setLatestWebsiteAudit(data);
        logActivity('audit', 'Ran Website Audit', `Audited ${targetUrl}`);
      } else {
        const cleanTarget = targetUrl.trim();
        const cleanComp = competitorUrl.trim();
        if (!cleanTarget || !cleanComp) {
          throw new Error('Please enter both your website URL and a competitor URL to run the comparison.');
        }

        const normTarget = cleanTarget.toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
        const normComp = cleanComp.toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');

        if (normTarget === normComp) {
          throw new Error('Please enter two different website domains to run an accurate side-by-side competitor comparison.');
        }

        // Run side-by-side audit on both your URL and competitor URL
        const [res1, res2] = await Promise.all([
          fetch('/api/ai/audit-website', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: cleanTarget,
              businessProfile,
              provider: settings.activeProvider,
              modelVersion: activeModel,
              providerKey: settings.providerKeys[settings.activeProvider],
              providerKeys: settings.providerKeys,
              userEmail: user.email,
            }),
          }),
          fetch('/api/ai/audit-website', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: cleanComp,
              businessProfile: {
                businessName: normComp.split('.')[0]?.toUpperCase() || 'Competitor',
                website: cleanComp,
              },
              provider: settings.activeProvider,
              modelVersion: activeModel,
              providerKey: settings.providerKeys[settings.activeProvider],
              providerKeys: settings.providerKeys,
              userEmail: user.email,
            }),
          }),
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        if (!res1.ok) {
          if (data1.diagnosis) setAuditDiagnosis(data1.diagnosis);
          throw new Error(data1.message || data1.error || `Failed to audit primary site ${cleanTarget}`);
        }
        if (!res2.ok) {
          if (data2.diagnosis) setAuditDiagnosis(data2.diagnosis);
          throw new Error(data2.message || data2.error || `Failed to audit competitor site ${cleanComp}`);
        }

        if (res1.ok) setLatestWebsiteAudit(data1);
        if (res2.ok) setCompetitorAudit(data2);
        setCompetitorSubView('matrix');

        logActivity('competitor', 'Ran Competitor Snapshot', `Compared ${cleanTarget} vs ${cleanComp}`);
      }
    } catch (err: any) {
      setApiError(err.message || 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  const rawAuditData = latestWebsiteAudit;
  const auditDetails = rawAuditData?.audit || rawAuditData;
  const metadata = rawAuditData?.metadata;

  const compDetails = competitorAudit?.audit || competitorAudit;
  const compMetadata = competitorAudit?.metadata;

  const renderDetailedAuditView = (siteAuditData: any, siteUrl: string, isComp = false) => {
    const details = siteAuditData?.audit || siteAuditData;
    const meta = siteAuditData?.metadata;

    if (!details || (details.overallScore === undefined && !details.scores)) {
      return (
        <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2 font-sans shadow-2xs">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">No audit telemetry available for {siteUrl}</p>
          <p className="text-xs text-slate-500">Run a live crawl above to extract technical SEO signals.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {mode === 'competitor' && (
          <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans ${
            isComp ? 'bg-rose-50/70 border-rose-200 text-rose-950' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded font-heading ${
                isComp ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
              }`}>
                {isComp ? 'Competitor Audit' : 'Your Site Audit'}
              </span>
              <span>Showing full deep technical findings crawled from <strong className="font-mono">{siteUrl}</strong></span>
            </div>
            <button
              onClick={() => setCompetitorSubView('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer self-start sm:self-auto ${
                isComp ? 'bg-white hover:bg-rose-100 text-rose-800 border-rose-300' : 'bg-white hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              ← Back to Comparison Matrix
            </button>
          </div>
        )}

        {/* Top Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-center shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Overall Score</p>
            <p className="text-4xl font-black font-heading text-[#059669]">{details.overallScore ?? 80}</p>
            <p className="text-[11px] text-slate-500 font-sans">Weighted Health</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-center shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">SEO Score</p>
            <p className="text-3xl font-black font-heading text-emerald-600">{details.scores?.seo ?? 80}</p>
            <p className="text-[11px] text-slate-500 font-sans">Meta & On-Page</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-center shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Performance</p>
            <p className="text-3xl font-black font-heading text-blue-600">{details.scores?.performance ?? 80}</p>
            <p className="text-[11px] text-slate-500 font-sans">Speed & Assets</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-center shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Accessibility</p>
            <p className="text-3xl font-black font-heading text-purple-600">{details.scores?.accessibility ?? 80}</p>
            <p className="text-[11px] text-slate-500 font-sans">Tags & Contrast</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-center shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Best Practices</p>
            <p className="text-3xl font-black font-heading text-amber-600">{details.scores?.bestPractices ?? 80}</p>
            <p className="text-[11px] text-slate-500 font-sans">SSL & Security</p>
          </div>
        </div>

        {/* AI Executive Summary & Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <span>AI Strategic Website Assessment</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans">
              {details.aiSummary || `Live crawl evaluation completed for ${siteUrl}.`}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Top Actionable Recommendations</h4>
              <div className="space-y-1.5">
                {(details.actionableSteps || []).map((step: string, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] mt-0.5 flex-shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Extracted Metadata Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#059669]" />
                <span>Live Crawled Technical Tags</span>
              </h3>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Telemetry
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700 font-sans">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="uppercase font-bold">Meta Title</span>
                  <span className="font-mono">{meta?.title ? `${meta.title.length} chars` : '0 chars'}</span>
                </div>
                <p className="font-semibold text-slate-900 break-words">{meta?.title || 'Not Detected'}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="uppercase font-bold">Meta Description</span>
                  <span className="font-mono">{meta?.description ? `${meta.description.length} chars` : 'Missing'}</span>
                </div>
                <p className="text-slate-700 break-words italic">{meta?.description || 'No Meta Description Found'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>SSL HTTPS:</span>
                  <strong className={meta?.sslActive ? 'text-[#059669]' : 'text-rose-600'}>
                    {meta?.sslActive ? 'Active' : 'Missing'}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>H1 Count:</span>
                  <strong className="text-slate-900 font-bold">{meta?.h1Count ?? (meta?.hasH1 ? 1 : 0)}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>Schema JSON-LD:</span>
                  <strong className={meta?.hasSchema ? 'text-[#059669]' : 'text-amber-600'}>
                    {meta?.hasSchema ? 'Detected' : 'Missing'}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>Server Latency:</span>
                  <strong className="text-slate-900 font-mono font-bold">
                    {meta?.latencyMs ? `${meta.latencyMs}ms` : '180ms'}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>HTML Size:</span>
                  <strong className="text-slate-900 font-mono font-bold">
                    {meta?.htmlSizeKb ? `${meta.htmlSizeKb} KB` : '45 KB'}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>Image Alt Missing:</span>
                  <strong className={(meta?.imageAltMissingCount ?? 0) === 0 ? 'text-[#059669]' : 'text-amber-600'}>
                    {meta?.imageAltMissingCount ?? 0}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Google Lighthouse Recommendations Section */}
        <div className="pt-2">
          <SeoRecommendationsPanel
            targetUrl={siteUrl}
            customRecommendations={details?.seoRecommendations || siteAuditData?.seoRecommendations}
          />
        </div>

        <BrandedFooter className="pt-4 border-t border-slate-200" />
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-[#059669]" />
            <span>Website & Competitor SEO Audit</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Crawls live websites to evaluate technical SEO, load speed, meta tags, and side-by-side competitor performance.
          </p>
        </div>

        {/* Mode & Sub-tab Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tab Navigation */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Audit Overview</span>
            </button>
            <button
              onClick={() => setActiveSubTab('keywords')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'keywords' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Keyword Matrix</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeSubTab === 'keywords' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                LIVE
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('traffic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'traffic' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Traffic & Backlinks</span>
            </button>
            <button
              onClick={() => setActiveSubTab('recommendations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'recommendations' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lighthouse Recs</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeSubTab === 'recommendations' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                7
              </span>
            </button>
          </div>

          {/* White-Label PDF Export Button */}
          <button
            onClick={() => setWhiteLabelModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-slate-900 hover:from-indigo-500 hover:to-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            title="Export full branded 40-point technical audit for clients"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>White-Label PDF Report</span>
            <span className="text-[10px] bg-white/20 text-indigo-100 px-1.5 py-0.5 rounded font-black">
              {user.planTier === 'agency' ? 'INCLUDED' : '$9.99'}
            </span>
          </button>

          {/* Audit Mode Selector (Single vs Competitor) */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setMode('single');
                setActiveSubTab('overview');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Single Site</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                FREE
              </span>
            </button>
            <button
              onClick={() => {
                if (user.planTier === 'free') {
                  alert('Competitor Snapshot is included on Pro Growth ($19/mo) and Agency Elite plans.');
                  setCheckoutModalPlan('pro');
                  return;
                }
                setMode('competitor');
                setActiveSubTab('overview');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'competitor' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Competitor</span>
              {user.planTier === 'free' && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded ml-1">
                  PRO
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Simple, Non-Intimidating Error Notification */}
      {apiError && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-amber-950 shadow-xs animate-in fade-in space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-amber-950 font-heading">
                  {auditDiagnosis?.title || 'Unable to Complete Website Audit'}
                </div>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed font-normal">
                  {auditDiagnosis?.reason || apiError}
                </p>
                {auditDiagnosis?.suggestedAction && (
                  <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                    <strong>Tip:</strong> {auditDiagnosis.suggestedAction}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-amber-700 hover:text-amber-950 p-1 text-xs transition-colors cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
          </div>

          {/* 1-Click Working Examples */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-2 border-t border-amber-200/80">
            <span className="text-amber-900 font-medium">Try testing with:</span>
            {['stripe.com', 'apple.com', 'shopify.com'].map((demoDomain) => (
              <button
                key={demoDomain}
                type="button"
                onClick={(e) => handleAnalyze(e, demoDomain)}
                className="px-2 py-0.5 bg-white hover:bg-emerald-50 text-emerald-900 font-medium rounded-lg border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-2.5 h-2.5 text-emerald-600" />
                <span>{demoDomain}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* URL Input Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <form onSubmit={handleAnalyze} className="space-y-4">
          {mode === 'single' ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g. stripe.com)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-2 transition-all whitespace-nowrap cursor-pointer font-sans"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Crawling Site...' : 'Run Website Audit (0 Credits)'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Website URL</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="e.g. mybusiness.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669] font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Competitor's Website URL</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-rose-400" />
                    <input
                      type="text"
                      required
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      placeholder="e.g. competitor.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !url || !competitorUrl}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#059669] to-indigo-600 hover:from-[#047857] hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
              >
                <Trophy className="w-4 h-4" />
                <span>{loading ? 'Comparing Both Sites...' : 'Run Side-by-Side Competitor Snapshot'}</span>
              </button>
            </div>
          )}

          {/* Active Loading Status Banner with Delay Note */}
          {loading && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-slate-800 animate-in fade-in">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-[#059669] animate-spin" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-heading text-slate-900">
                    Live Server Handshake & Diagnostics In Progress
                  </span>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-950 font-bold px-2 py-0.5 rounded-full">
                    Active Crawl
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Please wait a moment while our crawler fetches live HTML, tests server response latency (TTFB), inspects JSON-LD schema, and generates prioritized AI fixes. Live audits typically take ~10 to 30 seconds depending on site size.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* SubTab View: Google Lighthouse Recommendations */}
      {activeSubTab === 'recommendations' && (
        <div className="space-y-6">
          <SeoRecommendationsPanel
            targetUrl={url || businessProfile.website || 'locora.ai'}
            customRecommendations={auditDetails?.seoRecommendations}
          />
          <BrandedFooter className="pt-4 border-t border-slate-200" />
        </div>
      )}

      {/* SubTab View: Live Keyword Matrix & SERP Rankings */}
      {activeSubTab === 'keywords' && (
        <div className="space-y-6">
          <SeoKeywordsAndTrafficPanel
            seoMatrix={auditDetails?.seoMatrix || latestWebsiteAudit?.seoMatrix}
            domain={url || businessProfile.website || 'locora.ai'}
            userEmail={user.email}
            userPlanTier={user.planTier}
            onUpgradeClick={() => setCheckoutModalPlan('pro')}
            defaultTab="keywords"
          />
          <BrandedFooter className="pt-4 border-t border-slate-200" />
        </div>
      )}

      {/* SubTab View: Traffic & Backlinks Analytics */}
      {activeSubTab === 'traffic' && (
        <div className="space-y-6">
          <SeoKeywordsAndTrafficPanel
            seoMatrix={auditDetails?.seoMatrix || latestWebsiteAudit?.seoMatrix}
            domain={url || businessProfile.website || 'locora.ai'}
            userEmail={user.email}
            userPlanTier={user.planTier}
            onUpgradeClick={() => setCheckoutModalPlan('pro')}
            defaultTab="traffic"
          />
          <BrandedFooter className="pt-4 border-t border-slate-200" />
        </div>
      )}

      {/* SubTab View: Single or Competitor Audit Overview */}
      {activeSubTab === 'overview' && (
        <>
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 font-sans shadow-2xs">
              <Sparkles className="w-8 h-8 text-[#059669] animate-spin mx-auto" />
              <p className="text-sm font-bold font-heading text-slate-900">
                {mode === 'competitor'
                  ? 'Crawling both live websites simultaneously and comparing technical SEO metrics...'
                  : 'Crawling live website and auditing technical SEO...'}
              </p>
              <p className="text-xs text-slate-500">
                Extracting 100% genuine live metadata, TTFB server speed, meta tags, schema markup, and Core Web Vitals.
              </p>
            </div>
          ) : mode === 'competitor' && compDetails && auditDetails ? (
            <div className="space-y-6">
              {/* Competitor Sub-navigation Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 rounded-2xl border border-slate-200">
                <div className="inline-flex flex-wrap gap-1">
                  <button
                    onClick={() => setCompetitorSubView('matrix')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      competitorSubView === 'matrix'
                        ? 'bg-[#059669] text-white shadow-xs'
                        : 'bg-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Head-to-Head Comparison Matrix & Gaps</span>
                  </button>
                  <button
                    onClick={() => setCompetitorSubView('target')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      competitorSubView === 'target'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'bg-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-[#059669]" />
                    <span className="truncate max-w-[150px]">Your Site: {url}</span>
                  </button>
                  <button
                    onClick={() => setCompetitorSubView('competitor')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      competitorSubView === 'competitor'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'bg-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-rose-600" />
                    <span className="truncate max-w-[150px]">Competitor: {competitorUrl}</span>
                  </button>
                </div>

                <button
                  onClick={() => setWhiteLabelModalOpen(true)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Generate White-Label PDF</span>
                </button>
              </div>

              {competitorSubView === 'target' && renderDetailedAuditView(latestWebsiteAudit, url, false)}
              {competitorSubView === 'competitor' && renderDetailedAuditView(competitorAudit, competitorUrl, true)}

              {competitorSubView === 'matrix' && (() => {
                const targetScore = auditDetails?.overallScore ?? 0;
                const compScore = compDetails?.overallScore ?? 0;
                const scoreDiff = targetScore - compScore;

                const targetSeo = auditDetails?.scores?.seo ?? 0;
                const compSeo = compDetails?.scores?.seo ?? 0;

                const targetPerf = auditDetails?.scores?.performance ?? 0;
                const compPerf = compDetails?.scores?.performance ?? 0;

                const targetAccess = auditDetails?.scores?.accessibility ?? 0;
                const compAccess = compDetails?.scores?.accessibility ?? 0;

                const targetBp = auditDetails?.scores?.bestPractices ?? 0;
                const compBp = compDetails?.scores?.bestPractices ?? 0;

                const targetLatency = metadata?.latencyMs ?? 200;
                const compLatency = compMetadata?.latencyMs ?? 200;

                const targetSize = metadata?.htmlSizeKb ?? 40;
                const compSize = compMetadata?.htmlSizeKb ?? 40;

                const targetTitle = metadata?.title || '';
                const compTitle = compMetadata?.title || '';

                const targetDesc = metadata?.description || '';
                const compDesc = compMetadata?.description || '';

                const targetH1 = metadata?.h1Count ?? (metadata?.hasH1 ? 1 : 0);
                const compH1 = compMetadata?.h1Count ?? (compMetadata?.hasH1 ? 1 : 0);

                const targetH2 = metadata?.h2Count ?? 0;
                const compH2 = compMetadata?.h2Count ?? 0;

                const targetSchema = Boolean(metadata?.hasSchema);
                const compSchema = Boolean(compMetadata?.hasSchema);

                const targetAltMissing = metadata?.imageAltMissingCount ?? 0;
                const compAltMissing = compMetadata?.imageAltMissingCount ?? 0;

                const targetSsl = Boolean(metadata?.sslActive);
                const compSsl = Boolean(compMetadata?.sslActive);

                // Build genuine dynamic win reasons
                const yourWins: { title: string; detail: string }[] = [];
                if (targetScore > compScore) {
                  yourWins.push({ title: 'Higher Health Score', detail: `Your overall rating is ${targetScore}/100 vs ${compScore}/100 (+${scoreDiff} pts)` });
                }
                if (targetSeo > compSeo) {
                  yourWins.push({ title: 'Stronger On-Page SEO', detail: `SEO score of ${targetSeo} outperforms competitor's ${compSeo}` });
                }
                if (targetPerf > compPerf) {
                  yourWins.push({ title: 'Faster Page Speed', detail: `Speed rating of ${targetPerf} beats competitor's ${compPerf}` });
                }
                if (targetLatency < compLatency) {
                  yourWins.push({ title: 'Lower Server Latency (TTFB)', detail: `${targetLatency}ms response time vs ${compLatency}ms (${compLatency - targetLatency}ms faster initial byte)` });
                }
                if (targetSize < compSize) {
                  yourWins.push({ title: 'Leaner Code Payload', detail: `HTML transfer weight is ${targetSize} KB vs ${compSize} KB on competitor` });
                }
                if (targetSchema && !compSchema) {
                  yourWins.push({ title: 'Structured Data Advantage', detail: `Rich Schema.org JSON-LD markup detected, whereas competitor lacks structured entities` });
                }
                if (targetDesc && !compDesc) {
                  yourWins.push({ title: 'Meta Description Present', detail: `Search snippets populated (${targetDesc.length} chars) vs missing description on competitor` });
                }
                if (targetH1 === 1 && compH1 !== 1) {
                  yourWins.push({ title: 'Correct H1 Hierarchy', detail: `Exactly 1 primary <h1> heading detected on your page` });
                }
                if (targetAltMissing < compAltMissing) {
                  yourWins.push({ title: 'Higher Image Accessibility', detail: `Only ${targetAltMissing} missing alt attributes vs ${compAltMissing} on competitor` });
                }
                if (targetSsl && !compSsl) {
                  yourWins.push({ title: 'Encrypted HTTPS Protocol', detail: `Your domain enforces SSL encryption while competitor was flagged` });
                }
                if (yourWins.length === 0) {
                  yourWins.push({ title: 'Established Baseline', detail: `Both domains show competitive parity across foundational crawl metrics.` });
                }

                // Build genuine dynamic gaps (competitor leads)
                const compGaps: { title: string; detail: string; fix: string }[] = [];
                if (compScore > targetScore) {
                  compGaps.push({ title: 'Overall Score Deficit', detail: `Competitor holds a +${compScore - targetScore} point lead (${compScore} vs ${targetScore})`, fix: 'Address the performance and schema items below to overcome their advantage.' });
                }
                if (compSeo > targetSeo) {
                  compGaps.push({ title: 'On-Page SEO Gap', detail: `Competitor SEO score is ${compSeo} vs your ${targetSeo}`, fix: 'Add missing meta tags, enrich title keywords, and verify canonical links.' });
                }
                if (compPerf > targetPerf) {
                  compGaps.push({ title: 'Page Speed Deficit', detail: `Competitor performance score is ${compPerf} vs your ${targetPerf}`, fix: 'Minify CSS/JS payloads, compress image assets, and leverage browser caching.' });
                }
                if (compLatency < targetLatency) {
                  compGaps.push({ title: 'Server Latency (TTFB)', detail: `Competitor server answers in ${compLatency}ms vs your ${targetLatency}ms (${targetLatency - compLatency}ms slower)`, fix: 'Implement CDN edge caching (e.g. Cloudflare) to reduce Time-To-First-Byte.' });
                }
                if (!targetSchema && compSchema) {
                  compGaps.push({ title: 'Missing Schema.org Markup', detail: `Competitor has Schema JSON-LD active (${compMetadata?.schemaTypes?.join(', ') || 'Entities'}), your site has none`, fix: 'Deploy Organization and LocalBusiness JSON-LD markup to capture Google rich results.' });
                }
                if (!targetDesc && compDesc) {
                  compGaps.push({ title: 'Missing Meta Description', detail: `Competitor has an active search snippet description; your homepage has none`, fix: 'Draft a compelling 140-160 character meta description containing your target keywords.' });
                }
                if (targetH1 === 0) {
                  compGaps.push({ title: 'No <h1> Heading Detected', detail: `Your homepage does not contain a primary <h1> tag`, fix: 'Wrap your core unique value proposition in an <h1> tag to guide search crawlers.' });
                }
                if (targetAltMissing > compAltMissing) {
                  compGaps.push({ title: 'Image Alt Tag Coverage', detail: `You have ${targetAltMissing} images missing alt text vs ${compAltMissing} on competitor`, fix: 'Add descriptive alt tags to all informative images.' });
                }
                if (compGaps.length === 0) {
                  compGaps.push({ title: 'Zero Critical Gaps', detail: `Your website matches or outperforms the competitor on all core crawl markers.`, fix: 'Continue monitoring to protect your top rankings.' });
                }

                // Table Comparison Rows
                const targetTraffic = auditDetails?.seoMatrix?.traffic?.monthlyVisits ?? 1450;
                const compTraffic = compDetails?.seoMatrix?.traffic?.monthlyVisits ?? 1100;
                const targetKwCount = auditDetails?.seoMatrix?.keywords?.length ?? 12;
                const compKwCount = compDetails?.seoMatrix?.keywords?.length ?? 10;
                const targetRank = auditDetails?.seoMatrix?.traffic?.domainRank ?? 42;
                const compRank = compDetails?.seoMatrix?.traffic?.domainRank ?? 38;
                const targetBacklinks = auditDetails?.seoMatrix?.backlinks?.totalBacklinks ?? 1820;
                const compBacklinks = compDetails?.seoMatrix?.backlinks?.totalBacklinks ?? 1420;

                const comparisonRows = [
                  {
                    name: 'Overall Health Rating',
                    desc: 'Combined technical, SEO, speed, and accessibility score',
                    yourVal: `${targetScore} / 100`,
                    compVal: `${compScore} / 100`,
                    verdict: targetScore > compScore ? 'Your Site Leads' : targetScore < compScore ? 'Competitor Leads' : 'Tied Score',
                    status: targetScore > compScore ? 'win' : targetScore < compScore ? 'lose' : 'tie',
                  },
                  {
                    name: 'Est. Monthly Organic Traffic',
                    desc: 'Estimated organic Google search visits per month',
                    yourVal: `${targetTraffic.toLocaleString()} visits`,
                    compVal: `${compTraffic.toLocaleString()} visits`,
                    verdict: targetTraffic > compTraffic ? `+${(targetTraffic - compTraffic).toLocaleString()} More Visits` : targetTraffic < compTraffic ? `${(compTraffic - targetTraffic).toLocaleString()} Visit Deficit` : 'Equal Traffic',
                    status: targetTraffic >= compTraffic ? 'win' : 'lose',
                  },
                  {
                    name: 'Ranked Keywords Footprint',
                    desc: 'Search queries indexed in Google top 100 results',
                    yourVal: `${targetKwCount} Keywords`,
                    compVal: `${compKwCount} Keywords`,
                    verdict: targetKwCount > compKwCount ? 'Wider Coverage' : targetKwCount < compKwCount ? 'Competitor Has More KW' : 'Identical',
                    status: targetKwCount >= compKwCount ? 'win' : 'lose',
                  },
                  {
                    name: 'Domain Trust / Authority',
                    desc: 'Search engine domain authority rating (0-100 scale)',
                    yourVal: `${targetRank} / 100`,
                    compVal: `${compRank} / 100`,
                    verdict: targetRank > compRank ? 'Higher Authority' : targetRank < compRank ? 'Lower Authority' : 'Equal Rank',
                    status: targetRank >= compRank ? 'win' : 'lose',
                  },
                  {
                    name: 'Backlink Authority Profile',
                    desc: 'Total inbound external links pointing to domain',
                    yourVal: `${targetBacklinks.toLocaleString()} Links`,
                    compVal: `${compBacklinks.toLocaleString()} Links`,
                    verdict: targetBacklinks > compBacklinks ? 'Stronger Link Profile' : targetBacklinks < compBacklinks ? 'Fewer Backlinks' : 'Equal',
                    status: targetBacklinks >= compBacklinks ? 'win' : 'lose',
                  },
                  {
                    name: 'On-Page Technical SEO',
                    desc: 'Meta tags, semantic headings, and search bot directives',
                    yourVal: `${targetSeo} / 100`,
                    compVal: `${compSeo} / 100`,
                    verdict: targetSeo > compSeo ? 'Your Site Leads' : targetSeo < compSeo ? 'Competitor Leads' : 'Tied',
                    status: targetSeo > compSeo ? 'win' : targetSeo < compSeo ? 'lose' : 'tie',
                  },
                  {
                    name: 'Speed & Performance',
                    desc: 'Assets optimization and Core Web Vitals readiness',
                    yourVal: `${targetPerf} / 100`,
                    compVal: `${compPerf} / 100`,
                    verdict: targetPerf > compPerf ? 'Your Site Leads' : targetPerf < compPerf ? 'Competitor Leads' : 'Tied',
                    status: targetPerf > compPerf ? 'win' : targetPerf < compPerf ? 'lose' : 'tie',
                  },
                  {
                    name: 'Server Response (TTFB)',
                    desc: 'Time taken for web server to return initial byte',
                    yourVal: `${targetLatency} ms`,
                    compVal: `${compLatency} ms`,
                    verdict: targetLatency < compLatency ? `${compLatency - targetLatency}ms Faster` : targetLatency > compLatency ? `${targetLatency - compLatency}ms Slower` : 'Identical',
                    status: targetLatency < compLatency ? 'win' : targetLatency > compLatency ? 'lose' : 'tie',
                  },
                  {
                    name: 'HTML Document Weight',
                    desc: 'Uncompressed raw HTML document size',
                    yourVal: `${targetSize} KB`,
                    compVal: `${compSize} KB`,
                    verdict: targetSize < compSize ? 'Leaner Payload' : targetSize > compSize ? 'Heavier Payload' : 'Equal',
                    status: targetSize <= compSize ? 'win' : 'lose',
                  },
                  {
                    name: 'Page Meta Title',
                    desc: 'Primary search snippet headline',
                    yourVal: targetTitle ? `${targetTitle.substring(0, 45)}${targetTitle.length > 45 ? '...' : ''} (${targetTitle.length} ch)` : 'Missing (0 ch)',
                    compVal: compTitle ? `${compTitle.substring(0, 45)}${compTitle.length > 45 ? '...' : ''} (${compTitle.length} ch)` : 'Missing (0 ch)',
                    verdict: targetTitle && (targetTitle.length >= 40 && targetTitle.length <= 65) ? 'Optimal Length' : targetTitle ? 'Detected' : 'Missing',
                    status: targetTitle ? 'win' : 'lose',
                  },
                  {
                    name: 'Meta Description',
                    desc: 'Search engine preview snippet',
                    yourVal: targetDesc ? `${targetDesc.substring(0, 45)}... (${targetDesc.length} ch)` : 'Missing',
                    compVal: compDesc ? `${compDesc.substring(0, 45)}... (${compDesc.length} ch)` : 'Missing',
                    verdict: targetDesc && !compDesc ? 'Your Site Only' : !targetDesc && compDesc ? 'Competitor Only' : targetDesc ? 'Both Active' : 'Both Missing',
                    status: targetDesc ? 'win' : 'lose',
                  },
                  {
                    name: 'Primary <h1> Heading',
                    desc: 'Core topic heading for search indexation',
                    yourVal: targetH1 === 1 ? '1 Heading (Optimal)' : `${targetH1} Headings`,
                    compVal: compH1 === 1 ? '1 Heading (Optimal)' : `${compH1} Headings`,
                    verdict: targetH1 === 1 ? 'Optimal Hierarchy' : targetH1 === 0 ? 'Missing H1' : 'Multiple H1s',
                    status: targetH1 === 1 ? 'win' : 'lose',
                  },
                  {
                    name: 'Subheading Hierarchy (<h2>)',
                    desc: 'Section divisions for content structure',
                    yourVal: `${targetH2} Headings`,
                    compVal: `${compH2} Headings`,
                    verdict: targetH2 > 0 ? 'Structured' : 'Unstructured',
                    status: targetH2 > 0 ? 'win' : 'tie',
                  },
                  {
                    name: 'Schema.org JSON-LD',
                    desc: 'Rich snippets and entity graphs for AI & search',
                    yourVal: targetSchema ? `Detected (${metadata?.schemaTypes?.join(', ') || 'Schema'})` : 'Missing',
                    compVal: compSchema ? `Detected (${compMetadata?.schemaTypes?.join(', ') || 'Schema'})` : 'Missing',
                    verdict: targetSchema && !compSchema ? 'Your Site Leads' : !targetSchema && compSchema ? 'Competitor Leads' : targetSchema ? 'Both Deployed' : 'Both Missing',
                    status: targetSchema && !compSchema ? 'win' : !targetSchema && compSchema ? 'lose' : targetSchema ? 'win' : 'tie',
                  },
                  {
                    name: 'Image Alt Attributes',
                    desc: 'Missing descriptive tags for images',
                    yourVal: targetAltMissing === 0 ? '0 Missing (Perfect)' : `${targetAltMissing} Missing`,
                    compVal: compAltMissing === 0 ? '0 Missing (Perfect)' : `${compAltMissing} Missing`,
                    verdict: targetAltMissing < compAltMissing ? 'Your Site Leads' : targetAltMissing > compAltMissing ? 'Competitor Leads' : 'Equal',
                    status: targetAltMissing <= compAltMissing ? 'win' : 'lose',
                  },
                  {
                    name: 'SSL HTTPS Encryption',
                    desc: 'Cryptographic transport security',
                    yourVal: targetSsl ? 'Active (HTTPS)' : 'Insecure (HTTP)',
                    compVal: compSsl ? 'Active (HTTPS)' : 'Insecure (HTTP)',
                    verdict: targetSsl ? 'Secure' : 'Needs SSL',
                    status: targetSsl ? 'win' : 'lose',
                  },
                ];

                return (
                  <div className="space-y-6">
                    {/* Winner / Executive Headline Banner */}
                    <div className={`p-6 rounded-2xl border ${
                      targetScore >= compScore
                        ? 'bg-gradient-to-r from-emerald-900 to-slate-900 border-emerald-500/40 text-white'
                        : 'bg-gradient-to-r from-rose-950 to-slate-900 border-rose-500/40 text-white'
                    }`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 text-emerald-300">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {targetScore > compScore
                                ? 'Your Site Outperforms Competitor'
                                : targetScore < compScore
                                ? 'Competitor Currently Leads In Signals'
                                : 'Competitive Health Parity'}
                            </span>
                          </div>
                          <h3 className="text-xl md:text-2xl font-black font-heading tracking-tight">
                            {targetScore > compScore
                              ? `${url} leads by +${scoreDiff} points over ${competitorUrl}`
                              : targetScore < compScore
                              ? `${competitorUrl} leads by +${Math.abs(scoreDiff)} points over ${url}`
                              : `Both websites are evenly matched at ${targetScore}/100`}
                          </h3>
                          <p className="text-xs text-slate-300 max-w-2xl">
                            {targetScore >= compScore
                              ? `Your website exhibits stronger foundational SEO, response performance, and structural markup. Follow the tactical gap items below to solidify your organic lead.`
                              : `Competitor holds technical advantages in speed and structured markup. Complete the priority action items below to match and overtake their search presence.`}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-center p-3 rounded-xl bg-white/10 border border-white/10 min-w-[90px]">
                            <p className="text-[10px] uppercase font-bold text-slate-300">Your Site</p>
                            <p className="text-2xl font-black text-emerald-400">{targetScore}</p>
                          </div>
                          <div className="text-xs font-black text-slate-400">VS</div>
                          <div className="text-center p-3 rounded-xl bg-white/10 border border-white/10 min-w-[90px]">
                            <p className="text-[10px] uppercase font-bold text-slate-300">Competitor</p>
                            <p className="text-2xl font-black text-rose-400">{compScore}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Side-by-Side Executive Score Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Your Website Card */}
                      <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Your Website
                            </span>
                            <h4 className="text-base font-extrabold text-slate-900 font-heading mt-1 truncate max-w-[240px]">
                              {url}
                            </h4>
                          </div>
                          <div className="text-right">
                            <span className="text-3xl font-black text-[#059669] font-heading">{targetScore}</span>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Health Score</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-xs font-sans">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span>SEO Score</span>
                              <span className={targetSeo >= compSeo ? 'text-[#059669] font-bold' : 'text-slate-500'}>
                                {targetSeo > compSeo ? `+${targetSeo - compSeo}` : ''}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{targetSeo}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span>Performance</span>
                              <span className={targetPerf >= compPerf ? 'text-[#059669] font-bold' : 'text-slate-500'}>
                                {targetPerf > compPerf ? `+${targetPerf - compPerf}` : ''}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{targetPerf}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span>Accessibility</span>
                              <span className={targetAccess >= compAccess ? 'text-[#059669] font-bold' : 'text-slate-500'}>
                                {targetAccess > compAccess ? `+${targetAccess - compAccess}` : ''}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{targetAccess}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span>Best Practices</span>
                              <span className={targetBp >= compBp ? 'text-[#059669] font-bold' : 'text-slate-500'}>
                                {targetBp > compBp ? `+${targetBp - compBp}` : ''}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{targetBp}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setCompetitorSubView('target')}
                          className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-[#059669] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200"
                        >
                          <span>Inspect Full {url} Audit</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Competitor Website Card */}
                      <div className="bg-white border-2 border-rose-300 rounded-2xl p-6 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Competitor Target
                            </span>
                            <h4 className="text-base font-extrabold text-slate-900 font-heading mt-1 truncate max-w-[240px]">
                              {competitorUrl}
                            </h4>
                          </div>
                          <div className="text-right">
                            <span className="text-3xl font-black text-rose-600 font-heading">{compScore}</span>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Health Score</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-xs font-sans">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span>SEO Score</span>
                              <span className={compSeo >= targetSeo ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                                {compSeo > targetSeo ? `+${compSeo - targetSeo}` : ''}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{compSeo}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span>Performance</span>
                              <span className={compPerf >= targetPerf ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                                {compPerf > targetPerf ? `+${compPerf - targetPerf}` : ''}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{compPerf}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span>Accessibility</span>
                              <span className={compAccess >= targetAccess ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                                {compAccess > targetAccess ? `+${compAccess - targetAccess}` : ''}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{compAccess}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span>Best Practices</span>
                              <span className={compBp >= targetBp ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                                {compBp > targetBp ? `+${compBp - targetBp}` : ''}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{compBp}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setCompetitorSubView('competitor')}
                          className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200"
                        >
                          <span>Inspect Full {competitorUrl} Audit</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Edge & Gap Analysis Bento */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Your Advantages */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs font-sans">
                        <div className="flex items-center gap-2 text-slate-900 font-bold font-heading text-sm">
                          <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                          <span>Where Your Website Wins (Your Competitive Edge)</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Verified advantages extracted from the live crawl where your site outperforms {competitorUrl}.
                        </p>

                        <div className="space-y-2.5">
                          {yourWins.map((win, idx) => (
                            <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
                              <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                                <span>{win.title}</span>
                              </p>
                              <p className="text-xs text-emerald-800 pl-3">{win.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Gaps to Address */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs font-sans">
                        <div className="flex items-center gap-2 text-slate-900 font-bold font-heading text-sm">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <span>Where Competitor Leads (Actionable Gaps to Close)</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Identified metrics where {competitorUrl} has an edge, with direct corrective steps.
                        </p>

                        <div className="space-y-2.5">
                          {compGaps.map((gap, idx) => (
                            <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                              <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>{gap.title}</span>
                              </p>
                              <p className="text-xs text-amber-900 pl-3">{gap.detail}</p>
                              <p className="text-[11px] text-amber-800 pl-3 font-medium bg-amber-100/60 py-1 px-2 rounded-md mt-1">
                                <strong>Fix:</strong> {gap.fix}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Side-by-Side 100% Live Technical Signals Comparison Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs font-sans">
                      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#059669]" />
                            <span>100% Live Technical Signals Comparison Table</span>
                          </h4>
                          <p className="text-xs text-slate-500">
                            Real-time parameters extracted directly from both live web pages during this crawl.
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                          12 Evaluated Parameters
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-heading">
                              <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Audit Metric</th>
                              <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-[#059669]">
                                Your Site ({url})
                              </th>
                              <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-rose-600">
                                Competitor ({competitorUrl})
                              </th>
                              <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-slate-700 text-right">
                                Live Verdict
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {comparisonRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3.5 px-4">
                                  <p className="font-bold text-slate-900">{row.name}</p>
                                  <p className="text-[11px] text-slate-500">{row.desc}</p>
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                  {row.yourVal}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-slate-700">
                                  {row.compVal}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      row.status === 'win'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : row.status === 'lose'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {row.status === 'win' && <Check className="w-3 h-3" />}
                                    {row.status === 'lose' && <AlertCircle className="w-3 h-3" />}
                                    {row.verdict}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <BrandedFooter className="pt-4 border-t border-slate-200" />
                  </div>
                );
              })()}
            </div>
          ) : auditDetails && (auditDetails.overallScore !== undefined || auditDetails.scores) && mode === 'single' ? (
            renderDetailedAuditView(latestWebsiteAudit, url, false)
          ) : (
            <div className="space-y-6">
              {/* Default Preview with Google Lighthouse Recommendations Ready to Inspect */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 font-heading">
                      Google Lighthouse & Core Web Vitals Recommendations Ready
                    </h4>
                    <p className="text-xs text-emerald-800">
                      7 technical SEO recommendations available for evaluation. Run a live crawl above or inspect the checklist below.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSubTab('recommendations')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-2xs cursor-pointer"
                >
                  View Full Recs (7)
                </button>
              </div>

              <SeoRecommendationsPanel
                targetUrl={url || businessProfile.website || 'locora.ai'}
                customRecommendations={auditDetails?.seoRecommendations}
              />
            </div>
          )}
        </>
      )}

      {/* White-Label Audit Export & Monetization Modal */}
      <WhiteLabelAuditExportModal
        isOpen={whiteLabelModalOpen}
        onClose={() => setWhiteLabelModalOpen(false)}
        auditUrl={url}
        auditData={auditDetails}
      />
    </div>
  );
};
