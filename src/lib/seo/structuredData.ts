import type {
  SeoPageContext,
  BreadcrumbItem,
} from './types';
import { generatePageBreadcrumbs } from './templates';

/**
 * Maps common business category strings to valid Schema.org types.
 */
function mapCategoryToSchemaType(category?: string): string {
  if (!category) return 'LocalBusiness';
  const c = category.toLowerCase();
  if (c.includes('dentist') || c.includes('dental')) return 'Dentist';
  if (c.includes('plumb')) return 'Plumber';
  if (c.includes('electric')) return 'Electrician';
  if (c.includes('law') || c.includes('attorney') || c.includes('legal')) return 'LegalService';
  if (c.includes('auto') || c.includes('mechanic') || c.includes('repair')) return 'AutoRepair';
  if (c.includes('restaurant') || c.includes('cafe') || c.includes('diner') || c.includes('food')) return 'Restaurant';
  if (c.includes('spa') || c.includes('salon') || c.includes('beauty')) return 'BeautySalon';
  if (c.includes('hvac') || c.includes('heating') || c.includes('air conditioning')) return 'HVACBusiness';
  if (c.includes('contractor') || c.includes('roof') || c.includes('build')) return 'GeneralContractor';
  if (c.includes('medical') || c.includes('clinic') || c.includes('doctor')) return 'MedicalClinic';
  if (c.includes('real estate') || c.includes('realtor')) return 'RealEstateAgent';
  if (c.includes('account') || c.includes('cpa') || c.includes('tax')) return 'AccountingService';
  return 'LocalBusiness';
}

/**
 * Generates valid Schema.org structured data JSON-LD object for any page context.
 */
export function generatePageStructuredData(ctx: SeoPageContext): Record<string, any> {
  const baseUrl = ctx.baseUrl || 'https://locoraai.com';
  const breadcrumbs = generatePageBreadcrumbs(ctx);

  // 1. BreadcrumbList Schema (Applicable to all indexable pages)
  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b) => ({
      '@type': 'ListItem',
      position: b.position,
      name: b.label,
      item: b.path.startsWith('http') ? b.path : `${baseUrl.replace(/\/+$/, '')}${b.path}`,
    })),
  };

  // 2. Business Profile: LocalBusiness Schema
  if (ctx.pageType === 'business_profile' && ctx.businessName) {
    const slug = ctx.businessSlug || ctx.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const pageUrl = `${baseUrl.replace(/\/+$/, '')}/biz/${slug}`;
    const schemaType = mapCategoryToSchemaType(ctx.category);

    const businessSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      '@id': `${pageUrl}#business`,
      name: ctx.businessName,
      url: ctx.website || pageUrl,
      telephone: ctx.phone || undefined,
    };

    if (ctx.address || ctx.city) {
      businessSchema.address = {
        '@type': 'PostalAddress',
        streetAddress: ctx.address || undefined,
        addressLocality: ctx.city || undefined,
        addressRegion: ctx.state || undefined,
        addressCountry: ctx.country || 'United States',
      };
    }

    if (ctx.rating && ctx.reviewCount && ctx.reviewCount > 0) {
      businessSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Number(ctx.rating).toFixed(1),
        reviewCount: ctx.reviewCount,
        bestRating: '5',
        worstRating: '1',
      };
    }

    if (ctx.services && ctx.services.length > 0) {
      businessSchema.makesOffer = ctx.services.map((srv) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: srv,
        },
      }));
    }

    if (ctx.openingHours && ctx.openingHours.length > 0) {
      businessSchema.openingHours = ctx.openingHours;
    }

    return {
      '@context': 'https://schema.org',
      '@graph': [breadcrumbListSchema, businessSchema],
    };
  }

  // 3. Category + City, City, Category, or Directory Index: ItemList Schema
  if (
    ctx.pageType === 'category_city' ||
    ctx.pageType === 'city' ||
    ctx.pageType === 'category' ||
    ctx.pageType === 'directory_index'
  ) {
    const realBusinesses = ctx.availableBusinesses || [];

    const itemListSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: ctx.pageTitle || 'Local Businesses',
      numberOfItems: realBusinesses.length,
      itemListElement: realBusinesses.map((b, idx) => {
        const itemUrl = `${baseUrl.replace(/\/+$/, '')}/biz/${b.slug}`;
        const itemSchema: Record<string, any> = {
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          url: itemUrl,
          item: {
            '@type': mapCategoryToSchemaType(b.category),
            name: b.name,
            url: itemUrl,
            address: {
              '@type': 'PostalAddress',
              addressLocality: b.city,
              addressRegion: b.state || undefined,
              addressCountry: b.country || 'United States',
            },
          },
        };

        if (b.rating && b.reviewCount && b.reviewCount > 0) {
          itemSchema.item.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: Number(b.rating).toFixed(1),
            reviewCount: b.reviewCount,
          };
        }

        return itemSchema;
      }),
    };

    return {
      '@context': 'https://schema.org',
      '@graph': [breadcrumbListSchema, itemListSchema],
    };
  }

  // 4. Default Site Pages: Organization & SoftwareApplication Schema
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: 'Locora AI',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      'https://twitter.com/locoraai',
      'https://www.linkedin.com/company/locora-ai',
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Locora AI Local SEO & GEO Platform',
    operatingSystem: 'All Web Browsers',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Locora AI',
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbListSchema, orgSchema, softwareSchema],
  };
}
