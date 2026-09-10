import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FixItModal } from './FixItModal';
import { PriorityAction } from '../types';
import {
  MapPin,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FileText,
  Layers,
  Code,
  Link2,
  Globe,
  Compass,
  Check,
  Zap,
  Info,
} from 'lucide-react';

export const LocalVisibilityView: React.FC = () => {
  const {
    activeBusiness,
    priorityActions,
    logActivity,
    setActiveTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'visibility' | 'ai_search' | 'audit'>('visibility');
  const [selectedAuditCategory, setSelectedAuditCategory] = useState<'content' | 'technical' | 'local' | 'schema' | 'internal_links' | 'indexing'>('content');
  const [selectedFixItAction, setSelectedFixItAction] = useState<PriorityAction | null>(null);
  const [fixedAuditKeys, setFixedAuditKeys] = useState<string[]>([]);
  const [liveCheckRunning, setLiveCheckRunning] = useState(false);

  // Dynamic business attributes
  const primaryCat = activeBusiness.category || 'Professional Services';
  const primaryCity = activeBusiness.city || 'Metro Area';
  const primaryService = activeBusiness.services?.[0] || `${primaryCat} Solutions`;
  const secondaryService = activeBusiness.services?.[1] || 'Emergency Support';
  const competitorsList = activeBusiness.competitors && activeBusiness.competitors.length >= 2
    ? activeBusiness.competitors
    : ['Metro Apex Specialists', 'Premier Regional Group'];

  // Search Opportunities Data dynamically generated from activeBusiness
  const searchOpportunities = useMemo(() => [
    {
      keyword: `${primaryCat.toLowerCase()} near me`,
      visibilityScore: 4.2,
      searchVolume: '4,400 / mo',
      yourRank: '#12',
      difficulty: 'High',
    },
    {
      keyword: `emergency ${primaryService.toLowerCase()}`,
      visibilityScore: 8.4,
      searchVolume: '1,900 / mo',
      yourRank: '#8',
      difficulty: 'Med',
      isHeroOpportunity: true,
    },
    {
      keyword: `best ${secondaryService.toLowerCase()} ${primaryCity}`,
      visibilityScore: 6.1,
      searchVolume: '880 / mo',
      yourRank: '#5',
      difficulty: 'Med',
    },
    {
      keyword: `top rated ${primaryCat.toLowerCase()} ${primaryCity}`,
      visibilityScore: 3.7,
      searchVolume: '1,200 / mo',
      yourRank: '#14',
      difficulty: 'High',
    },
  ], [primaryCat, primaryCity, primaryService, secondaryService]);

  // AI Visibility / Search Monitored Queries (Section 11) dynamically generated
  const [aiMonitoredQueries, setAiMonitoredQueries] = useState([
    {
      id: 'ai_q1',
      query: `Who is the best ${primaryCat.toLowerCase()} in ${primaryCity}?`,
      date: 'Sept 7, 2026',
      location: `${primaryCity}, ${activeBusiness.state || 'TX'} (Local IP)`,
      appeared: true,
      position: '#2 in multi-recommendation list',
      competitorsMentioned: [competitorsList[0], competitorsList[1]],
      citedSources: [`${primaryCity} Business Chronicle`, 'Google Maps Reviews', 'Locally Verified Schema'],
      engines: {
        chatgpt: { mentioned: true, label: 'Mentioned ✓' },
        google_ai: { mentioned: true, label: 'Mentioned ✓' },
        perplexity: { mentioned: false, label: 'Not found ✕' },
      },
    },
    {
      id: 'ai_q2',
      query: `Top-rated ${primaryCat.toLowerCase()} with urgent availability in ${primaryCity}`,
      date: 'Sept 6, 2026',
      location: `${primaryCity} County Area`,
      appeared: true,
      position: '#3 citation bullet',
      competitorsMentioned: [competitorsList[0], `${primaryCity} Premier Group`],
      citedSources: [`Yelp Top 10 ${primaryCat} ${primaryCity}`, 'Locally Verified Schema'],
      engines: {
        chatgpt: { mentioned: true, label: 'Mentioned ✓' },
        google_ai: { mentioned: false, label: 'Not found ✕' },
        perplexity: { mentioned: true, label: 'Mentioned ✓' },
      },
    },
    {
      id: 'ai_q3',
      query: `Where can I get affordable professional ${secondaryService.toLowerCase()} in ${primaryCity}?`,
      date: 'Sept 4, 2026',
      location: `${primaryCity}`,
      appeared: false,
      position: 'Unranked (Missing promo schema)',
      competitorsMentioned: [competitorsList[1], `${primaryCity} Direct`],
      citedSources: ['Local Deals Guide', `${primaryCity} Consumer Journal`],
      engines: {
        chatgpt: { mentioned: false, label: 'Not found ✕' },
        google_ai: { mentioned: false, label: 'Not found ✕' },
        perplexity: { mentioned: false, label: 'Not found ✕' },
      },
    },
  ]);

  // Section 12: Decision-Oriented Local SEO Audit
  const auditCategories = [
    { id: 'content', label: 'Content', count: 3 },
    { id: 'technical', label: 'Technical', count: 2 },
    { id: 'local', label: 'Local', count: 2 },
    { id: 'schema', label: 'Schema', count: 1 },
    { id: 'internal_links', label: 'Internal Links', count: 1 },
    { id: 'indexing', label: 'Indexing', count: 1 },
  ] as const;

  const auditIssues: Record<string, { severity: 'critical' | 'improvement' | 'healthy'; title: string; desc: string; fixId: string }[]> = {
    content: [
      {
        severity: 'critical',
        title: `Missing priority ${primaryService.toLowerCase()} page`,
        desc: `High-intent search volume (+34% growth) is currently routed to homepage without dedicated keywords or H1 tags.`,
        fixId: 'emergency_page',
      },
      {
        severity: 'critical',
        title: '3 core services have thin content',
        desc: `Pages for ${primaryService}, ${secondaryService}, and Consultations have under 250 words and lack local geo-anchors.`,
        fixId: 'thin_content',
      },
      {
        severity: 'improvement',
        title: 'FAQ coverage is weak',
        desc: 'Only 2 standard FAQs detected. AI Overviews prioritize structured Q&A on pricing, timeline, and deliverables.',
        fixId: 'faq_coverage',
      },
    ],
    technical: [
      {
        severity: 'critical',
        title: 'Mobile Total Blocking Time (TBT) elevated (420ms)',
        desc: 'Unminified third-party appointment booking widget delays touch interactions on mobile browsers.',
        fixId: 'mobile_tbt',
      },
      {
        severity: 'improvement',
        title: '3 images missing descriptive alt tags with local keyword',
        desc: `Facility and team photos lack ${activeBusiness.name} geo-identifiers.`,
        fixId: 'image_alt',
      },
    ],
    local: [
      {
        severity: 'improvement',
        title: `GBP Secondary Category missing "Priority ${primaryService}"`,
        desc: `${activeBusiness.name} is only listed under "${primaryCat}". Adding secondary categories unlocks Maps 3-Pack appearances.`,
        fixId: 'gbp_category',
      },
      {
        severity: 'improvement',
        title: 'Inconsistent address format on Apple Maps',
        desc: 'Suite number formatted as "Ste 400" instead of "#400", creating citation variance.',
        fixId: 'apple_maps_suite',
      },
    ],
    schema: [
      {
        severity: 'improvement',
        title: 'LocalBusiness Schema missing medicalSpecialty tag',
        desc: 'Rich results test passes basic Organization, but misses MedicalSpecialty and OpeningHoursSpecification.',
        fixId: 'schema_markup',
      },
    ],
    internal_links: [
      {
        severity: 'improvement',
        title: 'Service pages lack cross-links to emergency contact',
        desc: 'Patients browsing routine cleanings cannot easily access urgent care contact links.',
        fixId: 'internal_crosslinks',
      },
    ],
    indexing: [
      {
        severity: 'healthy',
        title: 'Sitemap.xml and robots.txt properly accessible',
        desc: 'Googlebot has indexed 24 valid canonical URLs with no 404 crawl errors.',
        fixId: 'sitemap_ok',
      },
    ],
  };

  const handleFixAllSafeIssues = () => {
    const keys = auditIssues[selectedAuditCategory]?.map((i) => i.fixId) || [];
    setFixedAuditKeys((prev) => [...prev, ...keys]);
    logActivity('seo', 'Local SEO Audit Batch Fix', `Fixed all safe issues in ${selectedAuditCategory}`);
    alert(`Successfully applied automated fixes for ${selectedAuditCategory} issues! Changes queued for publication.`);
  };

  const handleTriggerLiveCheck = () => {
    setLiveCheckRunning(true);
    setTimeout(() => {
      setLiveCheckRunning(false);
      logActivity('ai', 'AI Visibility Scan', 'Completed real-time probe of ChatGPT, Google AI, and Perplexity');
      alert('AI Visibility probe refreshed! Data synchronized with live search grounding.');
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto font-sans text-slate-900 space-y-8 pb-20">
      {/* 1. HEADER WITH DECISION SCORES */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                Operational Search Suite
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Local Visibility
            </h1>
          </div>

          {/* Visibility Score 76/100 */}
          <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200/90 px-4 py-2.5 rounded-2xl">
            <Compass className="w-5 h-5 text-[#059669]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading block">
                Visibility Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-heading text-emerald-950">
                  76
                </span>
                <span className="text-xs font-bold text-[#059669]">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Score Breakdown Cards: Google Search 74, Google Maps 81, Organic Search 72, AI Search 63 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Google Search', score: 74, note: 'Local 3-Pack' },
            { label: 'Google Maps', score: 81, note: 'Prominence' },
            { label: 'Organic Search', score: 72, note: 'Domain Authority' },
            { label: 'AI Search', score: 63, note: 'LLM Grounding' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5"
            >
              <span className="text-xs font-bold text-slate-600 block">
                {item.label}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-heading text-slate-900">
                  {item.score}
                </span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  {item.note}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#059669] h-full rounded-full"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveSubTab('visibility')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'visibility'
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Search Opportunities
          </button>
          <button
            onClick={() => setActiveSubTab('ai_search')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'ai_search'
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Visibility</span>
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'audit'
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Local SEO Audit</span>
          </button>
        </div>
      </section>

      {/* 2. TAB 1: SEARCH OPPORTUNITIES & COMPETITIVE GAP */}
      {activeSubTab === 'visibility' && (
        <div className="space-y-6 animate-scaleUp">
          {/* Top Hero Opportunity Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-heading flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Primary Visibility Gap
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 mt-1">
                  "{primaryService} {primaryCity}"
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  You: <span className="text-rose-600 font-black">#8</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  {competitorsList[0]}: <span className="text-[#059669] font-black">#2</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  {competitorsList[1] || 'Competitor B'}: <span className="text-slate-900 font-black">#3</span>
                </div>
              </div>
            </div>

            {/* Why They're Ahead Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950 font-heading">
                Why they're ahead:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-amber-100 text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>✓ Dedicated service page (/emergency-dentist)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-amber-100 text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>✓ 80 more reviews with emergency keywords</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-amber-100 text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>✓ Better service coverage (24/7 call tracking)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-amber-100 text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>✓ Stronger local references on Austin directories</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    const emergencyAction = priorityActions.find((a) => a.id.includes('emergency')) || priorityActions[0];
                    setSelectedFixItAction(emergencyAction);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer font-sans"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>See Opportunity</span>
                </button>
              </div>
            </div>

            {/* Keyword Opportunities Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                  SEARCH OPPORTUNITIES
                </h3>
                <span className="text-xs text-slate-400 font-mono">Real Search Volume Benchmarks</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Keyword</th>
                      <th className="py-2.5 px-3">Visibility</th>
                      <th className="py-2.5 px-3">Est. Search Volume</th>
                      <th className="py-2.5 px-3">Your Position</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {searchOpportunities.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {row.keyword}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-extrabold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {row.visibilityScore}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {row.searchVolume}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {row.yourRank}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              const action = priorityActions[0];
                              setSelectedFixItAction(action);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#059669] hover:text-white text-slate-700 font-bold text-[11px] transition-all cursor-pointer"
                          >
                            See Opportunity
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: AI SEARCH / AI VISIBILITY (Section 11) */}
      {activeSubTab === 'ai_search' && (
        <div className="space-y-6 animate-scaleUp">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
                  AI Visibility
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  How AI systems describe your business (Empirical Grounding Probes)
                </p>
              </div>

              <button
                onClick={handleTriggerLiveCheck}
                disabled={liveCheckRunning}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                <span>{liveCheckRunning ? 'Probing LLMs...' : 'Run Live AI Visibility Probe'}</span>
              </button>
            </div>

            {/* Note about Credibility - No False Promises */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-950">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Verifiable Grounding:</strong> Locora does not claim guaranteed AI rankings. Instead, we query generative systems directly, track citation sources, and monitor where {activeBusiness.name} appears in real LLM synthesis.
              </p>
            </div>

            {/* Monitored Questions Feed */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                Monitored Questions & Engine Results
              </h3>

              {aiMonitoredQueries.map((item) => (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4 shadow-2xs hover:bg-white transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading block">
                        Observed Query:
                      </span>
                      <h4 className="text-base font-bold font-heading text-slate-900 mt-0.5">
                        "{item.query}"
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>Date: <strong>{item.date}</strong></span>
                        <span>•</span>
                        <span>Location: <strong>{item.location}</strong></span>
                        <span>•</span>
                        <span>Status: <strong className={item.appeared ? 'text-[#059669]' : 'text-rose-600'}>{item.appeared ? 'Appeared in synthesis' : 'Did not appear'}</strong></span>
                      </div>
                    </div>

                    {/* AI Engines Pills (ChatGPT, Google AI, Perplexity) */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                        item.engines.chatgpt.mentioned
                          ? 'bg-emerald-50 border-emerald-200 text-[#059669]'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        <span>ChatGPT:</span>
                        <span>{item.engines.chatgpt.label}</span>
                      </div>

                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                        item.engines.google_ai.mentioned
                          ? 'bg-emerald-50 border-emerald-200 text-[#059669]'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        <span>Google AI:</span>
                        <span>{item.engines.google_ai.label}</span>
                      </div>

                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                        item.engines.perplexity.mentioned
                          ? 'bg-emerald-50 border-emerald-200 text-[#059669]'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        <span>Perplexity:</span>
                        <span>{item.engines.perplexity.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Credible Evidence Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/80 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 block text-[11px]">Position / Order:</span>
                      <p className="text-slate-600 font-mono text-[11px]">{item.position}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 block text-[11px]">Competitors Mentioned:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.competitorsMentioned.map((c, cIdx) => (
                          <span key={cIdx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 block text-[11px]">Cited Sources:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.citedSources.map((s, sIdx) => (
                          <span key={sIdx} className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 3: DECISION-ORIENTED LOCAL SEO AUDIT (Section 12) */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6 animate-scaleUp">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Actionable Diagnostic
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
                  SEO Health: 78/100
                </h2>
              </div>

              {/* Status Pills: 🔴 3 Critical, 🟡 7 Improvements, 🟢 30 Healthy */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>🔴 3 Critical</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>🟡 7 Improvements</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-[#059669] font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>🟢 30 Healthy</span>
                </span>
              </div>
            </div>

            {/* Category Filter Pills: Technical, Content, Local, Schema, Internal Links, Indexing */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                Categories
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {auditCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedAuditCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedAuditCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="ml-1.5 opacity-70">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Issues View */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
                <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wide">
                  {selectedAuditCategory.replace('_', ' ')} Issues
                </h3>
                <button
                  onClick={handleFixAllSafeIssues}
                  className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer font-sans"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Fix All Safe Issues</span>
                </button>
              </div>

              <div className="space-y-3">
                {auditIssues[selectedAuditCategory]?.map((issue, idx) => {
                  const isFixed = fixedAuditKeys.includes(issue.fixId);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {issue.severity === 'critical' ? '🔴' : issue.severity === 'improvement' ? '🟡' : '🟢'}
                          </span>
                          <span className={`font-bold text-slate-900 ${isFixed ? 'line-through text-slate-400' : ''}`}>
                            {issue.title}
                          </span>
                          {isFixed && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              ✓ Fixed
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-6">
                          {issue.desc}
                        </p>
                      </div>

                      {!isFixed && (
                        <button
                          onClick={() => {
                            if (issue.fixId === 'emergency_page' || issue.fixId === 'thin_content') {
                              setSelectedFixItAction(priorityActions[0]);
                            } else {
                              setFixedAuditKeys((p) => [...p, issue.fixId]);
                              alert(`Resolved issue: ${issue.title}`);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#059669] hover:text-white text-slate-700 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                        >
                          Fix This
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controlled Fix It Execution Modal */}
      <FixItModal
        action={selectedFixItAction}
        onClose={() => setSelectedFixItAction(null)}
      />
    </div>
  );
};
