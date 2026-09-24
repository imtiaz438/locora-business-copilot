import { eq, ilike, desc, and, count } from 'drizzle-orm';
import { db, schema } from '../src/db/index.ts';

export const PLAN_BUSINESS_LIMITS: Record<string, number> = {
  free: 1,
  pro: 3,
  agency: 10,
  agency_elite: 10,
  elite: 10,
  growth: 3,
  starter: 1,
};

export interface BusinessLimitInfo {
  accountId: string;
  planTier: string;
  limit: number;
  currentCount: number;
  canAddMore: boolean;
  canCreate: boolean;
  display: string; // "Businesses: 2 / 3"
}

export class AuthorizationError extends Error {
  status: number;
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
    this.statusCode = 403;
  }
}

/**
 * Ensures an Account/Workspace exists for the given user email and planTier.
 * Accounts are the primary ownership boundary for businesses.
 */
export async function ensureAccountForUser(
  userEmail: string,
  planTier?: string,
  name?: string
) {
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  if (!cleanEmail) {
    const fallbackId = 'acc_default_workspace';
    const existingAccounts = await db
      .select()
      .from(schema.accountsTable)
      .where(eq(schema.accountsTable.id, fallbackId))
      .limit(1);

    if (existingAccounts.length > 0) {
      return existingAccounts[0];
    }

    try {
      const [created] = await db
        .insert(schema.accountsTable)
        .values({
          id: fallbackId,
          name: 'Default Workspace',
          ownerEmail: 'workspace@locora.ai',
          planTier: 'free',
          status: 'active',
        })
        .onConflictDoNothing()
        .returning();
      if (created) return created;
    } catch {}

    const recheck = await db
      .select()
      .from(schema.accountsTable)
      .where(eq(schema.accountsTable.id, fallbackId))
      .limit(1);
    if (recheck.length > 0) return recheck[0];

    return {
      id: fallbackId,
      name: 'Default Workspace',
      ownerEmail: 'workspace@locora.ai',
      planTier: 'free',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }

  const accountId = `acc_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

  // 1. Check existing in accountsTable
  const existingAccounts = await db
    .select()
    .from(schema.accountsTable)
    .where(eq(schema.accountsTable.id, accountId))
    .limit(1);

  let account = existingAccounts[0];

  const effectiveTier = (planTier || account?.planTier || 'free').toLowerCase();

  if (!account) {
    const accName = name?.trim() || `${cleanEmail.split('@')[0]} Workspace`;
    const [created] = await db
      .insert(schema.accountsTable)
      .values({
        id: accountId,
        name: accName,
        ownerEmail: cleanEmail,
        planTier: effectiveTier,
        status: 'active',
      })
      .returning();
    account = created;
  } else if (planTier && account.planTier !== effectiveTier) {
    const [updated] = await db
      .update(schema.accountsTable)
      .set({
        planTier: effectiveTier,
        updatedAt: new Date(),
      })
      .where(eq(schema.accountsTable.id, accountId))
      .returning();
    account = updated;
  }

  // Backfill any orphaned businesses for this ownerEmail to this accountId
  try {
    await db
      .update(schema.businessesTable)
      .set({ accountId: account.id })
      .where(
        and(
          ilike(schema.businessesTable.ownerEmail, cleanEmail),
          eq(schema.businessesTable.accountId, '')
        )
      );
  } catch {}

  // If user already owns at least 1 business and onboardingStatus is pending, auto-mark completed
  try {
    if (account.onboardingStatus !== 'completed') {
      const bizs = await db
        .select({ id: schema.businessesTable.id })
        .from(schema.businessesTable)
        .where(eq(schema.businessesTable.accountId, account.id))
        .limit(1);
      if (bizs.length > 0) {
        await db
          .update(schema.accountsTable)
          .set({ onboardingStatus: 'completed', updatedAt: new Date() })
          .where(eq(schema.accountsTable.id, account.id));
        account.onboardingStatus = 'completed';
      }
    }
  } catch {}

  return account;
}

/**
 * Updates the account-level onboarding status.
 * Once 'completed', the account onboarding wizard must never show again.
 */
export async function updateAccountOnboardingStatus(
  accountIdOrEmail: string,
  status: 'pending' | 'completed' = 'completed'
) {
  const clean = (accountIdOrEmail || '').toLowerCase().trim();
  if (!clean) return null;

  const targetId = clean.startsWith('acc_') ? clean : `acc_${clean.replace(/[^a-z0-9]/g, '_')}`;

  const [updated] = await db
    .update(schema.accountsTable)
    .set({
      onboardingStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(schema.accountsTable.id, targetId))
    .returning();

  return updated;
}

export async function getAccountOnboardingStatus(accountIdOrEmail: string): Promise<'pending' | 'completed'> {
  const clean = (accountIdOrEmail || '').toLowerCase().trim();
  if (!clean) return 'pending';

  const targetId = clean.startsWith('acc_') ? clean : `acc_${clean.replace(/[^a-z0-9]/g, '_')}`;

  const rows = await db
    .select({ onboardingStatus: schema.accountsTable.onboardingStatus })
    .from(schema.accountsTable)
    .where(eq(schema.accountsTable.id, targetId))
    .limit(1);

  if (rows.length > 0) {
    return (rows[0].onboardingStatus as 'pending' | 'completed') || 'pending';
  }

  return 'pending';
}

/**
 * Centralized backend function: getBusinessLimit(accountId)
 * All business creation must use this service.
 * Free: 1, Pro: 3, Agency Elite: 10.
 * Always formats display strictly as: "Businesses: X / Y"
 */
export async function getBusinessLimit(accountId: string): Promise<BusinessLimitInfo> {
  const cleanAccountId = (accountId || '').trim();
  if (!cleanAccountId) {
    return {
      accountId: '',
      planTier: 'free',
      limit: 1,
      currentCount: 0,
      canAddMore: true,
      canCreate: true,
      display: 'Businesses: 0 / 1',
    };
  }

  let accountRows = await db
    .select()
    .from(schema.accountsTable)
    .where(eq(schema.accountsTable.id, cleanAccountId))
    .limit(1);

  let account = accountRows[0];
  if (!account && cleanAccountId.startsWith('acc_')) {
    // If account was passed directly but not inserted yet, create it
    const emailCandidate = cleanAccountId.replace(/^acc_/, '').replace(/_/g, '.');
    account = await ensureAccountForUser(emailCandidate, 'free');
  }

  const planTier = (account?.planTier || 'free').toLowerCase();
  const limit = PLAN_BUSINESS_LIMITS[planTier] ?? 1;

  // Count businesses strictly owned by this accountId
  let ownedBizs = await db
    .select()
    .from(schema.businessesTable)
    .where(eq(schema.businessesTable.accountId, cleanAccountId));

  if (ownedBizs.length === 0 && account?.ownerEmail) {
    const emailBizs = await db
      .select()
      .from(schema.businessesTable)
      .where(ilike(schema.businessesTable.ownerEmail, account.ownerEmail));
    if (emailBizs.length > 0) {
      try {
        await db
          .update(schema.businessesTable)
          .set({ accountId: cleanAccountId })
          .where(ilike(schema.businessesTable.ownerEmail, account.ownerEmail));
      } catch {}
      ownedBizs = emailBizs;
    }
  }

  const currentCount = ownedBizs.length;
  // A user with 0 businesses can ALWAYS add their first business on any plan (limit >= 1)
  const canAddMore = currentCount === 0 || currentCount < limit;

  return {
    accountId: cleanAccountId,
    planTier,
    limit,
    currentCount,
    canAddMore,
    canCreate: canAddMore,
    display: `Businesses: ${currentCount} / ${limit}`,
  };
}

/**
 * Verifies that the authenticated accountId owns/has access to the target businessId.
 * Never trust a browser-supplied business ID without authorization.
 */
export async function verifyAccountBusinessAccess(
  accountId: string,
  businessId: string,
  isSuperAdmin = false
) {
  if (!businessId) {
    throw new Error('businessId is required for verification');
  }

  let rows = await db
    .select()
    .from(schema.businessesTable)
    .where(eq(schema.businessesTable.id, businessId))
    .limit(1);

  if (rows.length === 0) {
    // Also check by slug
    rows = await db
      .select()
      .from(schema.businessesTable)
      .where(eq(schema.businessesTable.slug, businessId.toLowerCase().trim()))
      .limit(1);
  }

  const business = rows[0];
  if (!business) {
    const err: any = new Error(`Business '${businessId}' not found.`);
    err.status = 404;
    err.statusCode = 404;
    throw err;
  }

  if (!isSuperAdmin) {
    if (business.accountId && business.accountId !== accountId) {
      throw new AuthorizationError(
        `Forbidden: Account '${accountId}' is not authorized to access business '${businessId}'.`
      );
    }
  }

  // If business has no accountId attached yet, bind it now to the authenticated account
  if (!business.accountId && accountId) {
    await db
      .update(schema.businessesTable)
      .set({ accountId })
      .where(eq(schema.businessesTable.id, business.id));
    business.accountId = accountId;
  }

  return business;
}
