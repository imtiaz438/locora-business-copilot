import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SEO_RESOURCES_DATABASE, SeoResourceArticle } from '../../data/seoData';
import {
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const ResourcesHubView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const articles = Object.values(SEO_RESOURCES_DATABASE);
  const categories = ['all', 'Local SEO', 'Proposals & Sales', 'Google Business', 'Checklists & SOPs'];

  const filteredArticles = articles.filter((a) => {
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.targetKeywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectArticle = (slug: string) => {
    window.history.pushState({}, '', `/resources/${slug}`);
    setActiveTab(`resource_${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Header */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-[#059669]" />
          <span>Educational Guides & SOPs</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 tracking-tight max-w-3xl mx-auto">
          Local SEO, Proposal, & Agency Growth Playbooks
        </h1>

        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          In-depth masterclasses, step-by-step audit checklists, and actionable scripts designed to help you rank higher on Google Maps and close higher-ticket clients.
        </p>

        {/* Search & Filter Bar */}
        <div className="max-w-xl mx-auto space-y-4 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, checklists, or keywords..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#059669] shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'All Guides' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid of Articles */}
      <section className="py-8 px-6 max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.slug}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-[#059669] hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {art.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{art.readingTime}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold font-heading text-slate-900 group-hover:text-[#059669] transition-colors leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {art.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSelectArticle(art.slug)}
                  className="text-xs font-bold text-slate-900 hover:text-[#059669] flex items-center gap-1.5 cursor-pointer font-heading"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(art.targetTab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-[#059669] text-emerald-800 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Try Tool →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
