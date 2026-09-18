/**
 * Dynamic SEO + GEO Keyword System Types
 * Single Source of Truth for Locora AI Dynamic SEO Engine
 */

export type KeywordType =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'SEMANTIC'
  | 'LOCAL'
  | 'LONG_TAIL'
  | 'CONVERSATIONAL'
  | 'AI_GEO'
  | 'ENTITY'
  | 'BRANDED';

export type SeoPageType =
  | 'category_city'
  | 'business_profile'
  | 'business_detail'
  | 'city'
  | 'city_hub'
  | 'category'
  | 'category_hub'
  | 'directory_index'
  | 'directory_hub'
  | 'site_page';

export interface KeywordItem {
  keyword: string;
  type: KeywordType;
  source: 'DYNAMIC';
  entity: Record<string, string>;
}

export interface EntityRelationship {
  name: string; // 'Business' | 'Category' | 'Service' | 'City' | 'Suburb' | 'Location' | 'Reviews' | 'Website' | 'Phone' | 'Opening Hours'
  value: string;
  entityType: string;
  schemaType?: string;
}

export interface PublishedBusinessEntity {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug?: string;
  city: string;
  citySlug?: string;
  suburb?: string;
  state?: string;
  country?: string;
  phone?: string;
  website?: string;
  address?: string;
  services?: string[];
  rating?: number;
  reviewCount?: number;
  openingHours?: string[];
  isPublished?: boolean;
}

export interface PublishedEntitiesSnapshot {
  businesses: PublishedBusinessEntity[];
  cities: Array<{ name: string; slug: string; count: number }>;
  categories: Array<{ name: string; slug: string; count: number }>;
  cityCategoryPairs: Array<{
    city: string;
    cityName?: string;
    citySlug: string;
    category: string;
    categoryName?: string;
    categorySlug: string;
    count: number;
  }>;
}

export interface SeoPageContext {
  pageType: SeoPageType;
  category?: string;
  categorySlug?: string;
  city?: string;
  citySlug?: string;
  suburb?: string;
  businessName?: string;
  businessSlug?: string;
  services?: string[];
  businessType?: string;
  country?: string;
  state?: string;
  pageTitle?: string;
  context?: string;
  path?: string;
  phone?: string;
  website?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string[];
  availableBusinessesCount?: number;
  availableBusinesses?: PublishedBusinessEntity[];
  availableCategories?: string[];
  availableCities?: string[];
  sitePageKey?: string;
  baseUrl?: string;
  forceNoIndex?: boolean;
}

export interface GeneratedKeywordsResult {
  primaryKeyword: string;
  secondaryKeywords: string[];
  semanticKeywords: string[];
  longTailKeywords: string[];
  conversationalQueries: string[];
  localSearchPhrases: string[];
  aiGeoPhrases: string[];
  entityRelationships: EntityRelationship[];
  allKeywords: KeywordItem[];
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  position: number;
}

export interface InternalLinkItem {
  title: string;
  href: string;
  type: 'city' | 'category' | 'city_category' | 'business' | 'service' | 'site_page';
  count?: number;
  description?: string;
}

export interface GeneratedPageMetadata {
  title: string;
  metaDescription: string;
  description: string;
  canonicalUrl: string;
  h1: string;
  h2: string[];
  h3: string[];
  isIndexable: boolean;
  robots: 'index, follow' | 'noindex, follow';
  openGraph: {
    title: string;
    description: string;
    url: string;
    type: string;
    siteName: string;
    image?: string;
  };
  twitter: {
    card: 'summary_large_image' | 'summary';
    title: string;
    description: string;
    image?: string;
  };
}

export interface CompletePageSeoResult {
  context: SeoPageContext;
  keywords: GeneratedKeywordsResult;
  metadata: GeneratedPageMetadata;
  breadcrumbs: BreadcrumbItem[];
  internalLinks: InternalLinkItem[];
  structuredData: Record<string, any>;
  thinContent: boolean;
}
