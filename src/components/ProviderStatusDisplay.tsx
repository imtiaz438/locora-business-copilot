import React from 'react';
import {
  Key,
  AlertTriangle,
  ZapOff,
  WifiOff,
  Inbox,
  Settings,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import type { ProviderStatus } from '../lib/apiFailurePolicy.ts';

interface ProviderStatusDisplayProps {
  status: ProviderStatus;
  providerName: string;
  customMessage?: string;
  onConfigureClick?: () => void;
  onRetryClick?: () => void;
  className?: string;
  compact?: boolean;
}

export const ProviderStatusDisplay: React.FC<ProviderStatusDisplayProps> = ({
  status,
  providerName,
  customMessage,
  onConfigureClick,
  onRetryClick,
  className = '',
  compact = false,
}) => {
  if (status === 'success') {
    return null;
  }

  // 1. NO API KEY → Display Connection / Configuration State
  if (status === 'not_configured') {
    if (compact) {
      return (
        <div className={`p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-center justify-between text-xs gap-2 ${className}`}>
          <div className="flex items-center gap-2 min-w-0">
            <Key className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>{providerName}:</strong> Not configured
            </span>
          </div>
          {onConfigureClick && (
            <button
              type="button"
              onClick={onConfigureClick}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shrink-0 cursor-pointer transition-colors"
            >
              Configure Key
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={`p-6 md:p-8 rounded-2xl bg-gradient-to-b from-amber-50/70 to-orange-50/40 border border-amber-200/90 text-center space-y-4 shadow-xs ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-300 mx-auto flex items-center justify-center text-amber-700">
          <Key className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            Configuration Required
          </div>
          <h4 className="text-base font-bold text-slate-900">
            {providerName} Not Configured
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {customMessage ||
              `A valid API key is required to stream authentic live data from ${providerName}. In accordance with our data integrity policy, synthetic or simulated records are never displayed.`}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-1">
          {onConfigureClick ? (
            <button
              type="button"
              onClick={onConfigureClick}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure in Settings</span>
            </button>
          ) : (
            <a
              href="#settings"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure in Settings</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  // 2. INVALID API KEY → Display Error State
  if (status === 'authentication_error') {
    return (
      <div className={`p-4 md:p-6 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 space-y-3 shadow-xs ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider bg-rose-200 text-rose-800 px-2 py-0.5 rounded-md">
                Authentication Error (401/403)
              </span>
              <span className="text-xs font-bold text-rose-950">{providerName}</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              {customMessage ||
                `The configured API key for ${providerName} was rejected as unauthorized or invalid. Please check and re-enter your credentials.`}
            </p>
          </div>
          {onConfigureClick && (
            <button
              type="button"
              onClick={onConfigureClick}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-colors"
            >
              Update Key
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. QUOTA EXCEEDED → Display Error State
  if (status === 'quota_exceeded') {
    return (
      <div className={`p-4 md:p-6 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 space-y-3 shadow-xs ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <ZapOff className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                Quota Exceeded (429)
              </span>
              <span className="text-xs font-bold text-amber-950">{providerName}</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              {customMessage ||
                `API request allowance or account credit limit has been exceeded for ${providerName}. Please check your provider account balance or rate limit tier.`}
            </p>
          </div>
          {onRetryClick && (
            <button
              type="button"
              onClick={onRetryClick}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. NETWORK ERROR → Display Error State
  if (status === 'unavailable') {
    return (
      <div className={`p-4 md:p-6 rounded-2xl bg-slate-100 border border-slate-300 text-slate-900 space-y-3 shadow-xs ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-200 text-slate-700 shrink-0">
            <WifiOff className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider bg-slate-300 text-slate-800 px-2 py-0.5 rounded-md">
                Service Unavailable
              </span>
              <span className="text-xs font-bold text-slate-900">{providerName}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {customMessage ||
                `Unable to reach ${providerName} due to a network connection timeout or temporary upstream outage. No synthetic records will be generated.`}
            </p>
          </div>
          {onRetryClick && (
            <button
              type="button"
              onClick={onRetryClick}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 5. NO DATA → Display Honest Empty State
  if (status === 'connected_no_data') {
    return (
      <div className={`p-8 md:p-12 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 shadow-xs ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 mx-auto flex items-center justify-center text-slate-400">
          <Inbox className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h4 className="text-sm font-bold text-slate-800">
            No Records Found
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {customMessage ||
              `Connected to ${providerName} successfully, but no matching records were returned for this specific search or query. Sample or demo data is strictly disabled.`}
          </p>
        </div>
        {onRetryClick && (
          <button
            type="button"
            onClick={onRetryClick}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Again</span>
          </button>
        )}
      </div>
    );
  }

  return null;
};
