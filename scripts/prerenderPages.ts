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

/* ------- Industry pages whose React data lives in IndustryPseoView -------
 * Static content for the /for/:slug routes that have no industriesData
 * entry. Copy is transcribed verbatim from INDUSTRY_DATABASE in
 * src/components/public/IndustryPseoView.tsx (the data the React pages
 * render). Per this file's standing rule, stats / ROI / ticket figures
 * from that database are deliberately NOT copied into the crawler layer.
 */
const COMPONENT_INDUSTRY_STATIC: Record<string, { name: string; heroHeadline: string; heroSubheadline: string; useCases: Array<{ title: string; desc: string }>; faqItems: Array<{ question: string; answer: string }>; sampleReviewReply: string }> = {
  "restaurants": {
    "name": "Restaurants & Hospitality",
    "heroHeadline": "Restaurant Marketing AI & Reputation Management",
    "heroSubheadline": "Fill your dining room, grow local Google Maps search visibility, automate diner review responses, and streamline catering proposals with Locora AI.",
    "useCases": [
      {
        "title": "Google Maps Food Discovery",
        "desc": "Optimize your Google Business Profile menu, dietary tags, and cuisine categories to capture nearby hungry diners."
      },
      {
        "title": "Catering & Event Proposal Generator",
        "desc": "Create catering proposals with per-head pricing, drink packages, and deposit payment links in seconds."
      },
      {
        "title": "Diner Sentiment & Review Responder",
        "desc": "Turn positive feedback into brand loyalty and address guest concerns immediately with thoughtful AI replies."
      }
    ],
    "faqItems": [
      {
        "question": "How do restaurants rank higher on Google Maps for food searches?",
        "answer": "Restaurants improve ranking by keeping their primary category accurate (e.g. \"Italian Restaurant\"), listing complete menu items, updating holiday and weekend operating hours, and responding consistently to diner reviews."
      },
      {
        "question": "How does AI help with restaurant review management?",
        "answer": "Locora AI crafts personalized, appreciative responses to 5-star diners and writes composed, de-escalating replies to critical reviews, protecting the restaurant's public reputation and boosting SEO keywords."
      },
      {
        "question": "How can restaurants win more private dining and catering revenue?",
        "answer": "By using built-in proposal and invoicing tools, managers can quickly send custom catering menus, guest count estimates, and deposit invoices with online payment links to event planners."
      },
      {
        "question": "Why is Google Business Profile menu optimization crucial for restaurants?",
        "answer": "Google extracts dish names and dietary attributes directly from menu data to answer user searches like \"gluten-free pasta near me\" or \"best steak downtown\", driving high-intent walk-ins."
      }
    ],
    "sampleReviewReply": "\"Thank you for celebrating your anniversary with us, Brandon! Chef Marco was thrilled to hear you loved the dry-aged ribeye. We look forward to welcoming you back soon!\""
  },
  "hvac-contractors": {
    "name": "HVAC Contractors",
    "heroHeadline": "HVAC Business Software & AI CRM for Heating & Cooling Contractors",
    "heroSubheadline": "Capture emergency HVAC repair calls, expand visibility across your service radius, send mobile equipment replacement estimates on-site, and automate seasonal maintenance renewals.",
    "useCases": [
      {
        "title": "Multi-Zip Code Radius Local SEO",
        "desc": "Generate localized service area pages and geotagged project case studies that rank across every suburb in your territory."
      },
      {
        "title": "Instant Mobile Estimates & Invoicing",
        "desc": "Techs in the field can send professional AC/Heating unit replacement proposals on-the-spot from any phone or tablet."
      },
      {
        "title": "Automated Service Renewal Reminders",
        "desc": "AI client CRM tracks installation dates and automatically pings homeowners for seasonal tune-ups."
      }
    ],
    "faqItems": [
      {
        "question": "How do HVAC contractors get more local heating and AC leads?",
        "answer": "HVAC contractors generate steady local leads by maintaining strong visibility across multi-zip code service radiuses on Google Maps, optimizing for seasonal phrases like \"emergency AC repair\" or \"furnace replacement\", and following up with leads within minutes using automated CRM workflows."
      },
      {
        "question": "What is the best CRM for an HVAC company?",
        "answer": "The best CRM for an HVAC business tracks service calls, manages seasonal maintenance agreements, sends instant mobile replacement quotes, and handles itemized PDF invoicing with Stripe payment links from a single mobile-friendly workspace."
      },
      {
        "question": "How do I market emergency HVAC repair services locally?",
        "answer": "Emergency HVAC marketing relies on prominent 24/7 service hour listings on Google Business Profile, rapid response to incoming calls, targeted schema markup highlighting emergency services, and automated SMS quote confirmations sent directly to homeowners."
      },
      {
        "question": "How do automated proposals increase HVAC equipment sales?",
        "answer": "By offering Good/Better/Best equipment options (such as Standard vs High-Efficiency Heat Pumps) with clear warranty and energy rebate information, homeowners can easily pick their preferred package and sign digitally on mobile."
      }
    ],
    "sampleReviewReply": "\"Thanks for the review, Mike! Our HVAC technicians were glad to get your AC cooling quickly during the heatwave. Enjoy the new high-efficiency system!\""
  },
  "real-estate": {
    "name": "Real Estate Agents",
    "heroHeadline": "AI Tools & Client CRM for Real Estate Agents & Teams",
    "heroSubheadline": "Establish hyper-local neighborhood authority, streamline buyer and seller follow-up, create listing proposals, and nurture real estate leads with Locora AI.",
    "useCases": [
      {
        "title": "Neighborhood Authority & SEO Pages",
        "desc": "Create AI-powered hyper-local community guides and market trend summaries that rank for neighborhood searches."
      },
      {
        "title": "Instant Listing Proposals & Seller Decks",
        "desc": "Generate high-converting listing presentation proposals with custom commission breakdowns and marketing plans."
      },
      {
        "title": "Client Referral & Review Automation",
        "desc": "Keep buyers and sellers engaged long after closing with automated anniversary check-ins and review requests."
      }
    ],
    "faqItems": [
      {
        "question": "How do real estate agents get more seller listings with local SEO?",
        "answer": "Agents win seller listings by establishing hyper-local neighborhood authority: publishing community guides, creating suburb-specific market updates, maintaining active Google Business Profiles with recent sales, and collecting 5-star client testimonials."
      },
      {
        "question": "What is the best AI tool for real estate agents?",
        "answer": "Locora AI serves as a complete real estate copilot, helping agents draft listing presentations, generate localized SEO content, manage lead nurture pipelines, and automate post-closing client check-ins."
      },
      {
        "question": "How does AI help with real estate lead nurture?",
        "answer": "AI CRM tracks client preferences (price range, school districts, timeline), suggests timely follow-ups, and drafts personalized check-ins to keep buyers and sellers engaged over multi-month transaction cycles."
      },
      {
        "question": "Can real estate agents rank on Google Maps?",
        "answer": "Yes. Real estate professionals operating from verified brokerage or team offices can optimize their Google Business Profile with client reviews, localized service categories, and structured RealEstateAgent JSON-LD schema."
      }
    ],
    "sampleReviewReply": "\"Thank you, David & Lisa! It was an absolute pleasure helping you sell your home for top market value in [Neighborhood]. Best wishes in your new chapter!\""
  },
  "med-spas": {
    "name": "MedSpas & Aesthetic Clinics",
    "heroHeadline": "Med Spa Marketing Software & AI CRM",
    "heroSubheadline": "Attract aesthetic clients, streamline consultation treatment plans, manage recurring memberships, and build a 5-star reputation with Locora AI.",
    "useCases": [
      {
        "title": "Cosmetic Procedure Search Visibility",
        "desc": "Rank for treatment queries like laser resurfacing, body contouring, and facial aesthetics across your target communities."
      },
      {
        "title": "Multi-Tier Treatment Plans",
        "desc": "Deliver elegant treatment proposal packages that bundle injectables with skin rejuvenation for higher patient satisfaction."
      },
      {
        "title": "Automated Aesthetic Membership Billing",
        "desc": "Run recurring monthly beauty memberships with automated invoice receipts and milestone reminders."
      }
    ],
    "faqItems": [
      {
        "question": "How can med spas get more local clients from Google Maps?",
        "answer": "Med spas get more local clients by optimizing their GBP categories for \"Medical Spa\" and \"Skin Care Clinic\", highlighting treatment modalities (Botox, dermal fillers, laser resurfacing), maintaining photo galleries of clinic aesthetics, and gathering verified patient reviews."
      },
      {
        "question": "What features should a med spa CRM have?",
        "answer": "A med spa CRM should handle multi-visit treatment package proposals, automated post-procedure review requests, recurring membership billing, and HIPAA-mindful client communication."
      },
      {
        "question": "How do digital treatment plans increase med spa revenue?",
        "answer": "Presenting tiered treatment blueprints (e.g. Essential Glow vs Full Facial Harmonization) with clear pricing and financing options helps clients understand cumulative results, raising average ticket value."
      },
      {
        "question": "How does review automation help aesthetic practices?",
        "answer": "Satisfied clients are gently prompted via SMS after treatment sessions to leave feedback on Google, building social proof that converts high-ticket aesthetic inquiries."
      }
    ],
    "sampleReviewReply": "\"Thank you so much, Emily! Our aesthetic team loves helping you achieve that radiant glow. See you at your next facial maintenance session!\""
  },
  "auto-repair": {
    "name": "Auto Repair & Detailing",
    "heroHeadline": "Auto Repair Shop Software & AI CRM",
    "heroSubheadline": "Fill your service bays, get found for high-margin repair terms, deliver transparent itemized digital estimates, and automate maintenance reminders with Locora AI.",
    "useCases": [
      {
        "title": "High-Intent Repair Keyword SEO",
        "desc": "Rank for high-margin repair terms like \"transmission repair near me\" and \"European auto repair\" across your county."
      },
      {
        "title": "Itemized Digital Repair Estimates",
        "desc": "Send clear, photo-verified repair estimates to customer smartphones with one-click approval buttons."
      },
      {
        "title": "Preventative Service CRM Reminders",
        "desc": "Automatically notify motorists when mileage thresholds suggest oil changes, brake pads, or timing belts."
      }
    ],
    "faqItems": [
      {
        "question": "How do auto repair shops get more local customers?",
        "answer": "Auto shops attract high-ticket repairs by ranking for specific diagnostics like \"check engine light diagnosis\", \"brake repair near me\", and \"transmission repair\", maintaining transparent customer reviews, and answering estimate requests promptly."
      },
      {
        "question": "What is the best software for an independent mechanic shop?",
        "answer": "The best software for independent shops combines transparent digital estimates with photo attachments, customer service history tracking, automated SMS updates, and fast PDF invoicing with online payment."
      },
      {
        "question": "How do automated maintenance reminders increase repair shop revenue?",
        "answer": "By logging service dates and mileage intervals, the CRM automatically notifies vehicle owners when factory maintenance, brake pad checks, or oil changes are due, creating reliable repeat bay traffic."
      },
      {
        "question": "How do digital estimates improve mechanic customer trust?",
        "answer": "Customers receive itemized breakdown quotes on their smartphones detailing parts and labor with photos of worn components, eliminating surprise billing and boosting quote approval rates."
      }
    ],
    "sampleReviewReply": "\"Thank you for trusting our mechanic team with your vehicle, Chris! Safe travels on your road trip and let us know if you need anything else.\""
  },
  "contractors": {
    "name": "General & Trade Contractors",
    "heroHeadline": "Contractor CRM & AI Proposal Generator",
    "heroSubheadline": "Win construction and remodeling bids with on-site 3-tier proposals, expand service radius Google Maps SEO, and automate client CRM with Locora AI.",
    "useCases": [
      {
        "title": "Service Radius Google Maps SEO",
        "desc": "Deploy GeneralContractor schema and geotargeted suburb pages to increase search visibility across your entire metro area."
      },
      {
        "title": "On-Site 3-Tier Proposal Builder",
        "desc": "Present homeowners with itemized remodeling packages (Standard, Premium, Lifetime Warranty) directly on your tablet."
      },
      {
        "title": "Automated Job Sign-Off & Reviews",
        "desc": "Send SMS review requests on the driveway during final project walkthroughs to build a 5-star local reputation."
      }
    ],
    "faqItems": [
      {
        "question": "How do contractors win more bids against competitors?",
        "answer": "Contractors win more bids by delivering fast, comprehensive digital proposals within 24 hours of site visits, presenting clear tiered scopes with milestone payment schedules, and showcasing verified local client reviews."
      },
      {
        "question": "What is the best CRM for general contractors?",
        "answer": "The best contractor CRM tracks leads from initial phone inquiry to job completion, generates itemized scopes of work, and issues progressive draw invoices with integrated payment processing."
      },
      {
        "question": "How can contractors rank on Google Maps across a large service area?",
        "answer": "Contractors should define clear service areas in Google Business Profile, create localized project portfolio pages with geotagged job site descriptions, and embed GeneralContractor JSON-LD schema."
      },
      {
        "question": "How do tiered proposals increase contractor project profit?",
        "answer": "Presenting Good, Better, Best options (e.g. Standard, Premium, and Architectural finishes) allows homeowners to self-select higher-margin upgrades rather than negotiating down the base price."
      }
    ],
    "sampleReviewReply": "\"Thank you for the 5-star review, Tom! Our construction crew was glad to complete your kitchen remodel on schedule. Enjoy the new custom countertops!\""
  },
  "agencies": {
    "name": "Marketing & SEO Agencies",
    "heroHeadline": "White Label Local SEO Platform & Agency CRM",
    "heroSubheadline": "Run your local SEO agency on one platform: multi-client CRM, white-label audit reports, AI proposal generation, and automated local ranking execution for every client you manage.",
    "useCases": [
      {
        "title": "Automated Google Maps & Schema Audits",
        "desc": "Generate white-label 7-point audit teardowns with JSON-LD schema in 10 seconds to convert cold outreach into retainers."
      },
      {
        "title": "Tiered Proposal & Scope Generator",
        "desc": "Draft Good/Better/Best commercial proposals directly from discovery notes with built-in digital signature terms."
      },
      {
        "title": "Visual Pipeline CRM & PDF Invoicing",
        "desc": "Track deal stages, log client notes, and issue branded white-label PDF invoices with automated tax calculations."
      }
    ],
    "faqItems": [
      {
        "question": "What is the best white-label local SEO platform for agencies?",
        "answer": "Locora AI provides digital agencies with a complete client operating system: run technical website audits, generate branded SEO strategy proposals, track multi-client deal pipelines, and send retainer invoices from a single dashboard."
      },
      {
        "question": "How can marketing agencies automate client reporting?",
        "answer": "Agencies use Locora AI to automatically analyze rankings, audit Core Web Vitals, identify schema gaps, and export white-labeled executive summary reports for monthly client reviews."
      },
      {
        "question": "Can agencies manage multiple sub-accounts under one login?",
        "answer": "Yes. Locora AI's agency plan includes multi-client workspace switching, dedicated business profiles, and team collaboration permissions."
      },
      {
        "question": "How do instant audits help agencies close local business retainers?",
        "answer": "Running a comprehensive 7-point audit during a discovery call provides tangible proof of ranking deficiencies (NAP citation mismatches, missing schema), positioning the agency as the immediate solution."
      }
    ],
    "sampleReviewReply": "\"Thank you, Marcus! Our agency loves scaling local visibility for your dental practice. We are excited for another quarter of record inbound patient calls!\""
  }
};

function buildComponentIndustryStaticHtml(slug: string): string {
  const d = COMPONENT_INDUSTRY_STATIC[slug];
  const uses = d.useCases?.length
    ? `<section>\n<h2>What LocoraAI does for ${e(d.name)}</h2>\n${d.useCases.map((u) => `<h3>${e(u.title)}</h3>\n<p>${e(u.desc)}</p>`).join('\n')}\n</section>`
    : '';
  return `<article>
<header>
<h1>${e(d.heroHeadline)}</h1>
<p>${e(d.heroSubheadline)}</p>
</header>
${uses}
<section>
<h2>Sample review reply</h2>
<p>${e(d.sampleReviewReply)}</p>
</section>
${faqBlock((d.faqItems || []).map((f) => ({ q: f.question, a: f.answer })))}
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

/* ---------------- Core pages: home, checkup, pricing, products ---------------- */

function buildProductsStaticHtml(): string {
  return `<article>
<header>
<h1>Autonomous AI Engines Built for Local Dominance</h1>
<p>Explore the 8 specialized product modules designed to analyze your local market, boost Google Maps 3-Pack rankings, capture 2026 AI answer engines, outmaneuver competitors, and run your business operations.</p>
</header>
<section>
<h2>Product modules</h2>
<ul>
<li><strong>AI Business Manager</strong> — central intelligence across your business data</li>
<li><strong>Local SEO Copilot</strong> — built for Google Maps 3-Pack visibility</li>
<li><strong>AI Search Visibility</strong> — the 2026 GEO engine: get cited by AI answer engines</li>
<li><strong>Reputation Intelligence</strong> — review monitoring and sentiment</li>
<li><strong>Competitor Radar</strong> — see the growth gaps between you and local competitors</li>
<li><strong>30-Day Growth Plan</strong> — autonomous growth sprints</li>
<li><strong>Agency Client Manager</strong> — multi-location and multi-client management</li>
<li><strong>Core Execution Suite</strong> — CRM and invoicing</li>
</ul>
</section>
<section>
<h2>Dedicated product guides</h2>
<h3>AI Proposals &amp; Contracts</h3>
<p>Generate comprehensive proposals with scope of work, project milestones, deliverable schedules, itemized pricing, and formal client acceptance terms.</p>
<h3>Local SEO &amp; Schema Assistant</h3>
<p>Generate localized descriptions, review reply templates, Google Q&amp;As, local landing page copy, and valid JSON-LD schema markup tailored to any local service industry.</p>
<h3>Client CRM &amp; Pipeline Tracker</h3>
<p>A clean, intuitive CRM designed for local service businesses and agencies to organize contacts, track deal stages, record client notes, and monitor total pipeline value.</p>
<h3>White-Label PDF Invoices</h3>
<p>Create professional invoices for one-time projects or recurring monthly retainers. Calculate state/local taxes automatically and download high-resolution PDF invoices.</p>
<h3>AI Business &amp; Website Audit Engine</h3>
<p>Audit client websites for title tag optimization, meta description length, mobile viewport readiness, SSL security, and receive prioritized AI recommendations.</p>
<h3>30 &amp; 90-Day Marketing Planner</h3>
<p>Build structured 30, 60, and 90-day growth strategies, campaign schedules, promotional offer calendars, and expected ROI benchmarks for local client niches.</p>
</section>
<p><a href="/checkup">Run the free checkup</a> · <a href="/pricing">See pricing</a> · <a href="/features">See all features</a></p>
</article>`;
}

function buildProposalGeneratorStaticHtml(): string {
  return `<article>
<header>
<h1>SEO Proposal Generator — Win the Client Before the Call Ends</h1>
<p>Turn a prospect's website into a polished, tiered SEO proposal in about a minute: live audit findings, a structured scope of work, tiered pricing and terms — generated by AI, finished by you, sent from the same tool that runs your CRM and invoicing.</p>
</header>
<section>
<h2>What goes into every proposal</h2>
<h3>Live audit findings</h3>
<p>The prospect's actual visibility issues, so the proposal opens with their problems, not your pitch.</p>
<h3>Structured scope of work</h3>
<p>Deliverables broken down by phase, so the client sees exactly what happens and when.</p>
<h3>Tiered pricing</h3>
<p>Basic / Growth / Enterprise-style options that let the client pick a level instead of yes/no.</p>
<h3>Milestone schedule</h3>
<p>What happens in weeks 1–4 and beyond, set out in the document itself.</p>
<h3>Terms that protect your margins</h3>
<p>Payment schedule, revision and scope boundaries included from the start.</p>
<h3>Your branding</h3>
<p>Agency Elite white-labels proposals with your logo, so the document looks like your firm produced it.</p>
</section>
<section>
<h2>How it works</h2>
<ol>
<li><strong>Enter the prospect's website</strong> — LocoraAI runs the same 40-point checkup and pulls their real issues.</li>
<li><strong>Pick the services and tier structure</strong> — the generator drafts scope, timeline and pricing around your choices.</li>
<li><strong>Edit, brand, send</strong> — edit anything, apply your branding, send. The client lands in your CRM either way.</li>
</ol>
</section>
<section>
<h2>Who it's for</h2>
<p>Freelancers and small agencies who write proposals in Google Docs at midnight — and local businesses quoting larger jobs who want a professional document without the blank page.</p>
<p>New to proposals? Read the guide first: <a href="/resources/how-to-create-seo-proposal">How to Create an SEO Proposal</a>.</p>
</section>
<section>
<h2>Frequently asked questions</h2>
<div>
<h3>Is the proposal based on real data about my prospect?</h3>
<p>Yes — it starts from a live checkup of their website and public listings, so the findings section cites their actual issues.</p>
</div>
<div>
<h3>Can I change the pricing and scope?</h3>
<p>Everything is editable before you send. Tiers, deliverables, timelines and terms are drafts you control, not locked templates.</p>
</div>
<div>
<h3>Does it white-label?</h3>
<p>Agency Elite ($99/mo) applies your agency logo and branding to proposals, report cards and invoices. Pro ($29/mo) generates proposals under LocoraAI branding.</p>
</div>
<div>
<h3>What does it cost to try?</h3>
<p>The Free plan includes 25 AI credits a month — enough to generate real proposals and see if it fits your workflow. No credit card required.</p>
</div>
</section>
<p><a href="/checkup">Run the free checkup</a> · <a href="/pricing">See pricing</a></p>
</article>`;
}

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
<h1>Free Local SEO Audit for Your Business</h1>
<p>Find out exactly what's holding your local visibility back — website, Google profile, reviews, Maps ranking, and AI search — in one free 40-point checkup. No signup, no sales call.</p>
</header>
<section>
<h2>What the audit checks</h2>
<h3>Your website (technical + on-page)</h3>
<p>Mobile-friendliness, page speed signals, title and meta coverage, heading structure, image optimization, SSL, and whether search engines — and AI crawlers — can actually read your pages.</p>
<h3>Your Google Business Profile</h3>
<p>Completeness score, category match, name compliance (suspension-risk check), address configuration, hours accuracy, photo coverage, and posting activity.</p>
<h3>Reviews &amp; reputation</h3>
<p>Review count vs. local competitors, rating trend, response rate, and platform coverage across Google, Yelp, and Facebook.</p>
<h3>Maps &amp; local visibility</h3>
<p>Where you actually appear in local results for your core services, duplicate-listing detection, and citation consistency.</p>
<h3>AI search readiness</h3>
<p>Whether ChatGPT, Gemini, and Perplexity can find and recommend you: crawler access, structured data, profile completeness, and review signals.</p>
<h3>Competitors</h3>
<p>Your scores benchmarked against the businesses outranking you locally — so you know the gap in concrete terms, not vague advice.</p>
</section>
<section>
<h2>How it works</h2>
<ol>
<li><strong>Enter your business name and website</strong> (30 seconds).</li>
<li><strong>We run the 40-point scan</strong> across the areas above (about a minute).</li>
<li><strong>You get a plain-English report:</strong> what's fine, what's broken, and what to fix first — prioritized by impact.</li>
</ol>
</section>
<section>
<h2>What you get (and what you don't)</h2>
<ul>
<li>A complete visibility report you can keep, free.</li>
<li>Prioritized fixes, not a 200-row spreadsheet.</li>
<li>No account required to run the scan. No credit card. No "free trial" that bills you later.</li>
<li>What we ask in return: nothing. If the report convinces you, Pro plans exist — but the audit is free either way.</li>
</ul>
</section>
<section>
<h2>Frequently asked questions</h2>
<div>
<h3>Is it really free?</h3>
<p>Yes. The full 40-point audit costs nothing and needs no signup.</p>
</div>
<div>
<h3>How long does it take?</h3>
<p>About a minute for the scan, after 30 seconds of input.</p>
</div>
<div>
<h3>Do I need to connect my Google account?</h3>
<p>No. The free audit works from public data.</p>
</div>
<div>
<h3>Will this work for service-area businesses?</h3>
<p>Yes — the audit detects service-area setups (hidden address) and checks them correctly.</p>
</div>
<div>
<h3>What happens after the audit?</h3>
<p>You get the report. Optionally, create a free account to track your score over time or run deeper scans.</p>
</div>
</section>
<p><a href="/pricing">See pricing</a></p>
</article>`;
}

function buildHomeStaticHtml(): string {
  const featureList = Object.values(SEO_FEATURES_DATABASE)
    .map((f) => `<li><a href="/features/${e(f.slug)}">${e(f.name)}</a> — ${e(f.metaDescription)}</li>`)
    .join('\n');
  const industryList = [
    ['Restaurants', '/for/restaurants'],
    ['HVAC Contractors', '/for/hvac-contractors'],
    ['Real Estate', '/for/real-estate'],
    ['Law Firms', '/for/law-firms'],
    ['Plumbers', '/for/plumbers'],
    ['Med Spas', '/for/med-spas'],
    ['Auto Repair', '/for/auto-repair'],
    ['Contractors', '/for/contractors'],
    ['Agencies', '/for/agencies'],
    ['Dentists', '/for/dentists'],
  ]
    .map(([name, route]) => `<li><a href="${route}">${name}</a></li>`)
    .join('\n');
  const articleList = Object.values(SEO_RESOURCES_DATABASE)
    .map((a) => `<li><a href="/resources/${e(a.slug)}">${e(a.title)}</a></li>`)
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
<p>See <a href="/features">all features</a> and <a href="/pricing">pricing</a>.</p>
</section>
<section>
<h2>Guides and resources</h2>
<ul>
${articleList}
</ul>
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
  if (route === '/products') return buildProductsStaticHtml();
  if (route === '/seo-proposal-generator') return buildProposalGeneratorStaticHtml();
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
    if (COMPONENT_INDUSTRY_STATIC[ind[1]]) return buildComponentIndustryStaticHtml(ind[1]);
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
