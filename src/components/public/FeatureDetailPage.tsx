import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SEO_FEATURES_DATABASE, SeoFeatureItem } from '../../data/seoData';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  Globe,
  TrendingUp,
  FileText,
  Users,
  FileSpreadsheet,
  MapPin,
  ShieldCheck,
  Zap,
  MessageSquare,
  Star,
  Search,
  Target,
  DollarSign,
  Calendar,
  Layers,
  Award,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Clock,
  UserCheck,
  AlertTriangle,
  Play,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Globe,
  TrendingUp,
  FileText,
  Users,
  FileSpreadsheet,
  MapPin,
  ShieldCheck,
  Zap,
  MessageSquare,
  Star,
  Search,
  Target,
  DollarSign,
  Calendar,
  Layers,
  Award,
  BarChart3,
  CheckCircle2,
};

interface FeatureDetailPageProps {
  slug?: string;
}

export const FeatureDetailPage: React.FC<FeatureDetailPageProps> = ({ slug }) => {
  const { setActiveTab, user } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeStepTab, setActiveStepTab] = useState<number>(0);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customBusinessInput, setCustomBusinessInput] = useState<string>('');
  const [isSandboxGenerating, setIsSandboxGenerating] = useState<boolean>(false);
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);

  // Find the feature by slug or alias
  const currentSlug =
    slug ||
    (typeof window !== 'undefined'
      ? window.location.pathname
          .replace(/^\/features\//, '')
          .replace(/^\/feature\//, '')
          .replace(/^\/feature_/, '')
          .replace(/^\/feature-/, '')
          .trim()
      : 'ai-business-audit');

  const feature: SeoFeatureItem =
    Object.values(SEO_FEATURES_DATABASE).find(
      (f) => f.slug === currentSlug || (f.aliases && f.aliases.includes(currentSlug))
    ) || SEO_FEATURES_DATABASE['ai-business-audit'];

  const HeroIcon = ICON_MAP[feature.iconName] || Sparkles;

  // Initialize sandbox preset result on load
  useEffect(() => {
    if (feature.sandbox && feature.sandbox.presets && feature.sandbox.presets.length > 0) {
      setSandboxResult(feature.sandbox.presets[0].sampleOutput);
      setCustomBusinessInput(feature.sandbox.presets[0].sampleInput);
    }
  }, [feature]);

  // Dynamic document title and structured data
  useEffect(() => {
    document.title = feature.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', feature.metaDescription);
    }

    // Inject JSON-LD Schema (TechArticle / SoftwareApplication)
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'feature-jsonld-schema';
    schemaScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      'headline': feature.heroHeadline,
      'description': feature.metaDescription,
      'author': {
        '@type': 'Person',
        'name': feature.authorName || 'Locora AI Editorial Team',
        'jobTitle': feature.authorRole || 'Local Search Strategist',
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Locora AI',
        'url': 'https://locoraai.com',
      },
      'datePublished': '2026-08-01',
      'dateModified': '2026-08-20',
      'mainEntity': {
        '@type': 'FAQPage',
        'mainEntity': feature.faqs.map((faq) => ({
          '@type': 'Question',
          'name': faq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.a,
          },
        })),
      },
    });

    const oldScript = document.getElementById('feature-jsonld-schema');
    if (oldScript) oldScript.remove();
    document.head.appendChild(schemaScript);

    return () => {
      const s = document.getElementById('feature-jsonld-schema');
      if (s) s.remove();
    };
  }, [feature]);

  const handleLaunchTool = () => {
    if (user?.isAuthenticated) {
      setActiveTab(feature.targetTab);
    } else {
      setActiveTab('signup');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSandbox = () => {
    const el = document.getElementById('interactive-sandbox');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRunSandboxTest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSandboxGenerating(true);
    setTimeout(() => {
      setIsSandboxGenerating(false);
      const preset = feature.sandbox?.presets[selectedPresetIndex];
      const customPrefix = customBusinessInput ? `Analysis for "${customBusinessInput}":\n\n` : '';
      setSandboxResult(
        customPrefix + (preset ? preset.sampleOutput : 'Diagnostic complete. 3 high-impact optimization recommendations generated successfully.')
      );
    }, 600);
  };

  const handleCopySandbox = () => {
    if (sandboxResult) {
      navigator.clipboard.writeText(sandboxResult);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    }
  };

  const otherFeatures = Object.values(SEO_FEATURES_DATABASE)
    .filter((f) => f.slug !== feature.slug)
    .slice(0, 4);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-xs py-3.5 px-6 text-xs text-slate-500 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-0.5">
            <button
              onClick={() => setActiveTab('home')}
              className="hover:text-slate-900 cursor-pointer font-medium"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => setActiveTab('features')}
              className="hover:text-slate-900 cursor-pointer font-medium"
            >
              Features & Guides
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold">{feature.name}</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleScrollToSandbox}
              className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            >
              Try Live Demo
            </button>
            <button
              onClick={handleLaunchTool}
              className="px-3.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {user ? 'Open in Workspace' : 'Sign Up Free'}
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Article Hero Header */}
      <section className="py-14 sm:py-18 px-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-heading uppercase tracking-wide">
            <HeroIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>{feature.badge}</span>
          </div>
          {feature.readingTime && (
            <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{feature.readingTime}</span>
            </div>
          )}
          {feature.publishedDate && (
            <span className="text-xs text-slate-400">• Updated {feature.publishedDate}</span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-slate-900 tracking-tight leading-[1.15]">
          {feature.heroHeadline}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-4xl">
          {feature.heroSubheadline}
        </p>

        {/* Author / Expert Attribution Banner */}
        <div className="pt-2 flex items-center gap-3 border-t border-slate-200">
          <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
            {feature.authorName
              ? feature.authorName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
              : 'LA'}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Written by {feature.authorName || 'Alex Rivera'}
            </div>
            <div className="text-[11px] text-slate-500">
              {feature.authorRole || 'Head of Local Search Strategy'} • Verified Editorial Standard
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Overview: The Core Guide */}
      <section className="py-8 px-6 max-w-5xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-emerald-700" />
              <span>Strategic Overview & Methodology</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
              {feature.editorialOverview.leadParagraph}
            </p>
          </div>

          <div className="p-6 bg-slate-50 border-l-4 border-emerald-600 rounded-r-2xl space-y-2">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Why This Matters for Local Businesses
            </h3>
            <p className="text-sm font-medium text-slate-800 leading-relaxed font-sans">
              {feature.editorialOverview.whyItMatters}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold font-heading text-slate-900">
              Core Technical Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {feature.editorialOverview.coreCapabilities.map((cap, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-sans border-t border-slate-100 pt-4">
            <span className="font-semibold text-slate-700">Architecture Note: </span>
            {feature.editorialOverview.technicalArchitecture}
          </div>
        </div>
      </section>

      {/* How to Use Step-by-Step Guide */}
      <section className="py-12 px-6 max-w-5xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-bold font-heading uppercase">
            <span>Execution SOP</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            How to Use {feature.name}: Step-by-Step
          </h2>
          <p className="text-sm text-slate-600 font-sans">
            Follow this actionable standard operating procedure to achieve optimal results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {feature.howToUseGuide.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-extrabold text-sm font-heading">
                  {step.stepNumber}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Phase {step.stepNumber}
                </span>
              </div>
              <h3 className="text-base font-bold font-heading text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{step.description}</p>
              {step.proTip && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-sans leading-relaxed">
                  <span className="font-bold">Pro Tip: </span>
                  {step.proTip}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Honest Pros & Cons Section */}
      <section className="py-12 px-6 max-w-5xl mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Advantages, Trade-Offs & Limitations
          </h2>
          <p className="text-sm text-slate-600 font-sans">
            An honest, transparent evaluation of when to use this capability and when manual intervention is preferred.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold font-heading text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Key Advantages & Strengths</span>
            </div>
            <ul className="space-y-3">
              {feature.prosAndCons.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium font-sans leading-relaxed">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="bg-slate-100/80 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm uppercase tracking-wider">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Considerations & Limitations</span>
            </div>
            <ul className="space-y-3">
              {feature.prosAndCons.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-sans leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Public Sandbox (No Login Required) */}
      <section id="interactive-sandbox" className="py-14 px-6 max-w-5xl mx-auto space-y-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold font-heading mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Public Sandbox (No Account Required)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading">
                {feature.sandbox?.heading || `Test ${feature.name} Live`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {feature.sandbox?.subheading ||
                  'Select a preset industry scenario or enter your own parameters to generate an instant preview deliverable.'}
              </p>
            </div>
          </div>

          {/* Preset Selector */}
          {feature.sandbox?.presets && feature.sandbox.presets.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select a Sample Scenario:
              </span>
              <div className="flex flex-wrap gap-2">
                {feature.sandbox.presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPresetIndex(idx);
                      setCustomBusinessInput(preset.sampleInput);
                      setSandboxResult(preset.sampleOutput);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedPresetIndex === idx
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {preset.businessName} ({preset.industry})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleRunSandboxTest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Input Parameters / Target Domain:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customBusinessInput}
                  onChange={(e) => setCustomBusinessInput(e.target.value)}
                  placeholder="e.g. https://apexservices.com or Client Name"
                  className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isSandboxGenerating}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 font-heading"
                >
                  {isSandboxGenerating ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Simulating...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Run Free Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Result Output Preview */}
          {sandboxResult && (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                <span className="text-emerald-400 font-bold">
                  {feature.sandbox?.presets[selectedPresetIndex]?.outputType ||
                    'AI Deliverable Preview'}
                </span>
                <button
                  onClick={handleCopySandbox}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  {copiedResult ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Output</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed overflow-x-auto">
                {sandboxResult}
              </pre>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 border-t border-slate-800">
            <span>Want to generate real-time reports with live web crawling?</span>
            <button
              onClick={handleLaunchTool}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-colors cursor-pointer font-heading"
            >
              {user ? 'Open Full Workspace' : 'Get Free Account (25 Credits)'}
            </button>
          </div>
        </div>
      </section>

      {/* Real-World Case Study Section */}
      {feature.caseStudy && (
        <section className="py-12 px-6 max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-bold font-heading uppercase">
              <span>Verified Case Study</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              Real-World Application: {feature.caseStudy.businessName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-sans">
              {feature.caseStudy.industry} • {feature.caseStudy.location}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-rose-600 tracking-wider">
                  The Challenge
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {feature.caseStudy.challenge}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
                  The Solution
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {feature.caseStudy.solution}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {feature.caseStudy.results.map((res, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {res.label}
                  </span>
                  <span className="text-xl font-extrabold font-heading text-slate-900">
                    {res.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 gap-2">
              <span>Time spent manually: <strong className="text-slate-700">{feature.caseStudy.timeSpentBefore}</strong></span>
              <span>Time with Locora AI: <strong className="text-emerald-700">{feature.caseStudy.timeSpentAfter}</strong></span>
            </div>
          </div>
        </section>
      )}

      {/* Best Practices & Common Mistakes Grid */}
      <section className="py-12 px-6 max-w-5xl mx-auto space-y-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
          Best Practices & Pitfalls to Avoid
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold font-heading text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Recommended Best Practices</span>
            </h3>
            <ul className="space-y-3">
              {feature.bestPractices?.map((bp, i) => (
                <li key={i} className="text-xs text-slate-700 font-sans leading-relaxed flex items-start gap-2">
                  <span className="text-emerald-700 font-bold mt-0.5">•</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold font-heading text-rose-800 uppercase tracking-wider flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Common Mistakes to Avoid</span>
            </h3>
            <ul className="space-y-3">
              {feature.commonMistakes?.map((cm, i) => (
                <li key={i} className="text-xs text-slate-700 font-sans leading-relaxed flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>{cm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 px-6 max-w-4xl mx-auto space-y-8 border-t border-slate-200">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Clear answers to common technical and operational questions.
          </p>
        </div>

        <div className="space-y-3">
          {feature.faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold font-heading text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      isOpen ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed font-sans border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Related Features Internal Links */}
      <section className="py-12 px-6 max-w-5xl mx-auto border-t border-slate-200 space-y-6">
        <h3 className="text-xs font-bold font-heading text-slate-800 uppercase tracking-wider">
          Explore Related Guides & Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherFeatures.map((of) => (
            <button
              key={of.slug}
              onClick={() => {
                window.history.pushState({}, '', `/features/${of.slug}`);
                setActiveTab(`feature_${of.slug}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50/20 text-left transition-all cursor-pointer space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-heading">
                <span>{of.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 font-sans">
                {of.heroSubheadline}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom Conversion / Next Step */}
      <section className="py-16 px-6 bg-slate-900 text-white text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
            Ready to Put {feature.name} to Work?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Start with 25 free AI Copilot credits. No credit card required. Generate live audits, proposals, schema, and review replies.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLaunchTool}
              className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-heading"
            >
              <span>{user ? 'Open in Workspace' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleScrollToSandbox}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer font-heading border border-slate-700"
            >
              <span>Test Interactive Sandbox</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
