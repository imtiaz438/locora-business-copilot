import React from 'react';
import { useApp } from '../context/AppContext';
import { LocoraLogo } from './LocoraLogo';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  MapPin,
  Globe,
  Users,
  CheckCircle2,
  Star,
  Play,
} from 'lucide-react';

export const LandingPageView: React.FC = () => {
  const { setActiveTab, setAuthModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Marketing Nav */}
      <nav className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <LocoraLogo variant="dark" className="h-10 w-auto flex-shrink-0" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('pricing')}
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
          >
            Pricing & Plans
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <span>Launch App Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-6xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold animate-pulse">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>The All-in-One AI Copilot for Local Business & Agency Operations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Close More Deals, Auto-Generate SEO & Scale Your Business Revenue with AI
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Locora AI combines smart CRM lead management, high-converting AI proposals, PDF invoices, Local Google Business Profile SEO, and instant website reviews in one unified workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Try Locora AI Free (25 Credits Included)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Explore Pro Plans & Pricing</span>
          </button>
        </div>

        {/* Proof Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required for Starter
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> White-label PDF exports included
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Powered by Gemini & Multi-Model AI
          </span>
        </div>
      </section>

      {/* Core Feature Matrix Showcase */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Everything Your Agency Needs to Win Clients & Deliver Results
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Replace 5 separate SaaS tools with one intuitive copilot platform built specifically for local growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">AI Proposal & Contract Generator</h3>
              <p className="text-xs text-slate-400">
                Turn scope requests into tailored, professional business proposals with scope of work, timeline, deliverables, and total pricing.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Local SEO & Schema Assistant</h3>
              <p className="text-xs text-slate-400">
                Generate high-ranking Google Business Profile descriptions, review replies, Q&As, local landing pages, and JSON-LD schema markup.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">One-Click PDF Invoicing</h3>
              <p className="text-xs text-slate-400">
                Generate branded itemized invoices with tax calculation, payment terms, status tracking, and instant downloadable PDF exports.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Website Review & Audit Engine</h3>
              <p className="text-xs text-slate-400">
                Audit client websites for title tags, description metas, mobile viewports, SSL status, and actionable SEO recommendations.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Client CRM & Pipeline Tracker</h3>
              <p className="text-xs text-slate-400">
                Organize leads from initial contact to proposal sent and active client status with total pipeline value tracking.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">30 & 90-Day Marketing Roadmaps</h3>
              <p className="text-xs text-slate-400">
                Create structured growth strategies, campaign schedules, promotional calendars, and expected ROI benchmarks for clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial & Social Proof */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-white">Trusted by 1,200+ Agencies & Business Owners</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <p className="text-xs text-slate-300 italic">
              "Locora AI allowed us to send out 15 proposal drafts in a single afternoon. Our proposal win rate increased by 40% because of the clear deliverables and professional breakdown!"
            </p>
            <div>
              <p className="text-xs font-bold text-white">Marcus Sterling</p>
              <p className="text-[11px] text-slate-500">Founder, Sterling Local Growth (Austin, TX)</p>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <p className="text-xs text-slate-300 italic">
              "The Local SEO schema generator and Google Business Profile reply assistant alone save my team 10 hours a week. It pays for itself within the first hour of every month."
            </p>
            <div>
              <p className="text-xs font-bold text-white">Elena Rostova</p>
              <p className="text-[11px] text-slate-500">Director of SEO, Apex Digital Solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Conversion Box */}
      <section className="pb-20 px-6 max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-3xl text-center space-y-6 shadow-2xl shadow-indigo-600/20">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Automate Operations & Monetize Your Business?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Get started today with 25 free monthly AI copilot credits or upgrade to Pro Growth for 250 AI credits/mo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Launch App Workspace Now
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
            >
              View Pricing Tiers & Upgrades
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
