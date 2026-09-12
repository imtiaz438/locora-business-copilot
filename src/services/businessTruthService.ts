import type { BusinessTruth } from '../types.ts';

/**
 * CANONICAL BUSINESS TRUTH / BUSINESS BRAIN SERVICE (CLIENT)
 *
 * Requirements:
 * 1. Every feature must read business identity and business facts from this service.
 * 2. getBusinessTruth(businessId) returns the canonical truth object.
 * 3. If a field is missing, return null.
 * 4. Never substitute another business.
 * 5. Never invent a value.
 * 6. Do NOT duplicate business information across components.
 */

// In-memory cache to guarantee high performance and avoid redundant network round-trips
const truthCache = new Map<string, { data: BusinessTruth; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh cache

export async function getBusinessTruth(businessId: string, forceFresh = false): Promise<BusinessTruth | null> {
  const cleanId = (businessId || '').trim();
  if (!cleanId) {
    return null;
  }

  // Check cache unless forceFresh is requested
  if (!forceFresh) {
    const cached = truthCache.get(cleanId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const res = await fetch(`/api/business-truth/${encodeURIComponent(cleanId)}`);
    if (!res.ok) {
      if (res.status === 404) {
        // Strict: never substitute another business
        truthCache.delete(cleanId);
        return null;
      }
      throw new Error(`Failed to fetch business truth: HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      truthCache.delete(cleanId);
      return null;
    }

    const truth: BusinessTruth = json.data;

    // Cache the verified response
    truthCache.set(cleanId, { data: truth, timestamp: Date.now() });

    return truth;
  } catch (err) {
    console.error(`[BusinessTruthService] Error getting business truth for ${cleanId}:`, err);
    return null;
  }
}

/**
 * Invalidate cache for a specific business or all businesses
 */
export function invalidateBusinessTruth(businessId?: string) {
  if (businessId) {
    truthCache.delete(businessId.trim());
  } else {
    truthCache.clear();
  }
}

/**
 * Audit which core business fields are missing from canonical truth
 */
export function getMissingBusinessFields(truth: BusinessTruth | null): string[] {
  if (!truth) return ['All business information missing'];
  const missing: string[] = [];

  if (!truth.name) missing.push('business name');
  if (!truth.website) missing.push('website URL');
  if (!truth.category) missing.push('category');
  if (!truth.phone) missing.push('phone');
  if (!truth.email) missing.push('email');
  if (!truth.address) missing.push('physical address');
  if (!truth.services || truth.services.length === 0) missing.push('services');
  if (!truth.serviceAreas || truth.serviceAreas.length === 0) missing.push('service areas');
  if (!truth.hours) missing.push('operating hours');
  if (!truth.description) missing.push('description');
  if (!truth.targetCustomers) missing.push('target customers');
  if (!truth.goals || truth.goals.length === 0) missing.push('goals');
  if (!truth.brandVoice) missing.push('brand voice');
  if (!truth.googleProfile?.connected) missing.push('Google Business Profile connection');

  return missing;
}
