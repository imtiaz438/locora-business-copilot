import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LockedFeature } from './LockedFeature';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  Rocket,
  Target,
  DollarSign,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';

export const MarketingPlannerView: React.FC = () => {
  const { businessProfile, settings, user, hasEnoughCredits, consumeAiCredit, updateUser, setActiveTab } = useApp();

  const [goals, setGoals] = useState('Acquire 10 new local service retainer clients and increase Google Business profile lead calls by 30%');
  const [targetAudience, setTargetAudience] = useState(businessProfile.targetAudience || 'Local business owners in Austin TX');
  const [budget, setBudget] = useState('500');
  const [timeframe, setTimeframe] = useState<'30' | '90'>('30');

  const [loading, setLoading] = useState(false);
  const [planContent, setPlanContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasEnoughCredits(5)) return;

    setLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/ai/generate-marketing-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals,
          targetAudience,
          budget,
          timeframe,
          businessProfile,
          providerKey: settings.providerKeys[settings.activeProvider],
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate marketing plan');

      if (typeof data.creditsUsed === 'number') {
        updateUser({ aiCreditsUsed: data.creditsUsed });
      } else {
        consumeAiCredit(5);
      }

      setPlanContent(data.content);
    } catch (err: any) {
      setApiError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!planContent) return;
    navigator.clipboard.writeText(planContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-[#059669]" />
          <span>AI Marketing & Business Growth Planner</span>
        </h2>
        <p className="text-xs text-slate-500 font-sans">
          Generate customized 30-day action plans, 90-day growth roadmaps, campaign concepts, and seasonal promotion calendars.
        </p>
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

      <LockedFeature
        requiredPlan="pro"
        featureTitle="30 & 90-Day Marketing Roadmap Engine"
        featureDescription="The AI Marketing Planner generates structured campaign roadmaps, channel breakdowns, and ROI projections for your local business."
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Generator Controls */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#059669]" />
              <span>Growth Parameters</span>
            </h3>

            {/* Timeframe Toggle */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setTimeframe('30')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  timeframe === '30'
                    ? 'bg-[#059669] text-white shadow-2xs font-heading'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30-Day Sprint
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('90')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  timeframe === '90'
                    ? 'bg-[#059669] text-white shadow-2xs font-heading'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                90-Day Roadmap
              </button>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Growth Goals *</label>
                <textarea
                  rows={3}
                  required
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g. Increase local walk-in consultations, launch new service package, gain 20 5-star Google reviews..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Customer Profile</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Homeowners, medical directors, local managers"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly Marketing Budget ($)</label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 250 - 1000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
              >
                <Rocket className="w-4 h-4" />
                <span>{loading ? 'AI Building Roadmap...' : `Generate ${timeframe}-Day Plan`}</span>
              </button>
            </form>
          </div>

          {/* Right Column: AI Plan View */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#059669]" />
                <span>{timeframe}-Day Growth Roadmap</span>
              </span>

              {planContent && (
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-sans"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied' : 'Copy Strategy'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-6 text-xs text-slate-800 leading-relaxed overflow-y-auto min-h-[420px] whitespace-pre-wrap font-sans">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 space-y-3 font-sans">
                  <Sparkles className="w-8 h-8 text-[#059669] animate-spin" />
                  <p>AI Marketing Copilot is analyzing goals and building campaign schedules...</p>
                </div>
              ) : planContent ? (
                planContent
              ) : (
                <div className="text-center text-slate-400 py-20 font-sans">
                  Define your growth objectives on the left and click generate to receive a {timeframe}-day step-by-step plan, channel tactics, and promotion schedule.
                </div>
              )}
            </div>
          </div>
        </div>
      </LockedFeature>
    </div>
  );
};
