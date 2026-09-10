import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SEO_FEATURES_DATABASE } from '../../data/seoData';
import {
  FileText,
  MapPin,
  Users,
  FileSpreadsheet,
  Globe,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Zap,
  ExternalLink,
} from 'lucide-react';

export const FeaturesView: React.FC = () => {
  const { setActiveTab, user } = useApp();
  const [selectedModule, setSelectedModule] = useState<'proposal' | 'seo' | 'crm' | 'invoice' | 'audit' | 'planner'>('proposal');

  const featureList = Object.values(SEO_FEATURES_DATABASE);

  const modules = [
    {
      id: 'proposal' as const,
      name: 'AI Proposals & Contracts',
      slug: 'ai-proposal-generator',
      icon: FileText,
      tagline: 'Scope, Price & Draft High-Winning Business Proposals in 60 Seconds',
      description: 'Generate comprehensive proposals with scope of work, project milestones, deliverable schedules, itemized pricing, and formal client acceptance terms.',
      bullets: [
        'Automated scope of work & deliverable generation',
        'Customizable pricing tables (flat rate, hourly, retainer)',
        'Itemized service breakdown with estimated timelines',
        'One-click white-label PDF export with your logo',
      ],
    },
    {
      id: 'seo' as const,
      name: 'Local SEO & Schema Assistant',
      slug: 'seo-audit',
      icon: MapPin,
      tagline: 'Dominate Google Business Profile & Local Search Map Packs',
      description: 'Generate localized descriptions, review reply templates, Google Q&As, local landing page copy, and valid JSON-LD schema markup tailored to any local service industry.',
      bullets: [
        'Google Business Profile (GBP) category & bio optimizer',
        'Ethical 5-star review reply generator',
        'JSON-LD LocalBusiness Schema code builder',
        'Geotargeted service page copy assistant',
      ],
    },
    {
      id: 'crm' as const,
      name: 'Client CRM & Pipeline Tracker',
      slug: 'crm',
      icon: Users,
      tagline: 'Never Lose Track of a Lead, Deal, or Retainer Client',
      description: 'A clean, intuitive CRM designed for local service businesses and agencies to organize contacts, track deal stages, record client notes, and monitor total pipeline value.',
      bullets: [
        'Visual pipeline stages (Lead, Proposal Sent, Negotiating, Client)',
        'Total pipeline revenue & deal value analytics',
        'Integrated meeting notes & client interaction history',
        'Project assignment & milestone tracking',
      ],
    },
    {
      id: 'invoice' as const,
      name: 'White-Label PDF Invoices',
      slug: 'invoicing',
      icon: FileSpreadsheet,
      tagline: 'Itemized Invoicing with Automated Tax & Payment Terms',
      description: 'Create professional invoices for one-time projects or recurring monthly retainers. Calculate state/local taxes automatically and download high-resolution PDF invoices.',
      bullets: [
        'Automated subtotal & local tax percentage calculation',
        'Custom payment terms (Net 15, Net 30, Due upon receipt)',
        'Invoice status tracking (Draft, Sent, Paid, Overdue)',
        'Branded white-label PDF generation with tax IDs',
      ],
    },
    {
      id: 'audit' as const,
      name: 'AI Business & Website Audit Engine',
      slug: 'ai-business-audit',
      icon: Globe,
      tagline: 'Instant Technical, On-Page & Local Competitive Audits for Any Domain',
      description: 'Audit client websites for title tag optimization, meta description length, mobile viewport readiness, SSL security, and receive prioritized AI recommendations.',
      bullets: [
        'Instant URL health & meta tag analysis',
        'Mobile viewport & SSL security checks',
        'Prioritized high-impact SEO action list',
        'Exportable client-facing SEO review summary',
      ],
    },
    {
      id: 'planner' as const,
      name: '30 & 90-Day Marketing Planner',
      slug: 'marketing-planner',
      icon: TrendingUp,
      tagline: 'Strategic Local Growth Calendars & Promotional Schedules',
      description: 'Build structured 30, 60, and 90-day growth strategies, campaign schedules, promotional offer calendars, and expected ROI benchmarks for local client niches.',
      bullets: [
        'Structured 30/60/90-day milestone roadmaps',
        'Local promotional campaign ideas & offer strategy',
        'Content & social media publication schedule',
        'KPI metrics & expected ROI benchmarks',
      ],
    },
  ];

  const currentModule = modules.find((m) => m.id === selectedModule)!;

  const navigateToFeature = (slug: string) => {
    window.history.pushState({}, '', `/features/${slug}`);
    setActiveTab(`feature_${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 py-12 px-6 max-w-7xl mx-auto font-sans bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-semibold font-heading uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#059669]" />
          <span>Full Product Suite</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">
          An End-to-End Operating System for Local Business Growth
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
          Locora AI provides specialized modules designed to streamline client intake, proposal writing, Google Business rankings, invoicing, and growth strategy.
        </p>
      </div>

      {/* Module Selector Navigation Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        {modules.map((m) => {
          const Icon = m.icon;
          const isSelected = m.id === selectedModule;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedModule(m.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Module Spotlight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-md items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#059669] rounded-full text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Feature Spotlight</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">
            {currentModule.name}
          </h2>

          <p className="text-sm font-bold text-[#059669]">
            {currentModule.tagline}
          </p>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            {currentModule.description}
          </p>

          <div className="space-y-2.5 pt-2">
            {currentModule.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-wrap gap-3 font-sans">
            <button
              onClick={() => navigateToFeature(currentModule.slug)}
              className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer font-heading"
            >
              <span>Explore {currentModule.name} Dedicated Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (user.isAuthenticated) {
                  setActiveTab('dashboard');
                } else {
                  setActiveTab('signup');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Start Free Workspace
            </button>
          </div>
        </div>

        {/* Live UI Mockup Card */}
        <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-slate-900 font-heading">Locora AI Engine</span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-[#059669] rounded font-mono font-bold border border-emerald-200">
              STATUS: READY
            </span>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Input Context</p>
              <p className="text-slate-800 font-medium">Business: Vance Plumbing & Heating (Austin, TX)</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2 shadow-2xs">
              <p className="text-[10px] text-[#059669] uppercase font-bold">AI Output Preview</p>
              <p className="text-slate-600 text-[11px] leading-relaxed italic">
                "Locora Copilot analyzed local Austin competition and generated 3 custom service packages ($1,500 - $3,200), itemizing emergency call-out landing pages and GBP local search schema."
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500 font-sans">
              Powered by Groq Ultra-Fast LPU & Multi-Model Switcher
            </p>
          </div>
        </div>
      </div>

      {/* Grid of All 9 Dedicated Product Pages */}
      <section className="space-y-8 pt-4">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Dedicated Product Deep-Dives
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Explore detailed feature guides, sample outputs, workflows, and automated deliverables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((feat) => (
            <div
              key={feat.slug}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-[#059669] hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-heading text-slate-900 group-hover:text-[#059669] transition-colors leading-snug">
                  {feat.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-sans">
                  {feat.heroSubheadline}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigateToFeature(feat.slug)}
                  className="text-xs font-bold text-slate-900 hover:text-[#059669] flex items-center gap-1.5 cursor-pointer font-heading"
                >
                  <span>Feature Overview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (user.isAuthenticated) {
                      setActiveTab(feat.targetTab);
                    } else {
                      navigateToFeature(feat.slug);
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-[#059669] text-emerald-800 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Explore Guide →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Software Stack Comparison Table */}
      <section className="space-y-8 pt-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900">
            Locora AI vs. Traditional Tool Stacks
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Stop paying $500+/month for 5 separate software subscriptions.
          </p>
        </div>

        <div className="overflow-x-auto bg-white border border-slate-200 rounded-3xl shadow-sm">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-800 font-heading">
                <th className="p-4 font-bold">Feature / Tool</th>
                <th className="p-4 font-bold text-[#059669]">Locora AI Copilot</th>
                <th className="p-4 font-bold text-slate-500">Traditional SaaS Stack</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="p-4 font-semibold text-slate-900">AI Proposal Generator</td>
                <td className="p-4 text-[#059669] font-bold">Included (Unlimited in Pro)</td>
                <td className="p-4 text-slate-500">PandaDoc / Proposify ($49/mo)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900">Local SEO & Schema Assistant</td>
                <td className="p-4 text-[#059669] font-bold">Included (JSON-LD Builder)</td>
                <td className="p-4 text-slate-500">BrightLocal / Surfer ($99/mo)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900">Client CRM Pipeline</td>
                <td className="p-4 text-[#059669] font-bold">Included (Unlimited Contacts)</td>
                <td className="p-4 text-slate-500">HubSpot / GoHighLevel ($97/mo)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900">PDF Invoices & Tax Calculations</td>
                <td className="p-4 text-[#059669] font-bold">Included (White-Label PDF)</td>
                <td className="p-4 text-slate-500">FreshBooks / QuickBooks ($35/mo)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900">Website SEO Auditor</td>
                <td className="p-4 text-[#059669] font-bold">Included (1-Click Audits)</td>
                <td className="p-4 text-slate-500">SEMrush / Ahrefs ($129/mo)</td>
              </tr>
              <tr className="bg-emerald-50/80 font-bold">
                <td className="p-4 text-slate-900">Total Monthly Cost</td>
                <td className="p-4 text-[#059669] text-sm">$0 Free / $29 Pro Growth</td>
                <td className="p-4 text-rose-600 text-sm">$409.00 / month</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <h3 className="text-2xl font-bold font-heading text-slate-900">Ready to test these features live?</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto font-sans">
          Start with 25 free monthly AI credits right now in your workspace. No credit card required.
        </p>
        <button
          onClick={() => {
            if (user.isAuthenticated) {
              setActiveTab('dashboard');
            } else {
              setActiveTab('signup');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer font-sans"
        >
          <span>Start Free Explorer Tier</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
