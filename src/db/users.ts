import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, name?: string, companyName?: string, planTier: string = 'free', role: string = 'customer') {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name: name || 'User',
        companyName: companyName || 'My Business',
        role: role || 'customer',
        planTier,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name: name || 'User',
          companyName: companyName || 'My Business',
          role: role || 'customer',
          planTier,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to sync user to Cloud SQL database:', error);
    return { uid, email, name, companyName, planTier, role };
  }
}
