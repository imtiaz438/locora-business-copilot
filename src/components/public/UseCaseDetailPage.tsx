import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SEO_USE_CASES_DATABASE, SeoUseCaseItem } from '../../data/seoData';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Target,
  BarChart3,
  Layers,
  Zap,
} from 'lucide-react';

interface UseCaseDetailPageProps {
  slug?: string;
}

export const UseCaseDetailPage: React.FC<UseCaseDetailPageProps> = ({ slug }) => {
  const { setActiveTab } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const currentSlug =
    slug ||
    (typeof window !== 'undefined'
      ? window.location.pathname.replace(/^\/use-cases\//, '').trim()
      : 'local-seo');

  const useCase: SeoUseCaseItem =
    SEO_USE_CASES_DATABASE[currentSlug] || SEO_USE_CASES_DATABASE['local-seo'];

  useEffect(() => {
    document.title = useCase.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', useCase.metaDescription);
    }

    // Inject JSON-LD Schema
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'usecase-jsonld-schema';
    schemaScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': useCase.title,
      'description': useCase.metaDescription,
      'step': useCase.solutions.map((sol) => ({
        '@type': 'HowToStep',
        'name': sol.title,
        'text': sol.desc,
      })),
      'mainEntity': {
        '@type': 'FAQPage',
        'mainEntity': useCase.faqs.map((faq) => ({
          '@type': 'Question',
          'name': faq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.a,
          },
        })),
      },
    });

    const oldScript = document.getElementById('usecase-jsonld-schema');
    if (oldScript) oldScript.remove();
    document.head.appendChild(schemaScript);

    return () => {
      const s = document.getElementById('usecase-jsonld-schema');
      if (s) s.remove();
    };
  }, [useCase]);

  const handleLaunchTool = () => {
    setActiveTab(useCase.targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const otherUseCases = Object.values(SEO_USE_CASES_DATABASE).filter((u) => u.slug !== useCase.slug);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xs py-3 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button onClick={() => setActiveTab('home')} className="hover:text-slate-900 cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={() => setActiveTab('use_cases_hub')} className="hover:text-slate-900 cursor-pointer">Use Cases</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{useCase.title}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
          <Target className="w-4 h-4 text-[#059669]" />
          <span>{useCase.category}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          {useCase.heroHeadline}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {useCase.heroSubheadline}
        </p>

        {/* Hero CTA & Stat Pill */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6 max-w-xl mx-auto">
          <button
            type="button"
            onClick={handleLaunchTool}
            className="w-full sm:w-auto px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-heading group"
          >
            <span>{useCase.ctaText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Results Highlight Banner */}
        <div className="mt-10 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">{useCase.resultsMetric.value}</span>
              <p className="text-xs font-bold text-slate-700">{useCase.resultsMetric.label}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-xs text-left sm:text-right font-sans">
            {useCase.resultsMetric.subtext}
          </p>
        </div>
      </section>

      {/* Pain Points vs Solutions Framework */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-16 border-t border-slate-200">
        {/* Pain Points */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold font-heading uppercase border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Core Operational Bottlenecks</span>
            </div>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900">
              Why Traditional Methods Fall Short
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {useCase.painPoints.map((pain, i) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
                  0{i + 1}
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900">{pain.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{pain.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Implementation Framework */}
        <div className="space-y-8 pt-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold font-heading uppercase border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
              <span>The Locora AI Solution</span>
            </div>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900">
              How Locora Solves This in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {useCase.solutions.map((sol, i) => (
              <div key={i} className="p-6 bg-white border-2 border-emerald-200/80 rounded-2xl space-y-4 shadow-sm hover:border-[#059669] transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#059669] text-white flex items-center justify-center font-extrabold font-mono text-xs shadow-xs">
                  {sol.step}
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900">{sol.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-8 border-t border-slate-200">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {useCase.faqs.map((faq, i) => {
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

      {/* Explore Other Use Cases */}
      <section className="py-12 px-6 max-w-7xl mx-auto border-t border-slate-200 space-y-6">
        <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
          Explore Other Use Cases
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherUseCases.map((ou) => (
            <button
              key={ou.slug}
              onClick={() => {
                window.history.pushState({}, '', `/use-cases/${ou.slug}`);
                setActiveTab(`usecase_${ou.slug}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#059669] hover:bg-emerald-50/20 text-left transition-all cursor-pointer space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-heading">
                <span>{ou.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#059669]" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 font-sans">{ou.heroSubheadline}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="py-16 px-6 bg-slate-900 text-white text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">
            Ready to Solve {useCase.title}?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-sans">
            Launch your free starter account today with 25 AI Copilot credits.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleLaunchTool}
              className="px-8 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-heading"
            >
              <span>{useCase.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
