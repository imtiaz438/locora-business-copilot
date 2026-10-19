/**
 * Server-side article content injection for AI-crawler visibility.
 *
 * Problem: article pages (/resources/:slug) ship an empty <div id="root"> —
 * body text only appears after React executes. GPTBot, ClaudeBot, PerplexityBot,
 * OAI-SearchBot, ChatGPT-User and Bytespider do NOT run JavaScript, so they see
 * an empty shell. This module generates static, semantic article HTML from
 * SEO_RESOURCES_DATABASE at build time and injects it into #root, plus embeds
 * the TechArticle JSON-LD server-side (the client injects it via useEffect in
 * ResourceDetailPage.tsx, which non-JS crawlers never execute).
 *
 * React's createRoot().render() clears the container before mounting, so the
 * static markup is a progressive enhancement: crawlers read it, JS users get
 * the full React app with no hydration mismatch.
 */
import { SEO_RESOURCES_DATABASE } from '../src/data/seo/resourcesData';
import type { SeoResourceArticle } from '../src/data/seo/types';
import { escapeHtml } from '../src/utils/seoMetadata';

const ARTICLE_ROUTE_RE = /^\/resources\/([a-z0-9-]+)\/?$/;

// Mirrors the client-side alias mapping in ResourceDetailPage.tsx so the
// server-rendered content matches what JS users see.
const SLUG_ALIASES: Record<string, string> = {
  'local-seo-checklist': 'local-business-audit-checklist',
  'local-seo-audit-checklist': 'local-business-audit-checklist',
};

/** Returns the article slug for a route, or null when the route is not a known article. */
export function getArticleSlug(route: string): string | null {
  const m = route.match(ARTICLE_ROUTE_RE);
  if (!m) return null;
  const slug = SLUG_ALIASES[m[1]] || m[1];
  return SEO_RESOURCES_DATABASE[slug] ? slug : null;
}

/** Real per-article title/description (the generic route resolver doesn't know articles). */
export function getArticleMeta(slug: string): { title: string; description: string } {
  const a = SEO_RESOURCES_DATABASE[slug];
  return { title: a.metaTitle, description: a.metaDescription };
}

function sectionHtml(s: SeoResourceArticle['sections'][number]): string {
  const paras = s.content.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n');
  const takeaway = s.keyTakeaway
    ? `<p><strong>Key takeaway:</strong> ${escapeHtml(s.keyTakeaway)}</p>`
    : '';
  const checklist = s.checklistItems?.length
    ? `<ul>\n${s.checklistItems.map((i) => `  <li>${escapeHtml(i)}</li>`).join('\n')}\n</ul>`
    : '';
  return `<section id="${escapeHtml(s.id)}">\n<h2>${escapeHtml(s.heading)}</h2>\n${paras}\n${takeaway}\n${checklist}\n</section>`;
}

/** Static, semantic HTML for the full article — headings, paragraphs, takeaways, checklists, FAQs. */
export function buildArticleStaticHtml(slug: string): string {
  const a = SEO_RESOURCES_DATABASE[slug];
  const toc = a.tableOfContents.length
    ? `<nav aria-label="Table of contents">\n<h2>Table of contents</h2>\n<ul>\n${a.tableOfContents
        .map((t) => `  <li><a href="#${escapeHtml(t.id)}">${escapeHtml(t.title)}</a></li>`)
        .join('\n')}\n</ul>\n</nav>`
    : '';
  const sections = a.sections.map(sectionHtml).join('\n');
  const prosCons = a.prosAndCons
    ? `<section id="pros-cons">\n<h2>Pros and cons</h2>\n<h3>Pros</h3>\n<ul>\n${a.prosAndCons.pros
        .map((p) => `  <li>${escapeHtml(p)}</li>`)
        .join('\n')}\n</ul>\n<h3>Cons</h3>\n<ul>\n${a.prosAndCons.cons
        .map((c) => `  <li>${escapeHtml(c)}</li>`)
        .join('\n')}\n</ul>\n</section>`
    : '';
  const faqs = a.faqs.length
    ? `<section id="faqs">\n<h2>Frequently asked questions</h2>\n${a.faqs
        .map((f) => `<div>\n<h3>${escapeHtml(f.q)}</h3>\n<p>${escapeHtml(f.a)}</p>\n</div>`)
        .join('\n')}\n</section>`
    : '';
  return `<article>\n<header>\n<p>${escapeHtml(a.category)} · ${escapeHtml(a.readingTime)} · Published ${escapeHtml(
    a.publishedDate
  )}</p>\n<h1>${escapeHtml(a.title)}</h1>\n<p>${escapeHtml(a.summary)}</p>\n</header>\n${toc}\n${sections}\n${prosCons}\n${faqs}\n</article>`;
}

/** TechArticle JSON-LD, mirroring the client-side schema in ResourceDetailPage.tsx. */
export function buildArticleJsonLd(slug: string): string {
  const a = SEO_RESOURCES_DATABASE[slug];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: a.title,
    description: a.metaDescription,
    mainEntityOfPage: `https://locoraai.com/resources/${slug}`,
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
      mainEntity: a.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  };
  // Escape "</" so the JSON can never break out of the script tag.
  const json = JSON.stringify(schema).replace(/<\//g, '<\\/');
  return `<script type="application/ld+json" id="article-jsonld-schema">\n${json}\n</script>`;
}

/** Injects the JSON-LD into <head> and the static article HTML into #root. */
export function injectArticleContent(rawHtml: string, slug: string): string {
  let html = rawHtml;
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${buildArticleJsonLd(slug)}\n</head>`);
  }
  const rootRe = /<div id="root">\s*<\/div>/;
  if (rootRe.test(html)) {
    html = html.replace(rootRe, `<div id="root">\n${buildArticleStaticHtml(slug)}\n</div>`);
  }
  return html;
}
