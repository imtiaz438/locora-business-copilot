import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PricingComparisonTable } from '../PricingComparisonTable';
import { OneTimeOffersSection } from '../OneTimeOffersSection';
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Building,
  Users,
} from 'lucide-react';

export const PricingPublicView: React.FC = () => {
  const { setCheckoutModalPlan, setActiveTab, user } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (plan: 'free' | 'pro' | 'agency') => {
    if (plan === 'free') {
      if (user && user.planTier !== 'free') {
        setActiveTab('subscription');
      } else {
        setActiveTab('signup');
      }
    } else {
      setCheckoutModalPlan(plan, billingCycle);
    }
  };

  return (
    <div className="space-y-16 py-12 px-6 max-w-7xl mx-auto font-sans bg-slate-50 text-slate-900">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-semibold font-heading uppercase tracking-wider">
          <Zap className="w-4 h-4 text-[#059669]" />
          <span>Simple & Transparent Pricing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">
          One Platform. One Business Brain. One AI Growth Manager.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
          Start for free with a comprehensive AI Business Checkup, grow your business with Pro ($29/mo), or manage all your agency clients ($99/mo).
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold font-heading ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-8 bg-slate-200 rounded-full p-1 relative transition-colors border border-slate-300 cursor-pointer"
          >
            <div
              className={`w-6 h-6 rounded-full bg-[#059669] transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5 font-heading">
            <span className={`text-xs font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual Billing
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-[#059669] border border-emerald-200 text-[10px] font-extrabold rounded-full">
              SAVE UP TO 28%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* FREE PLAN */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold font-heading">
              Explorer
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-900">Free Forever</h3>
            <p className="text-xs text-slate-500 font-sans">
              For business owners exploring what is holding their local growth back.
            </p>

            <div className="pt-2 font-heading">
              <span className="text-4xl font-black text-slate-900">$0</span>
              <span className="text-xs text-slate-500 font-medium font-sans"> / forever</span>
            </div>

            <div className="space-y-2.5 pt-4 text-xs font-sans">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span><strong>1 Business</strong> profile context</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>AI Business Checkup & Diagnosis</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Basic Business Brain (12 context nodes)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Basic Local SEO & Google Maps Audit</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>1 Competitor tracked</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>5 Tracked Growth Opportunities</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>10 Review Analyses / month</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={() => handleSelectPlan('free')}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer font-sans"
            >
              Start Free Checkup
            </button>
          </div>
        </div>

        {/* PRO PLAN ($29) */}
        <div className="bg-white border-2 border-[#059669] rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-lg relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#059669] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm font-heading">
            MOST POPULAR · AI GROWTH MANAGER
          </div>

          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-emerald-50 text-[#059669] rounded-lg text-xs font-bold font-heading">
              Pro Growth
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-900">AI Business Manager</h3>
            <p className="text-xs text-slate-500 font-sans">
              For 1 business ready for proactive growth, Google Maps domination, and AI visibility.
            </p>

            <div className="pt-2 font-heading">
              <span className="text-4xl font-black text-slate-900">
                {billingCycle === 'yearly' ? '$249' : '$29'}
              </span>
              <span className="text-xs text-slate-500 font-medium font-sans">
                {billingCycle === 'yearly' ? ' / year ($20.75/mo)' : ' / month'}
              </span>
            </div>

            <div className="space-y-2.5 pt-4 text-xs font-sans">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Full Business Brain & AI Growth Manager</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>AI Local SEO Copilot & Google Maps ranking</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>AI Reputation Manager (200 review actions/mo)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Competitor Intelligence (5 competitors tracked)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>50 Tracked search opportunities & geo gaps</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>2026 AI Search Visibility (ChatGPT & Perplexity)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>30-Day AI Growth Plan with 1-click execution</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Full CRM, Proposals, Invoices & Documents</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={() => handleSelectPlan('pro')}
              className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <span>Upgrade to Pro ($29/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AGENCY PLAN ($99) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold font-heading">
              Agency Elite
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-900">AI Client Manager</h3>
            <p className="text-xs text-slate-500 font-sans">
              Manage 10, 50, or 100 local businesses with an autonomous AI client manager.
            </p>

            <div className="pt-2 font-heading">
              <span className="text-4xl font-black text-slate-900">
                {billingCycle === 'yearly' ? '$790' : '$99'}
              </span>
              <span className="text-xs text-slate-500 font-medium font-sans">
                {billingCycle === 'yearly' ? ' / year ($65.80/mo)' : ' / month'}
              </span>
            </div>

            <div className="space-y-2.5 pt-4 text-xs font-sans">
              <div className="flex items-center gap-2 text-indigo-950 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Everything in Pro for 10 Businesses</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>10 Dedicated Business Brains</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>AI Client Monitoring (Automated Scans)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Bulk Analysis, Review & Content Actions</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>White-Label Executive Client PDF Reports</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Custom Client Portals & Dashboards</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Up to 5 Team Member Seats included</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Agency custom branding & logo</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={() => handleSelectPlan('agency')}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer font-sans flex items-center justify-center gap-2"
            >
              <span>Get Agency Client Manager ($99/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="pt-6">
        <PricingComparisonTable />
      </div>

      {/* Locora Growth Store */}
      <div className="pt-8">
        <OneTimeOffersSection />
      </div>
    </div>
  );
};
