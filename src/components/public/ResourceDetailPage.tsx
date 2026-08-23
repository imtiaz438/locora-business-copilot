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
  CheckSquare,
  Square,
  HelpCircle,
  AlertTriangle,
  Check,
  Copy,
  Share2,
} from 'lucide-react';

interface ResourceDetailPageProps {
  slug?: string;
}

export const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({ slug }) => {
  const { setActiveTab, user } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);

  const currentSlug =
    slug ||
    (typeof window !== 'undefined'
      ? window.location.pathname.replace(/^\/resources\//, '').trim()
      : 'how-to-improve-local-seo');

  const article: SeoResourceArticle =
    SEO_RESOURCES_DATABASE[currentSlug] || SEO_RESOURCES_DATABASE['how-to-improve-local-seo'];

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecklistCount = article.sections.reduce(
    (acc, sec) => acc + (sec.checklistItems?.length || 0),
    0
  );
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent =
    allChecklistCount > 0 ? Math.round((checkedCount / allChecklistCount) * 100) : 0;

  useEffect(() => {
    document.title = article.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', article.metaDescription);
    }

    // Inject JSON-LD Schema (TechArticle)
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'article-jsonld-schema';
    schemaScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: article.title,
      description: article.metaDescription,
      author: {
        '@type': 'Organization',
        name: 'Locora AI Editorial & SEO Research Team',
        url: 'https://locoraai.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Locora AI',
        url: 'https://locoraai.com',
      },
      datePublished: '2026-08-01',
      dateModified: '2026-08-20',
      mainEntity: {
        '@type': 'FAQPage',
        mainEntity: article.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
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
    if (user) {
      setActiveTab(article.targetTab);
    } else {
      setActiveTab('auth');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeSnippet(id);
    setTimeout(() => setCopiedCodeSnippet(null), 2000);
  };

  const otherArticles = Object.values(SEO_RESOURCES_DATABASE).filter(
    (a) => a.slug !== article.slug
  );

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-xs py-3.5 px-6 text-xs text-slate-500 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <button onClick={() => setActiveTab('home')} className="hover:text-slate-900 cursor-pointer font-medium">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button onClick={() => setActiveTab('resources_hub')} className="hover:text-slate-900 cursor-pointer font-medium">
              Resources & Masterclasses
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold line-clamp-1">{article.title}</span>
          </div>

          <button
            onClick={handleLaunchTool}
            className="hidden sm:inline-block px-3.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {user ? 'Open in Workspace' : 'Get Free Tools'}
          </button>
        </div>
      </div>

      {/* Article Header */}
      <header className="py-14 sm:py-18 px-6 max-w-5xl mx-auto space-y-6">
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

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-slate-900 tracking-tight leading-[1.15]">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans border-l-4 border-emerald-600 pl-4 py-1 max-w-4xl">
          {article.summary}
        </p>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sticky Table of Contents (Desktop) */}
        <aside className="lg:col-span-4 hidden lg:block space-y-6">
          <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Table of Contents</span>
            </h3>
            <nav className="space-y-1.5">
              {article.tableOfContents.map((toc) => (
                <a
                  key={toc.id}
                  href={`#${toc.id}`}
                  className="block text-xs text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 p-2 rounded-lg transition-colors font-medium"
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
                  <span className="text-emerald-700 font-extrabold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {checkedCount} of {allChecklistCount} audit points checked.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleLaunchTool}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-heading"
              >
                <span>{user ? 'Open Workspace' : 'Get Free Tools'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </div>
        </aside>

        {/* Article Body */}
        <article className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-12">
          {/* Render Sections */}
          {article.sections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 border-b border-slate-100 pb-3">
                {section.heading}
              </h2>

              <div className="space-y-3 text-sm text-slate-700 leading-relaxed font-sans">
                {section.content.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {/* Key Takeaway */}
              {section.keyTakeaway && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950 font-medium">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold font-heading text-emerald-900 block mb-0.5">
                      Key Strategy Takeaway
                    </strong>
                    <span>{section.keyTakeaway}</span>
                  </div>
                </div>
              )}

              {/* Interactive Checklist Items */}
              {section.checklistItems && section.checklistItems.length > 0 && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block">
                    Interactive Implementation Checklist
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
                            <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
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

          {/* Pros & Cons Section if present */}
          {article.prosAndCons && (
            <div className="pt-6 border-t border-slate-100 space-y-6">
              <h3 className="text-xl font-bold font-heading text-slate-900">
                Pros & Cons: In-House Execution vs. AI Automation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Advantages of This Strategy</span>
                  </span>
                  <ul className="space-y-2 text-xs text-slate-800">
                    {article.prosAndCons.pros.map((pr, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{pr}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Prerequisites & Watchouts</span>
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {article.prosAndCons.cons.map((cn, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                        <span>{cn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Embedded Callout Box */}
          <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold font-heading uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Automated Workflow</span>
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
              className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer font-heading shrink-0"
            >
              <span>{article.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-700" />
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
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-emerald-700' : ''}`} />
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

      {/* Read More Guides */}
      <section className="py-14 px-6 max-w-6xl mx-auto border-t border-slate-200 space-y-6">
        <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
          More Masterclasses & Educational Guides
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
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50/20 text-left transition-all cursor-pointer space-y-2 shadow-2xs"
            >
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono">
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
