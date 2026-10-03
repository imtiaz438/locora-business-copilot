import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ExternalDataset,
  DatasetFreshnessStatus,
} from '../types.ts';
import {
  formatDatasetFreshness,
  getFreshnessStatusDetails,
  resolveBusinessDatasets,
} from '../lib/dataFreshness.ts';
import {
  RefreshCw,
  Clock,
  ShieldCheck,
  Globe,
  Search,
  MapPin,
  FileCode,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface DataFreshnessPanelProps {
  className?: string;
  compact?: boolean;
}

export const DataFreshnessPanel: React.FC<DataFreshnessPanelProps> = ({
  className = '',
  compact = false,
}) => {
  const {
    activeBusiness,
    businessTruth,
    latestWebsiteAudit,
    setActiveTab,
    setIsGbpSyncModalOpen,
  } = useApp();

  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'connected' | 'not_connected'>('all');
  // lastCheckedAt per dataset — records WHEN the admin last reviewed the real
  // connection state. Never overrides the actual status (no fabricated syncs).
  const [lastCheckedAt, setLastCheckedAt] = useState<Record<string, string>>({});

  // Resolve current business datasets — status always derives from real state
  // (AppContext: activeBusiness, businessTruth, latestWebsiteAudit).
  const rawDatasets = resolveBusinessDatasets({
    activeBusiness,
    businessTruth,
    latestWebsiteAudit,
  });

  // Status is never overridden locally; only the "last checked" timestamp is recorded.
  const datasets: ExternalDataset[] = rawDatasets.map((ds) => ({
    ...ds,
  }));

  const connectedCount = datasets.filter((d) => d.status === 'connected').length;
  const totalCount = datasets.length;

  const filteredDatasets = datasets.filter((ds) => {
    if (activeFilter === 'connected') return ds.status === 'connected';
    if (activeFilter === 'not_connected') return ds.status !== 'connected';
    return true;
  });

  const handleRefreshDataset = async (dataset: ExternalDataset) => {
    setSyncingId(dataset.id);
    try {
      // If dataset is GBP, allow opening modal or quick re-sync
      if (dataset.id === 'google_business_profile' && dataset.status !== 'connected') {
        setIsGbpSyncModalOpen(true);
        setSyncingId(null);
        return;
      }

      // Honest re-check: re-derive the dataset's real status from current
      // connection state. Never marks a dataset connected unless it truly is.
      const fresh = resolveBusinessDatasets({ activeBusiness, businessTruth, latestWebsiteAudit });
      const live = fresh.find((d) => d.id === dataset.id);
      setLastCheckedAt((prev) => ({ ...prev, [dataset.id]: new Date().toISOString() }));
      if (live && live.status !== 'connected') {
        // Status stays as derived — the UI shows the real state with a Connect action.
      }
    } finally {
      setSyncingId(null);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    try {
      // Re-derive real statuses; record when the review happened. No fake pings.
      resolveBusinessDatasets({ activeBusiness, businessTruth, latestWebsiteAudit });
      const now = new Date().toISOString();
      setLastCheckedAt((prev) => {
        const next = { ...prev };
        datasets.forEach((ds) => {
          next[ds.id] = now;
        });
        return next;
      });
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const getDatasetIcon = (id: string) => {
    switch (id) {
      case 'google_business_profile':
        return <Globe className="w-4 h-4 text-emerald-700" />;
      case 'search_console':
        return <Search className="w-4 h-4 text-blue-700" />;
      case 'local_rankings':
        return <MapPin className="w-4 h-4 text-emerald-700" />;
      case 'website_audit':
        return <FileCode className="w-4 h-4 text-indigo-700" />;
      case 'keywords_traffic':
        return <Layers className="w-4 h-4 text-amber-700" />;
      case 'ai_visibility':
        return <Sparkles className="w-4 h-4 text-purple-700" />;
      default:
        return <Clock className="w-4 h-4 text-slate-700" />;
    }
  };

  return (
    <section
      id="external-datasets-freshness"
      className={`bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 ${className}`}
    >
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              Data Freshness & Transparency
            </span>
            <span className="text-xs text-slate-500 font-medium">
              • {connectedCount} of {totalCount} Feeds Live
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
            External Datasets & Verification Status
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Every metric in your dashboard is anchored to verified provider feeds. Review live sync times, source APIs, and connection states with zero synthetic numbers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isRefreshingAll}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Re-check all dataset statuses against live connection state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAll ? 'animate-spin text-emerald-700' : 'text-slate-600'}`} />
            <span>{isRefreshingAll ? 'Refreshing Feeds...' : 'Refresh All'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          All Datasets ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('connected')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'connected'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          Connected ({connectedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('not_connected')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'not_connected'
              ? 'bg-slate-700 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          Not Connected ({totalCount - connectedCount})
        </button>
      </div>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDatasets.map((dataset) => {
          const statusDetails = getFreshnessStatusDetails(dataset.status);
          const freshnessLabel = formatDatasetFreshness(dataset);
          const isSyncing = syncingId === dataset.id;

          return (
            <div
              key={dataset.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                dataset.status === 'connected'
                  ? 'bg-slate-50/60 hover:bg-slate-50 border-slate-200'
                  : 'bg-white border-dashed border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Dataset Name + Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
                      {getDatasetIcon(dataset.id)}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold font-heading text-slate-900 leading-snug">
                        {dataset.name}
                      </h3>
                      {/* Exact Freshness String Requested */}
                      <p className={`text-xs font-bold font-sans mt-0.5 ${
                        dataset.status === 'connected' ? 'text-emerald-800' : 'text-slate-500'
                      }`}>
                        {freshnessLabel}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusDetails.badgeBg} ${statusDetails.badgeText} ${statusDetails.badgeBorder} shrink-0`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDetails.dotColor}`} />
                    {statusDetails.label}
                  </span>
                </div>

                {/* Source & Details */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <span className="text-slate-400 font-sans">source:</span>
                    <span className="font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200/70">
                      {dataset.source}
                    </span>
                  </div>

                  {dataset.description && (
                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                      {dataset.description}
                    </p>
                  )}
                </div>

                {/* Explicit Error Display if Present */}
                {dataset.error && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span className="leading-snug">{dataset.error}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {dataset.last_synced_at ? (
                    new Date(dataset.last_synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  ) : (
                    'Not linked'
                  )}
                </span>

                <div className="flex items-center gap-2">
                  {dataset.actionTab && (
                    <button
                      type="button"
                      onClick={() => {
                        if (dataset.id === 'google_business_profile' && dataset.status !== 'connected') {
                          setIsGbpSyncModalOpen(true);
                        } else {
                          setActiveTab(dataset.actionTab!);
                        }
                      }}
                      className="text-[11px] font-bold text-slate-700 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRefreshDataset(dataset)}
                    disabled={isSyncing}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                      dataset.status === 'connected'
                        ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>
                      {isSyncing
                        ? 'Syncing...'
                        : dataset.status === 'connected'
                        ? 'Check Now'
                        : 'Connect'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
