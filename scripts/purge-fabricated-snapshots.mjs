/**
 * Purge fabricated visibility/rank snapshots from the production database.
 *
 * Background: before the Oct 2026 remediation, POST /api/production/seo/:id/scan-visibility
 * invented rank positions (hardcoded 1/3/4 from keyword intent) and stored them as real
 * snapshots with search_engine='Google Local 3-Pack', device='desktop'. The fixed scanner
 * writes search_engine='Google Search Console', device='all' (or user-recorded observations).
 *
 * This script deletes ONLY rows carrying the fabricated signature, plus visibility
 * snapshots taken on the same (business, date) as fabricated rank snapshots.
 * Manual user-recorded observations are never touched.
 *
 * Run on the VPS (needs DATABASE_URL env):
 *   node scripts/purge-fabricated-snapshots.mjs            # dry run (lists what would go)
 *   node scripts/purge-fabricated-snapshots.mjs --execute  # actually deletes
 */
import { db, schema } from '../src/db/index.ts';
import { eq, and } from 'drizzle-orm';

const DRY_RUN = !process.argv.includes('--execute');

async function main() {
  // 1. Fabricated rank snapshots: exact signature of the old fake scanner.
  const fakeRanks = await db
    .select()
    .from(schema.rankSnapshotsTable)
    .where(
      and(
        eq(schema.rankSnapshotsTable.searchEngine, 'Google Local 3-Pack'),
        eq(schema.rankSnapshotsTable.device, 'desktop'),
      ),
    );

  console.log(`Fabricated rank snapshots found: ${fakeRanks.length}`);

  // 2. Visibility snapshots sharing (business_id, snapshot_date) with fabricated ranks.
  const businessDates = new Set(fakeRanks.map((r) => `${r.businessId}|${r.snapshotDate}`));
  const allVis = await db.select().from(schema.visibilitySnapshotsTable);
  const fakeVis = allVis.filter((v) => businessDates.has(`${v.businessId}|${v.snapshotDate}`));
  console.log(`Linked visibility snapshots found: ${fakeVis.length}`);

  if (DRY_RUN) {
    console.log('\nDRY RUN — nothing deleted. Re-run with --execute to purge.');
    const byBiz = {};
    for (const r of fakeRanks) byBiz[r.businessId] = (byBiz[r.businessId] || 0) + 1;
    console.log('Per-business fabricated rank counts:', JSON.stringify(byBiz, null, 1).slice(0, 2000));
    process.exit(0);
  }

  const rankIds = fakeRanks.map((r) => r.id);
  const visIds = fakeVis.map((v) => v.id);

  // Delete in chunks to stay safe.
  const chunk = (arr, n) => {
    const out = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  };
  let delRanks = 0;
  for (const c of chunk(rankIds, 500)) {
    for (const id of c) {
      await db.delete(schema.rankSnapshotsTable).where(eq(schema.rankSnapshotsTable.id, id));
      delRanks++;
    }
  }
  let delVis = 0;
  for (const c of chunk(visIds, 500)) {
    for (const id of c) {
      await db.delete(schema.visibilitySnapshotsTable).where(eq(schema.visibilitySnapshotsTable.id, id));
      delVis++;
    }
  }
  console.log(`\nPURGED: ${delRanks} fabricated rank snapshots, ${delVis} linked visibility snapshots.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Purge failed:', err.message || err);
  process.exit(1);
});
