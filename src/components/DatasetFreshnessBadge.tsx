import React from 'react';
import { DatasetFreshnessStatus, ExternalDataset } from '../types.ts';
import { formatDatasetFreshness, getFreshnessStatusDetails } from '../lib/dataFreshness.ts';
import { Clock, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface DatasetFreshnessBadgeProps {
  id?: string;
  name?: string;
  source: string;
  last_synced_at: string | null;
  status: DatasetFreshnessStatus;
  error?: string | null;
  className?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DatasetFreshnessBadge: React.FC<DatasetFreshnessBadgeProps> = ({
  id = 'dataset',
  name = 'External Dataset',
  source,
  last_synced_at,
  status,
  error = null,
  className = '',
  onRefresh,
  isRefreshing = false,
}) => {
  const dataset: ExternalDataset = {
    id,
    name,
    source,
    last_synced_at,
    status,
    error,
  };

  const statusDetails = getFreshnessStatusDetails(status);
  const freshnessText = formatDatasetFreshness(dataset);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
        status === 'connected'
          ? 'bg-slate-50/80 border-slate-200'
          : 'bg-white border-dashed border-slate-200'
      } text-xs ${className}`}
      title={`Source: ${source} • Status: ${statusDetails.label}`}
    >
      <div className="flex items-center gap-1.5 font-medium">
        <span className={`w-2 h-2 rounded-full ${statusDetails.dotColor} shrink-0`} />
        <span className="font-bold text-slate-800">{name}:</span>
        <span className={status === 'connected' ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
          {freshnessText}
        </span>
      </div>

      <span className="text-slate-300 font-normal">|</span>

      <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
        src: {source}
      </span>

      {error && (
        <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]" title={error}>
          <AlertCircle className="w-3 h-3" />
          Sync Error
        </span>
      )}

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="ml-1 p-1 hover:bg-slate-200/60 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-40"
          title="Refresh dataset feed"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      )}
    </div>
  );
};
