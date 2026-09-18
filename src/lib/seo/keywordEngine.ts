import type {
  SeoPageContext,
  GeneratedKeywordsResult,
  KeywordItem,
  KeywordType,
  EntityRelationship,
} from './types';

/**
 * Normalizes strings by trimming and collapsing multiple spaces.
 */
function cleanTerm(str?: string): string {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Derives both singular and plural forms for common business categories naturally.
 */
function getCategoryVariations(category: string): { singular: string; plural: string; adjective: string } {
  const clean = cleanTerm(category);
  if (!clean) return { singular: '', plural: '', adjective: '' };

  const lower = clean.toLowerCase();
  let singular = clean;
  let plural = clean;

  if (lower.endsWith('ies')) {
    singular = clean.slice(0, -3) + 'y';
    plural = clean;
  } else if (lower.endsWith('ses') || lower.endsWith('shes') || lower.endsWith('ches')) {
    singular = clean.slice(0, -2);
    plural = clean;
  } else if (lower.endsWith('s') && !lower.endsWith('ss')) {
    singular = clean.slice(0, -1);
    plural = clean;
  } else {
    singular = clean;
    plural = clean + 's';
  }

  // Derive adjective/service descriptor
  let adjective = singular;
  if (lower.includes('dentist')) {
    adjective = 'Dental';
  } else if (lower.includes('plumb')) {
    adjective = 'Plumbing';
  } else if (lower.includes('electric')) {
    adjective = 'Electrical';
  } else if (lower.includes('lawyer') || lower.includes('attorney')) {
    adjective = 'Legal';
  } else if (lower.includes('mechanic') || lower.includes('auto')) {
    adjective = 'Automotive';
  } else if (lower.includes('cleaner') || lower.includes('cleaning')) {
    adjective = 'Cleaning';
  } else if (lower.includes('hvac')) {
    adjective = 'HVAC';
  } else if (lower.includes('spa') || lower.includes('salon')) {
    adjective = 'Wellness';
  }

  return { singular, plural, adjective };
}

/**
 * Deduplicates and cleans an array of keyword phrases while preserving order.
 */
function dedupe(terms: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of terms) {
    const norm = cleanTerm(t);
    if (!norm) continue;
    const key = norm.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(norm);
    }
  }
  return out;
}

/**
 * Central Dynamic SEO/GEO Keyword Engine
 * Computes semantic, conversational, local, and entity search phrases
 * directly from real database entities without hardcoded lists.
 */
export function generatePageKeywords(ctx: SeoPageContext): GeneratedKeywordsResult {
  const pageType = ctx.pageType;
  const categoryRaw = cleanTerm(ctx.category);
  const city = cleanTerm(ctx.city);
  const suburb = cleanTerm(ctx.suburb);
  const businessName = cleanTerm(ctx.businessName);
  const services = (ctx.services || []).map(cleanTerm).filter(Boolean);
  const country = cleanTerm(ctx.country);
  const state = cleanTerm(ctx.state);
  const phone = cleanTerm(ctx.phone);
  const website = cleanTerm(ctx.website);
  const address = cleanTerm(ctx.address);
  const rating = ctx.rating;
  const reviewCount = ctx.reviewCount;
  const openingHours = ctx.openingHours || [];

  const { singular: catSingular, plural: catPlural, adjective: catAdj } = getCategoryVariations(categoryRaw);

  const primaryList: string[] = [];
  const secondaryList: string[] = [];
  const semanticList: string[] = [];
  const localList: string[] = [];
  const longTailList: string[] = [];
  const conversationalList: string[] = [];
  const aiGeoList: string[] = [];
  const entityRelationships: EntityRelationship[] = [];

  // =========================================================================
  // 1. BUSINESS PROFILE PAGES (/biz/{slug} or /business/{slug})
  // =========================================================================
  if ((pageType === 'business_profile' || pageType === 'business_detail') && businessName) {
    // Primary
    if (city) {
      primaryList.push(`${businessName} ${city}`);
    } else {
      primaryList.push(businessName);
    }

    // Secondary
    if (categoryRaw) {
      if (city) {
        secondaryList.push(`${businessName} ${catSingular} ${city}`);
        secondaryList.push(`${businessName} ${catPlural} ${city}`);
      }
      secondaryList.push(`${businessName} ${catSingular}`);
    }
    if (city) {
      secondaryList.push(`${businessName} location`);
      secondaryList.push(`${businessName} in ${city}`);
    }

    // Branded & Direct Semantic
    secondaryList.push(`${businessName} contact`);
    secondaryList.push(`${businessName} reviews`);
    secondaryList.push(`${businessName} opening hours`);

    // Services from real DB
    services.forEach((srv) => {
      secondaryList.push(`${businessName} ${srv}`);
      if (city) {
        semanticList.push(`${srv} by ${businessName} in ${city}`);
        localList.push(`${srv} ${city}`);
      }
    });

    // Local Search Phrases
    if (city) {
      localList.push(`${businessName} ${city}`);
      if (suburb) {
        localList.push(`${businessName} in ${suburb}`);
        localList.push(`${catSingular} in ${suburb} ${city}`);
      }
      if (categoryRaw) {
        localList.push(`${catPlural} near ${businessName}`);
      }
    }

    // Long-tail
    if (city && categoryRaw) {
      longTailList.push(`find ${businessName} ${catSingular} in ${city}`);
      if (rating && rating >= 4) {
        longTailList.push(`highly rated ${catSingular} ${businessName} ${city}`);
      }
      if (services.length > 0) {
        longTailList.push(`${businessName} ${services[0]} appointments ${city}`);
      }
    }

    // Conversational queries
    conversationalList.push(`what are the opening hours for ${businessName}`);
    conversationalList.push(`how do I contact ${businessName}${city ? ` in ${city}` : ''}`);
    if (categoryRaw && city) {
      conversationalList.push(`is ${businessName} a good ${catSingular} in ${city}`);
    }
    if (services.length > 0) {
      conversationalList.push(`does ${businessName} offer ${services[0]}`);
    }

    // AI / GEO phrases
    if (city && categoryRaw) {
      aiGeoList.push(`${businessName} verified local ${catSingular} profile in ${city}`);
      aiGeoList.push(`recommended ${catSingular} business ${businessName} serving ${city}`);
    }
    if (address) {
      aiGeoList.push(`${businessName} located at ${address}`);
    }

    // Entity Relationships
    entityRelationships.push({ name: 'Business', value: businessName, entityType: 'LocalBusiness' });
    if (categoryRaw) entityRelationships.push({ name: 'Category', value: categoryRaw, entityType: 'ServiceCategory' });
    if (city) entityRelationships.push({ name: 'City', value: city, entityType: 'AdministrativeArea' });
    if (suburb) entityRelationships.push({ name: 'Suburb', value: suburb, entityType: 'AdministrativeArea' });
    if (address) entityRelationships.push({ name: 'Location', value: address, entityType: 'PostalAddress' });
    if (phone) entityRelationships.push({ name: 'Phone', value: phone, entityType: 'ContactPoint' });
    if (website) entityRelationships.push({ name: 'Website', value: website, entityType: 'URL' });
    if (rating) entityRelationships.push({ name: 'Reviews', value: `${rating} stars (${reviewCount || 0} reviews)`, entityType: 'AggregateRating' });
    if (openingHours.length > 0) entityRelationships.push({ name: 'Opening Hours', value: openingHours.join(', '), entityType: 'OpeningHoursSpecification' });
    services.forEach((s) => entityRelationships.push({ name: 'Service', value: s, entityType: 'Service' }));
  }

  // =========================================================================
  // 2. CATEGORY + CITY DIRECTORY PAGES (/[city]/[category])
  // =========================================================================
  else if (pageType === 'category_city' && categoryRaw && city) {
    // Primary
    primaryList.push(`${catPlural} in ${city}`);

    // Secondary
    secondaryList.push(`${catSingular} ${city}`);
    secondaryList.push(`${catPlural} ${city}`);
    secondaryList.push(`${catAdj} clinics ${city}`);
    secondaryList.push(`${catAdj} services ${city}`);
    secondaryList.push(`local ${catPlural} ${city}`);
    secondaryList.push(`${catPlural} near ${city}`);
    secondaryList.push(`${catAdj} providers in ${city}`);

    // Semantic
    semanticList.push(`professional ${catSingular} care ${city}`);
    semanticList.push(`licensed ${catPlural} in ${city}`);
    semanticList.push(`local ${catAdj.toLowerCase()} specialists ${city}`);
    semanticList.push(`${catSingular} appointments in ${city}`);

    // Services from real available businesses
    services.forEach((srv) => {
      semanticList.push(`${srv} in ${city}`);
      localList.push(`${srv} services ${city}`);
      longTailList.push(`find local ${srv} in ${city}`);
    });

    // Local Search Phrases
    localList.push(`top rated ${catPlural} in ${city}`);
    localList.push(`best ${catPlural} in ${city}`);
    localList.push(`${catPlural} near me`);
    localList.push(`${catSingular} directory ${city}`);
    if (suburb) {
      localList.push(`${catPlural} in ${suburb}`);
      localList.push(`${catSingular} near ${suburb}`);
    }

    // Long-tail
    longTailList.push(`best reviewed ${catPlural} in ${city}`);
    longTailList.push(`affordable ${catSingular} in ${city}`);
    longTailList.push(`emergency ${catSingular} in ${city}`);
    longTailList.push(`verified ${catPlural} quotes ${city}`);

    // Conversational
    conversationalList.push(`who are the best ${catPlural} in ${city}`);
    conversationalList.push(`how to find a trusted ${catSingular} in ${city}`);
    conversationalList.push(`which ${catPlural} are open now in ${city}`);
    conversationalList.push(`what is the average cost of a ${catSingular} in ${city}`);

    // AI / GEO phrases
    aiGeoList.push(`best ${categoryRaw} in ${city}`);
    aiGeoList.push(`trusted ${categoryRaw} in ${city}`);
    aiGeoList.push(`highly rated ${categoryRaw} in ${city}`);
    aiGeoList.push(`recommended ${categoryRaw} in ${city}`);
    aiGeoList.push(`local ${catAdj.toLowerCase()} providers serving ${city}`);
    aiGeoList.push(`${categoryRaw} open now near ${city}`);

    // Entities
    entityRelationships.push({ name: 'Category', value: categoryRaw, entityType: 'ServiceCategory' });
    entityRelationships.push({ name: 'City', value: city, entityType: 'AdministrativeArea' });
    if (state) entityRelationships.push({ name: 'State', value: state, entityType: 'AdministrativeArea' });
    if (country) entityRelationships.push({ name: 'Country', value: country, entityType: 'Country' });
    services.slice(0, 8).forEach((s) => entityRelationships.push({ name: 'Service', value: s, entityType: 'Service' }));
  }

  // =========================================================================
  // 3. CITY PAGES (/[city] or /city/[city])
  // =========================================================================
  else if ((pageType === 'city' || pageType === 'city_hub') && city) {
    primaryList.push(`local business directory ${city}`);

    secondaryList.push(`businesses in ${city}`);
    secondaryList.push(`local services in ${city}`);
    secondaryList.push(`businesses near ${city}`);
    secondaryList.push(`top rated companies in ${city}`);
    secondaryList.push(`verified local businesses ${city}`);

    // Real categories available in this city
    const availableCats = ctx.availableCategories || [];
    availableCats.forEach((cat) => {
      semanticList.push(`${cat} in ${city}`);
      localList.push(`local ${cat} in ${city}`);
      longTailList.push(`find verified ${cat} in ${city}`);
    });

    localList.push(`service providers near ${city}`);
    localList.push(`${city} business directory`);
    if (suburb) {
      localList.push(`local businesses in ${suburb}`);
    }

    conversationalList.push(`where to find reliable local services in ${city}`);
    conversationalList.push(`what are the top rated local businesses in ${city}`);

    aiGeoList.push(`verified local service directory for ${city}`);
    aiGeoList.push(`recommended local business ecosystem in ${city}`);

    entityRelationships.push({ name: 'City', value: city, entityType: 'AdministrativeArea' });
    if (state) entityRelationships.push({ name: 'State', value: state, entityType: 'AdministrativeArea' });
    if (country) entityRelationships.push({ name: 'Country', value: country, entityType: 'Country' });
    availableCats.forEach((c) => entityRelationships.push({ name: 'Category', value: c, entityType: 'ServiceCategory' }));
  }

  // =========================================================================
  // 4. CATEGORY PAGES (/category/[category])
  // =========================================================================
  else if ((pageType === 'category' || pageType === 'category_hub') && categoryRaw) {
    primaryList.push(`${catPlural} directory`);

    secondaryList.push(`${catPlural} businesses`);
    secondaryList.push(`local ${catPlural} businesses`);
    secondaryList.push(`${catAdj} directory`);
    secondaryList.push(`${catAdj} services`);
    secondaryList.push(`find ${catPlural} businesses`);

    // Real cities available for this category
    const availableCities = ctx.availableCities || [];
    availableCities.forEach((ct) => {
      semanticList.push(`${catPlural} in ${ct}`);
      localList.push(`best ${catPlural} in ${ct}`);
    });

    localList.push(`${catPlural} near me`);
    localList.push(`trusted ${catPlural} network`);

    longTailList.push(`how to choose the best ${catSingular}`);
    longTailList.push(`verified customer ratings for ${catPlural}`);

    conversationalList.push(`how do I find reputable ${catPlural}`);
    conversationalList.push(`what services do professional ${catPlural} provide`);

    aiGeoList.push(`top rated ${categoryRaw} providers`);
    aiGeoList.push(`verified ${categoryRaw} business listings`);

    entityRelationships.push({ name: 'Category', value: categoryRaw, entityType: 'ServiceCategory' });
    availableCities.forEach((c) => entityRelationships.push({ name: 'City', value: c, entityType: 'AdministrativeArea' }));
  }

  // =========================================================================
  // 5. DIRECTORY INDEX (/directory)
  // =========================================================================
  else if (pageType === 'directory_index' || pageType === 'directory_hub') {
    primaryList.push('local business directory');
    secondaryList.push('verified business listings');
    secondaryList.push('find local services');
    secondaryList.push('local service directory');
    secondaryList.push('business directory near me');

    semanticList.push('trusted local companies');
    semanticList.push('customer reviewed local businesses');
    semanticList.push('google business profile verified listings');

    localList.push('local providers near me');
    localList.push('search local businesses');

    conversationalList.push('where can I find verified local businesses');
    conversationalList.push('how to find reliable local contractors near me');

    aiGeoList.push('authoritative local business and service directory');
    aiGeoList.push('verified multi-location local service index');

    entityRelationships.push({ name: 'Directory', value: 'Locora Local Business Directory', entityType: 'WebSite' });
  }

  // =========================================================================
  // 6. SITE-WIDE CORE PAGES (Homepage, Local SEO, AI SEO, GEO, etc.)
  // =========================================================================
  else {
    const key = ctx.sitePageKey || 'home';

    switch (key) {
      case 'local_seo':
      case 'visibility':
        primaryList.push('local seo software');
        secondaryList.push('local 3-pack ranking software', 'google business profile optimization', 'local search visibility');
        semanticList.push('local map pack rankings', 'local citations tracker', 'geo-targeted keyword tracking');
        localList.push('local seo platform for multi-location businesses', 'local seo audit tool');
        conversationalList.push('how to rank in the google local 3-pack', 'what is the best local seo software');
        aiGeoList.push('local search engine optimization platform', 'geo-relevance signals for local ranking');
        break;

      case 'ai_seo':
      case 'geo':
      case 'ai_visibility':
        primaryList.push('generative engine optimization');
        secondaryList.push('geo software', 'ai search optimization', 'chatgpt brand visibility', 'perplexity brand tracking');
        semanticList.push('llm mention tracking', 'ai search citation tracker', 'generative engine visibility score');
        longTailList.push('how to optimize local business for chatgpt search', 'measure brand presence in gemini and perplexity');
        conversationalList.push('how do I get my business recommended by chatgpt', 'what is generative engine optimization');
        aiGeoList.push('autonomous ai search visibility engine', 'cross-llm local citation analyzer');
        break;

      case 'seo_audit':
      case 'checkup':
        primaryList.push('instant local seo audit');
        secondaryList.push('free local business checkup', 'google business profile audit', 'technical seo checker');
        semanticList.push('schema markup validator', 'local ranking audit', 'nap consistency check');
        longTailList.push('free instant website and local seo audit report', 'check my google business profile ranking');
        conversationalList.push('how can I check my website seo for free', 'why is my business not showing on google maps');
        aiGeoList.push('real-time 40-point algorithmic local seo audit');
        break;

      case 'reputation':
        primaryList.push('local reputation management software');
        secondaryList.push('review response automation', 'google reviews monitoring', 'customer feedback management');
        semanticList.push('sentiment analysis for local reviews', 'automated review replies', 'review generation campaigns');
        longTailList.push('how to get more 5-star google reviews for local business', 'automated negative review alerts');
        conversationalList.push('how do I manage customer reviews automatically', 'how to respond to negative google reviews');
        aiGeoList.push('reputation intelligence and automated response platform');
        break;

      case 'ai_manager':
      case 'growth':
        primaryList.push('ai business manager for local businesses');
        secondaryList.push('autonomous business growth engine', 'marketing action priorities', 'local business workflow automation');
        semanticList.push('prioritized daily growth actions', 'ai local business co-pilot', 'revenue growth tracking');
        longTailList.push('autonomous local business growth and marketing platform', 'automated local seo execution');
        conversationalList.push('how can ai help grow my local service business', 'what should my marketing priority be today');
        aiGeoList.push('agentic local growth intelligence operating system');
        break;

      case 'agencies':
        primaryList.push('white label local seo software for agencies');
        secondaryList.push('agency client reporting platform', 'multi-client local seo tool', 'b2b lead generation for agencies');
        semanticList.push('automated client audit generator', 'multi-tenant local seo dashboard', 'agency client retention');
        longTailList.push('scale local seo client retainers with ai automation', 'white-label client growth reports');
        conversationalList.push('what is the best local seo platform for marketing agencies');
        aiGeoList.push('enterprise multi-client agency local growth platform');
        break;

      case 'pricing':
        primaryList.push('locora ai pricing');
        secondaryList.push('local seo tool pricing', 'agency local seo plans', 'cost of local seo software');
        semanticList.push('subscription tiers for local businesses', 'affordable local seo software');
        longTailList.push('compare local seo and geo software plans', 'transparent local visibility pricing');
        conversationalList.push('how much does locora ai cost', 'is there a free trial for locora ai');
        aiGeoList.push('locora ai software pricing and subscription tiers');
        break;

      default:
        // Homepage
        primaryList.push('ai local seo platform');
        secondaryList.push('generative engine optimization software', 'google business profile manager', 'local visibility operating system');
        semanticList.push('local 3-pack optimization', 'ai search visibility tracking', 'local business growth automation');
        localList.push('local business growth platform', 'multi-location local seo software');
        longTailList.push('all-in-one local seo geo and ai business manager', 'dominate google maps and chatgpt search');
        conversationalList.push('what is the best software to grow my local business', 'how to increase local customer calls with ai');
        aiGeoList.push('locora ai - the autonomous local growth platform');
        break;
    }

    entityRelationships.push({ name: 'Platform', value: 'Locora AI', entityType: 'SoftwareApplication' });
  }

  // Ensure primary keyword exists
  const primaryKeyword = primaryList[0] || (pageType === 'category_city' ? `${catPlural} in ${city}` : 'local business directory');

  // De-duplicate lists
  const cleanPrimary = dedupe(primaryList);
  const cleanSecondary = dedupe(secondaryList);
  const cleanSemantic = dedupe(semanticList);
  const cleanLocal = dedupe(localList);
  const cleanLongTail = dedupe(longTailList);
  const cleanConversational = dedupe(conversationalList);
  const cleanAiGeo = dedupe(aiGeoList);

  // Build the structured allKeywords array with precise KeywordType, DYNAMIC source, and entity linkage
  const allKeywords: KeywordItem[] = [];
  const entityMeta: Record<string, string> = {};
  if (categoryRaw) entityMeta.category = categoryRaw;
  if (city) entityMeta.city = city;
  if (suburb) entityMeta.suburb = suburb;
  if (businessName) entityMeta.business = businessName;

  const pushItems = (items: string[], type: KeywordType) => {
    items.forEach((kw) => {
      allKeywords.push({
        keyword: kw,
        type,
        source: 'DYNAMIC',
        entity: { ...entityMeta },
      });
    });
  };

  pushItems(cleanPrimary, 'PRIMARY');
  pushItems(cleanSecondary, 'SECONDARY');
  pushItems(cleanSemantic, 'SEMANTIC');
  pushItems(cleanLocal, 'LOCAL');
  pushItems(cleanLongTail, 'LONG_TAIL');
  pushItems(cleanConversational, 'CONVERSATIONAL');
  pushItems(cleanAiGeo, 'AI_GEO');

  return {
    primaryKeyword,
    secondaryKeywords: cleanSecondary,
    semanticKeywords: cleanSemantic,
    longTailKeywords: cleanLongTail,
    conversationalQueries: cleanConversational,
    localSearchPhrases: cleanLocal,
    aiGeoPhrases: cleanAiGeo,
    entityRelationships,
    allKeywords,
  };
}
