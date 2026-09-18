import { db, schema } from './index.ts';
import { eq, and, ne, or, ilike, desc } from 'drizzle-orm';

export interface DirectoryEligibilityResult {
  eligible: boolean;
  reasons: string[];
  missingFields: string[];
  qualityStatus: 'basic' | 'good' | 'complete' | 'verified';
  qualityScore: number;
}

export interface DirectorySettingsData {
  id: string;
  directoryEnabled: boolean;
  selfPublishingEnabled: boolean;
  minRequiredData: {
    name: boolean;
    category: boolean;
    city: boolean;
    country: boolean;
    contactInfo: boolean;
  };
  allowedCountries: string[];
  duplicateDetectionEnabled: boolean;
  allowDiscoveredUnclaimed: boolean;
  requireAdminApproval: boolean;
  updatedAt: Date;
}

/**
 * Clean string to URL-safe slug
 */
export function generateSlug(text: string): string {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Retrieve global directory settings or initialize defaults
 */
export async function getDirectorySettings(): Promise<DirectorySettingsData> {
  try {
    const rows = await db
      .select()
      .from(schema.directorySettingsTable)
      .where(eq(schema.directorySettingsTable.id, 'global'))
      .limit(1);

    if (rows.length > 0) {
      return rows[0] as DirectorySettingsData;
    }

    // Initialize default global settings
    const defaultSettings: DirectorySettingsData = {
      id: 'global',
      directoryEnabled: true,
      selfPublishingEnabled: true,
      minRequiredData: {
        name: true,
        category: true,
        city: true,
        country: true,
        contactInfo: true,
      },
      allowedCountries: ['United States', 'US', 'USA', 'Canada', 'CA', 'UK', 'United Kingdom', 'Australia', 'AU'],
      duplicateDetectionEnabled: true,
      allowDiscoveredUnclaimed: false,
      requireAdminApproval: false,
      updatedAt: new Date(),
    };

    const inserted = await db
      .insert(schema.directorySettingsTable)
      .values(defaultSettings)
      .returning();

    return (inserted[0] || defaultSettings) as DirectorySettingsData;
  } catch (err) {
    console.error('[Directory Settings] Error fetching directory settings:', err);
    return {
      id: 'global',
      directoryEnabled: true,
      selfPublishingEnabled: true,
      minRequiredData: {
        name: true,
        category: true,
        city: true,
        country: true,
        contactInfo: true,
      },
      allowedCountries: ['United States', 'US', 'USA', 'Canada', 'CA', 'UK', 'United Kingdom', 'Australia', 'AU'],
      duplicateDetectionEnabled: true,
      allowDiscoveredUnclaimed: false,
      requireAdminApproval: false,
      updatedAt: new Date(),
    };
  }
}

/**
 * Update global directory admin settings
 */
export async function updateDirectorySettings(
  updates: Partial<Omit<DirectorySettingsData, 'id' | 'updatedAt'>>
): Promise<DirectorySettingsData> {
  try {
    const existing = await getDirectorySettings();
    const updated = await db
      .update(schema.directorySettingsTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(schema.directorySettingsTable.id, 'global'))
      .returning();

    return (updated[0] || existing) as DirectorySettingsData;
  } catch (err) {
    console.error('[Directory Settings] Error updating directory settings:', err);
    throw err;
  }
}

/**
 * Check if a duplicate directory profile exists for a different business
 */
export async function detectDuplicateDirectoryProfile(
  businessId: string,
  name: string,
  city?: string,
  phone?: string
): Promise<boolean> {
  try {
    if (!name || name.trim().length < 2) return false;
    const cleanName = name.trim().toLowerCase();

    // Query active businesses that have published directory profiles
    const candidates = await db
      .select({
        id: schema.businessesTable.id,
        name: schema.businessesTable.name,
        cityName: schema.businessesTable.cityName,
        phone: schema.businessesTable.phone,
        status: schema.businessesTable.status,
      })
      .from(schema.businessesTable)
      .where(
        and(
          ne(schema.businessesTable.id, businessId),
          eq(schema.businessesTable.isPublishedInDirectory, true),
          ne(schema.businessesTable.status, 'deleted')
        )
      );

    for (const c of candidates) {
      if ((c.name || '').trim().toLowerCase() === cleanName) {
        // Name matches: check if city or phone also matches
        const candidateCity = (c.cityName || '').trim().toLowerCase();
        const targetCity = (city || '').trim().toLowerCase();
        if (targetCity && candidateCity && targetCity === candidateCity) {
          return true;
        }

        const candidatePhone = (c.phone || '').replace(/\D+/g, '');
        const targetPhone = (phone || '').replace(/\D+/g, '');
        if (targetPhone.length >= 7 && candidatePhone.length >= 7 && candidatePhone === targetPhone) {
          return true;
        }
      }
    }

    return false;
  } catch (err) {
    console.error('[Directory Service] Error checking duplicates:', err);
    return false;
  }
}

/**
 * Evaluates real data eligibility for the Locora Business Directory.
 * Pure deterministic backend function - NO AI used.
 */
export async function getDirectoryEligibility(businessId: string): Promise<DirectoryEligibilityResult> {
  const reasons: string[] = [];
  const missingFields: string[] = [];
  let qualityScore = 0;

  try {
    if (!businessId || businessId.trim().length === 0) {
      return {
        eligible: false,
        reasons: ['Valid business identifier is required.'],
        missingFields: ['business_id'],
        qualityStatus: 'basic',
        qualityScore: 0,
      };
    }

    // 1. Fetch canonical business from single source of truth
    const bizRows = await db
      .select()
      .from(schema.businessesTable)
      .where(eq(schema.businessesTable.id, businessId))
      .limit(1);

    if (bizRows.length === 0) {
      return {
        eligible: false,
        reasons: ['Business record not found in system.'],
        missingFields: ['business'],
        qualityStatus: 'basic',
        qualityScore: 0,
      };
    }

    const business = bizRows[0];

    // Check if deleted or suspended
    if (business.status === 'deleted' || business.status === 'suspended') {
      return {
        eligible: false,
        reasons: [`Business status is '${business.status}' and cannot be published to the directory.`],
        missingFields: [],
        qualityStatus: 'basic',
        qualityScore: 0,
      };
    }

    // 2. Fetch global admin directory settings
    const settings = await getDirectorySettings();
    if (!settings.directoryEnabled) {
      reasons.push('The Locora Business Directory is currently disabled by system administrator.');
    }
    if (!settings.selfPublishingEnabled) {
      reasons.push('Owner self-publishing is currently paused by system administrator.');
    }

    // 3. Fetch primary location data
    const locations = await db
      .select()
      .from(schema.locationsTable)
      .where(eq(schema.locationsTable.businessId, businessId));

    const primaryLoc = locations.find((l) => l.isPrimary) || locations[0];

    // 4. Fetch Google Business connection signals
    const gbpLocations = await db
      .select({ id: schema.googleBusinessLocationsTable.id })
      .from(schema.googleBusinessLocationsTable)
      .where(eq(schema.googleBusinessLocationsTable.businessId, businessId))
      .limit(1)
      .catch(() => []);

    const reviews = await db
      .select({ id: schema.googleReviewsTable.id })
      .from(schema.googleReviewsTable)
      .where(eq(schema.googleReviewsTable.businessId, businessId))
      .limit(1)
      .catch(() => []);

    const hasGbpConnection = gbpLocations.length > 0 || reviews.length > 0;

    // ================= REAL DATA REQUIRED VALIDATIONS =================

    // 1. Business Name
    const name = (business.name || '').trim();
    if (settings.minRequiredData.name) {
      if (!name || name.length < 2) {
        missingFields.push('Business Name');
        reasons.push('Valid business name is required (minimum 2 characters).');
      } else {
        qualityScore += 20;
      }
    } else if (name) {
      qualityScore += 20;
    }

    // 2. Category / Industry
    const category = (business.category || business.industry || '').trim();
    const invalidCategories = ['unassigned', 'none', 'general', 'select category'];
    if (settings.minRequiredData.category) {
      if (!category || invalidCategories.includes(category.toLowerCase())) {
        missingFields.push('Category');
        reasons.push('Valid business category or service type is required.');
      } else {
        qualityScore += 20;
      }
    } else if (category) {
      qualityScore += 20;
    }

    // 3. Primary Location (City)
    // Must be a real user-specified city from primary location or business profile, not blank or unconfigured
    const city = (primaryLoc?.city || '').trim();
    if (settings.minRequiredData.city) {
      if (!city) {
        missingFields.push('City / Operating Location');
        reasons.push('Operating city is required in your business profile before publishing.');
      } else {
        qualityScore += 20;
      }
    } else if (city) {
      qualityScore += 20;
    }

    // 4. Country / Region
    const country = (primaryLoc?.country || 'United States').trim();
    if (settings.minRequiredData.country) {
      if (!country) {
        missingFields.push('Country / Region');
        reasons.push('Valid operating country or region is required.');
      } else if (settings.allowedCountries && settings.allowedCountries.length > 0) {
        const normalizedCountry = country.toLowerCase();
        const isAllowed = settings.allowedCountries.some(
          (c) => c.toLowerCase() === normalizedCountry || normalizedCountry.includes(c.toLowerCase())
        );
        if (!isAllowed) {
          reasons.push(`Business location '${country}' is outside allowed directory countries/regions.`);
        }
      }
    }

    // 5. Sufficient Public Contact Information (Phone, Website, or Physical Address)
    // A public directory listing requires at least one public contact channel so prospective customers
    // can reach or visit the business. A private user account email alone does NOT qualify.
    const phone = (primaryLoc?.phone || business.phone || '').trim();
    const website = (business.website || '').trim();
    const address = (primaryLoc?.address || '').trim();
    const hasPublicContact = Boolean(phone || website || address);

    if (settings.minRequiredData.contactInfo) {
      if (!hasPublicContact) {
        missingFields.push('Phone or Website');
        reasons.push('At least one public contact channel (phone number, website, or physical address) is required so customers can reach your business.');
      } else {
        if (phone) qualityScore += 10;
        if (website) qualityScore += 10;
      }
    } else {
      if (phone) qualityScore += 10;
      if (website) qualityScore += 10;
    }

    // 6. Duplicate Detection Check
    if (settings.duplicateDetectionEnabled && name && city) {
      const isDuplicate = await detectDuplicateDirectoryProfile(businessId, name, city, phone);
      if (isDuplicate) {
        reasons.push(`A verified directory listing already exists for '${name}' in '${city}'.`);
      }
    }

    // ================= OPTIONAL QUALITY SIGNALS =================
    const hasWebsite = Boolean(website);
    const hasPhone = Boolean(phone);
    const hasDescription = Boolean(business.description && business.description.trim().length >= 20);
    const hasServices = Boolean(Array.isArray(business.services) && business.services.length > 0);

    if (hasDescription) qualityScore += 10;
    if (hasServices) qualityScore += 10;
    if (hasGbpConnection) qualityScore += 10;

    let qualityStatus: 'basic' | 'good' | 'complete' | 'verified' = 'basic';
    if (hasGbpConnection) {
      qualityStatus = 'verified';
    } else if (hasWebsite && hasPhone && hasDescription && hasServices) {
      qualityStatus = 'complete';
    } else if ((hasWebsite || hasPhone) && (hasDescription || hasServices)) {
      qualityStatus = 'good';
    } else {
      qualityStatus = 'basic';
    }

    const isEligible = missingFields.length === 0 && reasons.length === 0;

    return {
      eligible: isEligible,
      reasons,
      missingFields,
      qualityStatus,
      qualityScore: Math.min(100, Math.max(0, qualityScore)),
    };
  } catch (err: any) {
    console.error('[Directory Service] Error computing eligibility:', err);
    return {
      eligible: false,
      reasons: ['Error evaluating business directory eligibility: ' + err.message],
      missingFields: ['system_error'],
      qualityStatus: 'basic',
      qualityScore: 0,
    };
  }
}

/**
 * Fetch or initialize directory profile record for a business
 */
export async function getDirectoryProfileByBusinessId(businessId: string) {
  try {
    const rows = await db
      .select()
      .from(schema.directoryProfilesTable)
      .where(eq(schema.directoryProfilesTable.businessId, businessId))
      .limit(1);

    return rows[0] || null;
  } catch (err) {
    console.error('[Directory Service] Error getting directory profile:', err);
    return null;
  }
}

/**
 * Generate a guaranteed unique slug for the directory profile
 */
export async function generateUniqueDirectorySlug(
  businessId: string,
  businessName: string,
  cityName?: string
): Promise<string> {
  const baseNameSlug = generateSlug(businessName) || 'business';
  const citySlug = generateSlug(cityName || '');
  const candidateSlug = citySlug ? `${baseNameSlug}-${citySlug}` : baseNameSlug;

  // Check if candidate is in use by another business
  const existing = await db
    .select({
      id: schema.businessesTable.id,
      slug: schema.businessesTable.slug,
    })
    .from(schema.businessesTable)
    .where(
      and(
        ne(schema.businessesTable.id, businessId),
        eq(schema.businessesTable.slug, candidateSlug)
      )
    );

  if (existing.length === 0) {
    return candidateSlug;
  }

  // Suffix with short unique key
  const uniqueSuffix = Math.random().toString(36).substring(2, 6);
  return `${candidateSlug}-${uniqueSuffix}`;
}

/**
 * Publish Business to Locora Business Directory.
 * Adheres strictly to the canonical business single source of truth.
 */
export async function publishBusinessToDirectory(
  businessId: string,
  options?: { force?: boolean }
) {
  // 1. Evaluate eligibility on real data strictly
  const eligibility = await getDirectoryEligibility(businessId);
  if (!eligibility.eligible) {
    return {
      success: false,
      eligible: false,
      reasons: eligibility.reasons,
      missingFields: eligibility.missingFields,
      message: 'Business is not eligible to be published to the directory. Please complete the missing profile requirements in Settings.',
    };
  }

  // 2. Fetch canonical business
  const bizRows = await db
    .select()
    .from(schema.businessesTable)
    .where(eq(schema.businessesTable.id, businessId))
    .limit(1);

  if (bizRows.length === 0) {
    throw new Error('Business record not found.');
  }

  const business = bizRows[0];

  // 3. Resolve location for SEO metadata
  const locations = await db
    .select()
    .from(schema.locationsTable)
    .where(eq(schema.locationsTable.businessId, businessId));

  const primaryLoc = locations.find((l) => l.isPrimary) || locations[0];
  const city = primaryLoc?.city || business.cityName || 'Austin';
  const state = primaryLoc?.state || business.stateCode || 'TX';
  const category = business.category || business.industry || 'Local Services';

  // 4. Generate or preserve unique SEO slug
  let slug = business.slug;
  if (!slug || slug.trim().length === 0) {
    slug = await generateUniqueDirectorySlug(business.id, business.name, city);
  }

  // 5. Generate SEO Metadata
  const seoTitle = `${business.name} — Verified ${category} in ${city}, ${state} | Locora Directory`;
  const seoDescription = `View verified business profile, ratings, contact details, operating hours, and customer reviews for ${business.name} in ${city}, ${state} on Locora Directory.`;
  const seoKeywords = [
    category,
    `${category} in ${city}`,
    city,
    state,
    ...(business.services || []),
  ];
  const canonicalUrl = `https://directory.locoraai.com/biz/${slug}`;

  // 6. Upsert directory_profiles table (1:1 with businesses)
  const profileId = `dir_prof_${business.id}`;
  const now = new Date();

  const existingProfile = await db
    .select()
    .from(schema.directoryProfilesTable)
    .where(eq(schema.directoryProfilesTable.businessId, business.id))
    .limit(1);

  let directoryProfile: any;
  if (existingProfile.length > 0) {
    const updated = await db
      .update(schema.directoryProfilesTable)
      .set({
        status: 'PUBLISHED',
        slug,
        publishedAt: existingProfile[0].publishedAt || now,
        lastSyncedAt: now,
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl,
        qualityScore: eligibility.qualityScore,
        qualityStatus: eligibility.qualityStatus,
        missingFields: [],
        eligibilityReasons: [],
        isClaimed: true,
        isVerified: eligibility.qualityStatus === 'verified',
        updatedAt: now,
      })
      .where(eq(schema.directoryProfilesTable.businessId, business.id))
      .returning();
    directoryProfile = updated[0];
  } else {
    const inserted = await db
      .insert(schema.directoryProfilesTable)
      .values({
        id: profileId,
        businessId: business.id,
        status: 'PUBLISHED',
        slug,
        publishedAt: now,
        lastSyncedAt: now,
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl,
        qualityScore: eligibility.qualityScore,
        qualityStatus: eligibility.qualityStatus,
        missingFields: [],
        eligibilityReasons: [],
        isClaimed: true,
        isVerified: eligibility.qualityStatus === 'verified',
        source: 'owner_published',
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    directoryProfile = inserted[0];
  }

  // 7. Update canonical business record
  const updatedBiz = await db
    .update(schema.businessesTable)
    .set({
      isPublishedInDirectory: true,
      slug,
      cityName: city,
      stateCode: state,
      citySlug: generateSlug(city),
      categorySlug: generateSlug(category),
      updatedAt: now,
    })
    .where(eq(schema.businessesTable.id, business.id))
    .returning();

  return {
    success: true,
    eligible: true,
    status: 'PUBLISHED',
    isPublishedInDirectory: true,
    slug,
    canonicalUrl,
    directoryProfile,
    business: updatedBiz[0],
  };
}

/**
 * Unpublish Business from Locora Directory without deleting underlying business
 */
export async function unpublishBusinessFromDirectory(businessId: string) {
  const now = new Date();

  // 1. Update directory_profiles status
  await db
    .update(schema.directoryProfilesTable)
    .set({
      status: 'UNPUBLISHED',
      updatedAt: now,
    })
    .where(eq(schema.directoryProfilesTable.businessId, businessId));

  // 2. Update canonical business flag
  const updatedBiz = await db
    .update(schema.businessesTable)
    .set({
      isPublishedInDirectory: false,
      updatedAt: now,
    })
    .where(eq(schema.businessesTable.id, businessId))
    .returning();

  return {
    success: true,
    status: 'UNPUBLISHED',
    isPublishedInDirectory: false,
    business: updatedBiz[0] || null,
  };
}

/**
 * Synchronize directory profile data whenever business information changes
 */
export async function syncDirectoryProfileData(businessId: string) {
  try {
    const profile = await getDirectoryProfileByBusinessId(businessId);
    if (!profile) return null;

    const bizRows = await db
      .select()
      .from(schema.businessesTable)
      .where(eq(schema.businessesTable.id, businessId))
      .limit(1);

    if (bizRows.length === 0) return null;
    const business = bizRows[0];

    const eligibility = await getDirectoryEligibility(businessId);
    const locations = await db
      .select()
      .from(schema.locationsTable)
      .where(eq(schema.locationsTable.businessId, businessId));

    const primaryLoc = locations.find((l) => l.isPrimary) || locations[0];
    const city = primaryLoc?.city || business.cityName || 'Austin';
    const state = primaryLoc?.state || business.stateCode || 'TX';
    const category = business.category || business.industry || 'Local Services';
    const slug = business.slug || profile.slug;

    const seoTitle = `${business.name} — Verified ${category} in ${city}, ${state} | Locora Directory`;
    const seoDescription = `View verified business profile, ratings, contact details, operating hours, and customer reviews for ${business.name} in ${city}, ${state} on Locora Directory.`;
    const seoKeywords = [
      category,
      `${category} in ${city}`,
      city,
      state,
      ...(business.services || []),
    ];

    const updated = await db
      .update(schema.directoryProfilesTable)
      .set({
        seoTitle,
        seoDescription,
        seoKeywords,
        qualityScore: eligibility.qualityScore,
        qualityStatus: eligibility.qualityStatus,
        missingFields: eligibility.missingFields,
        eligibilityReasons: eligibility.reasons,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.directoryProfilesTable.businessId, businessId))
      .returning();

    return updated[0];
  } catch (err) {
    console.error('[Directory Sync] Error syncing directory profile:', err);
    return null;
  }
}
