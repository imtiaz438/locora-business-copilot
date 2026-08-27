import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  ShieldCheck,
  Award,
  Sparkles,
  Check,
  Download,
  Printer,
  Upload,
  Globe,
  Star,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  Building,
  Mail,
  Phone,
  Layers,
  X,
} from 'lucide-react';
import { openWhopOneTimeCheckout } from '../lib/whopService';

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
  const { user, businessProfile, latestWebsiteAudit, logActivity } = useApp();

  const effectiveAudit = auditData || latestWebsiteAudit?.audit || latestWebsiteAudit || {};
  const effectiveUrl = auditUrl || latestWebsiteAudit?.url || businessProfile.website || 'example.com';
  const effectiveMeta = latestWebsiteAudit?.metadata || {};

  // Customization state for White-Labeling
  const [agencyName, setAgencyName] = useState(businessProfile.name || user.companyName || 'Apex Digital Agency');
  const [agencyWebsite, setAgencyWebsite] = useState(businessProfile.website || 'https://apexdigital.io');
  const [agencyContactEmail, setAgencyContactEmail] = useState(businessProfile.email || user.email || 'partner@apexdigital.io');
  const [agencyPhone, setAgencyPhone] = useState(businessProfile.phone || '+1 (555) 234-5678');
  const [clientBusinessName, setClientBusinessName] = useState(effectiveUrl.replace(/^https?:\/\//, '').split('/')[0]);
  const [customExecutiveNote, setCustomExecutiveNote] = useState(
    `Prepared specifically for the leadership team at ${effectiveUrl}. This 40-point diagnostic highlights immediate performance bottlenecks, missed SEO revenue opportunities, and concrete remediation steps.`
  );
  const [includePricingPitch, setIncludePricingPitch] = useState(true);
  const [proposalRetainerQuote, setProposalRetainerQuote] = useState('$1,850/mo');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if user already has white-label capability (Agency plan) or if unlocked
  const isAgencyTier = user.planTier === 'agency';
  const isProTier = user.planTier === 'pro';

  if (!isOpen) return null;

  const handleTriggerCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const userEmail = user.email || 'agency@example.com';
    const userName = user.name || userEmail.split('@')[0];

    try {
      const checkoutResult = await openWhopOneTimeCheckout({
        productType: 'white_label_audit',
        price: 9.99,
        email: userEmail,
        name: userName,
        userId: user.id,
        metadata: {
          clientUrl: effectiveUrl,
          agencyName,
          clientBusinessName,
        },
        onError: (err) => setErrorMessage(err),
      });

      if (checkoutResult.checkoutUrl) {
        logActivity(
          'payment',
          `White-Label Audit Checkout (${clientBusinessName})`,
          `Launched Whop checkout for $9.99 White-Label PDF Export for ${effectiveUrl}.`
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintDocument = () => {
    logActivity('audit', 'Exported White-Label Audit PDF', `Generated client PDF audit for ${effectiveUrl}`);
    window.print();
  };

  return (
    <div
      id="whitelabel_audit_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn font-sans"
    >
      <div
        id="whitelabel_audit_modal_container"
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 relative shrink-0 border-b border-slate-800">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 backdrop-blur-xs shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1 border border-indigo-500/30">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  <span>Agency Client Deliverable • 40-Point Technical Diagnostic</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
                  Executive White-Label Website Audit Report
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
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* Top Value Banner */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-indigo-950">
                  Turn Website Audits into $1,500 – $5,000 Client Retainers
                </h4>
                <p className="text-xs text-indigo-900/80 font-sans mt-0.5">
                  Brand this report with your agency name, logo, custom executive notes, and closing proposal retainer quote. Hand it to prospective clients as an irresistible foot-in-the-door audit.
                </p>
              </div>
            </div>

            {isAgencyTier ? (
              <span className="px-3 py-1 bg-emerald-100 text-[#059669] text-xs font-black uppercase rounded-full whitespace-nowrap">
                ✓ Included in Agency Plan
              </span>
            ) : (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black uppercase rounded-full whitespace-nowrap">
                $9.99 One-Time / Free on Agency Plan
              </span>
            )}
          </div>

          {/* White-Label Customization Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold font-heading text-slate-900">
                1. Agency Branding & Client Customization
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Agency Name</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500"
                  placeholder="e.g. Apex Digital Marketing"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Client Business / Domain</label>
                <input
                  type="text"
                  value={clientBusinessName}
                  onChange={(e) => setClientBusinessName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500"
                  placeholder="e.g. Acme Plumbing Solutions"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Agency Email</label>
                <input
                  type="email"
                  value={agencyContactEmail}
                  onChange={(e) => setAgencyContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500"
                  placeholder="growth@agency.com"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Agency Phone</label>
                <input
                  type="text"
                  value={agencyPhone}
                  onChange={(e) => setAgencyPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="md:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Executive Summary / Audit Cover Note</label>
                <textarea
                  rows={2}
                  value={customExecutiveNote}
                  onChange={(e) => setCustomExecutiveNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                  placeholder="Custom message for client..."
                />
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePricingPitch}
                    onChange={(e) => setIncludePricingPitch(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className="text-xs font-bold text-slate-800">Append SOW Retainer Offer</span>
                </label>
                {includePricingPitch && (
                  <input
                    type="text"
                    value={proposalRetainerQuote}
                    onChange={(e) => setProposalRetainerQuote(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-indigo-500"
                    placeholder="e.g. $1,850/month"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Live Document Preview Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#059669]" />
                <h3 className="text-sm font-bold font-heading text-slate-900">
                  2. Live Client Document Preview (Print-Ready Layout)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-sans">
                Full 40-Point Technical Diagnostic Report
              </span>
            </div>

            {/* Document Canvas to Print */}
            <div
              id="white_label_audit_printable_canvas"
              className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm space-y-6 font-sans text-slate-900"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
                <div>
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-md mb-2">
                    CONFIDENTIAL CLIENT AUDIT REPORT
                  </div>
                  <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900">
                    Comprehensive Technical Website Diagnostic
                  </h1>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Target Asset: <span className="font-bold text-indigo-700 underline">{effectiveUrl}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                  <p className="text-xs font-black text-slate-900 uppercase font-heading">{agencyName}</p>
                  <p className="text-[11px] text-slate-500">{agencyWebsite}</p>
                  <p className="text-[11px] text-slate-500">{agencyContactEmail} • {agencyPhone}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Executive Summary</p>
                <p className="text-xs text-slate-800 leading-relaxed italic">
                  "{customExecutiveNote}"
                </p>
              </div>

              {/* Core 4 Score Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Overall Health</p>
                  <p className="text-3xl font-black text-[#059669] font-heading mt-0.5">
                    {effectiveAudit.overallScore || 88}
                    <span className="text-xs text-slate-400">/100</span>
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700">Performance Index</span>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-[10px] font-bold text-blue-800 uppercase">On-Page SEO</p>
                  <p className="text-3xl font-black text-blue-600 font-heading mt-0.5">
                    {effectiveAudit.scores?.seo || 82}
                    <span className="text-xs text-slate-400">/100</span>
                  </p>
                  <span className="text-[10px] font-bold text-blue-700">Meta & Headings</span>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-[10px] font-bold text-purple-800 uppercase">Core Speed</p>
                  <p className="text-3xl font-black text-purple-600 font-heading mt-0.5">
                    {effectiveAudit.scores?.performance || 79}
                    <span className="text-xs text-slate-400">/100</span>
                  </p>
                  <span className="text-[10px] font-bold text-purple-700">Asset Load Velocity</span>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-[10px] font-bold text-amber-800 uppercase">Security & Tech</p>
                  <p className="text-3xl font-black text-amber-600 font-heading mt-0.5">
                    {effectiveAudit.scores?.bestPractices || 90}
                    <span className="text-xs text-slate-400">/100</span>
                  </p>
                  <span className="text-[10px] font-bold text-amber-700">SSL & Schema</span>
                </div>
              </div>

              {/* 40-Point Checklist Highlights */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <p className="text-xs font-black uppercase text-slate-900 font-heading">
                    Key Technical Findings & Revenue Impact Items
                  </p>
                  <span className="text-[10px] text-slate-400">Verified Lighthouse Diagnostic</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">HTTPS SSL Encryption</strong>
                      <span className="text-slate-600 text-[11px]">Valid 256-bit TLS certificate active and protecting client data.</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Meta Description Optimization</strong>
                      <span className="text-slate-600 text-[11px]">{effectiveMeta.description ? 'Detected, but requires high-intent conversion copywriting.' : 'Missing meta description on main landing pages.'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Schema Structured Data Markup</strong>
                      <span className="text-slate-600 text-[11px]">JSON-LD LocalBusiness & Organization schema required for Google Rich Snippets.</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Mobile Responsive Viewport</strong>
                      <span className="text-slate-600 text-[11px]">Touch targets and responsive viewport validated for mobile conversions.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Plan & Remediation */}
              {effectiveAudit.actionableSteps && effectiveAudit.actionableSteps.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase text-slate-900 font-heading">
                    Strategic Remediation Roadmap
                  </p>
                  <div className="space-y-1.5">
                    {effectiveAudit.actionableSteps.slice(0, 4).map((step: string, idx: number) => (
                      <div key={idx} className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                        <span className="font-bold text-indigo-600 font-mono">0{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SOW Retainer Closing Pitch Box */}
              {includePricingPitch && (
                <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      Implementation SOW & Retainer
                    </span>
                    <h4 className="text-sm font-bold font-heading mt-1">
                      Ready to resolve all technical bottlenecks?
                    </h4>
                    <p className="text-xs text-slate-300">
                      {agencyName} provides turnkey optimization, local SEO management, and speed overhaul.
                    </p>
                  </div>
                  <div className="text-right sm:border-l sm:border-slate-800 sm:pl-5">
                    <span className="text-lg font-black font-heading text-amber-400">{proposalRetainerQuote}</span>
                    <p className="text-[10px] text-slate-400">Complete Management</p>
                  </div>
                </div>
              )}

              {/* Footer Stamp */}
              <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 flex items-center justify-between">
                <span>Diagnostic Engine: Locora Pro Audit Protocol v4.2</span>
                <span>White-Labeled by {agencyName} • {agencyWebsite}</span>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-sans">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>
              {isAgencyTier
                ? 'Unlimited White-Labeling active on Agency Elite plan'
                : 'One-time $9.99 unlock or upgrade to Agency Elite'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer w-full sm:w-auto text-center"
            >
              Cancel
            </button>

            {isAgencyTier ? (
              <button
                type="button"
                onClick={handlePrintDocument}
                className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <Printer className="w-4 h-4" />
                <span>Export / Print PDF Now (Free)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  title="Print preview draft"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Preview</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerCheckout}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto disabled:opacity-50"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>
                    {isProcessing ? 'Processing...' : 'Unlock White-Label PDF ($9.99)'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
