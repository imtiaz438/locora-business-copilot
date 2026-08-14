import React from 'react';
import { Check, X, Sparkles, HelpCircle } from 'lucide-react';

interface Row {
  feature: string;
  free: string;
  pro: string;
  agency: string;
  credits: string;
}

const COMPARISON_ROWS: Row[] = [
  {
    feature: 'Monthly AI Credits Allowance',
    free: '25 Credits / month',
    pro: '250 Credits / month',
    agency: 'UNLIMITED (9,999/mo)',
    credits: 'Renews Monthly',
  },
  {
    feature: 'AI Business Chat',
    free: 'Limited by credits',
    pro: 'Full access',
    agency: 'Full access',
    credits: '1 per reply',
  },
  {
    feature: 'CRM (Clients)',
    free: 'Up to 10 contacts',
    pro: 'Unlimited',
    agency: 'Unlimited',
    credits: '0',
  },
  {
    feature: 'Invoicing',
    free: '2 invoices, Locora branding',
    pro: 'Unlimited, your branding',
    agency: 'Unlimited, your branding',
    credits: '0',
  },
  {
    feature: 'Client Portal (shareable links)',
    free: '—',
    pro: '✅',
    agency: '✅',
    credits: '0',
  },
  {
    feature: 'Proposals / Quotes / Contracts',
    free: '—',
    pro: '✅',
    agency: '✅',
    credits: '5 per generation',
  },
  {
    feature: 'Business Document Generator',
    free: 'Limited by credits',
    pro: 'Full library',
    agency: 'Full library',
    credits: '2 per document',
  },
  {
    feature: 'Website Audit',
    free: 'Standard audit',
    pro: 'Full audit',
    agency: 'Full audit',
    credits: '0',
  },
  {
    feature: 'Competitor Snapshot',
    free: '—',
    pro: '✅',
    agency: '✅',
    credits: '0',
  },
  {
    feature: 'Local SEO / Google Business Assistant',
    free: '—',
    pro: '✅',
    agency: '✅',
    credits: '2 per item',
  },
  {
    feature: 'JSON-LD Schema Generator',
    free: '—',
    pro: '—',
    agency: '✅',
    credits: '2',
  },
  {
    feature: 'Marketing Planner (30/90-day)',
    free: '—',
    pro: '✅',
    agency: '✅',
    credits: '5 per roadmap',
  },
  {
    feature: 'Brand Voice Setup Wizard',
    free: 'Basic (1 tone)',
    pro: 'Full wizard',
    agency: 'Full wizard',
    credits: '0',
  },
  {
    feature: 'Guided Activation Checklist',
    free: '✅',
    pro: '✅',
    agency: '✅',
    credits: '0',
  },
  {
    feature: 'One-Click "Polish"',
    free: '✅',
    pro: '✅',
    agency: '✅',
    credits: '1 per polish',
  },
  {
    feature: 'Referral-Ask Generator',
    free: '—',
    pro: '✅',
    agency: '✅',
    credits: '2',
  },
  {
    feature: 'Multi-Language Generation',
    free: '—',
    pro: '✅',
    agency: '✅',
    credits: 'Same as underlying feature',
  },
  {
    feature: 'Shareable Business Report Card',
    free: '✅ (branded)',
    pro: '✅ (unbranded)',
    agency: '✅ (white-labeled)',
    credits: '0',
  },
  {
    feature: 'Multi-Model AI Selection (Gemini 3.6, GPT-4o, Claude 3.5, Perplexity)',
    free: 'Gemini 3.6 Flash',
    pro: 'All 4 Active Models',
    agency: 'All 4 Active Models',
    credits: '0',
  },
  {
    feature: 'Upcoming AI Models (Claude 3.7 Opus, Cursor AI Agent, xAI Grok)',
    free: 'Upcoming Feature Tag',
    pro: 'Upcoming Feature Tag',
    agency: 'Priority Waitlist Access',
    credits: 'Coming Soon',
  },
  {
    feature: 'Team Members & Activity Feed',
    free: '1 seat (solo)',
    pro: '1 seat (solo)',
    agency: 'Up to 5 seats',
    credits: '0',
  },
];

export const PricingComparisonTable: React.FC = () => {
  const renderCell = (val: string, plan: 'free' | 'pro' | 'agency') => {
    if (val === '—') {
      return <span className="text-slate-300 font-bold">—</span>;
    }
    if (val === '✅') {
      return (
        <span className="inline-flex items-center gap-1 text-[#059669] font-bold">
          <Check className="w-4 h-4 stroke-[3]" /> Included
        </span>
      );
    }
    if (val.startsWith('✅')) {
      return (
        <span className="inline-flex items-center gap-1 text-[#059669] font-bold">
          <Check className="w-4 h-4 stroke-[3]" /> {val.replace('✅', '').trim()}
        </span>
      );
    }
    return <span className="text-slate-800 font-semibold">{val}</span>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xs space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#059669] bg-emerald-50 px-2.5 py-1 rounded-md tracking-wider font-heading">
            Feature Comparison Matrix
          </span>
          <h3 className="text-xl font-bold font-heading text-slate-900 mt-1">
            Quick Comparison Table & Credit Usage Rules
          </h3>
        </div>
        <p className="text-xs text-slate-500 max-w-xs">
          Clear credit deductions per AI request so you always know your usage limit.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-heading uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4 bg-slate-50 rounded-l-xl">Feature</th>
              <th className="py-3 px-4 bg-slate-50 text-slate-700">Free Starter ($0)</th>
              <th className="py-3 px-4 bg-emerald-50/60 text-[#059669]">Pro Growth ($19/mo)</th>
              <th className="py-3 px-4 bg-indigo-50/60 text-indigo-700">Agency Elite ($49/mo)</th>
              <th className="py-3 px-4 bg-slate-50 rounded-r-xl text-slate-700">AI Credits Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {COMPARISON_ROWS.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 font-heading">{row.feature}</td>
                <td className="py-3.5 px-4">{renderCell(row.free, 'free')}</td>
                <td className="py-3.5 px-4 bg-emerald-50/20">{renderCell(row.pro, 'pro')}</td>
                <td className="py-3.5 px-4 bg-indigo-50/20">{renderCell(row.agency, 'agency')}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono font-bold text-slate-700">
                    {row.credits}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
