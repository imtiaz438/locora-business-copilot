import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LocoraLogo } from '../LocoraLogo';
import { OneTimeOffersSection } from '../OneTimeOffersSection';
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
  Calculator,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  DollarSign,
  Briefcase,
  Building2,
  MessageSquare,
  X,
  Search,
  AlertTriangle,
  Lock,
  ExternalLink,
  UserPlus,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { setActiveTab } = useApp();

  // Interactive Demo State
  const [activeDemoTab, setActiveDemoTab] = useState<'proposal' | 'seo' | 'crm' | 'invoice'>('proposal');

  // ROI Calculator State
  const [clientCount, setClientCount] = useState(8);
  const [proposalRate, setProposalRate] = useState(2500);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Quick Audit URL Input state & Modal State
  const [heroInputUrl, setHeroInputUrl] = useState('');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditTargetUrl, setAuditTargetUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawUrl = heroInputUrl.trim() || 'example-business.com';
    const cleanUrl = rawUrl.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    setAuditTargetUrl(cleanUrl);
    setIsAnalyzing(true);
    setIsAuditModalOpen(true);

    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1200);
  };
  const hoursSavedPerClient = 4;
  const totalHoursSaved = clientCount * hoursSavedPerClient;
  const estimatedAddedRevenue = clientCount * Math.round(proposalRate * 0.25);

  const faqs = [
    {
      q: 'How does Locora AI help local service businesses and agencies?',
      a: 'Locora AI consolidates all client operational tasks into one copilot workspace. Instead of using separate tools for proposals, CRM, Google Business SEO, invoice PDFs, and website audits, Locora AI auto-generates structured proposals, audits websites, manages lead pipelines, and builds local schema markup in seconds using multi-model AI.',
    },
    {
      q: 'Do I need a credit card to try Locora AI?',
      a: 'No! You can sign up for our Free Starter Plan with zero credit card required. You receive 25 complimentary AI copilot credits every month to generate proposals, SEO schemas, and website audits.',
    },
    {
      q: 'Can I white-label PDF proposals and invoices with my own business branding?',
      a: 'Yes! In your Business Settings, you can configure your custom logo, business address, currency, tax ID, and preferred brand colors. All exported PDF proposals, invoices, and audit documents include your white-label branding.',
    },
    {
      q: 'Which AI models power Locora AI?',
      a: 'Locora AI is powered by ultra-fast Groq LPUs (Meta Llama 3.3 70B & 3.1 8B) natively as the default engine, with flexible multi-provider switcher support for OpenAI (GPT-5.6 / 4o), Anthropic Claude 3.7 Sonnet, DeepSeek, Perplexity AI, and Google Gemini directly from your settings panel.',
    },
    {
      q: 'Is my client data private and secure?',
      a: 'Absolutely. We do not use your private client records, CRM data, or proposal contents to train public AI models. All data is encrypted in transit and at rest with strict SOC2-aligned privacy controls.',
    },
  ];

  return (
    <div className="space-y-24 pb-20 selection:bg-emerald-600 selection:text-white font-sans bg-slate-50">
      {/* 1. HERO SECTION BANNER */}
      <section className="relative bg-gradient-to-br from-[#022c22] via-[#044a36] to-[#011a13] text-white py-16 sm:py-24 px-6 sm:px-12 shadow-xl overflow-hidden">
        {/* Soft emerald ambient glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#047857]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#6ee7b7] text-xs font-semibold font-heading tracking-wider uppercase">
            <LocoraLogo assetType="hero" size={20} className="w-5 h-5" />
            <span>Locora Business Copilot for SMBs & Agencies</span>
          </div>

          {/* Main Title restored with original wording */}
          <h1 className="text-4xl sm:text-[56px] lg:text-[60px] font-bold font-heading text-white tracking-tight leading-[1.15]">
            <span className="text-amber-300">Search</span>, Win Deals & Scale Your <span className="text-[#6ee7b7]">Local Business</span> with AI
          </h1>

          {/* Subtitle restored with original wording */}
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-sans">
            Locora AI combines smart client CRM, high-converting proposals, Google Business SEO schemas, instant website audits, and white-label PDF invoices in one unified workspace.
          </p>

          {/* Focal Point: URL Input + CTA Group */}
          <form onSubmit={handleHeroSubmit} className="max-w-xl mx-auto pt-4">
            <div className="p-2 bg-white border border-emerald-300/30 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full pl-3 pr-2">
                <Globe className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={heroInputUrl}
                  onChange={(e) => setHeroInputUrl(e.target.value)}
                  placeholder="Enter business website or name (e.g. austindental.com)"
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-sans"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-full shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap font-sans cursor-pointer"
              >
                <span>Audit & Generate Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Hero Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('signup')}
              className="text-xs text-emerald-200 hover:text-white underline underline-offset-4 flex items-center gap-1.5 font-semibold font-sans cursor-pointer transition-colors"
            >
              <span>Or sign up with 25 free copilot credits</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#34d399]" />
            </button>
          </div>

          {/* Proof Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/80 font-sans font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34d399]" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34d399]" /> White-label PDF exports
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34d399]" /> Powered by Groq LPU & Multi-Model AI
            </span>
          </div>
        </div>
      </section>

      {/* Hero Interactive Workspace Preview Showcase */}
      <div className="-mt-12 max-w-5xl mx-auto px-6 relative z-20">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl">
          {/* Window Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs text-slate-400 font-mono">locora.ai/app/workspace</span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveDemoTab('proposal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeDemoTab === 'proposal' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AI Proposal
              </button>
              <button
                onClick={() => setActiveDemoTab('seo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeDemoTab === 'seo' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Local SEO
              </button>
              <button
                onClick={() => setActiveDemoTab('crm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeDemoTab === 'crm' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Client CRM
              </button>
              <button
                onClick={() => setActiveDemoTab('invoice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeDemoTab === 'invoice' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PDF Invoice
              </button>
            </div>
          </div>

          {/* Interactive Live Demo Preview Content */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 min-h-[320px] flex flex-col justify-between">
            {activeDemoTab === 'proposal' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#059669]" />
                    <span className="text-sm font-bold text-slate-900 font-heading">AI Proposal Draft #PR-2026</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                    Total Value: $4,500.00
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs shadow-2xs">
                  <p className="font-semibold text-slate-900">Client: Austin Dental Care (Sarah Jenkins)</p>
                  <p className="text-slate-600">
                    Scope of Work: 1) Google Business Profile optimization & 25 verified patient review replies. 2) Local service schema JSON-LD implementation. 3) Emergency appointment landing page with AI quote widget.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 font-sans">
                  <span className="text-slate-500">Generated in 0.8 seconds via Groq LPU (Llama 3.3)</span>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="text-[#059669] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Test Proposal Builder in App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeDemoTab === 'seo' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-900 font-heading">Local Business Schema & GBP Reply Assistant</span>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-full text-xs font-bold border border-indigo-200">
                    Schema JSON-LD Ready
                  </span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-2xs">
                  <p>&#123;</p>
                  <p className="pl-4">"@context": "https://schema.org",</p>
                  <p className="pl-4">"@type": "Dentist",</p>
                  <p className="pl-4">"name": "Austin Dental Care",</p>
                  <p className="pl-4">"telephone": "+1-512-888-1234",</p>
                  <p className="pl-4">"priceRange": "$$"</p>
                  <p>&#125;</p>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 font-sans">
                  <span className="text-slate-500">Google Business Search Rank Target: #1 - #3 Local Pack</span>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="text-[#059669] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Generate Local Schema in App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeDemoTab === 'crm' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-bold text-slate-900 font-heading">Client CRM Pipeline</span>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
                    3 Active Deals ($13,700 Total)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase font-heading">Lead Stage</span>
                    <p className="font-semibold text-slate-900">Rostova Law Group</p>
                    <p className="text-slate-500 text-[11px]">$6,000 Potential</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs">
                    <span className="text-[10px] text-amber-600 font-bold uppercase font-heading">Proposal Sent</span>
                    <p className="font-semibold text-slate-900">Vance Plumbing</p>
                    <p className="text-slate-500 text-[11px]">$3,200 Retainer</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase font-heading">Active Client</span>
                    <p className="font-semibold text-slate-900">Austin Dental Care</p>
                    <p className="text-slate-500 text-[11px]">$4,500 Paid</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 font-sans">
                  <span className="text-slate-500">Track client status from lead to paid retainer</span>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="text-[#059669] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage CRM in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeDemoTab === 'invoice' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm font-bold text-slate-900 font-heading">Itemized Invoice #INV-2026-001</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                    Paid • $2,706.25
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs shadow-2xs">
                  <div className="flex justify-between border-b border-slate-100 pb-2 font-semibold text-slate-900">
                    <span>Local SEO Retainer & GBP Optimization</span>
                    <span>$1,500.00</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2 font-semibold text-slate-900">
                    <span>AI Patient Assistant Setup</span>
                    <span>$1,000.00</span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-500">
                    <span>Tax (8.25%)</span>
                    <span>$206.25</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 font-sans">
                  <span className="text-slate-500">1-Click PDF Export with business logo</span>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="text-[#059669] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Create Invoice in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATS & PROOF COUNTERS */}
      <section className="py-12 bg-white border-y border-slate-200 px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center font-sans">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black font-heading text-slate-900">$4.8M+</p>
            <p className="text-xs text-slate-500 font-medium">Proposal Revenue Closed</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black font-heading text-[#059669]">1,200+</p>
            <p className="text-xs text-slate-500 font-medium">Agencies & Service Businesses</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black font-heading text-slate-900">10x</p>
            <p className="text-xs text-slate-500 font-medium">Faster Operations Workflow</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black font-heading text-[#d97706]">4.9 / 5</p>
            <p className="text-xs text-slate-500 font-medium">Average Client Satisfaction</p>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURE PILLARS */}
      <section className="px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-semibold border border-emerald-200">
            <Zap className="w-3.5 h-3.5 text-[#059669]" />
            <span>Built Specifically for Local Business Operations</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-heading text-slate-900 tracking-tight">
            Replace 6 Costly SaaS Subscriptions
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto font-sans">
            Everything your agency or local business needs to win deals, manage client leads, run SEO campaigns, and issue invoices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all space-y-4 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900">1. AI Proposal Generator</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Transform scope inquiries into tailored, professional business proposals. Includes itemized pricing breakdown, timelines, deliverables, and total contract terms.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all space-y-4 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900">2. Local SEO & Schema Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Generate Google Business Profile descriptions, verified review replies, local service landing page copy, and JSON-LD schema markup for local rankings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all space-y-4 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900">3. Client CRM & Pipeline Tracker</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Organize leads, track proposal pipeline values, record meeting notes, and manage active client project tasks from lead intake to retainer renewal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all space-y-4 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900">4. White-Label PDF Invoices</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Issue branded invoices with custom tax rates, due dates, itemized services, payment terms, and instant clean PDF downloading for clients.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all space-y-4 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900">5. Instant Website SEO Auditor</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Audit client websites for title tags, meta descriptions, SSL security status, mobile readiness, and generate actionable SEO improvement plans.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all space-y-4 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900">6. 30/90-Day Marketing Planner</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Create structured growth roadmaps, promotional schedules, content calendars, and campaign targets tailored to specific local industries.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE ROI CALCULATOR */}
      <section className="px-6 max-w-5xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 space-y-8 shadow-md">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-semibold border border-emerald-200">
            <Calculator className="w-3.5 h-3.5 text-[#059669]" />
            <span>Interactive ROI Calculator</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900">
            Calculate Your Agency Time & Revenue Impact
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-sans">
            See how much time and additional revenue your team can unlock by automating client operations with Locora AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 items-center">
          {/* Sliders */}
          <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="space-y-2 font-sans">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Active Monthly Clients / Leads</span>
                <span className="text-[#059669] font-bold">{clientCount} Clients</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={clientCount}
                onChange={(e) => setClientCount(Number(e.target.value))}
                className="w-full accent-[#059669] bg-slate-200 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div className="space-y-2 font-sans">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Average Proposal / Retainer Value</span>
                <span className="text-[#059669] font-bold">${proposalRate.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={proposalRate}
                onChange={(e) => setProposalRate(Number(e.target.value))}
                className="w-full accent-[#059669] bg-slate-200 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>

          {/* Calculated Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 text-center space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black font-heading text-slate-900">{totalHoursSaved} Hours</p>
              <p className="text-xs text-slate-600 font-medium font-sans">Saved Every Month</p>
            </div>

            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 text-center space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto">
                <DollarSign className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black font-heading text-[#059669]">
                +${estimatedAddedRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 font-medium font-sans">Estimated Extra Revenue</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900">
            3 Steps to Automating Client Growth
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-sans">
            From initial lead contact to signed proposal and monthly retainer management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-3 relative shadow-sm">
            <span className="w-8 h-8 rounded-full bg-[#059669] text-white font-bold text-xs flex items-center justify-center font-heading">
              1
            </span>
            <h3 className="text-base font-bold font-heading text-slate-900">Enter Client & Business Details</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Add your client's business name, contact person, industry, and project goals into the CRM or Proposal generator.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-3 relative shadow-sm">
            <span className="w-8 h-8 rounded-full bg-[#059669] text-white font-bold text-xs flex items-center justify-center font-heading">
              2
            </span>
            <h3 className="text-base font-bold font-heading text-slate-900">Generate Structured AI Assets</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Locora's Copilot builds tailored proposals, itemized invoices, Google Business SEO descriptions, or local schema code in seconds.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-3 relative shadow-sm">
            <span className="w-8 h-8 rounded-full bg-[#059669] text-white font-bold text-xs flex items-center justify-center font-heading">
              3
            </span>
            <h3 className="text-base font-bold font-heading text-slate-900">Export PDF & Track Revenue</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Export clean white-label PDF contracts and invoices directly to clients, tracking deal progression in your pipeline.
            </p>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-500" />
            ))}
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900">
            Loved by 1,200+ Agencies & Local Service Teams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
            <p className="text-xs text-slate-700 italic leading-relaxed font-sans">
              "Locora AI allowed us to send out 15 proposal drafts in a single afternoon. Our proposal win rate increased by 40% because of the clear deliverables and professional cost breakdowns!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-xs">
                MS
              </div>
              <div className="font-sans">
                <p className="text-xs font-bold text-slate-900">Marcus Sterling</p>
                <p className="text-[11px] text-slate-500">Founder, Sterling Local Growth (Austin, TX)</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
            <p className="text-xs text-slate-700 italic leading-relaxed font-sans">
              "The Local SEO schema generator and Google Business Profile reply assistant alone save my team 10 hours a week. It pays for itself within the first hour of every month."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                ER
              </div>
              <div className="font-sans">
                <p className="text-xs font-bold text-slate-900">Elena Rostova</p>
                <p className="text-[11px] text-slate-500">Director of SEO, Apex Digital Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6.5 À LA CARTE ONE-TIME PURCHASES & GROWTH ACCELERATORS */}
      <section className="px-6 max-w-7xl mx-auto py-4">
        <OneTimeOffersSection />
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="px-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2 font-sans">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-600">Everything you need to know about Locora AI and plans.</p>
        </div>

        <div className="space-y-3 font-sans">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between font-semibold text-xs sm:text-sm text-slate-800 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#059669]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FINAL CTA BOX */}
      <section className="px-6 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 bg-white border border-emerald-200 rounded-3xl text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-bold font-heading text-slate-900 tracking-tight">
            Ready to Automate Your Business Operations?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-sans">
            Get started today with 25 free AI copilot credits or upgrade to Pro Growth for 500 AI credits/mo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('signup')}
              className="w-full sm:w-auto px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer font-sans"
            >
              Get Started Free Today
            </button>
            <button
              onClick={() => setActiveTab('pricing_public')}
              className="w-full sm:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans"
            >
              View Pricing Tiers
            </button>
          </div>
        </div>
      </section>

      {/* QUICK WEBSITE AUDIT REPORT POPUP MODAL */}
      {isAuditModalOpen && (
        <div
          onClick={() => setIsAuditModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative font-sans max-h-[88vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#059669] flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 leading-snug">
                      Quick Website SEO & Audit Report
                    </h3>
                    {isAnalyzing ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        Analyzing...
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-[#059669] text-[10px] font-bold rounded-full border border-emerald-200">
                        Basic Scan Complete
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Domain: <strong className="text-slate-800">{auditTargetUrl || 'example.com'}</strong>
                  </p>
                </div>
              </div>

              {/* Top Close Button */}
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex-shrink-0"
                title="Close Audit Report"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto pr-1 pt-4 space-y-5 flex-1 custom-scrollbar">
              {isAnalyzing ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-10 h-10 border-3 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Scanning meta tags, SSL certificate, mobile responsiveness & local schema...
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Score Overview Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-center space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">SEO Score</span>
                      <p className="text-xl font-black font-heading text-[#059669]">74/100</p>
                      <span className="text-[9px] text-emerald-800 font-bold">Grade B (Good)</span>
                    </div>

                    <div className="p-2.5 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl text-center space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Speed Score</span>
                      <p className="text-xl font-black font-heading text-indigo-700">88/100</p>
                      <span className="text-[9px] text-indigo-800 font-bold">1.4s Load</span>
                    </div>

                    <div className="p-2.5 bg-cyan-50/60 border border-cyan-200/80 rounded-2xl text-center space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Mobile UI</span>
                      <p className="text-xl font-black font-heading text-cyan-700">92%</p>
                      <span className="text-[9px] text-cyan-800 font-bold">Responsive</span>
                    </div>

                    <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-center space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Local Schema</span>
                      <p className="text-xl font-black font-heading text-amber-700">Missing</p>
                      <span className="text-[9px] text-amber-800 font-bold">Action Needed</span>
                    </div>
                  </div>

                  {/* Technical Diagnostic Findings */}
                  <div className="space-y-2.5">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-heading">
                      Basic Diagnostic Summary
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-800">SSL Security & HTTPS Certificate</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Secure
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-800">Title & Meta Description Optimization</span>
                        <span className="text-amber-700 font-bold flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Needs Local Keywords
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-800">Google Business Profile Schema (JSON-LD)</span>
                        <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px]">
                          <X className="w-3.5 h-3.5 text-rose-600" /> Not Detected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Opportunities */}
                  <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-900 font-heading">Top 3 Quick Wins for {auditTargetUrl}:</p>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      <li>Inject JSON-LD LocalBusiness schema markup to rank in Google Map Packs.</li>
                      <li>Optimize H1 tags with primary city location + local service keywords.</li>
                      <li>Implement automated review reply automation for customer feedback.</li>
                    </ul>
                  </div>

                  {/* Lock Box asking for Account Creation for detailed info */}
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-[#022c22] to-[#044a36] text-white rounded-2xl space-y-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs sm:text-sm font-bold font-heading text-emerald-200">
                        Unlock Full Detailed Audit Report & AI Copilot Fixes
                      </h4>
                    </div>
                    <p className="text-[11px] text-emerald-100/90 leading-relaxed font-sans">
                      Create a free account to access detailed competitor benchmarking, step-by-step technical SEO fixes, automated schema builder, and white-label PDF audit export.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                      <button
                        onClick={() => {
                          setIsAuditModalOpen(false);
                          setActiveTab('signup');
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Create Free Account for Full Details</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsAuditModalOpen(false);
                          setActiveTab('login');
                        }}
                        className="text-xs text-emerald-200 hover:text-white underline font-semibold cursor-pointer py-1"
                      >
                        Already registered? Sign In
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with explicit Close / Cancel option */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between flex-shrink-0 text-xs">
              <span className="text-slate-400 text-[11px]">Free instant audit scanner</span>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
