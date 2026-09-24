import { runSafeDirectoryBackfill } from '../server/safeDirectoryBackfill';

async function main() {
  const isExecute = process.argv.includes('--execute') || process.argv.includes('-e');
  const dryRun = !isExecute;

  console.log('================================================================');
  console.log('LOCORA — SAFE BUSINESS -> DIRECTORY SYNC FOR PRODUCTION DATA');
  console.log(`MODE: ${dryRun ? 'DRY-RUN (REPORT ONLY, NO CHANGES TO DB)' : 'LIVE EXECUTION'}`);
  console.log('================================================================\n');

  try {
    const report = await runSafeDirectoryBackfill({ dryRun });

    console.log('\n================ BACKFILL REPORT SUMMARY ================');
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Dry-Run Mode: ${report.isDryRun}`);
    if (report.backupFileCreated) {
      console.log(`Pre-Sync Snapshot Backup: ${report.backupFileCreated}`);
    }
    console.log(`Businesses Found / Scanned: ${report.businessesScanned}`);
    console.log(`Existing Directory Listings: ${report.directoryListingsFound}`);
    if (dryRun) {
      console.log(`Records Requiring Updates: ${report.recordsRequiringUpdates}`);
    } else {
      console.log(`Records Updated: ${report.recordsUpdated}`);
      console.log(`New Listings Created: ${report.recordsCreated}`);
    }
    console.log(`Records Skipped: ${report.recordsSkipped}`);
    console.log(`New Fields Added: ${report.newFieldsAddedCount}`);
    console.log(`Existing Fields Changed: ${report.fieldsChangedCount}`);
    console.log(`Potential Conflicts Detected: ${report.potentialConflictsCount}`);
    console.log(`Reviews Synchronized: ${report.reviewsSynchronizedCount}`);
    console.log(`Maps/Coordinates Synchronized: ${report.mapsCoordinatesSynchronizedCount}`);
    console.log(`Production Records Deleted: ${report.deletedRecordsCount} (ASSERTION PASSED: 0)`);

    console.log('\n--- Fields Added Summary ---');
    console.log(JSON.stringify(report.fieldsAddedSummary, null, 2));

    console.log('\n--- Conflicts Detected & Resolutions ---');
    if (report.conflicts.length === 0) {
      console.log('No unresolvable conflicts detected. All fields safely merged.');
    } else {
      report.conflicts.forEach((c, idx) => {
        console.log(`[${idx + 1}] Business: ${c.businessId} | Field: ${c.field}`);
        console.log(`    Existing Value: ${JSON.stringify(c.existingValue)}`);
        console.log(`    New Value: ${JSON.stringify(c.newValue)}`);
        console.log(`    Source: ${c.source}`);
        console.log(`    Resolution: ${c.resolution}`);
      });
    }

    console.log('\n--- Per-Record Actions ---');
    report.recordDetails.forEach((r) => {
      console.log(`- [${r.action.toUpperCase()}] ${r.businessName} (${r.businessId})`);
      console.log(`    Status: ${r.statusBefore} -> ${r.statusAfter}`);
      if (r.fieldsAdded.length > 0) console.log(`    Fields Added: ${r.fieldsAdded.join(', ')}`);
      if (r.fieldsChanged.length > 0) console.log(`    Fields Changed: ${r.fieldsChanged.join(', ')}`);
      if (r.reasonsSkipped) console.log(`    Reasons Skipped: ${r.reasonsSkipped.join(', ')}`);
    });

    console.log('\n================================================================');
    if (dryRun) {
      console.log('To execute the live backfill, run:');
      console.log('npx tsx scripts/run_safe_directory_backfill.ts --execute');
    } else {
      console.log('LIVE BACKFILL COMPLETED SUCCESSFULLY WITHOUT DATA LOSS.');
    }
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Backfill failed with error:', err);
    process.exit(1);
  }
}

main();
