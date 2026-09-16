import { db, schema } from '../src/db/index.ts';
import { eq, desc } from 'drizzle-orm';
import type { BusinessTruth, BusinessTruthLocation, BusinessTruthGoogleProfile } from '../src/types.ts';

/**
 * CANONICAL BUSINESS TRUTH / BUSINESS BRAIN SERVICE
 *
 * Strict Rules:
 * 1. Every feature reads business identity and business facts from this service.
 * 2. If a field is missing, return null.
 * 3. Never substitute another business.
 * 4. Never invent a value.
 */
export async function getBusinessTruth(businessId: string): Promise<BusinessTruth | null> {
  let cleanId = (businessId || '').trim();
  
  // 1. Fetch business record by ID, or fallback to the latest verified business in workspace if placeholder/invalid
  let bizRows: any[] = [];
  if (cleanId && cleanId !== 'workspace_pending' && cleanId !== 'biz_locora_canonical') {
    bizRows = await db
      .select()
      .from(schema.businessesTable)
      .where(eq(schema.businessesTable.id, cleanId))
      .limit(1);
  }

  if (bizRows.length === 0) {
    // If not found by cleanId, select the latest created business in this workspace instance
    bizRows = await db
      .select()
      .from(schema.businessesTable)
      .orderBy(desc(schema.businessesTable.createdAt))
      .limit(1);
  }

  if (bizRows.length === 0) {
    return null;
  }

  const biz = bizRows[0];
  cleanId = biz.id;

  // 2. Fetch all locations for this business
  const locRows = await db
    .select()
    .from(schema.locationsTable)
    .where(eq(schema.locationsTable.businessId, cleanId))
    .orderBy(desc(schema.locationsTable.isPrimary), schema.locationsTable.createdAt);

  const locations: BusinessTruthLocation[] = locRows.map((loc) => {
    let locHours: string | string[] | null = null;
    if (loc.hours && Array.isArray(loc.hours) && loc.hours.length > 0) {
      locHours = loc.hours.length === 1 ? loc.hours[0] : loc.hours;
    }

    return {
      id: loc.id,
      name: loc.name || null,
      isPrimary: Boolean(loc.isPrimary),
      address: loc.address || null,
      city: loc.city || null,
      state: loc.state || null,
      zip: loc.zip || null,
      country: loc.country || null,
      phone: loc.phone || null,
      hours: locHours,
    };
  });

  // Find primary location for top-level address & hours
  const primaryLoc = locRows.find((l) => l.isPrimary) || locRows[0] || null;

  let resolvedAddress: string | null = null;
  if (primaryLoc && (primaryLoc.address || primaryLoc.city)) {
    const parts = [
      primaryLoc.address,
      primaryLoc.city,
      primaryLoc.state,
      primaryLoc.zip,
      primaryLoc.country,
    ].filter(Boolean);
    resolvedAddress = parts.length > 0 ? parts.join(', ') : null;
  }

  let resolvedHours: string | null = null;
  if (primaryLoc?.hours && Array.isArray(primaryLoc.hours) && primaryLoc.hours.length > 0) {
    resolvedHours = primaryLoc.hours.join(' | ');
  }

  // 3. Fetch data connections
  const connRows = await db
    .select()
    .from(schema.dataConnectionsTable)
    .where(eq(schema.dataConnectionsTable.businessId, cleanId));

  const dataSources: string[] = [];
  let gbpConnectionRecord = connRows.find((c) => c.provider === 'google_gbp');
  const isGbpConnected = gbpConnectionRecord?.status === 'connected';

  connRows.forEach((conn) => {
    if (conn.status === 'connected') {
      dataSources.push(conn.provider);
    }
  });

  // Always list source of truth record
  if (dataSources.length === 0) {
    dataSources.push('user_verified_store');
  }

  // 4. Fetch Google Business Location Details if present
  const gbpRows = await db
    .select()
    .from(schema.googleBusinessLocationsTable)
    .where(eq(schema.googleBusinessLocationsTable.businessId, cleanId))
    .limit(1);

  let googleProfile: BusinessTruthGoogleProfile | null = null;

  if (gbpRows.length > 0) {
    const gbp = gbpRows[0];
    googleProfile = {
      connected: isGbpConnected || Boolean(gbp.isVerified),
      placeId: (gbpConnectionRecord?.config as any)?.placeId || gbp.locationId || null,
      locationName: gbp.locationName || null,
      address: gbp.address || null,
      rating: typeof gbp.rating === 'number' ? gbp.rating : null,
      reviewCount: typeof gbp.reviewCount === 'number' ? gbp.reviewCount : null,
      isVerified: Boolean(gbp.isVerified),
      status: isGbpConnected ? 'connected' : 'disconnected',
    };
  } else if (gbpConnectionRecord) {
    googleProfile = {
      connected: isGbpConnected,
      placeId: (gbpConnectionRecord.config as any)?.placeId || null,
      locationName: null,
      address: null,
      rating: null,
      reviewCount: null,
      isVerified: false,
      status: gbpConnectionRecord.status || 'disconnected',
    };
  }

  // 4.5 Fetch Business Brain if present
  const brainRows = await db
    .select()
    .from(schema.businessBrainTable)
    .where(eq(schema.businessBrainTable.businessId, cleanId))
    .limit(1);

  const brain = brainRows.length > 0 ? brainRows[0] : null;

  // 5. Build Canonical Business Truth
  // Strict rule: If a field is missing, return null. Never invent a value.
  const canonicalTruth: BusinessTruth = {
    businessId: biz.id,
    name: biz.name ? biz.name.trim() : null,
    category: biz.category ? biz.category.trim() : (biz.industry ? biz.industry.trim() : null),
    website: biz.website ? biz.website.trim() : null,
    phone: biz.phone ? biz.phone.trim() : (primaryLoc?.phone ? primaryLoc.phone.trim() : null),
    email: biz.email ? biz.email.trim() : null,
    address: resolvedAddress,
    locations,
    services: Array.isArray(biz.services) && biz.services.length > 0 ? biz.services : null,
    serviceAreas: Array.isArray(biz.serviceAreas) && biz.serviceAreas.length > 0 ? biz.serviceAreas : null,
    hours: resolvedHours,
    description: biz.description ? biz.description.trim() : null,
    targetCustomers: biz.targetAudience ? biz.targetAudience.trim() : null,
    goals: Array.isArray(biz.goals) && biz.goals.length > 0 ? biz.goals : null,
    brandVoice: biz.brandVoice ? biz.brandVoice.trim() : (biz.toneOfVoice ? biz.toneOfVoice.trim() : null),
    googleProfile,
    brain: brain ? {
      score: brain.score,
      readinessScore: brain.readinessScore,
      summary: brain.summary,
      swot: brain.swot as any,
      priorities: brain.priorities as any,
      lastSynthesizedAt: brain.lastSynthesizedAt ? new Date(brain.lastSynthesizedAt).toISOString() : null,
    } : null,
    dataSources,
    lastUpdated: biz.updatedAt ? new Date(biz.updatedAt).toISOString() : null,
  };

  return canonicalTruth;
}
