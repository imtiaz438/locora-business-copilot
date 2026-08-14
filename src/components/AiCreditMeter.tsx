import React from 'react';
import { useApp } from '../context/AppContext';
import { Zap, Sparkles } from 'lucide-react';

export const AiCreditMeter: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user, setActiveTab } = useApp();

  const isUnlimited = user.planTier === 'agency';
  const used = user.aiCreditsUsed || 0;
  const limit = user.monthlyAiCredits || (user.email ? 25 : 15);
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  const isHighUsage = percentage >= 80;

  if (isUnlimited) {
    return (
      <button
        onClick={() => setActiveTab('subscription')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-[#059669] transition-all cursor-pointer font-sans"
        title="Unlimited AI Credits (Agency Plan)"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
        <span>∞ Unlimited Credits</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setActiveTab('subscription')}
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-sans text-xs ${
        isHighUsage
          ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
      }`}
      title="Click to manage subscription & AI credits"
    >
      <Zap className={`w-3.5 h-3.5 ${isHighUsage ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`} />

      {!compact && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <span>{used}</span>
            <span className="text-slate-400">/</span>
            <span>{limit} Credits</span>
          </div>
          <div className="w-20 bg-slate-200 h-1 rounded-full overflow-hidden mt-0.5">
            <div
              className={`h-full rounded-full transition-all ${
                isHighUsage ? 'bg-amber-500' : 'bg-[#059669]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {compact && (
        <span className="font-bold text-[11px]">
          {used}/{limit}
        </span>
      )}
    </button>
  );
};
