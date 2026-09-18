import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Target,
  Sparkles,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
  Building2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const CompetitorIntelligenceView: React.FC = () => {
  const { activeBusiness, updateBusinessProfile, setActiveTab, logActivity } = useApp();

  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [selectedCompetitorIndex, setSelectedCompetitorIndex] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);

  const competitorsList = activeBusiness.competitors || [];
  const primaryService = activeBusiness.services?.[0] || 'Core Services';
  const hasCompetitors = competitorsList.length > 0;

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCompetitorName.trim();
    if (!trimmed) return;
    if (competitorsList.includes(trimmed)) {
      setNewCompetitorName('');
      return;
    }
    const updated = [...competitorsList, trimmed];
    updateBusinessProfile({ competitors: updated });
    logActivity('growth', 'Competitor Added', `Added ${trimmed} to competitor tracking.`);
    setNewCompetitorName('');
    setIsAdding(false);
  };

  const handleRemoveCompetitor = (indexToRemove: number) => {
    const targetName = competitorsList[indexToRemove];
    const updated = competitorsList.filter((_, idx) => idx !== indexToRemove);
    updateBusinessProfile({ competitors: updated });
    logActivity('growth', 'Competitor Removed', `Removed ${targetName} from tracking.`);
    if (selectedCompetitorIndex >= updated.length) {
      setSelectedCompetitorIndex(Math.max(0, updated.length - 1));
    }
  };

  const activeCompetitorName = competitorsList[selectedCompetitorIndex] || competitorsList[0] || '';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto font-sans text-slate-900 space-y-8 pb-20">
      {/* 1. HEADER */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                Market Intelligence
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Competitor Intelligence
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track local competitors in your market to identify search gaps, review differentials, and strategic counter-plays.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Competitor</span>
            </button>
          </div>
        </div>

        {/* ADD COMPETITOR FORM */}
        {isAdding && (
          <form onSubmit={handleAddCompetitor} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
                placeholder="Enter competitor business name (e.g. Acme Plumbing, Metro Dental)..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                disabled={!newCompetitorName.trim()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Track Competitor
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* 2. SCOREBOARD */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
            Local Market Visibility Comparison
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Your Business */}
            <div className="p-5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-500 space-y-2 shadow-xs relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 font-heading truncate">
                  {activeBusiness.name}
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">
                  You
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-heading text-emerald-950">
                  {activeBusiness.healthScore > 0 ? activeBusiness.healthScore : '—'}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {activeBusiness.googleRating > 0 ? `${activeBusiness.googleRating.toFixed(1)} ★` : 'No rating'} ({activeBusiness.reviewCount || 0} rev)
                </span>
              </div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, activeBusiness.healthScore || 0)}%` }} />
              </div>
            </div>

            {/* Dynamic user-configured competitors */}
            {competitorsList.map((compName, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCompetitorIndex(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 relative group ${
                  selectedCompetitorIndex === idx
                    ? 'bg-amber-50/70 border-amber-400 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 font-heading truncate pr-4">
                    {compName}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCompetitor(idx);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 transition-opacity"
                    title="Remove competitor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Tracked Rival
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Active
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            ))}

            {competitorsList.length === 0 && (
              <div
                onClick={() => setIsAdding(true)}
                className="p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              >
                <Plus className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-600">Track a Competitor</span>
                <span className="text-[10px] text-slate-400">Compare market gaps</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. COMPETITOR ANALYSIS & COUNTER-STRATEGIES */}
      {hasCompetitors ? (
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-heading">
                Market Counter-Strategy
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight mt-0.5">
                Counter-Plays for {activeCompetitorName}
              </h2>
              <p className="text-xs text-slate-500">
                Actionable plays to outrank and outperform {activeCompetitorName} in {activeBusiness.city || 'your local market'}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Targeted Service Pages</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Publish a dedicated landing page for <strong>{primaryService}</strong> featuring local neighborhood schema, clear pricing disclosures, and direct contact options.
              </p>
              <button
                onClick={() => setActiveTab('content')}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Draft Service Page</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Review Velocity Campaign</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Generate review invitations for recent clients to build steady monthly review growth and strengthen 3-Pack position over local rivals.
              </p>
              <button
                onClick={() => setActiveTab('reputation')}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Launch Review Campaign</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold font-heading text-slate-900">
              No Competitors Tracked Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add your primary local competitors in {activeBusiness.city || 'your area'} to monitor strategic gaps and draft targeted counter-measures.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Competitor</span>
          </button>
        </section>
      )}

      {/* 4. STRATEGIC EXECUTION PRINCIPLE */}
      <section className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-heading block">
            Execution Principle
          </span>
          <p className="font-bold text-sm text-slate-100">
            The purpose is action, not competitor spying.
          </p>
          <p className="text-slate-300">
            Convert competitive gaps directly into localized content drafts, Google Business updates, and verified review campaigns.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('content')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
        >
          Open Content Studio →
        </button>
      </section>
    </div>
  );
};
