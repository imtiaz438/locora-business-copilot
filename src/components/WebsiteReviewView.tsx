import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WebsiteAuditResult } from '../types';
import { BrandedFooter } from './BrandedFooter';
import { SeoRecommendationsPanel } from './SeoRecommendationsPanel';
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
} from 'lucide-react';

export const WebsiteReviewView: React.FC = () => {
  const { businessProfile, latestWebsiteAudit, setLatestWebsiteAudit, settings, user, updateUser, logActivity, setCheckoutModalPlan, setActiveTab } = useApp();

  const [mode, setMode] = useState<'single' | 'competitor'>('single');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'recommendations'>('overview');
  const [url, setUrl] = useState(businessProfile.website || 'locora.ai');
  const [competitorUrl, setCompetitorUrl] = useState('competitor-example.com');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Competitor state
  const [competitorAudit, setCompetitorAudit] = useState<WebsiteAuditResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || loading) return;

    setLoading(true);
    setApiError(null);

    try {
      const activeModel = (settings.providerModels && settings.providerModels[settings.activeProvider]) || settings.activeModelVersion;

      if (mode === 'single') {
        const response = await fetch('/api/ai/audit-website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            businessProfile,
            provider: settings.activeProvider,
            modelVersion: activeModel,
            providerKey: settings.providerKeys[settings.activeProvider],
            userEmail: user.email,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Website review failed');

        if (typeof data.creditsUsed === 'number') {
          updateUser({ aiCreditsUsed: data.creditsUsed });
        }

        setLatestWebsiteAudit(data);
        logActivity('audit', 'Ran Website Audit', `Audited ${url}`);
      } else {
        // Run side-by-side audit on both your URL and competitor URL
        const [res1, res2] = await Promise.all([
          fetch('/api/ai/audit-website', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url,
              businessProfile,
              provider: settings.activeProvider,
              modelVersion: activeModel,
              providerKey: settings.providerKeys[settings.activeProvider],
              userEmail: user.email,
            }),
          }),
          fetch('/api/ai/audit-website', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: competitorUrl,
              businessProfile,
              provider: settings.activeProvider,
              modelVersion: activeModel,
              providerKey: settings.providerKeys[settings.activeProvider],
              userEmail: user.email,
            }),
          }),
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        if (res1.ok) setLatestWebsiteAudit(data1);
        if (res2.ok) setCompetitorAudit(data2);

        logActivity('competitor', 'Ran Competitor Snapshot', `Compared ${url} vs ${competitorUrl}`);
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Audit Overview</span>
            </button>
            <button
              onClick={() => setActiveSubTab('recommendations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'recommendations' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Lighthouse Recs</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                activeSubTab === 'recommendations' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
              }`}>
                7
              </span>
            </button>
          </div>

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

      {/* API Error Notification */}
      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-3 text-rose-900 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-rose-950">AI Model Error / Invalid Key</div>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">{apiError}</p>
              <div className="mt-2 text-[11px] text-rose-600 font-medium">
                Note: No workspace credits were deducted. Please verify your API key in settings.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="text-xs font-semibold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm"
            >
              Open AI Settings
            </button>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-rose-400 hover:text-rose-700 p-1 text-xs transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
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

      {/* SubTab View: Single or Competitor Audit Overview */}
      {activeSubTab === 'overview' && (
        <>
          {/* Competitor Side-By-Side Comparison Grid */}
          {mode === 'competitor' && compDetails && auditDetails && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-2xs font-sans">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold font-heading text-lg">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>Side-by-Side Competitor Matrix</span>
                </div>
                <span className="text-xs text-slate-500">Evaluated using identical audit criteria</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Your Website Card */}
                <div className="p-5 rounded-2xl border-2 border-[#059669]/30 bg-emerald-50/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] bg-emerald-100 px-2 py-0.5 rounded font-heading">
                        Your Site
                      </span>
                      <h3 className="text-lg font-black text-slate-900 font-heading mt-1 truncate max-w-[200px]">{url}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-[#059669] font-heading">{auditDetails.overallScore}</span>
                      <p className="text-[10px] text-slate-500">Overall Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px]">SEO Score</span>
                      <p className="font-bold text-slate-900 text-sm">{auditDetails.scores?.seo ?? 80}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px]">Speed & Performance</span>
                      <p className="font-bold text-slate-900 text-sm">{auditDetails.scores?.performance ?? 80}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px]">Accessibility</span>
                      <p className="font-bold text-slate-900 text-sm">{auditDetails.scores?.accessibility ?? 80}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px]">SSL Security</span>
                      <p className="font-bold text-[#059669] text-sm">Active</p>
                    </div>
                  </div>
                </div>

                {/* Competitor Website Card */}
                <div className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded font-heading">
                        Competitor
                      </span>
                      <h3 className="text-lg font-black text-slate-900 font-heading mt-1 truncate max-w-[200px]">{competitorUrl}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-rose-600 font-heading">{compDetails.overallScore}</span>
                      <p className="text-[10px] text-slate-500">Overall Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px]">SEO Score</span>
                      <p className="font-bold text-slate-900 text-sm">{compDetails.scores?.seo ?? 75}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px]">Speed & Performance</span>
                      <p className="font-bold text-slate-900 text-sm">{compDetails.scores?.performance ?? 70}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px]">Accessibility</span>
                      <p className="font-bold text-slate-900 text-sm">{compDetails.scores?.accessibility ?? 75}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px]">SSL Security</span>
                      <p className="font-bold text-slate-900 text-sm">Active</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Outcome Banner */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>
                    {auditDetails.overallScore >= compDetails.overallScore
                      ? `Your website scores ${auditDetails.overallScore - compDetails.overallScore} points higher overall than ${competitorUrl}!`
                      : `${competitorUrl} is currently ${compDetails.overallScore - auditDetails.overallScore} points ahead. Follow the action items below to overtake them.`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Results View for single audit */}
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 font-sans shadow-2xs">
              <Sparkles className="w-8 h-8 text-[#059669] animate-spin mx-auto" />
              <p className="text-sm font-bold font-heading text-slate-900">Crawling live website and auditing technical SEO...</p>
              <p className="text-xs text-slate-500">Extracting real meta titles, descriptions, headings, load speed, and JSON-LD schema.</p>
            </div>
          ) : auditDetails && (auditDetails.overallScore !== undefined || auditDetails.scores) && mode === 'single' ? (
            <div className="space-y-6">
              {/* Top Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-center shadow-2xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Overall Score</p>
                  <p className="text-4xl font-black font-heading text-[#059669]">{auditDetails.overallScore}</p>
                  <p className="text-[11px] text-slate-500 font-sans">Weighted Health</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-center shadow-2xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">SEO Score</p>
                  <p className="text-3xl font-black font-heading text-emerald-600">{auditDetails.scores?.seo ?? 80}</p>
                  <p className="text-[11px] text-slate-500 font-sans">Meta & On-Page</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-center shadow-2xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Performance</p>
                  <p className="text-3xl font-black font-heading text-blue-600">{auditDetails.scores?.performance ?? 80}</p>
                  <p className="text-[11px] text-slate-500 font-sans">Speed & Assets</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-center shadow-2xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Accessibility</p>
                  <p className="text-3xl font-black font-heading text-purple-600">{auditDetails.scores?.accessibility ?? 80}</p>
                  <p className="text-[11px] text-slate-500 font-sans">Tags & Contrast</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-center shadow-2xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Best Practices</p>
                  <p className="text-3xl font-black font-heading text-amber-600">{auditDetails.scores?.bestPractices ?? 80}</p>
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
                    {auditDetails.aiSummary}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Top Actionable Recommendations</h4>
                    <div className="space-y-1.5">
                      {auditDetails.actionableSteps?.map((step: string, idx: number) => (
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
                  <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#059669]" />
                    <span>Extracted On-Page Tags</span>
                  </h3>

                  <div className="space-y-3 text-xs text-slate-700 font-sans">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Meta Title</span>
                      <p className="font-semibold text-slate-900 break-words">{metadata?.title || 'Not Detected'}</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Meta Description</span>
                      <p className="text-slate-700 break-words">{metadata?.description || 'No Meta Description Found'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span>SSL HTTPS:</span>
                        <strong className={metadata?.sslActive ? 'text-[#059669]' : 'text-rose-600'}>
                          {metadata?.sslActive ? 'Active' : 'Missing'}
                        </strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span>H1 Count:</span>
                        <strong className="text-slate-900 font-bold">{metadata?.h1Count ?? 0}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Google Lighthouse Recommendations Section */}
              <div className="pt-2">
                <SeoRecommendationsPanel
                  targetUrl={url || businessProfile.website || 'locora.ai'}
                  customRecommendations={auditDetails?.seoRecommendations}
                />
              </div>

              <BrandedFooter className="pt-4 border-t border-slate-200" />
            </div>
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
    </div>
  );
};
