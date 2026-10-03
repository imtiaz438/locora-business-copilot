import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  ReportType,
  ReportSnapshot,
  REPORT_TYPE_DEFINITIONS,
} from '../types/reports';
import {
  generateFullReportSnapshot,
  buildDataSourcesList,
  checkReportStaleness,
  hasRelevantDataForReport,
} from '../services/reportEngine';
import {
  getSavedReportSnapshots,
  saveReportSnapshot,
  deleteReportSnapshot,
} from '../services/reportStorageService';
import { ReportSourcesPanel } from './reports/ReportSourcesPanel';
import { ReportMetricsGrid } from './reports/ReportMetricsGrid';
import { ReportHistoryModal } from './reports/ReportHistoryModal';
import { exportReportToPdf } from './reports/ReportPdfExport';
import { DataProvenanceBadge } from './common/DataProvenanceBadge';
import {
  BarChart3,
  TrendingUp,
  Download,
  Share2,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  History,
  ShieldCheck,
  Building2,
  ArrowRight,
  Target,
  ExternalLink,
  Copy,
  Mail,
  Check,
  Link2,
} from 'lucide-react';

export const MonthlyReportView: React.FC = () => {
  const {
    activeBusiness,
    businessTruth,
    productionDashboard,
    customers,
    invoices,
    proposals,
    workTasks,
    projects,
    contentRecords,
    latestWebsiteAudit,
    setActiveTab,
    logActivity,
    setIsGbpSyncModalOpen,
  } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<ReportType>('business_health');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Last 30 Days');
  const [activeSnapshot, setActiveSnapshot] = useState<ReportSnapshot | null>(null);
  const [historicalSnapshots, setHistoricalSnapshots] = useState<ReportSnapshot[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const businessId = activeBusiness.id || 'default';

  const effectiveWebsite = (
    activeBusiness.website ||
    latestWebsiteAudit?.url ||
    (latestWebsiteAudit as any)?.domain ||
    productionDashboard?.business?.website ||
    (typeof window !== 'undefined' ? localStorage.getItem('locora_free_audited_domain') : '') ||
    ''
  ).trim();

  const hasWebsite = Boolean(
    effectiveWebsite.length > 0 ||
    Boolean(latestWebsiteAudit) ||
    productionDashboard?.collectedData?.websiteProject !== null ||
    productionDashboard?.collectedData?.latestCrawlRun !== null ||
    (productionDashboard?.collectedData?.websiteIssues?.length || 0) > 0
  );

  const isGbpConnected = Boolean(
    activeBusiness.gbpConnected ||
    (activeBusiness as any).googleConnected ||
    (activeBusiness.reviewCount && activeBusiness.reviewCount > 0) ||
    productionDashboard?.collectedData?.googleProfile?.isVerified
  );

  const hasRelevantData = hasRelevantDataForReport(selectedReportType, {
    activeBusiness,
    productionDashboard,
    businessTruth,
    customers,
    invoices,
    contentRecords,
    workTasks,
    projects,
    latestWebsiteAudit,
  });

  // Direct source connector dispatcher
  const handleConnectSource = useCallback((sourceId: string) => {
    if (sourceId === 'google_gbp' || sourceId.toLowerCase().includes('google') || sourceId.toLowerCase().includes('gbp')) {
      setIsGbpSyncModalOpen(true);
      logActivity('Initiated Google Business Profile connection from Reports', 'analytics');
    } else if (sourceId === 'website_crawl' || sourceId.toLowerCase().includes('website') || sourceId.toLowerCase().includes('crawl')) {
      setActiveTab('website_review');
      logActivity('Navigated to Website Review from Reports', 'analytics');
    } else if (sourceId === 'search_console' || sourceId === 'ga4') {
      setActiveTab('settings');
      logActivity(`Navigated to Settings to configure ${sourceId} from Reports`, 'analytics');
    } else {
      setActiveTab('settings');
    }
  }, [setIsGbpSyncModalOpen, setActiveTab, logActivity]);

  // Master Snapshot Generator Pipeline
  const handleGenerateSnapshot = useCallback(
    async (manualClick = true) => {
      setIsGenerating(true);
      try {
        const snapshot = await generateFullReportSnapshot({
          businessId,
          reportType: selectedReportType,
          period: selectedPeriod,
          businessTruth,
          activeBusiness,
          productionDashboard,
          customers,
          invoices,
          proposals,
          workTasks,
          projects,
          contentRecords,
          latestWebsiteAudit,
        });

        setActiveSnapshot(snapshot);

        // Save snapshot to history & database
        await saveReportSnapshot(snapshot);
        setHistoricalSnapshots((prev) => [
          snapshot,
          ...prev.filter((s) => s.id !== snapshot.id),
        ]);

        if (manualClick) {
          logActivity(
            `Generated ${snapshot.reportTitle} snapshot (${selectedPeriod}) from authentic operational data`,
            'analytics'
          );
        }
      } catch (err) {
        console.error('[MonthlyReportView] Generation error:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      businessId,
      selectedReportType,
      selectedPeriod,
      businessTruth,
      activeBusiness,
      productionDashboard,
      customers,
      invoices,
      proposals,
      workTasks,
      projects,
      contentRecords,
      latestWebsiteAudit,
      logActivity,
    ]
  );

  // Load saved historical snapshots on mount or when business/reportType/period changes
  useEffect(() => {
    let isMounted = true;
    getSavedReportSnapshots(businessId).then((snaps) => {
      if (!isMounted) return;
      setHistoricalSnapshots(snaps);

      // Find an existing snapshot matching the current report type and period
      const matching = snaps.find(
        (s) => s.reportType === selectedReportType && s.period === selectedPeriod
      );
      const hasData = hasRelevantDataForReport(selectedReportType, {
        activeBusiness,
        productionDashboard,
        businessTruth,
        customers,
        invoices,
        contentRecords,
        workTasks,
        projects,
        latestWebsiteAudit,
      });

      if (matching && hasData) {
        // Check if stale
        const currentSources = buildDataSourcesList({
          businessId,
          reportType: selectedReportType,
          period: selectedPeriod,
          businessTruth,
          activeBusiness,
          productionDashboard,
          customers,
          invoices,
          proposals,
          workTasks,
          projects,
          contentRecords,
        });
        const staleness = checkReportStaleness(matching, currentSources);
        setActiveSnapshot({
          ...matching,
          isStale: staleness.isStale,
          staleReason: staleness.reason,
        });
      } else if (hasData) {
        // Auto-generate initial snapshot ONLY if real data exists
        handleGenerateSnapshot(false);
      } else {
        // No relevant data yet — do not generate or show empty/fake snapshots
        setActiveSnapshot(null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [businessId, selectedReportType, selectedPeriod, handleGenerateSnapshot]);

  const handleDeleteSnapshot = async (id: string) => {
    await deleteReportSnapshot(businessId, id);
    setHistoricalSnapshots((prev) => prev.filter((s) => s.id !== id));
    if (activeSnapshot?.id === id) {
      const remaining = historicalSnapshots.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setActiveSnapshot(remaining[0]);
      } else {
        handleGenerateSnapshot(false);
      }
    }
  };

  const handleDownloadPdf = async () => {
    if (!activeSnapshot) return;
    try {
      await exportReportToPdf(activeSnapshot);
      logActivity(`Exported PDF for ${activeSnapshot.reportTitle}`, 'analytics');
    } catch (e) {
      console.error('Failed to export PDF:', e);
    }
  };

  const currentTypeDefinition = REPORT_TYPE_DEFINITIONS.find(
    (d) => d.id === selectedReportType
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Reports Engine
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real data reporting engine combining Business Brain, Google Business Profile, Reviews, Search Console, GA4, Website Crawl, Local Rankings, Competitors, Content, Customers, and Work.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent border-none text-slate-800 text-xs font-medium focus:ring-0 cursor-pointer"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Previous 30 Days">Previous 30 Days</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Year to Date">Year to Date</option>
            </select>
          </div>

          {/* History Modal Trigger */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-sm transition-colors"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Snapshots ({historicalSnapshots.length})</span>
          </button>

          {/* Refresh / Generate New Snapshot */}
          <button
            onClick={() => handleGenerateSnapshot(true)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Computing...' : 'Generate Snapshot'}</span>
          </button>

          {/* PDF Export */}
          <button
            onClick={handleDownloadPdf}
            disabled={!activeSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export PDF</span>
          </button>

          {/* Share */}
          <button
            onClick={() => setShowShareModal(true)}
            disabled={!activeSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* 2. REPORT TYPES SELECTOR (8 REQUIRED REPORT TYPES) */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {REPORT_TYPE_DEFINITIONS.map((def) => {
            const isSelected = selectedReportType === def.id;
            return (
              <button
                key={def.id}
                onClick={() => setSelectedReportType(def.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-center transition-all flex flex-col items-center justify-center min-h-[50px] ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                }`}
              >
                <span className="leading-tight">{def.title.replace(' Report', '')}</span>
                <span className={`text-[10px] mt-0.5 font-normal ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {def.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Info Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-900">{activeBusiness.name}</span>
          <span>•</span>
          <span>{activeBusiness.city ? `${activeBusiness.city}, ${activeBusiness.state || ''}` : 'Local Service Market'}</span>
          <span>•</span>
          <span className="text-slate-500">{currentTypeDefinition?.description}</span>
        </div>

        {activeSnapshot && (
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Clock className="w-3 h-3 mr-1 text-slate-400" />
              Generated: {new Date(activeSnapshot.reportGeneratedAt).toLocaleDateString()} {new Date(activeSnapshot.reportGeneratedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {!hasRelevantData ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl border border-slate-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-slate-400" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-xl font-bold font-heading text-slate-900">
              No data available yet
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Connect data to calculate and generate this {currentTypeDefinition?.title || 'report'}. Once real operational data is available, full intelligence and verified metrics will appear here.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            {(selectedReportType === 'reputation' || selectedReportType === 'local_seo') && (
              <button
                onClick={() => setIsGbpSyncModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                Connect Google Business Profile
              </button>
            )}
            {(selectedReportType === 'seo_performance' || selectedReportType === 'local_seo') && (
              <button
                onClick={() => setActiveTab('website_review')}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                Connect & Audit Website
              </button>
            )}
            {selectedReportType === 'local_seo' && (
              <button
                onClick={() => setActiveTab('local_visibility')}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" />
                Configure Target Keywords
              </button>
            )}
            {selectedReportType === 'customer_lead' && (
              <button
                onClick={() => setActiveTab('crm')}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                Open CRM & Add Contacts
              </button>
            )}
            {selectedReportType === 'content_performance' && (
              <button
                onClick={() => setActiveTab('content')}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Create Content Record
              </button>
            )}
            {selectedReportType === 'growth' && (
              <button
                onClick={() => setActiveTab('work')}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Open Work Hub & Add Records
              </button>
            )}
            {selectedReportType === 'business_health' && (
              <button
                onClick={() => setActiveTab('business_truth')}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Setup Business Brain Profile
              </button>
            )}
          </div>
        </div>
      ) : isGenerating && !activeSnapshot ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Generating {currentTypeDefinition?.title || 'Report'} Snapshot...
            </h3>
            <p className="text-xs text-slate-500">
              Synthesizing real metrics from {activeBusiness.name} and connected operational channels.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Telemetry Status Banners */}
          {hasWebsite && !isGbpConnected && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-blue-950">
                    Website Connected & Reporting: {activeBusiness.website}
                  </p>
                  <p className="text-blue-800 text-[11px] mt-0.5">
                    Technical SEO, page health, and crawl telemetry are active. Google Business Profile is currently unlinked — connect GBP to also stream live Google Reviews and Local 3-Pack Map rankings.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGbpSyncModalOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer self-start sm:self-center"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Connect Google Business Profile</span>
              </button>
            </div>
          )}

          {isGbpConnected && !hasWebsite && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-emerald-950">
                    Google Business Profile Connected & Reporting
                  </p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Live Google Reviews ({activeBusiness.reviewCount || 0} reviews) and Map 3-Pack telemetry are active. Connect your website to also unlock technical crawl health and speed scoring.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('website_review')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer self-start sm:self-center"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Connect Website</span>
              </button>
            </div>
          )}

          {isGbpConnected && hasWebsite && (
            <div className="bg-gradient-to-r from-emerald-50/60 via-slate-50 to-indigo-50/60 border border-emerald-200/60 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium text-slate-800">
                  <strong className="text-emerald-800 font-semibold">Dual Telemetry Active:</strong> Both Website ({activeBusiness.website}) and Google Business Profile are actively synchronized in this report.
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                100% Operational Telemetry
              </span>
            </div>
          )}

          {/* 3. DATA SOURCE TRANSPARENCY & LIVE STALENESS MONITOR */}
          {activeSnapshot && (
            <ReportSourcesPanel
              sources={activeSnapshot.dataSourcesUsed}
              dataSnapshotAt={activeSnapshot.dataSnapshotAt}
              isStale={activeSnapshot.isStale}
              staleReason={activeSnapshot.staleReason}
              onRefresh={() => handleGenerateSnapshot(true)}
              isRefreshing={isGenerating}
              onConnectSource={handleConnectSource}
            />
          )}

          {/* 4. EXECUTIVE SUMMARY (AI EXPLANATION ENGINE) */}
          {activeSnapshot && (
            <div className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 border border-indigo-100/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100/60 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    Executive Synthesis & Explanation
                  </h2>
                  <DataProvenanceBadge
                    type="AI_RECOMMENDATION"
                    customText="✦ AI Recommendation"
                    size="xs"
                  />
                </div>
                <span className="text-xs text-slate-400">
                  Zero invented numbers • Grounded in stored telemetry
                </span>
              </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {activeSnapshot.executiveSummary.overview}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                What Changed
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeSnapshot.executiveSummary.whatChanged}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                Why It Matters
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeSnapshot.executiveSummary.whyItMatters}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                What Should Happen Next
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeSnapshot.executiveSummary.whatShouldHappenNext}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. WHAT CHANGED (CONCRETE COMPARISONS & DELTAS) */}
      {activeSnapshot && activeSnapshot.whatChangedItems?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              What Changed This Period
            </h3>
            <span className="text-xs text-slate-400">
              Direct telemetry comparisons against previous baseline
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeSnapshot.whatChangedItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                    {item.title}
                  </span>
                  <span className="text-base font-bold text-slate-900 block mt-1">
                    {item.delta}
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    {item.detail}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Source:</span>
                  <span className="font-medium text-slate-600">{item.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. VERIFIED OPERATIONAL METRICS (WITH PROVENANCE & TRANSPARENCY) */}
      {activeSnapshot && (
        <ReportMetricsGrid
          metrics={activeSnapshot.keyMetrics}
          onConnectSource={handleConnectSource}
        />
      )}

      {/* 7. PROBLEMS DETECTED & OPPORTUNITIES */}
      {activeSnapshot && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problems Detected */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Problems Detected ({activeSnapshot.problemsDetected.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Audited from real data</span>
            </div>

            {activeSnapshot.problemsDetected.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">Zero Critical Blockers</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No crawl errors, unhandled reviews, or billing issues detected in this period.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSnapshot.problemsDetected.map((prob) => (
                  <div
                    key={prob.id}
                    className="p-3.5 rounded-lg border border-rose-100 bg-rose-50/50 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-rose-900">
                        {prob.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                          prob.severity === 'critical'
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {prob.severity}
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 leading-snug">
                      {prob.description}
                    </p>
                    {prob.suggestedAction && (
                      <p className="text-[11px] text-rose-900 font-medium pt-1">
                        • Action: {prob.suggestedAction}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Detected via: {prob.source}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opportunities */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Growth Opportunities ({activeSnapshot.opportunities.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Market expansion</span>
            </div>

            {activeSnapshot.opportunities.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">No pending opportunities cataloged.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSnapshot.opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3.5 rounded-lg border border-amber-100 bg-amber-50/40 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {opp.title}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex-shrink-0">
                        {opp.expectedGain}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      {opp.description}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Identified via: {opp.source}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. PRIORITIZED RECOMMENDED ACTIONS */}
      {activeSnapshot && activeSnapshot.recommendedActions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Prioritized Action Plan
              </h3>
              <p className="text-xs text-slate-500">
                Sequenced steps grounded in verified operational findings
              </p>
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {activeSnapshot.recommendedActions.length} Actions
            </span>
          </div>

          <div className="space-y-3">
            {activeSnapshot.recommendedActions.map((act, index) => (
              <div
                key={act.id}
                className="flex items-start gap-3.5 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-900">
                      {act.action}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded self-start sm:self-auto">
                      {act.targetArea}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {act.rationale}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    Source: {act.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. DETAILED FINDINGS & FACTUAL EVIDENCE */}
      {activeSnapshot && activeSnapshot.detailedFindings.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Detailed Findings & Evidence
            </h3>
            <p className="text-xs text-slate-500">
              Operational audit trails and recorded telemetry records
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSnapshot.detailedFindings.map((finding) => (
              <div
                key={finding.id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 space-y-2"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    {finding.category}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-900 mt-0.5">
                    {finding.title}
                  </h4>
                </div>

                <ul className="space-y-1 text-xs text-slate-600">
                  {finding.findings.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {finding.evidence && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
                    Evidence: {finding.evidence}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}

      {/* Snapshot History Modal */}
      <ReportHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        snapshots={historicalSnapshots}
        activeSnapshotId={activeSnapshot?.id || null}
        onSelectSnapshot={(snap) => setActiveSnapshot(snap)}
        onDeleteSnapshot={handleDeleteSnapshot}
      />

      {/* Share Modal */}
      {showShareModal && activeSnapshot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowShareModal(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Share Report Snapshot</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-xs font-bold cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Share a read-only, authentic performance report for <strong>{activeSnapshot.businessName}</strong> ({activeSnapshot.reportTitle} — {activeSnapshot.period}).
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-center justify-between gap-2">
              <span className="truncate font-mono text-[11px]">
                https://locora.app/reports/view/{activeSnapshot.id}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://locora.app/reports/view/${activeSnapshot.id}`
                  );
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium flex items-center gap-1 flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDownloadPdf}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
