import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Check, Zap, Target, Briefcase, MessageCircle, RefreshCw } from 'lucide-react';

interface Props {
  text: string;
  onPolish: (newText: string) => void;
  compact?: boolean;
}

export const PolishControls: React.FC<Props> = ({ text, onPolish, compact = false }) => {
  const { consumeAiCredit, hasEnoughCredits, settings, logActivity } = useApp();
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  if (!text || text.trim().length === 0) return null;

  const handleApplyPolish = async (mode: 'shorter' | 'persuasive' | 'formal' | 'cta') => {
    if (!hasEnoughCredits(1)) return;

    setLoading(true);
    setActiveAction(mode);

    try {
      consumeAiCredit(1);

      const res = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: { 'Content-[#059669]': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          mode,
          provider: settings.activeProvider,
          providerKey: settings.providerKeys[settings.activeProvider],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.polishedText) {
          onPolish(data.polishedText);
          logActivity('polish', 'Polished AI Output', `Applied mode: ${mode}`);
        }
      } else {
        // Fallback local transformation if offline or api fails
        let fallback = text;
        if (mode === 'shorter') {
          fallback = text.split('. ').slice(0, Math.max(1, Math.floor(text.split('. ').length / 2))).join('. ') + '.';
        } else if (mode === 'persuasive') {
          fallback = `🔥 Proven Results: ${text} Act now to secure guaranteed value!`;
        } else if (mode === 'formal') {
          fallback = `Re: Formal Proposal & Overview\n\n${text}\n\nSincerely,\nLocora AI Operations`;
        } else if (mode === 'cta') {
          fallback = `${text}\n\n👉 Ready to get started? Reply to this message or schedule a call today!`;
        }
        onPolish(fallback);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 pt-2 ${compact ? 'text-[11px]' : 'text-xs'} font-sans`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
        <Sparkles className="w-3 h-3 text-[#059669]" />
        <span>One-Click Polish (1 Cr):</span>
      </span>

      <button
        onClick={() => handleApplyPolish('shorter')}
        disabled={loading}
        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
        title="Make content punchier and shorter"
      >
        {loading && activeAction === 'shorter' ? <RefreshCw className="w-3 h-3 animate-spin text-[#059669]" /> : <Zap className="w-3 h-3 text-amber-500" />}
        <span>Shorter</span>
      </button>

      <button
        onClick={() => handleApplyPolish('persuasive')}
        disabled={loading}
        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
        title="Make content high-converting and persuasive"
      >
        {loading && activeAction === 'persuasive' ? <RefreshCw className="w-3 h-3 animate-spin text-[#059669]" /> : <Target className="w-3 h-3 text-indigo-500" />}
        <span>More Persuasive</span>
      </button>

      <button
        onClick={() => handleApplyPolish('formal')}
        disabled={loading}
        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
        title="Make content executive and formal"
      >
        {loading && activeAction === 'formal' ? <RefreshCw className="w-3 h-3 animate-spin text-[#059669]" /> : <Briefcase className="w-3 h-3 text-blue-500" />}
        <span>More Formal</span>
      </button>

      <button
        onClick={() => handleApplyPolish('cta')}
        disabled={loading}
        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
        title="Add a strong Call-To-Action"
      >
        {loading && activeAction === 'cta' ? <RefreshCw className="w-3 h-3 animate-spin text-[#059669]" /> : <MessageCircle className="w-3 h-3 text-[#059669]" />}
        <span>+ Call-To-Action</span>
      </button>
    </div>
  );
};
