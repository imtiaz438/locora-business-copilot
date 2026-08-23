import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SEO_USE_CASES_DATABASE, SeoUseCaseItem } from '../../data/seoData';
import {
  Target,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export const UseCasesHubView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const useCases = Object.values(SEO_USE_CASES_DATABASE);
  const categories = ['all', 'Agency Operations', 'Local Business Growth', 'Lead Generation & Sales'];

  const filteredUseCases =
    selectedCategory === 'all'
      ? useCases
      : useCases.filter((u) => u.category === selectedCategory);

  const handleSelectUseCase = (slug: string) => {
    window.history.pushState({}, '', `/use-cases/${slug}`);
    setActiveTab(`usecase_${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Header */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
          <Target className="w-4 h-4 text-[#059669]" />
          <span>Operational Use Cases</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 tracking-tight max-w-3xl mx-auto">
          Proven Workflows for Agencies & Local Service Businesses
        </h1>

        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Discover how modern agencies, contractors, clinics, and professional firms use Locora AI to automate proposals, dominate local search, and scale monthly retainers.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All Use Cases' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid of Use Cases */}
      <section className="py-8 px-6 max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUseCases.map((uc) => (
            <div
              key={uc.slug}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-[#059669] hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {uc.category}
                  </span>
                  <span className="text-xs font-extrabold font-mono text-[#059669]">
                    {uc.resultsMetric.value} Lift
                  </span>
                </div>

                <h3 className="text-xl font-bold font-heading text-slate-900 group-hover:text-[#059669] transition-colors">
                  {uc.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {uc.heroSubheadline}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {uc.solutions.slice(0, 2).map((sol, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{sol.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSelectUseCase(uc.slug)}
                  className="text-xs font-bold text-slate-900 hover:text-[#059669] flex items-center gap-1.5 cursor-pointer font-heading"
                >
                  <span>Explore Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(uc.targetTab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-[#059669] text-slate-700 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Try in App →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
