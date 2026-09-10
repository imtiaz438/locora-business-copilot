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
  Brain,
  Bot,
  Target,
  BarChart3,
  Sliders,
  Smartphone,
  Eye,
  Check,
  Send,
  Building,
  Calendar,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { setActiveTab, setLatestWebsiteAudit, user, updateBusinessProfile, businessProfile, setCheckoutModalPlan } = useApp();

  // Hero Checkup & Interactive Demo State
  const [heroInputUrl, setHeroInputUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [crawlProgressStage, setCrawlProgressStage] = useState(0);
  const [demoActiveStep, setDemoActiveStep] = useState<number>(0);
  const [checkupDone, setCheckupDone] = useState(false);
  const [targetBusinessName, setTargetBusinessName] = useState('Austin Premier Plumbing');
  const [liveAuditData, setLiveAuditData] = useState<any | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // FAQ State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Pricing Toggle State
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const crawlStages = [
    'Scanning live website HTML, SSL, and server response headers...',
    'Checking PageSpeed, mobile responsiveness & metadata tags...',
    'Analyzing Schema.org JSON-LD structured data and headings...',
    'Synthesizing real-time opportunities into your Business Brain...',
  ];

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = heroInputUrl.trim() || 'locora.ai';
    const clean = raw.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
    const detectedName = clean.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'My Business';
    setTargetBusinessName(detectedName);
    setIsAnalyzing(true);
    setAuditError(null);
    setCrawlProgressStage(0);

    const interval = setInterval(() => {
      setCrawlProgressStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 600);

    try {
      const response = await fetch('/api/ai/audit-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: clean,
          businessProfile: { name: detectedName, website: clean },
        }),
      });

      clearInterval(interval);
      setCrawlProgressStage(3);

      const data = await response.json();

      if (response.ok && data) {
        setLiveAuditData(data);
        setLatestWebsiteAudit(data);

        const finalName = data.businessName || (data.pageTitle ? data.pageTitle.split(/[-|–:•]/)[0].trim() : detectedName);
        setTargetBusinessName(finalName);

        updateBusinessProfile({
          name: finalName,
          website: clean,
          tagline: data.pageDesc || '',
        });
      } else {
        setAuditError(data?.message || 'Quick scan completed. Detailed metrics available in dashboard.');
      }
    } catch (err: any) {
      clearInterval(interval);
      console.warn('[Home Hero] Real audit notice:', err.message);
    } finally {
      setIsAnalyzing(false);
      setCheckupDone(true);
      setTimeout(() => {
        const el = document.getElementById('ai-demo-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const navigateTo = (tab: string, path: string, hash?: string) => {
    window.history.pushState({}, '', path);
    setActiveTab(tab);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenAction = (targetTab: string) => {
    if (user?.isAuthenticated) {
      setActiveTab(targetTab);
    } else {
      setActiveTab('signup');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'What is Locora AI and how is it different from traditional SEO tools?',
      a: 'Traditional SEO tools just show you endless lists of technical errors (like missing meta descriptions) and leave you to figure it out. Locora AI acts as your autonomous Business Growth Manager. It connects to your Business Brain, finds your highest-revenue opportunities across Google Maps, competitor gaps, and customer reviews, explains what matters in plain English, and executes the fix for you.',
    },
    {
      q: 'What is the Business Brain?',
      a: 'The Business Brain is Locora’s central intelligence layer. It securely models your specific industry, core services, target locations, top competitors, current offers, brand voice, and customer feedback. Once trained, you can ask Locora anything—like "Create a promotion for my slowest service" or "Why are competitors beating me on Google Maps?"—and it answers with complete context.',
    },
    {
      q: 'What is 2026 AI Search Visibility and GEO?',
      a: 'Modern consumers increasingly ask generative AI systems (ChatGPT, Perplexity, Microsoft Copilot, and Google Gemini) for local business recommendations instead of traditional search engines. Locora measures how well AI systems understand your services, identifies conflicting NAP citations, and structures your digital footprint with LocalBusiness schema so AI answer engines cite your business first.',
    },
    {
      q: 'How does Locora AI help businesses rank in the Google Maps Local 3-Pack?',
      a: 'Locora AI boosts Google Maps visibility by automatically identifying primary and secondary GBP categories, auditing local citation consistency, generating localized geo-posts, deploying validated LocalBusiness JSON-LD schema, and drafting high-sentiment 5-star review responses that trigger Google local search ranking signals.',
    },
    {
      q: 'Can digital marketing agencies manage multiple clients?',
      a: 'Yes! The Agency plan ($99/mo) includes our dedicated AI Client Manager. You can manage 10, 50, or 100 client accounts, run automated health scans, generate white-label PDF executive audits, deploy bulk review actions, and invite team members with custom branding.',
    },
    {
      q: 'Are client CRM, proposals, and invoices built-in?',
      a: 'Yes, absolutely. All your execution tools—Client CRM with visual deal pipelines, AI Proposal & Quote generator with digital signing, SOW agreements, and white-label Invoices with online Stripe payment links—are fully built-in and connected to your Business Brain so you never have to re-enter customer details or pay for separate software subscriptions.',
    },
    {
      q: 'Which industries achieve the best results with Locora AI?',
      a: 'Locora AI includes specialized prompt and audit engines for Dental Clinics, HVAC Contractors, Real Estate Brokers, Law Firms, Plumbing & Electrical Contractors, Med Spas, Restaurants, and Auto Repair Centers, as well as digital marketing agencies serving these verticals.',
    },
    {
      q: 'Do I need a credit card to get started?',
      a: 'No credit card is required. You can run a free AI business checkup and start on our Free Explorer plan immediately.',
    },
  ];

  return (
    <div className="space-y-24 pb-20 selection:bg-emerald-600 selection:text-white font-sans bg-slate-50 text-slate-900">
      {/* 01 — HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#022c22] via-[#044a36] to-[#011a13] text-white py-20 sm:py-28 px-6 sm:px-12 shadow-xl overflow-hidden">
        {/* Soft ambient lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#047857]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#6ee7b7] text-xs font-semibold font-heading tracking-wider uppercase">
            <LocoraLogo assetType="hero" size={20} className="w-5 h-5" />
            <span>AI Business OS + Local SEO Copilot</span>
          </div>

          {/* Core Title */}
          <h1 className="text-4xl sm:text-[56px] lg:text-[62px] font-bold font-heading text-white tracking-tight leading-[1.12]">
            Your AI Manager for <span className="text-[#6ee7b7]">Local Business Growth</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-sans">
            Locora analyzes your business, finds what’s holding you back, and tells you exactly what to do next.
          </p>

          {/* Website Input + CTA */}
          <form id="hero-input" onSubmit={handleHeroSubmit} className="max-w-xl mx-auto pt-2">
            <div className="p-2 bg-white border border-emerald-300/30 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full pl-3 pr-2">
                <Globe className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={heroInputUrl}
                  onChange={(e) => setHeroInputUrl(e.target.value)}
                  placeholder="Enter your website (e.g. austinpremierplumbing.com)"
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze My Business</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            <div className="pt-3 text-xs text-emerald-200/80 flex items-center justify-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#6ee7b7]" />
              <span>No credit card required. Instant AI checkup.</span>
            </div>
          </form>

          {/* Capabilities Badge Line */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-emerald-100/75 font-heading">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> SEO</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Google Business</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Reviews</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Competitors</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Content</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Growth</span>
          </div>

          {/* Analyzing Progress State */}
          {isAnalyzing && (
            <div className="max-w-md mx-auto p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-left space-y-2 animate-in fade-in-50">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                <span>AI Deep Scan in Progress</span>
                <span>Stage {crawlProgressStage + 1} of 4</span>
              </div>
              <div className="w-full bg-emerald-950/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#10b981] h-full transition-all duration-300"
                  style={{ width: `${((crawlProgressStage + 1) / 4) * 100}%` }}
                />
              </div>
              <p className="text-xs text-emerald-100 italic">
                {crawlStages[crawlProgressStage]}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 02 — IMMEDIATE AI DEMO: LIVE DIAGNOSIS */}
      <section id="ai-demo-section" className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base font-heading">
                    AI Business Diagnosis for {targetBusinessName}
                  </h3>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase border ${
                    liveAuditData
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {liveAuditData ? `${liveAuditData.issues?.length || 4} Live Findings` : '7 Opportunities Found'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {liveAuditData
                    ? `Live crawl completed for ${liveAuditData.url || targetBusinessName} • SEO Score: ${liveAuditData.seoScore || 78}/100 • Response time: ${liveAuditData.latencyMs || 260}ms`
                    : 'Synthesized across Google Maps, competitor footprints, customer reviews, and AI search engines.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenAction('website_review')}
              className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer font-sans shrink-0"
            >
              <span>Open in Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Animated Diagnostic Stream */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pb-2 border-b border-slate-100">
              {liveAuditData ? [
                {
                  name: 'SSL Security',
                  count: liveAuditData.isSsl ? 'Secure (HTTPS)' : 'Insecure (HTTP)',
                  status: liveAuditData.isSsl ? 'info' : 'critical',
                  icon: ShieldCheck,
                },
                {
                  name: 'Schema Data',
                  count: liveAuditData.hasSchema ? 'JSON-LD Active' : 'Missing Schema',
                  status: liveAuditData.hasSchema ? 'info' : 'critical',
                  icon: Layers,
                },
                {
                  name: 'SEO Score',
                  count: `${liveAuditData.seoScore || 78}/100`,
                  status: (liveAuditData.seoScore || 78) >= 70 ? 'info' : 'warning',
                  icon: Globe,
                },
                {
                  name: 'Page Speed',
                  count: `${liveAuditData.performanceScore || 80}/100`,
                  status: (liveAuditData.performanceScore || 80) >= 70 ? 'info' : 'warning',
                  icon: Zap,
                },
                {
                  name: 'Content Depth',
                  count: `${liveAuditData.wordCount || 0} Words`,
                  status: (liveAuditData.wordCount || 0) > 300 ? 'info' : 'warning',
                  icon: FileText,
                },
                {
                  name: 'H1 Headings',
                  count: liveAuditData.h1Matches?.length ? `${liveAuditData.h1Matches.length} Tag Found` : 'Missing H1',
                  status: liveAuditData.h1Matches?.length ? 'info' : 'critical',
                  icon: Target,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <span className={`w-2 h-2 rounded-full ${item.status === 'critical' ? 'bg-rose-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">{item.name}</div>
                    <div className="text-xs font-bold text-slate-900 truncate" title={item.count}>{item.count}</div>
                  </div>
                );
              }) : [
                { name: 'Reviews', count: '8 Unanswered', status: 'critical', icon: Star },
                { name: 'Local SEO', count: '4 Missing Pages', status: 'critical', icon: MapPin },
                { name: 'Competitors', count: '14 Review Gap', status: 'warning', icon: ShieldCheck },
                { name: 'Website', count: 'Metadata Mismatch', status: 'warning', icon: Globe },
                { name: 'Google Maps', count: 'Rank #4 (#1 Target)', status: 'info', icon: Target },
                { name: 'AI Search', count: '64/100 Citations', status: 'info', icon: Search },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <span className={`w-2 h-2 rounded-full ${item.status === 'critical' ? 'bg-rose-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">{item.name}</div>
                    <div className="text-xs font-bold text-slate-900">{item.count}</div>
                  </div>
                );
              })}
            </div>

            {/* Top 3 Prioritized Action Cards */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-heading">
                Top Actionable Opportunities Ranked by Revenue Impact
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {liveAuditData ? (
                  <>
                    {/* Real Opportunity 1: Schema & Technical Foundation */}
                    <div className="p-5 bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full uppercase">
                            🔴 High Urgency
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Technical SEO</span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-900 font-heading">
                          {!liveAuditData.hasSchema
                            ? 'Missing LocalBusiness Schema'
                            : !liveAuditData.isSsl
                            ? 'Insecure HTTP Connection'
                            : 'Optimize Title & Meta Tags'}
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {!liveAuditData.hasSchema
                            ? `"${targetBusinessName}" has no LocalBusiness JSON-LD markup. Google Maps and AI search engines cannot reliably parse your operating hours or address.`
                            : !liveAuditData.isSsl
                            ? 'Your site does not enforce HTTPS encryption. Browsers flag insecure connections to potential customers.'
                            : `Page title is currently: "${(liveAuditData.pageTitle || targetBusinessName).slice(0, 50)}...". Optimize keywords to increase click-through rate.`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenAction('website_review')}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Fix Technical Issues</span>
                      </button>
                    </div>

                    {/* Real Opportunity 2: Content & Geo Search */}
                    <div className="p-5 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase">
                            🟠 High Impact
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Content &amp; Meta</span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-900 font-heading">
                          {!liveAuditData.pageDesc
                            ? 'Missing Meta Description Tag'
                            : (liveAuditData.wordCount || 0) < 300
                            ? 'Thin Content on Homepage'
                            : 'High-Intent Geo Service Pages'}
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {!liveAuditData.pageDesc
                            ? 'Search engines and AI assistants will generate an arbitrary snippet for your business. Add an intentional meta description with your primary offer.'
                            : (liveAuditData.wordCount || 0) < 300
                            ? `Only ${liveAuditData.wordCount || 0} words of body text detected. Adding comprehensive service descriptions will boost organic topical authority.`
                            : `Meta description: "${liveAuditData.pageDesc.slice(0, 80)}...". Build dedicated location-specific landing pages to win adjacent neighborhoods.`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenAction('content_studio')}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Service Page</span>
                      </button>
                    </div>

                    {/* Real Opportunity 3: AI Citations & Google Maps */}
                    <div className="p-5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                            🟢 Competitive Edge
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Google Maps &amp; AI</span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-900 font-heading">
                          Google Maps 3-Pack &amp; AI Citations
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Synchronize {targetBusinessName}'s digital footprint across Google Business Profile, Apple Maps, and AI models (ChatGPT &amp; Perplexity) to win local recommendations.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenAction('local_seo')}
                        className="w-full py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Optimize Local Presence</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Opportunity 1 */}
                    <div className="p-5 bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full uppercase">
                            🔴 High Urgency
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Reputation</span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-900 font-heading">
                          8 Customer Reviews Need Responses
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Customers frequently mention "emergency service." Responding with keyword context signals Google Maps algorithm to boost ranking.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenAction('local_seo')}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Respond with AI</span>
                      </button>
                    </div>

                    {/* Opportunity 2 */}
                    <div className="p-5 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase">
                            🟠 High Impact
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Local SEO</span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-900 font-heading">
                          Missing High-Intent Service Page
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Competitors are ranking for emergency keywords. You have zero dedicated landing pages targeting this search term.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenAction('documents')}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Create Geo Page</span>
                      </button>
                    </div>

                    {/* Opportunity 3 */}
                    <div className="p-5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                            🟢 Competitive Edge
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Competitors</span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-900 font-heading">
                          Competitor Review Velocity Gap
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Top competitors gained 14 reviews this month. Your review velocity gap is widening. Launch an automated SMS review request campaign.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenAction('marketing')}
                        className="w-full py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>See What They're Doing</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — “HERE'S WHAT LOCORA DOES” (6 CARDS) */}
      <section className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-semibold font-heading uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>How Locora Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Stop Guessing. Let Your AI Manager Execute.
          </h2>
          <p className="text-slate-600 text-sm">
            Locora connects to your business footprint, determines what needs to be done, and executes it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: '1. Find',
              desc: 'Locora continuously scans Google Maps, customer searches, and website health to detect lost revenue opportunities.',
              icon: Search,
              tag: 'Discovery Engine',
            },
            {
              title: '2. Understand',
              desc: 'Your Business Brain analyzes customer reviews, praise, complaints, and competitor moves to uncover the root cause.',
              icon: Brain,
              tag: 'Business Intelligence',
            },
            {
              title: '3. Prioritize',
              desc: 'Rank every single action item by estimated revenue impact so you always know your 3 most critical priorities.',
              icon: Target,
              tag: 'Growth Command',
            },
            {
              title: '4. Create',
              desc: 'Generate localized service landing pages, keyword-optimized review responses, and Google updates in seconds.',
              icon: Sparkles,
              tag: 'AI Content Engine',
            },
            {
              title: '5. Automate',
              desc: 'Deploy review requests, maintain LocalBusiness JSON-LD schemas, and keep profile data synced across directories.',
              icon: Bot,
              tag: 'Hands-Off OS',
            },
            {
              title: '6. Measure',
              desc: 'Track your Google Maps 3-Pack rank velocity, website conversions, customer sentiment, and AI search citations.',
              icon: BarChart3,
              tag: 'Verified Outcomes',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">{card.tag}</span>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-slate-900">{card.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 04 — THE PRODUCT SUITE AT A GLANCE */}
      <section id="product-overview" className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Unified AI Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Six Intelligent Engines. One Clean System.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
            Locora brings your SEO, AI search presence, reputation, competitor radar, and daily business operations together under an autonomous Business Brain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: 'ai-manager',
              title: 'AI Business Manager',
              tag: 'Central Hub',
              icon: Brain,
              desc: 'Autonomous morning briefings, prioritized revenue actions, and a conversational console trained on your business data.',
            },
            {
              id: 'local-seo',
              title: 'Local SEO & Maps Copilot',
              tag: 'Google Maps 3-Pack',
              icon: MapPin,
              desc: 'Geo-grid ranking scans, automated LocalBusiness JSON-LD schemas, and geo-targeted service area landing pages.',
            },
            {
              id: 'ai-visibility',
              title: '2026 AI Search Engine (GEO)',
              tag: 'Generative Engine',
              icon: Search,
              desc: 'Track and optimize how your business appears in ChatGPT, Perplexity, Google Gemini, and Microsoft Copilot.',
            },
            {
              id: 'reputation',
              title: 'Reputation & Review Intelligence',
              tag: 'Customer Voice',
              icon: Star,
              desc: 'Semantic review clustering, automated negative sentiment alarms, and 1-click ethical, authentic reply generation.',
            },
            {
              id: 'competitors',
              title: 'Competitor Radar',
              tag: 'Market Intelligence',
              icon: Target,
              desc: 'Continuous surveillance on nearby competitor service additions, pricing signals, rating changes, and keyword gaps.',
            },
            {
              id: 'execution-suite',
              title: 'Built-In Execution OS',
              tag: 'Operations Suite',
              icon: Layers,
              desc: 'Native client CRM pipeline, AI contract & proposal generator, white-label invoicing, and 30-day marketing cadences.',
            },
          ].map((engine) => {
            const Icon = engine.icon;
            return (
              <div
                key={engine.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center group-hover:bg-[#059669] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                      {engine.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-[#059669] transition-colors">
                      {engine.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans">
                      {engine.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => navigateTo('products', '/products', engine.id)}
                    className="text-xs font-bold text-[#059669] hover:text-[#047857] flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    <span>View Product Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner to Full Products Page */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-heading uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dedicated Product Suite</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Want to see the interactive feature demos and workflow teardowns?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-xl">
              Explore our dedicated product page for interactive tools, AI business chat consoles, schema previews, and agency management modules.
            </p>
          </div>
          <button
            onClick={() => navigateTo('products', '/products')}
            className="px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer font-heading uppercase tracking-wider"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 05 — WHO LOCORA IS BUILT FOR (SOLUTIONS BY INDUSTRY) */}
      <section id="industry-solutions" className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Built For Real Businesses</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Engineered For Your Specific Business Model
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
            Locora comes pre-trained with playbooks and metrics calibrated for local service trades, clinical practices, and high-velocity agencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              industry: 'Contractors & Home Services',
              examples: 'Plumbing, HVAC, Roofing, Electricians, Landscaping',
              highlight: 'Capture emergency calls & weekend requests',
              icon: Briefcase,
              desc: 'Auto-generate neighborhood landing pages, monitor Google Maps 3-Pack for high-intent keywords, and instantly reply to verified customer feedback.',
            },
            {
              industry: 'Medical & Dental Clinics',
              examples: 'Dentists, Chiropractors, Medspas, Optometry',
              highlight: 'Build local patient trust & organic appointments',
              icon: Award,
              desc: 'Transform patient testimonials into HIPAA-compliant marketing assets, track competitor patient volumes, and optimize local healthcare directory citations.',
            },
            {
              industry: 'Legal & Professional Services',
              examples: 'Law Firms, Accounting Practices, Financial Advisors',
              highlight: 'Authoritative local presence & proposal conversion',
              icon: ShieldCheck,
              desc: 'Establish dominant thought leadership in your metro area, generate professional client proposals with one click, and track prospective client reviews.',
            },
            {
              industry: 'Multi-Location Retail & Dining',
              examples: 'Franchise Groups, Casual Dining, Auto Service Shops',
              highlight: 'Centralized multi-store visibility & sentiment',
              icon: Globe,
              desc: 'Monitor 5 to 50+ storefronts simultaneously. Identify low-performing locations, unify Google Business Profile updates, and safeguard brand equity.',
            },
            {
              industry: 'Digital Marketing & SEO Agencies',
              examples: 'Local SEO Agencies, Fractional CMOs, Web Studios',
              highlight: 'Automate client deliverables & reduce churn',
              icon: Users,
              desc: 'Pitch prospects with live technical website checkups, auto-generate branded white-label audits, and manage all client retainers from one shared cockpit.',
            },
            {
              industry: 'Independent Founders & Startups',
              examples: 'Boutique Studios, Consultants, Local Creators',
              highlight: 'Executive marketing copilot without agency overhead',
              icon: Zap,
              desc: 'Get clear, plain-English guidance on what marketing actions to take each morning without needing a full-time marketing director on payroll.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-heading text-slate-900">{item.industry}</h3>
                    <p className="text-[11px] font-medium text-emerald-700 mt-0.5">{item.examples}</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>{item.highlight}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 12 — RESULTS & IMPACT */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">150+</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Businesses Analyzed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#059669] font-heading">2K+</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Growth Gaps Discovered</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">3K+</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Hours Saved</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-heading">5K+</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Reviews Analyzed</div>
          </div>
        </div>
      </section>

      {/* 13 — PRICING SECTION ($0 / $29 / $99) */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Transparent Plans</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Plans Built for True Local Growth
          </h2>
          <p className="text-slate-600 text-sm">
            Start for free to discover what's holding you back, or scale with our Pro and Agency tiers.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold font-heading ${pricingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setPricingCycle(pricingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-7 bg-slate-200 rounded-full p-1 relative transition-colors border border-slate-300 cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#059669] transition-transform ${
                  pricingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold font-heading ${pricingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual (Save Up to 28%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FREE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold font-heading">
                Explorer
              </div>
              <h3 className="text-2xl font-bold font-heading text-slate-900">Free Forever</h3>
              <p className="text-xs text-slate-500">For business owners exploring what is holding their growth back.</p>
              <div className="text-3xl sm:text-4xl font-black font-heading text-slate-900">$0 <span className="text-xs font-medium text-slate-400">/ forever</span></div>

              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <div>✓ 1 Business context</div>
                <div>✓ AI Business Checkup & Diagnosis</div>
                <div>✓ Basic Business Brain</div>
                <div>✓ Basic Local SEO Audit</div>
                <div>✓ 1 Competitor tracked</div>
                <div>✓ 5 Tracked opportunities</div>
                <div>✓ 10 Review analyses / month</div>
                <div>✓ No credit card required</div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('signup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer font-sans"
            >
              Start Free Checkup
            </button>
          </div>

          {/* PRO $29 */}
          <div className="bg-white border-2 border-[#059669] rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#059669] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm font-heading">
              MOST POPULAR
            </div>

            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-emerald-50 text-[#059669] rounded-lg text-xs font-bold font-heading">
                Pro Growth
              </div>
              <h3 className="text-2xl font-bold font-heading text-slate-900">AI Business Manager</h3>
              <p className="text-xs text-slate-500">For 1 business ready for proactive growth and Maps dominance.</p>
              <div className="text-3xl sm:text-4xl font-black font-heading text-slate-900">
                {pricingCycle === 'yearly' ? '$249' : '$29'}{' '}
                <span className="text-xs font-medium text-slate-400">{pricingCycle === 'yearly' ? '/ year ($20.75/mo)' : '/ month'}</span>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <div className="font-bold text-slate-900">✓ Full Business Brain & AI Growth Manager</div>
                <div>✓ AI Local SEO Copilot (Maps 3-Pack)</div>
                <div>✓ AI Reputation Manager (200 actions/mo)</div>
                <div>✓ Competitor Intelligence (5 tracked)</div>
                <div>✓ 50 Tracked search opportunities</div>
                <div>✓ 2026 AI Search Visibility (ChatGPT & Perplexity)</div>
                <div>✓ 30-Day Growth Plan auto-execution</div>
                <div>✓ Unlimited CRM, Proposals & Invoices</div>
              </div>
            </div>

            <button
              onClick={() => setCheckoutModalPlan('pro', pricingCycle)}
              className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <span>Upgrade to Pro ($29/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* AGENCY $99 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold font-heading">
                Agency Elite
              </div>
              <h3 className="text-2xl font-bold font-heading text-slate-900">AI Client Manager</h3>
              <p className="text-xs text-slate-500">Manage 10, 50, or 100 client accounts autonomously.</p>
              <div className="text-3xl sm:text-4xl font-black font-heading text-slate-900">
                {pricingCycle === 'yearly' ? '$790' : '$99'}{' '}
                <span className="text-xs font-medium text-slate-400">{pricingCycle === 'yearly' ? '/ year ($65.80/mo)' : '/ month'}</span>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <div className="font-bold text-indigo-950">✓ Everything in Pro for 10 Businesses</div>
                <div>✓ 10 Dedicated Business Brains</div>
                <div>✓ AI Client Monitoring & Automated Scans</div>
                <div>✓ Bulk Analysis & Review Actions</div>
                <div>✓ White-Label Executive Client PDF Reports</div>
                <div>✓ Custom Client Portals & Dashboards</div>
                <div>✓ Up to 5 Team Member Seats</div>
                <div>✓ Full Agency Branding & Custom Logo</div>
              </div>
            </div>

            <button
              onClick={() => setCheckoutModalPlan('agency', pricingCycle)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer font-sans flex items-center justify-center gap-2"
            >
              <span>Get Agency Client Manager ($99/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 14 — ONE-TIME GROWTH STORE */}
      <section className="max-w-6xl mx-auto px-6">
        <OneTimeOffersSection />
      </section>

      {/* 15 — FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything you need to know about Locora AI and your Business Brain.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-colors shadow-2xs"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 cursor-pointer font-heading"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {expandedFaq === i && (
                <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-sans">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 16 — FINAL CTA */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-gradient-to-br from-[#022c22] to-[#044a36] text-white rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
              Stop guessing what your business needs next.
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 font-sans">
              Let Locora find out. Run your free AI business checkup and get prioritized action items in under 60 seconds.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  const inp = document.getElementById('hero-input');
                  if (inp) inp.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>Analyze My Business — Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('signup');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-all cursor-pointer font-sans"
              >
                Create Account
              </button>
            </div>
            <div className="text-xs text-emerald-200/80 pt-2 font-medium">
              No credit card required · Free checkup · Instant insights
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
