import type {
  SeoPageContext,
  GeneratedPageMetadata,
  BreadcrumbItem,
} from './types';

/**
 * Builds canonical URL from origin/baseUrl and pathname.
 */
export function buildCanonicalUrl(path: string = '/', baseUrl: string = 'https://locoraai.com'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/+$/, '')}${cleanPath}`;
}

/**
 * Generates dynamic, high-converting, compliant SEO metadata
 * strictly based on real entities and user search intent.
 */
export function generatePageMetadata(ctx: SeoPageContext): GeneratedPageMetadata {
  const baseUrl = ctx.baseUrl || 'https://locoraai.com';
  const category = ctx.category?.trim() || '';
  const city = ctx.city?.trim() || '';
  const suburb = ctx.suburb?.trim() || '';
  const businessName = ctx.businessName?.trim() || '';
  const services = ctx.services || [];
  const count = ctx.availableBusinessesCount ?? (ctx.availableBusinesses ? ctx.availableBusinesses.length : 1);

  let title = 'Locora AI | AI Local SEO, GEO & Growth Operating System';
  let metaDescription = 'Autonomous AI platform for local businesses and agencies to dominate Google 3-Pack rankings, ChatGPT search, and Perplexity visibility.';
  let canonicalPath = ctx.path || '/';
  let h1 = 'Autonomous Local Business Growth Operating System';
  let h2: string[] = ['Local SEO & Google 3-Pack', 'Generative Engine Optimization (GEO)', 'Automated Growth Action Engine'];
  let h3: string[] = ['Real-time 40-Point Audits', 'Multi-tenant Agency Dashboard', 'Autonomous AI Business Manager'];

  // Thin-content & crawl guardrails
  let isIndexable = ctx.forceNoIndex ? false : true;

  // =========================================================================
  // 1. BUSINESS PROFILE: /biz/{slug} or /business/{slug}
  // =========================================================================
  if (ctx.pageType === 'business_profile' || ctx.pageType === 'business_detail') {
    if (!businessName) {
      isIndexable = false;
      title = 'Business Profile Not Found | Locora Directory';
      metaDescription = 'The requested local business profile could not be found or has not yet been verified on the Locora Directory.';
      h1 = 'Business Not Found';
      canonicalPath = '/directory';
    } else {
      const locationPart = suburb && city ? `${suburb}, ${city}` : (city || 'Local Area');
      const catPart = category ? `${category} in ` : '';
      title = `${businessName} | ${catPart}${locationPart}`;
      
      const servicesPart = services.length > 0 ? ` specializing in ${services.slice(0, 3).join(', ')}` : '';
      metaDescription = `Verified details for ${businessName}${servicesPart} in ${locationPart}. View customer ratings, address, contact phone, business hours, and request direct quotes.`;
      
      canonicalPath = `/biz/${ctx.businessSlug || businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      h1 = businessName;
      h2 = [
        `About ${businessName}`,
        `Services Provided in ${locationPart}`,
        `Location, Map & Operating Hours`,
        `Verified Customer Reviews & Ratings`,
      ];
      h3 = [
        `Direct Inquiry & Fast Quote`,
        `Locora Verified Listing Standards`,
      ];
    }
  }

  // =========================================================================
  // 2. CATEGORY + CITY DIRECTORY PAGES: /[city]/[category]
  // =========================================================================
  else if (ctx.pageType === 'category_city') {
    const citySlug = ctx.citySlug || city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catSlug = ctx.categorySlug || category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    canonicalPath = `/${citySlug}/${catSlug}`;

    if (count === 0 || !city || !category) {
      isIndexable = false;
      title = `${category || 'Local Services'} in ${city || 'Local Area'} | Business Directory`;
      metaDescription = `Browse verified ${category || 'services'} in ${city || 'your area'}. Directory listings are currently being updated by local verified providers.`;
      h1 = `${category || 'Services'} in ${city || 'Local Area'}`;
      h2 = [`Local ${category} Search Results`, `Nearby Locations`];
      h3 = [`Join the Locora Verified Directory`];
    } else {
      title = `${category} in ${city} | Local Businesses & Services`;
      metaDescription = `Find ${count > 1 ? `${count} ` : ''}verified ${category.toLowerCase()} in ${city}. Compare ratings, service specialties, direct contact numbers, and request fast local quotes.`;
      h1 = `${category} in ${city}`;
      h2 = [
        `Top-Rated ${category} in ${city}`,
        `Local ${category} Services & Specialties`,
        `How to Choose the Right ${category} Provider in ${city}`,
      ];
      h3 = [
        `Direct Quote & Availability Inquiries`,
        `Frequently Asked Questions about ${category} in ${city}`,
      ];
    }
  }

  // =========================================================================
  // 3. CITY PAGES: /[city]
  // =========================================================================
  else if (ctx.pageType === 'city' || ctx.pageType === 'city_hub') {
    const citySlug = ctx.citySlug || city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    canonicalPath = `/${citySlug}`;

    if (count === 0 || !city) {
      isIndexable = false;
      title = `Local Businesses in ${city || 'Local Area'} | Locora Directory`;
      metaDescription = `Explore local businesses in ${city || 'your area'}. New local providers are added daily upon verified accreditation.`;
      h1 = `Local Businesses in ${city || 'Local Area'}`;
      h2 = [`City Directory Overview`];
      h3 = [`Register Your Local Business`];
    } else {
      title = `Local Businesses in ${city} | Business Directory`;
      metaDescription = `Explore verified local businesses and professional services in ${city}. Browse top-rated providers, customer reviews, hours, and direct quote requests.`;
      h1 = `Local Businesses in ${city}`;
      h2 = [
        `Popular Service Categories in ${city}`,
        `Featured Verified Providers in ${city}`,
        `Find Services Near ${city}`,
      ];
      h3 = [
        `Verified Community Standards`,
        `Search More Locations`,
      ];
    }
  }

  // =========================================================================
  // 4. CATEGORY PAGES: /category/{category}
  // =========================================================================
  else if (ctx.pageType === 'category' || ctx.pageType === 'category_hub') {
    const catSlug = ctx.categorySlug || category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    canonicalPath = `/category/${catSlug}`;

    if (count === 0 || !category) {
      isIndexable = false;
      title = `${category || 'Category'} Directory | Locora AI`;
      metaDescription = `Browse verified ${category || 'service'} providers across top cities. Profiles undergo algorithmic verification.`;
      h1 = `${category || 'Services'} Directory`;
      h2 = [`Category Index`];
      h3 = [`List Your Business`];
    } else {
      title = `${category} Businesses | Local Business Directory`;
      metaDescription = `Browse verified ${category} across all locations. Find trusted local providers, view authentic customer ratings, and request direct quotes.`;
      h1 = `${category} Directory`;
      h2 = [
        `Top Cities for ${category}`,
        `Featured ${category} Providers`,
        `Common ${category} Services & Pricing Insights`,
      ];
      h3 = [
        `Locora Accreditation Standards`,
        `Find a Provider Near You`,
      ];
    }
  }

  // =========================================================================
  // 5. DIRECTORY INDEX: /directory
  // =========================================================================
  else if (ctx.pageType === 'directory_index' || ctx.pageType === 'directory_hub') {
    canonicalPath = '/directory';
    title = 'Verified Local Business Directory — Top-Rated Service Providers | Locora AI';
    metaDescription = 'Search the authoritative directory of verified local businesses. Find top-rated dentists, contractors, HVAC, auto repair & home services with verified reviews and direct quotes.';
    h1 = 'Verified Local Business Directory';
    h2 = [
      'Browse Businesses by City',
      'Popular Local Service Categories',
      'How the Locora Verification Engine Works',
    ];
    h3 = [
      'Request Fast Quotes Directly',
      'Are You a Local Business Owner?',
    ];
  }

  // =========================================================================
  // 6. SITE-WIDE CORE PAGES
  // =========================================================================
  else {
    const key = ctx.sitePageKey || 'home';

    switch (key) {
      case 'local_seo':
      case 'visibility':
        canonicalPath = '/use-cases/local-seo';
        title = 'Local SEO Platform | Dominate Google Local 3-Pack Rankings | Locora AI';
        metaDescription = 'Turn local searches into paying customers. Optimize Google Business Profiles, automate review responses, track geo-grid rankings, and outperform competitors.';
        h1 = 'Dominate the Google Local 3-Pack with Autonomous Local SEO';
        h2 = ['Geo-Grid Local Rank Tracking', 'Automated GBP Post & Review Engine', 'Citation Health & NAP Consistency'];
        h3 = ['Local Search Signal Analyzer', 'Multi-Location Local SEO Management'];
        break;

      case 'ai_seo':
      case 'geo':
      case 'ai_visibility':
        canonicalPath = '/features/ai-business-chat';
        title = 'Generative Engine Optimization (GEO) & AI Search Tracking | Locora AI';
        metaDescription = 'Measure and maximize your brand visibility across ChatGPT, Google Gemini, and Perplexity AI. Optimize conversational citations and AI recommendations.';
        h1 = 'Win the Future of Search with Generative Engine Optimization (GEO)';
        h2 = ['Track Brand Mentions in ChatGPT & Perplexity', 'Conversational AI Citation Modeling', 'Multi-LLM Visibility Score'];
        h3 = ['AI Search Answer Optimization', 'Cross-Platform Sentiment Analysis'];
        break;

      case 'seo_audit':
      case 'checkup':
        canonicalPath = '/seo-audit';
        title = 'Instant Local SEO & AI Search Audit | Free Business Checkup | Locora AI';
        metaDescription = 'Get an instant 40-point diagnostic of your website, Google Business Profile, and AI visibility. Discover high-impact fixes to boost local leads immediately.';
        h1 = 'Instant 40-Point Local SEO & AI Visibility Audit';
        h2 = ['Algorithmic Health & Technical SEO', 'Google 3-Pack Rank Opportunity Check', 'AI Search Recommendation Readiness'];
        h3 = ['Schema Markup Validator', 'Actionable Step-by-Step Remediation'];
        break;

      case 'reputation':
        canonicalPath = '/features/reputation-management';
        title = 'Local Review & Reputation Management Automation | Locora AI';
        metaDescription = 'Automate review collection, monitor ratings across Google and social channels, and generate context-aware AI replies that boost local search rankings.';
        h1 = 'Autonomous Local Review & Reputation Management';
        h2 = ['Automated Multi-Channel Review Requests', 'AI Review Replies Grounded in Brand Voice', 'Sentiment Intelligence & Trend Detection'];
        h3 = ['Negative Review Risk Alerts', 'Social Proof & Rating Badges'];
        break;

      case 'ai_manager':
      case 'growth':
        canonicalPath = '/features/ai-business-audit';
        title = 'Autonomous AI Business Manager for Local Businesses & Agencies | Locora AI';
        metaDescription = 'Your 24/7 AI growth strategist. Synthesizes search data, competitor movements, and customer demand into daily prioritized growth actions that drive revenue.';
        h1 = 'Autonomous AI Business Manager & Growth Command Center';
        h2 = ['Daily Prioritized Growth Actions', 'Competitor Movement Alerts', 'Automated Marketing Execution'];
        h3 = ['Business Brain Synthesis', 'Measurable Revenue Impact Tracker'];
        break;

      case 'pricing':
        canonicalPath = '/pricing';
        title = 'Transparent Pricing Plans for Local Businesses & Agencies | Locora AI';
        metaDescription = 'Choose the ideal plan to scale your local visibility. Transparent monthly or annual billing with instant access to SEO audits, GEO tracking, and AI growth tools.';
        h1 = 'Simple, Predictable Plans for Unmatched Local Visibility';
        h2 = ['Pro Tier for Local Businesses', 'Agency Scale Plan for Multi-Client Retainers', 'Frequently Asked Questions About Pricing'];
        h3 = ['No Hidden Add-Ons', 'Cancel Anytime Guarantee'];
        break;

      case 'features':
        canonicalPath = '/features';
        title = 'Locora AI Platform Features | Complete Local SEO & GEO Suite';
        metaDescription = 'Explore all powerful features in Locora AI: automated local rank tracking, AI review replies, website audits, competitor intel, and directory syndication.';
        h1 = 'Engineered for Local Market Leadership';
        h2 = ['Local Visibility & GBP Suite', 'Generative Engine Optimization (GEO)', 'Autonomous Marketing Execution'];
        h3 = ['Client Portal & White-Label Reporting', 'Lead Prospector & CRM Integration'];
        break;

      case 'solutions':
      case 'use_cases':
        canonicalPath = '/use-cases';
        title = 'Local Growth Solutions & Industry Use Cases | Locora AI';
        metaDescription = 'Discover how contractors, medical practices, law firms, auto repair, and agencies use Locora AI to capture high-intent local customer inquiries.';
        h1 = 'Tailored Local Growth Solutions for Every Industry';
        h2 = ['Contractors & Home Services', 'Healthcare & Dental Practices', 'Legal & Professional Services'];
        h3 = ['Multi-Location Franchise Groups', 'Digital Marketing Agencies'];
        break;

      case 'agencies':
        canonicalPath = '/for/agencies';
        title = 'Locora for Agencies | Scale White-Label Local SEO & Client Value';
        metaDescription = 'Empower your agency to deliver proven local 3-pack rankings, GEO tracking, and automated client reporting across hundreds of local client locations.';
        h1 = 'The Ultimate Local SEO & GEO Operating System for Agencies';
        h2 = ['Multi-Client Management Hub', 'Automated White-Label Client Reports', 'High-Converting Prospect Audits'];
        h3 = ['Client Retention Intelligence', 'Agency Tier Multi-Seat Access'];
        break;

      case 'resources':
      case 'blog':
        canonicalPath = '/resources';
        title = 'Local SEO, GEO & AI Visibility Resource Hub | Locora AI';
        metaDescription = 'Actionable playbooks, step-by-step guides, and industry research on ranking in the Google Local 3-Pack and optimizing for ChatGPT and Perplexity.';
        h1 = 'Local SEO & Generative Search Resource Hub';
        h2 = ['Local SEO Playbooks & SOPs', 'Google Business Profile Masterclasses', 'AI Search & GEO Optimization Guides'];
        h3 = ['Free Checkup Tools', 'Industry Benchmarks'];
        break;

      default:
        // Homepage
        canonicalPath = '/';
        title = 'Locora AI | AI Local SEO, GEO & Growth Operating System';
        metaDescription = 'Autonomous AI platform for local businesses and marketing agencies to dominate Google 3-Pack rankings, ChatGPT recommendations, and customer conversions.';
        h1 = 'Autonomous Local Business Growth Operating System';
        h2 = [
          'Dominate the Google Local 3-Pack',
          'Optimize for Generative Search (ChatGPT, Gemini, Perplexity)',
          'Autonomous Daily Growth Priorities',
        ];
        h3 = [
          'Instant 40-Point Algorithmic Audit',
          'Verified Local Business Directory',
          'White-Label Multi-Client Agency Hub',
        ];
        break;
    }
  }

  const canonicalUrl = buildCanonicalUrl(canonicalPath, baseUrl);

  return {
    title,
    metaDescription,
    description: metaDescription,
    canonicalUrl,
    h1,
    h2,
    h3,
    isIndexable,
    robots: isIndexable ? 'index, follow' : 'noindex, follow',
    openGraph: {
      title,
      description: metaDescription,
      url: canonicalUrl,
      type: ctx.pageType === 'business_profile' ? 'business.business' : 'website',
      siteName: 'Locora AI',
      image: `${baseUrl.replace(/\/+$/, '')}/og-image.png`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      image: `${baseUrl.replace(/\/+$/, '')}/og-image.png`,
    },
  };
}

/**
 * Builds semantic breadcrumbs for any page type.
 */
export function generatePageBreadcrumbs(ctx: SeoPageContext): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/', position: 1 },
  ];

  if (ctx.pageType === 'directory_index') {
    crumbs.push({ label: 'Business Directory', path: '/directory', position: 2 });
  } else if (ctx.pageType === 'city' && ctx.city) {
    const citySlug = ctx.citySlug || ctx.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    crumbs.push({ label: 'Directory', path: '/directory', position: 2 });
    crumbs.push({ label: ctx.city, path: `/${citySlug}`, position: 3 });
  } else if (ctx.pageType === 'category' && ctx.category) {
    const catSlug = ctx.categorySlug || ctx.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    crumbs.push({ label: 'Directory', path: '/directory', position: 2 });
    crumbs.push({ label: ctx.category, path: `/category/${catSlug}`, position: 3 });
  } else if (ctx.pageType === 'category_city' && ctx.city && ctx.category) {
    const citySlug = ctx.citySlug || ctx.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catSlug = ctx.categorySlug || ctx.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    crumbs.push({ label: 'Directory', path: '/directory', position: 2 });
    crumbs.push({ label: ctx.city, path: `/${citySlug}`, position: 3 });
    crumbs.push({ label: ctx.category, path: `/${citySlug}/${catSlug}`, position: 4 });
  } else if (ctx.pageType === 'business_profile' && ctx.businessName) {
    crumbs.push({ label: 'Directory', path: '/directory', position: 2 });
    if (ctx.city) {
      const citySlug = ctx.citySlug || ctx.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      crumbs.push({ label: ctx.city, path: `/${citySlug}`, position: 3 });
      if (ctx.category) {
        const catSlug = ctx.categorySlug || ctx.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        crumbs.push({ label: ctx.category, path: `/${citySlug}/${catSlug}`, position: 4 });
      }
    }
    const slug = ctx.businessSlug || ctx.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    crumbs.push({ label: ctx.businessName, path: `/biz/${slug}`, position: crumbs.length + 1 });
  } else if (ctx.sitePageKey) {
    crumbs.push({ label: ctx.pageTitle || 'Resources', path: ctx.path || '/', position: 2 });
  }

  return crumbs;
}
