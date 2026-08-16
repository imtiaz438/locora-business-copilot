import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PricingComparisonTable } from './PricingComparisonTable';
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Calculator,
  Building,
  Users,
  FileSpreadsheet,
  Globe,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BillingCycle, UserPlan } from '../types';

export const PricingView: React.FC = () => {
  const { user, setCheckoutModalPlan, setActiveTab } = useApp();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ROI Calculator State
  const [clientsCount, setClientsCount] = useState(12);
  const [hourlyRate, setHourlyRate] = useState(75);

  // Calculated ROI values
  const hoursSavedPerClient = 6; // Hours saved drafting proposals, SEO, invoices & content
  const totalHoursSaved = clientsCount * hoursSavedPerClient;
  const estimatedRevenueSaved = totalHoursSaved * hourlyRate;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const plans = [
    {
      id: 'free' as UserPlan,
      name: 'Free Starter',
      tagline: 'Ideal for solo freelancers & exploring AI copilot features.',
      priceMonthly: 0,
      priceYearly: 0,
      badge: null,
      aiCredits: '25 AI Credits / month',
      features: [
        'AI Business Chat Copilot',
        'Basic CRM & Contact Management (Up to 10 contacts)',
        'Invoicing (2 invoices, Locora branding)',
        'Business Document Generator (Limited)',
        'Standard Website Review Audit',
        'Guided Activation Checklist',
        'One-Click "Polish" Tool',
        'Shareable Report Card (Branded)',
      ],
      notIncluded: [
        'Client Portal Shareable Links',
        'AI Proposals & Contracts',
        'Google Business SEO Assistant',
        'Referral-Ask Generator',
      ],
      ctaText: user.planTier === 'free' ? 'Current Active Plan' : 'Downgrade to Free',
      ctaDisabled: user.planTier === 'free',
      popular: false,
    },
    {
      id: 'pro' as UserPlan,
      name: 'Pro Growth',
      tagline: 'Built for growing local service businesses, consultants & agencies.',
      priceMonthly: 19,
      priceYearly: 15,
      badge: 'MOST POPULAR',
      aiCredits: '250 AI Credits / month',
      features: [
        'Everything in Free Starter Plan',
        'Unlimited CRM Leads & Contacts',
        'Unlimited Invoicing (Your Branding)',
        'Client Portal Shareable Links',
        'Proposals / Quotes / Contracts Generator',
        'Google Business & Local SEO Assistant',
        '30-Day & 90-Day Marketing Roadmap Generator',
        'Full Website Audit & Competitor Snapshot',
        'Brand Voice Setup Wizard',
        'Referral-Ask Generator & Multi-Language',
        'Unbranded Shareable Business Report Card',
      ],
      notIncluded: [
        'JSON-LD Schema Generator',
        'Up to 5 Team Member Seats',
      ],
      ctaText: user.planTier === 'pro' ? 'Current Active Plan' : 'Upgrade to Pro Growth',
      ctaDisabled: user.planTier === 'pro',
      popular: true,
    },
    {
      id: 'agency' as UserPlan,
      name: 'Agency Elite',
      tagline: 'Designed for scaling marketing agencies, IT providers & power teams.',
      priceMonthly: 49,
      priceYearly: 39,
      badge: 'UNLIMITED POWER',
      aiCredits: 'UNLIMITED AI Credits / month',
      features: [
        'Everything in Pro Growth Plan',
        'UNLIMITED AI Generations & Credits',
        'JSON-LD Schema Generator',
        'White-Labeled Business Report Cards',
        'Up to 5 Team Member Seats Included',
        'Bring Your Own API Keys (BYOK) Access',
        'Multi-Client Workspaces',
        'Dedicated Priority VIP Support',
      ],
      notIncluded: [],
      ctaText: user.planTier === 'agency' ? 'Current Active Plan' : 'Upgrade to Agency Elite',
      ctaDisabled: user.planTier === 'agency',
      popular: false,
    },
  ];

  const faqs = [
    {
      q: 'How do AI Credits work across monthly plans?',
      a: 'Each time you generate a proposal, document, or chat response, AI credits are consumed based on feature complexity. The Free Plan includes 25 credits/mo, Pro Growth ($19/mo) includes 250 AI credits/mo, and Agency Elite ($49/mo) includes Unlimited AI credits!',
    },
    {
      q: 'Can I white-label Locora AI reports for my clients?',
      a: 'Yes! The Agency Elite plan ($49/mo) allows you to white-label report cards, proposals, and invoices with your own agency logo and branding.',
    },
    {
      q: 'Can I change or cancel my subscription anytime?',
      a: 'Absolutely. You can toggle auto-renewal or switch billing terms anytime in your Subscription & Billing portal. For plan cancellations or refunds, simply drop an email to support@locoraai.com and our team will process your request within 48 hours.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We process payments securely via Stripe, supporting all major credit cards (Visa, Mastercard, American Express, Discover), Apple Pay, and Google Pay.',
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-12 max-w-7xl mx-auto text-slate-900 font-sans">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#059669]/10 border border-[#059669]/30 text-[#059669] text-xs font-semibold font-sans">
          <Sparkles className="w-4 h-4 text-[#059669]" />
          <span>Simple, Transparent Business Monetization & Pricing</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">
          Supercharge Your Business & Save 10+ Hours Every Week
        </h1>
        <p className="text-sm md:text-base text-slate-600 font-sans">
          Choose the plan tailored for your operational goals. Unlock AI proposals, automated local SEO, client CRM, and high-converting document generation.
        </p>

        {/* Billing Cycle Switcher */}
        <div className="pt-4 flex items-center justify-center gap-3 font-sans">
          <span className={`text-xs ${billingCycle === 'monthly' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-7 bg-slate-200 rounded-full border border-slate-300 p-1 transition-colors cursor-pointer"
          >
            <div
              className={`w-5 h-5 bg-[#059669] rounded-full shadow-xs transition-transform transform ${
                billingCycle === 'yearly' ? 'translate-x-7 bg-[#059669]' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${billingCycle === 'yearly' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
              Annual Billing
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#059669]/10 text-[#059669] rounded-full border border-[#059669]/30">
              SAVE 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch font-sans">
        {plans.map((plan) => {
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
          const isCurrentPlan = user.planTier === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl p-6 md:p-8 transition-all duration-200 ${
                plan.popular
                  ? 'bg-white border-2 border-[#059669] shadow-md scale-102'
                  : 'bg-white border border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#059669] text-white text-[10px] font-black tracking-wider uppercase shadow-2xs font-sans">
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Plan Title & Tagline */}
                <div className="border-b border-slate-100 pb-5 mb-5 space-y-2">
                  <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center justify-between">
                    <span>{plan.name}</span>
                    {isCurrentPlan && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#059669]/10 text-[#059669] border border-[#059669]/30 rounded font-semibold font-sans">
                        ACTIVE
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 min-h-[36px]">{plan.tagline}</p>

                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black font-heading text-slate-900">${price}</span>
                    <span className="text-xs text-slate-500">/ month</span>
                    {billingCycle === 'yearly' && price > 0 && (
                      <span className="text-[10px] text-[#059669] ml-1 font-semibold">
                        (Billed annually)
                      </span>
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 mt-2">
                    <Zap className="w-3.5 h-3.5 text-[#059669]" />
                    <span>{plan.aiCredits}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-6 text-xs">
                  <p className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] font-sans">
                    Included Capabilities:
                  </p>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}

                  {(plan.notIncluded || []).length > 0 && (
                    <div className="pt-2 space-y-2 opacity-60">
                      {(plan.notIncluded || []).map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-slate-400">
                          <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            ✕
                          </div>
                          <span className="line-through">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (plan.id !== 'free') {
                    setCheckoutModalPlan(plan.id, billingCycle);
                  }
                }}
                disabled={plan.ctaDisabled}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-sans ${
                  plan.ctaDisabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : plan.popular
                    ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200'
                }`}
              >
                <span>{plan.ctaText}</span>
                {!plan.ctaDisabled && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature & Credits Comparison Table */}
      <PricingComparisonTable />

      {/* ROI & Revenue Calculator Widget */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xs font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#059669]/10 text-[#059669] text-xs font-bold rounded-lg font-sans">
              <Calculator className="w-4 h-4" /> Agency ROI & Revenue Calculator
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Calculate How Much Money Locora AI Saves Your Business
            </h2>
            <p className="text-xs text-slate-500">
              Locora AI automates proposals, SEO audits, client invoices, and communications in seconds instead of hours.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Sliders */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Active Clients / Leads Handled per Month:</span>
                <span className="text-[#059669] font-bold text-sm">{clientsCount} Clients</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={clientsCount}
                onChange={(e) => setClientsCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#059669]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Your Average Billable Hourly Rate ($):</span>
                <span className="text-[#059669] font-bold text-sm">${hourlyRate} / hour</span>
              </div>
              <input
                type="range"
                min="25"
                max="300"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#059669]"
              />
            </div>
          </div>

          {/* ROI Result Box */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[11px] text-slate-500 font-medium">Estimated Time Saved</p>
                <p className="text-2xl font-black font-heading text-slate-900">{totalHoursSaved} Hours</p>
                <p className="text-[10px] text-slate-400">per month</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[11px] text-slate-500 font-medium">Monthly Value Generated</p>
                <p className="text-2xl font-black font-heading text-[#059669]">${estimatedRevenueSaved.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">per month</p>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold text-slate-900 font-heading">Estimated ROI vs $19 Pro Plan:</span>
                <p className="text-[11px] text-[#059669] font-semibold">
                  {Math.round((estimatedRevenueSaved / 19) * 100)}% Monthly Return on Investment
                </p>
              </div>
              <button
                onClick={() => setCheckoutModalPlan('pro')}
                className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Claim ROI Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6 max-w-3xl mx-auto font-sans">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#059669]" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs text-slate-500">Everything you need to know about Locora AI subscriptions and billing.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-slate-900 hover:text-[#059669] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#059669]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
