import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SEO_RESOURCES_DATABASE, SeoResourceArticle } from '../../data/seoData';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight,
  Share2,
  CheckSquare,
  Square,
  HelpCircle,
} from 'lucide-react';

interface ResourceDetailPageProps {
  slug?: string;
}

export const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({ slug }) => {
  const { setActiveTab } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const currentSlug =
    slug ||
    (typeof window !== 'undefined'
      ? window.location.pathname.replace(/^\/resources\//, '').trim()
      : 'how-to-improve-local-seo');

  const article: SeoResourceArticle =
    SEO_RESOURCES_DATABASE[currentSlug] || SEO_RESOURCES_DATABASE['how-to-improve-local-seo'];

  // Toggle checklist item
  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate checked progress
  const allChecklistCount = article.sections.reduce(
    (acc, sec) => acc + (sec.checklistItems?.length || 0),
    0
  );
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = allChecklistCount > 0 ? Math.round((checkedCount / allChecklistCount) * 100) : 0;

  useEffect(() => {
    document.title = article.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', article.metaDescription);
    }

    // Inject JSON-LD Schema (TechArticle / Article)
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'article-jsonld-schema';
    schemaScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      'headline': article.title,
      'description': article.metaDescription,
      'author': {
        '@type': 'Organization',
        'name': 'Locora AI Editorial & SEO Research Team',
        'url': 'https://locoraai.com',
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Locora AI',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://locoraai.com/locora-logo.png',
        },
      },
      'datePublished': '2026-08-01',
      'dateModified': '2026-08-20',
      'mainEntity': {
        '@type': 'FAQPage',
        'mainEntity': article.faqs.map((faq) => ({
          '@type': 'Question',
          'name': faq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.a,
          },
        })),
      },
    });

    const oldScript = document.getElementById('article-jsonld-schema');
    if (oldScript) oldScript.remove();
    document.head.appendChild(schemaScript);

    return () => {
      const s = document.getElementById('article-jsonld-schema');
      if (s) s.remove();
    };
  }, [article]);

  const handleLaunchTool = () => {
    setActiveTab(article.targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const otherArticles = Object.values(SEO_RESOURCES_DATABASE).filter((a) => a.slug !== article.slug);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xs py-3 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button onClick={() => setActiveTab('home')} className="hover:text-slate-900 cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={() => setActiveTab('resources_hub')} className="hover:text-slate-900 cursor-pointer">Resources</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold line-clamp-1">{article.title}</span>
        </div>
      </div>

      {/* Article Header */}
      <header className="py-14 px-6 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold font-heading uppercase">
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{article.readingTime}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{article.publishedDate}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans border-l-4 border-[#059669] pl-4 py-1">
          {article.summary}
        </p>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sticky Table of Contents (Desktop) */}
        <aside className="lg:col-span-4 hidden lg:block space-y-6">
          <div className="sticky top-28 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#059669]" />
              <span>Table of Contents</span>
            </h3>
            <nav className="space-y-2">
              {article.tableOfContents.map((toc) => (
                <a
                  key={toc.id}
                  href={`#${toc.id}`}
                  className="block text-xs text-slate-600 hover:text-[#059669] hover:bg-emerald-50/50 p-2 rounded-lg transition-colors font-medium"
                >
                  {toc.title}
                </a>
              ))}
            </nav>

            {/* Interactive Progress Meter if checklists exist */}
            {allChecklistCount > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 font-heading">
                  <span>Interactive Audit Progress</span>
                  <span className="text-[#059669]">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#059669] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {checkedCount} of {allChecklistCount} audit points completed.
                </p>
              </div>
            )}

            {/* Mini CTA Widget */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleLaunchTool}
                className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer font-heading"
              >
                <span>Launch in Locora AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Article Body */}
        <article className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-12">
          {article.sections.map((section, idx) => (
            <section key={section.id} id={section.id} className="space-y-4 scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 border-b border-slate-100 pb-3">
                {section.heading}
              </h2>

              <div className="space-y-3 text-sm text-slate-700 leading-relaxed font-sans">
                {section.content.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {/* Key Takeaway Callout */}
              {section.keyTakeaway && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950 font-medium">
                  <Sparkles className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold font-heading text-[#059669] block mb-0.5">Key Strategy Takeaway</strong>
                    <span>{section.keyTakeaway}</span>
                  </div>
                </div>
              )}

              {/* Interactive Checklist Items */}
              {section.checklistItems && section.checklistItems.length > 0 && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block">
                    Actionable Implementation Checklist
                  </span>
                  <div className="space-y-2">
                    {section.checklistItems.map((item, cIdx) => {
                      const itemId = `${section.id}_${cIdx}`;
                      const isChecked = !!checkedItems[itemId];
                      return (
                        <div
                          key={cIdx}
                          onClick={() => toggleCheck(itemId)}
                          className={`p-2.5 rounded-xl border flex items-center gap-3 text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium line-through'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#059669] flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                          <span>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          ))}

          {/* Embedded High-Converting Action Callout Card */}
          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl space-y-4 shadow-md text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold font-heading uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Automate This Entire Process</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                {article.ctaHeadline}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {article.ctaDescription}
              </p>
            </div>
            <button
              onClick={handleLaunchTool}
              className="px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer font-heading flex-shrink-0"
            >
              <span>{article.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#059669]" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="space-y-3">
              {article.faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-xs sm:text-sm font-bold font-heading text-slate-900">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-[#059669]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed font-sans border-t border-slate-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </div>

      {/* Read More Educational Guides */}
      <section className="py-14 px-6 max-w-7xl mx-auto border-t border-slate-200 space-y-6">
        <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
          More Educational Guides & Playbooks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherArticles.map((oa) => (
            <button
              key={oa.slug}
              onClick={() => {
                window.history.pushState({}, '', `/resources/${oa.slug}`);
                setActiveTab(`resource_${oa.slug}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#059669] hover:bg-emerald-50/20 text-left transition-all cursor-pointer space-y-2 shadow-2xs"
            >
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono">
                {oa.category}
              </span>
              <h4 className="text-xs font-bold text-slate-900 font-heading line-clamp-2">{oa.title}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 font-sans">{oa.summary}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
