import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LocalSeoItem } from '../types';
import { LockedFeature } from './LockedFeature';
import {
  MapPin,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Building,
  Star,
  MessageSquare,
  FileCode,
  Globe,
  HelpCircle,
  Tag,
} from 'lucide-react';

export const LocalSeoView: React.FC = () => {
  const { localSeoItems, addLocalSeoItem, deleteLocalSeoItem, businessProfile, settings, user, hasEnoughCredits, consumeAiCredit, updateUser } = useApp();

  const [activeTask, setActiveTask] = useState<
    'gbp_description' | 'review_reply' | 'local_landing' | 'schema' | 'qa'
  >('gbp_description');

  const [promptInput, setPromptInput] = useState('');
  const [reviewText, setReviewText] = useState('Great service! They arrived on time and fixed my plumbing emergency within 1 hour.');
  const [starRating, setStarRating] = useState(5);

  const [loading, setLoading] = useState(false);
  const [outputContent, setOutputContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTask === 'schema' && user.planTier !== 'agency') {
      alert('JSON-LD Schema Generator is exclusive to Agency Elite ($49/mo) plan. Please upgrade your workspace.');
      return;
    }

    if (!hasEnoughCredits(2)) return;

    setLoading(true);

    try {
      const response = await fetch('/api/ai/generate-local-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: activeTask,
          prompt: promptInput,
          reviewText,
          starRating,
          businessProfile,
          providerKey: settings.providerKeys[settings.activeProvider],
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate local SEO content');

      if (typeof data.creditsUsed === 'number') {
        updateUser({ aiCreditsUsed: data.creditsUsed });
      } else {
        consumeAiCredit(2);
      }

      setOutputContent(data.content);

      addLocalSeoItem({
        type: activeTask,
        title: `${activeTask.replace('_', ' ').toUpperCase()} - ${businessProfile.name || 'Local Store'}`,
        content: data.content,
      });
    } catch (err: any) {
      alert(`Error: ${err.message || 'Generation failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputContent) return;
    navigator.clipboard.writeText(outputContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
          <MapPin className="w-6 h-6 text-[#059669]" />
          <span>Local SEO & Google Business Profile Assistant</span>
        </h2>
        <p className="text-xs text-slate-500 font-sans">
          Optimize your Google Business Profile, generate review responses, write local landing pages, and generate LocalBusiness Schema JSON-LD.
        </p>
      </div>

      <LockedFeature
        requiredPlan="pro"
        featureTitle="Local SEO & Google Business Assistant"
        featureDescription="Google Business Profile optimization, Review Responder, Local Landing Pages, and Schema JSON-LD require a Pro Growth ($19/mo) or Agency Elite plan."
      >
        <div className="space-y-6">
          {/* Task Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'gbp_description', label: 'GBP Description', icon: Building },
          { id: 'review_reply', label: 'Review Responder', icon: Star },
          { id: 'local_landing', label: 'Local Landing Page', icon: Globe },
          { id: 'schema', label: 'Schema JSON-LD', icon: FileCode },
          { id: 'qa', label: 'Google Q&A', icon: HelpCircle },
        ].map((t) => {
          const Icon = t.icon;
          const isSelected = activeTask === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTask(t.id as any)}
              className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#059669] text-white shadow-2xs font-heading'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-sans'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <form onSubmit={handleGenerate} className="space-y-4 text-xs font-sans">
            {activeTask === 'review_reply' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Star Rating</label>
                  <select
                    value={starRating}
                    onChange={(e) => setStarRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  >
                    <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                    <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                    <option value={3}>3 Stars ⭐⭐⭐</option>
                    <option value={2}>2 Stars ⭐⭐</option>
                    <option value={1}>1 Star ⭐</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Review Text</label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Paste the customer's Google review here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {activeTask === 'review_reply' ? 'Additional Reply Instructions' : 'Local SEO Instructions / Keywords'}
              </label>
              <textarea
                rows={4}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Target Austin TX local service keywords, highlight emergency availability, and add a call to action..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'AI Optimizing Local SEO...' : 'Generate Local SEO Asset'}</span>
            </button>
          </form>

          {/* History */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Saved Local SEO Assets</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {localSeoItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setOutputContent(item.content)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="truncate text-slate-800 font-medium font-sans">{item.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLocalSeoItem(item.id);
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

        {/* Right Column: Generated Code/Text */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <span>Generated Local Asset</span>
            </span>

            {outputContent && (
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-sans"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy Code/Text'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-6 text-xs text-slate-800 leading-relaxed overflow-y-auto min-h-[400px] whitespace-pre-wrap font-mono">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 space-y-3 font-sans">
                <Sparkles className="w-8 h-8 text-[#059669] animate-spin" />
                <p>AI Copilot is optimizing local business presence...</p>
              </div>
            ) : outputContent ? (
              outputContent
            ) : (
              <div className="text-center text-slate-400 py-20 font-sans">
                Choose a task above and click generate to produce Local SEO descriptions, review replies, local landing copy, or JSON-LD schema.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </LockedFeature>
</div>
);
};
