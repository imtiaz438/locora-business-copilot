import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import jsPDF from 'jspdf';
import {
  BarChart3,
  TrendingUp,
  Download,
  Share2,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Phone,
  Eye,
  Star,
  Users,
  Calendar,
  HelpCircle,
  Copy,
  Mail,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

export const MonthlyReportView: React.FC = () => {
  const { activeBusiness, businessProfile, setActiveTab, logActivity } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Section 23 What Changed Metrics:
  // Visibility ↑ 12%
  // Reviews ↑ 18
  // Calls ↑ 9%
  // Website leads ↑ 14%
  const growthMetrics = [
    {
      label: 'Visibility',
      delta: '↑ 12%',
      current: '84/100',
      previous: '72/100',
      detail: `Local Pack prominence across ${activeBusiness.city || 'local'} market`,
      icon: Eye,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Reviews',
      delta: '↑ 18',
      current: '248 total',
      previous: '230 total',
      detail: 'Average 4.9★ rating with zero unresolved flags',
      icon: Star,
      color: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      label: 'Calls',
      delta: '↑ 9%',
      current: '142 calls',
      previous: '130 calls',
      detail: 'Mobile click-to-call conversions on Google Maps',
      icon: Phone,
      color: 'text-blue-800 bg-blue-50 border-blue-200',
    },
    {
      label: 'Website leads',
      delta: '↑ 14%',
      current: '58 leads',
      previous: '51 leads',
      detail: 'Direct booking requests & appointment inquiries',
      icon: Users,
      color: 'text-purple-800 bg-purple-50 border-purple-200',
    },
  ];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Monthly Growth Report', 20, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Business: ${activeBusiness.name} — ${selectedMonth}`, 20, 33);
    doc.text(`Prepared by: Locora AI Operating System`, 20, 39);

    doc.line(20, 45, 190, 45);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('WHAT CHANGED?', 20, 55);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('• Visibility: +12% (Local Pack score improved from 72 to 84)', 25, 65);
    doc.text('• Reviews: +18 new 5-star patient reviews (248 total, 4.9 rating)', 25, 73);
    doc.text('• Calls: +9% (142 mobile inbound inquiries from Google Maps)', 25, 81);
    doc.text('• Website Leads: +14% (58 direct appointment booking forms)', 25, 89);

    doc.line(20, 98, 190, 98);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('WHY?', 20, 110);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.text(
      '"Your emergency service page began generating local search impressions."',
      25,
      120
    );

    doc.setFont('helvetica', 'normal');
    const primarySvc = activeBusiness.services?.[0] || 'Core Service';
    const whyText =
      `Locora deployed the /services landing page embedded with LocalBusiness schema. High-urgency keyword volume surged 34% this month in ${activeBusiness.city || 'our market'}, successfully capturing 340 new impressions and elevating ${activeBusiness.name} into the coveted 3-Pack.`;
    doc.text(doc.splitTextToSize(whyText, 165), 25, 130);

    doc.line(20, 155, 190, 155);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('WHAT NEXT?', 20, 168);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.text(`"Create high-intent, location-specific service content for ${activeBusiness.city || 'your market'}."`, 25, 178);

    doc.setFont('helvetica', 'normal');
    doc.text(`1. Deploy dedicated localized service landing pages for ${activeBusiness.name}.`, 25, 188);
    doc.text('2. Launch 2 Google Business Profile updates highlighting core capabilities.', 25, 196);
    doc.text('3. Inject structured LocalBusiness FAQ schema into Google Knowledge Graph.', 25, 204);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Locora AI — Turning Search Visibility Into Customer Revenue', 20, 275);

    doc.save(`${activeBusiness.name.replace(/\s+/g, '_')}_Monthly_Report_${selectedMonth.replace(/\s+/g, '_')}.pdf`);
    logActivity('reports', 'Report Downloaded', `Downloaded Monthly Growth Report for ${selectedMonth}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-900">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#059669] font-bold text-[10px] uppercase tracking-wider font-heading">
              Executive Performance Diagnostic
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: REP-2026-08</span>
          </div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight mt-1">
            Monthly Growth Report
          </h2>
          <p className="text-xs text-slate-500">
            {activeBusiness.name} • {selectedMonth} • {activeBusiness.city ? (activeBusiness.state ? `${activeBusiness.city}, ${activeBusiness.state} Metro` : `${activeBusiness.city} Metro`) : 'Active Market'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#059669]/20"
          >
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
            <option value="Q2 2026 Executive Summary">Q2 2026 Executive Summary</option>
          </select>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share With Client</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 23: WHAT CHANGED? */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
            What Changed?
          </h3>
          <span className="text-[11px] text-slate-400">Comparing to prior 30-day baseline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {growthMetrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 font-heading">{m.label}</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-xs font-mono border ${m.color}`}>
                    {m.delta}
                  </span>
                </div>

                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
                    {m.current}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Prior: {m.previous}</p>
                </div>

                <p className="text-[11px] text-slate-600 border-t border-slate-100 pt-2 leading-tight">
                  {m.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 23: WHY? */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
            Why?
          </h3>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
          <blockquote className="text-base sm:text-lg font-bold text-emerald-950 font-heading">
            "Your targeted service landing pages began generating local search impressions."
          </blockquote>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed pt-2 border-t border-emerald-200/60">
            <div>
              <p className="font-semibold text-slate-900 mb-1">Algorithmic Driver:</p>
              <p>
                Locora indexed dedicated service pages with complete LocalBusiness schema and click-to-call mobile buttons. Google prioritized {activeBusiness.name} for high-urgency commercial intents.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Reputation Velocity Impact:</p>
              <p>
                The automated post-service SMS feedback campaign generated 18 new verified client reviews in 30 days. This accelerated Google's freshness signal, pushing Maps rank from #8 to #2.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 23: WHAT NEXT? */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
              What Next?
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Projected Impact: +22% Client Inquiries</span>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg sm:text-xl font-extrabold font-heading text-white">
            "Create location-specific service content."
          </h4>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Local competitors like {activeBusiness.competitors?.[0] || 'competing providers'} are currently vulnerable in adjacent districts. Expanding dedicated coverage to these areas will capture an estimated 45 additional monthly bookings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs">
            <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Action 01</span>
            <h5 className="font-bold text-white">Sub-Market Location Page</h5>
            <p className="text-[11px] text-slate-400">Launch location landing page with localized schema and verified NAP credentials.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs">
            <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Action 02</span>
            <h5 className="font-bold text-white">Google Business Offer Posts</h5>
            <p className="text-[11px] text-slate-400">Publish 2 Google posts highlighting immediate availability and priority consultations.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs">
            <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Action 03</span>
            <h5 className="font-bold text-white">AI Search Entity Injection</h5>
            <p className="text-[11px] text-slate-400">Sync service coverage details to ensure Perplexity and ChatGPT recommend {activeBusiness.name}.</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Recommended Action Blueprint is ready to deploy.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('work')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Draft SOW in Work →
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Create in Content Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Share With Client Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">Share Report With Client</h3>
                <p className="text-xs text-slate-500">Provide an interactive, white-label link or email dispatch.</p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-slate-500 font-bold">White-Label Client Link:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://app.locoraai.com/reports/share/${activeBusiness.id}?month=2026-08`}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px]"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://app.locoraai.com/reports/share/${activeBusiness.id}?month=2026-08`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold shrink-0 cursor-pointer"
                  >
                    {copiedLink ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email directly to client contact:</label>
                <input
                  type="email"
                  defaultValue={`contact@${activeBusiness.website || 'clientbusiness.com'}`}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Executive report sent to client!');
                    setShowShareModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold cursor-pointer shadow-xs"
                >
                  Send Report Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
