import React from 'react';
import { Check, X, Sparkles, HelpCircle } from 'lucide-react';

interface Row {
  feature: string;
  free: string;
  pro: string;
  agency: string;
  category?: string;
}

const COMPARISON_ROWS: Row[] = [
  {
    feature: 'Target User & Scope',
    free: 'Solo Business Explorer',
    pro: '1 Business Growth OS',
    agency: '10 Client Accounts & Agencies',
    category: 'Core Access',
  },
  {
    feature: 'AI Business Brain',
    free: 'Basic Profile (1 business)',
    pro: 'Full Autonomous Brain',
    agency: '10 Dedicated Business Brains',
    category: 'Core Access',
  },
  {
    feature: 'AI Growth Manager Dashboard',
    free: 'Basic Checkup Only',
    pro: 'Full Live Command Center',
    agency: 'Multi-Client Growth Manager',
    category: 'Core Access',
  },
  {
    feature: 'Tracked Opportunities',
    free: '5 Opportunities',
    pro: '50 Search & Growth Gaps',
    agency: 'Unlimited Across 10 Clients',
    category: 'Local SEO & Growth',
  },
  {
    feature: 'AI Local SEO Copilot',
    free: 'Basic Health Audit',
    pro: 'Full Maps & Geo-Service Pages',
    agency: 'Bulk Maps & Geo Engine',
    category: 'Local SEO & Growth',
  },
  {
    feature: 'Competitor Intelligence',
    free: '1 Competitor Tracked',
    pro: '5 Competitors Deep Gap Scan',
    agency: 'Multi-Client Competitor Tracking',
    category: 'Local SEO & Growth',
  },
  {
    feature: 'AI Reputation & Review Actions',
    free: '10 Review Analyses / mo',
    pro: '200 Review Actions / mo',
    agency: 'Unlimited Bulk Review Actions',
    category: 'Reputation',
  },
  {
    feature: 'AI Search Visibility (ChatGPT & Perplexity)',
    free: '—',
    pro: 'Included (2026 Engine)',
    agency: 'Included with Client Reports',
    category: 'Local SEO & Growth',
  },
  {
    feature: 'Search Console & Google Analytics',
    free: '—',
    pro: 'Direct Sync',
    agency: 'Multi-Property Client Sync',
    category: 'Integrations',
  },
  {
    feature: 'Weekly AI Growth Action Plan',
    free: 'Basic Checklist',
    pro: '30/90-Day Auto Execution',
    agency: 'Client Automated Roadmaps',
    category: 'Execution',
  },
  {
    feature: 'Client CRM & Lead Tracker',
    free: 'Up to 10 Leads',
    pro: 'Unlimited Leads & Pipeline',
    agency: 'Unlimited Multi-Client CRM',
    category: 'Execution',
  },
  {
    feature: 'Proposals, Quotes & SOWs',
    free: '—',
    pro: 'Unlimited AI Generation',
    agency: 'Unlimited + White-Label SOWs',
    category: 'Execution',
  },
  {
    feature: 'Invoices & Stripe Payment Links',
    free: '2 Invoices (Locora badge)',
    pro: 'Unlimited (Your Branding)',
    agency: 'Unlimited (Full White-Label)',
    category: 'Execution',
  },
  {
    feature: 'White-Label PDF Reports',
    free: '—',
    pro: '—',
    agency: 'Included (Your Logo & Brand)',
    category: 'Agency Superpowers',
  },
  {
    feature: 'Client Dashboards & Sharing',
    free: '—',
    pro: 'Standard Share Links',
    agency: 'Custom Client Dashboards',
    category: 'Agency Superpowers',
  },
  {
    feature: 'Team Member Seats Included',
    free: '1 User',
    pro: '1 User',
    agency: 'Up to 5 Team Seats',
    category: 'Agency Superpowers',
  },
  {
    feature: 'Monthly Investment',
    free: '$0 Free Forever',
    pro: '$29 / month ($249/yr)',
    agency: '$99 / month ($790/yr)',
    category: 'Investment',
  },
];

export const PricingComparisonTable: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider font-heading mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Full Feature Matrix</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
          Compare Locora AI Tiers Side-by-Side
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          From single business owners to high-output local marketing agencies.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-xs font-bold font-heading text-slate-700">
              <th className="py-4 px-6 w-2/5">Capabilities & Tooling</th>
              <th className="py-4 px-6 text-center w-1/5 bg-slate-50/50">
                <span className="block font-black text-slate-900">FREE</span>
                <span className="text-[11px] font-normal text-slate-500">$0 forever</span>
              </th>
              <th className="py-4 px-6 text-center w-1/5 bg-emerald-50/40 text-emerald-950">
                <span className="inline-block px-2 py-0.5 bg-[#059669] text-white text-[10px] font-bold rounded-full mb-1">
                  POPULAR
                </span>
                <span className="block font-black text-[#059669]">PRO</span>
                <span className="text-[11px] font-normal text-emerald-700">$29 / mo</span>
              </th>
              <th className="py-4 px-6 text-center w-1/5 bg-indigo-50/40 text-indigo-950">
                <span className="block font-black text-indigo-900">AGENCY</span>
                <span className="text-[11px] font-normal text-indigo-700">$99 / mo</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {COMPARISON_ROWS.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80 transition-colors' : 'bg-slate-50/40 hover:bg-slate-50 transition-colors'}
              >
                <td className="py-3.5 px-6 font-medium text-slate-900">
                  {row.feature}
                </td>
                <td className="py-3.5 px-6 text-center bg-slate-50/30">
                  {row.free === '—' ? (
                    <span className="text-slate-300 font-bold">—</span>
                  ) : row.free === '✅' ? (
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  ) : (
                    <span className="font-semibold text-slate-700">{row.free}</span>
                  )}
                </td>
                <td className="py-3.5 px-6 text-center bg-emerald-50/20 font-semibold text-slate-900">
                  {row.pro === '—' ? (
                    <span className="text-slate-300 font-bold">—</span>
                  ) : row.pro === '✅' ? (
                    <Check className="w-4 h-4 text-[#059669] mx-auto" />
                  ) : (
                    <span className="font-bold text-[#059669]">{row.pro}</span>
                  )}
                </td>
                <td className="py-3.5 px-6 text-center bg-indigo-50/20 font-semibold text-slate-900">
                  {row.agency === '—' ? (
                    <span className="text-slate-300 font-bold">—</span>
                  ) : row.agency === '✅' ? (
                    <Check className="w-4 h-4 text-indigo-600 mx-auto" />
                  ) : (
                    <span className="font-bold text-indigo-950">{row.agency}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
