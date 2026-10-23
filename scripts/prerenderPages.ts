/**
 * Static page content for non-JS crawlers (GPTBot, ClaudeBot, PerplexityBot,
 * Googlebot's first pass) on the core marketing routes.
 *
 * Same pattern as prerenderArticles.ts: the React app ships an empty
 * <div id="root"> and renders client-side; AI crawlers never execute the JS
 * and previously saw an empty shell on /, /checkup, /pricing, /features and
 * every feature / industry / use-case detail page. This module builds
 * faithful static HTML from the SAME data files the React pages render
 * (featuresData / industriesData / useCasesData / resourcesData), plus
 * hand-written blocks for /, /checkup and /pricing that mirror the live
 * pages' own copy and verified product facts.
 *
 * Deliberately NOT injected: caseStudy blocks, ROI benchmarks and sample
 * stats from the data files — illustrative material that must not be
 * amplified into the crawler-facing layer as if it were measured results.
 *
 * React's createRoot().render() clears #root before mounting, so this is a
 * progressive enhancement: crawlers read real content, JS users get the
 * full app with no hydration mismatch.
 */
import { SEO_FEATURES_DATABASE } from '../src/data/seo/featuresData';
import { SEO_INDUSTRIES_DATABASE } from '../src/data/seo/industriesData';
import { SEO_USE_CASES_DATABASE } from '../src/data/seo/useCasesData';
import { SEO_RESOURCES_DATABASE } from '../src/data/seo/resourcesData';
import { escapeHtml } from '../src/utils/seoMetadata';
import type { HowToStep, ProsAndCons } from '../src/data/seo/types';

const e = escapeHtml;

function ul(items: string[]): string {
  return `<ul>\n${items.map((i) => `  <li>${e(i)}</li>`).join('\n')}\n</ul>`;
}

function stepsBlock(heading: string, steps: HowToStep[]): string {
  if (!steps?.length) return '';
  const items = steps
    .map(
      (s) =>
        `<li><strong>${e(s.title)}</strong> — ${e(s.description)}${s.proTip ? ` <em>Tip: ${e(s.proTip)}</em>` : ''}</li>`
    )
    .join('\n');
  return `<section>\n<h2>${e(heading)}</h2>\n<ol>\n${items}\n</ol>\n</section>`;
}

function prosConsBlock(pc: ProsAndCons): string {
  if (!pc) return '';
  return `<section>\n<h2>Pros and cons</h2>\n<h3>Pros</h3>\n${ul(pc.pros)}\n<h3>Cons</h3>\n${ul(pc.cons)}\n</section>`;
}

function faqBlock(faqs: Array<{ q: string; a: string }>): string {
  if (!faqs?.length) return '';
  const items = faqs
    .map((f) => `<div>\n<h3>${e(f.q)}</h3>\n<p>${e(f.a)}</p>\n</div>`)
    .join('\n');
  return `<section>\n<h2>Frequently asked questions</h2>\n${items}\n</section>`;
}

/* ---------------- Feature detail pages (/features/:slug) ---------------- */

function buildFeatureStaticHtml(slug: string): string {
  const f = SEO_FEATURES_DATABASE[slug];
  const benefits = f.keyBenefits?.length
    ? `<section>\n<h2>Key benefits</h2>\n${f.keyBenefits
        .map((b) => `<h3>${e(b.title)}</h3>\n<p>${e(b.desc)}</p>`)
        .join('\n')}\n</section>`
    : '';
  return `<article>
<header>
<h1>${e(f.heroHeadline)}</h1>
<p>${e(f.heroSubheadline)}</p>
</header>
<section>
<h2>Overview</h2>
<p>${e(f.editorialOverview.leadParagraph)}</p>
<p>${e(f.editorialOverview.whyItMatters)}</p>
<h3>Core capabilities</h3>
${ul(f.editorialOverview.coreCapabilities)}
<p>${e(f.editorialOverview.technicalArchitecture)}</p>
</section>
${benefits}
${stepsBlock('How it works', f.howToUseGuide)}
<section>
<h2>Best practices</h2>
${ul(f.bestPractices)}
<h2>Common mistakes to avoid</h2>
${ul(f.commonMistakes)}
</section>
${prosConsBlock(f.prosAndCons)}
${faqBlock(f.faqs)}
<p><a href="/checkup">Run the free checkup</a> · <a href="/pricing">See pricing</a></p>
</article>`;
}

/* ---------------- Industry pages (/for/:slug) ---------------- */

// Route slugs that map onto a differently-keyed industriesData entry.
const INDUSTRY_ALIASES: Record<string, string> = {
  'law-firms': 'lawyers',
};

function buildIndustryStaticHtml(key: string): string {
  const it = SEO_INDUSTRIES_DATABASE[key];
  const samples = `<section>
<h2>Sample deliverables</h2>
<h3>Google Business Profile bio</h3>
<p>${e(it.sampleDeliverables.gbpBio)}</p>
<h3>Review reply</h3>
<p>${e(it.sampleDeliverables.reviewReply)}</p>
<h3>Structured data (${e(it.sampleDeliverables.schemaType)})</h3>
<pre>${e(it.sampleDeliverables.jsonLdSnippet)}</pre>
</section>`;
  return `<article>
<header>
<h1>${e(it.heroHeadline)}</h1>
<p>${e(it.heroSubheadline)}</p>
</header>
<section>
<h2>Overview</h2>
<p>${e(it.overview)}</p>
</section>
${stepsBlock(`How LocoraAI works for ${it.shortName}`, it.howToUse)}
<section>
<h2>Local SEO checklist for ${it.shortName}</h2>
${ul(it.localSeoChecklist)}
</section>
${samples}
${prosConsBlock(it.prosAndCons)}
${faqBlock(it.faqs)}
<p><a href="/checkup">Run the free checkup for your practice or business</a> · <a href="/pricing">See pricing</a></p>
</article>`;
}

/* ---------------- Use-case pages (/use-cases/:slug) ---------------- */

function buildUseCaseStaticHtml(slug: string): string {
  const u = SEO_USE_CASES_DATABASE[slug];
  const who = u.whoIsThisFor?.length
    ? `<section>\n<h2>Who this is for</h2>\n${u.whoIsThisFor
        .map((w) => `<h3>${e(w.role)}</h3>\n<p>${e(w.description)}</p>`)
        .join('\n')}\n</section>`
    : '';
  const pains = u.painPoints?.length
    ? `<section>\n<h2>The problem</h2>\n${u.painPoints
        .map((p) => `<h3>${e(p.title)}</h3>\n<p>${e(p.desc)}</p>`)
        .join('\n')}\n</section>`
    : '';
  const sols = u.solutions?.length
    ? `<section>\n<h2>The solution</h2>\n${u.solutions
        .map((s) => `<h3>${e(s.title)}</h3>\n<p>${e(s.desc)}</p>`)
        .join('\n')}\n</section>`
    : '';
  return `<article>
<header>
<h1>${e(u.heroHeadline)}</h1>
<p>${e(u.heroSubheadline)}</p>
</header>
<section>
<h2>Overview</h2>
<p>${e(u.editorialOverview.problemStatement)}</p>
<p>${e(u.editorialOverview.strategicValue)}</p>
<p>${e(u.editorialOverview.marketContext)}</p>
</section>
${who}
${pains}
${sols}
${stepsBlock('Step-by-step framework', u.stepByStepFramework)}
<section>
<h2>Best practices</h2>
${ul(u.bestPractices)}
</section>
${prosConsBlock(u.prosAndCons)}
${faqBlock(u.faqs)}
<p><a href="/checkup">Run the free checkup</a> · <a href="/pricing">See pricing</a></p>
</article>`;
}

/* ---------------- Index pages ---------------- */

function buildFeaturesIndexHtml(): string {
  const items = Object.values(SEO_FEATURES_DATABASE)
    .map(
      (f) =>
        `<h2><a href="/features/${e(f.slug)}">${e(f.name)}</a></h2>\n<p>${e(f.metaDescription)}</p>`
    )
    .join('\n');
  return `<article>
<header>
<h1>LocoraAI features</h1>
<p>One AI business operating system for local growth: audits, proposals, CRM, invoicing, reputation and AI search visibility — built for local businesses and the agencies that serve them.</p>
</header>
${items}
<p><a href="/checkup">Run the free checkup</a> · <a href="/pricing">See pricing</a></p>
</article>`;
}

function buildUseCasesIndexHtml(): string {
  const items = Object.values(SEO_USE_CASES_DATABASE)
    .map(
      (u) =>
        `<h2><a href="/use-cases/${e(u.slug)}">${e(u.title)}</a></h2>\n<p>${e(u.metaDescription)}</p>`
    )
    .join('\n');
  return `<article>
<header>
<h1>Use cases</h1>
<p>How local businesses and agencies use LocoraAI to get found, win clients and run operations.</p>
</header>
${items}
<p><a href="/checkup">Run the free checkup</a></p>
</article>`;
}

function buildResourcesIndexHtml(): string {
  const items = Object.values(SEO_RESOURCES_DATABASE)
    .map(
      (a) =>
        `<h2><a href="/resources/${e(a.slug)}">${e(a.title)}</a></h2>\n<p>${e(a.summary)}</p>`
    )
    .join('\n');
  return `<article>
<header>
<h1>Resources</h1>
<p>Guides and checklists on local SEO, Google Business Profiles, proposals and AI search visibility — written by the LocoraAI team.</p>
</header>
${items}
<p><a href="/checkup">Run the free checkup</a></p>
</article>`;
}

/* ---------------- Core pages: home, checkup, pricing ---------------- */

function buildPricingStaticHtml(): string {
  return `<article>
<header>
<h1>Pricing</h1>
<p>Start free with the 40-point local business checkup. Upgrade when you want the full AI business operating system. No credit card required to start.</p>
</header>
<section>
<h2>Free Explorer — $0</h2>
<ul>
<li>Free 40-point local business checkup</li>
<li>Free workspace with your imported audit</li>
<li>25 AI credits per month</li>
</ul>
<h2>Pro Growth — $29/month or $249/year</h2>
<ul>
<li>Everything in Free, for one business</li>
<li>250 AI credits per month</li>
<li>AI audits, proposals, documents and business chat</li>
<li>Review and reputation management</li>
<li>Google Business Profile tools and visibility tracking</li>
</ul>
<h2>Agency Elite — $99/month</h2>
<ul>
<li>Everything in Pro, across client businesses</li>
<li>Unlimited AI credits</li>
<li>White-label report cards, proposals and invoices with your own agency logo and branding</li>
<li>Built-in CRM and invoicing</li>
</ul>
</section>
<section>
<h2>Frequently asked questions</h2>
<div>
<h3>How do AI credits work?</h3>
<p>Each time you generate a proposal, document, or diagnosis, AI credits are consumed based on feature complexity. The Free Plan includes 25 credits/mo, Pro Growth ($29/mo) includes 250 AI credits/mo, and Agency Elite ($99/mo) includes Unlimited AI credits.</p>
</div>
<div>
<h3>Can I white-label client deliverables?</h3>
<p>Yes. The Agency Elite plan ($99/mo) allows you to white-label report cards, proposals, and invoices with your own agency logo and branding.</p>
</div>
</section>
<p><a href="/checkup">Run the free checkup</a></p>
</article>`;
}

function buildCheckupStaticHtml(): string {
  return `<article>
<header>
<h1>Free Local Business Checkup — See Your Business Through Google's Eyes</h1>
<p>Enter your business and LocoraAI runs a free, live 40-point checkup of how customers actually find you — on Google Search, Google Maps and AI assistants like ChatGPT. No signup needed to run it, and it takes about 60 seconds.</p>
</header>
<section>
<h2>What the checkup scans</h2>
<p>Your website's technical health, on-page SEO, local signals (name, phone, and address consistency), content depth, structured data, and performance — scored from the live crawl of your site.</p>
<ul>
<li>Google Search snippet and presence</li>
<li>Google Maps 3-Pack presence</li>
<li>Local search footprint and Google Business Profile signals</li>
<li>Reviews and reputation footprint</li>
<li>AI search engine discovery — whether AI assistants can find and cite your business</li>
<li>Website health: speed, mobile, SSL, headings and metadata</li>
</ul>
</section>
<section>
<h2>How it works</h2>
<ol>
<li><strong>Enter your website or business.</strong> The scan runs live against your real site and public listings.</li>
<li><strong>See your score and top issues.</strong> You get a graded score with the highest-impact problems first.</li>
<li><strong>Unlock the full 40-point report.</strong> Import the audit into a free Locora workspace to track fixes — no credit card required.</li>
</ol>
</section>
<section>
<h2>Frequently asked questions</h2>
<div>
<h3>Is the checkup really free?</h3>
<p>Yes. The checkup is a free automated scan of your website and public listings. No credit card required.</p>
</div>
<div>
<h3>What happens after I unlock my full report?</h3>
<p>Your audit is imported into a free Locora workspace as your first business. From there you can connect your Google Business Profile, track visibility, manage reviews, and generate AI fixes — no credit card required.</p>
</div>
<div>
<h3>What does the checkup scan?</h3>
<p>Your website's technical health, on-page SEO, local signals (name, phone, and address consistency), content depth, structured data, and performance — scored from the live crawl of your site.</p>
</div>
</section>
</article>`;
}

function buildHomeStaticHtml(): string {
  const featureList = Object.values(SEO_FEATURES_DATABASE)
    .map((f) => `<li><a href="/features/${e(f.slug)}">${e(f.name)}</a> — ${e(f.metaDescription)}</li>`)
    .join('\n');
  const industryList = Object.values(SEO_INDUSTRIES_DATABASE)
    .map((i) => `<li>${e(i.name)}</li>`)
    .join('\n');
  return `<article>
<header>
<h1>Locora AI — AI Business OS for Local Growth</h1>
<p>AI Business OS · Local SEO Copilot · Verified Directory. LocoraAI shows local businesses exactly how customers see them on Google and AI search — then gives them the tools to fix it: audits, proposals, CRM, invoicing and reputation management in one platform.</p>
<p><a href="/checkup">Run the free 40-point checkup</a> — 100% real live checkup, deterministic scoring, no signup needed.</p>
</header>
<section>
<h2>Start with the free checkup</h2>
<p>The free checkup scans your website's technical health, on-page SEO, local signals, structured data and performance, checks your Google Maps presence, and tests whether AI assistants like ChatGPT can find and cite your business. It runs live against your real site and public listings in about 60 seconds.</p>
</section>
<section>
<h2>Platform features</h2>
<ul>
${featureList}
</ul>
</section>
<section>
<h2>Built for local businesses</h2>
<ul>
${industryList}
</ul>
<p>Plus dedicated pages for restaurants, HVAC contractors, real estate, plumbers, med spas, auto repair, contractors, agencies and dentists — see <a href="/features">all features</a> and <a href="/pricing">pricing</a>.</p>
</section>
<section>
<h2>Honest, real-time diagnostics</h2>
<p>Every score comes from a live crawl of your actual website and public listings — real verified values, or an honest "not enough data" when something can't be measured. No simulated percentages, no synthetic scores.</p>
</section>
</article>`;
}

/* ---------------- Dispatcher + injector ---------------- */

export function getPageStaticHtml(route: string): string | null {
  if (route === '/') return buildHomeStaticHtml();
  if (route === '/checkup') return buildCheckupStaticHtml();
  if (route === '/pricing') return buildPricingStaticHtml();
  if (route === '/features') return buildFeaturesIndexHtml();
  if (route === '/use-cases') return buildUseCasesIndexHtml();
  if (route === '/resources') return buildResourcesIndexHtml();

  const f = route.match(/^\/features\/([a-z0-9-]+)$/);
  if (f && SEO_FEATURES_DATABASE[f[1]]) return buildFeatureStaticHtml(f[1]);

  const u = route.match(/^\/use-cases\/([a-z0-9-]+)$/);
  if (u && SEO_USE_CASES_DATABASE[u[1]]) return buildUseCaseStaticHtml(u[1]);

  const ind = route.match(/^\/for\/([a-z0-9-]+)$/);
  if (ind) {
    const key = INDUSTRY_ALIASES[ind[1]] || ind[1];
    if (SEO_INDUSTRIES_DATABASE[key]) return buildIndustryStaticHtml(key);
  }
  return null;
}

/** Injects the static page HTML into #root (build-time prerender path). */
export function injectPageContent(rawHtml: string, route: string): string {
  const content = getPageStaticHtml(route);
  if (!content) return rawHtml;
  const rootRe = /<div id="root">\s*<\/div>/;
  return rootRe.test(rawHtml)
    ? rawHtml.replace(rootRe, `<div id="root">\n${content}\n</div>`)
    : rawHtml;
}
