import { SEO_LOOKUP_COSTS } from './types.ts';

export const SEO_PLAN_LIMITS: Record<string, { seoLookupsPerMonth: number; aiVisibilityRunsPerMonth: number }> = {
  free: {
    seoLookupsPerMonth: 0, // Free mode is strictly limited to Technical SEO & Lighthouse. 0 live API lookups to prevent credit burn.
    aiVisibilityRunsPerMonth: 1, // 1 complimentary audit to test live multi-model visibility
  },
  pro: {
    seoLookupsPerMonth: 100, // 100 weighted units
    aiVisibilityRunsPerMonth: 4, // ~1 run per week
  },
  agency: {
    seoLookupsPerMonth: 500, // 500 weighted units
    aiVisibilityRunsPerMonth: 16, // ~4 runs per week
  },
  elite: {
    seoLookupsPerMonth: 1000, // 1000 weighted units
    aiVisibilityRunsPerMonth: 30,
  },
};

export interface SeoLookupUserRecord {
  id?: string;
  email: string;
  planTier?: string;
  role?: string;
  seoLookupsPerMonth?: number;
  seoLookupsUsed?: number;
  seoLookupsResetAt?: string;
  aiVisibilityRunsPerMonth?: number;
  aiVisibilityRunsUsed?: number;
  aiVisibilityResetAt?: string;
}

/**
 * Checks if user's rolling 30-day period has elapsed and resets if necessary
 */
export function evaluateRollingReset(user: SeoLookupUserRecord): boolean {
  const now = Date.now();
  let modified = false;

  // SEO Lookups rolling reset
  const resetAtTime = user.seoLookupsResetAt ? new Date(user.seoLookupsResetAt).getTime() : 0;
  if (!resetAtTime || now >= resetAtTime) {
    user.seoLookupsUsed = 0;
    user.seoLookupsResetAt = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
    modified = true;
  }

  // AI Visibility rolling reset
  const aiResetAtTime = user.aiVisibilityResetAt ? new Date(user.aiVisibilityResetAt).getTime() : 0;
  if (!aiResetAtTime || now >= aiResetAtTime) {
    user.aiVisibilityRunsUsed = 0;
    user.aiVisibilityResetAt = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
    modified = true;
  }

  // Ensure default allowances match plan tier
  const tier = (user.planTier || 'free').toLowerCase();
  const limits = SEO_PLAN_LIMITS[tier] || SEO_PLAN_LIMITS.free;

  if (typeof user.seoLookupsPerMonth !== 'number' || user.seoLookupsPerMonth <= 0) {
    user.seoLookupsPerMonth = limits.seoLookupsPerMonth;
    modified = true;
  }
  if (typeof user.aiVisibilityRunsPerMonth !== 'number' || user.aiVisibilityRunsPerMonth <= 0) {
    user.aiVisibilityRunsPerMonth = limits.aiVisibilityRunsPerMonth;
    modified = true;
  }

  return modified;
}

/**
 * Validates whether user has sufficient SEO lookup credits before triggering API calls.
 */
export function checkSeoLookupEntitlement(
  user: SeoLookupUserRecord,
  cost: number = 1
): { allowed: boolean; remaining: number; limit: number; used: number; reason?: string } {
  // Admins bypass lookup constraints unless testing free tier
  if ((user.role === 'admin' || user.role === 'owner') && user.planTier !== 'free') {
    return {
      allowed: true,
      remaining: 99999,
      limit: 99999,
      used: user.seoLookupsUsed || 0,
    };
  }

  evaluateRollingReset(user);

  const tier = (user.planTier || 'free').toLowerCase();
  if (tier === 'free') {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      used: user.seoLookupsUsed || 0,
      reason: 'Live SEO lookups, backlink profiles, and AI citations require a Pro or Agency Elite subscription. Free mode is limited to on-page Technical SEO and Google Lighthouse recommendations.',
    };
  }

  const limit = user.seoLookupsPerMonth || SEO_PLAN_LIMITS[tier]?.seoLookupsPerMonth || 100;
  const used = user.seoLookupsUsed || 0;
  const remaining = Math.max(0, limit - used);

  if (remaining < cost) {
    return {
      allowed: false,
      remaining,
      limit,
      used,
      reason: `SEO Lookup limit reached (${used}/${limit} weighted units used this billing period). Upgrade your plan to perform more live audits.`,
    };
  }

  return {
    allowed: true,
    remaining,
    limit,
    used,
  };
}

/**
 * Validates AI visibility run entitlement (Phase E)
 */
export function checkAiVisibilityEntitlement(
  user: SeoLookupUserRecord
): { allowed: boolean; remaining: number; limit: number; used: number; reason?: string } {
  if ((user.role === 'admin' || user.role === 'owner') && user.planTier !== 'free') {
    return {
      allowed: true,
      remaining: 999,
      limit: 999,
      used: user.aiVisibilityRunsUsed || 0,
    };
  }

  evaluateRollingReset(user);

  const tier = (user.planTier || 'free').toLowerCase();
  const limit = user.aiVisibilityRunsPerMonth ?? SEO_PLAN_LIMITS[tier]?.aiVisibilityRunsPerMonth ?? (tier === 'free' ? 1 : 4);
  const used = user.aiVisibilityRunsUsed || 0;
  const remaining = Math.max(0, limit - used);

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining,
      limit,
      used,
      reason: tier === 'free'
        ? 'Complimentary AI Visibility check already used. Upgrade to Pro or Agency Elite for scheduled multi-model audits.'
        : `Monthly AI Visibility benchmark limit reached (${used}/${limit} runs used). Upgrade plan for more scheduled audits.`,
    };
  }

  return {
    allowed: true,
    remaining,
    limit,
    used,
  };
}

export { SEO_LOOKUP_COSTS };
