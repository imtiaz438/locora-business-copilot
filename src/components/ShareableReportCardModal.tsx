import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LocoraLogo } from './LocoraLogo';
import { ShieldCheck, TrendingUp, Users, FileSpreadsheet, Globe, Copy, Check, X, Share2, Award, Printer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareableReportCardModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { businessProfile, customers, invoices, projects, latestWebsiteAudit, user, logActivity } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Live Score Math
  const activeCustomersCount = customers.filter((c) => c.status === 'client' || c.status === 'proposal_sent').length;
  const activeProjectsCount = projects.filter((p) => p.status === 'in_progress').length;
  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  const healthScore = (customers.length === 0 && invoices.length === 0)
    ? 0
    : Math.min(100, Math.min(50, customers.length * 10) + Math.min(50, invoices.filter((i) => i.status === 'paid').length * 10));

  const growthScore = (projects.length === 0 && customers.length === 0)
    ? 0
    : Math.min(100, Math.min(60, projects.length * 15) + Math.min(40, customers.length * 10));

  const reportUrl = `${window.location.origin}/report/${encodeURIComponent(businessProfile.name || 'workspace')}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    logActivity('report_card', 'Shared Business Report Card', 'Copied public shareable report card URL');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto my-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-base">
            <Award className="w-5 h-5 text-[#059669]" />
            <span>Shareable Business Report Card</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Card Canvas Body */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <LocoraLogo isUserDoc={true} size={44} />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] bg-emerald-100 px-2.5 py-0.5 rounded-full font-heading">
                  Verified Business Performance Snapshot
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 mt-1">
                  {businessProfile.name || user.companyName || 'Business Workspace'}
                </h2>
                <p className="text-xs text-slate-500 font-sans">
                  {businessProfile.industry || 'Local Services'} • {businessProfile.email || user.email}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-sans">Report Generated</p>
              <p className="text-xs font-bold text-slate-700 font-mono">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Scores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-bold font-heading">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>Health Score</span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-heading">
                {healthScore > 0 ? healthScore : '—'}{healthScore > 0 && <span className="text-xs text-slate-400">/100</span>}
              </p>
              <p className={`text-[10px] font-bold ${healthScore >= 70 ? 'text-[#059669]' : 'text-slate-400'}`}>
                {healthScore >= 70 ? 'Strong Standing' : healthScore > 0 ? 'Developing' : 'No Activity Recorded'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-bold font-heading">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Growth Velocity</span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-heading">
                {growthScore > 0 ? growthScore : '—'}{growthScore > 0 && <span className="text-xs text-slate-400">/100</span>}
              </p>
              <p className={`text-[10px] font-bold ${growthScore >= 60 ? 'text-indigo-600' : 'text-slate-400'}`}>
                {growthScore >= 60 ? 'High Expansion' : growthScore > 0 ? 'Initial Growth' : 'Awaiting Projects'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-bold font-heading">
                <Globe className="w-4 h-4 text-cyan-600" />
                <span>SEO Audit Score</span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-heading">
                {latestWebsiteAudit?.overallScore ? latestWebsiteAudit.overallScore : '—'}
                {latestWebsiteAudit?.overallScore ? <span className="text-xs text-slate-400">/100</span> : null}
              </p>
              <p className={`text-[10px] font-bold ${latestWebsiteAudit?.overallScore ? 'text-cyan-600' : 'text-slate-400'}`}>
                {latestWebsiteAudit?.overallScore ? 'Verified Audit' : 'Audit Pending'}
              </p>
            </div>
          </div>

          {/* Metrics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-heading">Active Clients</p>
              <p className="text-lg font-bold text-slate-900 font-heading mt-0.5">{activeCustomersCount}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-heading">Active Projects</p>
              <p className="text-lg font-bold text-slate-900 font-heading mt-0.5">{activeProjectsCount}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-heading">Total Revenue</p>
              <p className="text-lg font-bold text-[#059669] font-heading mt-0.5">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-heading">Invoices Issued</p>
              <p className="text-lg font-bold text-slate-900 font-heading mt-0.5">{invoices.length}</p>
            </div>
          </div>

          {/* Branding Footer */}
          <div className="pt-2 text-center border-t border-slate-200 font-sans">
            {user.planTier === 'agency' ? (
              <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 py-1.5 px-3 rounded-lg inline-block border border-emerald-200">
                Verified by {businessProfile.name || 'Your Agency'} • White-Labeled Client Performance Report
              </p>
            ) : user.planTier === 'pro' ? (
              <p className="text-[11px] text-slate-500 font-medium">
                Verified Business Performance Snapshot • Official Unbranded Report
              </p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Powered by <span className="font-bold text-[#059669] font-heading">Locora AI Business Copilot</span> (Free Starter Tier)
              </p>
            )}
          </div>
        </div>

        {/* Share Link Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="w-full sm:w-auto text-xs text-slate-500">
            Share this real-time report card with investors, partners, or clients.
          </div>
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Report Link Copied!' : 'Copy Shareable Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
