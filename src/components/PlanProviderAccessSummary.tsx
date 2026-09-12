import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Key,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  Database,
  Search,
  Globe,
  Bot,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  normalizePlanTier,
  PROVIDER_FEATURE_REGISTRY,
  ProviderFeatureId,
  evaluateProviderAccess,
} from '../lib/planProviderAccess';

interface PlanProviderAccessSummaryProps {
  className?: string;
  onConfigureClick?: () => void;
}

export const PlanProviderAccessSummary: React.FC<PlanProviderAccessSummaryProps> = ({
  className = '',
  onConfigureClick,
}) => {
  const { user, setCheckoutModalPlan, setActiveTab } = useApp();
  const currentPlan = normalizePlanTier(user?.planTier);

  const planBadges: Record<string, { label: string; bg: string; text: string; border: string }> = {
    free: { label: 'FREE TIER', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
    pro: { label: 'PRO TIER', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    agency_elite: { label: 'AGENCY ELITE', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' },
  };

  const currentBadge = planBadges[currentPlan] || planBadges.free;

  // Group definitions by tier
  const freeFeatures: ProviderFeatureId[] = [
    'google_business_profile',
    'google_search_console',
    'google_analytics_4',
    'website_crawler',
    'basic_ai',
    'limited_monitoring',
  ];

  const proFeatures: ProviderFeatureId[] = [
    'expanded_monitoring',
    'low_cost_serp',
    'competitor_monitoring',
  ];

  const agencyFeatures: ProviderFeatureId[] = [
    'dataforseo',
    'advanced_serp',
    'advanced_local_tracking',
    'bulk_client_processing',
  ];

  const renderFeatureRow = (featureId: ProviderFeatureId) => {
    const def = PROVIDER_FEATURE_REGISTRY[featureId];
    if (!def) return null;

    const evaluation = evaluateProviderAccess({
      featureId,
      userPlanTier: user?.planTier,
      userRole: user?.role,
    });

    let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
    let statusText = 'Unlocked';
    let statusClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    let actionBtn = null;

    if (evaluation.state === 'upgrade_required') {
      icon = <Lock className="w-4 h-4 text-amber-600 shrink-0" />;
      statusText = `Requires ${evaluation.requiredPlanLabel}`;
      statusClass = 'bg-amber-50 text-amber-800 border-amber-200';
      actionBtn = (
        <button
          type="button"
          onClick={() => {
            const target = evaluation.requiredPlan === 'agency_elite' ? 'agency' : 'pro';
            setCheckoutModalPlan(target as any);
          }}
          className="text-[11px] font-bold text-slate-900 underline hover:text-emerald-700 flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Upgrade</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      );
    } else if (evaluation.state === 'not_configured') {
      icon = <Key className="w-4 h-4 text-blue-600 shrink-0" />;
      statusText = 'Needs Key';
      statusClass = 'bg-blue-50 text-blue-800 border-blue-200';
      actionBtn = (
        <button
          type="button"
          onClick={() => {
            if (onConfigureClick) onConfigureClick();
            else setActiveTab('settings');
          }}
          className="text-[11px] font-bold text-blue-700 underline hover:text-blue-900 flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Connect</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      );
    }

    return (
      <div
        key={featureId}
        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200/90 text-xs shadow-2xs hover:border-slate-300 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon}
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate">{def.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{def.providerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${statusClass}`}>
            {statusText}
          </span>
          {actionBtn}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                Entitlement & Data Feeds
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}>
                {currentBadge.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
              Plan-Based Provider Access
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentPlan !== 'agency_elite' && (
              <button
                type="button"
                onClick={() => setCheckoutModalPlan(currentPlan === 'free' ? 'pro' : 'agency')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Upgrade Plan</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-center gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="leading-relaxed">
            <strong>Strict Data Integrity Policy:</strong> If a premium provider is unavailable or not included in your subscription, the feature is displayed as unavailable with upgrade or configuration instructions. Synthetic or simulated data is strictly forbidden.
          </p>
        </div>

        {/* 3 Columns: Free, Pro, Agency Elite */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* FREE SOURCES */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Free Tier</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                Core Telemetry
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Google/GSC/GA4, crawler, basic AI suggestions, and limited single-business monitoring.
            </p>
            <div className="space-y-2 pt-1">
              {freeFeatures.map(renderFeatureRow)}
            </div>
          </div>

          {/* PRO SOURCES */}
          <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Pro Tier</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800">
                Expanded Telemetry
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              All Free sources plus expanded monitoring and low-cost SERP usage where configured.
            </p>
            <div className="space-y-2 pt-1">
              {proFeatures.map(renderFeatureRow)}
            </div>
          </div>

          {/* AGENCY ELITE SOURCES */}
          <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Agency Elite</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 border border-indigo-300 text-indigo-800">
                Enterprise Feeds
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              All Pro sources plus DataForSEO, advanced SERP/local tracking, and bulk client processing.
            </p>
            <div className="space-y-2 pt-1">
              {agencyFeatures.map(renderFeatureRow)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
