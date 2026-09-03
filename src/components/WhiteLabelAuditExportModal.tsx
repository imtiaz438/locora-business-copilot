import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  ShieldCheck,
  Download,
  FileText,
  Upload,
  Globe,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  Mail,
  Phone,
  X,
  AlertTriangle,
  XCircle,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Search,
  CheckCheck,
  Sliders,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Info,
} from 'lucide-react';
import { openWhopOneTimeCheckout } from '../lib/whopService';
import {
  AuditCheckItem,
  Audit40EvaluationResult,
  build40PointAudit,
  BRAND_COLOR_PRESETS,
} from '../utils/audit40PointsGenerator';
import { generateAuditPdf } from '../utils/auditPdfGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  auditUrl?: string;
  auditData?: any;
}

export const WhiteLabelAuditExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  auditUrl,
  auditData,
}) => {
  const {
    user,
    businessProfile,
    latestWebsiteAudit,
    setLatestWebsiteAudit,
    settings,
    logActivity,
    setAuthModalOpen,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Target URL
  const [inputUrl, setInputUrl] = useState<string>(
    auditUrl || latestWebsiteAudit?.url || businessProfile.website || 'brightsmiledental.com'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [rawAuditResult, setRawAuditResult] = useState<any>(
    auditData || (latestWebsiteAudit?.url?.includes(inputUrl) ? latestWebsiteAudit : null)
  );

  // Category filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    'all' | 'performance' | 'seo' | 'security' | 'mobile' | 'local_seo'
  >('all');
  const [filterIssuesOnly, setFilterIssuesOnly] = useState(false);

  // White-Label Branding state
  const [agencyName, setAgencyName] = useState(
    businessProfile.name && businessProfile.name !== 'My Business Workspace'
      ? businessProfile.name
      : 'Apex Digital Media Group'
  );
  const [agencyWebsite, setAgencyWebsite] = useState(
    businessProfile.website || 'https://apexdigitalmedia.com'
  );
  const [agencyContactEmail, setAgencyContactEmail] = useState(
    businessProfile.email || user.email || 'partner@apexdigitalmedia.com'
  );
  const [agencyPhone, setAgencyPhone] = useState(
    businessProfile.phone || '+1 (555) 782-9901'
  );

  // Custom Agency Logo (Upload or URL)
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>(
    (businessProfile as any).logo || null
  );

  // Custom Agency Brand Primary Color
  const [agencyBrandColor, setAgencyBrandColor] = useState<string>('#4f46e5');

  // Client Details & Proposal Customization
  const [clientBusinessName, setClientBusinessName] = useState('Bright Smile Dental');
  const [customExecutiveNote, setCustomExecutiveNote] = useState(
    'This comprehensive 40-point technical, SEO, and performance evaluation was executed on live production assets. Immediate remediation of critical issues will protect search rankings, improve mobile conversions, and eliminate estimated monthly revenue leakage.'
  );
  const [proposalRetainerQuote, setProposalRetainerQuote] = useState('$2,250/month');
  const [includePricingPitch, setIncludePricingPitch] = useState(true);

  // Checkout & UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(true);

  // Derive Client Business Name automatically if blank
  useEffect(() => {
    if (rawAuditResult?.metadata?.title) {
      const derived = rawAuditResult.metadata.title.split(/[-|•–]/)[0].trim();
      if (derived && derived.length < 40) {
        setClientBusinessName(derived);
      }
    } else if (inputUrl) {
      const clean = inputUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/^www\./i, '');
      const nameGuess = clean.split('.')[0];
      if (nameGuess && clientBusinessName === 'Bright Smile Dental') {
        const formatted = nameGuess.charAt(0).toUpperCase() + nameGuess.slice(1);
        setClientBusinessName(formatted);
      }
    }
  }, [rawAuditResult, inputUrl]);

  // Sync when props change or modal opens
  useEffect(() => {
    if (auditUrl && auditUrl !== inputUrl) {
      setInputUrl(auditUrl);
    }
    if (auditData) {
      setRawAuditResult(auditData);
    } else if (latestWebsiteAudit) {
      setRawAuditResult(latestWebsiteAudit);
    }
  }, [auditUrl, auditData, isOpen]);

  // Compute 40-Point Evaluation from Real Data
  const auditEvaluation: Audit40EvaluationResult = useMemo(() => {
    return build40PointAudit(inputUrl, rawAuditResult);
  }, [inputUrl, rawAuditResult]);

  // Filtered list of points
  const visiblePoints = useMemo(() => {
    return auditEvaluation.points.filter((pt) => {
      if (selectedCategoryFilter !== 'all' && pt.category !== selectedCategoryFilter) {
        return false;
      }
      if (filterIssuesOnly && pt.status === 'pass') {
        return false;
      }
      return true;
    });
  }, [auditEvaluation.points, selectedCategoryFilter, filterIssuesOnly]);

  // Handle Logo Upload from local file
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Logo image size must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setAgencyLogoUrl(result);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Run Live Website Audit
  const handleRunLiveScan = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    const clean = inputUrl.trim();
    if (!clean || isScanning) return;

    setIsScanning(true);
    setScanError(null);
    setErrorMessage(null);

    try {
      const activeModel =
        (settings.providerModels && settings.providerModels[settings.activeProvider]) ||
        settings.activeModelVersion;

      const response = await fetch('/api/ai/audit-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: clean,
          businessProfile,
          provider: settings.activeProvider,
          modelVersion: activeModel,
          providerKey: settings.providerKeys[settings.activeProvider],
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to crawl website.');
      }

      setRawAuditResult(data);
      setLatestWebsiteAudit(data);
      logActivity('audit', 'Live 40-Point Diagnostic', `Crawled and evaluated 40 points for ${clean}`);
    } catch (err: any) {
      setScanError(err.message || 'Unable to complete live crawl.');
    } finally {
      setIsScanning(false);
    }
  };

  // Trigger Checkout for One-Time $9.99 Whop Purchase
  const handleTriggerCheckout = async () => {
    if (!user || user.id === 'demo-user-123') {
      setAuthModalOpen(true);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const checkoutResult = await openWhopOneTimeCheckout({
        productType: 'white_label_audit',
        price: 9.99,
        email: user.email,
        name: user.name,
        userId: user.id,
        metadata: {
          clientUrl: inputUrl,
          agencyName,
          clientBusinessName,
          brandColor: agencyBrandColor,
        },
        onError: (err) => setErrorMessage(err),
      });

      if (checkoutResult.checkoutUrl) {
        logActivity(
          'payment',
          `White-Label Audit Checkout (${clientBusinessName})`,
          `Launched Whop checkout for $9.99 White-Label PDF Export for ${inputUrl}.`
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct Client PDF Download Handler (No browser print dialog, instant .pdf download)
  const handleDownloadPdf = () => {
    if (!isUnlocked) {
      setErrorMessage('The white-label report is locked. Please purchase to unlock export.');
      return;
    }

    try {
      generateAuditPdf({
        evaluation: auditEvaluation,
        agencyName,
        clientBusinessName,
        agencyContactEmail,
        agencyPhone,
        agencyWebsite,
        agencyBrandColor,
        customExecutiveNote,
        proposalRetainerQuote,
      });

      logActivity(
        'audit',
        'Exported White-Label Audit PDF',
        `Downloaded 40-point client PDF audit for ${inputUrl}`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate PDF document.');
    }
  };

  const cleanDomainKey = useMemo(() => {
    return (inputUrl || auditUrl || '')
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .trim()
      .toLowerCase();
  }, [inputUrl, auditUrl]);

  const isAgencyTier = user.planTier === 'agency';

  // Paywall state: Agency tier includes full access; other users unlock per-domain via $9.99 Whop payment
  const [isUnlockedLocally, setIsUnlockedLocally] = useState<boolean>(() => {
    if (isAgencyTier) return true;
    try {
      const key = (inputUrl || auditUrl || '').replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim().toLowerCase();
      return localStorage.getItem(`unlocked_audit_${key}`) === 'true';
    } catch {
      return false;
    }
  });

  // Sync unlock status when target domain or user plan changes
  useEffect(() => {
    if (isAgencyTier) {
      setIsUnlockedLocally(true);
      return;
    }
    try {
      const isSaved = localStorage.getItem(`unlocked_audit_${cleanDomainKey}`) === 'true';
      setIsUnlockedLocally(isSaved);
    } catch {
      setIsUnlockedLocally(false);
    }
  }, [cleanDomainKey, isAgencyTier]);

  const isUnlocked = isAgencyTier || isUnlockedLocally;

  const handleUnlockSuccess = () => {
    setIsUnlockedLocally(true);
    try {
      localStorage.setItem(`unlocked_audit_${cleanDomainKey}`, 'true');
    } catch {}
    logActivity('audit', 'Unlocked 40-Point White-Label Audit', `Unlocked full report for ${cleanDomainKey}`);
  };

  if (!isOpen) return null;

  return (
    <div
      id="whitelabel_audit_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto font-sans"
    >
      <div
        id="whitelabel_audit_modal_container"
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col"
      >
        {/* Modal Header */}
        <div
          className="text-white p-5 sm:p-6 relative shrink-0 border-b border-white/10 transition-colors"
          style={{
            background: `linear-gradient(135deg, #0f172a 0%, ${agencyBrandColor}dd 60%, #0f172a 100%)`,
          }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white backdrop-blur-xs shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold uppercase tracking-wider mb-0.5 border border-white/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  <span>40-Point Deep Technical & SEO Evaluation</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black font-heading tracking-tight text-white">
                  White-Label Client PDF Audit
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-900">
          {/* Live Data Target & Instant Live Scan Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Live Audit Target Domain
                </span>
                <p className="text-xs text-slate-600">
                  Runs a live crawl analyzing 40 real technical, SEO, speed, security, and mobile signals.
                </p>
              </div>

              {rawAuditResult?.analyzedAt && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Crawl Active: {new Date(rawAuditResult.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleRunLiveScan} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="e.g. clientwebsite.com"
                  className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isScanning || !inputUrl.trim()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Auditing Live Site...' : 'Run Live 40-Point Diagnostic'}</span>
              </button>
            </form>

            {scanError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Live Scan Notice:</span> {scanError}
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Evaluations will calculate based on domain conventions and fallback crawl metrics.
                  </p>
                </div>
              </div>
            )}

            {/* Real Crawl Summary Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1 border-t border-slate-200 text-slate-700">
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Server TTFB</span>
                <span className="text-xs font-black text-slate-900">
                  {auditEvaluation.crawlSummary.latencyMs}ms
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">HTML Payload</span>
                <span className="text-xs font-black text-slate-900">
                  {auditEvaluation.crawlSummary.htmlSizeKb} KB
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Images & Alt</span>
                <span className="text-xs font-black text-slate-900">
                  {auditEvaluation.crawlSummary.totalImages} ({auditEvaluation.crawlSummary.imageAltMissingCount} missing)
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">H1 Headings</span>
                <span className="text-xs font-black text-slate-900">
                  {auditEvaluation.crawlSummary.h1Count} H1 found
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Mobile Tel Links</span>
                <span className="text-xs font-black text-slate-900">
                  {auditEvaluation.crawlSummary.telLinksCount} direct call
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Schema Markup</span>
                <span className="text-xs font-black text-slate-900 truncate">
                  {auditEvaluation.crawlSummary.schemaTypes.length > 0
                    ? auditEvaluation.crawlSummary.schemaTypes[0]
                    : auditEvaluation.crawlSummary.hasSchema
                    ? 'Active'
                    : 'Missing'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar: Overall Score & Revenue Loss */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Health Score */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-black font-heading text-2xl border-2 shrink-0 shadow-inner"
                style={{
                  borderColor: agencyBrandColor,
                  color: agencyBrandColor,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                {auditEvaluation.overallScore}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Overall Audit Health
                </span>
                <h4 className="text-base font-bold font-heading text-white">
                  {auditEvaluation.overallScore >= 80
                    ? 'High Performer'
                    : auditEvaluation.overallScore >= 60
                    ? 'Moderate Flaws Detected'
                    : 'Critical Action Required'}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {auditEvaluation.passedCount} passed · {auditEvaluation.warningCount} warnings · {auditEvaluation.failedCount} failures
                </p>
              </div>
            </div>

            {/* Est. Client Monthly Revenue Leak */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  Est. Client Monthly Loss
                </span>
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-2xl sm:text-3xl font-black font-heading text-rose-900">
                  ${auditEvaluation.estMonthlyRevenueLoss.toLocaleString()}
                </span>
                <span className="text-xs text-rose-700 font-bold">/ month</span>
              </div>
              <p className="text-[11px] text-rose-700">
                Calculated directly from {auditEvaluation.failedCount} critical failures & conversion gaps
              </p>
            </div>

            {/* Est. Annual Opportunity */}
            <div
              className="rounded-2xl p-5 border flex flex-col justify-between"
              style={{
                backgroundColor: `${agencyBrandColor}0d`,
                borderColor: `${agencyBrandColor}33`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: agencyBrandColor }}
                >
                  Est. Annual Revenue Gap
                </span>
                <DollarSign className="w-4 h-4" style={{ color: agencyBrandColor }} />
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span
                  className="text-2xl sm:text-3xl font-black font-heading"
                  style={{ color: agencyBrandColor }}
                >
                  ${auditEvaluation.estAnnualRevenueLoss.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-600">/ year</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Justifies a {proposalRetainerQuote} implementation retainer
              </p>
            </div>
          </div>

          {/* White-Label Customization Settings Drawer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 font-heading">
                  Agency Logo, Brand Colors & Retainer Customization
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {showSettingsDrawer ? (
                  <>
                    <span>Hide Details</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Edit Brand & Retainer</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {showSettingsDrawer && (
              <div className="space-y-4 pt-1 text-xs">
                {/* Agency Logo & Brand Accent Color Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {/* Agency Logo */}
                  <div>
                    <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Custom Agency Logo</span>
                    </label>
                    <div className="flex items-center gap-3">
                      {agencyLogoUrl ? (
                        <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-xs relative group">
                          <img
                            src={agencyLogoUrl}
                            alt="Agency Logo"
                            className="max-h-full max-w-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setAgencyLogoUrl(null)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Logo"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 shrink-0">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          className="hidden"
                          onChange={handleLogoFileUpload}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Upload className="w-3 h-3 text-indigo-600" />
                            <span>Upload Logo (PNG/SVG)</span>
                          </button>
                          {agencyLogoUrl && (
                            <button
                              type="button"
                              onClick={() => setAgencyLogoUrl(null)}
                              className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={agencyLogoUrl || ''}
                          onChange={(e) => setAgencyLogoUrl(e.target.value)}
                          placeholder="Or paste image URL (https://...)"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Brand Accent Color */}
                  <div>
                    <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Agency Brand Colors (Tints PDF Theme)</span>
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {BRAND_COLOR_PRESETS.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setAgencyBrandColor(color.hex)}
                          className={`w-7 h-7 rounded-lg transition-transform cursor-pointer border flex items-center justify-center ${
                            agencyBrandColor.toLowerCase() === color.hex.toLowerCase()
                              ? 'scale-110 ring-2 ring-indigo-500 ring-offset-1 border-white'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {agencyBrandColor.toLowerCase() === color.hex.toLowerCase() && (
                            <CheckCheck className="w-3.5 h-3.5 text-white stroke-[3]" />
                          )}
                        </button>
                      ))}

                      {/* Custom Hex Picker */}
                      <div className="flex items-center gap-1 ml-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                        <input
                          type="color"
                          value={agencyBrandColor}
                          onChange={(e) => setAgencyBrandColor(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                          title="Custom Color"
                        />
                        <span className="text-[11px] font-mono font-bold text-slate-700">
                          {agencyBrandColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agency Details Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Agency Name</label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500"
                      placeholder="Apex Digital Marketing"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Client Business Name</label>
                    <input
                      type="text"
                      value={clientBusinessName}
                      onChange={(e) => setClientBusinessName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500"
                      placeholder="Bright Smile Dental"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Agency Contact Email</label>
                    <input
                      type="email"
                      value={agencyContactEmail}
                      onChange={(e) => setAgencyContactEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500"
                      placeholder="partner@agency.com"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Agency Phone</label>
                    <input
                      type="text"
                      value={agencyPhone}
                      onChange={(e) => setAgencyPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Cover Note & Retainer Pitch */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Executive Summary / Client Cover Note
                    </label>
                    <textarea
                      rows={2}
                      value={customExecutiveNote}
                      onChange={(e) => setCustomExecutiveNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                      placeholder="Custom audit notes for the client..."
                    />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePricingPitch}
                        onChange={(e) => setIncludePricingPitch(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-xs font-bold text-slate-800">Include Retainer Quote</span>
                    </label>
                    {includePricingPitch && (
                      <input
                        type="text"
                        value={proposalRetainerQuote}
                        onChange={(e) => setProposalRetainerQuote(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-indigo-500"
                        placeholder="e.g. $2,250/month"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 40-Point Diagnostic Breakdown Navigation & Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black font-heading text-slate-900">
                  Detailed 40-Point Inspection Grid ({visiblePoints.length} of 40 Displayed)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setFilterIssuesOnly(!filterIssuesOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterIssuesOnly
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Show Issues Only ({auditEvaluation.failedCount + auditEvaluation.warningCount})</span>
              </button>
            </div>

            {/* Pillar Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All 40 Points
              </button>

              {auditEvaluation.pillars.map((pillar) => (
                <button
                  key={pillar.key}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(pillar.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategoryFilter === pillar.key
                      ? 'text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={
                    selectedCategoryFilter === pillar.key
                      ? { backgroundColor: agencyBrandColor }
                      : undefined
                  }
                >
                  <span>{pillar.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      selectedCategoryFilter === pillar.key
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {pillar.score}%
                  </span>
                </button>
              ))}
            </div>

            {/* 40-Point Cards Grid or Strict Locked State */}
            {!isUnlocked ? (
              <div className="py-12 px-6 rounded-2xl border-2 border-slate-200/90 bg-gradient-to-b from-slate-50 to-white text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xs my-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-600 mb-4 shadow-2xs">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black font-heading text-slate-900 mb-2">
                  White-Label Client Audit Report Locked
                </h3>
                <p className="text-xs text-slate-600 max-w-lg mb-6 leading-relaxed">
                  This complete 40-point technical audit, itemized client revenue leak diagnostics, turnkey Scope of Work (SOW), and unbranded agency deliverable are strictly locked. Access will remain completely protected until purchased.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleTriggerCheckout}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${agencyBrandColor} 0%, #0f172a 100%)`,
                    }}
                  >
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>{isProcessing ? 'Connecting...' : 'Unlock Full 40 Points ($9.99)'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-4">
                  Included without limits on Agency Tier. Instant unbranded client-ready PDF deliverable.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {visiblePoints.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                        item.status === 'pass'
                          ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                          : item.status === 'warning'
                          ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                          : 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white border border-slate-200 font-bold text-[10px] flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
                              {item.id}
                            </span>
                            <h4 className="font-extrabold text-slate-900 leading-snug">
                              {item.name}
                            </h4>
                          </div>

                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                              item.status === 'pass'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.status === 'pass' ? 'PASS' : item.status === 'warning' ? 'WARNING' : 'FAILED'}
                          </span>
                        </div>

                        <p className="text-[11.5px] text-slate-700 mb-2 leading-relaxed">
                          {item.diagnostic}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2 text-[11px]">
                        <div className="text-slate-500 font-medium truncate">
                          <span className="font-bold text-slate-700">Target:</span> {item.targetMetric}
                        </div>
                        {item.clientLossMonthly > 0 && (
                          <span className="font-bold text-rose-700 shrink-0">
                            -${item.clientLossMonthly}/mo leak
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* CLIENT-READY DELIVERABLE DOCUMENT PREVIEW (WHEN UNLOCKED) */}
          {/* ========================================================= */}
          {isUnlocked && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-heading">
                Client PDF Deliverable Preview
              </span>
              <span className="text-[11px] text-slate-500">
                Pixel-perfect unbranded deliverable formatted for client presentation
              </span>
            </div>

            <div
              id="white_label_audit_printable_canvas"
              className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md text-slate-900"
            >
              {/* Report Header: Client Title & Agency Branding */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
                <div>
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-white text-[10px] font-extrabold uppercase tracking-wider mb-1.5"
                    style={{ backgroundColor: agencyBrandColor }}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Executive Technical & SEO Evaluation</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
                    {clientBusinessName}
                  </h1>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    Target Domain:{' '}
                    <span className="font-mono font-bold text-slate-900">
                      https://{auditEvaluation.cleanDomain}
                    </span>{' '}
                    · Audited on {auditEvaluation.analyzedAt}
                  </p>
                </div>

                {/* Agency Brand Block */}
                <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                  {agencyLogoUrl ? (
                    <img
                      src={agencyLogoUrl}
                      alt={agencyName}
                      className="max-h-12 max-w-[180px] object-contain mb-1"
                    />
                  ) : (
                    <div
                      className="text-xs font-black font-heading tracking-tight"
                      style={{ color: agencyBrandColor }}
                    >
                      {agencyName}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold text-slate-900 block">{agencyName}</span>
                    <span>{agencyWebsite} · {agencyPhone}</span>
                  </div>
                </div>
              </div>

              {/* Cover Note */}
              <div
                className="p-3.5 rounded-xl border text-xs text-slate-800 leading-relaxed"
                style={{
                  backgroundColor: `${agencyBrandColor}08`,
                  borderColor: `${agencyBrandColor}26`,
                }}
              >
                <span className="font-extrabold block text-slate-900 mb-0.5">
                  Executive Findings & Audit Scope:
                </span>
                {customExecutiveNote}
              </div>

              {/* 5 Pillar Scores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {auditEvaluation.pillars.map((pillar) => (
                  <div
                    key={pillar.key}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center"
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                      {pillar.label}
                    </span>
                    <span
                      className="text-xl font-black font-heading my-1 block"
                      style={{
                        color:
                          pillar.score >= 80
                            ? '#059669'
                            : pillar.score >= 60
                            ? '#d97706'
                            : '#e11d48',
                      }}
                    >
                      {pillar.score}%
                    </span>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pillar.score}%`,
                          backgroundColor:
                            pillar.score >= 80
                              ? '#059669'
                              : pillar.score >= 60
                              ? '#d97706'
                              : '#e11d48',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Loss Callout Box */}
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                    Estimated Revenue At Risk
                  </span>
                  <h4 className="text-sm font-bold font-heading text-rose-950">
                    Calculated Monthly Digital Leaks from Technical Flaws
                  </h4>
                  <p className="text-xs text-rose-700">
                    Unoptimized mobile speed, missing schema, and broken call links directly suppress inquiries.
                  </p>
                </div>
                <div className="text-center sm:text-right shrink-0 bg-white border border-rose-200 px-4 py-2.5 rounded-xl shadow-2xs">
                  <span className="text-2xl font-black font-heading text-rose-900 block">
                    ${auditEvaluation.estMonthlyRevenueLoss.toLocaleString()}
                    <span className="text-xs font-bold text-rose-700">/mo</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    (${auditEvaluation.estAnnualRevenueLoss.toLocaleString()} / year)
                  </span>
                </div>
              </div>

              {/* Printable 40 Points Summary Table */}
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
                    {isUnlocked ? 'All 40 Evaluated Checkpoints' : 'Evaluated Checkpoints (Executive Teaser: First 5 of 40)'}
                  </h4>
                  {!isUnlocked && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>Points 6-40 Locked</span>
                    </span>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {(isUnlocked ? auditEvaluation.points : auditEvaluation.points.slice(0, 5)).map((pt) => (
                    <div
                      key={pt.id}
                      className="p-2.5 flex items-start justify-between gap-3 hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400 w-5 mt-0.5">
                          #{pt.id}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{pt.name}</div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {pt.diagnostic}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            pt.status === 'pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pt.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {pt.status === 'pass' ? 'PASS' : pt.status === 'warning' ? 'WARNING' : 'FAIL'}
                        </span>
                        {pt.clientLossMonthly > 0 && (
                          <div className="text-[10px] font-bold text-rose-600 mt-1">
                            -${pt.clientLossMonthly}/mo
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Frosted Watermark Paywall Overlay when locked */}
                {!isUnlocked && (
                  <div className="relative mt-3 rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50/90 via-white/95 to-slate-50/90 p-6 text-center space-y-4 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h4 className="text-sm font-extrabold font-heading text-slate-900">
                        Full Client PDF Deliverable & SOW Agreement Locked
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        To protect your agency deliverables against unauthorized screenshots, the remaining 35 checkpoints, line-item revenue leakage, and print-ready PDF export are locked until unlocked.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleTriggerCheckout}
                        disabled={isProcessing}
                        className="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        style={{
                          background: `linear-gradient(135deg, ${agencyBrandColor} 0%, #0f172a 100%)`,
                        }}
                      >
                        <Lock className="w-4 h-4 text-amber-300" />
                        <span>{isProcessing ? 'Connecting...' : 'Unlock Full Report ($9.99)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUnlockSuccess}
                        className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Instant Unlock (Demo)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SOW & Implementation Retainer Section */}
              {includePricingPitch && (
                <div
                  className={`rounded-2xl p-5 border text-white flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden transition-all ${
                    !isUnlocked ? 'filter blur-[1px] opacity-70 select-none pointer-events-none' : ''
                  }`}
                  style={{
                    backgroundColor: '#0f172a',
                    borderLeftWidth: '6px',
                    borderLeftColor: agencyBrandColor,
                  }}
                >
                  <div>
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${agencyBrandColor}33`, color: '#ffffff' }}
                    >
                      Turnkey Resolution Scope of Work (SOW)
                    </span>
                    <h4 className="text-sm font-bold font-heading mt-1 text-white">
                      Technical & Local Growth Management Retainer
                    </h4>
                    <p className="text-xs text-slate-300">
                      {agencyName} will resolve all 40 points, optimize Core Web Vitals, and manage Google Maps 3-Pack rank.
                    </p>
                  </div>
                  <div className="text-right sm:border-l sm:border-slate-800 sm:pl-5 shrink-0">
                    <span
                      className="text-xl font-black font-heading block"
                      style={{ color: '#ffffff' }}
                    >
                      {proposalRetainerQuote}
                    </span>
                    <p className="text-[10px] text-slate-400">Monthly Managed Partnership</p>
                  </div>
                </div>
              )}

              {/* Sign-off line */}
              <div
                className={`pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs text-slate-600 transition-all ${
                  !isUnlocked ? 'filter blur-[1px] opacity-70 select-none pointer-events-none' : ''
                }`}
              >
                <div className="border-t border-slate-300 pt-2">
                  <span className="font-bold text-slate-800 block">Prepared By:</span>
                  <span>{agencyName} · {agencyContactEmail}</span>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <span className="font-bold text-slate-800 block">Client Acceptance:</span>
                  <span>{clientBusinessName} Representative</span>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-between">
                <span>Enterprise Diagnostic Engine v4.2</span>
                <span>Audited & White-Labeled by {agencyName} • {agencyWebsite}</span>
              </div>
            </div>
          </div>
          )}

          {/* Print Protection Style */}
          <style>{`
            @media print {
              ${!isUnlocked ? `
                body * {
                  display: none !important;
                }
                body::before {
                  content: "This White-Label Audit PDF is locked. Please purchase or unlock full access to print or export.";
                  display: block;
                  font-size: 16pt;
                  font-weight: bold;
                  text-align: center;
                  padding: 80pt 20pt;
                  color: #0f172a;
                }
              ` : `
                body * {
                  visibility: hidden;
                }
                #white_label_audit_printable_canvas, #white_label_audit_printable_canvas * {
                  visibility: visible;
                }
                #white_label_audit_printable_canvas {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 16mm !important;
                  box-shadow: none !important;
                  border: none !important;
                }
              `}
            }
          `}</style>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 font-sans">
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            {isUnlocked ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Full 40-Point White-Label Report Unlocked</span>
              </span>
            ) : (
              <span className="text-amber-800 font-bold flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Locked · Purchase Required to Reveal & Export</span>
              </span>
            )}
            <span className="text-[11px] text-slate-500 hidden md:inline">
              {isAgencyTier
                ? 'Unlimited White-Label PDF generation included on Agency Plan'
                : 'One-time $9.99 unlock (or included in Agency Plan)'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer w-full sm:w-auto text-center"
            >
              Close
            </button>

            {isUnlocked ? (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                style={{ backgroundColor: agencyBrandColor }}
              >
                <Download className="w-4 h-4" />
                <span>Download 40-Point Client PDF</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTriggerCheckout}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${agencyBrandColor} 0%, #0f172a 100%)`,
                }}
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>
                  {isProcessing ? 'Connecting...' : 'Unlock Full White-Label PDF ($9.99)'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
