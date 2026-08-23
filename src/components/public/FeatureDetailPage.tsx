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
  const { setActiveTab } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [interactiveInput, setInteractiveInput] = useState('');
  const [simulatedResult, setSimulatedResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Find the feature by slug or alias
  const currentSlug = slug || (typeof window !== 'undefined' ? window.location.pathname.replace(/^\/features\//, '').trim() : 'ai-business-audit');
  
  const feature: SeoFeatureItem = Object.values(SEO_FEATURES_DATABASE).find(
    (f) => f.slug === currentSlug || (f.aliases && f.aliases.includes(currentSlug))
  ) || SEO_FEATURES_DATABASE['ai-business-audit'];

  const HeroIcon = ICON_MAP[feature.iconName] || Sparkles;

  // Dynamic document title and structured data
  useEffect(() => {
    document.title = feature.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', feature.metaDescription);
    }

    // Inject JSON-LD Schema
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'feature-jsonld-schema';
    schemaScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': `Locora AI - ${feature.name}`,
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web',
      'description': feature.metaDescription,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
      },
      'featureList': feature.keyBenefits.map((b) => b.title),
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
    setActiveTab(feature.targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRunInteractiveDemo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setSimulatedResult(
        `Generated analysis for "${interactiveInput || 'Apex Services'}": Top ranking opportunity identified with +42% projected growth in local 3-Pack impressions.`
      );
    }, 600);
  };

  const otherFeatures = Object.values(SEO_FEATURES_DATABASE).filter((f) => f.slug !== feature.slug).slice(0, 4);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xs py-3 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button onClick={() => setActiveTab('home')} className="hover:text-slate-900 cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={() => setActiveTab('features')} className="hover:text-slate-900 cursor-pointer">Features</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{feature.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-8 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
          <HeroIcon className="w-4 h-4 text-[#059669]" />
          <span>{feature.badge}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          {feature.heroHeadline}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {feature.heroSubheadline}
        </p>

        {/* Primary CTA Funnel Block */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleLaunchTool}
            className="w-full sm:w-auto px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-heading group"
          >
            <span>{feature.ctaText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <p className="text-xs text-slate-500 font-sans">{feature.ctaSubtext}</p>

        {/* Live Interactive Preview Card */}
        <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md max-w-4xl mx-auto text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit mb-1 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-[#059669]" />
                <span>Live Interactive Workspace Preview</span>
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900">{feature.samplePreview.title}</h3>
              <p className="text-xs text-slate-500">{feature.samplePreview.description}</p>
            </div>
            <button
              onClick={handleLaunchTool}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Open in Locora</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {feature.samplePreview.stats.map((st, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">{st.label}</span>
                <span className="text-sm font-extrabold font-heading text-slate-900">{st.value}</span>
              </div>
            ))}
          </div>

          {/* Output Snippet Container */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
              <span className="font-bold text-emerald-400">{feature.samplePreview.snippetLabel}</span>
              <span>Autonomous AI Deliverable</span>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed pt-1">
              {feature.samplePreview.snippetContent}
            </pre>
          </div>
        </div>
      </section>

      {/* Key Benefits Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-12 border-t border-slate-200">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold font-heading text-slate-900">
            Why High-Growth Teams Rely on {feature.name}
          </h2>
          <p className="text-sm text-slate-600">
            Engineered specifically to automate client deliverables, increase proposal win rates, and scale local business revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feature.keyBenefits.map((benefit, i) => {
            const BIcon = ICON_MAP[benefit.icon] || Zap;
            return (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-emerald-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669]">
                  <BIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900">{benefit.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Before vs. After Workflow Comparison */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-bold font-heading uppercase">
            <span>Workflow Evolution</span>
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-slate-900">
            Manual Friction vs. Locora AI Automation
          </h2>
          <p className="text-sm text-slate-600">
            See how automating administrative tasks translates to dozens of recovered hours every week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Old Manual Way */}
          <div className="p-8 bg-rose-50/50 border border-rose-200 rounded-3xl space-y-6">
            <div className="flex items-center gap-2.5 text-rose-800 font-bold font-heading text-sm uppercase tracking-wider">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>The Old Manual Way</span>
            </div>
            <ul className="space-y-3.5">
              {feature.workflowComparison.manualOldWay.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The Locora AI Way */}
          <div className="p-8 bg-emerald-50/70 border-2 border-emerald-300 rounded-3xl space-y-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold font-heading text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              <span>With Locora AI Copilot</span>
            </div>
            <ul className="space-y-3.5">
              {feature.workflowComparison.locoraAiWay.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-900 font-medium leading-relaxed font-sans">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-8 border-t border-slate-200">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Everything you need to know about using {feature.name} for your business or agency.
          </p>
        </div>

        <div className="space-y-3">
          {feature.faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold font-heading text-slate-900">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-[#059669]' : ''}`} />
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

      {/* Explore Related Features Link Graph */}
      <section className="py-12 px-6 max-w-7xl mx-auto border-t border-slate-200 space-y-6">
        <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
          Explore Other Locora AI Modules
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
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#059669] hover:bg-emerald-50/20 text-left transition-all cursor-pointer space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-heading">
                <span>{of.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#059669]" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 font-sans">{of.heroSubheadline}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="py-16 px-6 bg-slate-900 text-white text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">
            Ready to Automate with {feature.name}?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-sans">
            Start on our Free Starter plan with 25 complimentary AI Copilot credits. No credit card required.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLaunchTool}
              className="px-8 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-heading"
            >
              <span>{feature.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
