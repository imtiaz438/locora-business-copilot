import React from 'react';
import {
  ShieldCheck,
  Check,
  RefreshCw,
  Calculator,
  Sparkles,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export type DataProvenanceType =
  | 'VERIFIED'
  | 'USER_PROVIDED'
  | 'SYNCED'
  | 'CALCULATED'
  | 'AI_RECOMMENDATION'
  | 'UNAVAILABLE';

export interface DataProvenanceBadgeProps {
  type: DataProvenanceType;
  customText?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

/**
 * DataProvenanceBadge implements Requirement 8: LIVE DATA RULE
 * Distinguishes data provenance across the dashboard and app:
 * - VERIFIED: e.g. "✓ Verified Business Profile"
 * - USER_PROVIDED: e.g. "✓ User/Website Lead"
 * - SYNCED: e.g. "✓ Synced from Google"
 * - CALCULATED: e.g. "✓ Calculated from latest crawl"
 * - AI_RECOMMENDATION: e.g. "✦ AI Recommendation" (Never make AI-generated info look like verified data!)
 * - UNAVAILABLE: e.g. "⚠ No ranking data available"
 */
export const DataProvenanceBadge: React.FC<DataProvenanceBadgeProps> = ({
  type,
  customText,
  className = '',
  size = 'xs',
}) => {
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-[11px] px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5',
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5 shrink-0',
    sm: 'w-3 h-3 shrink-0',
    md: 'w-3.5 h-3.5 shrink-0',
  }[size];

  switch (type) {
    case 'VERIFIED':
      return (
        <span
          className={`inline-flex items-center font-bold tracking-tight rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 ${sizeClasses} ${className}`}
          title="Verified against canonical business records or verified listings"
        >
          <ShieldCheck className={iconSizes} />
          <span>{customText || '✓ Verified Data'}</span>
        </span>
      );

    case 'USER_PROVIDED':
      return (
        <span
          className={`inline-flex items-center font-bold tracking-tight rounded-full border bg-sky-50 text-sky-800 border-sky-200 ${sizeClasses} ${className}`}
          title="Directly submitted by user or incoming website lead form"
        >
          <UserCheck className={iconSizes} />
          <span>{customText || '✓ User/Website Lead'}</span>
        </span>
      );

    case 'SYNCED':
      return (
        <span
          className={`inline-flex items-center font-bold tracking-tight rounded-full border bg-teal-50 text-teal-800 border-teal-200 ${sizeClasses} ${className}`}
          title="Synchronized live from an external platform API"
        >
          <RefreshCw className={iconSizes} />
          <span>{customText || '✓ Synced from Google'}</span>
        </span>
      );

    case 'CALCULATED':
      return (
        <span
          className={`inline-flex items-center font-bold tracking-tight rounded-full border bg-indigo-50 text-indigo-800 border-indigo-200 ${sizeClasses} ${className}`}
          title="Computed via analytical formulas or crawl audits"
        >
          <Calculator className={iconSizes} />
          <span>{customText || '✓ Calculated from latest crawl'}</span>
        </span>
      );

    case 'AI_RECOMMENDATION':
      return (
        <span
          className={`inline-flex items-center font-extrabold tracking-tight rounded-full border bg-purple-50 text-purple-900 border-purple-200 ring-1 ring-purple-400/20 ${sizeClasses} ${className}`}
          title="AI-generated strategic recommendation. Not raw historical telemetry."
        >
          <Sparkles className={`${iconSizes} text-purple-600`} />
          <span>{customText || '✦ AI Recommendation'}</span>
        </span>
      );

    case 'UNAVAILABLE':
    default:
      return (
        <span
          className={`inline-flex items-center font-medium tracking-tight rounded-full border bg-slate-100 text-slate-500 border-slate-200 ${sizeClasses} ${className}`}
          title="No telemetry or integration currently configured"
        >
          <AlertTriangle className={`${iconSizes} text-amber-500`} />
          <span>{customText || '⚠ No ranking data available'}</span>
        </span>
      );
  }
};
