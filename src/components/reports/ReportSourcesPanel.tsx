import React from 'react';
import { DataSourceStatus } from '../../types/reports';
import { CheckCircle2, AlertCircle, Clock, Link2, Database, ShieldCheck } from 'lucide-react';

interface ReportSourcesPanelProps {
  sources: DataSourceStatus[];
  dataSnapshotAt: string;
  isStale: boolean;
  staleReason?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ReportSourcesPanel: React.FC<ReportSourcesPanelProps> = ({
  sources,
  dataSnapshotAt,
  isStale,
  staleReason,
  onRefresh,
  isRefreshing,
}) => {
  const connectedSources = sources.filter((s) => s.isConnected);
  const disconnectedSources = sources.filter((s) => !s.isConnected);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">Data Source Transparency & Integrity</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 mr-1" />
              100% Real Stored Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every metric is computed from authenticated systems. Zero AI-synthesized numbers or estimates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Snapshot timestamp:</span>
          <span className="font-medium text-slate-700">
            {new Date(dataSnapshotAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Staleness Notice */}
      {isStale && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-900">Data updated — refresh report</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {staleReason || 'Underlying data sources received new sync updates since this snapshot was created.'}
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium transition-colors flex-shrink-0 shadow-sm disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Report'}
            </button>
          )}
        </div>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sources.map((source) => (
          <div
            key={source.id}
            className={`p-3 rounded-lg border text-xs flex flex-col justify-between gap-2 ${
              source.isConnected
                ? 'bg-slate-50/70 border-slate-200 text-slate-800'
                : 'bg-slate-50/40 border-dashed border-slate-200 text-slate-500'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-900 block">{source.name}</span>
                <span className="text-[11px] text-slate-500 block">{source.providerLabel}</span>
              </div>
              {source.isConnected ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                  Synced
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0">
                  <Link2 className="w-2.5 h-2.5 mr-1" />
                  Not Connected
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate pr-2">
                {source.isConnected
                  ? source.coverageDetail || 'Live operational telemetry'
                  : 'Not available — connect source'}
              </span>
              {source.lastSyncedAt && (
                <span className="flex-shrink-0 text-slate-400">
                  {new Date(source.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
