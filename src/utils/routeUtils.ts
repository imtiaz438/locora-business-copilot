/**
 * Unified Route and Path Resolver for Locora AI
 *
 * Guarantees that all public marketing sub-pages, dynamic resource guides,
 * feature pages, use cases, industry pSEO pages, legal pages, and workspace
 * tabs maintain exact, bidirectional sync between the browser address bar,
 * reload/refresh cycles, and application state.
 */

export interface ResolvedRoute {
  targetTab: string;
  canonicalPath: string;
  isCanonical: boolean;
}

// Canonical Tab -> URL Path Map
export const TAB_TO_PATH: Record<string, string> = {
  home: '/',
  products: '/products',
  product: '/products',
  features: '/features',
  pricing_public: '/pricing',
  pricing: '/pricing-plans',
  subscription: '/subscription',
  about: '/about',
  contact: '/contact',
  login: '/login',
  signup: '/signup',
  privacy: '/privacy',
  terms: '/terms',
  refund: '/refund',
  security: '/security',
  resources: '/resources',
  resources_hub: '/resources',
  'use-cases': '/use-cases',
  use_cases: '/use-cases',
  use_cases_hub: '/use-cases',
  agency_landing: '/for/agencies',
  dashboard: '/dashboard',
  ai_manager: '/ai-manager',
  chat: '/ai-manager',
  growth: '/growth',
  marketing: '/growth',
  marketing_planner: '/growth',
  visibility: '/visibility',
  local_visibility: '/visibility',
  local_seo: '/visibility',
  seo: '/seo-audit',
  seo_audit: '/seo-audit',
  audit: '/seo-audit',
  reputation: '/reputation',
  competitors: '/competitors',
  content: '/content',
  documents: '/content',
  customers: '/customers',
  crm: '/customers',
  clients: '/clients',
  work: '/work',
  proposals: '/work',
  invoices: '/work',
  reports: '/reports',
  website_review: '/seo-audit',
  projects: '/projects',
  lead_prospector: '/lead-prospector',
  masterclass_kit: '/agency-vault',
  settings: '/settings',
  admin: '/admin',
  directory: '/directory',
  directory_business: '/directory',
  directory_city: '/directory',
  directory_category: '/directory',
};

// Static Path -> Tab Map
export const PATH_TO_TAB: Record<string, string> = {
  '': 'home',
  'home': 'home',
  'products': 'products',
  'product': 'products',
  'features': 'features',
  'features/': 'features',
  'use-cases': 'use-cases',
  'use-cases/': 'use-cases',
  'use_cases': 'use-cases',
  'use_cases_hub': 'use-cases',
  'resources': 'resources',
  'resources/': 'resources',
  'resources_hub': 'resources',
  'blog': 'resources',
  'blog/': 'resources',
  'pricing': 'pricing_public',
  'pricing/': 'pricing_public',
  'pricing-public': 'pricing_public',
  'pricing-plans': 'pricing',
  'subscription': 'subscription',
  'about': 'about',
  'about/': 'about',
  'about-us': 'about',
  'contact': 'contact',
  'contact/': 'contact',
  'contact-us': 'contact',
  'support': 'contact',
  'login': 'login',
  'signin': 'login',
  'signup': 'signup',
  'register': 'signup',
  'privacy': 'privacy',
  'privacy/': 'privacy',
  'privacy-policy': 'privacy',
  'terms': 'terms',
  'terms/': 'terms',
  'terms-of-service': 'terms',
  'terms-conditions': 'terms',
  'terms-and-conditions': 'terms',
  'term-condition': 'terms',
  'terms-condition': 'terms',
  'refund': 'refund',
  'refund/': 'refund',
  'refunds': 'refund',
  'refund-policy': 'refund',
  'cancellation-policy': 'refund',
  'security': 'security',
  'security/': 'security',
  'security-overview': 'security',
  'agencies': 'agency_landing',
  'for-agencies': 'agency_landing',
  'for/agencies': 'agency_landing',
  'dashboard': 'dashboard',
  'app': 'dashboard',
  'home-dashboard': 'dashboard',
  'growth-hub': 'dashboard',
  'ai-manager': 'ai_manager',
  'ai_manager': 'ai_manager',
  'chat': 'ai_manager',
  'growth': 'growth',
  'marketing': 'growth',
  'marketing-planner': 'growth',
  'marketing_planner': 'growth',
  'visibility': 'visibility',
  'local-visibility': 'visibility',
  'local_visibility': 'visibility',
  'local-seo': 'visibility',
  'local_seo': 'visibility',
  'seo': 'seo',
  'seo-audit': 'seo',
  'seo_audit': 'seo',
  'audit': 'seo',
  'website-audit': 'seo',
  'website-review': 'seo',
  'website_review': 'seo',
  'reputation': 'reputation',
  'competitors': 'competitors',
  'content': 'content',
  'content-studio': 'content',
  'documents': 'content',
  'customers': 'customers',
  'crm': 'customers',
  'clients': 'clients',
  'work': 'work',
  'proposals': 'work',
  'invoices': 'work',
  'reports': 'reports',
  'monthly-report': 'reports',
  'monthly_report': 'reports',
  'projects': 'projects',
  'lead-prospector': 'lead_prospector',
  'lead_prospector': 'lead_prospector',
  'lead-vault': 'lead_prospector',
  'lead_vault': 'lead_prospector',
  'b2b-vault': 'lead_prospector',
  'b2b_vault': 'lead_prospector',
  'b2b': 'lead_prospector',
  'leads': 'lead_prospector',
  'prospector': 'lead_prospector',
  'masterclass': 'masterclass_kit',
  'masterclass-kit': 'masterclass_kit',
  'masterclass_kit': 'masterclass_kit',
  'agency-vault': 'masterclass_kit',
  'agency_vault': 'masterclass_kit',
  'growth-vault': 'masterclass_kit',
  'growth_vault': 'masterclass_kit',
  'vault': 'masterclass_kit',
  'settings': 'settings',
  'admin': 'admin',
};

/**
 * Resolves the canonical URL path for a given tab.
 */
export function resolvePathFromTab(tab: string, currentPathname: string = ''): string {
  if (!tab) return '/';

  // 1. Dynamic Resource Guides (/resources/:slug)
  if (tab.startsWith('resource_')) {
    const slug = tab.replace(/^resource_/, '').trim();
    return `/resources/${slug}`;
  }

  // 2. Dynamic Feature Pages (/features/:slug)
  if (tab.startsWith('feature_')) {
    const slug = tab.replace(/^feature_/, '').trim();
    return `/features/${slug}`;
  }

  // 3. Dynamic Use Case Pages (/use-cases/:slug)
  if (tab.startsWith('usecase_') || tab.startsWith('use_case_')) {
    const slug = tab.replace(/^usecase_/, '').replace(/^use_case_/, '').trim();
    return `/use-cases/${slug}`;
  }

  // 4. Industry pSEO Pages (/for/:slug)
  if (tab === 'industry_pseo') {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/for/')) {
      return window.location.pathname;
    }
    if (currentPathname.startsWith('/for/')) {
      return currentPathname;
    }
    return '/for/restaurants';
  }

  // 5. Agency Landing Page
  if (tab === 'agency_landing') {
    return '/for/agencies';
  }

  // 6. Directory Subdomain & Dynamic Directory Pages
  if (tab === 'directory') {
    return '/directory';
  }
  if (tab.startsWith('directory_biz_')) {
    const slug = tab.replace(/^directory_biz_/, '').trim();
    return `/biz/${slug}`;
  }
  if (tab.startsWith('directory_city_cat_')) {
    const parts = tab.replace(/^directory_city_cat_/, '').split('__');
    return `/directory/${parts[0]}/${parts[1]}`;
  }
  if (tab.startsWith('directory_city_')) {
    const slug = tab.replace(/^directory_city_/, '').trim();
    return `/directory/city/${slug}`;
  }
  if (tab.startsWith('directory_cat_')) {
    const slug = tab.replace(/^directory_cat_/, '').trim();
    return `/directory/category/${slug}`;
  }

  // 7. Static Tab Map
  if (TAB_TO_PATH[tab]) {
    return TAB_TO_PATH[tab];
  }

  return `/${tab}`;
}

/**
 * Parses any incoming URL path (including legacy variations like /resource_:slug, /feature_:slug)
 * and resolves the exact active tab and canonical clean URL.
 */
export function resolveRouteFromPath(rawPath: string, isApp: boolean = false, isDirectory: boolean = false): ResolvedRoute {
  // Strip query string, hash, and leading/trailing slashes
  const pathWithoutQuery = rawPath.split('?')[0].split('#')[0];
  const cleanPath = pathWithoutQuery.replace(/^\/+|\/+$/g, '').trim();

  // Directory Subdomain Override: on directory.locoraai.com, root or empty maps to directory hub
  if (isDirectory) {
    if (cleanPath === '' || cleanPath === 'directory') {
      return { targetTab: 'directory', canonicalPath: '/', isCanonical: cleanPath === '' };
    }
  }

  // App Subdomain Override
  if (isApp) {
    if (cleanPath === '' || cleanPath === 'home' || cleanPath === 'app' || cleanPath === 'dashboard') {
      return { targetTab: 'dashboard', canonicalPath: '/dashboard', isCanonical: cleanPath === 'dashboard' };
    }
    if (cleanPath === 'pricing' || cleanPath === 'pricing-plans') {
      return { targetTab: 'subscription', canonicalPath: '/pricing-plans', isCanonical: true };
    }
  }

  // Root Directory Route (if accessed on main domain as /directory)
  if (cleanPath === 'directory') {
    return { targetTab: 'directory', canonicalPath: '/directory', isCanonical: true };
  }

  // Dynamic Business Directory Routes:
  // 1. Business Profile: /biz/:slug, /business/:slug, /directory/business/:slug, /directory/biz/:slug
  if (cleanPath.startsWith('biz/')) {
    const slug = cleanPath.replace(/^biz\//, '').trim();
    if (slug) {
      return {
        targetTab: `directory_biz_${slug}`,
        canonicalPath: isDirectory ? `/business/${slug}` : `/biz/${slug}`,
        isCanonical: isDirectory ? false : true,
      };
    }
  }
  if (cleanPath.startsWith('business/')) {
    const slug = cleanPath.replace(/^business\//, '').trim();
    if (slug) {
      return {
        targetTab: `directory_biz_${slug}`,
        canonicalPath: isDirectory ? `/business/${slug}` : `/biz/${slug}`,
        isCanonical: isDirectory ? true : false,
      };
    }
  }
  if (cleanPath.startsWith('directory/business/')) {
    const slug = cleanPath.replace(/^directory\/business\//, '').trim();
    if (slug) {
      return { targetTab: `directory_biz_${slug}`, canonicalPath: `/directory/business/${slug}`, isCanonical: true };
    }
  }
  if (cleanPath.startsWith('directory/biz/')) {
    const slug = cleanPath.replace(/^directory\/biz\//, '').trim();
    if (slug) {
      return { targetTab: `directory_biz_${slug}`, canonicalPath: `/directory/business/${slug}`, isCanonical: false };
    }
  }

  // 2. City Directory: /city/:slug or /directory/city/:slug
  if (cleanPath.startsWith('city/')) {
    const slug = cleanPath.replace(/^city\//, '').trim();
    if (slug) {
      return { targetTab: `directory_city_${slug}`, canonicalPath: `/city/${slug}`, isCanonical: true };
    }
  }
  if (cleanPath.startsWith('directory/city/')) {
    const slug = cleanPath.replace(/^directory\/city\//, '').trim();
    if (slug) {
      return { targetTab: `directory_city_${slug}`, canonicalPath: `/directory/city/${slug}`, isCanonical: true };
    }
  }

  // 3. Category Directory: /category/:slug or /directory/category/:slug
  if (cleanPath.startsWith('category/')) {
    const slug = cleanPath.replace(/^category\//, '').trim();
    if (slug) {
      return { targetTab: `directory_cat_${slug}`, canonicalPath: `/category/${slug}`, isCanonical: true };
    }
  }
  if (cleanPath.startsWith('directory/category/')) {
    const slug = cleanPath.replace(/^directory\/category\//, '').trim();
    if (slug) {
      return { targetTab: `directory_cat_${slug}`, canonicalPath: `/directory/category/${slug}`, isCanonical: true };
    }
  }

  // 4. Combined City + Category Directory: /directory/:city/:category
  if (cleanPath.startsWith('directory/')) {
    const subParts = cleanPath.replace(/^directory\//, '').split('/');
    if (subParts.length === 2 && subParts[0] && subParts[1]) {
      const citySlug = subParts[0].trim();
      const catSlug = subParts[1].trim();
      return {
        targetTab: `directory_city_cat_${citySlug}__${catSlug}`,
        canonicalPath: `/directory/${citySlug}/${catSlug}`,
        isCanonical: true,
      };
    }
  }

  // Root Homepage
  if (cleanPath === '' || cleanPath === 'home') {
    return { targetTab: 'home', canonicalPath: '/', isCanonical: cleanPath === '' };
  }

  // 1. Dynamic Resources / Guides:
  // Handles: /resources/:slug, /resource/:slug, /resource_:slug, /resource-:slug, /blog/:slug
  const resourcePrefixes = ['resources/', 'resource/', 'resource_', 'resource-', 'blog/'];
  for (const prefix of resourcePrefixes) {
    if (cleanPath.startsWith(prefix)) {
      const slug = cleanPath.slice(prefix.length).trim();
      if (slug) {
        return {
          targetTab: `resource_${slug}`,
          canonicalPath: `/resources/${slug}`,
          isCanonical: cleanPath === `resources/${slug}`,
        };
      }
    }
  }

  // 2. Dynamic Features:
  // Handles: /features/:slug, /feature/:slug, /feature_:slug, /feature-:slug
  const featurePrefixes = ['features/', 'feature/', 'feature_', 'feature-'];
  for (const prefix of featurePrefixes) {
    if (cleanPath.startsWith(prefix)) {
      const slug = cleanPath.slice(prefix.length).trim();
      if (slug) {
        return {
          targetTab: `feature_${slug}`,
          canonicalPath: `/features/${slug}`,
          isCanonical: cleanPath === `features/${slug}`,
        };
      }
    }
  }

  // 3. Dynamic Use Cases:
  // Handles: /use-cases/:slug, /use-case/:slug, /usecase/:slug, /usecase_:slug, /use_case_:slug, /usecase-:slug
  const useCasePrefixes = ['use-cases/', 'use-case/', 'usecase/', 'usecase_', 'use_case_', 'usecase-'];
  for (const prefix of useCasePrefixes) {
    if (cleanPath.startsWith(prefix)) {
      const slug = cleanPath.slice(prefix.length).trim();
      if (slug) {
        return {
          targetTab: `usecase_${slug}`,
          canonicalPath: `/use-cases/${slug}`,
          isCanonical: cleanPath === `use-cases/${slug}`,
        };
      }
    }
  }

  // 4. Industry pSEO Pages:
  // Handles: /for/:slug, /industries/:slug, /industry/:slug
  const industryPrefixes = ['for/', 'industries/', 'industry/'];
  for (const prefix of industryPrefixes) {
    if (cleanPath.startsWith(prefix)) {
      const slug = cleanPath.slice(prefix.length).trim();
      if (slug === 'agencies') {
        return { targetTab: 'agency_landing', canonicalPath: '/for/agencies', isCanonical: cleanPath === 'for/agencies' };
      }
      if (slug) {
        return {
          targetTab: 'industry_pseo',
          canonicalPath: `/for/${slug}`,
          isCanonical: cleanPath === `for/${slug}`,
        };
      }
    }
  }

  // 5. Agency Landing Aliases
  if (cleanPath === 'agencies' || cleanPath === 'for-agencies') {
    return { targetTab: 'agency_landing', canonicalPath: '/for/agencies', isCanonical: false };
  }

  // 6. Static Path Map
  if (PATH_TO_TAB[cleanPath]) {
    const tab = PATH_TO_TAB[cleanPath];
    const canonical = TAB_TO_PATH[tab] || `/${cleanPath}`;
    return {
      targetTab: tab,
      canonicalPath: canonical,
      isCanonical: `/${cleanPath}` === canonical,
    };
  }

  // 7. City / Category Clean Route: /:city/:category (e.g. /austin/dentist or /dallas/plumbing)
  const pathParts = cleanPath.split('/');
  if (pathParts.length === 2 && pathParts[0] && pathParts[1]) {
    const reservedRootWords = [
      'features', 'feature', 'resources', 'resource', 'use-cases', 'usecase', 'for', 'industries',
      'industry', 'blog', 'api', 'checkout', 'billing', 'directory', 'business', 'biz', 'city',
      'category', 'admin', 'login', 'signup', 'pricing', 'about', 'contact', 'privacy', 'terms', 'security'
    ];
    if (!reservedRootWords.includes(pathParts[0].toLowerCase())) {
      const citySlug = pathParts[0].trim();
      const catSlug = pathParts[1].trim();
      return {
        targetTab: `directory_city_cat_${citySlug}__${catSlug}`,
        canonicalPath: `/${citySlug}/${catSlug}`,
        isCanonical: true,
      };
    }
  }

  // Default fallback to home (or workspace if authenticated)
  return { targetTab: 'home', canonicalPath: '/', isCanonical: true };
}
