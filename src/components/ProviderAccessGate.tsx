import React from 'react';
import {
  Lock,
  Key,
  WifiOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ProviderFeatureId,
  evaluateProviderAccess,
  PROVIDER_FEATURE_REGISTRY,
} from '../lib/planProviderAccess';

interface ProviderAccessGateProps {
  featureId: ProviderFeatureId;
  children: React.ReactNode;
  /** Optional override for whether provider is configured (e.g. from app settings) */
  isConfigured?: boolean;
  /** Optional upstream error message if provider failed */
  upstreamError?: string | null;
  /** Custom title for the gate card */
  title?: string;
  /** Custom description */
  description?: string;
  /** Custom container class */
  className?: string;
  /** If true, render a compact inline gate instead of a full block */
  compact?: boolean;
  /** Optional retry handler */
  onRetry?: () => void;
  /** Optional configure click handler */
  onConfigureClick?: () => void;
}

export const ProviderAccessGate: React.FC<ProviderAccessGateProps> = ({
  featureId,
  children,
  isConfigured,
  upstreamError,
  title,
  description,
  className = '',
  compact = false,
  onRetry,
  onConfigureClick,
}) => {
  const { user, setCheckoutModalPlan, setActiveTab } = useApp();

  const def = PROVIDER_FEATURE_REGISTRY[featureId];

  // Resolve configuration from user settings if not explicitly passed
  let resolvedIsConfigured = isConfigured;
  if (resolvedIsConfigured === undefined) {
    if (featureId === 'dataforseo' || featureId === 'advanced_serp') {
      // DataForSEO requires credentials
      resolvedIsConfigured = Boolean(
        (window as any).__DATAFORSEO_CONFIGURED__ ||
        Boolean(localStorage.getItem('dataforseo_configured'))
      );
    } else if (featureId === 'low_cost_serp') {
      resolvedIsConfigured = Boolean(
        Boolean(localStorage.getItem('serp_configured')) ||
        (window as any).__SERP_CONFIGURED__
      );
    } else {
      resolvedIsConfigured = true;
    }
  }

  const evaluation = evaluateProviderAccess({
    featureId,
    userPlanTier: user?.planTier,
    userRole: user?.role,
    isConfigured: resolvedIsConfigured,
    hasUpstreamError: Boolean(upstreamError),
    upstreamErrorMessage: upstreamError || undefined,
  });

  // If access is granted, render children directly without any interference
  if (evaluation.allowed) {
    return <>{children}</>;
  }

  const handleUpgradeClick = () => {
    const target = evaluation.requiredPlan === 'agency_elite' ? 'agency' : 'pro';
    setCheckoutModalPlan(target as any);
  };

  const handleSettingsClick = () => {
    if (onConfigureClick) {
      onConfigureClick();
    } else {
      setActiveTab('settings');
    }
  };

  // 1. COMPACT INLINE GATING
  if (compact) {
    if (evaluation.state === 'upgrade_required') {
      return (
        <div className={`p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${className}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold">{title || def?.name || 'Premium Feature'}:</span>{' '}
              <span className="text-amber-800">{description || evaluation.reason}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUpgradeClick}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shrink-0 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Upgrade to {evaluation.requiredPlanLabel}</span>
          </button>
        </div>
      );
    }

    if (evaluation.state === 'not_configured') {
      return (
        <div className={`p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${className}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold">{def?.providerName || 'Provider'}:</span>{' '}
              <span className="text-blue-800">{evaluation.reason}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSettingsClick}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shrink-0 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Connect Provider</span>
          </button>
        </div>
      );
    }

    return (
      <div className={`p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-slate-200 text-slate-700 shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold">{def?.providerName || 'Provider'}:</span>{' '}
            <span className="text-slate-600">{evaluation.reason}</span>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shrink-0 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  // 2. FULL BLOCK GATING (NEVER RENDERS FAKE PREVIEWS)
  // State: UPGRADE REQUIRED
  if (evaluation.state === 'upgrade_required') {
    return (
      <div
        className={`rounded-3xl border border-amber-200/90 bg-gradient-to-b from-amber-50/40 via-white to-orange-50/20 p-8 sm:p-12 text-center space-y-6 shadow-xs ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-100/80 border border-amber-300 mx-auto flex items-center justify-center text-amber-800 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="max-w-lg mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-700" />
            <span>{evaluation.requiredPlanLabel} Feature</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
            {title || def?.name || 'Subscription Upgrade Required'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            {description || evaluation.reason}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleUpgradeClick}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span>Upgrade to {evaluation.requiredPlanLabel}</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="pt-4 border-t border-amber-100/80 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Strict Zero Fake Data Policy: Synthetic records are never used to simulate unverified tiers.</span>
        </div>
      </div>
    );
  }

  // State: NOT CONFIGURED (User has plan, but provider credentials missing)
  if (evaluation.state === 'not_configured') {
    return (
      <div
        className={`rounded-3xl border border-blue-200/90 bg-gradient-to-b from-blue-50/40 via-white to-slate-50/30 p-8 sm:p-12 text-center space-y-6 shadow-xs ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-100/80 border border-blue-300 mx-auto flex items-center justify-center text-blue-800 shadow-xs">
          <Key className="w-8 h-8" />
        </div>

        <div className="max-w-lg mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/90 border border-blue-300 text-blue-900 text-[11px] font-extrabold uppercase tracking-wider">
            <span>Provider Connection Required</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
            {title || `${def?.providerName || 'Provider'} Not Connected`}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            {description || evaluation.reason}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSettingsClick}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Connect {def?.providerName || 'Provider'} in Settings</span>
            <ArrowRight className="w-4 h-4 text-blue-200" />
          </button>
        </div>

        <div className="pt-4 border-t border-blue-100/80 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Strict Zero Fake Data Policy: In accordance with our telemetry rules, demo data is strictly disabled.</span>
        </div>
      </div>
    );
  }

  // State: UPSTREAM SERVICE UNAVAILABLE
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 p-8 sm:p-12 text-center space-y-6 shadow-xs ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-200 border border-slate-300 mx-auto flex items-center justify-center text-slate-700 shadow-xs">
        <WifiOff className="w-8 h-8" />
      </div>

      <div className="max-w-lg mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-[11px] font-extrabold uppercase tracking-wider">
          <span>Service Temporarily Unavailable</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
          {title || `${def?.providerName || 'Provider'} Unreachable`}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
          {description || evaluation.reason}
        </p>
      </div>

      {onRetry && (
        <div className="flex items-center justify-center pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Strict Zero Fake Data Policy: No simulated or estimated fallback data will be displayed.</span>
      </div>
    </div>
  );
};
