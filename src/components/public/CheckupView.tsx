import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  trackCheckupStarted,
  trackCheckupSubmitted,
  trackCheckupResultViewed,
  trackCtaClick,
  trackSignupStarted,
} from '../../lib/analytics';
import { build40PointAudit, Audit40EvaluationResult } from '../../utils/audit40PointsGenerator';
import {
  Search,
  Globe,
  MapPin,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Gauge,
  Lock,
  Star,
  Layers,
  HelpCircle,
  Eye,
} from 'lucide-react';

const COMMON_CATEGORIES = [
  'Dental Clinic',
  'HVAC & Air Conditioning',
  'Plumbing & Drainage',
  'General Contractor & Roofing',
  'Real Estate Agency',
  'Auto Repair & Detailing',
  'Med Spa & Aesthetics',
  'Law Firm & Attorney',
  'Restaurant & Catering',
  'Home Cleaning & Maid Services',
  'Veterinary & Pet Care',
  'Software & AI Marketing',
  'Other Local Business',
];

export const CheckupView: React.FC = () => {
  const { setActiveTab, setAuthModalOpen, user } = useApp();

  const [businessName, setBusinessName] = useState('');
  const [website, setWebsite] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [category, setCategory] = useState('Dental Clinic');

  const [hasStartedForm, setHasStartedForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [auditResult, setAuditResult] = useState<Audit40EvaluationResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Read any pre-filled parameters or query strings
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const qName = params.get('name') || params.get('business') || '';
      const qWeb = params.get('url') || params.get('website') || '';
      const qCity = params.get('city') || params.get('location') || '';
      const qCat = params.get('category') || '';

      if (qName) setBusinessName(qName);
      if (qWeb) setWebsite(qWeb);
      if (qCity) setLocationCity(qCity);
      if (qCat && COMMON_CATEGORIES.includes(qCat)) setCategory(qCat);

      // Check if user already had a pending checkup in this session
      const saved = sessionStorage.getItem('locora_pending_checkup');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.auditResult) {
          setAuditResult(parsed.auditResult);
          if (parsed.businessName) setBusinessName(parsed.businessName);
          if (parsed.website) setWebsite(parsed.website);
          if (parsed.locationCity) setLocationCity(parsed.locationCity);
        }
      }
    } catch (e) {
      console.warn('[Checkup] Error loading query params:', e);
    }
  }, []);

  // Track checkup_started on first input interaction
  const handleInputFocusOrChange = () => {
    if (!hasStartedForm) {
      setHasStartedForm(true);
      trackCheckupStarted('/checkup', {
        initial_name: businessName || undefined,
        initial_website: website || undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;

    const trimmedName = businessName.trim();
    let trimmedWebsite = website.trim();
    const trimmedCity = locationCity.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your business name.');
      return;
    }

    if (!trimmedWebsite) {
      setErrorMessage('Please enter your business website or domain.');
      return;
    }

    // Clean and validate website format
    if (!/^https?:\/\//i.test(trimmedWebsite)) {
      trimmedWebsite = `https://${trimmedWebsite}`;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisProgress("Connecting to Google Search crawlers & scanning website...");

    // Fire checkup_submitted key event
    trackCheckupSubmitted({
      businessName: trimmedName,
      website: trimmedWebsite,
      city: trimmedCity,
      category,
    });

    try {
      // Step 1: Progress updates
      const t1 = setTimeout(() => {
        setAnalysisProgress("Extracting Google Search snippet, title tags & meta descriptions...");
      }, 1200);

      const t2 = setTimeout(() => {
        setAnalysisProgress("Evaluating mobile viewport, SSL, and LocalBusiness schema markup...");
      }, 2500);

      // Step 2: Call the real live audit engine
      const res = await fetch('/api/ai/audit-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: trimmedWebsite,
          businessProfile: {
            name: trimmedName,
            website: trimmedWebsite,
            city: trimmedCity,
            category,
          },
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      const data = await res.json();
      if (!res.ok && !data?.metadata) {
        throw new Error(data.message || data.error || 'Could not complete the website checkup. Please verify your URL.');
      }

      // Step 3: Evaluate real 40-point diagnostics using official generator
      const evaluation = build40PointAudit(trimmedWebsite, data);
      setAuditResult(evaluation);

      // Store in session so user preserves results if they proceed to signup
      sessionStorage.setItem(
        'locora_pending_checkup',
        JSON.stringify({
          businessName: trimmedName,
          website: trimmedWebsite,
          locationCity: trimmedCity,
          category,
          auditResult: evaluation,
          timestamp: new Date().toISOString(),
        })
      );

      // Fire checkup_result_viewed
      trackCheckupResultViewed({
        overallScore: evaluation.overallScore,
        businessName: trimmedName,
        website: trimmedWebsite,
      });

      // Smooth scroll to initial results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('[Checkup] Analysis error:', err);
      setErrorMessage(err.message || 'Unable to analyze website. Please ensure the domain is public and reachable.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const handleUnlockFullReport = () => {
    trackCtaClick('unlock_full_report', '/checkup', '/signup');
    trackSignupStarted('/checkup', 'checkup_funnel');

    if (user.isAuthenticated) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('signup');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* 01 — HERO & FORM SECTION */}
      <section className="relative bg-gradient-to-br from-[#022c22] via-[#044a36] to-[#011a13] text-white pt-16 pb-20 px-6 sm:px-12 shadow-xl overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#047857]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#6ee7b7] text-xs font-semibold font-heading tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-[#6ee7b7]" />
            <span>Real-Time Local Visibility Diagnostic</span>
          </div>

          {/* Target Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.12]">
            See Your Business Through Google&apos;s Eyes
          </h1>

          {/* Target Supporting Copy */}
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-sans">
            Check how your business appears in Google Search and Maps and discover the actions that can improve your local visibility.
          </p>

          {/* Simple Premium Form */}
          <div className="max-w-2xl mx-auto mt-8 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-emerald-100 text-left">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Business Name <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        handleInputFocusOrChange();
                      }}
                      onFocus={handleInputFocusOrChange}
                      placeholder="e.g. Metro Dental Care"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans transition-all"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Website URL <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={website}
                      onChange={(e) => {
                        setWebsite(e.target.value);
                        handleInputFocusOrChange();
                      }}
                      onFocus={handleInputFocusOrChange}
                      placeholder="e.g. metrodental.com"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City / Location */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    City / Target Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={locationCity}
                      onChange={(e) => {
                        setLocationCity(e.target.value);
                        handleInputFocusOrChange();
                      }}
                      onFocus={handleInputFocusOrChange}
                      placeholder="e.g. Austin, TX"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans transition-all"
                    />
                  </div>
                </div>

                {/* Business Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Business Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      handleInputFocusOrChange();
                    }}
                    onFocus={handleInputFocusOrChange}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans transition-all"
                  >
                    {COMMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Primary CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full py-4 px-6 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-sans disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-white" />
                      <span>{analysisProgress || 'Checking Business...'}</span>
                    </>
                  ) : (
                    <>
                      <span>Check My Business</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 text-xs pt-2">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Free instant scan
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Real Google signals
                </span>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 02 — RESULTS DISPLAY (IF AVAILABLE) */}
      {auditResult && (
        <section ref={resultsRef} className="max-w-5xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Website Scan Complete</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {businessName || 'Your Business'} Visibility Summary
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Audited Website: <span className="font-mono font-medium text-slate-800">{auditResult.cleanDomain}</span>
                {locationCity && <> • Target Location: <span className="font-semibold text-slate-800">{locationCity}</span></>}
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
              <div className="text-center">
                <div className={`text-4xl sm:text-5xl font-extrabold font-mono ${
                  auditResult.overallScore >= 75 ? 'text-emerald-600' : auditResult.overallScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {auditResult.overallScore}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  Health Score
                </div>
              </div>

              <div className="border-l border-slate-200 pl-4 space-y-1 text-xs text-slate-600">
                <div>
                  <span className="font-bold text-emerald-600">{auditResult.passedCount}</span> Passed
                </div>
                <div>
                  <span className="font-bold text-amber-600">{auditResult.warningCount}</span> Opportunities
                </div>
                <div>
                  <span className="font-bold text-rose-600">{auditResult.failedCount}</span> Critical Gaps
                </div>
              </div>
            </div>
          </div>

          {/* "How Google Sees You" Preview Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Search Desktop Snippet Preview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-heading">Google Search Snippet Preview</h3>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Desktop / Mobile</span>
              </div>

              {/* Simulated Google Search Result */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-1 font-sans">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-[10px]">🌐</div>
                  <span className="truncate">{auditResult.url || `https://${auditResult.cleanDomain}`}</span>
                </div>
                <h4 className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer line-clamp-1">
                  {auditResult.crawlSummary.title || `${businessName} | ${category} in ${locationCity || 'Local Area'}`}
                </h4>
                <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {auditResult.crawlSummary.description ||
                    `Visit ${businessName} for top-rated ${category.toLowerCase()} services in ${locationCity || 'your area'}. Contact us today to learn more.`}
                </p>
              </div>

              <div className="text-xs text-slate-500 space-y-1 pt-1">
                <p className="flex items-center gap-1.5">
                  {auditResult.crawlSummary.title ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span>Title Tag: <strong>{auditResult.crawlSummary.title ? `${auditResult.crawlSummary.title.length} characters` : 'Missing title tag'}</strong></span>
                </p>
                <p className="flex items-center gap-1.5">
                  {auditResult.crawlSummary.description ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span>Meta Description: <strong>{auditResult.crawlSummary.description ? `${auditResult.crawlSummary.description.length} characters` : 'Missing description tag'}</strong></span>
                </p>
              </div>
            </div>

            {/* Google Maps & Local Pack Card Preview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-heading">Google Maps 3-Pack Presence</h3>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Local Intent</span>
              </div>

              <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{businessName}</h4>
                    <p className="text-xs text-slate-500">{category} {locationCity && `• ${locationCity}`}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-md">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>4.8</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className={`w-3.5 h-3.5 ${auditResult.crawlSummary.sslActive ? 'text-emerald-600' : 'text-rose-600'}`} />
                    <span>SSL Secure: {auditResult.crawlSummary.sslActive ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mobile Ready: Pass</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className={`w-3.5 h-3.5 ${auditResult.crawlSummary.hasSchema ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <span>Local Schema: {auditResult.crawlSummary.hasSchema ? 'Detected' : 'Missing'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Latency: {auditResult.crawlSummary.latencyMs}ms</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Local ranking algorithms prioritize verified profiles with matching NAP (Name, Address, Phone), schema markup, and fast mobile responses.
              </p>
            </div>
          </div>

          {/* Pillars Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Key Local Visibility Pillars Evaluated
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {auditResult.pillars.map((pillar) => (
                <div key={pillar.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                    {pillar.label}
                  </span>
                  <span className={`text-2xl font-extrabold font-mono ${
                    pillar.score >= 75 ? 'text-emerald-600' : pillar.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {pillar.score}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {pillar.passedCount} / {pillar.totalCount} tests passed
                  </span>
                </div>
              ))}
            </div>

            {/* Top 3 High-Impact Observations */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Top Priority Action Items Discovered
              </h4>
              <div className="space-y-2">
                {auditResult.points
                  .filter((p) => p.status === 'fail' || p.status === 'warning')
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                        item.status === 'fail' ? 'text-rose-600' : 'text-amber-600'
                      }`} />
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            item.impact === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.impact} Impact
                          </span>
                        </div>
                        <p className="text-slate-600">{item.diagnostic}</p>
                        <p className="text-emerald-700 font-medium">Recommendation: {item.remediation}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 03 — UNLOCK YOUR FULL REPORT CTA CARD */}
          <div className="bg-gradient-to-br from-[#022c22] via-[#044a36] to-[#011a13] rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-6 text-center border border-emerald-500/30">
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-[#6ee7b7] text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Complete 40-Point Diagnostic Ready</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
                Unlock Your Full Report
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Connect your business to Locora AI to access your full 40-point technical audit, Search Console-powered visibility tracking, competitor intelligence, and 1-click AI fix generators.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleUnlockFullReport}
                className="w-full sm:w-auto px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>Unlock Your Full Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-emerald-200/80 pt-1 flex flex-wrap items-center justify-center gap-4">
              <span>✓ Import audit directly to your workspace</span>
              <span>✓ Free account included</span>
              <span>✓ No credit card required</span>
            </div>
          </div>
        </section>
      )}

      {/* 03 — BENEFIT PROOFS & ACCORDION (LOCORA STANDARD SYSTEM) */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            Why Local Visibility Decides Most Inbound Customers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            When potential customers in your city search for local services, Google makes instantaneous ranking decisions based on crawlable signals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">Google Maps 3-Pack</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Most clicks for local searches go directly to the top 3 Google Maps listings. Consistent NAP citations and local schemas secure that coveted real estate.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">AI Search Engine Discovery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Gemini, ChatGPT, and Apple Intelligence rely on verified directory schema and accurate business attributes to recommend local contractors and clinics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">Fast Deterministic Remediation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fix missing meta descriptions, broken heading tags, slow mobile rendering, and unlinked citations with Locora&apos;s pre-packaged 1-click prompt copilot.
            </p>
          </div>
        </div>
      </section>

      {/* 04 — FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            Common Questions
          </h2>
        </div>
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 font-heading">Can a missed phone call really cost me money?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Since October 1, 2026, Google&apos;s Local Services Ads treats a missed business-hours call as a billable lead when the caller waits more than 20 seconds. A phone that rings out doesn&apos;t just lose the job anymore — it can also cost you the lead fee. <a href="https://ppc.land/google-lsa-advertisers-face-missed-call-charges-from-october-1/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">Source</a>
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 font-heading">What happens after I unlock my full report?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your audit is imported into a free Locora workspace as your first business. From there you can connect your Google Business Profile, track visibility, manage reviews, and generate AI fixes — no credit card required.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 font-heading">Is the checkup really free?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yes. The checkup is a free automated scan of your website and public listings. No credit card required.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 font-heading">What does the checkup scan?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your website&apos;s technical health, on-page SEO, local signals (name, phone, and address consistency), content depth, structured data, and performance — scored from the live crawl of your site.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
