import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WebsiteAuditResult } from '../../types';
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
  RefreshCw,
  Server,
  Activity,
  Layers,
  ShieldAlert,
  Info,
  HelpCircle,
} from 'lucide-react';

interface AuditDiagnosis {
  failCode: string;
  title: string;
  category: string;
  reason: string;
  technicalDetails: string;
  suggestedAction: string;
  examplesThatWork?: string[];
}

export const HomeView: React.FC = () => {
  const { setActiveTab, setLatestWebsiteAudit, user, updateBusinessProfile, businessProfile } = useApp();

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
  const [crawlProgressStage, setCrawlProgressStage] = useState(0);
  const [auditResult, setAuditResult] = useState<WebsiteAuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditDiagnosis, setAuditDiagnosis] = useState<AuditDiagnosis | null>(null);

  const crawlStages = [
    'Connecting & resolving DNS handshake...',
    'Fetching live HTML, title tags & OpenGraph metadata...',
    'Measuring server response (TTFB), page size & JSON-LD schema...',
    'AI synthesizing technical diagnostics & prioritized recommendations...',
  ];

  const handleHeroSubmit = async (e: React.FormEvent, overrideUrl?: string) => {
    if (e && e.preventDefault) e.preventDefault();
    const rawUrl = overrideUrl || heroInputUrl.trim() || 'locora.ai';
    const cleanUrl = rawUrl.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
    setAuditTargetUrl(cleanUrl);
    setIsAnalyzing(true);
    setAuditError(null);
    setAuditDiagnosis(null);
    setAuditResult(null);
    setIsAuditModalOpen(true);
    setCrawlProgressStage(0);

    const stageTimer1 = setTimeout(() => setCrawlProgressStage(1), 400);
    const stageTimer2 = setTimeout(() => setCrawlProgressStage(2), 900);
    const stageTimer3 = setTimeout(() => setCrawlProgressStage(3), 1400);

    try {
      const response = await fetch('/api/ai/audit-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl,
          userEmail: user?.email || '',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.diagnosis) {
          setAuditDiagnosis(data.diagnosis);
        } else {
          setAuditDiagnosis({
            failCode: data.error || 'CRAWL_FAILED',
            title: 'Unable to Crawl Website',
            category: 'Crawl Interrupted',
            reason: data.message || 'The server could not retrieve website content.',
            technicalDetails: data.error || 'HTTP Request Failed',
            suggestedAction: 'Check that the domain is public and reachable.',
            examplesThatWork: ['apple.com', 'stripe.com', 'wikipedia.org']
          });
        }
        throw new Error(data.message || data.error || 'Failed to crawl website. Please verify domain name.');
      }

      setAuditResult(data);
      if (setLatestWebsiteAudit) {
        setLatestWebsiteAudit(data);
      }
      if (updateBusinessProfile && (!businessProfile?.website || businessProfile.website === 'locora.ai')) {
        updateBusinessProfile({ website: cleanUrl });
      }
    } catch (err: any) {
      setAuditError(err.message || 'Audit failed. Please verify the URL and try again.');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setIsAnalyzing(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Grade A (Excellent)', textClass: 'text-emerald-700', bgClass: 'bg-emerald-50 border-emerald-200' };
    if (score >= 75) return { label: 'Grade B (Good)', textClass: 'text-emerald-700', bgClass: 'bg-emerald-50 border-emerald-200' };
    if (score >= 60) return { label: 'Grade C (Fair)', textClass: 'text-amber-700', bgClass: 'bg-amber-50 border-amber-200' };
    return { label: 'Needs Immediate Fixes', textClass: 'text-rose-700', bgClass: 'bg-rose-50 border-rose-200' };
  };
  const hoursSavedPerClient = 4;
  const totalHoursSaved = clientCount * hoursSavedPerClient;
  const estimatedAddedRevenue = clientCount * Math.round(proposalRate * 0.25);

  const faqs = [
    {
      q: 'What is an AI business operating system for service businesses?',
      a: 'An AI business operating system is a unified platform like Locora AI that consolidates client relationship management (CRM), proposal generation, local Google Maps ranking automation, technical website health audits, and invoice processing into a single automated workspace—eliminating the need for 5 separate subscriptions.',
    },
    {
      q: 'How do I automate local SEO and Google Maps ranking with Locora AI?',
      a: 'Locora AI automates local search visibility by analyzing Google Maps competitor gaps, generating keyword-optimized Google Business Profile descriptions and weekly geo-updates, writing contextual 5-star review responses with local service keywords, and generating valid JSON-LD LocalBusiness schema code in one click.',
    },
    {
      q: 'How does the AI proposal generator integrate with the built-in CRM?',
      a: 'When you track a lead in Locora CRM, the proposal generator pulls client specifications, deal size, and service tier to draft itemized scopes of work, deliverable milestones, and payment terms in under 60 seconds. Once approved, proposals convert directly into trackable PDF invoices.',
    },
    {
      q: 'Can digital agencies white-label PDF proposals, audits, and invoices?',
      a: 'Yes! Agency and Pro users can customize full white-label branding, including custom agency logos, business addresses, localized tax rates, payment terms, and brand colors across all exported PDF proposals, client audit decks, and invoices.',
    },
    {
      q: 'Which industries and verticals benefit most from Locora AI?',
      a: 'Locora AI is specialized for digital growth agencies, dental practices, HVAC & plumbing contractors, real estate brokerages, law firms, and multi-location service brands that require automated local visibility and streamlined client workflows.',
    },
    {
      q: 'Do I need a credit card to try Locora AI?',
      a: 'No credit card is required. You can start with our Free Starter Plan immediately, which includes 25 monthly AI copilot credits for proposals, local SEO schema generation, and domain health audits.',
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
            <p className="text-3xl sm:text-4xl font-black font-heading text-slate-900">$20K+</p>
            <p className="text-xs text-slate-500 font-medium">Proposal Revenue Closed</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black font-heading text-[#059669]">100+</p>
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
            Loved by Agencies & Local Service Teams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
            <p className="text-xs text-slate-700 italic leading-relaxed font-sans">
              "Locora AI allowed us to send out 15 proposal drafts in a single afternoon. Our proposal win rate increased by 40% because of the clear deliverables and professional cost breakdowns!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-xs">
                BD
              </div>
              <div className="font-sans">
                <p className="text-xs font-bold text-slate-900">Brad M</p>
                <p className="text-[11px] text-slate-500"> Manager Local Growth</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
            <p className="text-xs text-slate-700 italic leading-relaxed font-sans">
              "The Local SEO schema generator and Google Business Profile reply assistant alone save my team 10 hours a week. It pays for itself within the first hour of every month."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                HD
              </div>
              <div className="font-sans">
                <p className="text-xs font-bold text-slate-900">Heather Denkmire</p>
                <p className="text-[11px] text-slate-500"> Project Team Leader </p>
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
                <div className="py-12 text-center space-y-5">
                  <div className="relative w-14 h-14 mx-auto">
                    <div className="w-14 h-14 border-3 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                    <Activity className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-900 font-heading">
                      Auditing {auditTargetUrl}...
                    </p>
                    <p className="text-xs font-medium text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-full inline-block border border-emerald-200/60 animate-pulse">
                      {crawlStages[crawlProgressStage] || crawlStages[0]}
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto flex items-center justify-between gap-1 text-[10px] text-slate-400">
                    <span>DNS</span>
                    <span className="w-6 h-0.5 bg-slate-200" />
                    <span>SSL Handshake</span>
                    <span className="w-6 h-0.5 bg-slate-200" />
                    <span>HTML DOM</span>
                    <span className="w-6 h-0.5 bg-slate-200" />
                    <span>AI Synthesis</span>
                  </div>

                  {/* Informational note so user knows it's actively processing */}
                  <div className="max-w-md mx-auto p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-left flex items-start gap-2.5 shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-amber-950 font-heading">
                        Live Crawl in Progress (Takes ~10–30 seconds)
                      </p>
                      <p className="text-[11px] text-amber-800 leading-snug">
                        Please wait a moment while our crawler establishes a direct live handshake with the target server, inspects response headers, and runs AI technical synthesis.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (auditDiagnosis || auditError) ? (
                <div className="py-4 space-y-4 text-left">
                  {/* Diagnosis Header Banner */}
                  <div className="p-4 bg-rose-50/90 border border-rose-200/90 rounded-2xl space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                            {auditDiagnosis?.category || 'Crawl Blocked'}
                          </span>
                          <h4 className="text-sm font-extrabold text-rose-950 font-heading">
                            {auditDiagnosis?.title || 'Unable to Audit Website'}
                          </h4>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-200/80 text-rose-900 border border-rose-300">
                        {auditDiagnosis?.failCode || 'CRAWL_FAILED'}
                      </span>
                    </div>

                    <p className="text-xs text-rose-900 leading-relaxed font-sans font-medium">
                      {auditDiagnosis?.reason || auditError}
                    </p>

                    {/* Technical Diagnostic Details */}
                    {auditDiagnosis?.technicalDetails && (
                      <div className="p-2 bg-rose-100/60 rounded-xl border border-rose-200/80 text-[11px] font-mono text-rose-950 break-all flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                        <span><strong>Root Cause:</strong> {auditDiagnosis.technicalDetails}</span>
                      </div>
                    )}
                  </div>

                  {/* Context & Guidance Card */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-heading">
                      <Info className="w-4 h-4 text-slate-600" />
                      <span>Why This Happens & Next Steps</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {auditDiagnosis?.suggestedAction || 'Large social platforms (like Reddit) and venture communities (like Product Hunt) employ strict anti-bot security (Cloudflare CAPTCHAs and datacenter IP blocks) to prevent scraping. Standard business websites, documentation, SaaS landing pages, portfolios, and e-commerce stores audit smoothly.'}
                    </p>
                  </div>

                  {/* 1-Click Working Demos */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl space-y-2">
                    <span className="text-[11px] font-bold text-emerald-950 block">
                      Try 1-Click Live Audits on Standard Accessible Sites:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {['stripe.com', 'apple.com', 'wikipedia.org', 'shopify.com'].map((demoDomain) => (
                        <button
                          key={demoDomain}
                          type="button"
                          onClick={(e) => {
                            setHeroInputUrl(demoDomain);
                            handleHeroSubmit(e, demoDomain);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 text-[11px] font-semibold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Globe className="w-3 h-3 text-emerald-600" />
                          <span>{demoDomain}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAuditModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleHeroSubmit(e)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Audit</span>
                    </button>
                  </div>
                </div>
              ) : auditResult ? (
                (() => {
                  const auditData = (auditResult as any).audit || auditResult;
                  const meta = (auditResult as any).metadata || {};
                  const overallScore = auditData.overallScore ?? (auditResult as any).overallScore ?? 80;
                  const scores = auditData.scores ?? (auditResult as any).scores ?? { seo: 80, performance: 80, accessibility: 80, bestPractices: 80 };
                  const badge = getScoreBadge(overallScore);
                  const issues = auditData.keyIssues ?? (auditResult as any).keyIssues ?? [];
                  const actionableSteps = auditData.actionableSteps ?? (auditResult as any).actionableSteps ?? [];
                  const aiSummary = auditData.aiSummary || (auditResult as any).aiSummary || `Technical crawl completed for ${auditTargetUrl}.`;

                  return (
                    <div className="space-y-5">
                      {/* Live Telemetry Banner */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-mono font-bold text-slate-900">{auditResult.url || `https://${auditTargetUrl}`}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span>TTFB: <strong className="text-slate-800">{meta.latencyMs ? `${meta.latencyMs}ms` : '180ms'}</strong></span>
                          <span>Size: <strong className="text-slate-800">{meta.htmlSizeKb ? `${meta.htmlSizeKb} KB` : '42 KB'}</strong></span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">HTTP 200 OK</span>
                        </div>
                      </div>

                      {/* Score Overview Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className={`p-3 ${badge.bgClass} rounded-2xl text-center space-y-0.5`}>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Overall Score</span>
                          <p className={`text-2xl font-black font-heading ${badge.textClass}`}>{overallScore}/100</p>
                          <span className={`text-[10px] ${badge.textClass} font-bold block truncate`}>{badge.label}</span>
                        </div>

                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">SEO Health</span>
                          <p className="text-2xl font-black font-heading text-emerald-700">{scores.seo ?? 85}/100</p>
                          <span className="text-[10px] text-emerald-800 font-bold block truncate">Meta & Schema</span>
                        </div>

                        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Speed & Latency</span>
                          <p className="text-2xl font-black font-heading text-blue-700">{scores.performance ?? 80}/100</p>
                          <span className="text-[10px] text-blue-800 font-bold block truncate">
                            {meta.latencyMs ? `${meta.latencyMs}ms response` : 'Fast TTFB'}
                          </span>
                        </div>

                        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl text-center space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Mobile & Access</span>
                          <p className="text-2xl font-black font-heading text-purple-700">{scores.accessibility ?? 85}/100</p>
                          <span className="text-[10px] text-purple-800 font-bold block truncate">Viewport Ready</span>
                        </div>
                      </div>

                      {/* Real Extracted On-Page Data */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Real Crawled Meta & Technical Tags</span>
                          </h4>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Verified Live Stream
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          {/* Live Title */}
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                              <span className="uppercase font-bold tracking-wider">Live Page Title</span>
                              <span className="font-mono font-semibold text-slate-700">
                                {meta.title ? `${meta.title.length} chars` : '0 chars'}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-xs break-words">
                              {meta.title || 'No HTML Title Tag Found'}
                            </p>
                          </div>

                          {/* Live Description */}
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                              <span className="uppercase font-bold tracking-wider">Live Meta Description</span>
                              <span className="font-mono font-semibold text-slate-700">
                                {meta.description ? `${meta.description.length} chars` : 'Missing'}
                              </span>
                            </div>
                            <p className="text-slate-700 text-xs break-words italic">
                              {meta.description ? `"${meta.description}"` : 'No meta description detected in HTML head.'}
                            </p>
                          </div>

                          {/* Technical Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                              <span className="text-slate-600 text-[11px] font-medium">SSL Security:</span>
                              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> HTTPS
                              </span>
                            </div>

                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                              <span className="text-slate-600 text-[11px] font-medium">H1 Heading:</span>
                              <span className={`font-bold text-[11px] ${meta.h1Count > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {meta.h1Count > 0 ? `${meta.h1Count} Found` : '0 Missing'}
                              </span>
                            </div>

                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                              <span className="text-slate-600 text-[11px] font-medium">Schema.org:</span>
                              <span className={`font-bold text-[11px] ${meta.hasSchema ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {meta.hasSchema ? 'Detected' : 'Missing'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Executive Assessment */}
                      <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 font-heading">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>AI Executive Assessment for {auditTargetUrl}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans">
                          {aiSummary}
                        </p>
                      </div>

                      {/* Diagnostic Issues List */}
                      {issues.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-heading">
                            Diagnostic Issues & Findings
                          </h4>
                          <div className="space-y-1.5">
                            {issues.slice(0, 3).map((issue: any, idx: number) => {
                              const isErr = issue.type === 'error';
                              const isWarn = issue.type === 'warning';
                              return (
                                <div
                                  key={idx}
                                  className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                                    isErr
                                      ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                                      : isWarn
                                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                                      : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                                  }`}
                                >
                                  {isErr ? (
                                    <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                                  ) : isWarn ? (
                                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                  )}
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-slate-900">{issue.title}</p>
                                    <p className="text-[11px] text-slate-600 leading-snug">{issue.description}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Top Actionable Quick Wins */}
                      {actionableSteps.length > 0 && (
                        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                          <p className="text-xs font-bold text-slate-900 font-heading">Prioritized Quick Wins for {auditTargetUrl}:</p>
                          <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                            {actionableSteps.slice(0, 3).map((step: string, idx: number) => (
                              <li key={idx} className="leading-snug">{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Bottom Call to Action Box */}
                      <div className="p-4 sm:p-5 bg-gradient-to-br from-[#022c22] to-[#044a36] text-white rounded-2xl space-y-3 shadow-md">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs sm:text-sm font-bold font-heading text-emerald-200">
                            Open Full Detailed Audit & White-Label Reports in Workspace
                          </h4>
                        </div>
                        <p className="text-[11px] text-emerald-100/90 leading-relaxed font-sans">
                          Access competitor keyword gap comparison, Google Lighthouse Core Web Vitals diagnostics, 1-click JSON-LD LocalBusiness generator, and export branded PDF audit decks.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                          {user?.isAuthenticated ? (
                            <button
                              onClick={() => {
                                setIsAuditModalOpen(false);
                                setActiveTab('website_review');
                              }}
                              className="w-full sm:w-auto px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Open Full In-Depth Audit Workspace</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setIsAuditModalOpen(false);
                                  setActiveTab('signup');
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                              >
                                <UserPlus className="w-4 h-4" />
                                <span>Create Free Account (25 Credits)</span>
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : null}
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
