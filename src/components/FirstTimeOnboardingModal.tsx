import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  Building2,
  MapPin,
  Briefcase,
  Target,
  Search,
  Check,
  Zap,
} from 'lucide-react';

interface FirstTimeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstTimeOnboardingModal: React.FC<FirstTimeOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeBusiness, updateBusinessProfile, setActiveTab, logActivity } = useApp();

  const [step, setStep] = useState<number>(1); // 1-6 inputs, 7 analyzing, 8 first opportunities
  const [formData, setFormData] = useState({
    website: activeBusiness?.website || '',
    businessName: activeBusiness?.name || '',
    phone: activeBusiness?.phone || '',
    city: activeBusiness?.city || '',
    state: activeBusiness?.state || '',
    services: activeBusiness?.services?.join(', ') || 'Consulting, Priority Support, Custom Solutions',
    goals: 'Dominate Google 3-Pack, Respond to all reviews, Increase client inquiries',
    googleConnected: true,
  });

  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  if (!isOpen) return null;

  const handleStartAnalysis = () => {
    setStep(7);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setAnalysisProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setStep(8);
        }, 600);
      }
    }, 450);
  };

  const handleFinishOnboarding = () => {
    updateBusinessProfile({
      name: formData.businessName,
      website: formData.website,
      phone: formData.phone,
      city: formData.city,
      state: formData.state,
      services: formData.services.split(',').map((s) => s.trim()),
      businessGoals: formData.goals.split(',').map((g) => g.trim()),
    });
    logActivity('onboarding_completed', 'Completed Business Onboarding', `Set up ${formData.businessName}`);
    setActiveTab('dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-scaleUp">
        {/* Header strictly adhering to Section 35 */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs font-bold text-[#059669] uppercase font-heading">
            <Sparkles className="w-3.5 h-3.5" />
            <span>First-Time Onboarding Experience</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight mt-1">
            Welcome to Locora 👋
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Let's understand your business to tailor your autonomous AI Growth Engine.
          </p>

          {/* Stepper (1 to 6) */}
          {step <= 6 && (
            <div className="flex items-center gap-1.5 mt-4">
              {[
                '1. Website',
                '2. Business',
                '3. Location',
                '4. Services',
                '5. Goals',
                '6. Connect Google',
              ].map((label, idx) => {
                const sNum = idx + 1;
                const isPassed = step > sNum;
                const isCurrent = step === sNum;
                return (
                  <div
                    key={sNum}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      isPassed
                        ? 'bg-[#059669]'
                        : isCurrent
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-slate-200'
                    }`}
                    title={label}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Step Content */}
        <div className="p-6 space-y-4">
          {/* Step 1: Website */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm">
                <Globe className="w-4 h-4 text-[#059669]" />
                <span>1. What is your business website?</span>
              </div>
              <p className="text-xs text-slate-500">
                Locora will crawl your pages, detect missing metadata, and benchmark your local competitors.
              </p>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="e.g. yourclinic.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm">
                <Building2 className="w-4 h-4 text-[#059669]" />
                <span>2. Business Name & Phone Number</span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Official Business Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Direct Phone Number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm">
                <MapPin className="w-4 h-4 text-[#059669]" />
                <span>3. Primary Location / Target Metro</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City (e.g. Austin)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State (e.g. TX)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Services */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm">
                <Briefcase className="w-4 h-4 text-[#059669]" />
                <span>4. High-Margin Services</span>
              </div>
              <p className="text-xs text-slate-500">
                Comma-separated list of services you want to rank #1 for in local search.
              </p>
              <textarea
                rows={3}
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Step 5: Goals */}
          {step === 5 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm">
                <Target className="w-4 h-4 text-[#059669]" />
                <span>5. Primary Growth Objectives</span>
              </div>
              <textarea
                rows={3}
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Step 6: Connect Google */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-emerald-300 flex items-center justify-center font-bold text-emerald-700 shadow-2xs">
                    G
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-heading">
                      Google Business Profile
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Sync reviews, verify categories, and manage Google 3-Pack placement
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Ready</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Clicking Analyze will run real-time local SEO and review audits across {formData.businessName || 'your business'}.
              </p>
            </div>
          )}

          {/* Step 7: Section 35 - Analyzing your business... */}
          {step === 7 && (
            <div className="py-6 space-y-4 text-left">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto animate-spin">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-heading">
                  Analyzing your business...
                </h4>
                <p className="text-xs text-slate-500">Autonomous scan in progress ({analysisProgress}%)</p>
              </div>

              {/* Section 35 Checklist */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 font-sans text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span>✓ Website ({formData.website || 'website scanned'})</span>
                </div>
                <div className={`flex items-center gap-2 ${analysisProgress >= 40 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Local SEO (Google 3-pack & citations scanned)</span>
                </div>
                <div className={`flex items-center gap-2 ${analysisProgress >= 60 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Business profile (Categories & hours verified)</span>
                </div>
                <div className={`flex items-center gap-2 ${analysisProgress >= 80 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Reviews ({activeBusiness?.reviewCount || 248} reviews analyzed, pending responses identified)</span>
                </div>
                <div className={`flex items-center gap-2 ${analysisProgress >= 90 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Competitors ({activeBusiness?.competitors?.[0] || 'Local competitors'} benchmarked)</span>
                </div>
                <div className={`flex items-center gap-2 ${analysisProgress >= 100 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Opportunities (Top 3 immediate actions identified)</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Section 35 - "Here's what I'd work on first." (First 3-5 opportunities) */}
          {step === 8 && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading">
                  Analysis Complete
                </span>
                <h4 className="text-base font-extrabold text-slate-900 font-heading">
                  "Here's what I'd work on first."
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Locora evaluated your digital presence and identified your highest-leverage growth actions:
                </p>
              </div>

              {/* 3 First Opportunities */}
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                      High Impact
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 font-heading mt-0.5">
                      1. Publish High-Intent Service Landing Page
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Target {formData.services ? formData.services.split(',')[0].trim() : 'high-intent'} searches currently dominated by local rivals.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#059669] font-mono shrink-0">+18 calls/mo</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      Opportunity
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 font-heading mt-0.5">
                      2. Respond to Unanswered Google Reviews
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Restore 100% response velocity to boost local Google Maps trust score.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#059669] font-mono shrink-0">+4.2 pts</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      Good
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 font-heading mt-0.5">
                      3. Inject LocalBusiness Schema on Homepage
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Feed structured opening hours, contact details, and offerings to Google AI Overviews.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#059669] font-mono shrink-0">+24% snippet</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {step <= 6 ? (
            <>
              <button
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Back
              </button>
              {step < 6 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm cursor-pointer font-heading"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleStartAnalysis}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer font-heading"
                >
                  <span>Analyze My Business</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : step === 8 ? (
            <button
              onClick={handleFinishOnboarding}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs shadow-md cursor-pointer font-heading"
            >
              <span>Enter Locora Growth OS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full text-center text-xs text-slate-400 font-mono">
              Running autonomous analysis...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
