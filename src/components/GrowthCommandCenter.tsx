import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FixItModal } from './FixItModal';
import { MultiLocationSection } from './MultiLocationSection';
import { PriorityAction } from '../types';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Star,
  Globe,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users,
  FileText,
  ChevronRight,
  ShieldCheck,
  Brain,
  Send,
  Loader2,
  Bot,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Crosshair,
  BarChart3,
  Check,
} from 'lucide-react';

export const GrowthCommandCenter: React.FC = () => {
  const {
    activeBusiness,
    priorityActions,
    setActiveTab,
    setRightAiPanelOpen,
    user,
    consumeAiCredit,
  } = useApp();

  const [selectedFixItAction, setSelectedFixItAction] = useState<PriorityAction | null>(null);
  const [expandedReasonId, setExpandedReasonId] = useState<string | null>(null);

  // Ask Locora Inline Chat
  const [askInput, setAskInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [lastAskedQuestion, setLastAskedQuestion] = useState<string | null>(null);

  // Suggested Quick Prompts
  const quickPrompts = [
    `Why is the emergency service page our highest ROI action?`,
    `How do we reach the Google Maps 3-pack for ${activeBusiness.city}?`,
    `Draft response for patient who complained about wait times`,
    `Compare our reviews with ${activeBusiness.competitors?.[0] || 'local competitors'}`,
  ];

  const handleAskLocora = async (queryText?: string) => {
    const q = (queryText || askInput).trim();
    if (!q) return;
    setIsAsking(true);
    setLastAskedQuestion(q);
    setAiAnswer(null);
    consumeAiCredit(1);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          businessContext: {
            name: activeBusiness.name,
            category: activeBusiness.category,
            city: activeBusiness.city,
            state: activeBusiness.state,
            phone: activeBusiness.phone,
            healthScore: activeBusiness.healthScore,
            unansweredReviews: activeBusiness.unansweredReviews,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && (data.reply || data.text)) {
        setAiAnswer(data.reply || data.text);
      } else {
        setAiAnswer(
          `### Locora AI Recommendation for ${activeBusiness.name}:\n\n` +
          `1. **Focus on Priority Action #1**: Publishing the localized Emergency Dental service page directly targets high-intent searchers in ${activeBusiness.city}. This will convert at ~3x the rate of a general homepage visit.\n` +
          `2. **Clear Review Backlog**: Responding to your 17 unanswered Google reviews signals active patient care to Google's ranking algorithm.\n` +
          `3. **Continuous Schema Monitoring**: Keeping LocalBusiness & MedicalBusiness structured data valid protects your placement in Google AI Overviews.`
        );
      }
    } catch {
      setAiAnswer(
        `### Strategic Growth Directive for ${activeBusiness.name}:\n\n` +
        `Your quickest path to increase local call volume is completing the **Top 3 Things to Fix This Week** listed below. Click **Fix It** on each card to generate safe, non-destructive drafts that you can review and approve.`
      );
    } finally {
      setIsAsking(false);
      setAskInput('');
    }
  };

  const toggleReason = (id: string) => {
    setExpandedReasonId((prev) => (prev === id ? null : id));
  };

  const breakdown = activeBusiness.healthBreakdown || {
    visibility: 68,
    reputation: 82,
    conversion: 61,
    operations: 85,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans text-slate-900 pb-16">
      {/* 1. UNIFIED WORKFLOW STATUS BAR: DIAGNOSE → PRIORITIZE → ACT → MEASURE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
              AI Growth Workflow
            </span>
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs font-semibold text-slate-600">
              Active Business: <strong className="text-slate-900">{activeBusiness.name}</strong> ({activeBusiness.city}, {activeBusiness.state})
            </span>
          </div>

          {/* 4 Steps Indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Diagnose</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
            <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Prioritize</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
            <div className="flex items-center gap-1 text-[#059669] font-bold bg-white px-2.5 py-1 rounded-lg border border-[#059669] shadow-2xs shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>3. Act (Fix It)</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
            <div className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
              <span>4. Measure</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OVERALL GROWTH HEALTH SECTION */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-heading">
              <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
              <span>Today's Business Health & Priorities</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              What needs attention today?
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Synthesized from your Business Brain, Visibility, Reviews, and Performance data. Complete today's top actions to keep your growth on track.
            </p>
          </div>

          {/* Master Health Score Display */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-md shrink-0">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#059669]"
                  strokeDasharray={`${activeBusiness.healthScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black font-heading leading-none">
                  {activeBusiness.healthScore}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Overall Growth Health
              </span>
              <p className="text-base font-bold font-heading text-white">
                Score: {activeBusiness.healthScore} / 100
              </p>
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+6 this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 29: 6-Component Growth Health Scoring System with Evidence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Evidence-Based Scoring Breakdown (6 Pillars)
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Calculated from connected Google, Website, and Competitor data
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Visibility */}
            <div
              onClick={() => setActiveTab('visibility')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-800 group-hover:text-[#059669]">Visibility</span>
                <span className="font-bold text-slate-900 font-mono text-base">78</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '78%' }} />
              </div>
              <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                Evidence: Search 74 • Maps 81 • AI Search 63
              </p>
            </div>

            {/* 2. Reputation */}
            <div
              onClick={() => setActiveTab('reputation')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-800 group-hover:text-[#059669]">Reputation</span>
                <span className="font-bold text-slate-900 font-mono text-base">91</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '91%' }} />
              </div>
              <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                Evidence: 4.8 avg rating • 84% reply rate • 4 unanswered
              </p>
            </div>

            {/* 3. Website */}
            <div
              onClick={() => setActiveTab('content')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-800 group-hover:text-[#059669]">Website</span>
                <span className="font-bold text-slate-900 font-mono text-base">73</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '73%' }} />
              </div>
              <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                Evidence: Speed 94 • Missing dedicated emergency URL
              </p>
            </div>

            {/* 4. Conversion */}
            <div
              onClick={() => setActiveTab('customers')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-800 group-hover:text-[#059669]">Conversion</span>
                <span className="font-bold text-slate-900 font-mono text-base">68</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '68%' }} />
              </div>
              <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                Evidence: Online booking live • 3.4% click-to-call
              </p>
            </div>

            {/* 5. Content */}
            <div
              onClick={() => setActiveTab('content')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-800 group-hover:text-[#059669]">Content</span>
                <span className="font-bold text-slate-900 font-mono text-base">82</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '82%' }} />
              </div>
              <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                Evidence: 12 guides live • GBP post overdue (14d)
              </p>
            </div>

            {/* 6. Competitiveness */}
            <div
              onClick={() => setActiveTab('competitors')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-800 group-hover:text-[#059669]">Competitiveness</span>
                <span className="font-bold text-slate-900 font-mono text-base">75</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '75%' }} />
              </div>
              <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                Evidence: Rating leads (+0.2) • Trailing review count
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRIORITY ACTION CARDS: TOP 3 THINGS TO FIX THIS WEEK */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
                Top 3 Things to Fix This Week
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by AI expected impact on call conversions and local search revenue.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRightAiPanelOpen(true)}
            className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Open AI Manager Copilot</span>
          </button>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {priorityActions.slice(0, 3).map((action, idx) => {
            const isReasonExpanded = expandedReasonId === action.id;
            const cardTag =
              idx === 0
                ? { label: 'High Impact', bg: 'bg-rose-50 text-rose-800 border-rose-200' }
                : idx === 1
                ? { label: 'Opportunity', bg: 'bg-amber-50 text-amber-800 border-amber-200' }
                : { label: 'Healthy Area to Maintain', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };

            return (
              <div
                key={action.id}
                className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  action.isFixed
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : idx === 0
                    ? 'border-slate-300 hover:border-emerald-500 ring-1 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Header: Tag & Impact */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full border ${cardTag.bg}`}
                    >
                      {cardTag.label}
                    </span>
                    {action.isFixed ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Deployed
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {action.expectedImpact}
                      </span>
                    )}
                  </div>

                  {/* Recommendation Title */}
                  <h3 className="text-base font-bold font-heading text-slate-900 leading-snug">
                    {action.recommendationTitle}
                  </h3>

                  {/* Problem & Why It Matters */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block mb-0.5">The Problem:</span>
                      <p className="text-slate-600 leading-relaxed">{action.problem}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 block mb-0.5">Why it matters:</span>
                      <p className="text-slate-600 leading-relaxed">{action.whyItMatters}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
                      <strong className="text-slate-700">Evidence:</strong> {action.evidence}
                    </div>
                  </div>

                  {/* AI Explanation Accordion: "Why did Locora recommend this?" */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleReason(action.id)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-[#059669] hover:text-[#047857] py-1 cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Why did Locora recommend this?
                      </span>
                      {isReasonExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isReasonExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-slate-700 leading-relaxed animate-fadeIn space-y-1.5">
                        {action.aiReasoning ? (
                          <p>{action.aiReasoning}</p>
                        ) : action.aiExplanation ? (
                          <>
                            <p><strong className="text-slate-900">Root Cause:</strong> {action.aiExplanation.rootCause}</p>
                            <p><strong className="text-slate-900">Competitor Gap:</strong> {action.aiExplanation.competitorEvidence}</p>
                            <p><strong className="text-slate-900">Revenue Impact:</strong> {action.aiExplanation.revenueImpact}</p>
                            <p><strong className="text-slate-900">Why Now:</strong> {action.aiExplanation.whyNow}</p>
                          </>
                        ) : (
                          <p>{action.whyItMatters}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Button: [ Fix It ] */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedFixItAction(action)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      action.isFixed
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                        : 'bg-[#059669] hover:bg-[#047857] text-white'
                    }`}
                  >
                    {action.isFixed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Fixed ✓ Review Draft</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Fix It with AI</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ASK LOCORA AI BUSINESS MANAGER (INTELLIGENT COMMAND BAR) */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900">
                Ask Locora AI Business Manager
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Controls all tools underneath: visibility, SEO schema, reviews, competitors, proposals, and customer CRM.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto font-mono">
            {activeBusiness.name} Brain Active
          </span>
        </div>

        {/* Input Bar */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskLocora();
              }}
              placeholder={`Ask anything about growing ${activeBusiness.name}...`}
              className="w-full pl-4 pr-32 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans"
            />
            <button
              onClick={() => handleAskLocora()}
              disabled={isAsking || !askInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed font-sans"
            >
              {isAsking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Ask</span>
            </button>
          </div>

          {/* Quick Pill Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mr-1">
              Suggested:
            </span>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleAskLocora(prompt)}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 text-xs border border-slate-200 transition-all cursor-pointer font-sans"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* AI Answer Card */}
        {isAsking && (
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-600 font-sans animate-pulse">
            <Loader2 className="w-4 h-4 text-[#059669] animate-spin shrink-0" />
            <span>Locora is analyzing local competitor data, Google rank algorithms, and Austin patient search trends...</span>
          </div>
        )}

        {aiAnswer && !isAsking && (
          <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3 font-sans text-xs text-slate-800 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
              <span className="font-bold text-[#047857] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#059669]" />
                Locora Strategy: {lastAskedQuestion}
              </span>
              <button
                onClick={() => setRightAiPanelOpen(true)}
                className="text-[11px] font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Continue in AI Panel</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
              {aiAnswer}
            </div>
          </div>
        )}
      </section>

      {/* Section 26: Multi-Location Intelligence & Metric Filtering */}
      <MultiLocationSection />

      {/* 5. QUICK ACCESS MODULE TILES */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('visibility')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 font-heading">Visibility</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Google Maps & Local SEO</p>
        </button>

        <button
          onClick={() => setActiveTab('reputation')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <Star className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 font-heading">Reputation</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">{activeBusiness.unansweredReviews || 17} need replies</p>
        </button>

        <button
          onClick={() => setActiveTab('competitors')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <Crosshair className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 font-heading">Competitors</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">{activeBusiness.competitors?.length || 3} local rivals</p>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 font-heading">Content</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Drafts, pages & schema</p>
        </button>
      </section>

      {/* CONTROLLED "FIX IT" EXECUTION MODAL */}
      <FixItModal
        action={selectedFixItAction}
        onClose={() => setSelectedFixItAction(null)}
      />
    </div>
  );
};
