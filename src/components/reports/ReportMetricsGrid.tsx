import React from 'react';
import { ReportMetric } from '../../types/reports';
import { Database, AlertTriangle, ArrowUpRight, ArrowDownRight, CheckCircle2, Link2 } from 'lucide-react';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';

interface ReportMetricsGridProps {
  metrics: ReportMetric[];
  onConnectSource?: (sourceName: string) => void;
}

export const ReportMetricsGrid: React.FC<ReportMetricsGridProps> = ({
  metrics,
  onConnectSource,
}) => {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Verified Operational Metrics
          </h3>
          <p className="text-xs text-slate-500">
            Every metric displays its authentic data source, reporting period, and sync status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const isConnected = metric.status === 'synced';

          return (
            <div
              key={metric.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isConnected
                  ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                  : 'bg-slate-50/60 border-dashed border-slate-300'
              }`}
            >
              {/* Top: Label and Status Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-slate-600 leading-snug">
                  {metric.label}
                </span>
                <DataProvenanceBadge
                  type={isConnected ? (metric.source.toLowerCase().includes('google') ? 'SYNCED' : 'CALCULATED') : 'UNAVAILABLE'}
                  customText={
                    isConnected
                      ? (metric.source.toLowerCase().includes('google') ? '✓ Synced from Google' : `✓ ${metric.source}`)
                      : '⚠ No data available'
                  }
                  size="xs"
                />
              </div>

              {/* Middle: Value or Not Available Message */}
              <div className="my-2">
                {isConnected && metric.value !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                      {metric.value}
                    </span>
                    {metric.unit && (
                      <span className="text-xs text-slate-500 font-medium">{metric.unit}</span>
                    )}
                    {metric.delta && (
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                          metric.deltaType === 'positive'
                            ? 'text-emerald-700 bg-emerald-50'
                            : metric.deltaType === 'negative'
                            ? 'text-rose-700 bg-rose-50'
                            : 'text-slate-700 bg-slate-100'
                        }`}
                      >
                        {metric.deltaType === 'positive' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                        {metric.deltaType === 'negative' && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {metric.delta}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="text-xs font-medium text-slate-600">
                      {metric.notConnectedMessage || `Not available — connect ${metric.source}`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No synthetic estimate generated. Connect source for live telemetry.
                    </p>
                  </div>
                )}

                {metric.benchmark && isConnected && (
                  <p className="text-[11px] text-slate-500 mt-1">{metric.benchmark}</p>
                )}
              </div>

              {/* Bottom: Provenance & Attribution Footer */}
              <div className="pt-3 mt-1 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Source:</span>
                  <span className="font-medium text-slate-700">{metric.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Period:</span>
                  <span className="text-slate-600">{metric.period}</span>
                </div>
                {metric.lastSyncedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Synced:</span>
                    <span className="text-slate-600">
                      {new Date(metric.lastSyncedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
