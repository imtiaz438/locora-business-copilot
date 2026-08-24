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
  Clock,
  Check,
  XCircle,
  Play,
  BookOpen,
  Users,
} from 'lucide-react';

interface UseCaseDetailPageProps {
  slug?: string;
}

export const UseCaseDetailPage: React.FC<UseCaseDetailPageProps> = ({ slug }) => {
  const { setActiveTab, user } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [calculatorInput, setCalculatorInput] = useState<number>(3);
  const [simulatedLift, setSimulatedLift] = useState<string>('+$12,400 / month');

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
      name: useCase.title,
      description: useCase.metaDescription,
      step: useCase.solutions.map((sol) => ({
        '@type': 'HowToStep',
        name: sol.title,
        text: sol.desc,
      })),
      mainEntity: {
        '@type': 'FAQPage',
        mainEntity: useCase.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
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
    if (user?.isAuthenticated) {
      setActiveTab(useCase.targetTab);
    } else {
      setActiveTab('signup');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecalculate = (val: number) => {
    setCalculatorInput(val);
    const est = Math.round(val * 4100);
    setSimulatedLift(`+$${est.toLocaleString()} / month`);
  };

  const otherUseCases = Object.values(SEO_USE_CASES_DATABASE).filter(
    (u) => u.slug !== useCase.slug
  );

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-xs py-3.5 px-6 text-xs text-slate-500 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <button onClick={() => setActiveTab('home')} className="hover:text-slate-900 cursor-pointer font-medium">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button onClick={() => setActiveTab('use_cases_hub')} className="hover:text-slate-900 cursor-pointer font-medium">
              Use Cases
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold">{useCase.title}</span>
          </div>

          <button
            onClick={handleLaunchTool}
            className="hidden sm:inline-block px-3.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {user ? 'Open in Workspace' : 'Get Started Free'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-14 sm:py-18 px-6 max-w-5xl mx-auto space-y-6 text-left">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-heading uppercase tracking-wide">
            <Target className="w-3.5 h-3.5 text-emerald-700" />
            <span>{useCase.category}</span>
          </div>
          {useCase.readingTime && (
            <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{useCase.readingTime}</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-slate-900 tracking-tight leading-[1.15]">
          {useCase.heroHeadline}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-3xl">
          {useCase.heroSubheadline}
        </p>

        {/* Results Highlight Card */}
        <div className="pt-4">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                  {useCase.resultsMetric.value}
                </span>
                <p className="text-xs font-bold text-slate-700">{useCase.resultsMetric.label}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-xs font-sans">
              {useCase.resultsMetric.subtext}
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Overview Section */}
      {useCase.editorialOverview && (
        <section className="py-8 px-6 max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
            <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-emerald-700" />
              <span>Strategic Analysis & Problem Statement</span>
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
              <p>{useCase.editorialOverview.problemStatement}</p>
              <div className="p-5 bg-slate-50 border-l-4 border-emerald-600 rounded-r-2xl text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {useCase.editorialOverview.strategicValue}
              </div>
              <p className="text-xs text-slate-500 font-sans">
                {useCase.editorialOverview.marketContext}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Who is This For Section */}
      {useCase.whoIsThisFor && (
        <section className="py-8 px-6 max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            <span>Target Personas & Applicability</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {useCase.whoIsThisFor.map((persona, i) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2.5">
                <span className="text-xs font-extrabold font-heading text-emerald-800 uppercase tracking-wider block">
                  {persona.role}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {persona.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pain Points vs Solutions */}
      <section className="py-12 px-6 max-w-5xl mx-auto space-y-12">
        {/* Pain Points */}
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Current Friction Points in the Industry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
        <div className="space-y-6 pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold font-heading uppercase border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Actionable Implementation Framework</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            How to Execute this Blueprint Step-by-Step
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(useCase.stepByStepFramework || useCase.solutions).map((step: any, i: number) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {step.step || `Step 0${i + 1}`}
                  </span>
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{step.description || step.desc}</p>
                {step.proTip && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-sans">
                    <span className="font-bold">Pro Tip: </span>{step.proTip}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pros & Cons */}
      {useCase.prosAndCons && (
        <section className="py-8 px-6 max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-extrabold font-heading text-slate-900">
            Pros, Cons & Strategic Trade-Offs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold font-heading text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>Major Advantages</span>
              </div>
              <ul className="space-y-2.5">
                {useCase.prosAndCons.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-800 font-medium font-sans">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-sm uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Trade-offs & Prerequisites</span>
              </div>
              <ul className="space-y-2.5">
                {useCase.prosAndCons.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Interactive ROI Calculator Sandbox */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold font-heading mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Interactive ROI Estimator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading">
              Estimate Your Revenue Lift with this Strategy
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Adjust the slider to simulate monthly client accounts or emergency job volume.
            </p>
          </div>

          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Active Target Accounts / Monthly Jobs:</span>
                <span className="text-emerald-400 font-extrabold text-sm">{calculatorInput} Accounts</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={calculatorInput}
                onChange={(e) => handleRecalculate(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>1 client ($4.1k/mo)</span>
                <span>10 clients ($41k/mo)</span>
                <span>20 clients ($82k/mo)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">
                  Projected Monthly Revenue Lift:
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-400">
                  {simulatedLift}
                </span>
              </div>
              <button
                onClick={handleLaunchTool}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer font-heading"
              >
                {user ? 'Open in Workspace' : 'Start Free (25 Credits)'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study */}
      {useCase.caseStudy && (
        <section className="py-8 px-6 max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-extrabold font-heading text-slate-900">
            Case Study: {useCase.caseStudy.businessName}
          </h2>
          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-700">
              <p><strong>Challenge: </strong>{useCase.caseStudy.challenge}</p>
              <p><strong>Solution: </strong>{useCase.caseStudy.solution}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {useCase.caseStudy.results.map((r, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">{r.label}</span>
                  <span className="text-base font-extrabold text-slate-900 font-heading">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-12 px-6 max-w-4xl mx-auto space-y-6 border-t border-slate-200">
        <h2 className="text-2xl font-extrabold font-heading text-slate-900 text-center">
          Frequently Asked Questions
        </h2>
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
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-emerald-700' : ''}`} />
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

      {/* Related Use Cases */}
      <section className="py-12 px-6 max-w-5xl mx-auto border-t border-slate-200 space-y-6">
        <h3 className="text-xs font-bold font-heading text-slate-800 uppercase tracking-wider">
          Explore Other Use Cases
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {otherUseCases.slice(0, 3).map((ou) => (
            <button
              key={ou.slug}
              onClick={() => {
                window.history.pushState({}, '', `/use-cases/${ou.slug}`);
                setActiveTab(`use_case_${ou.slug}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-600 text-left transition-all cursor-pointer space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-heading">
                <span>{ou.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 font-sans">{ou.heroSubheadline}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
