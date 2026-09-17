/**
 * Domain & Subdomain Routing Configuration for Locora AI
 * 
 * Supports:
 * - Public Marketing Site: https://locoraai.com (and www.locoraai.com)
 * - Dashboard / App Subdomain: https://app.locoraai.com
 * - Development / Preview: Seamless operation on localhost and Cloud Run containers (.run.app),
 *   with optional testing override via ?domain=app or ?domain=main.
 */

export const PRODUCTION_MAIN_DOMAIN = 'locoraai.com';
export const PRODUCTION_APP_DOMAIN = 'app.locoraai.com';
export const PRODUCTION_DIRECTORY_DOMAIN = 'directory.locoraai.com';

/**
 * Checks if the current client session is running on the directory subdomain (directory.locoraai.com).
 */
export const isDirectorySubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);

  // Testing override for development / preview environments
  if (searchParams.get('domain') === 'directory') return true;

  return (
    hostname === PRODUCTION_DIRECTORY_DOMAIN ||
    hostname.startsWith('directory.') ||
    hostname.includes('directory-')
  );
};

/**
 * Checks if the current client session is running on the app subdomain (app.locoraai.com).
 */
export const isAppSubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);

  // Testing override for development / preview environments
  if (searchParams.get('domain') === 'app') return true;
  if (searchParams.get('domain') === 'main' || searchParams.get('domain') === 'directory') return false;

  return (
    hostname === PRODUCTION_APP_DOMAIN ||
    hostname.startsWith('app.') ||
    hostname.includes('app-')
  );
};

/**
 * Checks if the current environment is running on the production custom domain.
 */
export const isProductionCustomDomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname === PRODUCTION_MAIN_DOMAIN ||
    hostname === `www.${PRODUCTION_MAIN_DOMAIN}` ||
    hostname === PRODUCTION_APP_DOMAIN ||
    hostname === PRODUCTION_DIRECTORY_DOMAIN
  );
};

/**
 * Returns the target URL for the public marketing site.
 * In production custom domain, points to https://locoraai.com
 * In dev/preview, returns relative path so developers aren't navigated away.
 */
export const getMainSiteUrl = (path: string = '/'): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined') return cleanPath;

  if (isProductionCustomDomain()) {
    return `https://${PRODUCTION_MAIN_DOMAIN}${cleanPath}`;
  }
  return cleanPath;
};

/**
 * Returns the target URL for the app/dashboard site.
 * In production custom domain, points to https://app.locoraai.com
 * In dev/preview, returns relative path.
 */
export const getAppSiteUrl = (path: string = '/dashboard'): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined') return cleanPath;

  if (isProductionCustomDomain()) {
    return `https://${PRODUCTION_APP_DOMAIN}${cleanPath}`;
  }
  return cleanPath;
};

/**
 * Navigates to the app dashboard / login.
 */
export const navigateToApp = (path: string = '/dashboard', inAppFallback?: () => void) => {
  if (typeof window === 'undefined') return;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (isProductionCustomDomain() && !isAppSubdomain()) {
    window.location.href = `https://${PRODUCTION_APP_DOMAIN}${cleanPath}`;
  } else if (inAppFallback) {
    inAppFallback();
  } else {
    window.history.pushState({}, '', cleanPath);
  }
};

/**
 * Navigates to the public marketing site.
 */
export const navigateToMain = (path: string = '/', inAppFallback?: () => void) => {
  if (typeof window === 'undefined') return;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If running in production custom domain and currently on app or directory subdomain, cross-domain redirect to locoraai.com:
  if (isProductionCustomDomain() && (isAppSubdomain() || isDirectorySubdomain())) {
    window.location.href = `https://${PRODUCTION_MAIN_DOMAIN}${cleanPath}`;
    return;
  }

  // Development/preview testing override support (?domain=directory or ?domain=app)
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('domain') === 'directory' || searchParams.get('domain') === 'app') {
    searchParams.delete('domain');
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    window.location.href = `${cleanPath}${qs}`;
    return;
  }

  if (inAppFallback) {
    inAppFallback();
  } else {
    window.history.pushState({}, '', cleanPath);
  }
};

/**
 * Returns the target URL for the directory site (directory.locoraai.com).
 * In production custom domain, points to https://directory.locoraai.com
 * In dev/preview, points to the local directory routes.
 */
export const getDirectorySiteUrl = (path: string = '/'): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined') return cleanPath;

  if (isProductionCustomDomain()) {
    return `https://${PRODUCTION_DIRECTORY_DOMAIN}${cleanPath}`;
  }

  // In dev / preview container:
  if (cleanPath === '/' || cleanPath === '') {
    return '/directory';
  }
  if (cleanPath.startsWith('/business/')) {
    return `/biz/${cleanPath.replace('/business/', '')}`;
  }
  return cleanPath;
};

/**
 * Returns the live URL for a specific business on the directory.
 * In production: https://directory.locoraai.com/business/:slug
 * In preview / development: /biz/:slug
 */
export const getDirectoryBusinessUrl = (slug: string): string => {
  const cleanSlug = (slug || '').trim();
  if (isProductionCustomDomain()) {
    return `https://${PRODUCTION_DIRECTORY_DOMAIN}/business/${cleanSlug}`;
  }
  return `/biz/${cleanSlug}`;
};

/**
 * Returns the live URL for a specific city on the directory.
 * In production: https://directory.locoraai.com/city/:citySlug
 * In preview / development: /directory/city/:citySlug
 */
export const getDirectoryCityUrl = (citySlug: string): string => {
  const cleanCity = (citySlug || '').trim();
  if (isProductionCustomDomain()) {
    return `https://${PRODUCTION_DIRECTORY_DOMAIN}/city/${cleanCity}`;
  }
  return `/city/${cleanCity}`;
};

/**
 * Returns the live URL for a specific category on the directory.
 * In production: https://directory.locoraai.com/category/:categorySlug
 * In preview / development: /directory/category/:categorySlug
 */
export const getDirectoryCategoryUrl = (categorySlug: string): string => {
  const cleanCat = (categorySlug || '').trim();
  if (isProductionCustomDomain()) {
    return `https://${PRODUCTION_DIRECTORY_DOMAIN}/category/${cleanCat}`;
  }
  return `/category/${cleanCat}`;
};

/**
 * Navigates to the directory site.
 */
export const navigateToDirectory = (path: string = '/', inAppFallback?: () => void) => {
  if (typeof window === 'undefined') return;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (isProductionCustomDomain() && !isDirectorySubdomain()) {
    window.location.href = `https://${PRODUCTION_DIRECTORY_DOMAIN}${cleanPath}`;
    return;
  }

  if (inAppFallback) {
    inAppFallback();
  } else {
    const targetPath = cleanPath === '/' 
      ? '/directory' 
      : cleanPath.startsWith('/business/') 
        ? `/biz/${cleanPath.replace('/business/', '')}` 
        : cleanPath;
    window.history.pushState({}, '', targetPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
};

