import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  name?: string,
  companyName?: string,
  planTier: string = 'free',
  role: string = 'customer',
  seoLookupsPerMonth?: number,
  seoLookupsUsed?: number,
  aiVisibilityRunsPerMonth?: number,
  aiVisibilityRunsUsed?: number,
  monthlyAiCredits?: number,
  aiCreditsUsed?: number
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || 'User',
        companyName: companyName || 'My Business',
        role: role || 'customer',
        planTier,
        seoLookupsPerMonth: seoLookupsPerMonth ?? 10,
        seoLookupsUsed: seoLookupsUsed ?? 0,
        aiVisibilityRunsPerMonth: aiVisibilityRunsPerMonth ?? 1,
        aiVisibilityRunsUsed: aiVisibilityRunsUsed ?? 0,
        monthlyAiCredits: monthlyAiCredits ?? 25,
        aiCreditsUsed: aiCreditsUsed ?? 0,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name: name || 'User',
          companyName: companyName || 'My Business',
          role: role || 'customer',
          planTier,
          monthlyAiCredits: monthlyAiCredits ?? 25,
          aiCreditsUsed: aiCreditsUsed ?? 0,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to sync user to Cloud SQL database:', error);
    return { uid, email, name, companyName, planTier, role };
  }
}

export async function updateUserSeoUsage(params: {
  uid?: string;
  email: string;
  seoLookupsUsed?: number;
  seoLookupsResetAt?: Date;
  aiVisibilityRunsUsed?: number;
  aiVisibilityResetAt?: Date;
}) {
  try {
    const updateData: any = {};
    if (typeof params.seoLookupsUsed === 'number') updateData.seoLookupsUsed = params.seoLookupsUsed;
    if (params.seoLookupsResetAt) updateData.seoLookupsResetAt = params.seoLookupsResetAt;
    if (typeof params.aiVisibilityRunsUsed === 'number') updateData.aiVisibilityRunsUsed = params.aiVisibilityRunsUsed;
    if (params.aiVisibilityResetAt) updateData.aiVisibilityResetAt = params.aiVisibilityResetAt;

    if (Object.keys(updateData).length === 0) return;

    if (params.uid) {
      await db.update(users).set(updateData).where(eq(users.uid, params.uid));
    } else if (params.email) {
      await db.update(users).set(updateData).where(eq(users.email, params.email.toLowerCase()));
    }
  } catch (err) {
    console.warn('[Cloud SQL] updateUserSeoUsage failed:', err);
  }
}

