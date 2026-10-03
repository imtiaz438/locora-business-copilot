#!/usr/bin/env node
/**
 * grant-drop-credits.mjs — manually grant AI credits to partnership/pilot redeemers.
 *
 * Used for pilots like Uppeek Drops where no promo-code redemption exists in-app yet.
 * Follows the codebase's own convention: user.monthlyAiCredits = (user.monthlyAiCredits || 25) + addedCredits
 * (same pattern as fuel-pack purchases in server.ts).
 *
 * IMPORTANT: the server holds users in memory and rewrites data/users.json on changes,
 * so STOP the server before running this, then start it again (it loads from disk at boot).
 *
 * Usage:
 *   node scripts/grant-drop-credits.mjs --credits 150 --emails "a@x.com,b@y.com"
 *   node scripts/grant-drop-credits.mjs --credits 150 --file redeemers.txt   # one email per line
 *
 * Env override (for dry-runs): LOCORA_USERS_FILE=/tmp/users-copy.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const USERS_FILE = process.env.LOCORA_USERS_FILE || path.join(REPO_ROOT, 'data', 'users.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { credits: 0, emails: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--credits') out.credits = Number(args[++i]) || 0;
    else if (args[i] === '--emails') out.emails.push(...args[++i].split(',').map((s) => s.trim()).filter(Boolean));
    else if (args[i] === '--file') {
      const lines = fs.readFileSync(args[++i], 'utf-8').split('\n').map((s) => s.trim()).filter(Boolean);
      out.emails.push(...lines);
    }
  }
  return out;
}

const { credits, emails } = parseArgs();
if (!credits || credits <= 0) { console.error('Error: --credits must be a positive number.'); process.exit(1); }
if (!emails.length) { console.error('Error: provide --emails "a@x.com,b@y.com" or --file list.txt'); process.exit(1); }
if (!fs.existsSync(USERS_FILE)) { console.error(`Error: users file not found: ${USERS_FILE}`); process.exit(1); }

const list = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
const granted = [], missing = [];

for (const rawEmail of emails) {
  const email = rawEmail.toLowerCase().trim();
  const user = list.find((u) => u && u.email && u.email.toLowerCase().trim() === email);
  if (!user) { missing.push(rawEmail); continue; }
  const before = user.monthlyAiCredits || 25;
  user.monthlyAiCredits = before + credits;
  granted.push({ email: user.email, before, after: user.monthlyAiCredits });
}

fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');

console.log(`\nGranted ${credits} credits to ${granted.length} user(s):`);
granted.forEach((g) => console.log(`  ✓ ${g.email}: ${g.before} → ${g.after} monthlyAiCredits`));
if (missing.length) {
  console.log(`\nNot found (no account yet — ask them to sign up first, then re-run):`);
  missing.forEach((e) => console.log(`  ✗ ${e}`));
}
console.log('\nDone. Restart the server so it reloads users from disk.');
