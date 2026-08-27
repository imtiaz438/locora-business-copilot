import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, Sparkles, PlusCircle, Flame } from 'lucide-react';

export const AiCreditMeter: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user, setActiveTab, setFuelPackModalOpen } = useApp();

  const isUnlimited = user.planTier === 'agency';
  const used = user.aiCreditsUsed || 0;
  const limit = user.monthlyAiCredits || (user.email ? 25 : 15);
  const remaining = Math.max(0, limit - used);
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  const isHighUsage = percentage >= 80 || remaining <= 3;

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
    <div className="flex items-center gap-1.5 font-sans">
      <button
        onClick={() => setActiveTab('subscription')}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs ${
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

      {/* Instant Fuel Pack Top Up Button */}
      <button
        onClick={() => setFuelPackModalOpen(true)}
        className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
        title="Top Up AI Fuel Pack (No Subscription Needed)"
      >
        <Flame className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
        <span className="hidden sm:inline">Top-Up</span>
      </button>
    </div>
  );
};
