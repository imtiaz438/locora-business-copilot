import type {
  SeoPageContext,
  InternalLinkItem,
  PublishedEntitiesSnapshot,
} from './types';

/**
 * Generates dynamic, contextual internal links strictly connecting
 * real database entities that exist with verified content.
 */
export function generateDynamicInternalLinks(
  ctx: SeoPageContext,
  snapshot?: PublishedEntitiesSnapshot
): InternalLinkItem[] {
  const links: InternalLinkItem[] = [];
  const seen = new Set<string>();

  const addLink = (item: InternalLinkItem) => {
    if (!item.href || seen.has(item.href)) return;
    seen.add(item.href);
    links.push(item);
  };

  const businesses = snapshot?.businesses || [];
  const cities = snapshot?.cities || [];
  const categories = snapshot?.categories || [];
  const pairs = snapshot?.cityCategoryPairs || [];

  const city = ctx.city?.trim() || '';
  const citySlug = ctx.citySlug || (city ? city.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
  const category = ctx.category?.trim() || '';
  const catSlug = ctx.categorySlug || (category ? category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');

  // =========================================================================
  // 1. BUSINESS PROFILE: Link to Category in City, City, Category, Related Biz
  // =========================================================================
  if (ctx.pageType === 'business_profile') {
    // 1. City + Category Gateway
    if (citySlug && catSlug) {
      addLink({
        title: `${category || 'Services'} in ${city}`,
        href: `/${citySlug}/${catSlug}`,
        type: 'city_category',
        description: `Browse all verified ${category || 'providers'} in ${city}`,
      });
    }

    // 2. City Directory
    if (citySlug) {
      addLink({
        title: `All Local Businesses in ${city}`,
        href: `/${citySlug}`,
        type: 'city',
        description: `Explore the verified local service directory for ${city}`,
      });
    }

    // 3. Category Directory
    if (catSlug) {
      addLink({
        title: `All ${category} Providers Directory`,
        href: `/category/${catSlug}`,
        type: 'category',
        description: `Browse verified ${category} across all locations`,
      });
    }

    // 4. Other published businesses in the same city / category
    const sameCityOrCat = businesses.filter(
      (b) =>
        b.slug !== ctx.businessSlug &&
        (b.city.toLowerCase() === city.toLowerCase() || b.category.toLowerCase() === category.toLowerCase())
    );

    sameCityOrCat.slice(0, 4).forEach((b) => {
      addLink({
        title: `${b.name} (${b.category} in ${b.city})`,
        href: `/biz/${b.slug}`,
        type: 'business',
        description: `View profile and ratings for ${b.name}`,
      });
    });

    // 5. Main directory fallback
    addLink({
      title: 'Locora Local Business Directory',
      href: '/directory',
      type: 'site_page',
      description: 'Search verified local providers and request quotes',
    });
  }

  // =========================================================================
  // 2. CATEGORY + CITY DIRECTORY PAGES: /[city]/[category]
  // =========================================================================
  else if (ctx.pageType === 'category_city') {
    // 1. Link to individual businesses in this city + category
    const matchingBiz = businesses.filter(
      (b) =>
        b.city.toLowerCase() === city.toLowerCase() &&
        (b.category.toLowerCase() === category.toLowerCase() || b.categorySlug === catSlug)
    );

    matchingBiz.forEach((b) => {
      addLink({
        title: b.name,
        href: `/biz/${b.slug}`,
        type: 'business',
        description: `${b.category} in ${b.city}`,
      });
    });

    // 2. Other categories available in this city
    const otherCatsInCity = pairs
      .filter((p) => p.city.toLowerCase() === city.toLowerCase() && p.categorySlug !== catSlug)
      .slice(0, 5);

    otherCatsInCity.forEach((p) => {
      addLink({
        title: `${p.category} in ${city}`,
        href: `/${citySlug}/${p.categorySlug}`,
        type: 'city_category',
        count: p.count,
      });
    });

    // 3. Other cities that offer this category
    const otherCitiesForCat = pairs
      .filter((p) => p.category.toLowerCase() === category.toLowerCase() && p.citySlug !== citySlug)
      .slice(0, 5);

    otherCitiesForCat.forEach((p) => {
      addLink({
        title: `${category} in ${p.city}`,
        href: `/${p.citySlug}/${catSlug}`,
        type: 'city_category',
        count: p.count,
      });
    });

    // 4. City Hub & Category Hub
    if (citySlug) {
      addLink({
        title: `All Local Services in ${city}`,
        href: `/${citySlug}`,
        type: 'city',
      });
    }
    if (catSlug) {
      addLink({
        title: `Explore ${category} Directory`,
        href: `/category/${catSlug}`,
        type: 'category',
      });
    }
  }

  // =========================================================================
  // 3. CITY PAGES: /[city]
  // =========================================================================
  else if (ctx.pageType === 'city') {
    // Link to all categories available in this city
    const cityCats = pairs.filter((p) => p.city.toLowerCase() === city.toLowerCase());
    cityCats.forEach((p) => {
      addLink({
        title: `${p.category} in ${city}`,
        href: `/${citySlug}/${p.categorySlug}`,
        type: 'city_category',
        count: p.count,
      });
    });

    // Link to featured businesses in this city
    const cityBiz = businesses.filter((b) => b.city.toLowerCase() === city.toLowerCase()).slice(0, 6);
    cityBiz.forEach((b) => {
      addLink({
        title: b.name,
        href: `/biz/${b.slug}`,
        type: 'business',
      });
    });

    // Link to other cities with published businesses
    cities
      .filter((c) => c.slug !== citySlug)
      .slice(0, 5)
      .forEach((c) => {
        addLink({
          title: `Businesses in ${c.name}`,
          href: `/${c.slug}`,
          type: 'city',
          count: c.count,
        });
      });

    addLink({
      title: 'Full Business Directory',
      href: '/directory',
      type: 'site_page',
    });
  }

  // =========================================================================
  // 4. CATEGORY PAGES: /category/{category}
  // =========================================================================
  else if (ctx.pageType === 'category') {
    // Link to all cities with businesses in this category
    const catCities = pairs.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase() || p.categorySlug === catSlug
    );
    catCities.forEach((p) => {
      addLink({
        title: `${category} in ${p.city}`,
        href: `/${p.citySlug}/${catSlug}`,
        type: 'city_category',
        count: p.count,
      });
    });

    // Link to featured businesses in this category
    const catBiz = businesses
      .filter((b) => b.category.toLowerCase() === category.toLowerCase() || b.categorySlug === catSlug)
      .slice(0, 6);
    catBiz.forEach((b) => {
      addLink({
        title: b.name,
        href: `/biz/${b.slug}`,
        type: 'business',
      });
    });

    // Link to other categories
    categories
      .filter((c) => c.slug !== catSlug)
      .slice(0, 5)
      .forEach((c) => {
        addLink({
          title: `${c.name} Directory`,
          href: `/category/${c.slug}`,
          type: 'category',
          count: c.count,
        });
      });

    addLink({
      title: 'Full Business Directory',
      href: '/directory',
      type: 'site_page',
    });
  }

  // =========================================================================
  // 5. DIRECTORY INDEX & SITE PAGES
  // =========================================================================
  else {
    // Top cities
    cities.slice(0, 4).forEach((c) => {
      addLink({
        title: `Businesses in ${c.name}`,
        href: `/${c.slug}`,
        type: 'city',
        count: c.count,
      });
    });

    // Top categories
    categories.slice(0, 4).forEach((c) => {
      addLink({
        title: `${c.name} Directory`,
        href: `/category/${c.slug}`,
        type: 'category',
        count: c.count,
      });
    });

    // Platform feature links
    addLink({
      title: 'Free Local SEO & Business Audit',
      href: '/seo-audit',
      type: 'site_page',
    });
    addLink({
      title: 'Generative Engine Optimization (GEO)',
      href: '/features/ai-business-chat',
      type: 'site_page',
    });
    addLink({
      title: 'Local SEO for Agencies',
      href: '/for/agencies',
      type: 'site_page',
    });
    addLink({
      title: 'Pricing & Plans',
      href: '/pricing',
      type: 'site_page',
    });
  }

  return links;
}
