/**
 * Canonical AI credit model — the SINGLE source of truth for credit allocations.
 * Used by the frontend (AppContext, meters, billing displays) and the backend
 * (server.ts user records, credit guards). Never hardcode plan→credit numbers
 * anywhere else; import from here.
 *
 * Marketing promise (PricingView FAQ): Free 25/mo, Pro 250/mo, Agency unlimited.
 */
import type { UserPlan } from '../types';

/** Monthly AI credit allocation per paid plan tier. Agency/Elite = effectively unlimited. */
export const PLAN_AI_CREDITS: Record<UserPlan, number> = {
  free: 25,
  pro: 250,
  agency: 9999,
  elite: 9999,
};

/** Demo guests (no account) get a smaller one-time allocation. */
export const DEMO_GUEST_CREDITS = 15;

/**
 * Credits for a plan tier. Pass isDemoGuest=true for signed-out/demo sessions
 * on the free tier.
 */
export function creditsForPlan(planTier: UserPlan | string | undefined, isDemoGuest = false): number {
  const plan = (planTier || 'free') as UserPlan;
  if (plan === 'free' && isDemoGuest) return DEMO_GUEST_CREDITS;
  return PLAN_AI_CREDITS[plan] ?? PLAN_AI_CREDITS.free;
}

/** Credits remaining this cycle. Never negative. */
export function remainingCredits(monthlyAiCredits: number | undefined, aiCreditsUsed: number | undefined): number {
  const limit = monthlyAiCredits ?? PLAN_AI_CREDITS.free;
  return Math.max(0, limit - (aiCreditsUsed || 0));
}

/** Percentage of the monthly allocation used (0-100). Safe for unlimited tiers. */
export function creditsUsedPercent(monthlyAiCredits: number | undefined, aiCreditsUsed: number | undefined): number {
  const limit = monthlyAiCredits ?? PLAN_AI_CREDITS.free;
  if (limit <= 0) return 0;
  return Math.min(100, Math.round(((aiCreditsUsed || 0) / limit) * 100));
}

/** Unlimited display tiers (agency/elite) show ∞ instead of a number. */
export function isUnlimitedTier(planTier: UserPlan | string | undefined): boolean {
  return planTier === 'agency' || planTier === 'elite';
}
