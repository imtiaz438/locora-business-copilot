import { db, schema } from '../src/db/index.ts';
import { eq, desc, and, or } from 'drizzle-orm';
import { DataSourceAttribution } from '../src/types.ts';
import type { BusinessTruth, BusinessTruthLocation, BusinessTruthGoogleProfile } from '../src/types.ts';
import { getBusinessRecordById } from './locoraDataEngine.ts';

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
  const cleanId = (businessId || '').trim();
  const isGenericOrPending = !cleanId || cleanId === 'workspace_pending' || cleanId === 'biz_locora_canonical' || cleanId === 'active';
  
  if (isGenericOrPending) {
    return null;
  }

  try {
    let bizRows: any[] = [];
    bizRows = await db
      .select()
      .from(schema.businessesTable)
      .where(eq(schema.businessesTable.id, cleanId))
      .limit(1);
    
    // Strict rule: if a specific businessId was requested and not found, return null - NEVER substitute another business
    if (bizRows.length === 0) {
      return null;
    }

    if (bizRows.length > 0) {
      const biz = bizRows[0];
      const resolvedBizId = biz.id;

      // 2. Fetch all locations for this business
      const locRows = await db
        .select()
        .from(schema.locationsTable)
        .where(eq(schema.locationsTable.businessId, resolvedBizId))
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
        resolvedAddress = parts.join(', ');
      }

      let resolvedHours: string | string[] | null = null;
      if (primaryLoc && primaryLoc.hours) {
        if (Array.isArray(primaryLoc.hours) && primaryLoc.hours.length > 0) {
          resolvedHours = primaryLoc.hours.length === 1 ? primaryLoc.hours[0] : primaryLoc.hours;
        } else if (typeof primaryLoc.hours === 'string') {
          resolvedHours = primaryLoc.hours;
        }
      }

      // 3. Track verified sources
      const dataSources: string[] = [DataSourceAttribution.USER_PROVIDED];
      if (locRows.length > 0) {
        dataSources.push(DataSourceAttribution.WEBSITE);
      }

      // 4. Fetch GBP connection if active — filter by provider directly so a
      // non-GBP connection row can never shadow the real GBP connection.
      let gbpRows: any[] = [];
      try {
        gbpRows = await db
          .select()
          .from(schema.dataConnectionsTable)
          .where(
            and(
              eq(schema.dataConnectionsTable.businessId, resolvedBizId),
              or(
                eq(schema.dataConnectionsTable.provider, 'google_gbp'),
                eq(schema.dataConnectionsTable.provider, 'google_business')
              )
            )
          )
          .limit(1);
      } catch (e) {}

      let googleProfile: BusinessTruthGoogleProfile | null = null;
      const gbpConnectionRecord = gbpRows[0] || null;
      if (gbpConnectionRecord) {
        dataSources.push(DataSourceAttribution.GOOGLE_BUSINESS_PROFILE);
        googleProfile = {
          connected: gbpConnectionRecord.status === 'connected',
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
      let brainRows: any[] = [];
      try {
        brainRows = await db
          .select()
          .from(schema.businessBrainTable)
          .where(eq(schema.businessBrainTable.businessId, resolvedBizId))
          .limit(1);
      } catch (e) {}

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
        hours: Array.isArray(resolvedHours) ? resolvedHours.join(', ') : (resolvedHours || null),
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
  } catch (err) {
    console.warn('DB query in getBusinessTruth encountered an issue, falling back to locoraDataEngine:', err);
  }

  // Fallback to in-memory/file-based canonical locoraDataEngine strictly for this specific cleanId
  if (!cleanId || isGenericOrPending) {
    return null;
  }
  const engineBiz = getBusinessRecordById(cleanId);
  if (!engineBiz) {
    return null;
  }

  const identity = engineBiz.identity || ({} as any);
  const resolvedAddress = identity.address ? `${identity.address}, ${identity.city || ''}, ${identity.state || ''} ${identity.zip || ''}`.trim() : null;

  const fallbackTruth: BusinessTruth = {
    businessId: engineBiz.id,
    name: identity.name || null,
    category: identity.category || identity.industry || null,
    website: identity.website || null,
    phone: identity.phone || null,
    email: engineBiz.userEmail || null,
    address: resolvedAddress,
    locations: [{
      id: 'loc_main',
      name: 'Primary Location',
      isPrimary: true,
      address: identity.address || null,
      city: identity.city || null,
      state: identity.state || null,
      zip: identity.zip || null,
      country: identity.country || null,
      phone: identity.phone || null,
      hours: engineBiz.gbpData?.businessHours || null,
    }],
    services: identity.services || null,
    serviceAreas: identity.targetLocations || null,
    hours: engineBiz.gbpData?.businessHours ? (Array.isArray(engineBiz.gbpData.businessHours) ? engineBiz.gbpData.businessHours.join(', ') : engineBiz.gbpData.businessHours) : null,
    description: (identity as any).description || identity.tagline || null,
    targetCustomers: null,
    goals: null,
    brandVoice: null,
    googleProfile: engineBiz.gbpData ? {
      connected: Boolean(engineBiz.gbpData.connected),
      placeId: engineBiz.googlePlaceId || null,
      locationName: engineBiz.gbpData.listingName || null,
      address: engineBiz.gbpData.address || null,
      rating: engineBiz.gbpData.rating || null,
      reviewCount: engineBiz.gbpData.reviewCount || null,
      isVerified: Boolean(engineBiz.gbpData.googleVerified),
      status: 'connected',
    } : null,
    brain: null,
    dataSources: ['locora_canonical_engine', 'directory_live'],
    lastUpdated: engineBiz.updatedAt || new Date().toISOString(),
  };

  return fallbackTruth;
}
