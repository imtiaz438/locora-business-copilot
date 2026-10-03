/**
 * Clean placeholder phone numbers from business records.
 *
 * Background: an AI-invented placeholder phone (+10000000000 and similar
 * all-zero shapes) was persisted to some businessesTable / locationsTable rows
 * as if it were a verified fact. New writes are now guarded by
 * sanitizePhoneForStorage (server/phoneIntegrity.ts); this script repairs
 * rows contaminated before the guard existed.
 *
 * This script NULLS OUT only placeholder-shaped phones. Real numbers are
 * never touched.
 *
 * Run on the VPS (needs DATABASE_URL env — the app's Postgres connection string):
 *   npx tsx scripts/clean-placeholder-phones.mjs            # dry run (lists what would go)
 *   npx tsx scripts/clean-placeholder-phones.mjs --execute  # actually cleans
 * NOTE: must run with tsx, not plain node (the script imports .ts modules).
 */
import { db, schema } from '../src/db/index.ts';
import { isNull, or, sql } from 'drizzle-orm';
import { isPlaceholderPhone } from '../server/phoneIntegrity.ts';

const DRY_RUN = !process.argv.includes('--execute');

async function main() {
  const bizRows = await db
    .select({ id: schema.businessesTable.id, name: schema.businessesTable.name, phone: schema.businessesTable.phone })
    .from(schema.businessesTable);
  const locRows = await db
    .select({ id: schema.locationsTable.id, businessId: schema.locationsTable.businessId, phone: schema.locationsTable.phone })
    .from(schema.locationsTable);

  const badBiz = bizRows.filter((r) => r.phone && isPlaceholderPhone(r.phone));
  const badLoc = locRows.filter((r) => r.phone && isPlaceholderPhone(r.phone));

  console.log(`Businesses with placeholder phones: ${badBiz.length}`);
  for (const r of badBiz) console.log(`  - ${r.id} (${r.name}): ${r.phone}`);
  console.log(`Locations with placeholder phones: ${badLoc.length}`);
  for (const r of badLoc) console.log(`  - ${r.id} (biz ${r.businessId}): ${r.phone}`);

  if (DRY_RUN) {
    console.log('\nDRY RUN — no changes made. Re-run with --execute to clean.');
    return;
  }

  for (const r of badBiz) {
    await db
      .update(schema.businessesTable)
      .set({ phone: null, updatedAt: new Date() })
      .where(sql`${schema.businessesTable.id} = ${r.id}`);
  }
  for (const r of badLoc) {
    await db
      .update(schema.locationsTable)
      .set({ phone: null, updatedAt: new Date() })
      .where(sql`${schema.locationsTable.id} = ${r.id}`);
  }
  console.log(`\nCleaned ${badBiz.length} business rows and ${badLoc.length} location rows.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('clean-placeholder-phones failed:', err?.message || err);
    process.exit(1);
  });
