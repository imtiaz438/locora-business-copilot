import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Share2, Sparkles, Copy, Check, X, Gift, MessageSquare, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomerName?: string;
}

export const ReferralAskModal: React.FC<Props> = ({ isOpen, onClose, preselectedCustomerName }) => {
  const { customers, businessProfile, settings, consumeAiCredit, hasEnoughCredits, logActivity, user, setCheckoutModalPlan } = useApp();

  const [clientName, setClientName] = useState(preselectedCustomerName || customers[0]?.name || 'Sarah Jenkins');
  const [incentive, setIncentive] = useState('$50 Amazon Gift Card / 10% Off Next Invoice');
  const [tone, setTone] = useState('Warm & Friendly');
  const [loading, setLoading] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (user.planTier === 'free') {
      alert('Referral-Ask Generator is available on Pro Growth ($29/mo) and Agency Elite plans.');
      setCheckoutModalPlan('pro');
      return;
    }
    if (!hasEnoughCredits(2)) return;
    setLoading(true);

    try {
      consumeAiCredit(2);

      const prompt = `Write a short, warm, highly personalized email/SMS message asking a happy client named "${clientName}" for a referral for ${businessProfile.name || 'our business'}.
Incentive offered: ${incentive}.
Tone: ${tone}.
Keep it concise, friendly, not pushy, and easy for them to forward or send to a colleague/friend.`;

      const res = await fetch('/api/ai/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type: 'email',
          title: `Referral Request - ${clientName}`,
          providerKey: settings.providerKeys[settings.activeProvider],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedMsg(data.content || data.document?.content || '');
        logActivity('referral', 'Generated Referral Ask', `Created referral message for ${clientName}`);
      } else {
        // Fallback generator
        const fallback = `Hi ${clientName},\n\nHope you're having a great week!\n\nIt’s been a pleasure working together on your recent projects with ${businessProfile.name || 'our team'}. As a small local business, our growth relies heavily on word-of-mouth recommendations from wonderful clients like you.\n\nIf you know any colleagues, friends, or business owners who could benefit from our services, we'd love an introduction! As a thank you, we're offering ${incentive} for every referral that signs on.\n\nThank you so much for your support,\n${businessProfile.name || 'Our Team'}`;
        setGeneratedMsg(fallback);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">Referral-Ask Generator</h3>
              <p className="text-xs text-slate-500">Ask happy clients for warm referrals in 1 click</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select / Enter Client Name</label>
            {customers.length > 0 ? (
              <select
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.company || c.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Name (e.g. Sarah Jenkins)"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
              />
            )}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Referral Reward / Incentive (Optional)</label>
            <input
              type="text"
              value={incentive}
              onChange={(e) => setIncentive(e.target.value)}
              placeholder="e.g. $50 gift card, 10% discount on next project"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Crafting Personalized Ask...' : 'Generate Referral Message (1 Credit)'}</span>
          </button>
        </div>

        {/* Generated Message Display */}
        {generatedMsg && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 font-heading">
              <span>Personalized Message</span>
              <button
                onClick={handleCopy}
                className="text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Copy'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={generatedMsg}
              rows={7}
              className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-sans leading-relaxed text-slate-800 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};
