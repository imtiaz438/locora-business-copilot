import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Check, X, ArrowRight, ArrowLeft, Volume2, Target, Award, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandVoiceWizardModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { businessProfile, updateBusinessProfile, logActivity, user, setCheckoutModalPlan } = useApp();

  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState(businessProfile.industry || 'Local Services');
  const [tone, setTone] = useState(businessProfile.toneOfVoice || 'Professional, warm, and results-driven');
  const [targetAudience, setTargetAudience] = useState(
    businessProfile.targetAudience || 'Local homeowners, busy parents, and commercial property managers'
  );
  const [differentiator, setDifferentiator] = useState(
    businessProfile.tagline || '100% satisfaction guaranteed, transparent pricing, 15+ years local experience'
  );
  const [avoidedWords, setAvoidedWords] = useState('Cheap, discount, basic, synergy, leverage');

  if (!isOpen) return null;

  const toneOptions = [
    { label: 'Professional & Authoritative', desc: 'Expert, trustworthy, precise and clear.' },
    { label: 'Warm & Friendly', desc: 'Approachable, empathetic, customer-focused.' },
    { label: 'High-Energy & Bold', desc: 'Direct, persuasive, punchy and action-oriented.' },
    { label: 'Luxury & Premium', desc: 'Sophisticated, high-end, bespoke and refined.' },
  ];

  const handleSave = () => {
    updateBusinessProfile({
      industry,
      toneOfVoice: `${tone} (Target: ${targetAudience}). Differentiators: ${differentiator}. Avoid words: ${avoidedWords}`,
      targetAudience,
      tagline: differentiator.slice(0, 80),
    });
    logActivity('brand_voice', 'Updated Brand Voice Profile', `Configured AI tone: ${tone}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">Brand Voice Setup Wizard</h3>
              <p className="text-xs text-slate-500">Teach AI your business tone for personalized generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-2 px-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-[#059669]' : 'bg-slate-100'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm">
              <Volume2 className="w-4 h-4 text-[#059669]" />
              <span>Step 1: Select Your Primary Communication Tone</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {toneOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setTone(opt.label)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    tone.includes(opt.label.split(' ')[0])
                      ? 'border-[#059669] bg-emerald-50/60 ring-1 ring-[#059669]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 font-heading">{opt.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm">
              <Target className="w-4 h-4 text-[#059669]" />
              <span>Step 2: Who is your ideal target customer?</span>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Target Audience Description</label>
              <textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                rows={3}
                placeholder="e.g., Local homeowners in suburban areas, busy working mothers, commercial property managers"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Industry / Niche</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Plumbing, HVAC, Digital Marketing, Legal Consulting"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm">
              <Award className="w-4 h-4 text-[#059669]" />
              <span>Step 3: What makes your business unique?</span>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Core Value Proposition & Differentiators</label>
              <textarea
                value={differentiator}
                onChange={(e) => setDifferentiator(e.target.value)}
                rows={4}
                placeholder="e.g., 24/7 emergency dispatch, licensed & insured, 100% price guarantee, 15+ years serving the community"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Step 4: Buzzwords or phrases AI should AVOID</span>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Forbidden Words / Jargon</label>
              <input
                type="text"
                value={avoidedWords}
                onChange={(e) => setAvoidedWords(e.target.value)}
                placeholder="e.g., cheap, synergy, leverage, game-changer, revolutionary"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
              />
              <p className="text-[11px] text-slate-400 mt-1">AI will actively filter out these terms from generated copy.</p>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <div className="flex items-center gap-2">
              {user.planTier === 'free' && step === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setCheckoutModalPlan('pro');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer"
                >
                  Unlock 4 Steps (Pro)
                </button>
              )}
              <button
                onClick={() => {
                  if (user.planTier === 'free' && step >= 1) {
                    handleSave();
                    return;
                  }
                  setStep(step + 1);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>{user.planTier === 'free' ? 'Save Tone (Free)' : 'Next Step'}</span>
                {user.planTier !== 'free' && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Save Brand Voice</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
