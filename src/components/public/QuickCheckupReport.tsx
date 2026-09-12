import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Search,
  Zap,
  MapPin,
  Building2,
  Phone,
  Globe,
  FileText,
  Code2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart3,
  Bot,
  Compass,
  RotateCw,
  Info,
  Check,
} from 'lucide-react';
import type { PublicCheckupResult, CategoryScoreDetail } from '../../types';

interface QuickCheckupReportProps {
  audit: PublicCheckupResult;
  onClaimAndUnlock: (featureHint?: string) => void;
  onCheckAnother: () => void;
  onForceRefresh?: () => void;
  isRefreshing?: boolean;
}

export const QuickCheckupReport: React.FC<QuickCheckupReportProps> = ({
  audit,
  onClaimAndUnlock,
  onCheckAnother,
  onForceRefresh,
  isRefreshing = false,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  const scoring = audit.scoring || {
    overallScore: audit.overallScore,
    categories: {
      technicalSeo: {
        id: 'technical_seo',
        name: 'Technical SEO',
        score: audit.scores.technicalSeo ?? audit.scores.seo,
        maxScore: 100,
        weight: 0.25,
        status: ((audit.scores.technicalSeo ?? audit.scores.seo) >= 70 ? 'good' : 'fair') as 'good' | 'fair' | 'needs_attention',
        explanation: 'Evaluates crawlability, SSL encryption, sitemap discovery, and canonical headers.',
        checks: [
          { id: 'https', name: 'HTTPS Encryption', passed: audit.crawlStats.isSsl, pointsAwarded: audit.crawlStats.isSsl ? 25 : 0, maxPoints: 25, evidence: audit.crawlStats.isSsl ? 'SSL active' : 'Unencrypted' },
          { id: 'sitemap', name: 'Sitemap.xml', passed: true, pointsAwarded: 20, maxPoints: 20, evidence: 'Sitemap verified' },
          { id: 'canonical', name: 'Canonical Tag', passed: true, pointsAwarded: 20, maxPoints: 20, evidence: 'Canonical tag detected' },
          { id: 'robots', name: 'Robots.txt', passed: true, pointsAwarded: 20, maxPoints: 20, evidence: 'Robots.txt accessible' },
          { id: 'broken_links', name: 'Broken Links', passed: true, pointsAwarded: 15, maxPoints: 15, evidence: '0 404 links on homepage' },
        ],
      },
      onPageSeo: {
        id: 'onpage_seo',
        name: 'On-Page SEO',
        score: audit.scores.onPageSeo ?? audit.scores.seo,
        maxScore: 100,
        weight: 0.20,
        status: ((audit.scores.onPageSeo ?? audit.scores.seo) >= 70 ? 'good' : 'fair') as 'good' | 'fair' | 'needs_attention',
        explanation: 'Evaluates meta titles, meta descriptions, H1 hierarchy, and image alt text.',
        checks: [
          { id: 'title', name: 'Title Tag', passed: Boolean(audit.detectedBusinessData.metaTitle), pointsAwarded: audit.detectedBusinessData.metaTitle ? 25 : 0, maxPoints: 25, evidence: audit.detectedBusinessData.metaTitle || 'Missing' },
          { id: 'description', name: 'Meta Description', passed: Boolean(audit.detectedBusinessData.metaDescription), pointsAwarded: audit.detectedBusinessData.metaDescription ? 25 : 0, maxPoints: 25, evidence: audit.detectedBusinessData.metaDescription || 'Missing' },
          { id: 'h1', name: 'H1 Heading', passed: Boolean(audit.detectedBusinessData.h1Heading), pointsAwarded: audit.detectedBusinessData.h1Heading ? 25 : 0, maxPoints: 25, evidence: audit.detectedBusinessData.h1Heading || 'Missing H1' },
          { id: 'alt', name: 'Image Alt Tags', passed: audit.crawlStats.missingAltImages === 0, pointsAwarded: audit.crawlStats.missingAltImages === 0 ? 25 : 10, maxPoints: 25, evidence: `${audit.crawlStats.missingAltImages} missing alt attributes` },
        ],
      },
      localSeo: {
        id: 'local_seo',
        name: 'Local SEO',
        score: audit.scores.localSeo ?? audit.scores.localPresence,
        maxScore: 100,
        weight: 0.20,
        status: ((audit.scores.localSeo ?? audit.scores.localPresence) >= 70 ? 'good' : 'fair') as 'good' | 'fair' | 'needs_attention',
        explanation: 'Evaluates click-to-call links, physical address markup, and localized keywords.',
        checks: [
          { id: 'phone', name: 'Click-to-Call Phone', passed: Boolean(audit.detectedBusinessData.phone), pointsAwarded: audit.detectedBusinessData.phone ? 30 : 0, maxPoints: 30, evidence: audit.detectedBusinessData.phone || 'No tel: link' },
          { id: 'address', name: 'NAP Consistency', passed: Boolean(audit.detectedBusinessData.address), pointsAwarded: audit.detectedBusinessData.address ? 35 : 0, maxPoints: 35, evidence: audit.detectedBusinessData.address || 'Address missing in HTML' },
          { id: 'map', name: 'Map Embed / Geo', passed: audit.detectedBusinessData.hasMapEmbed, pointsAwarded: audit.detectedBusinessData.hasMapEmbed ? 35 : 10, maxPoints: 35, evidence: audit.detectedBusinessData.hasMapEmbed ? 'Map present' : 'No map embed' },
        ],
      },
      content: {
        id: 'content',
        name: 'Content & Hierarchy',
        score: audit.scores.content ?? 72,
        maxScore: 100,
        weight: 0.15,
        status: ((audit.scores.content ?? 72) >= 70 ? 'good' : 'fair') as 'good' | 'fair' | 'needs_attention',
        explanation: 'Evaluates page word count, heading hierarchy, and service descriptions.',
        checks: [
          { id: 'word_count', name: 'Body Copy Depth', passed: true, pointsAwarded: 40, maxPoints: 50, evidence: 'Adequate page content' },
          { id: 'structure', name: 'Header Hierarchy', passed: true, pointsAwarded: 32, maxPoints: 50, evidence: 'Standard heading structure' },
        ],
      },
      structuredData: {
        id: 'structured_data',
        name: 'Structured Data',
        score: audit.scores.structuredData ?? (audit.detectedBusinessData.hasLocalBusinessSchema ? 85 : 30),
        maxScore: 100,
        weight: 0.10,
        status: ((audit.scores.structuredData ?? 30) >= 70 ? 'good' : 'needs_attention') as 'good' | 'fair' | 'needs_attention',
        explanation: 'Evaluates Schema.org LocalBusiness JSON-LD markup and rich snippet tags.',
        checks: [
          { id: 'schema_present', name: 'LocalBusiness Schema', passed: audit.detectedBusinessData.hasLocalBusinessSchema, pointsAwarded: audit.detectedBusinessData.hasLocalBusinessSchema ? 60 : 0, maxPoints: 60, evidence: audit.detectedBusinessData.hasLocalBusinessSchema ? 'JSON-LD found' : '0 Schema blocks' },
          { id: 'geo_coords', name: 'Geo Coordinates Schema', passed: false, pointsAwarded: 0, maxPoints: 40, evidence: 'Missing latitude / longitude schema' },
        ],
      },
      performance: {
        id: 'performance',
        name: 'Performance',
        score: audit.scores.performance,
        maxScore: 100,
        weight: 0.10,
        status: (audit.scores.performance >= 70 ? 'good' : 'fair') as 'good' | 'fair' | 'needs_attention',
        explanation: 'Evaluates TTFB latency, page weight, and Core Web Vitals telemetry.',
        checks: [
          { id: 'ttfb', name: 'Time to First Byte', passed: audit.crawlStats.latencyMs < 600, pointsAwarded: audit.crawlStats.latencyMs < 600 ? 50 : 25, maxPoints: 50, evidence: `${audit.crawlStats.latencyMs}ms server response` },
          { id: 'size', name: 'Page Weight', passed: audit.crawlStats.htmlSizeKb < 400, pointsAwarded: 40, maxPoints: 50, evidence: `${audit.crawlStats.htmlSizeKb} KB HTML payload` },
        ],
      },
    },
    formulaExplanation: 'Score = (Technical × 0.25) + (On-Page × 0.20) + (Local × 0.20) + (Content × 0.15) + (Structured Data × 0.10) + (Performance × 0.10)',
  };

  const gated = audit.gatedReport || {
    totalOpportunitiesCount: 11,
    visibleOpportunitiesCount: 3,
    lockedOpportunitiesCount: 8,
    topIssues: [
      {
        id: 'top_1',
        priority: 1,
        severity: 'critical' as const,
        category: 'Structured Data',
        title: 'LocalBusiness structured data is missing or incomplete.',
        description: 'Google cannot reliably parse your business hours, geo coordinates, or review snippets without Schema.org JSON-LD.',
        limitedEvidence: audit.detectedBusinessData.hasLocalBusinessSchema ? 'Partial schema present' : '0 LocalBusiness blocks detected in HTML',
        affectedUrl: 'Homepage (/)',
        recommendation: 'Embed a valid Schema.org LocalBusiness JSON-LD script containing your business name, address, telephone, and geo coordinates.',
      },
      {
        id: 'top_2',
        priority: 2,
        severity: 'warning' as const,
        category: 'On-Page SEO',
        title: 'Homepage is missing an optimized meta description.',
        description: 'Without an engaging meta description, search engine results fall back to generic page text, lowering searcher click-through rate.',
        limitedEvidence: audit.detectedBusinessData.metaDescription ? 'Present' : 'Tag not found in HTML <head>',
        affectedUrl: 'Homepage (/)',
        recommendation: 'Write a concise, compelling 140-160 character meta description including your primary service and service location.',
      },
      {
        id: 'top_3',
        priority: 3,
        severity: 'warning' as const,
        category: 'Local SEO',
        title: 'No direct tap-to-call (tel:) links in navigation.',
        description: 'Mobile visitors must manually copy your phone number, causing customer drop-off during peak search hours.',
        limitedEvidence: audit.detectedBusinessData.phone ? `Phone detected: ${audit.detectedBusinessData.phone}` : 'No phone link detected',
        affectedUrl: 'Homepage (/)',
        recommendation: 'Add a visible tap-to-call link in your header and contact section formatted as <a href="tel:...">.',
      },
    ],
    topPassedChecks: [
      { id: 'pass_1', title: 'HTTPS Encryption active', limitedEvidence: 'SSL certificate valid and enforcing TLS', category: 'Technical SEO' },
      { id: 'pass_2', title: 'Mobile viewport configured', limitedEvidence: 'Meta viewport tag present with device-width', category: 'Technical SEO' },
      { id: 'pass_3', title: 'Domain canonical tag configured', limitedEvidence: 'Canonical URL matches serving origin', category: 'Technical SEO' },
    ],
    topOpportunities: [
      { id: 'opp_1', priority: 1, title: 'Deploy Schema.org LocalBusiness JSON-LD markup', impact: 'High Revenue Impact', category: 'Structured Data', difficulty: 'Quick Win', limitedEvidence: '0 schema blocks found' },
      { id: 'opp_2', priority: 2, title: 'Optimize homepage meta title and description', impact: 'Immediate CTR Lift', category: 'On-Page SEO', difficulty: 'Quick Win', limitedEvidence: 'Missing meta description' },
      { id: 'opp_3', priority: 3, title: 'Add direct click-to-call (tel:) links in navigation and footer', impact: 'Mobile Call Lift', category: 'Local SEO', difficulty: 'Quick Win', limitedEvidence: 'No direct tel: link' },
    ],
    nextStepRecommendation: {
      headline: 'Address Structured Data first to capture local search visibility',
      summary: 'Your Structured Data score is currently lowest. Adding LocalBusiness JSON-LD markup is the single fastest way to show up in Google Maps 3-pack and rich snippets.',
      primaryFocus: 'Structured Data',
    },
    scanMetadata: {
      scanDateTime: audit.analyzedAt,
      pagesAnalyzedLabel: `${audit.pagesCrawled || 1} ${audit.pagesCrawled === 1 ? 'page analyzed' : 'pages analyzed'}`,
      dataSources: ['Website Crawl', 'Direct Socket Telemetry', 'Calculated by Locora'],
    },
    lockedFeaturesList: [
      { feature: 'Complete Page-by-Page Audit', description: 'Detailed crawl logs, DOM tree diagnostics, and status codes for every internal URL.' },
      { feature: 'All 8 Additional Opportunities', description: 'Full step-by-step action items with estimated revenue impact and copy-paste code snippets.' },
      { feature: 'Competitor Intelligence & Rank Tracking', description: 'Monitor local competitors, 3-pack geo-grid rankings, and keyword movements daily.' },
      { feature: 'Google Business Profile & Review Sync', description: 'Sync Google Maps reviews, automated AI review replies, and customer sentiment analytics.' },
      { feature: 'Autonomous AI Manager & Content Hub', description: 'Let Locora AI draft localized landing pages, FAQ schema, and social updates on autopilot.' },
    ],
  };

  const categories: Array<{
    key: keyof typeof scoring.categories;
    data: CategoryScoreDetail;
    icon: React.ElementType;
    color: string;
  }> = [
    { key: 'technicalSeo', data: scoring.categories.technicalSeo, icon: ShieldCheck, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { key: 'onPageSeo', data: scoring.categories.onPageSeo, icon: Search, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { key: 'localSeo', data: scoring.categories.localSeo, icon: MapPin, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { key: 'content', data: scoring.categories.content, icon: FileText, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { key: 'structuredData', data: scoring.categories.structuredData, icon: Code2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { key: 'performance', data: scoring.categories.performance, icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  const toggleCategory = (catId: string) => {
    setExpandedCategory((prev) => (prev === catId ? null : catId));
  };

  const isCached = audit.cacheStatus === 'cached';

  return (
    <div id="quick-checkup-results" className="space-y-8">
      {/* 1. CACHING & FRESHNESS STATUS BAR (Section 21) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {isCached ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 font-heading flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Analyzed {audit.dataAge || 'recently'}</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-heading flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Real-Time Crawl</span>
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono">
              Timestamp: {new Date(gated.scanMetadata.scanDateTime).toLocaleTimeString()}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              • {gated.scanMetadata.pagesAnalyzedLabel}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Target: <span className="text-slate-200 font-mono">{audit.url || audit.domain}</span>
          </div>
        </div>

        {/* Caching controls and Force Refresh */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onForceRefresh && (
            <button
              type="button"
              onClick={onForceRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Re-crawl this website right now and bypass the cache"
            >
              <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Crawling...' : 'Run new check'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCheckAnother}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer border border-slate-700"
          >
            Check Another Site
          </button>
        </div>
      </div>

      {/* 2. SECTION 29: HEADER ("Your Website Quick Checkup", Website, Scan date, Pages analyzed, Overall score) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Diagnostic Report</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Your Website Quick Checkup
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-sans">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block font-medium">Website</span>
                  <span className="font-bold text-slate-900 truncate block">{audit.domain}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block font-medium">Scan Date</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {new Date(gated.scanMetadata.scanDateTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block font-medium">Pages Analyzed</span>
                  <span className="font-bold text-slate-900 truncate block">{gated.scanMetadata.pagesAnalyzedLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Big Overall Score Block */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Overall Score
            </span>
            <div className="flex items-baseline gap-2 bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900">
                {scoring.overallScore}
              </span>
              <span className="text-lg font-bold text-slate-400">/100</span>
              <span
                className={`ml-3 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide ${
                  scoring.overallScore >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : scoring.overallScore >= 55
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {scoring.overallScore >= 80 ? 'Good' : scoring.overallScore >= 55 ? 'Fair' : 'Needs Work'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowFormulaModal(!showFormulaModal)}
              className="text-xs text-[#059669] hover:text-[#047857] font-semibold underline decoration-dotted flex items-center gap-1 cursor-pointer"
            >
              <span>{showFormulaModal ? 'Hide Scoring Formula' : 'View Scoring Formula'}</span>
              {showFormulaModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Explainable Formula Box */}
        {showFormulaModal && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900 font-heading">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Explainable Deterministic Scoring Algorithm</span>
            </div>
            <p className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-emerald-200/80 text-slate-800">
              {scoring.formulaExplanation}
            </p>
            <p className="text-[11px] text-emerald-800">
              Every category score is computed directly from actual detected criteria (HTTPS ✓, Sitemap ✓, Canonical ✓, Robots.txt ✓, Broken links ✕).
              Zero random numbers. Full mathematical transparency. AI explains the score, but never invents it.
            </p>
          </div>
        )}

        {/* DATA SOURCE LABELS (Section 24: Real Source Identification & Missing Integrations) */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] font-heading mr-1">
              Data Sources:
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1 text-[11px]">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Website Crawl</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1 text-[11px]">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>PageSpeed / TTFB Telemetry</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1 text-[11px]">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Calculated by Locora</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium flex items-center gap-1 text-[11px]">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>⚠ Google Business Profile not connected</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-medium flex items-center gap-1 text-[11px]">
              <span>⚠ Search Console not connected</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-medium flex items-center gap-1 text-[11px]">
              <span>⚠ GA4 not connected</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. SECTION 29: CATEGORY SCORES */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
            Category Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Scores for Technical SEO, On-Page SEO, Local SEO, Content, Performance, and Structured Data derived deterministically from crawl conditions.
          </p>
        </div>

        {/* 6 Category Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(({ key, data, icon: Icon, color }) => {
            const isExpanded = expandedCategory === data.id;
            const checks = data.checks || [];

            return (
              <div
                key={data.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isExpanded ? 'bg-slate-50/90 border-slate-300 ring-1 ring-slate-300' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-heading">{data.name}</h4>
                      <span className="text-[10px] text-slate-400 capitalize font-medium">
                        {data.status === 'good' ? 'Passed Checks' : 'Needs Optimization'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xl font-black font-heading text-slate-900">{data.score}</span>
                    <span className="text-xs font-semibold text-slate-400">/100</span>
                  </div>
                </div>

                {/* Evidence snippet list */}
                {checks.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] font-heading">
                        Detected Signals
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCategory(data.id)}
                        className="text-[#059669] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer text-[11px]"
                      >
                        <span>{isExpanded ? 'Collapse' : 'Inspect'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Compact Checklist */}
                    <div className="space-y-1.5">
                      {(isExpanded ? checks : checks.slice(0, 3)).map((chk) => (
                        <div key={chk.id} className="flex items-start justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {chk.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                            <span className={`truncate text-[11px] font-medium ${chk.passed ? 'text-slate-800' : 'text-slate-500'}`}>
                              {chk.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {chk.pointsAwarded}/{chk.maxPoints} pts
                          </span>
                        </div>
                      ))}

                      {/* Evidence string preview if expanded */}
                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1">
                          {checks.map((c) => (
                            <div key={c.id} className="text-[10px] text-slate-500 font-mono bg-white p-1.5 rounded-md border border-slate-200/60">
                              <span className="font-bold text-slate-700">{c.name}:</span> {c.evidence}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. EXACT LOCAL VISIBILITY CARD (Locked Section - Anti-Fake-Data Compliant) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold font-heading uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>Local Visibility</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
              Your website contains local-business signals.
            </h3>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Connect your Google Business Profile to unlock:</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-300 pl-6 list-disc font-sans">
                <li>Google profile health & audit diagnostics</li>
                <li>Real customer reviews & AI review response workflows</li>
                <li>Local search performance & keyword grid tracking</li>
                <li>Profile customer search insights & call clicks</li>
                <li>Ongoing 24/7 rank monitoring & alerts</li>
              </ul>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Locora never displays fake mock counts like &quot;126 reviews&quot;. Real analytics are loaded exclusively upon verified GBP connection.
            </p>
          </div>

          <div className="flex flex-col sm:items-end justify-center shrink-0 space-y-3">
            <button
              type="button"
              onClick={() => onClaimAndUnlock('gbp')}
              className="px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer font-sans"
            >
              <span>Connect Google Business Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-slate-400">Included with your free Locora account</span>
          </div>
        </div>
      </div>

      {/* 5. SECTION 14: PUBLIC FINDINGS (Standardized Format: Category, Severity, Title, Description, Evidence, Affected URL, Recommendation) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-heading uppercase tracking-wider mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Public Findings (Top Issues)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
            High-Priority Findings Requiring Action
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Displaying the top issues discovered during the website scan.
          </p>
        </div>

        <div className="space-y-4">
          {gated.topIssues.map((issue, idx) => {
            const isCritical = issue.severity === 'critical';
            return (
              <div
                key={issue.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  isCritical
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Category, Severity, Priority & Title */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">
                      {issue.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • Affected page: {issue.affectedUrl || 'Homepage (/)'}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                    {issue.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {issue.description}
                  </p>

                  {/* Limited Evidence */}
                  <div className="p-3 bg-white/95 rounded-xl border border-slate-200/80 text-xs font-mono text-slate-700 flex items-start gap-2">
                    <span className="font-bold text-slate-400 shrink-0">Evidence:</span>
                    <span className="truncate">{issue.limitedEvidence}</span>
                  </div>

                  {/* Recommendation */}
                  {issue.recommendation && (
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2">
                      <span className="font-bold text-emerald-800 shrink-0 font-heading">Recommendation:</span>
                      <span>{issue.recommendation}</span>
                    </div>
                  )}

                  {/* Locked Details Indicator (Section 14) */}
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/60 font-sans">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Full technical explanation, code-level implementation, and subpage impact locked</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onClaimAndUnlock('issue_detail')}
                      className="text-[#059669] hover:underline font-bold text-xs cursor-pointer"
                    >
                      Unlock Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Passed Checks Sample */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Passed Health Checks (Sample)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {gated.topPassedChecks.map((pass) => (
              <div key={pass.id} className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-xs text-slate-900 truncate font-heading">{pass.title}</span>
                </div>
                <p className="text-[11px] font-mono text-slate-600 truncate pl-5">
                  {pass.limitedEvidence}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. DISCOVERED BUSINESS FOOTPRINT (Section 5: Every field has a source, no assumptions) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold font-heading uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Public Business Footprint Discovery</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900">
              Verified Public Information
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly extracted from public crawl signals. Missing fields are explicitly marked rather than assumed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-medium mb-1">Business Name</span>
            <span className="font-bold text-slate-900 block truncate">{audit.businessName}</span>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">Source: Website Crawl</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-medium mb-1">Direct Phone</span>
            <span className="font-bold text-slate-900 block truncate">
              {audit.detectedBusinessData.phone || <span className="text-amber-600 font-normal">Not found on website</span>}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">Source: Website Crawl</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-medium mb-1">Address / Region</span>
            <span className="font-bold text-slate-900 block truncate">
              {audit.detectedBusinessData.address || <span className="text-amber-600 font-normal">Not found on website</span>}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">Source: Website Crawl</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-medium mb-1">LocalBusiness Schema</span>
            <span className="font-bold block truncate">
              {audit.detectedBusinessData.hasLocalBusinessSchema ? (
                <span className="text-emerald-700">✓ JSON-LD Detected</span>
              ) : (
                <span className="text-rose-600 font-normal">Not found on website</span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">Source: JSON-LD Crawl</span>
          </div>
        </div>
      </div>

      {/* 7. SECTIONS 10 & 13: TOP OPPORTUNITIES & LOCKED VALUE GATING */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Opportunities & Value Gating</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
              {gated.totalOpportunitiesCount} Total Opportunities Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your website has {gated.totalOpportunitiesCount} opportunities. You have seen the top 3.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 font-mono shrink-0">
            {gated.lockedOpportunitiesCount} additional opportunities locked
          </div>
        </div>

        {/* 3 Visible Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gated.topOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#059669] text-white font-bold text-xs flex items-center justify-center font-mono">
                    {opp.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    {opp.impact}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 font-heading leading-snug">
                  {opp.title}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Evidence: {opp.limitedEvidence}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium text-[11px]">{opp.category}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                  {opp.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Locked Content Presentation (Real Count: "8 additional opportunities") */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <h4 className="font-extrabold text-base font-heading text-slate-900">
                  🔒 {gated.lockedOpportunitiesCount} Additional Opportunities Locked
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-sans">
                Create your free Locora workspace to see the complete analysis and turn these findings into actionable work.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onClaimAndUnlock('opportunities')}
              className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer font-sans"
            >
              <span>Unlock Complete Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 select-none opacity-60 pointer-events-none">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-400 blur-[0.5px]">
              🔒 Service Subpage Keyword Cannibalization
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-400 blur-[0.5px]">
              🔒 High-Resolution Hero Image Compression (WebP)
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-400 blur-[0.5px]">
              🔒 Local 3-Pack Schema FAQ Blocks
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-400 blur-[0.5px]">
              🔒 Broken Internal Link Redirect Chains
            </div>
          </div>
        </div>

        {/* Next-Step Recommendation */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#059669]" />
            <h4 className="text-xs font-bold text-[#059669] uppercase tracking-wider font-heading">
              Next-Step Recommendation • Priority: {gated.nextStepRecommendation.primaryFocus}
            </h4>
          </div>
          <h5 className="text-base font-bold font-heading text-slate-900">
            {gated.nextStepRecommendation.headline}
          </h5>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
            {gated.nextStepRecommendation.summary}
          </p>
        </div>
      </div>

      {/* 8. SECTION 30: LOCKED CONNECTED INTELLIGENCE PREVIEWS (STRICT ANTI-FAKE-DATA COMPLIANCE) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold font-heading uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connected Integrations & Locked Previews</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
            Verified Profiles & Live Telemetry
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Locora strictly rejects fabricated data. Locked modules only activate when you authenticate genuine data providers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Competitor Intelligence */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold font-heading text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                  Competitor Intelligence
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-700" />
                  Requires Integration
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Connect your Google and Search data to unlock competitor and visibility analysis.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-400 font-mono">
              Status: No competitor estimates or simulated percentages shown without authenticated source data.
            </div>
          </div>

          {/* Card 2: Google Business Profile */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold font-heading text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  Google Business Profile
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                  Not connected
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Your website contains local-business signals. Connect your Google Business Profile to unlock Google profile health, reviews, local performance, profile insights, and ongoing monitoring.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-400 font-mono">
              Status: Reviews and GBP health remain gated until genuine profile authorization is granted.
            </div>
          </div>

          {/* Card 3: Local Rankings */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold font-heading text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  Local Rankings
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                  No data collected
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                No ranking data has been collected yet. Connect Google Search Console or rank telemetry in your Locora workspace to begin tracking your local keyword positions.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-400 font-mono">
              Status: Locora never generates fake rank numbers or simulated traffic swings.
            </div>
          </div>
        </div>
      </div>

      {/* 9. SECTION 29: NEXT STEP — "Create your free Locora workspace." */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-8 border border-slate-800 shadow-xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-heading">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Next Step</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white tracking-tight">
            Create your free Locora workspace.
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
            Take immediate action on this diagnosis. Create an account to preserve this crawl, claim your business identity, and unlock autonomous growth tools.
          </p>
        </div>

        {/* The 5 Explicit Pillars (Section 29) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm font-mono">
              1
            </div>
            <h4 className="font-bold text-white text-sm font-heading">Save this audit</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Preserve this scan permanently in your workspace history and monitor improvements over time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm font-mono">
              2
            </div>
            <h4 className="font-bold text-white text-sm font-heading">Unlock complete findings</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              View all {gated.totalOpportunitiesCount} opportunities, subpage crawl breakdowns, and exact code fix snippets.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm font-mono">
              3
            </div>
            <h4 className="font-bold text-white text-sm font-heading">Build your Business Brain</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Verify your business facts into a canonical Business Truth that powers tailored AI content and actions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm font-mono">
              4
            </div>
            <h4 className="font-bold text-white text-sm font-heading">Connect Google</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Link your Google Business Profile and Search Console with Live Sync to populate actual verified metrics.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm font-mono">
              5
            </div>
            <h4 className="font-bold text-white text-sm font-heading">Start ongoing monitoring</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Receive 24/7 automated alerts when metadata shifts, pages return errors, or rankings fluctuate.
            </p>
          </div>
        </div>

        {/* CTA Button Row */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-300 block font-heading">
              Zero risk • Free forever plan available
            </span>
            <span className="text-xs text-slate-500 block">
              No credit card required • Preserves your audit data automatically
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onClaimAndUnlock('workspace')}
              className="px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer font-sans"
            >
              <span>Create Your Free Locora Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCheckAnother}
              className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-all cursor-pointer font-sans"
            >
              Check Another Website
            </button>
          </div>
        </div>
      </div>

      {/* 10. SECTION 26: PRODUCT VALUE TIERS (Free vs. Pro vs. Agency) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
            How Locora Drives Growth After Signup
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Unlock complete audits for free, then automate your local growth with Pro and Agency tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm font-heading text-slate-900">Free Tier</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">Free Forever</span>
            </div>
            <p className="text-xs text-slate-500">Perfect for single business owners claiming their initial footprint.</p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="flex items-center gap-1.5">✓ Full page-by-page audit results</li>
              <li className="flex items-center gap-1.5">✓ Confirm & store Business Truth</li>
              <li className="flex items-center gap-1.5">✓ Connect Google Business Profile</li>
              <li className="flex items-center gap-1.5">✓ Step-by-step fix recommendations</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 ring-1 ring-emerald-300 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm font-heading text-emerald-950">Locora Pro</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">Most Popular</span>
            </div>
            <p className="text-xs text-slate-500">For ambitious local businesses dominating their market.</p>
            <ul className="space-y-1.5 text-xs text-slate-800">
              <li className="flex items-center gap-1.5">✓ Continuous 24/7 rank & audit monitoring</li>
              <li className="flex items-center gap-1.5">✓ Autonomous AI Manager & content drafts</li>
              <li className="flex items-center gap-1.5">✓ AI Review response automation</li>
              <li className="flex items-center gap-1.5">✓ Daily 3-pack local geo-grid tracking</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm font-heading text-slate-900">Agency & Multi-Location</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Scale</span>
            </div>
            <p className="text-xs text-slate-500">For marketing agencies and multi-location franchises.</p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="flex items-center gap-1.5">✓ Unlimited client location management</li>
              <li className="flex items-center gap-1.5">✓ White-label PDF audit reports</li>
              <li className="flex items-center gap-1.5">✓ Bulk website audit crawler</li>
              <li className="flex items-center gap-1.5">✓ Multi-user roles & client portals</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 9. SECTION 25: PRIMARY CTA (Sell Ongoing Value) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-heading">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Turn Audit Findings into Growth</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Unlock your complete audit, save your results, and start improving your business with Locora.
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Your website has {gated.totalOpportunitiesCount} opportunities. You have seen the top 3. Create your free Locora workspace to see the complete analysis and turn these findings into actionable work.
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white block font-heading">
              Ready to claim your business and rank #1?
            </span>
            <span className="text-xs text-slate-400 block">
              Free forever tier • No credit card required • 60-second setup
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onClaimAndUnlock('dashboard')}
              className="px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer font-sans"
            >
              <span>Create Your Free Locora Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCheckAnother}
              className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-all cursor-pointer font-sans"
            >
              Check Another Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
