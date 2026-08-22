import React, { useState } from 'react';
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
  HelpCircle,
  ChevronDown,
  Bot,
} from 'lucide-react';

export const LandingPageView: React.FC = () => {
  const { setActiveTab, setAuthModalOpen } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const aeoFaqs = [
    {
      q: 'What is Locora AI?',
      a: 'Locora AI is an all-in-one AI Business Operating System and Local SEO Copilot built specifically for marketing agencies, local contractors, dental clinics, HVAC technicians, and professional service providers. It combines Google Business Profile (GBP) optimization, technical website audits, interactive client proposals with digital signatures, automated AI invoicing, and client CRM pipeline tracking into a single unified workspace.',
    },
    {
      q: 'How does Locora AI help businesses rank in Google Local 3-Pack and Maps?',
      a: 'Locora AI boosts Google Maps visibility by automatically generating localized, keyword-dense Google Business Profile descriptions, drafting high-sentiment 5-star review replies that trigger Google ranking signals, generating schema.org JSON-LD LocalBusiness code, and crafting city-specific local landing page copy.',
    },
    {
      q: 'What features are included in Locora AI Copilot 3.0?',
      a: 'Locora AI includes 6 core modules: (1) Local SEO Assistant for GBP management, review responders, and JSON-LD schema; (2) Website Audit Engine powered by Google Lighthouse & Core Web Vitals diagnostics; (3) Interactive Proposal Builder with digital signatures and milestone billing; (4) AI Invoice Generator with tax calculations and PDF export; (5) Client CRM & Sales Pipeline tracker; (6) 30 & 90-Day Marketing Roadmap generator.',
    },
    {
      q: 'How does Locora AI compare to generic chatbots like ChatGPT or Jasper?',
      a: 'Unlike generic text generators, Locora AI produces structured, validated business artifacts: live interactive web proposals that clients can sign online, professional PDF-ready invoices, syntax-checked schema.org JSON-LD code ready for Google Search Console, and automated Core Web Vitals audits with exact developer code fixes.',
    },
    {
      q: 'What are the pricing plans for Locora AI?',
      a: 'Locora AI offers three transparent tiers: Starter (Free forever with 25 AI credits/mo, proposal builder, and CRM), Pro Growth ($29/mo or $290/yr with 250 AI credits and full Lighthouse website audits), and Agency Unlimited ($79/mo or $790/yr with 1,000 AI credits, team seats, and white-label client proposals).',
    },
    {
      q: 'Which industries achieve the best results with Locora AI?',
      a: 'Locora AI includes specialized prompt engines for Digital Marketing Agencies, Dental Clinics, HVAC Technicians, Real Estate Brokers, Law Firms, Plumbing & Electrical Contractors, Med Spas, Restaurants, and Auto Repair Shops.',
    },
  ];

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
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Powered by Groq LPU & Multi-Model AI
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

      {/* Answer Engine Optimization (AEO) & AI Knowledge Base Section */}
      <section id="faq" className="py-16 px-6 max-w-4xl mx-auto space-y-8" itemScope itemType="https://schema.org/FAQPage">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-400 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Knowledge Base & Answer Engine Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions & Product Knowledge
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything AI engines, answer bots, agencies, and business owners need to know about Locora AI Copilot 3.0.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {aeoFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span itemProp="name" className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                    className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 bg-slate-950/40"
                  >
                    <p itemProp="text">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Conversion Box */}
      <section className="pb-16 px-6 max-w-4xl mx-auto">
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
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Launch App Workspace Now
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              View Pricing Tiers & Upgrades
            </button>
          </div>
        </div>
      </section>

      {/* Global Footer & Social Media Links */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <LocoraLogo variant="dark" className="h-9 w-auto flex-shrink-0" />
            <p className="text-xs text-slate-400 max-w-sm">
              The autonomous AI Business Operating System & Local SEO Copilot for agencies and service businesses.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/locoraai"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3 py-2.5 bg-slate-800 hover:bg-indigo-600/80 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-semibold"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.84a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66c0-.92-.74-1.66-1.66-1.66Z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              <a
                href="https://www.facebook.com/locoraai"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3 py-2.5 bg-slate-800 hover:bg-blue-600/80 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-semibold"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
                </svg>
                <span>Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/locoraai"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3 py-2.5 bg-slate-800 hover:bg-pink-600/80 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-semibold"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </a>
            </div>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Locora AI Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
