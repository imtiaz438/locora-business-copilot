import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PricingComparisonTable } from '../PricingComparisonTable';
import { OneTimeOffersSection } from '../OneTimeOffersSection';
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
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
          Flexible Plans to Scale Your Business
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
          Start for free with 25 monthly AI credits, or scale your business with Pro Growth ($19/mo) and Agency Elite ($49/mo) plans. Cancel or upgrade anytime.
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
              SAVE 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Starter Plan */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold font-heading">
              Starter Plan
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-900">Free Forever</h3>
            <p className="text-xs text-slate-500 font-sans">
              Ideal for solo freelancers & exploring Locora AI features.
            </p>

            <div className="pt-2 font-heading">
              <span className="text-4xl font-black text-slate-900">$0</span>
              <span className="text-xs text-slate-500 font-medium font-sans"> / month</span>
            </div>

            <div className="space-y-2.5 pt-4 text-xs font-sans">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span><strong>25 AI Copilot Credits</strong> / month</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>AI Business Chat Copilot</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Client CRM (Up to 10 contacts)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Invoicing (2 invoices, Locora branding)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Free Website Audit Tool</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSelectPlan('free')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all text-center cursor-pointer font-sans"
          >
            {user && user.planTier !== 'free' ? 'Manage Account' : 'Get Started Free'}
          </button>
        </div>

        {/* Pro Growth Plan (Highlighted) */}
        <div className="bg-white border-2 border-[#059669] rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xl relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#059669] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-xs font-heading">
            Most Popular Choice
          </div>

          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-emerald-50 text-[#059669] border border-emerald-200 rounded-lg text-xs font-bold font-heading">
              Pro Growth Plan
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-900">Pro Growth</h3>
            <p className="text-xs text-slate-600 font-sans">
              For growing agencies & local service teams scaling client deals.
            </p>

            <div className="pt-2 font-heading">
              <span className="text-5xl font-black text-slate-900">
                {billingCycle === 'yearly' ? '$15' : '$19'}
              </span>
              <span className="text-xs text-slate-500 font-medium font-sans"> / month</span>
              {billingCycle === 'yearly' && (
                <p className="text-[11px] text-[#059669] font-bold pt-1 font-sans">Billed annually ($180/yr)</p>
              )}
            </div>

            <div className="space-y-2.5 pt-4 text-xs font-sans">
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span><strong>250 AI Copilot Credits</strong> / month</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Unlimited Invoicing & Proposals (Your Branding)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Google Business SEO & Local Content Assistant</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Client Portal Shareable Links</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>30 & 90-Day Marketing Roadmaps</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Brand Voice Setup & Referral Ask Generator</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSelectPlan('pro')}
            className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <span>
              {user?.planTier === 'pro'
                ? 'Current Active Plan'
                : user?.planTier === 'agency'
                ? 'Included in Agency Elite'
                : 'Upgrade to Pro Growth'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Agency Elite Plan */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold font-heading">
              Agency Elite Plan
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-900">Agency Elite</h3>
            <p className="text-xs text-slate-500 font-sans">
              For established agencies requiring power scale & multi-user teams.
            </p>

            <div className="pt-2 font-heading">
              <span className="text-4xl font-black text-slate-900">
                {billingCycle === 'yearly' ? '$39' : '$49'}
              </span>
              <span className="text-xs text-slate-500 font-medium font-sans"> / month</span>
              {billingCycle === 'yearly' && (
                <p className="text-[11px] text-indigo-600 font-bold pt-1 font-sans">Billed annually ($468/yr)</p>
              )}
            </div>

            <div className="space-y-2.5 pt-4 text-xs font-sans">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span><strong>UNLIMITED AI Copilot Credits</strong> / month</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>JSON-LD Schema Generator</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>White-Labeled Shareable Business Report Cards</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Up to 5 Team Member Seats</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSelectPlan('agency')}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <span>{user?.planTier === 'agency' ? 'Current Active Plan' : 'Upgrade to Agency Elite'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* One-Time Offers & À La Carte Purchases */}
      <div className="max-w-6xl mx-auto pt-4">
        <OneTimeOffersSection />
      </div>

      {/* Feature & Credits Comparison Table */}
      <div className="max-w-6xl mx-auto">
        <PricingComparisonTable />
      </div>

      {/* Money Back Guarantee & Global Payment Notice */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl flex items-start gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#059669] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold font-heading text-slate-900">14-Day Money Back Guarantee</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Try Pro Growth or Agency Elite risk-free. If Locora AI doesn't save your business at least 10 hours in your first 14 days, get a 100% full refund with no hassle.
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-900 text-white border border-slate-800 rounded-2xl flex items-start gap-4 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-lg">
            🌐
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold font-heading text-emerald-400 flex items-center gap-1.5">
              <span>Global Payment & Region Support</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stripe covers 195+ countries via cards, Apple Pay, & Google Pay. In a country without direct Stripe card access?
            </p>
            <button
              onClick={() => setActiveTab('contact')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              <span>Contact Billing for Wire / Bank Transfer / Manual Invoice →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
