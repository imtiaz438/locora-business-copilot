import { isAppSubdomain } from './domain';

export interface PageMetadata {
  title: string;
  description: string;
  canonicalPath?: string | null;
  noIndex?: boolean;
}

export interface ResolvedMetadata {
  title: string;
  description: string;
  canonicalUrl: string | null;
  noIndex: boolean;
  isDashboard: boolean;
}

/**
 * Public marketing pages canonical metadata
 */
export const MARKETING_METADATA: Record<string, PageMetadata> = {
  home: {
    title: 'Locora AI — Your AI Business Manager for Local Growth',
    description:
      'Tell Locora what to improve — it finds the opportunities, explains what matters, and does the work. AI business copilot for local service businesses and agencies.',
    canonicalPath: '/',
    noIndex: false,
  },
  products: {
    title: 'Locora AI Products — All-in-One Business Software & Local SEO Platform',
    description:
      'All-in-one AI business platform combining client CRM, digital proposal generator, instant invoicing, and local SEO tools for service businesses and agencies.',
    canonicalPath: '/products',
    noIndex: false,
  },
  pricing_public: {
    title: 'Locora AI Pricing — Plans for Local Businesses & Agencies',
    description:
      'Simple, transparent pricing for solo business owners and agencies. Start free, upgrade as you grow. AI-powered CRM, proposals, invoicing, and local SEO in one plan.',
    canonicalPath: '/pricing',
    noIndex: false,
  },
  pricing: {
    title: 'Locora AI Pricing — Plans for Local Businesses & Agencies',
    description:
      'Simple, transparent pricing for solo business owners and agencies. Start free, upgrade as you grow. AI-powered CRM, proposals, invoicing, and local SEO in one plan.',
    canonicalPath: '/pricing',
    noIndex: false,
  },
  features: {
    title: 'AI Business Operating System — CRM, Proposals & Local SEO',
    description:
      'One AI copilot for client management, invoicing, proposals, review management, and Google Business Profile growth — built for service businesses and local agencies.',
    canonicalPath: '/features',
    noIndex: false,
  },
  use_cases_hub: {
    title: 'Use Cases — How Local Businesses Grow with Locora AI',
    description:
      'See how plumbers, contractors, real estate agents, and agencies use Locora AI to win more local customers.',
    canonicalPath: '/use-cases',
    noIndex: false,
  },
  'use-cases': {
    title: 'Use Cases — How Local Businesses Grow with Locora AI',
    description:
      'See how plumbers, contractors, real estate agents, and agencies use Locora AI to win more local customers.',
    canonicalPath: '/use-cases',
    noIndex: false,
  },
  resources_hub: {
    title: 'Resources & Guides — Local SEO and AI Growth Tips',
    description:
      'Practical guides on local SEO, Google Business Profile optimization, client management, and growing a service business with AI.',
    canonicalPath: '/resources',
    noIndex: false,
  },
  resources: {
    title: 'Resources & Guides — Local SEO and AI Growth Tips',
    description:
      'Practical guides on local SEO, Google Business Profile optimization, client management, and growing a service business with AI.',
    canonicalPath: '/resources',
    noIndex: false,
  },
  agency_landing: {
    title: 'Locora AI for Agencies — Manage & Grow Every Client',
    description:
      'Run your local SEO agency on one platform: client CRM, white-label reports, proposal generation, and AI-driven growth plans for every client you manage.',
    canonicalPath: '/for/agencies',
    noIndex: false,
  },
  agencies: {
    title: 'Locora AI for Agencies — Manage & Grow Every Client',
    description:
      'Run your local SEO agency on one platform: client CRM, white-label reports, proposal generation, and AI-driven growth plans for every client you manage.',
    canonicalPath: '/for/agencies',
    noIndex: false,
  },
  about: {
    title: 'About Locora AI — The AI Operating System for Local Business',
    description:
      'Locora AI was built to eliminate administrative friction for local service businesses and growth agencies.',
    canonicalPath: '/about',
    noIndex: false,
  },
  contact: {
    title: 'Contact Locora AI — Customer Support & Growth Team',
    description:
      'Get in touch with the Locora AI team for enterprise consultations, onboarding assistance, or product support.',
    canonicalPath: '/contact',
    noIndex: false,
  },
  privacy: {
    title: 'Privacy Policy — Locora AI',
    description: 'Privacy Policy and data protection commitments for Locora AI users.',
    canonicalPath: '/privacy',
    noIndex: false,
  },
  terms: {
    title: 'Terms of Service — Locora AI',
    description: 'Terms of Service and legal agreements for Locora AI platform usage.',
    canonicalPath: '/terms',
    noIndex: false,
  },
  refund: {
    title: 'Cancellation & Refund Policy — Locora AI',
    description: 'Cancellation and refund policies for Locora AI subscriptions and plans.',
    canonicalPath: '/refund',
    noIndex: false,
  },
  security: {
    title: 'Security & Infrastructure Overview — Locora AI',
    description: 'Enterprise data protection, encryption standards, and AI processing policies at Locora AI.',
    canonicalPath: '/security',
    noIndex: false,
  },
  login: {
    title: 'Log In — Locora AI',
    description: 'Sign in to your Locora AI workspace.',
    canonicalPath: null,
    noIndex: true,
  },
  signup: {
    title: 'Create Account — Locora AI',
    description: 'Start your free Locora AI account and access your AI business manager.',
    canonicalPath: null,
    noIndex: true,
  },
};

/**
 * Highly targeted per-industry metadata (/for/*)
 */
export const INDUSTRY_METADATA: Record<string, PageMetadata> = {
  restaurants: {
    title: 'Restaurant Marketing AI & Reputation Management — Locora AI',
    description:
      'Fill your dining room, grow local Google Maps search visibility, automate diner review responses, and streamline catering proposals with Locora AI.',
    canonicalPath: '/for/restaurants',
    noIndex: false,
  },
  'hvac-contractors': {
    title: 'HVAC Business Software & AI CRM for Contractors — Locora AI',
    description:
      'Capture emergency repair calls, expand visibility across your service radius, send mobile job estimates on-site, and manage maintenance contract renewals with Locora AI.',
    canonicalPath: '/for/hvac-contractors',
    noIndex: false,
  },
  'real-estate': {
    title: 'AI Tools for Real Estate Agents & Teams — Locora AI',
    description:
      'Establish hyper-local neighborhood authority, streamline buyer and seller follow-up, create listing proposals, and nurture real estate leads with Locora AI.',
    canonicalPath: '/for/real-estate',
    noIndex: false,
  },
  'law-firms': {
    title: 'Law Firm Client Management & Intake CRM — Locora AI',
    description:
      'Attract qualified legal inquiries, streamline client intake proposals and retainer agreements, and safeguard your firm\'s 5-star reputation with Locora AI.',
    canonicalPath: '/for/law-firms',
    noIndex: false,
  },
  plumbers: {
    title: 'AI Tools & Business Software for Plumbers — Locora AI',
    description:
      'Get found for emergency drain cleaning, pipe repairs, and water heater installs. Send instant digital quotes, manage customer follow-ups, and win more local jobs with Locora AI.',
    canonicalPath: '/for/plumbers',
    noIndex: false,
  },
  'med-spas': {
    title: 'Med Spa Marketing Software & AI CRM — Locora AI',
    description:
      'Attract aesthetic clients, streamline consultation treatment plans, manage recurring memberships, and build a 5-star reputation with Locora AI.',
    canonicalPath: '/for/med-spas',
    noIndex: false,
  },
  'auto-repair': {
    title: 'Auto Repair Shop Software & AI CRM — Locora AI',
    description:
      'Fill your service bays, get found for high-margin repair terms, deliver transparent itemized digital estimates, and automate maintenance reminders with Locora AI.',
    canonicalPath: '/for/auto-repair',
    noIndex: false,
  },
  contractors: {
    title: 'Contractor CRM & AI Proposal Generator — Locora AI',
    description:
      'Win construction and remodeling bids with on-site 3-tier proposals, expand service radius Google Maps SEO, and automate client CRM with Locora AI.',
    canonicalPath: '/for/contractors',
    noIndex: false,
  },
  agencies: {
    title: 'White Label Local SEO Platform & Agency CRM — Locora AI',
    description:
      'Run your local SEO agency on one platform: client CRM, white-label reports, proposal generation, and AI-driven growth plans for every client you manage.',
    canonicalPath: '/for/agencies',
    noIndex: false,
  },
  dentists: {
    title: 'Dental Practice Marketing Software & Patient CRM — Locora AI',
    description:
      'Grow dental practice visibility on Google Maps, automate patient review responses, manage treatment plan estimates, and attract qualified new patients with Locora AI.',
    canonicalPath: '/for/dentists',
    noIndex: false,
  },
};

/**
 * Dashboard & private workspace route names
 */
export const DASHBOARD_ROUTES = new Set([
  'ai-manager',
  'growth',
  'growth-hub',
  'visibility',
  'local-visibility',
  'seo',
  'local-seo',
  'reputation',
  'customers',
  'content',
  'content-studio',
  'reports',
  'work',
  'clients',
  'dashboard',
  'crm',
  'invoices',
  'proposals',
  'settings',
  'business-brain',
  'brain',
  'lead-prospector',
  'leads',
  'lead-vault',
  'masterclass-kit',
  'projects',
  'chat',
  'pipeline',
  'data-engine',
  'data_engine',
  'architecture',
  'admin',
  'app',
]);

export const APP_WORKSPACE_TITLES: Record<string, string> = {
  dashboard: 'Locora AI — Dashboard',
  ai_manager: 'AI Manager — Locora AI',
  chat: 'AI Manager — Locora AI',
  growth: 'Growth Copilot — Locora AI',
  marketing: 'Growth Copilot — Locora AI',
  marketing_planner: 'Growth Copilot — Locora AI',
  crm: 'CRM — Locora AI',
  customers: 'CRM — Locora AI',
  invoices: 'Invoices — Locora AI',
  proposals: 'Proposals — Locora AI',
  work: 'Proposals — Locora AI',
  documents: 'Documents — Locora AI',
  reports: 'Reports — Locora AI',
  visibility: 'Local Visibility — Locora AI',
  local_visibility: 'Local Visibility — Locora AI',
  local_seo: 'Local SEO — Locora AI',
  seo: 'Local SEO — Locora AI',
  reputation: 'Reputation — Locora AI',
  competitors: 'Competitors — Locora AI',
  content: 'Content Studio — Locora AI',
  business_brain: 'Business Brain — Locora AI',
  settings: 'Settings — Locora AI',
  subscription: 'Subscription — Locora AI',
  pricing: 'Subscription & Billing — Locora AI',
  lead_prospector: 'Lead Prospector — Locora AI',
  masterclass_kit: 'Masterclass Kit — Locora AI',
  website_review: 'Website Review — Locora AI',
  admin: 'Admin Console — Locora AI',
};

/**
 * Core resolver that determines the exact SEO metadata for any route and host.
 * Used on both client and server to guarantee absolute consistency.
 */
export function resolveRouteMetadata(rawPath: string, host: string = ''): ResolvedMetadata {
  const normalizedHost = host.toLowerCase();
  const isAppHost = normalizedHost.startsWith('app.locoraai.com') || normalizedHost.startsWith('app.');

  // Clean path (strip leading and trailing slashes and query strings)
  const pathWithoutQuery = rawPath.split('?')[0].split('#')[0];
  const cleanPath = pathWithoutQuery.replace(/^\/+|\/+$/g, '').trim().toLowerCase();

  // 1. App Subdomain or Dashboard Routes: Blanket noindex, nofollow, NO homepage canonical
  if (isAppHost || DASHBOARD_ROUTES.has(cleanPath)) {
    const tabName = cleanPath || 'dashboard';
    const workspaceTitle = APP_WORKSPACE_TITLES[tabName] || 'Locora AI — Dashboard';
    return {
      title: workspaceTitle,
      description: 'Locora AI Workspace and Business Operations.',
      canonicalUrl: null, // Critical: Never point noindexed dashboard to homepage!
      noIndex: true,
      isDashboard: true,
    };
  }

  // 2. Root Homepage
  if (cleanPath === '' || cleanPath === 'home') {
    return {
      title: MARKETING_METADATA.home.title,
      description: MARKETING_METADATA.home.description,
      canonicalUrl: 'https://locoraai.com/',
      noIndex: false,
      isDashboard: false,
    };
  }

  // 3. Industry Pages (/for/*)
  if (cleanPath.startsWith('for/')) {
    const industrySlug = cleanPath.replace(/^for\//, '').trim();
    const indMeta = INDUSTRY_METADATA[industrySlug];
    if (indMeta) {
      return {
        title: indMeta.title,
        description: indMeta.description,
        canonicalUrl: `https://locoraai.com/for/${industrySlug}`,
        noIndex: false,
        isDashboard: false,
      };
    }
  }

  // 4. Clean mapping for /agencies or /for-agencies
  if (cleanPath === 'agencies' || cleanPath === 'for-agencies') {
    return {
      title: INDUSTRY_METADATA.agencies.title,
      description: INDUSTRY_METADATA.agencies.description,
      canonicalUrl: 'https://locoraai.com/for/agencies',
      noIndex: false,
      isDashboard: false,
    };
  }

  // 5. Clean mapping for /resources /resources_hub /blog
  if (cleanPath === 'resources' || cleanPath === 'resources_hub' || cleanPath === 'blog') {
    return {
      title: MARKETING_METADATA.resources.title,
      description: MARKETING_METADATA.resources.description,
      canonicalUrl: 'https://locoraai.com/resources',
      noIndex: false,
      isDashboard: false,
    };
  }

  // 6. Clean mapping for /use-cases /use_cases_hub
  if (cleanPath === 'use-cases' || cleanPath === 'use_cases_hub') {
    return {
      title: MARKETING_METADATA['use-cases'].title,
      description: MARKETING_METADATA['use-cases'].description,
      canonicalUrl: 'https://locoraai.com/use-cases',
      noIndex: false,
      isDashboard: false,
    };
  }

  // 7. Check Marketing Routes Map directly
  if (MARKETING_METADATA[cleanPath]) {
    const meta = MARKETING_METADATA[cleanPath];
    return {
      title: meta.title,
      description: meta.description,
      canonicalUrl: meta.canonicalPath ? `https://locoraai.com${meta.canonicalPath}` : null,
      noIndex: Boolean(meta.noIndex),
      isDashboard: false,
    };
  }

  // 8. Dynamic feature pages (/features/:slug)
  if (cleanPath.startsWith('features/')) {
    const featureSlug = cleanPath.replace(/^features\//, '').trim();
    const formattedName = featureSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return {
      title: `${formattedName} — Locora AI Features`,
      description: `Discover how Locora AI's ${formattedName} feature helps local businesses automate growth, client CRM, and local SEO.`,
      canonicalUrl: `https://locoraai.com/features/${featureSlug}`,
      noIndex: false,
      isDashboard: false,
    };
  }

  // 9. Dynamic use case pages (/use-cases/:slug)
  if (cleanPath.startsWith('use-cases/')) {
    const slug = cleanPath.replace(/^use-cases\//, '').trim();
    const formattedName = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return {
      title: `${formattedName} — Locora AI Use Cases`,
      description: `How service businesses and growth agencies apply Locora AI to solve ${formattedName.toLowerCase()}.`,
      canonicalUrl: `https://locoraai.com/use-cases/${slug}`,
      noIndex: false,
      isDashboard: false,
    };
  }

  // 10. Dynamic resources / guides (/resources/:slug)
  if (cleanPath.startsWith('resources/')) {
    const slug = cleanPath.replace(/^resources\//, '').trim();
    const formattedName = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return {
      title: `${formattedName} Guide — Locora AI Resources`,
      description: `In-depth actionable guide on ${formattedName.toLowerCase()} for local business operators and agency founders.`,
      canonicalUrl: `https://locoraai.com/resources/${slug}`,
      noIndex: false,
      isDashboard: false,
    };
  }

  // Default fallback for unknown marketing routes
  return {
    title: 'Locora AI — Your AI Business Manager for Local Growth',
    description:
      'Tell Locora what to improve — it finds the opportunities, explains what matters, and does the work. AI business copilot for local service businesses and agencies.',
    canonicalUrl: `https://locoraai.com/${cleanPath}`,
    noIndex: false,
    isDashboard: false,
  };
}

/**
 * Escapes characters for safe inclusion inside HTML attributes and tags
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Injects per-route metadata into raw HTML (server-side and build-time static generation)
 */
export function injectMetadataIntoHtml(rawHtml: string, metadata: ResolvedMetadata): string {
  let html = rawHtml;

  // 1. Replace or Inject <title>
  if (html.includes('<title>')) {
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  } else {
    html = html.replace('<head>', `<head>\n    <title>${escapeHtml(metadata.title)}</title>`);
  }

  // 2. Replace or Inject <meta name="description" ...>
  if (/<meta\s+name="description"/i.test(html)) {
    html = html.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(metadata.description)}" />`
    );
  } else {
    html = html.replace('<head>', `<head>\n    <meta name="description" content="${escapeHtml(metadata.description)}" />`);
  }

  // 3. Handle Canonical Link Tag
  // If canonicalUrl is provided, ensure it points to the exact URL.
  // If canonicalUrl is null (e.g. dashboard / private routes), REMOVE ANY CANONICAL TAG!
  // 3. Remove deprecated or noisy keywords tag completely
  html = html.replace(/<meta\s+name="keywords"\s+content=".*?"\s*\/?>\n?/gi, '');

  // 4. Handle Canonical URL
  if (metadata.canonicalUrl) {
    if (/<link\s+rel="canonical"/i.test(html)) {
      html = html.replace(
        /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
        `<link rel="canonical" href="${metadata.canonicalUrl}" />`
      );
    } else {
      html = html.replace('</head>', `    <link rel="canonical" href="${metadata.canonicalUrl}" />\n  </head>`);
    }
  } else {
    // Remove canonical tag completely for dashboard / private views
    html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>\n?/gi, '');
  }

  // 5. Handle Robots Tag
  if (metadata.noIndex) {
    if (/<meta\s+name="robots"/i.test(html)) {
      html = html.replace(
        /<meta\s+name="robots"\s+content=".*?"\s*\/?>/i,
        '<meta name="robots" content="noindex, nofollow" />'
      );
    } else {
      html = html.replace('<head>', '<head>\n    <meta name="robots" content="noindex, nofollow" />');
    }
    // Strip public schemas on dashboard shell to prevent mixed indexing signals
    html = html.replace(/<script\s+type="application\/ld\+json">[\s\S]*?"@type":\s*"(FAQPage|HowTo|SoftwareApplication)"[\s\S]*?<\/script>\n?/gi, '');
  } else {
    if (/<meta\s+name="robots"/i.test(html)) {
      html = html.replace(
        /<meta\s+name="robots"\s+content=".*?"\s*\/?>/i,
        '<meta name="robots" content="index, follow" />'
      );
    } else {
      html = html.replace('<head>', '<head>\n    <meta name="robots" content="index, follow" />');
    }
  }

  // 6. OpenGraph & Twitter Tags
  if (metadata.canonicalUrl) {
    if (/<meta\s+property="og:url"/i.test(html)) {
      html = html.replace(
        /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
        `<meta property="og:url" content="${metadata.canonicalUrl}" />`
      );
    }
  } else {
    // Strip og:url on private dashboard routes
    html = html.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>\n?/gi, '');
  }

  if (/<meta\s+property="og:title"/i.test(html)) {
    html = html.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`
    );
  }

  if (/<meta\s+property="og:description"/i.test(html)) {
    html = html.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`
    );
  }

  if (/<meta\s+name="twitter:title"/i.test(html)) {
    html = html.replace(
      /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`
    );
  }

  if (/<meta\s+name="twitter:description"/i.test(html)) {
    html = html.replace(
      /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`
    );
  }

  return html;
}

/**
 * Client-side dynamic metadata updater for React navigation
 */
export function applyPageMetadata(
  activeTab: string,
  customMeta?: Partial<PageMetadata>
): void {
  if (typeof document === 'undefined') return;

  const currentPath = window.location.pathname;
  const currentHost = window.location.host;

  // Resolve metadata using the unified resolver
  const resolved = resolveRouteMetadata(currentPath, currentHost);

  // Apply custom overrides if passed explicitly
  if (customMeta?.title) resolved.title = customMeta.title;
  if (customMeta?.description) resolved.description = customMeta.description;
  if (customMeta?.noIndex !== undefined) resolved.noIndex = customMeta.noIndex;
  if (customMeta?.canonicalPath) {
    resolved.canonicalUrl = `https://locoraai.com${customMeta.canonicalPath.startsWith('/') ? customMeta.canonicalPath : `/${customMeta.canonicalPath}`}`;
  }

  // 1. Update Title
  document.title = resolved.title;

  // 2. Update Meta Description and purge keywords
  ensureMetaTag('description', resolved.description);
  const existingKeywords = document.querySelector('meta[name="keywords"]');
  if (existingKeywords) existingKeywords.remove();

  // 3. Handle Robots Meta
  if (resolved.noIndex) {
    ensureMetaTag('robots', 'noindex, nofollow');
  } else {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'index, follow');
    }
  }

  // 4. Handle Canonical Link and og:url
  const existingCanonical = document.querySelector('link[rel="canonical"]');
  const existingOgUrl = document.querySelector('meta[property="og:url"]');
  if (resolved.canonicalUrl) {
    ensureCanonicalLink(resolved.canonicalUrl);
    ensurePropertyTag('og:url', resolved.canonicalUrl);
  } else {
    // Crucial: remove canonical link element completely on dashboard / private pages
    if (existingCanonical) {
      existingCanonical.remove();
    }
    if (existingOgUrl) {
      existingOgUrl.remove();
    }
  }

  // 5. OpenGraph & Twitter Tags
  ensurePropertyTag('og:title', resolved.title);
  ensurePropertyTag('og:description', resolved.description);
  ensureMetaTag('twitter:title', resolved.title);
  ensureMetaTag('twitter:description', resolved.description);
}

function ensureMetaTag(name: string, content: string): void {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function ensurePropertyTag(property: string, content: string): void {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function ensureCanonicalLink(href: string): void {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

