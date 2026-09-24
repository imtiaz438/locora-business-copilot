import { db, schema } from './index.ts';
import { eq, and, ne, or, ilike, desc } from 'drizzle-orm';
import { geocodeAddress } from '../utils/geocoder.ts';

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

    // Fetch existing directory profile to ensure already-present directory data is not marked missing
    const existingProfile = await getDirectoryProfileByBusinessId(businessId);

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
    const name = (business.name || existingProfile?.name || '').trim();
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
    const category = (business.category || business.industry || existingProfile?.category || '').trim();
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
    const city = (primaryLoc?.city || business.cityName || existingProfile?.city || '').trim();
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
    const country = (primaryLoc?.country || existingProfile?.country || 'United States').trim();
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
    const phone = (primaryLoc?.phone || business.phone || existingProfile?.phone || '').trim();
    const website = (business.website || existingProfile?.website || '').trim();
    const address = (primaryLoc?.address || existingProfile?.address || '').trim();
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

  // 6. Update canonical business record
  const now = new Date();
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

  // 7. Synchronize normalized directory projection
  const directoryProfile = await syncBusinessToDirectoryProjection(business.id, 'owner_published');

  return {
    success: true,
    eligible: true,
    status: directoryProfile?.status || 'PUBLISHED',
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

  // 1. Update canonical business flag
  const updatedBiz = await db
    .update(schema.businessesTable)
    .set({
      isPublishedInDirectory: false,
      updatedAt: now,
    })
    .where(eq(schema.businessesTable.id, businessId))
    .returning();

  // 2. Synchronize directory projection
  const updatedProfile = await syncBusinessToDirectoryProjection(businessId, 'owner_unpublished');

  return {
    success: true,
    status: 'UNPUBLISHED',
    isPublishedInDirectory: false,
    directoryProfile: updatedProfile,
    business: updatedBiz[0] || null,
  };
}

export interface FieldConflict {
  businessId: string;
  field: string;
  existingValue: any;
  newValue: any;
  source: string;
  resolution: string;
}

export interface DirectorySyncAudit {
  action: 'updated' | 'created' | 'unchanged';
  fieldsAdded: string[];
  fieldsChanged: string[];
  conflicts: FieldConflict[];
}

function isValidString(val: any): boolean {
  return typeof val === 'string' && val.trim().length > 0;
}

function isValidNumber(val: any): boolean {
  return typeof val === 'number' && !isNaN(val);
}

function mergeStringArrays(...arrays: (string[] | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const arr of arrays) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (isValidString(item)) {
          const clean = item.trim();
          const lower = clean.toLowerCase();
          if (!seen.has(lower)) {
            seen.add(lower);
            result.push(clean);
          }
        }
      }
    }
  }
  return result;
}

function mergeSocialLinks(
  existingLinks?: Record<string, string> | null,
  newLinks?: Record<string, string> | null
): Record<string, string> {
  const merged: Record<string, string> = {};
  if (existingLinks && typeof existingLinks === 'object') {
    for (const [k, v] of Object.entries(existingLinks)) {
      if (isValidString(v)) merged[k] = v.trim();
    }
  }
  if (newLinks && typeof newLinks === 'object') {
    for (const [k, v] of Object.entries(newLinks)) {
      if (isValidString(v)) merged[k] = v.trim();
    }
  }
  return merged;
}

/**
 * Synchronize Business canonical data and real source signals (Google GBP, User Inputs, Settings)
 * into the normalized directory_profiles projection table.
 *
 * Deterministic Source Priority:
 * 1. Verified Google data
 * 2. User-provided Business data
 * 3. Existing valid Directory data
 *
 * Safe Field-Level Merge Rules:
 * - Never replace valid existing values with NULL, empty strings, or unavailable data.
 * - Manually entered Directory-only fields are preserved and never discarded.
 * - Idempotent upsert and non-destructive data updates.
 */
export async function syncBusinessToDirectoryProjection(
  businessId: string,
  triggerSource?: string,
  options?: { returnAudit?: false }
): Promise<typeof schema.directoryProfilesTable.$inferSelect | null>;
export async function syncBusinessToDirectoryProjection(
  businessId: string,
  triggerSource: string | undefined,
  options: { returnAudit: true }
): Promise<{ profile: typeof schema.directoryProfilesTable.$inferSelect | null; audit: DirectorySyncAudit } | null>;
export async function syncBusinessToDirectoryProjection(
  businessId: string,
  triggerSource?: string,
  options?: { returnAudit?: boolean }
): Promise<any> {
  try {
    // 1. Fetch canonical business record
    const [biz] = await db
      .select()
      .from(schema.businessesTable)
      .where(eq(schema.businessesTable.id, businessId))
      .limit(1);

    if (!biz) {
      console.warn(`[Directory Projection] Business not found for id: ${businessId}`);
      return null;
    }

    // 1.5. Fetch existing directory profile to preserve existing listings and values
    const existing = await getDirectoryProfileByBusinessId(businessId);

    // 2. Fetch primary location
    const locations = await db
      .select()
      .from(schema.locationsTable)
      .where(eq(schema.locationsTable.businessId, businessId));
    const primaryLoc = locations.find((l) => l.isPrimary) || locations[0] || null;

    // 3. Fetch Google Business Location if any
    const [gbpLoc] = await db
      .select()
      .from(schema.googleBusinessLocationsTable)
      .where(eq(schema.googleBusinessLocationsTable.businessId, businessId))
      .limit(1);

    // 4. Fetch Google Reviews from real reviews table
    const reviews = await db
      .select()
      .from(schema.googleReviewsTable)
      .where(eq(schema.googleReviewsTable.businessId, businessId))
      .orderBy(desc(schema.googleReviewsTable.publishedAt));

    // 5. Fetch GBP connection if any
    const [gbpConn] = await db
      .select()
      .from(schema.googleConnectionsTable)
      .where(eq(schema.googleConnectionsTable.businessId, businessId))
      .limit(1);

    const isGbpVerified = Boolean(gbpLoc?.isVerified || (gbpConn && gbpConn.status === 'connected'));

    // 6. Compute real rating and review counts (never overwrite valid aggregate rating with 0/null)
    let googleRating: number | null = null;
    let googleReviewCount: number = 0;
    let reviewSource: string | null = null;

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      googleRating = Number((sum / reviews.length).toFixed(1));
      googleReviewCount = reviews.length;
      reviewSource = reviews[0]?.source || 'google_gbp';
    } else if (gbpLoc && typeof gbpLoc.rating === 'number' && gbpLoc.rating > 0) {
      googleRating = Number(gbpLoc.rating.toFixed(1));
      googleReviewCount = gbpLoc.reviewCount || 0;
      reviewSource = 'google_gbp';
    } else if (existing?.googleRating != null && Number(existing.googleRating) > 0) {
      // Preserve existing aggregate rating when individual reviews are not yet loaded
      googleRating = Number(existing.googleRating);
      googleReviewCount = existing.googleReviewCount || 0;
      reviewSource = existing.reviewSource || 'google_gbp';
    }

    // Tracking audit for safe field-level merge
    const conflicts: FieldConflict[] = [];
    const fieldsAdded: string[] = [];
    const fieldsChanged: string[] = [];

    // Helper to detect HTTP redirect artifacts, bot-challenge, or invalid HTML titles
    const isBadTitle = (t: string | null | undefined): boolean => {
      if (!t) return true;
      const lower = t.trim().toLowerCase();
      return (
        lower.includes('301 moved') ||
        lower.includes('302 found') ||
        lower.includes('object moved') ||
        lower.includes('moved permanently') ||
        lower.includes('redirecting') ||
        lower.includes('just a moment') ||
        lower.includes('attention required') ||
        lower === '404 not found' ||
        lower === '500 internal server error'
      );
    };

    // Generic safe field-level resolver
    const resolveField = <T>(
      fieldName: string,
      googleVal: T | null | undefined,
      userVal: T | null | undefined,
      existingVal: T | null | undefined,
      fallbackVal: T,
      validator: (val: any) => boolean = isValidString
    ): { value: T; source: string } => {
      const googleValid = isGbpVerified && validator(googleVal);
      const userValid = validator(userVal);
      const existingValid = validator(existingVal);

      let resolved: T;
      let source: string;

      if (googleValid) {
        resolved = googleVal as T;
        source = 'google_gbp';
        if (existingValid && String(existingVal).trim().toLowerCase() !== String(googleVal).trim().toLowerCase()) {
          conflicts.push({
            businessId,
            field: fieldName,
            existingValue: existingVal,
            newValue: googleVal,
            source: 'google_gbp',
            resolution: 'Used verified Google Business Profile data over existing directory value',
          });
        }
      } else if (userValid) {
        resolved = userVal as T;
        source = 'user_provided';
        if (existingValid && String(existingVal).trim().toLowerCase() !== String(userVal).trim().toLowerCase()) {
          conflicts.push({
            businessId,
            field: fieldName,
            existingValue: existingVal,
            newValue: userVal,
            source: 'user_provided',
            resolution: 'Used user-provided profile data over existing directory value',
          });
        }
      } else if (existingValid) {
        resolved = existingVal as T;
        source = 'existing_directory';
      } else {
        resolved = fallbackVal;
        source = 'default';
      }

      if (!existingValid && validator(resolved)) {
        fieldsAdded.push(fieldName);
      } else if (existingValid && validator(resolved) && String(existingVal).trim() !== String(resolved).trim()) {
        fieldsChanged.push(fieldName);
      }

      return { value: resolved, source };
    };

    // A. Business Name
    const googleName = isGbpVerified && gbpLoc?.locationName?.trim() && !isBadTitle(gbpLoc.locationName) ? gbpLoc.locationName.trim() : null;
    let userName = biz.name?.trim() && !isBadTitle(biz.name) ? biz.name.trim() : null;
    let fallbackLocationName: string | null = null;
    if (primaryLoc?.name && !isBadTitle(primaryLoc.name) && primaryLoc.name !== 'My Local Business') {
      fallbackLocationName = primaryLoc.name.replace(/\(Main\)$/i, '').trim();
    }
    const existingName = existing?.name?.trim() && !isBadTitle(existing.name) ? existing.name.trim() : null;
    const resolvedNameRes = resolveField(
      'name',
      googleName,
      userName || fallbackLocationName,
      existingName,
      'Local Business'
    );
    const resolvedName = resolvedNameRes.value;

    // Heal canonical business record in businessesTable if it had an invalid redirect title
    if (isBadTitle(biz.name) && resolvedName !== 'Local Business') {
      try {
        await db.update(schema.businessesTable).set({ name: resolvedName, updatedAt: new Date() }).where(eq(schema.businessesTable.id, businessId));
      } catch {}
    }

    // B. Category
    const invalidCategories = ['unassigned', 'none', 'general', 'select category', 'local business'];
    const userCategoryRaw = biz.category?.trim() || biz.industry?.trim() || null;
    const userCategory = userCategoryRaw && !invalidCategories.includes(userCategoryRaw.toLowerCase()) ? userCategoryRaw : null;
    const existingCategory = existing?.category?.trim() || null;
    const resolvedCategoryRes = resolveField(
      'category',
      null, // Google attributes can augment services, category from user or existing
      userCategory,
      existingCategory,
      'Local Services'
    );
    const resolvedCategory = resolvedCategoryRes.value;

    // C. Description (Never overwrite valid existing with null!)
    const userDescription = biz.description?.trim() || biz.tagline?.trim() || null;
    const existingDescription = existing?.description?.trim() || null;
    const resolvedDescriptionRes = resolveField(
      'description',
      null,
      userDescription,
      existingDescription,
      null as any,
      isValidString
    );
    const resolvedDescription = resolvedDescriptionRes.value || null;

    // D. Website (Never overwrite valid existing with null!)
    const userWebsite = biz.website?.trim() || null;
    const existingWebsite = existing?.website?.trim() || null;
    const resolvedWebsiteRes = resolveField(
      'website',
      null,
      userWebsite,
      existingWebsite,
      null as any,
      isValidString
    );
    const resolvedWebsite = resolvedWebsiteRes.value || null;

    // E. Phone (Never overwrite valid existing with null!)
    const userPhone = primaryLoc?.phone?.trim() || biz.phone?.trim() || null;
    const existingPhone = existing?.phone?.trim() || null;
    const resolvedPhoneRes = resolveField(
      'phone',
      null,
      userPhone,
      existingPhone,
      null as any,
      isValidString
    );
    const resolvedPhone = resolvedPhoneRes.value || null;

    // F. Address (Never overwrite valid existing with null!)
    const googleAddress = isGbpVerified && gbpLoc?.address?.trim() ? gbpLoc.address.trim() : null;
    const userAddress = primaryLoc?.address?.trim() || null;
    const existingAddress = existing?.address?.trim() || null;
    const resolvedAddressRes = resolveField(
      'address',
      googleAddress,
      userAddress,
      existingAddress,
      null as any,
      isValidString
    );
    const resolvedAddress = resolvedAddressRes.value || null;

    // G. City, Region, Country
    const userCity = primaryLoc?.city?.trim() || biz.cityName?.trim() || null;
    const existingCity = existing?.city?.trim() || null;
    let resolvedCity = userCity || existingCity || null;

    const userRegion = primaryLoc?.state?.trim() || biz.stateCode?.trim() || null;
    const existingRegion = existing?.region?.trim() || null;
    let resolvedRegion = userRegion || existingRegion || null;

    const userCountry = primaryLoc?.country?.trim() || 'United States';
    const existingCountry = existing?.country?.trim() || null;
    const resolvedCountry = userCountry || existingCountry || 'United States';

    // Parse city/region from address if still missing
    if ((!resolvedCity || !resolvedRegion) && resolvedAddress) {
      const parts = resolvedAddress.split(',').map((s) => s.trim());
      if (parts.length >= 2) {
        if (!resolvedCity) resolvedCity = parts[parts.length - 2] || null;
        if (!resolvedRegion && parts[parts.length - 1]) {
          resolvedRegion = parts[parts.length - 1].split(' ')[0] || null;
        }
      }
    }

    // H. Latitude & Longitude (Never overwrite valid existing coordinates with null/0)
    let resolvedLat: number | null = null;
    let resolvedLng: number | null = null;

    if (primaryLoc?.lat != null && primaryLoc?.lng != null && isValidNumber(Number(primaryLoc.lat)) && isValidNumber(Number(primaryLoc.lng))) {
      resolvedLat = Number(primaryLoc.lat);
      resolvedLng = Number(primaryLoc.lng);
    } else if (existing?.latitude != null && existing?.longitude != null && isValidNumber(Number(existing.latitude)) && isValidNumber(Number(existing.longitude))) {
      resolvedLat = Number(existing.latitude);
      resolvedLng = Number(existing.longitude);
    }

    // Auto-resolve coordinates if missing and any location details exist
    if (resolvedLat == null || resolvedLng == null) {
      try {
        const geocodeInput = {
          address: resolvedAddress || primaryLoc?.address || '',
          city: resolvedCity || primaryLoc?.city || biz.cityName || '',
          state: resolvedRegion || primaryLoc?.state || biz.stateCode || '',
          zip: primaryLoc?.zip || '',
          country: resolvedCountry || primaryLoc?.country || 'United States',
        };

        const geocoded = await geocodeAddress(geocodeInput);
        if (geocoded && isValidNumber(geocoded.lat) && isValidNumber(geocoded.lng)) {
          resolvedLat = geocoded.lat;
          resolvedLng = geocoded.lng;

          // Also persist geocoded coordinates back into locationsTable if primaryLoc exists
          if (primaryLoc && (primaryLoc.lat == null || primaryLoc.lng == null)) {
            await db
              .update(schema.locationsTable)
              .set({
                lat: Number(geocoded.lat),
                lng: Number(geocoded.lng),
                updatedAt: new Date(),
              })
              .where(eq(schema.locationsTable.id, primaryLoc.id))
              .catch(() => {});
          }
        }
      } catch (geoErr) {
        console.warn(`[Directory Geocoding] Non-blocking notice for business ${businessId}:`, geoErr);
      }
    }

    if (existing?.latitude == null && resolvedLat != null) {
      fieldsAdded.push('latitude');
      fieldsAdded.push('longitude');
    }

    // I. Hours (Never overwrite valid existing hours with empty/null)
    const googleHours = (gbpLoc?.hours && (Array.isArray(gbpLoc.hours) ? gbpLoc.hours.length > 0 : Object.keys(gbpLoc.hours).length > 0)) ? gbpLoc.hours : null;
    const userHours = (primaryLoc?.hours && (Array.isArray(primaryLoc.hours) ? primaryLoc.hours.length > 0 : Object.keys(primaryLoc.hours).length > 0)) ? primaryLoc.hours : null;
    const existingHours = existing?.hours && (Array.isArray(existing.hours) ? existing.hours.length > 0 : Object.keys(existing.hours).length > 0) ? existing.hours : null;
    const resolvedHours = googleHours || userHours || existingHours || null;

    if (!existingHours && resolvedHours) {
      fieldsAdded.push('hours');
    }

    // J. Services (Union merge, never discard existing services)
    const resolvedServices = mergeStringArrays(
      biz.services,
      existing?.services
    );
    if ((!existing?.services || existing.services.length === 0) && resolvedServices.length > 0) {
      fieldsAdded.push('services');
    }

    // K. Logo & Social Links (Deep merge, never discard existing)
    const userLogo = biz.logoUrl?.trim() || (Array.isArray(biz.mediaPhotos) && biz.mediaPhotos[0]) || null;
    const existingLogo = existing?.logo?.trim() || null;
    const resolvedLogo = userLogo || existingLogo || null;
    if (!existingLogo && resolvedLogo) fieldsAdded.push('logo');

    const resolvedSocialLinks = mergeSocialLinks(
      existing?.socialLinks,
      biz.socialLinks
    );

    // L. Google Location ID
    const resolvedGoogleLocationId = gbpLoc?.locationId || existing?.googleLocationId || null;

    // 8. Unique SEO Slug (PRESERVE existing slug! Never change published slug)
    let resolvedSlug = existing?.slug?.trim() || biz.slug?.trim() || null;
    if (!resolvedSlug) {
      resolvedSlug = await generateUniqueDirectorySlug(biz.id, resolvedName, resolvedCity || undefined);
    }

    // 9. SEO Metadata
    const cityDisplay = resolvedCity || 'Local';
    const stateDisplay = resolvedRegion || '';
    const locationDisplay = stateDisplay ? `${cityDisplay}, ${stateDisplay}` : cityDisplay;
    const seoTitle = `${resolvedName} — Verified ${resolvedCategory} in ${locationDisplay} | Locora Directory`;
    const seoDescription = `View verified business profile, ratings, contact details, operating hours, and customer reviews for ${resolvedName} in ${locationDisplay} on Locora Directory.`;
    const seoKeywords = mergeStringArrays(
      [resolvedCategory, `${resolvedCategory} in ${cityDisplay}`, cityDisplay, stateDisplay].filter(Boolean),
      resolvedServices,
      existing?.seoKeywords
    );
    const canonicalUrl = `https://directory.locoraai.com/biz/${resolvedSlug}`;

    // 10. Check eligibility
    const eligibility = await getDirectoryEligibility(businessId);

    // 11. Preserve current directory status unless explicit user action or suspended
    let status: string = 'UNPUBLISHED';
    if (existing?.status === 'SUSPENDED' || biz.status === 'suspended') {
      status = 'SUSPENDED';
    } else if (triggerSource === 'owner_published') {
      status = isGbpVerified ? 'VERIFIED' : (existing?.isClaimed ? 'CLAIMED' : 'PUBLISHED');
    } else if (triggerSource === 'owner_unpublished') {
      status = 'UNPUBLISHED';
    } else if (existing?.status) {
      // PRESERVE EXISTING STATUS: Never reset an existing directory status during standard sync!
      if (biz.isPublishedInDirectory && (existing.status === 'UNPUBLISHED' || existing.status === 'ELIGIBLE')) {
        status = isGbpVerified ? 'VERIFIED' : 'PUBLISHED';
      } else {
        status = existing.status;
      }
    } else {
      // New listing without prior profile
      if (biz.isPublishedInDirectory) {
        status = isGbpVerified ? 'VERIFIED' : 'PUBLISHED';
      } else if (eligibility.eligible) {
        status = 'ELIGIBLE';
      } else {
        status = 'UNPUBLISHED';
      }
    }

    // Preserve claimed status
    let isClaimed = true;
    if (existing && typeof existing.isClaimed === 'boolean') {
      isClaimed = existing.isClaimed;
    } else if (biz.ownerEmail?.startsWith('unclaimed_')) {
      isClaimed = false;
    }

    const isVerified = Boolean(isGbpVerified || existing?.isVerified || eligibility.qualityStatus === 'verified');
    const source = triggerSource || (isGbpVerified ? 'google_gbp' : (existing?.source || 'user_provided'));
    const now = new Date();
    const profileId = existing?.id || `dir_prof_${businessId}`;

    // Preserve publishedAt timestamp
    let publishedAt = existing?.publishedAt || null;
    if (!publishedAt && (status === 'PUBLISHED' || status === 'VERIFIED')) {
      publishedAt = now;
    }

    // Preserve directory-only custom fields inside metadata
    const existingMetadata = (existing?.metadata as Record<string, any>) || {};
    const directoryCustomData = existingMetadata.directory_custom_data || {};
    const customDataMerged = {
      ...directoryCustomData,
      ...(existingMetadata.customData || {}),
    };

    const metadata: Record<string, any> = {
      ...existingMetadata,
      directory_custom_data: customDataMerged,
      lastTriggerSource: triggerSource || 'sync',
      lastSyncTimestamp: now.toISOString(),
      ...(conflicts.length > 0
        ? { conflictLog: [...(existingMetadata.conflictLog || []), ...conflicts] }
        : {}),
    };

    // 12. Upsert into directory_profiles table (normalized projection)
    const [upserted] = await db
      .insert(schema.directoryProfilesTable)
      .values({
        id: profileId,
        businessId,
        status,
        slug: resolvedSlug,
        name: resolvedName,
        category: resolvedCategory,
        description: resolvedDescription,
        website: resolvedWebsite,
        phone: resolvedPhone,
        address: resolvedAddress,
        city: resolvedCity,
        region: resolvedRegion,
        country: resolvedCountry,
        latitude: resolvedLat,
        longitude: resolvedLng,
        hours: resolvedHours as any,
        services: resolvedServices,
        logo: resolvedLogo,
        socialLinks: resolvedSocialLinks,
        googleLocationId: resolvedGoogleLocationId,
        googleRating,
        googleReviewCount,
        reviewSource,
        publishedAt,
        lastSyncedAt: now,
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl,
        qualityScore: eligibility.qualityScore,
        qualityStatus: isGbpVerified ? 'verified' : eligibility.qualityStatus,
        missingFields: eligibility.missingFields,
        eligibilityReasons: eligibility.reasons,
        isClaimed,
        isVerified,
        source,
        metadata,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.directoryProfilesTable.businessId,
        set: {
          status,
          slug: resolvedSlug,
          name: resolvedName,
          category: resolvedCategory,
          description: resolvedDescription,
          website: resolvedWebsite,
          phone: resolvedPhone,
          address: resolvedAddress,
          city: resolvedCity,
          region: resolvedRegion,
          country: resolvedCountry,
          latitude: resolvedLat,
          longitude: resolvedLng,
          hours: resolvedHours as any,
          services: resolvedServices,
          logo: resolvedLogo,
          socialLinks: resolvedSocialLinks,
          googleLocationId: resolvedGoogleLocationId,
          googleRating,
          googleReviewCount,
          reviewSource,
          publishedAt,
          lastSyncedAt: now,
          seoTitle,
          seoDescription,
          seoKeywords,
          canonicalUrl,
          qualityScore: eligibility.qualityScore,
          qualityStatus: isGbpVerified ? 'verified' : eligibility.qualityStatus,
          missingFields: eligibility.missingFields,
          eligibilityReasons: eligibility.reasons,
          isClaimed,
          isVerified,
          source,
          metadata,
          updatedAt: now,
        },
      })
      .returning();

    // 13. Safe Bi-Directional Backfill: If directory had valid data that canonical business lacks,
    // backfill so user settings/profile reflects it without re-entry
    const bizUpdates: Record<string, any> = {};
    if (!biz.website && resolvedWebsite) bizUpdates.website = resolvedWebsite;
    if (!biz.phone && resolvedPhone) bizUpdates.phone = resolvedPhone;
    if (!biz.description && resolvedDescription) bizUpdates.description = resolvedDescription;
    if (!biz.cityName && resolvedCity) bizUpdates.cityName = resolvedCity;
    if (!biz.stateCode && resolvedRegion) bizUpdates.stateCode = resolvedRegion;
    if ((!biz.services || biz.services.length === 0) && resolvedServices.length > 0) bizUpdates.services = resolvedServices;
    if ((!biz.socialLinks || Object.keys(biz.socialLinks).length === 0) && Object.keys(resolvedSocialLinks).length > 0) bizUpdates.socialLinks = resolvedSocialLinks;
    if (!biz.logoUrl && resolvedLogo) bizUpdates.logoUrl = resolvedLogo;
    if (biz.slug !== resolvedSlug) bizUpdates.slug = resolvedSlug;
    if ((status === 'PUBLISHED' || status === 'VERIFIED') && !biz.isPublishedInDirectory) {
      bizUpdates.isPublishedInDirectory = true;
    }

    if (Object.keys(bizUpdates).length > 0) {
      bizUpdates.updatedAt = now;
      await db
        .update(schema.businessesTable)
        .set(bizUpdates)
        .where(eq(schema.businessesTable.id, businessId))
        .catch((err) => console.warn('[Directory Sync] Non-critical business tag update notice:', err));
    }

    // Also safely backfill primary location if address/city/phone/hours/coords were missing
    if (primaryLoc) {
      const locUpdates: Record<string, any> = {};
      if (!primaryLoc.address && resolvedAddress) locUpdates.address = resolvedAddress;
      if (!primaryLoc.city && resolvedCity) locUpdates.city = resolvedCity;
      if (!primaryLoc.state && resolvedRegion) locUpdates.state = resolvedRegion;
      if (!primaryLoc.phone && resolvedPhone) locUpdates.phone = resolvedPhone;
      if ((!primaryLoc.hours || (Array.isArray(primaryLoc.hours) && primaryLoc.hours.length === 0)) && resolvedHours) locUpdates.hours = resolvedHours as any;
      if (primaryLoc.lat == null && resolvedLat != null) locUpdates.lat = resolvedLat;
      if (primaryLoc.lng == null && resolvedLng != null) locUpdates.lng = resolvedLng;

      if (Object.keys(locUpdates).length > 0) {
        locUpdates.updatedAt = now;
        await db
          .update(schema.locationsTable)
          .set(locUpdates)
          .where(eq(schema.locationsTable.id, primaryLoc.id))
          .catch((err) => console.warn('[Directory Sync] Non-critical location backfill notice:', err));
      }
    }

    const audit: DirectorySyncAudit = {
      action: existing ? (fieldsAdded.length > 0 || fieldsChanged.length > 0 ? 'updated' : 'unchanged') : 'created',
      fieldsAdded,
      fieldsChanged,
      conflicts,
    };

    if (options?.returnAudit) {
      return { profile: upserted, audit };
    }

    return upserted;
  } catch (err: any) {
    console.error(`[Directory Projection] Error syncing projection for ${businessId}:`, err);
    return null;
  }
}

/**
 * Backward compatibility alias for syncing directory profile
 */
export async function syncDirectoryProfileData(businessId: string, triggerSource?: string) {
  return syncBusinessToDirectoryProjection(businessId, triggerSource || 'profile_update');
}

/**
 * Batch reconcile all businesses into directory projections (for startup or maintenance)
 */
export async function syncAllBusinessesToDirectoryProjections(): Promise<number> {
  try {
    const businesses = await db
      .select({ id: schema.businessesTable.id })
      .from(schema.businessesTable);

    let count = 0;
    for (const b of businesses) {
      const res = await syncBusinessToDirectoryProjection(b.id, 'startup_reconcile');
      if (res) count++;
    }
    console.log(`[Directory Projection] Reconciled directory projections for ${count}/${businesses.length} businesses.`);
    return count;
  } catch (err) {
    console.error('[Directory Projection] Error in batch sync:', err);
    return 0;
  }
}
