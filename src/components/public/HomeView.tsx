import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WebsiteAuditResult, PublicCheckupResult } from '../../types';
import { LocoraLogo } from '../LocoraLogo';
import { QuickCheckupReport } from './QuickCheckupReport';
import { navigateToDirectory } from '../../utils/domain';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
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
  Phone,
  Mail,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { setActiveTab, setLatestWebsiteAudit, user, updateBusinessProfile, businessProfile, setCheckoutModalPlan } = useApp();

  // Hero Quick Business Checkup State
  const [heroInputUrl, setHeroInputUrl] = useState('');
  const [heroBusinessName, setHeroBusinessName] = useState('');
  const [heroLocation, setHeroLocation] = useState('');
  const [heroEmail, setHeroEmail] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [crawlProgressStage, setCrawlProgressStage] = useState(0);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Live public checkup result - strictly in-memory per session visit
  const [publicAudit, setPublicAudit] = useState<PublicCheckupResult | null>(null);
  const [checkupDone, setCheckupDone] = useState<boolean>(false);
  const [targetBusinessName, setTargetBusinessName] = useState<string>('My Business');

  const handleResetCheckup = () => {
    setPublicAudit(null);
    setCheckupDone(false);
    setHeroInputUrl('');
    setHeroLocation('');
    setHeroBusinessName('');
    setHeroEmail('');
    setAuditError(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('locora_pending_public_audit');
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ensure returning to or refreshing the homepage always presents the clean default home view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('locora_pending_public_audit');
      } catch {}
    }
  }, []);

  // Checkup Sub-Tab State (Sections 5, 6, 7, 8, 9, 10, 11, 12, 13)
  const [auditTab, setAuditTab] = useState<'quick_checkup' | 'overview' | 'discovery' | 'seo' | 'local' | 'performance'>('quick_checkup');

  // FAQ State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const crawlStages = [
    'Queued • Resolving target domain, DNS & validating safety...',
    'Scanning • Performing live TLS/SSL handshake & measuring server TTFB...',
    'Analyzing • Parsing Schema.org JSON-LD, meta tags, H1 structure & internal links...',
    'Completed • Computing deterministic SEO scores & saving audit report...',
  ];

  const handleHeroSubmit = async (e?: React.FormEvent, forceRefresh = false) => {
    if (e) e.preventDefault();
    const rawUrl = heroInputUrl.trim();
    if (!rawUrl) {
      setAuditError('Please enter a valid website URL.');
      return;
    }

    setIsAnalyzing(true);
    setAuditError(null);
    setCrawlProgressStage(0);

    const interval = setInterval(() => {
      setCrawlProgressStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 750);

    try {
      const response = await fetch('/api/public/checkup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: rawUrl,
          businessName: heroBusinessName.trim() || undefined,
          businessLocation: heroLocation.trim() || undefined,
          email: heroEmail.trim() || undefined,
          forceRefresh,
        }),
      });

      clearInterval(interval);
      setCrawlProgressStage(3);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to complete website diagnostic.');
      }

      setPublicAudit(data);
      setCheckupDone(true);
      setTargetBusinessName(data.businessName || 'My Business');

      // Update AppContext so workspace is immediately hydrated if already logged in
      updateBusinessProfile({
        name: data.businessName,
        website: data.domain,
        phone: data.detectedBusinessData?.phone || '',
        address: data.detectedBusinessData?.address || '',
        city: heroLocation.trim() || '',
        tagline: data.detectedBusinessData?.metaDescription || '',
      });

      // Map into WebsiteAuditResult format for internal views
      setLatestWebsiteAudit({
        url: data.url || data.domain || rawUrl,
        analyzedAt: data.analyzedAt || new Date().toISOString(),
        overallScore: data.overallScore ?? 70,
        scores: {
          seo: data.scores?.seo ?? 70,
          performance: data.scores?.performance ?? 70,
          accessibility: 85,
          bestPractices: 85,
        },
        metadata: {
          title: data.detectedBusinessData?.metaTitle || '',
          description: data.detectedBusinessData?.metaDescription || '',
          hasH1: Boolean(data.detectedBusinessData?.h1Heading),
          h1Count: data.detectedBusinessData?.h1Heading ? 1 : 0,
          h1Text: data.detectedBusinessData?.h1Heading || '',
          sslActive: Boolean(data.crawlStats?.isSsl),
          latencyMs: data.crawlStats?.latencyMs || 0,
          htmlSizeKb: data.crawlStats?.htmlSizeKb || 0,
          httpStatus: data.crawlStats?.httpStatus || 200,
          totalImages: data.crawlStats?.totalImages || 0,
          imageAltMissingCount: data.crawlStats?.missingAltImages || 0,
          hasSchema: Boolean(data.detectedBusinessData?.hasLocalBusinessSchema),
          schemaTypes: data.detectedBusinessData?.schemaTypes || [],
        },
        keyIssues: (data.discoveredIssues || []).map((iss: any) => ({
          type: iss.severity === 'critical' ? 'error' : iss.severity === 'warning' ? 'warning' : 'pass',
          category: iss.category?.includes('SEO') ? 'SEO' : iss.category?.includes('Performance') ? 'Performance' : 'Security',
          title: iss.title,
          description: iss.description,
          recommendation: iss.evidence,
        })),
        aiSummary: `Live diagnostic completed for ${data.domain}. Found ${data.pagesCrawled || 1} analyzed page(s), ${(data.discoveredIssues || []).length} detected findings, and verified ${data.crawlStats?.latencyMs || 0}ms server TTFB.`,
        actionableSteps: (data.discoveredIssues || []).map((i: any) => i.title),
      });

      // Smooth scroll to diagnostic results
      setTimeout(() => {
        const el = document.getElementById('quick-checkup-results');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      clearInterval(interval);
      setAuditError(err.message || 'Unable to analyze domain. Please check spelling or connectivity.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClaimAndUnlock = (featureHint?: string) => {
    if (publicAudit && typeof window !== 'undefined') {
      localStorage.setItem('locora_pending_public_audit', JSON.stringify(publicAudit));
    }

    if (user?.isAuthenticated) {
      if (publicAudit && user.email) {
        fetch('/api/public/claim-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auditId: publicAudit.auditId,
            userEmail: user.email,
          }),
        }).catch(() => {});
      }
      setActiveTab(featureHint || 'dashboard');
    } else {
      setActiveTab('signup');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <span>AI Business OS • Local SEO Copilot • Verified Directory</span>
          </div>

          {/* Core Title */}
          <h1 className="text-4xl sm:text-[56px] lg:text-[62px] font-bold font-heading text-white tracking-tight leading-[1.12]">
            Your AI Manager & <span className="text-[#6ee7b7]">Verified Local Directory</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-sans">
            Audit your business, dominate the Google Maps 3-Pack, and get discovered by local customers and 2026 AI search engines through the Locora Verified Directory.
          </p>

          {/* Directory Quick Navigation Banner */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigateToDirectory()}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 hover:text-white rounded-full text-xs font-bold transition-all inline-flex items-center justify-center gap-2 cursor-pointer font-heading shadow-md"
            >
              <Building2 className="w-4 h-4 text-[#6ee7b7]" />
              <span>Explore Verified Business Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-emerald-200/70 font-sans hidden sm:inline">or run a real-time site audit below:</span>
          </div>

          {/* Website Input + CTA */}
          <form id="hero-input" onSubmit={handleHeroSubmit} className="max-w-xl mx-auto pt-2 space-y-3">
            <div className="p-2 bg-white border border-emerald-300/30 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full pl-3 pr-2">
                <Globe className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={heroInputUrl}
                  onChange={(e) => setHeroInputUrl(e.target.value)}
                  placeholder="Enter website (e.g. yourbusiness.com)"
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans shrink-0 disabled:opacity-75"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Running Real Checkup...</span>
                  </>
                ) : (
                  <>
                    <span>Start Quick Checkup</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Optional Fields Toggle */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="text-xs text-emerald-200/90 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <span>{showOptionalFields ? '− Hide Optional Business Details' : '+ Add Business Name, Location, or Email (Optional)'}</span>
                {showOptionalFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showOptionalFields && (
              <div className="p-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2 text-left animate-in fade-in-50">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-200 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={heroBusinessName}
                    onChange={(e) => setHeroBusinessName(e.target.value)}
                    placeholder="e.g. Apex Auto Care"
                    className="w-full px-3 py-2 bg-white/90 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-200 mb-1">Location</label>
                  <input
                    type="text"
                    value={heroLocation}
                    onChange={(e) => setHeroLocation(e.target.value)}
                    placeholder="e.g. Dallas, TX"
                    className="w-full px-3 py-2 bg-white/90 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-200 mb-1">Email for Report</label>
                  <input
                    type="email"
                    value={heroEmail}
                    onChange={(e) => setHeroEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3 py-2 bg-white/90 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
            )}

            {auditError && (
              <div className="p-3.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-left flex items-start gap-2.5 text-xs text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-white">Diagnostic Notice</p>
                  <p className="text-rose-200/90 leading-relaxed">{auditError}</p>
                </div>
              </div>
            )}

            <div className="pt-1 text-xs text-emerald-200/80 flex items-center justify-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#6ee7b7]" />
              <span>100% Real Live Checkup • Zero Fake Data • Deterministic Scoring</span>
            </div>
          </form>

          {/* Popular Directory Categories Quick Jump */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-emerald-100/90">
            <span className="font-semibold text-[#6ee7b7] mr-1 flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified Directory:
            </span>
            {['Dentists', 'HVAC Repair', 'Plumbers', 'Contractors', 'Auto Care', 'Med Spas', 'Law Firms'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => navigateToDirectory()}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-emerald-100 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigateToDirectory()}
              className="px-2 py-1 text-[#6ee7b7] hover:underline font-bold transition-colors cursor-pointer text-[11px]"
            >
              Browse All Categories →
            </button>
          </div>

          {/* Capabilities Badge Line */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-emerald-100/75 font-heading">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Verified Directory</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Maps 3-Pack Authority</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> 2026 AI Search (GEO)</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Zero-Fee Direct Quotes</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> 1-Click Verification</span>
          </div>

          {/* Analyzing Progress State */}
          {isAnalyzing && (
            <div className="max-w-md mx-auto p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-left space-y-2.5 animate-in fade-in-50">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Website Diagnostic Crawl
                </span>
                <span>Stage {crawlProgressStage + 1} of 4</span>
              </div>
              <div className="w-full bg-emerald-950/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#10b981] h-full transition-all duration-500"
                  style={{ width: `${((crawlProgressStage + 1) / 4) * 100}%` }}
                />
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed font-mono text-[11px]">
                {crawlStages[crawlProgressStage]}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 02 — QUICK BUSINESS CHECKUP RESULTS / REAL DIAGNOSTIC */}
      <section id="quick-checkup-results" className="max-w-6xl mx-auto px-6">
        <div id="ai-demo-section" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {publicAudit ? (
            <div>
              {/* Header Bar */}
              <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base font-heading">
                        Real Diagnostic: {publicAudit.businessName}
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full uppercase border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        Verified Live Crawl
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                      <span className="font-mono text-slate-300">{publicAudit.domain}</span>
                      <span>•</span>
                      <span>{publicAudit.pagesCrawled} {publicAudit.pagesCrawled === 1 ? 'page analyzed' : 'pages analyzed'}</span>
                      <span>•</span>
                      <span>{publicAudit.crawlStats.latencyMs}ms server TTFB</span>
                      <span>•</span>
                      <span>{publicAudit.crawlStats.isSsl ? 'HTTPS Encrypted' : 'Insecure HTTP'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetCheckup}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                    title="Clear current report and check another website"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check Another</span>
                  </button>
                  <button
                    onClick={() => handleClaimAndUnlock()}
                    className="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer font-sans"
                  >
                    <span>Claim Audit & Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                {/* 4 Authentic Score Metrics (Deterministic Math) - Shown when browsing detailed tabs */}
                {auditTab !== 'quick_checkup' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-heading">
                        Calculated Health Scores
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Deterministic Engine • 0% AI Hallucination
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>Overall Health</span>
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="my-2">
                          <span className="text-3xl font-extrabold text-slate-900 font-heading">
                            {publicAudit.overallScore}
                          </span>
                          <span className="text-sm font-semibold text-slate-400">/100</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-sans">
                          Weighted composite of technical SEO, speed, and local footprint.
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>Technical SEO</span>
                          <Search className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="my-2">
                          <span className="text-3xl font-extrabold text-slate-900 font-heading">
                            {publicAudit.scores.seo}
                          </span>
                          <span className="text-sm font-semibold text-slate-400">/100</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-sans">
                          Title tags, meta descriptions, H1 hierarchy, and image alt text.
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>Page Speed & TTFB</span>
                          <Zap className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="my-2">
                          <span className="text-3xl font-extrabold text-slate-900 font-heading">
                            {publicAudit.scores.performance}
                          </span>
                          <span className="text-sm font-semibold text-slate-400">/100</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-sans">
                          {publicAudit.crawlStats.latencyMs}ms response time • {publicAudit.crawlStats.htmlSizeKb}KB payload.
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>Local Search Footprint</span>
                          <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="my-2">
                          <span className="text-3xl font-extrabold text-slate-900 font-heading">
                            {publicAudit.scores.localPresence}
                          </span>
                          <span className="text-sm font-semibold text-slate-400">/100</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-sans">
                          LocalBusiness JSON-LD, direct phone & physical address verification.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagnostic Sub-Tab Navigation Bar */}
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setAuditTab('quick_checkup')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      auditTab === 'quick_checkup'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick Checkup (Score & Gated)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuditTab('overview')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      auditTab === 'overview'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>All Findings ({publicAudit.discoveredIssues.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuditTab('discovery')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      auditTab === 'discovery'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>5. Business Discovery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuditTab('seo')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      auditTab === 'seo'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 text-indigo-600" />
                    <span>6. Real SEO Analysis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuditTab('local')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      auditTab === 'local'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>7. Local SEO & GBP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuditTab('performance')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      auditTab === 'performance'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>8. Performance & Speed</span>
                  </button>
                </div>

                {/* TAB 0: QUICK CHECKUP (SECTIONS 9, 10, 11, 12, 13) */}
                {auditTab === 'quick_checkup' && (
                  <QuickCheckupReport
                    audit={publicAudit}
                    onClaimAndUnlock={handleClaimAndUnlock}
                    onCheckAnother={handleResetCheckup}
                    onForceRefresh={() => handleHeroSubmit(undefined, true)}
                    isRefreshing={isAnalyzing}
                  />
                )}

                {/* TAB 1: OVERVIEW & ISSUES */}
                {auditTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Digital Footprint & NAP Detection */}
                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider font-heading flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          <span>Verified Digital Footprint & Signals</span>
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">Live DOM Inspection</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                          <span className="text-slate-400 block text-[11px] font-medium mb-1">Direct Phone</span>
                          <p className="font-semibold text-slate-900 truncate">
                            {publicAudit.detectedBusinessData.phone || (
                              <span className="text-amber-600 font-normal">Not detected in HTML</span>
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                          <span className="text-slate-400 block text-[11px] font-medium mb-1">Address / Geo</span>
                          <p className="font-semibold text-slate-900 truncate">
                            {publicAudit.detectedBusinessData.address || (
                              <span className="text-amber-600 font-normal">Not detected in HTML</span>
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                          <span className="text-slate-400 block text-[11px] font-medium mb-1">Schema.org JSON-LD</span>
                          <p className="font-semibold text-slate-900 truncate">
                            {publicAudit.detectedBusinessData.hasLocalBusinessSchema ? (
                              <span className="text-emerald-700">✓ LocalBusiness Active</span>
                            ) : (
                              <span className="text-rose-600 font-normal">Missing Local Schema</span>
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                          <span className="text-slate-400 block text-[11px] font-medium mb-1">Image Accessibility</span>
                          <p className="font-semibold text-slate-900 truncate">
                            {publicAudit.crawlStats.missingAltImages === 0 ? (
                              <span className="text-emerald-700">✓ All Alt Tags Present</span>
                            ) : (
                              <span className="text-amber-600">{publicAudit.crawlStats.missingAltImages} Missing Alt Tags</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section: What is wrong with my website/business? (Real Discovered Issues) */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <h4 className="text-sm font-bold text-slate-900 font-heading">
                            What is wrong with my website/business?
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Live diagnostic identified {publicAudit.discoveredIssues.length} real issues affecting search discovery, speed, and conversion.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {publicAudit.discoveredIssues.map((issue) => {
                          const isCritical = issue.severity === 'critical';
                          const isWarning = issue.severity === 'warning';
                          return (
                            <div
                              key={issue.id}
                              className={`p-4 rounded-2xl border transition-all ${
                                isCritical
                                  ? 'bg-rose-50/40 border-rose-200'
                                  : isWarning
                                  ? 'bg-amber-50/40 border-amber-200'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${
                                      isCritical
                                        ? 'bg-rose-100 text-rose-700 border-rose-300'
                                        : isWarning
                                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                                        : 'bg-slate-200 text-slate-700 border-slate-300'
                                    }`}>
                                      {issue.severity}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                      {issue.category}
                                    </span>
                                    <h5 className="text-sm font-bold text-slate-900 font-heading">
                                      {issue.title}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-slate-600 font-sans leading-relaxed pt-1">
                                    {issue.description}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 p-2.5 bg-white/80 rounded-xl border border-slate-200/70 text-[11px] font-mono text-slate-700 flex items-center gap-2">
                                <span className="font-bold text-slate-400 shrink-0">HTML Evidence:</span>
                                <span className="truncate">{issue.evidence}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SECTION 5 - BUSINESS INFORMATION DISCOVERY */}
                {auditTab === 'discovery' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <h4 className="text-sm font-bold text-slate-900 font-heading">
                            5. Business Information Discovery
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Extracted actual publicly available business information from DOM, JSON-LD, and page metadata.
                        </p>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-white border border-blue-200 text-[11px] text-blue-800 font-semibold shrink-0">
                        Strict Source Attribution (0% Hallucination)
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {publicAudit.businessDiscovery && [
                        { label: 'Business Name', field: publicAudit.businessDiscovery.businessName, icon: Building2 },
                        { label: 'Display Name', field: publicAudit.businessDiscovery.displayName, icon: Building },
                        { label: 'Phone', field: publicAudit.businessDiscovery.phone, icon: Phone },
                        { label: 'Email', field: publicAudit.businessDiscovery.email, icon: Mail },
                        { label: 'Address', field: publicAudit.businessDiscovery.address, icon: MapPin },
                        { label: 'City', field: publicAudit.businessDiscovery.city, icon: Globe },
                        { label: 'State / Region', field: publicAudit.businessDiscovery.stateRegion, icon: Globe },
                        { label: 'Country', field: publicAudit.businessDiscovery.country, icon: Globe },
                        { label: 'Postal Code', field: publicAudit.businessDiscovery.postalCode, icon: MapPin },
                        { label: 'Services', field: publicAudit.businessDiscovery.services, icon: Briefcase },
                        { label: 'Service Areas', field: publicAudit.businessDiscovery.serviceAreas, icon: MapPin },
                        { label: 'Business Category', field: publicAudit.businessDiscovery.businessCategory, icon: Award },
                        { label: 'Opening Hours', field: publicAudit.businessDiscovery.openingHours, icon: Clock },
                        { label: 'Website', field: publicAudit.businessDiscovery.website, icon: Globe },
                        { label: 'Social Links', field: publicAudit.businessDiscovery.socialLinks, icon: Users },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        const isFound = item.field?.status === 'found';
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                              isFound
                                ? 'bg-white border-slate-200/90 shadow-xs'
                                : 'bg-slate-50/70 border-slate-200/60'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 font-heading">
                                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{item.label}</span>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isFound
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}
                                >
                                  {isFound ? 'Found' : 'Not found'}
                                </span>
                              </div>

                              <p
                                className={`text-xs font-semibold leading-relaxed break-words ${
                                  isFound ? 'text-slate-900' : 'text-slate-400 font-normal italic'
                                }`}
                              >
                                {item.field?.displayValue || 'Not found on website'}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                              <span className="text-[10px] font-mono font-medium text-slate-400 block truncate">
                                {item.field?.source || 'Source: Website Crawl (Not detected)'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                      <Info className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        <strong>Deterministic Policy:</strong> Missing fields display &quot;Not found on website&quot; rather than being inferred or estimated.
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 3: SECTION 6 - REAL SEO ANALYSIS */}
                {auditTab === 'seo' && publicAudit.realSeoAnalysis && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          6. Real SEO Analysis
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Technical, On-page, Content, and Structured Data analysis grounded in live crawler evidence.
                      </p>
                    </div>

                    {/* 6.1 Technical SEO */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-2">
                          <Server className="w-4 h-4 text-indigo-600" />
                          <span>Technical SEO</span>
                        </h5>
                        <span className="text-[11px] text-slate-400 font-mono">Protocols & Handshakes</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">HTTPS / SSL</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${publicAudit.realSeoAnalysis.technical.https.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {publicAudit.realSeoAnalysis.technical.https.enabled ? 'Enabled' : 'Missing'}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">{publicAudit.realSeoAnalysis.technical.https.evidence}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">Crawlability (Meta Robots)</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {publicAudit.realSeoAnalysis.technical.crawlability.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] font-mono truncate">{publicAudit.realSeoAnalysis.technical.crawlability.evidence}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">robots.txt</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${publicAudit.realSeoAnalysis.technical.robotsTxt.found ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              HTTP {publicAudit.realSeoAnalysis.technical.robotsTxt.statusCode}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">{publicAudit.realSeoAnalysis.technical.robotsTxt.evidence}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">sitemap.xml</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${publicAudit.realSeoAnalysis.technical.sitemapXml.found ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              HTTP {publicAudit.realSeoAnalysis.technical.sitemapXml.statusCode}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">{publicAudit.realSeoAnalysis.technical.sitemapXml.evidence}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">Canonical Tag</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${publicAudit.realSeoAnalysis.technical.canonicalTag.present ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {publicAudit.realSeoAnalysis.technical.canonicalTag.present ? 'Present' : 'Missing'}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] font-mono truncate">{publicAudit.realSeoAnalysis.technical.canonicalTag.evidence}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">Internal Sample Links</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {publicAudit.realSeoAnalysis.technical.internalLinksHealth.brokenCount === 0 ? '0 Broken' : `${publicAudit.realSeoAnalysis.technical.internalLinksHealth.brokenCount} Broken`}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">{publicAudit.realSeoAnalysis.technical.internalLinksHealth.evidence}</p>
                        </div>
                      </div>
                    </div>

                    {/* 6.2 On-Page SEO */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>On-Page SEO</span>
                        </h5>
                        <span className="text-[11px] text-slate-400 font-mono">Headings & Metadata</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Title Tag</span>
                            <span className="text-[11px] font-mono text-slate-500">{publicAudit.realSeoAnalysis.onPage.titleTag.length} chars</span>
                          </div>
                          <p className="text-slate-800 font-medium">{publicAudit.realSeoAnalysis.onPage.titleTag.text || 'No title tag found'}</p>
                          <p className="text-slate-500 text-[11px] font-mono">{publicAudit.realSeoAnalysis.onPage.titleTag.evidence}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Meta Description</span>
                            <span className="text-[11px] font-mono text-slate-500">{publicAudit.realSeoAnalysis.onPage.metaDescription.length} chars</span>
                          </div>
                          <p className="text-slate-800 font-medium">{publicAudit.realSeoAnalysis.onPage.metaDescription.text || 'No meta description found'}</p>
                          <p className="text-slate-500 text-[11px] font-mono">{publicAudit.realSeoAnalysis.onPage.metaDescription.evidence}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">H1 Tag Structure</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${publicAudit.realSeoAnalysis.onPage.h1Heading.present ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {publicAudit.realSeoAnalysis.onPage.h1Heading.count} H1 Tag(s)
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium">{publicAudit.realSeoAnalysis.onPage.h1Heading.headings[0] || 'No H1 found'}</p>
                          <p className="text-slate-500 text-[11px]">{publicAudit.realSeoAnalysis.onPage.h1Heading.evidence}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Image Alt Accessibility</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${publicAudit.realSeoAnalysis.onPage.imageAltAttributes.missingAltCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {publicAudit.realSeoAnalysis.onPage.imageAltAttributes.compliancePercentage}% Compliant
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium">{publicAudit.realSeoAnalysis.onPage.imageAltAttributes.evidence}</p>
                          <p className="text-slate-500 text-[11px]">Checked {publicAudit.realSeoAnalysis.onPage.imageAltAttributes.totalImages} images on homepage</p>
                        </div>
                      </div>
                    </div>

                    {/* 6.3 Structured Data / Schema.org */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-600" />
                          <span>Structured Data (JSON-LD)</span>
                        </h5>
                        <span className="text-[11px] text-slate-400 font-mono">{publicAudit.realSeoAnalysis.structuredData.totalBlocks} Blocks Found</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        {publicAudit.realSeoAnalysis.structuredData.findings.map((item, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{item.schema}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.detected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                {item.detected ? 'Detected' : 'Missing'}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[11px]">{item.evidence}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: SECTION 7 - LOCAL SEO ANALYSIS */}
                {auditTab === 'local' && publicAudit.localSeoAnalysis && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          7. Local SEO Analysis
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Local discovery signals, service areas, and authorized profile connectivity.
                      </p>
                    </div>

                    {/* MANDATORY GOOGLE BUSINESS PROFILE NOTICE */}
                    <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                        <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-heading">
                          {publicAudit.localSeoAnalysis.googleBusinessProfileNotice.headline}
                        </h5>
                      </div>
                      <p className="text-xs text-amber-900/90 leading-relaxed font-sans">
                        {publicAudit.localSeoAnalysis.googleBusinessProfileNotice.explanation}
                      </p>
                      <div className="pt-2 border-t border-amber-200/70 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-medium text-amber-800">
                          {publicAudit.localSeoAnalysis.googleBusinessProfileNotice.actionRequired}
                        </span>
                        <button
                          onClick={() => handleClaimAndUnlock()}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer font-sans shrink-0 ml-3"
                        >
                          Connect in Workspace
                        </button>
                      </div>
                    </div>

                    {/* Local Signals Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-heading">Name & Brand Consistency</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${publicAudit.localSeoAnalysis.signals.businessName.found ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                            {publicAudit.localSeoAnalysis.signals.businessName.found ? 'Verified' : 'Not detected'}
                          </span>
                        </div>
                        <p className="text-slate-800 font-semibold">{publicAudit.localSeoAnalysis.signals.businessName.value || 'Not found on website'}</p>
                        <p className="text-slate-500 text-[11px]">{publicAudit.localSeoAnalysis.signals.businessName.evidence}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-heading">Physical Address & Geo</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${publicAudit.localSeoAnalysis.signals.address.found ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                            {publicAudit.localSeoAnalysis.signals.address.found ? 'Verified' : 'Not detected'}
                          </span>
                        </div>
                        <p className="text-slate-800 font-semibold">{publicAudit.localSeoAnalysis.signals.address.value || 'Not found on website'}</p>
                        <p className="text-slate-500 text-[11px]">{publicAudit.localSeoAnalysis.signals.address.evidence}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-heading">Local Business Schema</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${publicAudit.localSeoAnalysis.signals.localBusinessSchema.found ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {publicAudit.localSeoAnalysis.signals.localBusinessSchema.found ? 'Present' : 'Missing'}
                          </span>
                        </div>
                        <p className="text-slate-800 font-semibold">{publicAudit.localSeoAnalysis.signals.localBusinessSchema.schemaType || 'None'}</p>
                        <p className="text-slate-500 text-[11px]">{publicAudit.localSeoAnalysis.signals.localBusinessSchema.evidence}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-heading">Dedicated Subpages</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            {publicAudit.localSeoAnalysis.signals.servicePages.pages.length} Service URLs
                          </span>
                        </div>
                        <p className="text-slate-800 font-semibold">{publicAudit.localSeoAnalysis.signals.servicePages.evidence}</p>
                        <p className="text-slate-500 text-[11px]">{publicAudit.localSeoAnalysis.signals.locationPages.evidence}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: SECTION 8 - PERFORMANCE DATA */}
                {auditTab === 'performance' && publicAudit.performanceAnalysis && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          8. Performance & Speed Telemetry
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Direct server socket measurements and verified Google PageSpeed Insights integration.
                      </p>
                    </div>

                    {/* PageSpeed Insights Status Box */}
                    {publicAudit.performanceAnalysis.status === 'available' && publicAudit.performanceAnalysis.pageSpeedMetrics ? (
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                              Google Lighthouse Mobile Score
                            </h5>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                            {publicAudit.performanceAnalysis.pageSpeedMetrics.mobilePerformanceScore}/100
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-400 block text-[10px] font-medium">First Contentful Paint (FCP)</span>
                            <span className="font-bold text-slate-900 mt-1 block">
                              {publicAudit.performanceAnalysis.pageSpeedMetrics.coreWebVitals.firstContentfulPaint}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-400 block text-[10px] font-medium">Largest Contentful Paint (LCP)</span>
                            <span className="font-bold text-slate-900 mt-1 block">
                              {publicAudit.performanceAnalysis.pageSpeedMetrics.coreWebVitals.largestContentfulPaint}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-400 block text-[10px] font-medium">Cumulative Layout Shift (CLS)</span>
                            <span className="font-bold text-slate-900 mt-1 block">
                              {publicAudit.performanceAnalysis.pageSpeedMetrics.coreWebVitals.cumulativeLayoutShift}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-400 block text-[10px] font-medium">Total Blocking Time (TBT)</span>
                            <span className="font-bold text-slate-900 mt-1 block">
                              {publicAudit.performanceAnalysis.pageSpeedMetrics.coreWebVitals.totalBlockingTime}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-400 block text-[10px] font-medium">Speed Index</span>
                            <span className="font-bold text-slate-900 mt-1 block">
                              {publicAudit.performanceAnalysis.pageSpeedMetrics.coreWebVitals.speedIndex}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-slate-500" />
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
                            External PageSpeed API Status
                          </h5>
                        </div>
                        <p className="text-xs text-slate-600 font-sans">
                          {publicAudit.performanceAnalysis.statusMessage}
                        </p>
                        <p className="text-[11px] text-slate-400 font-sans pt-1">
                          Locora never fabricates artificial performance scores when Google Lighthouse API keys are unconfigured.
                        </p>
                      </div>
                    )}

                    {/* Direct Live Socket Telemetry */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-600" />
                          <span>Direct Live Socket Telemetry</span>
                        </h5>
                        <span className="text-[11px] text-slate-400 font-mono">Server Handshake Probe</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-medium mb-1">Time To First Byte (TTFB)</span>
                          <span className="text-lg font-bold text-slate-900">
                            {publicAudit.performanceAnalysis.socketTelemetry.serverLatencyTtfbMs}ms
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-medium mb-1">Transferred HTML Size</span>
                          <span className="text-lg font-bold text-slate-900">
                            {publicAudit.performanceAnalysis.socketTelemetry.htmlPayloadSizeKb} KB
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-medium mb-1">Transport Protocol</span>
                          <span className="text-sm font-bold text-slate-900 truncate block">
                            {publicAudit.performanceAnalysis.socketTelemetry.protocol}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-medium mb-1">HTTP Response Code</span>
                          <span className="text-sm font-bold text-emerald-700">
                            HTTP {publicAudit.performanceAnalysis.socketTelemetry.httpStatusCode} OK
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs font-mono text-slate-600">
                        {publicAudit.performanceAnalysis.socketTelemetry.evidence}
                      </div>
                    </div>
                  </div>
                )}

                {/* Section: Value-Gated Product Teasers (Shown on sub-tabs) */}
                {auditTab !== 'quick_checkup' && (
                  <>
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-sm font-bold text-slate-900 font-heading">
                            Unlock Full Locora Platform to Fix & Monitor
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          The free checkup diagnoses what is wrong. Your Locora workspace explains why, how to fix it, and tracks rankings 24/7.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {publicAudit.gatedTeasers.map((teaser) => (
                          <div
                            key={teaser.id}
                            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-heading">
                                  {teaser.question}
                                </span>
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                              <h5 className="text-sm font-bold text-slate-900 font-heading">
                                {teaser.title}
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                                {teaser.teaserDescription}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-[11px] font-medium text-slate-500">
                                {teaser.featureHighlight}
                              </span>
                              <button
                                onClick={() => handleClaimAndUnlock()}
                                className="text-[#059669] hover:text-[#047857] font-bold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <span>Unlock</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Primary CTA Unlock Banner */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#043427] to-[#011a13] text-white space-y-5">
                      <div className="max-w-2xl space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-heading">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Claim Your Business Diagnostic</span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
                          Turn These Findings Into Customers with Locora
                        </h4>
                        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
                          Claiming your audit saves your findings and initializes your autonomous Business Brain.
                          Locora AI will immediately prioritize your highest-ROI fixes and generate copy-paste ready Schema.org code.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <button
                          onClick={() => handleClaimAndUnlock()}
                          className="px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer font-sans"
                        >
                          <span>Claim My Business & Unlock Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleResetCheckup}
                          className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-xl transition-all cursor-pointer font-sans"
                        >
                          Check Another Website
                        </button>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-200/80 font-medium">
                        <span className="flex items-center gap-1">✓ No credit card required</span>
                        <span className="flex items-center gap-1">✓ Live diagnostic imported into your workspace</span>
                        <span className="flex items-center gap-1">✓ 100% Free tier included</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Pre-Audit Preview (Clean, Authentic, Zero Fake Data) */
            <div className="p-8 sm:p-12 text-center space-y-8">
              <div className="max-w-2xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-semibold font-heading uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" />
                  <span>100% Real Website Diagnostic</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
                  Instant Public Business Health Checkup
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-sans max-w-xl mx-auto">
                  Enter any website URL above to inspect technical search readiness, server response latency, and Schema.org structured data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold font-heading text-slate-900">
                    1. Technical SEO & Headers
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Scans live title tags, meta descriptions, canonical declarations, H1 heading structure, and image alt text compliance.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold font-heading text-slate-900">
                    2. Speed & TTFB Latency
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Measures real-time server handshake time, HTML transfer size, and HTTPS security protocol validation.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold font-heading text-slate-900">
                    3. Local Schema & Footprint
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Detects Schema.org LocalBusiness JSON-LD markup, direct telephone links, and physical address discovery in live HTML.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('hero-input');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer font-sans"
                >
                  <span>Enter Your Website to Check</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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

      {/* 04.5 — NEW FEATURE: VERIFIED LOCAL BUSINESS DIRECTORY */}
      <section id="business-directory-feature" className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Feature · Verified Directory Network</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            The Locora Verified Local Business Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
            Connect with high-intent local customers looking for accredited service professionals. Every listing is fortified with Google Business Profile synchronization, Schema.org LocalBusiness structured data, verified reviews, and Generative Engine Optimization (GEO) citations across 2026 AI search engines.
          </p>
        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">Accredited Trust Badge</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Google Business Profile synchronization, active operating hours, license verification, and authentic reviews give consumers instant confidence over unverified competitors.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">2026 AI Search (GEO)</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Engineered with full Schema.org structured data and entity graph markup, enabling ChatGPT, Google Gemini, and Perplexity to cite and recommend your business in conversational search.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">Hyper-Local SEO Pages</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Programmatic city and category hubs (e.g. Austin Dentists, Miami HVAC) built to index cleanly on search engines and capture organic high-intent local customer queries.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">0% Commission Leads</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Customers call, visit, or submit free quote requests straight into your business CRM. Zero broker commissions, zero lead auctions, and zero hidden referral fees.
            </p>
          </div>
        </div>

        {/* Interactive Directory Showcase Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Verified Listing Mockup Card */}
            <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-5 backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold font-heading">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  <span>Locora Verified Business</span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Google Business Synced
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xl font-bold font-heading text-white">Apex Heating & Air Conditioning</h4>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                    <span className="text-slate-400 font-normal">(142 verified reviews)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Austin, TX • South Congress Metro • Serving Central Texas</span>
                </p>
              </div>

              {/* Service Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {['24/7 Emergency AC Repair', 'Heat Pump Installation', 'Ductless Mini-Splits', 'Seasonal Tune-Up'].map((svc, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-700/70 border border-slate-600/50 text-[11px] text-slate-200 font-medium">
                    {svc}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateToDirectory()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-sans shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request Direct Quote (0% Fee)</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToDirectory()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Direct: (512) 555-0198</span>
                </button>
              </div>
            </div>

            {/* Right: Directory Ecosystem & Quick Category Discovery */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <h4 className="text-lg font-bold font-heading text-white">Explore By Service Category</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Browse accredited local businesses across thousands of indexed categories with authentic reviews and verified ratings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Dentists', count: '450+' },
                  { name: 'HVAC & AC', count: '380+' },
                  { name: 'Plumbing', count: '320+' },
                  { name: 'Contractors', count: '290+' },
                  { name: 'Auto Repair', count: '410+' },
                  { name: 'Med Spas', count: '210+' },
                  { name: 'Law Firms', count: '180+' },
                  { name: 'Electricians', count: '260+' },
                ].map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => navigateToDirectory()}
                    className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-400/50 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded font-mono">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateToDirectory()}
                  className="w-full sm:w-auto px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-heading uppercase tracking-wider"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Directory Listings</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToDirectory()}
                  className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-heading"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Claim or Add Business</span>
                </button>
              </div>
            </div>
          </div>
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

      {/* 13 — PRICING CALLOUT BANNER (MODELS MOVED TO /pricing) */}
      <section id="pricing" className="max-w-5xl mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-emerald-300 transition-all">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Transparent Pricing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Predictable Plans for Solo Businesses & Agencies
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans max-w-xl leading-relaxed">
              Explore our flexible subscription plans—including our free Forever Explorer plan, Pro AI Growth ($29/mo), and multi-client Agency Elite ($99/mo)—with full feature comparisons and guarantees.
            </p>
          </div>
          <button
            onClick={() => navigateTo('pricing_public', '/pricing')}
            className="px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer font-heading uppercase tracking-wider"
          >
            <span>View All Pricing Plans</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 14 — FAQ SECTION */}
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
