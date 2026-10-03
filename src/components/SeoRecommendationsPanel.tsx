import React, { useState } from 'react';
import { SeoRecommendation } from '../types';
import { DEFAULT_SEO_RECOMMENDATIONS } from '../data/seoRecommendationsData';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Smartphone,
  ShieldCheck,
  Zap,
  Layers,
  Maximize2,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Filter,
  FileText,
  User,
  Gauge,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Eye,
  CheckSquare,
  Square,
  ArrowRight,
  Info,
} from 'lucide-react';

interface SeoRecommendationsPanelProps {
  customRecommendations?: SeoRecommendation[];
  targetUrl?: string;
  className?: string;
}

export const SeoRecommendationsPanel: React.FC<SeoRecommendationsPanelProps> = ({
  customRecommendations,
  targetUrl = 'your website',
  className = '',
}) => {
  const [recommendations, setRecommendations] = useState<SeoRecommendation[]>(() => {
    return customRecommendations && customRecommendations.length > 0
      ? customRecommendations
      : DEFAULT_SEO_RECOMMENDATIONS;
  });

  const [filterCategory, setFilterCategory] = useState<'all' | 'cwv' | 'mobile' | 'security'>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable states
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});
  const [expandedCode, setExpandedCode] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPlan, setCopiedPlan] = useState(false);

  // Selected affected pages modal/inspector
  const [activePageModal, setActivePageModal] = useState<SeoRecommendation | null>(null);

  // Toggle affected pages view
  const togglePages = (id: string) => {
    setExpandedPages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle code snippet view
  const toggleCode = (id: string) => {
    setExpandedCode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Update status of recommendation
  const updateStatus = (id: string, newStatus: 'needs_fix' | 'in_progress' | 'resolved') => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status: newStatus } : rec))
    );
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyActionPlan = () => {
    const lines: string[] = [
      `# Google Lighthouse SEO & Core Web Vitals Action Plan for ${targetUrl}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      `## Summary: ${recommendations.filter((r) => r.status === 'resolved').length} of ${recommendations.length} Recommendations Resolved`,
      '',
    ];

    recommendations.forEach((rec, idx) => {
      lines.push(`### ${idx + 1}. ${rec.title}`);
      lines.push(`- **Metric / Benchmark**: ${rec.metricName} (${rec.benchmark})`);
      lines.push(`- **SEO Impact**: ${rec.seoImpact}`);
      lines.push(`- **Technical Difficulty**: ${rec.technicalDifficulty}`);
      lines.push(`- **Assigned Role**: ${rec.role}`);
      lines.push(`- **Pages Affected**: ${rec.pagesAffectedCount} pages`);
      lines.push(`- **Status**: ${rec.status.toUpperCase().replace('_', ' ')}`);
      lines.push(`- **Recommended By**: ${rec.recommendedBy}`);
      lines.push(`- **Description**: ${rec.description}`);
      lines.push(`- **Fix Guide**: ${rec.howToFix}`);
      lines.push('');
      lines.push('**Affected URLs:**');
      rec.affectedPages.forEach((p) => {
        lines.push(`  - \`${p.path}\` (${p.title || 'Page'}): ${p.issueDetail}`);
      });
      lines.push('');
      if (rec.codeSnippet) {
        lines.push('**Recommended Code Solution:**');
        lines.push('```');
        lines.push(rec.codeSnippet);
        lines.push('```');
        lines.push('');
      }
      lines.push('---');
      lines.push('');
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);
  };

  // Filter recommendations
  const filtered = recommendations.filter((rec) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = rec.title.toLowerCase().includes(q);
      const matchDesc = rec.description.toLowerCase().includes(q);
      const matchMetric = rec.metricName.toLowerCase().includes(q);
      const matchRole = rec.role.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchMetric && !matchRole) return false;
    }

    // Category
    if (filterCategory === 'cwv' && !['TBT', 'CLS', 'LCP'].includes(rec.metricCode)) {
      return false;
    }
    if (filterCategory === 'mobile' && !['VIEWPORT', 'TAP_TARGETS', 'FONT_SIZE'].includes(rec.metricCode)) {
      return false;
    }
    if (filterCategory === 'security' && rec.metricCode !== 'HTTPS') {
      return false;
    }

    // Role
    if (filterRole !== 'all' && rec.role !== filterRole) {
      return false;
    }

    // Impact
    if (filterImpact !== 'all' && rec.seoImpact !== filterImpact) {
      return false;
    }

    return true;
  });

  const resolvedCount = recommendations.filter((r) => r.status === 'resolved').length;
  const progressPercent = Math.round((resolvedCount / recommendations.length) * 100);

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* Top Banner / Google Lighthouse Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Lighthouse & Core Web Vitals Audit</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black font-heading tracking-tight text-white flex items-center gap-2.5">
              <span>Technical SEO & Performance Recommendations</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Actionable, high-impact technical recommendations evaluated against Google's Core Web Vitals, mobile responsiveness criteria, and HTTPS security standards for <strong className="text-emerald-300 font-bold">{targetUrl}</strong>.
            </p>
          </div>

          {/* Quick Metrics Progress Card */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 min-w-[240px] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Audit Resolution:</span>
              <span className="font-mono font-bold text-emerald-400">
                {resolvedCount} of {recommendations.length} checks passing ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>7 Total Recommendations</span>
              <button
                onClick={handleCopyActionPlan}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedPlan ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPlan ? 'Copied Plan!' : 'Copy Action Plan'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Category:</span>
          </span>
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Recommendations ({recommendations.length})
          </button>
          <button
            onClick={() => setFilterCategory('cwv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterCategory === 'cwv'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Core Web Vitals (TBT, CLS, LCP)</span>
          </button>
          <button
            onClick={() => setFilterCategory('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterCategory === 'mobile'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>Mobile Usability & Layout</span>
          </button>
          <button
            onClick={() => setFilterCategory('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterCategory === 'security'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>HTTPS Security</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Sub-Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recommendations, metrics, or roles (e.g. TBT, LCP, Developer, Font)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg p-2 focus:outline-none focus:border-[#059669]"
          >
            <option value="all">All Assigned Roles</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Web Designer">Web Designer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
          </select>

          {/* Impact Filter */}
          <select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg p-2 focus:outline-none focus:border-[#059669]"
          >
            <option value="all">All SEO Impacts</option>
            <option value="Critical">Critical Impact</option>
            <option value="High">High Impact</option>
            <option value="Medium">Medium Impact</option>
          </select>
        </div>
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-4">
        {filtered.map((rec) => {
          const isPagesOpen = !!expandedPages[rec.id];
          const isCodeOpen = !!expandedCode[rec.id];

          return (
            <div
              key={rec.id}
              className={`bg-white border rounded-2xl p-5 md:p-6 transition-all duration-200 space-y-4 ${
                rec.status === 'resolved'
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : rec.seoImpact === 'Critical'
                  ? 'border-rose-200/90 shadow-2xs hover:border-rose-300'
                  : 'border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {/* Header Row */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Metric Tag */}
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      {rec.metricName}
                    </span>

                    {/* Benchmark Goal */}
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Goal: {rec.benchmark}
                    </span>

                    {/* Recommended By Google Lighthouse */}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>Recommended by: {rec.recommendedBy}</span>
                    </span>
                  </div>

                  <h4 className="text-base md:text-lg font-black font-heading text-slate-900 leading-snug">
                    {rec.title}
                  </h4>
                </div>

                {/* Status Switcher & Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => updateStatus(rec.id, 'needs_fix')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        rec.status === 'needs_fix'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Needs Fix
                    </button>
                    <button
                      onClick={() => updateStatus(rec.id, 'in_progress')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        rec.status === 'in_progress'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateStatus(rec.id, 'resolved')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        rec.status === 'resolved'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Badges Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {/* SEO Impact */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">SEO Impact:</span>
                  <div className="font-bold flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        rec.seoImpact === 'Critical'
                          ? 'bg-rose-500'
                          : rec.seoImpact === 'High'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    ></span>
                    <span
                      className={
                        rec.seoImpact === 'Critical'
                          ? 'text-rose-700'
                          : rec.seoImpact === 'High'
                          ? 'text-amber-700'
                          : 'text-blue-700'
                      }
                    >
                      {rec.seoImpact}
                    </span>
                  </div>
                </div>

                {/* Technical Difficulty */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Technical Difficulty:
                  </span>
                  <p className="font-bold text-slate-800">{rec.technicalDifficulty}</p>
                </div>

                {/* Role */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Role:</span>
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{rec.role}</span>
                  </p>
                </div>

                {/* Pages Affected */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-0.5 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Pages Affected:
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rec.pagesAffectedCount} Pages</span>
                    <button
                      onClick={() => togglePages(rec.id)}
                      className="text-[11px] font-bold text-[#059669] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isPagesOpen ? 'Hide' : 'View pages'}</span>
                      {isPagesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                <p>{rec.description}</p>
                <div className="text-slate-900 font-semibold pt-1 border-t border-slate-200/60 flex items-start gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">How to Fix:</strong> {rec.howToFix}
                  </span>
                </div>
              </div>

              {/* Expandable Affected Pages Drawer */}
              {isPagesOpen && (
                <div className="p-4 bg-emerald-50/30 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#059669]" />
                      <h5 className="text-xs font-bold font-heading text-slate-900">
                        Affected URLs & Page Issues ({rec.affectedPages.length} listed)
                      </h5>
                    </div>
                    <span className="text-[10px] text-slate-500">Live Crawl Diagnostics</span>
                  </div>

                  <div className="space-y-2">
                    {rec.affectedPages.map((page, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {page.path}
                          </span>
                          {page.title && <span className="text-slate-500 font-medium text-[11px]">{page.title}</span>}
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">
                          <strong className="text-slate-800">Issue Diagnostic:</strong> {page.issueDetail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Fix Expandable Action */}
              {rec.codeSnippet && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleCode(rec.id)}
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5 text-[#059669]" />
                      <span>{isCodeOpen ? 'Hide Developer Code Solution' : 'View Code Solution & Fix Template'}</span>
                    </button>

                    {isCodeOpen && (
                      <button
                        onClick={() => handleCopyCode(rec.id, rec.codeSnippet!)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === rec.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === rec.id ? 'Copied Solution!' : 'Copy Code'}</span>
                      </button>
                    )}
                  </div>

                  {isCodeOpen && (
                    <div className="relative">
                      <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
                        <code>{rec.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No recommendations match your current filters</p>
            <p className="text-xs text-slate-500">Try resetting the category, search, or role filters above.</p>
            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterRole('all');
                setFilterImpact('all');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
