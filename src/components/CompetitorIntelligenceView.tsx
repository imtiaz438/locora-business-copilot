import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Crosshair,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  MessageSquare,
  Users,
  ChevronRight,
  Info,
} from 'lucide-react';

interface CompetitorProfile {
  id: string;
  name: string;
  score: number;
  rating: number;
  reviews: number;
  servicePages: number;
  whyWinning: string[];
  opportunities: {
    gap: string;
    actionLabel: string;
    impact: string;
    tabTarget: string;
  }[];
}

export const CompetitorIntelligenceView: React.FC = () => {
  const { activeBusiness, setActiveTab, logActivity } = useApp();

  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('comp_a');
  const [opportunityModalCompetitor, setOpportunityModalCompetitor] = useState<CompetitorProfile | null>(null);

  const rawCompNames = activeBusiness.competitors && activeBusiness.competitors.length > 0
    ? activeBusiness.competitors
    : ['Apex Group', 'Capitol Premier', 'Downtown Center'];

  const primaryService = activeBusiness.services?.[0] || 'Core Services';
  const bizCity = activeBusiness.city || 'Metro Area';

  const competitors: CompetitorProfile[] = useMemo(() => {
    return [
      {
        id: 'comp_a',
        name: rawCompNames[0] || 'Competitor A (Premier Group)',
        score: 84,
        rating: 4.6,
        reviews: 411,
        servicePages: 12,
        whyWinning: [
          '+84 reviews advantage',
          '12 targeted service pages',
          'Stronger localized landing page content',
          'Faster response velocity',
        ],
        opportunities: [
          {
            gap: `Lacks same-day booking or transparent pricing for ${primaryService.toLowerCase()}.`,
            actionLabel: `Create ${primaryService} Page with Transparent Pricing`,
            impact: '+12% High-intent client conversion',
            tabTarget: 'content',
          },
          {
            gap: 'Has not published a Google Business update post in 4 weeks.',
            actionLabel: 'Publish Fresh Google Post on Immediate Availability',
            impact: '+8% Maps 3-Pack freshness signal',
            tabTarget: 'content',
          },
          {
            gap: 'Review velocity gap: Receives ~12 reviews/mo vs your average.',
            actionLabel: 'Trigger 1-Click Review Request Campaign to surpass them',
            impact: 'Closes local review count gap',
            tabTarget: 'reputation',
          },
        ],
      },
      {
        id: 'comp_b',
        name: rawCompNames[1] || 'Competitor B (Express Solutions)',
        score: 81,
        rating: 4.5,
        reviews: 355,
        servicePages: 9,
        whyWinning: [
          `Aggressive ${primaryService.toLowerCase()} keyword density`,
          `4 geo-suburb landing pages around ${bizCity}`,
          `Maps 3-Pack position for top service queries`,
        ],
        opportunities: [
          {
            gap: `Lower client rating (4.5 vs your ${activeBusiness.googleRating || 4.8}); recurring complaints on responsiveness.`,
            actionLabel: `Highlight "${activeBusiness.googleRating || 4.8}★ Verified Service" in Meta Titles`,
            impact: '+18% click-through from high-intent searchers',
            tabTarget: 'content',
          },
          {
            gap: `Missing dedicated pages for secondary service tiers.`,
            actionLabel: `Create Comprehensive ${activeBusiness.services?.[1] || 'Specialty'} Landing Page`,
            impact: 'Captures suburban high-LTV inquiries',
            tabTarget: 'content',
          },
        ],
      },
      {
        id: 'comp_c',
        name: rawCompNames[2] || 'Competitor C (Regional Center)',
        score: 72,
        rating: 4.3,
        reviews: 218,
        servicePages: 6,
        whyWinning: [
          `Prime central ${bizCity} physical location`,
          'Strong corporate partnership backlinks',
        ],
        opportunities: [
          {
            gap: 'Outdated mobile website with 3.8s load time and no click-to-call scheduling.',
            actionLabel: 'Launch Instant Online Consultation CTA in Google Business Profile',
            impact: 'Wins mobile searchers abandoning slow competitors',
            tabTarget: 'visibility',
          },
        ],
      },
    ];
  }, [activeBusiness, rawCompNames, primaryService, bizCity]);

  const activeComp = competitors.find((c) => c.id === selectedCompetitor) || competitors[0];

  const yourAdvantages = [
    {
      title: 'Better rating',
      desc: `${activeBusiness.googleRating || 4.8} ★ vs competitor average of 4.5 ★ across ${activeBusiness.reviewCount || 248} verified client reviews.`,
    },
    {
      title: 'Better homepage conversion',
      desc: 'Clean mobile-first UX with instant online scheduling and direct click-to-call buttons.',
    },
    {
      title: 'More recent content',
      desc: 'Regular service FAQ updates and active Google Business profile announcements.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto font-sans text-slate-900 space-y-8 pb-20">
      {/* 1. HEADER */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                Operational Counter-Strategy
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Competitor Intelligence
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              The purpose is action, not competitor spying. Discover why rivals win and execute concrete counter-plays.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
            <Target className="w-4 h-4 text-[#059669]" />
            <span className="font-bold text-slate-700">Goal:</span>
            <span className="text-emerald-800 font-bold">Overtake Competitor A (+6 pts)</span>
          </div>
        </div>

        {/* 2. LEADERBOARD SCOREBOARD */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
            Local Market Visibility Scoreboard
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Your Business */}
            <div className="p-5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-500 space-y-2 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 font-heading">
                  Your Business
                </span>
                <span className="text-[10px] font-extrabold bg-[#059669] text-white px-2 py-0.5 rounded-full uppercase">
                  You
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black font-heading text-emerald-950">
                  78
                </span>
                <span className="text-xs font-mono font-bold text-[#059669]">
                  4.8 ★ (327 rev)
                </span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#059669] h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            {/* Competitor A */}
            <div
              onClick={() => setSelectedCompetitor('comp_a')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                selectedCompetitor === 'comp_a'
                  ? 'bg-amber-50/70 border-amber-400 shadow-sm'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-heading truncate">
                  Competitor A
                </span>
                <span className="text-[10px] font-bold text-amber-700 font-mono">#1 in Market</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black font-heading text-slate-900">
                  84
                </span>
                <span className="text-xs font-mono text-slate-500">
                  4.6 ★ (411 rev)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '84%' }} />
              </div>
            </div>

            {/* Competitor B */}
            <div
              onClick={() => setSelectedCompetitor('comp_b')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                selectedCompetitor === 'comp_b'
                  ? 'bg-amber-50/70 border-amber-400 shadow-sm'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-heading truncate">
                  Competitor B
                </span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">#2 in Market</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black font-heading text-slate-900">
                  81
                </span>
                <span className="text-xs font-mono text-slate-500">
                  4.5 ★ (355 rev)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full rounded-full" style={{ width: '81%' }} />
              </div>
            </div>

            {/* Competitor C */}
            <div
              onClick={() => setSelectedCompetitor('comp_c')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                selectedCompetitor === 'comp_c'
                  ? 'bg-amber-50/70 border-amber-400 shadow-sm'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-heading truncate">
                  Competitor C
                </span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">#4 in Market</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black font-heading text-slate-900">
                  72
                </span>
                <span className="text-xs font-mono text-slate-500">
                  4.3 ★ (218 rev)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: '72%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY THEY ARE WINNING & OPPORTUNITIES */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-heading">
              Detailed Competitive Analysis
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight mt-0.5">
              WHY THEY ARE WINNING
            </h2>
            <p className="text-xs text-slate-500">
              Examining: <strong className="text-slate-800">{activeComp.name}</strong> (Score: {activeComp.score})
            </p>
          </div>

          <button
            onClick={() => setOpportunityModalCompetitor(activeComp)}
            className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer font-sans self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Find Opportunities</span>
          </button>
        </div>

        {/* Bullet List Matching Section 15 */}
        <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-amber-950 uppercase tracking-wide">
              {activeComp.name}
            </h3>
            <span className="text-xs font-mono text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
              Score: {activeComp.score}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {activeComp.whyWinning.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-amber-200/80 text-slate-800 font-bold shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                <span>✓ {item}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
            <span className="text-xs text-amber-900 font-medium">
              Locora has detected <strong>{activeComp.opportunities.length} actionable vulnerabilities</strong> in their digital footprint.
            </span>

            <button
              onClick={() => setOpportunityModalCompetitor(activeComp)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Find Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. YOUR ADVANTAGES (Section 15) */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#059669] font-heading">
            Strategic Moats
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight mt-0.5">
            YOUR ADVANTAGES
          </h2>
          <p className="text-xs text-slate-500">
            Areas where {activeBusiness.name} outperforms competitors. Emphasize these in all patient-facing marketing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {yourAdvantages.map((adv, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-2 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                <h3 className="font-extrabold font-heading text-emerald-950 text-sm">
                  ✓ {adv.title}
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed pl-6">
                {adv.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Action Callout */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-heading block">
              Execution Principle
            </span>
            <p className="font-bold text-sm text-slate-100">
              The purpose is action, not competitor spying.
            </p>
            <p className="text-slate-300">
              Convert these insights directly into content drafts, service pages, and review invitations.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('content')}
            className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
          >
            Go to Content Studio →
          </button>
        </div>
      </section>

      {/* OPPORTUNITY MODAL: FIND THEIR OPPORTUNITIES */}
      {opportunityModalCompetitor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] font-heading">
                  Actionable Counter-Plays
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 mt-0.5">
                  Opportunities to Overtake {opportunityModalCompetitor.name}
                </h3>
              </div>
              <button
                onClick={() => setOpportunityModalCompetitor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Based on empirical analysis of their service pages, review velocity, and content gaps, here are the highest-impact actions you can execute today:
            </p>

            <div className="space-y-3">
              {opportunityModalCompetitor.opportunities.map((opp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Vulnerability #{idx + 1}:</span>
                    <span className="text-[10px] font-extrabold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                      {opp.impact}
                    </span>
                  </div>
                  <p className="text-slate-600 italic">
                    "{opp.gap}"
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 font-medium text-[11px]">Recommended Play:</span>
                    <button
                      onClick={() => {
                        logActivity('growth', 'Competitor Opportunity Executed', opp.actionLabel);
                        setOpportunityModalCompetitor(null);
                        setActiveTab(opp.tabTarget);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>{opp.actionLabel}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setOpportunityModalCompetitor(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
