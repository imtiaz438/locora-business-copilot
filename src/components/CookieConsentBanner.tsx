import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, SlidersHorizontal, Check, Info, Lock } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  acceptedAt?: string;
}

const STORAGE_KEY = 'locora_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);

  // Toggle states
  const [analytics, setAnalytics] = useState<boolean>(true);
  const [functional, setFunctional] = useState<boolean>(true);
  const [marketing, setMarketing] = useState<boolean>(false);

  useEffect(() => {
    // Check if consent has already been given
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Show disclaimer on first visit
      setShowBanner(true);
    } else {
      try {
        const parsed: CookiePreferences = JSON.parse(stored);
        if (parsed) {
          setAnalytics(parsed.analytics ?? true);
          setFunctional(parsed.functional ?? true);
          setMarketing(parsed.marketing ?? false);
        }
      } catch (e) {
        setShowBanner(true);
      }
    }

    // Global listener to reopen cookie settings from footer or policy links
    const handleOpenSettings = () => {
      setShowPreferences(true);
      setShowBanner(false);
    };

    window.addEventListener('open_cookie_settings', handleOpenSettings);
    return () => {
      window.removeEventListener('open_cookie_settings', handleOpenSettings);
    };
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const data: CookiePreferences = {
      ...prefs,
      essential: true, // Always required
      acceptedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
    });
  };

  const handleAcceptEssential = () => {
    setAnalytics(false);
    setFunctional(false);
    setMarketing(false);
    saveConsent({
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      essential: true,
      analytics,
      functional,
      marketing,
    });
  };

  if (!showBanner && !showPreferences) {
    return null;
  }

  return (
    <>
      {/* 1. First-Time Main Banner Disclaimer */}
      {showBanner && !showPreferences && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl transition-all duration-300 font-sans">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] flex-shrink-0 mt-0.5 shadow-2xs">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-heading text-slate-900 tracking-tight">
                    Cookie & Privacy Preferences
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200">
                    GDPR & CCPA Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We use essential cookies to operate our application and keep your session secure. With your permission, we also use optional cookies to analyze site traffic, personalize content, and optimize our marketing tools. You can customize your preferences anytime.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Cookie Settings</span>
              </button>

              <button
                type="button"
                onClick={handleAcceptEssential}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Essential Only
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Accept All Cookies</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Detailed Cookie Settings Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669]">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">
                    Cookie & Preference Center
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Manage your privacy and cookie permissions for Locora AI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPreferences(false);
                  // If user hasn't made a choice yet, leave banner open
                  const stored = localStorage.getItem(STORAGE_KEY);
                  if (!stored) setShowBanner(true);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Preferences List */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Category 1: Essential Cookies */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 font-heading">
                      Strictly Essential Cookies
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#047857] text-[10px] font-bold">
                      Always Active
                    </span>
                  </div>
                  <div className="text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Necessary for security, user authentication, session integrity, and fraud prevention. Without these, core app workflows and login services cannot function.
                </p>
              </div>

              {/* Category 2: Analytics & Performance */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 font-heading block">
                      Analytics & Performance Cookies
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Aggregated usage metrics & load speed optimization
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Helps us understand how visitors interact with our local SEO tools, proposal templates, and CRM features so we can optimize application speed and fix glitches.
                </p>
              </div>

              {/* Category 3: Functional & Personalization */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 font-heading block">
                      Functional & Experience Cookies
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Workspace layout memory, sidebar states & theme settings
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={functional}
                      onChange={(e) => setFunctional(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Remembers your operational preferences such as table column ordering, draft state autosave, and active workspace views.
                </p>
              </div>

              {/* Category 4: Marketing & Advertising */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 font-heading block">
                      Marketing & Partner Cookies
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Campaign attribution & referral tracking
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Used to measure the performance of our agency partner programs, growth campaigns, and affiliate referral links.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2 font-sans">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  You can modify these preferences at any time by clicking <strong>Cookie Settings</strong> in the footer of any page.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Reject Optional (Essential Only)
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[#047857] font-bold text-xs transition-colors cursor-pointer"
                >
                  Save Preferences
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
