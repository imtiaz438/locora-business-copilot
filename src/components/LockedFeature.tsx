import React from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserPlan } from '../types';

interface LockedFeatureProps {
  requiredPlan?: UserPlan;
  featureTitle: string;
  featureDescription?: string;
  children?: React.ReactNode;
}

export const LockedFeature: React.FC<LockedFeatureProps> = ({
  requiredPlan = 'pro',
  featureTitle,
  featureDescription = 'This feature is available on Pro & Agency plans. Upgrade your workspace to unlock full access.',
  children,
}) => {
  const { setCheckoutModalPlan, user } = useApp();

  const isLocked =
    (requiredPlan === 'pro' && user.planTier === 'free') ||
    (requiredPlan === 'agency' && (user.planTier === 'free' || user.planTier === 'pro'));

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xs font-sans">
      {/* Background blurred preview if children provided */}
      {children && (
        <div className="filter blur-sm opacity-30 pointer-events-none select-none max-h-96 overflow-hidden">
          {children}
        </div>
      )}

      {/* Lock Overlay */}
      <div className={`p-8 text-center bg-white/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4 ${children ? 'absolute inset-0 z-10' : 'py-12'}`}>
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-200 flex items-center justify-center shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 max-w-md">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 uppercase tracking-wider">
            {requiredPlan.toUpperCase()} FEATURE
          </span>
          <h3 className="text-xl font-bold font-heading text-slate-900 tracking-tight">{featureTitle}</h3>
          <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
            {featureDescription}
          </p>
        </div>

        <button
          onClick={() => setCheckoutModalPlan(requiredPlan)}
          className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Upgrade to {requiredPlan === 'agency' ? 'Agency Elite' : 'Pro Plan'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
