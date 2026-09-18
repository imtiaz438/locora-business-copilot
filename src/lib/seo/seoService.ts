import type {
  SeoPageContext,
  CompletePageSeoResult,
  PublishedEntitiesSnapshot,
  PublishedBusinessEntity,
} from './types';
import { generatePageKeywords } from './keywordEngine';
import { generatePageMetadata, generatePageBreadcrumbs } from './templates';
import { generatePageStructuredData } from './structuredData';
import { generateDynamicInternalLinks } from './internalLinks';

/**
 * Extracts a structured snapshot of verified entities from any array of business listings.
 */
export function extractSnapshotFromBusinesses(listings: any[]): PublishedEntitiesSnapshot {
  const publishedListings = (listings || []).filter(
    (b) => b && (b.isPublishedInDirectory === true || b.isPublished === true)
  );

  const businesses: PublishedBusinessEntity[] = publishedListings.map((b) => {
    const name = b.businessName || b.name || 'Local Business';
    const city = b.cityName || b.city || '';
    const state = b.stateCode || b.state || '';
    const country = b.country || 'United States';
    const category = b.categoryName || b.category || 'Local Services';
    const slug = b.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const citySlug = b.citySlug || (city ? city.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
    const categorySlug = b.categorySlug || (category ? category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
    const services = Array.isArray(b.services)
      ? b.services
      : Array.isArray(b.scrapedContent?.serviceTags)
      ? b.scrapedContent.serviceTags
      : [];

    return {
      id: b.id,
      name,
      slug,
      category,
      categorySlug,
      city,
      citySlug,
      suburb: b.suburb,
      state,
      country,
      phone: b.phone || b.gbpData?.phone,
      website: b.website || b.websiteUrl,
      address: b.address || b.gbpData?.address,
      services,
      rating: b.gbpData?.averageRating ?? b.rating,
      reviewCount: b.gbpData?.reviewCount ?? b.reviewCount,
      openingHours: b.openingHours || b.gbpData?.hours || [],
      isPublished: true,
    };
  });

  const cityMap = new Map<string, { name: string; slug: string; count: number }>();
  const categoryMap = new Map<string, { name: string; slug: string; count: number }>();
  const pairMap = new Map<string, { city: string; citySlug: string; category: string; categorySlug: string; count: number }>();

  businesses.forEach((b) => {
    if (b.city && b.citySlug) {
      const existingCity = cityMap.get(b.citySlug) || { name: b.city, slug: b.citySlug, count: 0 };
      existingCity.count += 1;
      cityMap.set(b.citySlug, existingCity);
    }

    if (b.category && b.categorySlug) {
      const existingCat = categoryMap.get(b.categorySlug) || { name: b.category, slug: b.categorySlug, count: 0 };
      existingCat.count += 1;
      categoryMap.set(b.categorySlug, existingCat);
    }

    if (b.city && b.citySlug && b.category && b.categorySlug) {
      const comboKey = `${b.citySlug}__${b.categorySlug}`;
      const existingPair = pairMap.get(comboKey) || {
        city: b.city,
        citySlug: b.citySlug,
        category: b.category,
        categorySlug: b.categorySlug,
        count: 0,
      };
      existingPair.count += 1;
      pairMap.set(comboKey, existingPair);
    }
  });

  return {
    businesses,
    cities: Array.from(cityMap.values()).sort((a, b) => b.count - a.count),
    categories: Array.from(categoryMap.values()).sort((a, b) => b.count - a.count),
    cityCategoryPairs: Array.from(pairMap.values()).sort((a, b) => b.count - a.count),
  };
}

/**
 * Master SEO/GEO Page Generator
 * Generates dynamic keywords, metadata, breadcrumbs, internal links,
 * and structured data for any route or entity.
 */
export function generateCompletePageSeo(
  ctx: SeoPageContext,
  snapshot?: PublishedEntitiesSnapshot
): CompletePageSeoResult {
  const keywords = generatePageKeywords(ctx);
  const metadata = generatePageMetadata(ctx);
  const breadcrumbs = generatePageBreadcrumbs(ctx);
  const internalLinks = generateDynamicInternalLinks(ctx, snapshot);
  const structuredData = generatePageStructuredData(ctx);

  const count = ctx.availableBusinessesCount ?? (ctx.availableBusinesses ? ctx.availableBusinesses.length : 1);
  const isDirectoryFilterPage =
    ctx.pageType === 'category_city' ||
    ctx.pageType === 'city' ||
    ctx.pageType === 'city_hub' ||
    ctx.pageType === 'category' ||
    ctx.pageType === 'category_hub';

  const thinContent = !metadata.isIndexable || (isDirectoryFilterPage && count === 0);

  return {
    context: ctx,
    keywords,
    metadata,
    breadcrumbs,
    internalLinks,
    structuredData,
    thinContent,
  };
}
