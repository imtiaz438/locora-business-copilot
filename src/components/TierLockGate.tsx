import React from 'react';
import { Lock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserPlan } from '../types';

interface TierLockGateProps {
  requiredPlan: 'pro' | 'agency';
  featureName: string;
  featureDescription?: string;
  description?: string;
  benefits?: string[];
  children: React.ReactNode;
}

const TIER_BENEFITS: Record<'pro' | 'agency', { name: string; price: string; description: string; highlights: string[] }> = {
  pro: {
    name: 'Pro Growth',
    price: '$29 / month',
    description: 'Autonomous AI execution, multi-channel review copilot, ranking alerts, and Google Analytics 4 deep sync.',
    highlights: [
      'Full Autonomous AI Business Manager & 1-Click execution',
      'AI Local SEO Copilot & Google Maps Ranking tracker',
      'AI Reputation Manager (200 review responses & outreach / mo)',
      '5 Tracked Competitors with real-time gap intelligence',
      '2026 AI Search Visibility (ChatGPT, Perplexity & Gemini)',
      'Search Console & Google Analytics 4 verified feeds',
      'Unlimited Invoices, AI Proposals & CRM Lead Pipeline',
    ],
  },
  agency: {
    name: 'Agency Elite',
    price: '$99 / month',
    description: 'Unified multi-client dashboard, white-label client PDF reporting, team seats, and agency-wide automated workflows.',
    highlights: [
      'Multi-Client Workspace (Manage 10 to 100+ business clients)',
      'White-Label Executive PDF Reports (Custom client branding)',
      'Custom Agency Logo & Branded Client Portal',
      '5 Team Member Seats with permission controls',
      'Unified Agency Health Roll-Up & Attention alerts',
      'DataForSEO Live SERP integration enabled across all clients',
      'Priority 24/7 Agency Success Manager',
    ],
  },
};

export const TierLockGate: React.FC<TierLockGateProps> = ({
  requiredPlan,
  featureName,
  featureDescription,
  description,
  benefits,
  children,
}) => {
  const { user, updateUser, logActivity, setActiveTab, setCheckoutModalPlan } = useApp();

  const isUnlocked =
    user.role === 'admin' ||
    user.role === 'owner' ||
    user.email === 'imtiazbaloch3322@gmail.com' ||
    user.email === 'support@locoraai.com' ||
    user.planTier === 'agency' ||
    user.planTier === 'elite' ||
    (requiredPlan === 'pro' && user.planTier === 'pro');

  if (isUnlocked) {
    return <>{children}</>;
  }

  const tierInfo = TIER_BENEFITS[requiredPlan];
  const displayBenefits = benefits || tierInfo.highlights;

  const handleQuickUpgrade = (tier: UserPlan) => {
    setCheckoutModalPlan(tier);
    logActivity('subscription', `Initiated ${tier.toUpperCase()} checkout`, `Clicked unlock for ${featureName}`);
  };

  return (
    <div className="relative w-full">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-3 uppercase tracking-wider">
            <span>{tierInfo.name} Feature</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading mb-3">
            {featureName} is locked on your current plan
          </h2>

          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
            {description || featureDescription || tierInfo.description}
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 text-left max-w-xl mx-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Included with {tierInfo.name} ({tierInfo.price}):
            </h4>
            <ul className="space-y-2.5">
              {displayBenefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => handleQuickUpgrade(requiredPlan)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Unlock with {tierInfo.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('subscription')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              View All Pricing Plans
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-4">
            Cancel or switch tiers anytime. Instant activation with no downtime.
          </p>
        </div>
      </div>
    </div>
  );
};

export const TierLockBadge: React.FC<{ minPlan: 'pro' | 'agency' }> = ({ minPlan }) => {
  const { user } = useApp();
  const isLocked =
    (minPlan === 'pro' && user.planTier === 'free') ||
    (minPlan === 'agency' && (user.planTier === 'free' || user.planTier === 'pro'));

  if (!isLocked) return null;

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
      <Lock className="w-2.5 h-2.5" />
      <span>{minPlan === 'agency' ? 'Agency' : 'Pro'}</span>
    </span>
  );
};
