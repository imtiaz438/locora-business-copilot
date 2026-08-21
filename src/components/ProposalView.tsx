import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Proposal, ProposalType } from '../types';
import { BrandedFooter } from './BrandedFooter';
import { LockedFeature } from './LockedFeature';
import {
  FileText,
  Sparkles,
  Plus,
  Copy,
  Check,
  Trash2,
  Send,
  Building,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const ProposalView: React.FC = () => {
  const { proposals, addProposal, updateProposalStatus, deleteProposal, customers, businessProfile, settings, user, hasEnoughCredits, consumeAiCredit, updateUser, setActiveTab } =
    useApp();

  const [activeType, setActiveType] = useState<ProposalType>('proposal');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [projectTitle, setProjectTitle] = useState('Full Digital Transformation & SEO Retainer');
  const [budget, setBudget] = useState(4500);
  const [requirements, setRequirements] = useState(
    'Include Google Business Profile optimization, website speed enhancement, local service landing pages, and monthly performance reporting.'
  );

  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasEnoughCredits(5)) return;

    setLoading(true);
    setApiError(null);

    const clientObj = customers.find((c) => c.id === selectedCustomerId);

    try {
      const response = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeType,
          clientName: clientObj ? `${clientObj.name} (${clientObj.company})` : 'Valued Client',
          projectTitle,
          estimatedBudget: budget,
          requirements,
          businessProfile,
          providerKey: settings.providerKeys[settings.activeProvider],
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate proposal');

      if (typeof data.creditsUsed === 'number') {
        updateUser({ aiCreditsUsed: data.creditsUsed });
      } else {
        consumeAiCredit(5);
      }

      setGeneratedResult(data.content);

      // Save to proposals list
      addProposal({
        title: projectTitle,
        type: activeType,
        customerId: selectedCustomerId,
        customerName: clientObj?.name || 'Client',
        status: 'draft',
        summary: `AI Generated ${activeType} for ${projectTitle}`,
        scopeOfWork: requirements,
        deliverables: ['Website Audit', 'Local SEO Setup', 'Monthly Maintenance'],
        timeline: '30 Days',
        pricingBreakdown: [{ item: projectTitle, cost: budget }],
        totalAmount: budget,
        termsAndConditions: 'Net 14 Payment Terms. 50% deposit due upon signing.',
        generatedContent: data.content,
      });
    } catch (err: any) {
      setApiError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-[#059669]" />
          <span>AI Proposal, Quotation & Contract Generator</span>
        </h2>
        <p className="text-xs text-slate-500 font-sans">
          Generate high-converting business proposals, transparent cost quotations, and legally sound service contracts in seconds.
        </p>
      </div>

      {/* API Error Notification */}
      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-3 text-rose-900 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-rose-950">AI Model Error / Invalid Key</div>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">{apiError}</p>
              <div className="mt-2 text-[11px] text-rose-600 font-medium">
                Note: No workspace credits were deducted. Please verify your API key in settings.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="text-xs font-semibold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm"
            >
              Open AI Settings
            </button>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-rose-400 hover:text-rose-700 p-1 text-xs transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <LockedFeature
        requiredPlan="pro"
        featureTitle="Proposals, Quotes & Contracts Engine"
        featureDescription="Generating AI Proposals, Quotes & Contracts requires a Pro Growth ($19/mo) or Agency Elite plan. Upgrade to unlock full access."
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(['proposal', 'quotation', 'contract'] as ProposalType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                  activeType === type
                    ? 'bg-[#059669] text-white shadow-2xs font-heading'
                    : 'text-slate-600 hover:text-slate-900 font-sans'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Target Client</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project / Deal Title</label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Website Redesign & Local SEO Acceleration"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Budget ($)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scope & Key Requirements</label>
              <textarea
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="List deliverables, timeline preferences, or special terms..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'AI Generating Document...' : `Generate AI ${activeType.toUpperCase()}`}</span>
            </button>
          </form>

          {/* History List */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Saved Documents</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {proposals.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setGeneratedResult(p.generatedContent)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="truncate font-sans">
                    <p className="font-bold text-slate-900 font-heading truncate">{p.title}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{p.type} • {p.customerName}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProposal(p.id);
                    }}
                    className="p-1 hover:text-rose-600 text-slate-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Output Document View */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <span>Document Output View</span>
            </h3>

            {generatedResult && (
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-sans"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-6 text-xs text-slate-800 font-mono leading-relaxed overflow-y-auto min-h-[400px] whitespace-pre-wrap flex flex-col justify-between">
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 space-y-3 font-sans">
                  <Sparkles className="w-8 h-8 text-[#059669] animate-spin" />
                  <p>AI Copilot is generating your customized {activeType}...</p>
                </div>
              ) : generatedResult ? (
                generatedResult
              ) : (
                <div className="text-center text-slate-400 py-20 font-sans">
                  Fill in the project details on the left and click generate to create a professional proposal, quotation, or contract.
                </div>
              )}
            </div>

            <BrandedFooter className="mt-6" />
          </div>
        </div>
      </div>
    </LockedFeature>
  </div>
);
};
