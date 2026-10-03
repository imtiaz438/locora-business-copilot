# LocoraAI Admin Panel Audit

**Date:** 2026-10-03 · **Scope:** `src/components/AdminView.tsx` (4537 lines, 15 tabs) + `src/components/admin/AdminEmailActivityPanel.tsx` + `src/components/admin/DirectoryAdminPanel.tsx` + `src/components/PlanProviderAccessSummary.tsx` + `src/components/DataFreshnessPanel.tsx`, traced against `server.ts` (17,820 lines).
**Method:** read-only. Every control traced: UI control → frontend handler → backend route → handler implementation (real vs stub).
**Verdicts:** WORKS = real end-to-end implementation · BROKEN = calls missing/unreachable code · STUBBED = fakes it (mock, hardcoded success, fake validation) · UNWIRED = no backend effect (many are legitimate local filters/navigation; dead handlers flagged separately).

## Summary counts

| Verdict | Count |
|---|---|
| WORKS | 58 |
| BROKEN | 0 |
| STUBBED | 8 |
| UNWIRED | 23 |
| **Total controls audited** | **89** |

UNWIRED breaks down to ~17 legitimate local-only controls (search filters, tab pills, navigation, preview toggles, read-only modals) and **6 dead/missing-UI handlers** worth attention: refund flow, transaction status update, directory backfill endpoints, per-dataset "real" refresh (which is STUBBED, not merely unwired).

### Top 10 most critical items

1. **Unauthenticated mass-email trigger (SECURITY).** `POST /api/newsletter/send-weekly-dispatch` (`server.ts:14946`) has no `verifyAdminAccess` — unlike every other `/api/admin/*` route. Anyone can trigger a mass send to all newsletter subscribers. (dispatch tab)
2. **Unauthenticated email endpoints (SECURITY).** `POST /api/email/send-test` (`server.ts:3030`) and `GET /api/admin/email-status` (`server.ts:3065`) never call the admin gate. If Brevo creds are configured, any visitor can trigger real outbound email — spam vector. (email_server tab)
3. **Plaintext API secrets leaked to the browser (SECURITY).** `GET /api/admin/ai-tokens/stats` returns every provider key in plaintext in `savedKeys` (`server.ts:15410–15428`); the frontend stuffs them into password inputs (`AdminView.tsx:633–652`). (ai_tokens tab)
4. **Datasets "Check Now" fabricates sync state (FABRICATION).** `handleRefreshDataset` (`DataFreshnessPanel.tsx:~78`) is an 800ms `setTimeout` then sets `status:'connected'` with a fresh timestamp — inventing connection evidence. The panel's own banner declares synthetic data "strictly forbidden." "Refresh All" (`~:99`) is a 1000ms delay with zero backend call despite a tooltip claiming it pings APIs. (datasets tab)
5. **"Send Test Email" fakes success (FABRICATION).** With no Brevo credentials, the simulated tail (`server.ts:565–584`) returns `{success:true, provider:'simulated_local', messageId:'brevo_sim_<timestamp>'}` — a fabricated message ID — and the UI reports "successfully dispatched" when nothing was sent. An admin testing pre-launch would believe email works. (email_server tab)
6. **Refund endpoint claims money movement without a gateway call (FINANCIAL).** `POST /api/admin/transactions/refund` (`server.ts:11910`) marks the transaction `'refunded'` and emails the customer "has been issued to your original payment method" — with no Whop/gateway refund API call. Currently safe only because no UI control reaches it (dead handler). (payments tab)
7. **Perplexity key "validation" is theater (FAKE VALIDATION).** The `prov === 'perplexity'` branch (`server.ts:1371`) makes no HTTP call and returns `valid:true` unconditionally — any garbage string saves as a "verified" key. (ai_tokens tab)
8. **12 SEO/B2B keys stored blind; "Test All" tests 2 of 18 (FAKE VALIDATION).** `update-keys` only validates the 6 LLM providers (`server.ts:15569–15576`) while persisting Google Maps, PageSpeed, Apollo, MillionVerifier, Hunter, Google Search API/CX, DataForSEO, Serper, SerpApi, ScaleSerp, ValueSerp keys with zero checks — despite "Keys are validated in real-time before saving." "Test All Live Keys" probes only groq+anthropic (`server.ts:15540`) yet claims "validation across all AI providers." (ai_tokens tab)
9. **"Unlocked" provider badges never verified; advertises a removed provider (MISLEADING).** `evaluateProviderAccess` (`src/lib/planProviderAccess.ts:302`) defaults `isConfigured=true` and the panel never passes a live check — DataForSEO/SerpApi show "Unlocked" with no key ever checked against a provider API. The registry still claims `basic_ai.providerName = 'Google Gemini Basic Engine'` though Gemini was removed from the stack. (provider_access tab)
10. **"Full System Database Import" restores 2 of 16 tables (DATA-LOSS RISK).** `POST /api/database/import` (`server.ts:15113`) is labeled a full restore but only restores users + newsletter subscribers; businesses, locations, reviews, leads, etc. from the export are silently ignored. An admin restoring after a wipe would lose everything else. (workspaces tab)

**Honorable mentions:** `isAuthenticatedAdmin` initialized `true` and never set false (`AdminView.tsx:80`) — the frontend admin gate is permanently open (backend `verifyAdminAccess` still gates most routes, but the two email routes above are the exceptions); `POST /api/admin/update-user-plan` auto-creates an account for unknown emails (`server.ts:15263–15278`), so a typo'd admin grant silently creates an account; invoices tab shows only the admin's own invoices while titled "Financial Transactions & Payments Dashboard"; sales breakdown table still hardcodes stale $19/$49 rates (`AdminView.tsx:3719`) contradicting the $29/$99 cards on the same screen; subscriber Remove deletes Map+disk but not the Postgres row; stale "Gemini AI Copy" labels in the email-activity panel; save-with-unloaded-stats can wipe stored keys with empty strings (`server.ts:15585–15607`).

---

## Tab: users (`AdminView.tsx` ~1538–1848)

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| Grant Admin Privileges (form submit) | `handleTransferAdminship` (`AdminView.tsx:824`) → `handleUpdateUserRole(email,'admin')` | `POST /api/admin/update-user-plan` (`server.ts:15255`) | WORKS | Updates `usersDb` + `saveUsersToDisk()` + `await saveUserToSql(user)` |
| Role filter chips (All/Admins/Subscribers/Customers, Auto-Renew ON/OFF) | inline `setUserRoleFilter` / `setUserAutoRenewFilter` | none (local) | UNWIRED | Client-side filter over already-fetched rows |
| Search input (name/email) | inline `setUserSearch` | none (local) | UNWIRED | Local filter only |
| Plan Tier select (Free/Pro/Agency) | `handleUpdateUserPlan` (`AdminView.tsx:666`) | `POST /api/admin/update-user-plan` (`server.ts:15255`) | WORKS | Real write; recalculates `monthlyAiCredits` from canonical map (free 25 / pro 250 / agency 9999) |
| Billing Cycle select (Monthly/Yearly) | `handleUpdateUserBillingCycle` (`AdminView.tsx:722`) | `POST /api/admin/update-user-plan` (`server.ts:15255`) | WORKS | Writes `billingCycle`, disk + SQL |
| Auto-Renew ON/OFF toggle | `handleToggleUserAutoRenew` (`AdminView.tsx:694`) | `POST /api/admin/update-user-plan` (`server.ts:15255`) | WORKS | Writes `autoRenew` + `cancelAtPeriodEnd`; with `whopMembershipId` calls real Whop API `syncWhopAutoRenewalCancellation/Resumption` (`server.ts:9384/9415`, real fetch to `api.whop.com`) |
| Sub Status select (active/trial/past_due/cancelled) | `handleUpdateUserSubscriptionStatus` (`AdminView.tsx:748`) | `POST /api/admin/update-user-plan` (`server.ts:15255`) | WORKS | Writes `subscriptionStatus`, disk + SQL |
| "+ Admin" / "+ Sub" / "Customer" role buttons | `handleUpdateUserRole` (`AdminView.tsx:774`) | `POST /api/admin/update-user-plan` (`server.ts:15255`) | WORKS | Writes `role`, disk + SQL |
| "Workspace" button | inline → `switchBusiness(biz.id)` + `setAppActiveTab('overview')` (`:1795–1796`) | none (local) | UNWIRED | Local navigation into another user's workspace; functions defined, not broken |
| Delete (trash) → confirm "Permanently Delete User" | `handleConfirmDeleteUser` (`AdminView.tsx:806`) | `POST /api/admin/delete-user` (`server.ts:15322`) | WORKS | Real cascade: `executeCompleteUserCascadeDeletion` (`server.ts:1931`), drizzle `eq(ownerEmail)` over 40+ tables, self-delete guard |

**Data layer:** Real DB. `fetchAdminData` (`AdminView.tsx:584`) → `GET /api/admin/database-tables` (`server.ts:15171`): live drizzle reads of `businessesTable`, `locationsTable`, `directoryProfilesTable`, `googleReviewsTable`, `dataConnectionsTable`, `googleConnectionsTable`, `leadsTable`, `customersTable` + in-memory `usersDb` merged with SQL users. No localStorage.

**Most suspicious:** (1) `/api/admin/update-user-plan` **creates a brand-new user record if the email doesn't exist** (`server.ts:15263–15278`) — granting Admin to a typo'd email silently creates an account with that email + role. (2) The Role Policy info box tells admins to edit via "Firestore Console > users collection" — stale; this app uses Postgres/Drizzle.

---

## Tab: workspaces (`AdminView.tsx` ~1848–2166)

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| Refresh Workspaces | `fetchAdminData` (`AdminView.tsx:584`) | `GET /api/admin/database-tables` (`server.ts:15171`) | WORKS | Real drizzle reads across 8+ tables |
| Export DB | `handleDownloadAdminDbExport` (`:1030`) → `window.open('/api/database/export?...')` | `GET /api/database/export` (`server.ts:15013`) | WORKS | 14-table `Promise.all` drizzle selects + in-memory maps, JSON download |
| Import DB (file input, wired at `:1302`) | `handleImportAdminDbJson` (`:1034`) | `POST /api/database/import` (`server.ts:15113`) | WORKS | Real but **narrow**: labeled "Full System Database Import / Restore" yet restores only `users` + `newsletterSubscribers`; all other exported tables ignored |
| Workspace search input | inline `setWorkspaceSearchTerm` | none (local) | UNWIRED | Local filter |
| Open Workspace | inline → `switchBusiness` + `setAppActiveTab('overview')` (`:2040–2041`) | none (local) | UNWIRED | Local navigation |
| Directory | inline → `switchBusiness` + `setAppActiveTab('directory')` (`:2045–2046`) | none (local) | UNWIRED | Local navigation |
| Delete (trash) → confirm "Permanently Delete Business" | `handleConfirmDeleteBusiness` (`:121`) | `DELETE /api/admin/businesses/:businessId` (`server.ts:4885`) | WORKS | Real purge: `dbService.deleteBusiness` (Postgres cascade) + `deleteBusinessRecord` + scrubs `userWorkspaceDataMap` + directory cache invalidation |

**Data layer:** Real DB reads via drizzle (`businessesTable`, `locationsTable`, `directoryProfilesTable`, `googleReviewsTable`, `dataConnectionsTable`, `googleConnectionsTable`, `leadsTable`, `customersTable`).

**Most suspicious:** Import is over-labeled — export covers 16 tables, import restores 2. Not a true backup pair; a "restore" after a wipe silently loses businesses, locations, reviews, leads. Also: "Open Workspace" switches into any customer's dashboard purely client-side with no server-side impersonation check visible.

---

## Tab: database_tables (`AdminView.tsx` ~2166–2386)

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| Refresh DB | `fetchAdminData` (`AdminView.tsx:584`) | `GET /api/admin/database-tables` (`server.ts:15171`) | WORKS | Same real reads as workspaces |
| Export DB (JSON) | `handleDownloadAdminDbExport` (`:1030`) | `GET /api/database/export` (`server.ts:15013`) | WORKS | Same real export |
| Table selection pills | inline `setActiveDbTable` | none (local) | UNWIRED | View switch over already-fetched arrays |
| Table search input | inline `setDbSearchTerm` | none (local) | UNWIRED | `JSON.stringify(row)` client-side filter |

**Data layer:** Read-only viewer over real drizzle-backed rows. No write controls. Display truncated to first 10 keys per row.

**Most suspicious:** No fakes in this tab. Inherited risk only: the Export/Import pair is not a true backup (import restores 2/16 tables).

---

## Tab: logo (`AdminView.tsx` ~2386–2966)

Persistence: `updateSettings` (`AppContext.tsx:2306` → `POST /api/workspace/settings`, `server.ts:7243`) writes global `storedAppSettings` (disk + `dbService.saveSettings`); `updateBusinessProfile` (`AppContext.tsx:2275` → `POST /api/workspace/business-profile`, `server.ts:7119`) writes profile map/disk/DB and updates global `storedAppSettings.siteLogo*` for super admins. Both routes real.

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| Reset Assets | `handleAdminClearLogo` (`:362`) → `updateSettings({siteLogoUrl:'',...})` | `POST /api/workspace/settings` (`server.ts:7243`) | WORKS | Real global write + disk + DB |
| Save All Brand Assets | `handleAdminSaveLogo` (`:354`) → `updateSettings(...)` | `POST /api/workspace/settings` (`server.ts:7243`) | WORKS | Same real write |
| Header logo dropzone / file input | `handleAdminLogoFileChange` (`:321`) → FileReader data URL → `updateSettings` | `POST /api/workspace/settings` (`server.ts:7243`) | WORKS | Real; validates file type |
| Header Logo URL + Apply | inline (`:2495–2503`) → `updateBusinessProfile({logoUrl,logoConfig})` | `POST /api/workspace/business-profile` (`server.ts:7119`) | WORKS | Real profile + global write |
| Header Logo Height slider | inline (`:2525`) → `setAdminLogoConfig` only | none (deferred to Save) | WORKS | Persisted by "Save All Brand Assets" |
| Container Frame Background select | inline (`:2537`) → `setAdminLogoConfig` only | none (deferred to Save) | WORKS | Same deferred pattern |
| Upload Favicon | `handleFaviconFileChange` (`:260`) → `updateBusinessProfile` + live `<link rel=icon>` swap | `POST /api/workspace/business-profile` (`server.ts:7119`) | WORKS | Real; persists immediately |
| Clear Icon (favicon) | inline (`:2601–2606`) → `updateBusinessProfile` | `POST /api/workspace/business-profile` (`server.ts:7119`) | WORKS | Real |
| Upload Hero Icon | `handleHeroIconFileChange` (`:281`) → `updateBusinessProfile` | `POST /api/workspace/business-profile` (`server.ts:7119`) | WORKS | Real; persists immediately |
| Use Main Logo (hero fallback) | inline (`:2668–2673`) → clears `heroIconConfig` | `POST /api/workspace/business-profile` (`server.ts:7119`) | WORKS | Real |
| Hero Badge Icon Height slider | inline (`~:2690`) → `setAdminLogoConfig` only | none (deferred to Save) | WORKS | **Not persisted until "Save All" clicked** |
| Hero Badge Frame Style select | inline (`~:2708`) → `setAdminLogoConfig` only | none (deferred to Save) | WORKS | Same deferred pattern |
| Upload Auth Logo | `handleAuthLogoFileChange` (`:301`) → `updateBusinessProfile` | `POST /api/workspace/business-profile` (`server.ts:7119`) | WORKS | Real; persists immediately |
| Use Main Logo (auth fallback) | inline (`~:2737`) → clears `authLogoConfig` | `POST /api/workspace/business-profile` (`server.ts:7119`) | WORKS | Real |
| Auth Logo Height slider | inline (`~:2813`) → `setAdminLogoConfig` only | none (deferred to Save) | WORKS | Same deferred pattern |
| Auth Box Frame Style select | inline (`~:2830`) → `setAdminLogoConfig` only | none (deferred to Save) | WORKS | Same deferred pattern |
| Light/Dark preview toggle | inline `setAdminLogoPreviewTab` | none (local) | UNWIRED | Preview-only; legitimate |
| Apply & Save All Brand Assets Workspace-Wide (bottom CTA) | `handleAdminSaveLogo` (`:354`) | `POST /api/workspace/settings` (`server.ts:7243`) | WORKS | Commit point for all deferred slider/select state |

**Data layer:** Real. Server `storedAppSettings` (disk JSON `saveSettingsToDisk` `server.ts:1797` + `dbService.saveSettings`), per-user profile (`userProfilesMap`, disk, `businessProfileTable`), browser localStorage `locora_site_logo`, `locora_business_profile_logo`, `locora_site_logo_config`. No mocks.

**Most suspicious:** Inconsistent persistence UX — file uploads persist *immediately*, but all six sizing/frame sliders persist only on "Save All Brand Assets" with no warning; slider tweaks can be silently lost. "Workspace-Wide" is misleading: assets live in *global* site settings + the admin's own profile/localStorage, not per-customer-workspace.

---

## Tab: ai_tokens (`AdminView.tsx` ~2966–3663)

Architecture: token quotas are an in-memory `Map` (`aiModelQuotas`) persisted to disk JSON (`server.ts:15509`, `:15547`) — **admin-invented virtual pools, not real provider balances**; nothing reads a Groq/Anthropic usage API. API keys live in `storedAppSettings.providerKeys` (disk JSON + Postgres via `dbService.saveSettings`, `server.ts:15616–15618`), loaded from DB at startup (`server.ts:2159`), synced into `process.env` via `syncProviderKeysToEnv` (`server.ts:1596`). `server/aiEngine.ts` reads `process.env.GROQ_API_KEY` (`:117,:341,:452`) and `process.env.ANTHROPIC_API_KEY` (`:104,:338,:453`) at runtime → a saved key genuinely takes effect in-process.

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| "Refill +5M All Models" (header) | `handleRefillTokens(undefined, 5000000)` (`:925`) | `POST /api/admin/ai-tokens/refill` (`server.ts:15483`) | WORKS | Mutates `aiModelQuotas` + disk; virtual pools only, no provider quota read |
| Refresh stats | `fetchAiTokenStats` (`:622`) | `GET /api/admin/ai-tokens/stats` (`server.ts:15387`) | WORKS | Real read — but leaks plaintext secrets in `savedKeys` (see below) |
| Search input | `setAiModelSearch` (`:3087`) | none (local) | UNWIRED | Local filter |
| Filter tabs All / Groq LPU / Claude | `setAiProviderFilter` (`:3096–3116`) | none (local) | UNWIRED | Local filter |
| Per-model "+2M/+5M Top-Up" | `handleRefillTokens(m.id, amt)` (`:925`) | `POST /api/admin/ai-tokens/refill` (`server.ts:15483`) | WORKS | Per-model branch (`:15492–15501`), persists to disk |
| Custom-quota slider toggle | `setEditingQuotaModelId` (`:3249`) | none (local) | UNWIRED | Opens inline editor only |
| Custom quota "Save" | `handleUpdateQuota` (`:945`) | `POST /api/admin/ai-tokens/update-quota` (`server.ts:15520`) | WORKS | Real write + `saveModelQuotasToDisk()` (`:15542`) |
| Custom quota "✕" | `setEditingQuotaModelId(null)` (`:3244`) | none (local) | UNWIRED | Local state |
| "Test All Live Keys" | `handleValidateAllKeys` (`:899`) | `POST /api/admin/ai-tokens/validate-all` (`server.ts:15464`) | STUBBED | Only groq+anthropic probed (`:15540`); success message claims "validation across all AI providers" |
| "Save & Validate All AI Model API Keys" | `handleSaveAiKeys` (`:832`) | `POST /api/admin/ai-tokens/update-keys` (`server.ts:15554`) | WORKS | Persists disk+Postgres+`process.env` (runtime-live); LLM keys really validated **except** Perplexity (faked) and 12 SEO/B2B keys (never validated) |
| Groq LPU key input | `setGroqKeyInput` (`:3341`) | via Save above | WORKS | Real validation via `api.groq.com/openai/v1/models` (`server.ts:1150`); invalid → 400, key not saved (`:15574–15582`) |
| Anthropic Claude key input | `setClaudeKeyInput` (`:3362`) | via Save above | WORKS | Real validation via `api.anthropic.com/v1/models` (`:1335`) |
| Google Places / PageSpeed / Apollo / MillionVerifier / Hunter inputs | `set*KeyInput` (`:3400–3474`) | via Save above | STUBBED | Stored blind — no provider call; "validated in real-time before saving" copy is false for these |
| Google Search API/CX, DataForSEO login/password, Serper, SerpApi, ScaleSerp, ValueSerp inputs | `set*Input` (`:3504–3636`) | via Save above | STUBBED | Same: stored blind, never validated |

Validation reality: `discoverProviderModels` (`server.ts:1030`) makes real HTTP calls for Groq (`:1150`), Gemini (`:1220`), OpenAI (`:1299`), Anthropic (`:1335`), DeepSeek (`:1389`). **Perplexity branch (`:1371`) makes no HTTP call — returns `valid:true` unconditionally with hardcoded model data.**

**Data layer:** In-memory Maps + disk JSON + Postgres (`dbService.saveSettings`); `process.env` mutated live. No localStorage.

**Most suspicious:** (1) Perplexity "validation" is pure theater — any string saves as "verified." (2) `GET /api/admin/ai-tokens/stats` ships **every plaintext provider secret** to the browser in `savedKeys` (`server.ts:15410–15428`). (3) Wipe hazard: save sends all 18 keys from React state (`AdminView.tsx:840–860`); backend writes `''` over any key whose state is empty (`server.ts:15585–15607`) — if stats fail to load and admin hits Save, stored keys are overwritten with empty strings.

---

## Tab: sales (`AdminView.tsx` ~3663–3749)

No interactive controls — read-only cards + table. Stats computed at `AdminView.tsx:1093–1099` from `usersTable` (real Postgres rows via `/api/admin/database-tables`).

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| (none — read-only) | n/a | n/a | — | No controls to inventory |

**Data layer:** Read-only render of real `users` rows.

**Most suspicious:** The per-row monthly rate (`AdminView.tsx:3719`) still hardcodes old prices — `agency ? (yearly ? 39 : 49) : (yearly ? 15 : 19)` i.e. **$19/$49** — while the cards on the same screen show Pro **$29** / Agency **$99** (`:3684`, `:3695`). The 2026-10-03 pricing sweep missed this occurrence; cards and table contradict each other (`proMRR`/`agencyMRR` at `:1097–1098` correctly use 29/99).

---

## Tab: invoices (`AdminView.tsx` ~3749–3864)

`invoices` comes from `AppContext` (`AdminView.tsx:70`), hydrated from the **logged-in admin's own session** (`AppContext.tsx:1979`) — this tab can only ever show the admin's own workspace invoices, not platform revenue, despite the "Financial Transactions & Payments Dashboard" title.

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| Filter: All / Paid / Pending / Cancelled | `setInvoiceFilter` (`:3785–3808`) | none (local) | UNWIRED | Local filter |
| "Mark Paid" | `updateInvoiceStatus(inv.id,'paid')` (`AppContext.tsx:2543`) | `PATCH /api/workspace/invoices/:id/status` (`server.ts:7700`) | WORKS | Real: `dbService.updateInvoiceStatus` + per-user disk (`:7703–7708`); but errors swallowed (`.catch(()=>{})`), success banner shown regardless (`:3828–3848`) |
| "Mark Pending" | `updateInvoiceStatus(inv.id,'sent')` (`AppContext.tsx:2543`) | `PATCH /api/workspace/invoices/:id/status` (`server.ts:7700`) | WORKS | Same mechanics |
| "Cancel" | `updateInvoiceStatus(inv.id,'cancelled')` (`AppContext.tsx:2543`) | `PATCH /api/workspace/invoices/:id/status` (`server.ts:7700`) | WORKS | Same mechanics |

**Data layer:** Per-user workspace invoices: Postgres `invoicesTable` (drizzle) + per-user disk JSON. Scope = admin's own invoices.

**Most suspicious:** Scope misrepresentation — labeled as platform payments dashboard, mechanically limited to the admin's personal invoices. Secondary: `updateInvoiceStatus` swallows fetch errors while the UI always shows a success banner.

---

## Tab: subscribers (`AdminView.tsx` ~3864–3954)

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| Search subscribers input | `setSubSearch` (`:3885`) | none (local) | UNWIRED | Local filter |
| "Add Subscriber" (form submit) | `handleAddSubscriber` (`:989`) | `POST /api/newsletter/subscribe` (`server.ts:15691`) | WORKS | Real: `newsletterSubscribersDb` Map + disk + Postgres `newsletterSubscribersTable` (`db/service.ts:1626`); real welcome email via `sendEmail` (`server.ts:480`) |
| "Remove" (per row) | `handleDeleteSubscriber` (`:969`) | `POST /api/admin/delete-subscriber` (`server.ts:15672`) | WORKS | Deletes Map + disk (`:15681–15682`) — **but NOT the Postgres row** (subscribe writes SQL, delete doesn't) |

**Data layer:** In-memory Map + disk JSON + drizzle `newsletterSubscribersTable` (writes on subscribe only).

**Most suspicious:** Asymmetric persistence — a "removed" subscriber's Postgres row survives, so a SQL re-sync could resurrect them.

---

## Tab: dispatch (`AdminView.tsx` ~3954–4001)

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| "Trigger Weekly Dispatch Now" | `handleTriggerDispatch` (`:1009`) | `POST /api/newsletter/send-weekly-dispatch` (`server.ts:14946`) | WORKS | Real: `executeWeeklyNewsletterDispatch` (`:14803`) loops subscribers, real `sendEmail` per address, advances week index, persists `newsletterState`; hourly cron (`:14876`) also auto-dispatches every 7 days |

**Data layer:** `newsletterSubscribersDb` (in-memory) + persisted `newsletterState`; real sends via Brevo/Resend.

**Most suspicious:** `/api/newsletter/send-weekly-dispatch` has **no admin authentication** (`server.ts:14946` — `app.all` with no `verifyAdminAccess`; every `/api/admin/*` route has one). Unauthenticated mass-email trigger, no rate-limit beyond `lastDispatchedAt`.

---

## Tab: email_server (`AdminView.tsx` ~4001–4215)

SMTP config lives in **env vars only** (`BREVO_SMTP_HOST/PORT/USER/PASS`, `BREVO_API_KEY`, `RESEND_API_KEY`) — no save/config-edit control exists in this tab; nothing is written to DB or localStorage. Email logs are an in-memory array capped at 100 (`server.ts:380`), lost on restart.

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| "Refresh Status" | `fetchEmailStatus` (`:165`) | `GET /api/admin/email-status` (`server.ts:3065`) | WORKS | Real endpoint; reads env vars, returns `configured`/`hasPassword`/`activeProvider`. Reports config *presence*, not a live SMTP connection. **No admin-auth check** |
| "Send Test Email via Brevo" (to/subject/body + submit) | `handleSendTestEmail` (`:177`) | `POST /api/email/send-test` (`server.ts:3030`) | STUBBED | Route calls real `sendEmail()` cascade (nodemailer Brevo SMTP → Brevo REST v3 → Resend → **simulated**). No-credentials tail (`server.ts:565–584`) returns `{success:true, provider:'simulated_local', messageId:'brevo_sim_'+Date.now()}` — fabricated message ID — and UI shows "successfully dispatched" though nothing was sent. **No admin-auth check** |
| 6 "Active" trigger badges (Contact Us, Sign-up, Magic Link, Whop Invoices, Client Invoices, Newsletter) | hardcoded `status:'Active'` array (`~:4140`) | none (server `supportedTriggers` at `server.ts:3090` also hardcodes `active:true`) | STUBBED | Display-only strings, never verified against any workflow |

**Data layer:** Env vars only for config; in-memory logs. The real mail path (`sendEmail`, `server.ts:479`) does read env config, so sends are real when creds exist.

**Most suspicious:** The test button fakes success in simulation mode — an admin testing pre-launch would believe delivery works when nothing leaves the server. And with no admin gate on `/api/email/send-test`, any visitor could trigger real Brevo sends (spam vector) once creds are configured.

---

## Tab: email_activity (`src/components/admin/AdminEmailActivityPanel.tsx`, 924 lines)

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| "Refresh Activity" | `fetchAuditData` (`~:111`) | `GET /api/admin/directory-email/events` (`server.ts:17439`), `GET /api/admin/directory-email/status` (`:17404`), `GET /api/admin/directory/profiles` (`:17051`) | WORKS | All exist, all gated by `verifyAdminAccessAsync`. Real reads: audit store rows, stats from real rows, drizzle `businessesTable` join |
| "Send Directory Update Email" (opens modal) | `setShowSendModal(true)` | n/a (modal) | WORKS | Modal open only; no fake claim |
| Modal: business/variant/recipient → "Proceed to Confirmation" → "Confirm & Send Now" | `handleDispatchEmail` (`~:195`) | `POST /api/admin/directory-email/send` (`server.ts:17453`) | WORKS | Real pipeline: `handleDirectoryListingUpdatedEmail` (`server/directoryEmailAutomation.ts:1830`) — idempotency, business context, recipient safety, Groq AI copy, real `sendEmail` cascade. Honest about simulation: labels unconfigured-Brevo sends `'simulated'` (`:1990–1992`) with explicit UI notice |
| "Send once for this business" quick card | `handleSelectFirstUserBusiness` (`~:145`) → modal flow | same as above | WORKS | Same real backend; defaults recipient to owner email |
| Search input + status filter select | `setSearchQuery` / `setStatusFilter` | none (local) | UNWIRED | Client-side filtering; fine |
| "View Details" per-row | `setSelectedEvent(evt)` → modal | none (local) | UNWIRED | Read-only modal; fine |

**Data layer:** Real DB reads — directory-email audit store, drizzle `businessesTable` + `directoryProfilesTable`. Brevo webhook `/api/brevo/webhook` (`server.ts:17488`) updates delivered/bounced status honestly.

**Most suspicious:** UI still labels AI personalization "Gemini AI Copy" / "Yes (Gemini)" — Gemini was removed entirely (`@google/genai` deleted 2026-10-02; zero Gemini refs in `directoryEmailAutomation.ts`; Groq is used). Stale/misleading labels on an otherwise honest backend.

---

## Tab: provider_access (renders `PlanProviderAccessSummary`, `src/components/PlanProviderAccessSummary.tsx`, 234 lines)

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| Per-feature "Upgrade" button (`upgrade_required` rows) | `setCheckoutModalPlan(...)` (`~:78`) | none | WORKS | Opens real checkout modal; navigation only |
| Per-feature "Connect" button (`not_configured` rows) | `setActiveTab('settings')` (`~:95`) | none | WORKS | Real tab navigation |
| Header "Upgrade Plan" button | `setCheckoutModalPlan(...)` (`~:158`) | none | WORKS | Same real modal |
| (implicit) per-row status badge "Unlocked" / "Needs Key" / "Requires X" | `evaluateProviderAccess` (`src/lib/planProviderAccess.ts:302`) | none — no provider API call exists | STUBBED | No key validation anywhere. `evaluateProviderAccess` takes `isConfigured = true` **as the default**; the panel never passes `isConfigured`, `hasUpstreamError`, or any live check. Badges derive purely from `user.planTier` + static registry — a `requiresApiKey:true` feature (DataForSEO, SerpApi) shows "Unlocked" with no key existing and no provider API hit |

**Data layer:** Static in-code registry (`PROVIDER_FEATURE_REGISTRY`) + `AppContext.user.planTier`. No backend calls, no localStorage, no live verification.

**Most suspicious:** The registry claims `basic_ai.providerName = 'Google Gemini Basic Engine'` (`src/lib/planProviderAccess.ts`) — Gemini no longer exists in the stack. The tab advertises a removed provider and shows "Unlocked" badges for paid keys that were never checked.

---

## Tab: datasets (renders `DataFreshnessPanel`, `src/components/DataFreshnessPanel.tsx`, 342 lines)

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| "Refresh All" (tooltip: "Ping all connected APIs to re-verify timestamps") | `handleRefreshAll` (`~:99`) | **none** | STUBBED | `await new Promise(res => setTimeout(res, 1000))` then local `setCustomDatasets` — no fetch, no API ping, despite the tooltip |
| Per-dataset "Check Now" / "Connect" | `handleRefreshDataset` (`~:78`) | **none** | STUBBED | Comment literally says `// Simulate real refresh / trigger API`; 800ms `setTimeout` then sets `status:'connected'` with fresh timestamp — **fabricates connection state** |
| "View" per dataset | `setActiveTab(dataset.actionTab)` | none | WORKS | Real tab navigation |
| Filter tabs (All / Connected / Not Connected) | `setActiveFilter` | none (local) | UNWIRED | Client-side filtering; fine |

**Data layer:** `AppContext` (`activeBusiness`, `businessTruth`, `latestWebsiteAudit`) + local component state. No backend reads/writes.

**Most suspicious:** Worst offender in the panel. `handleRefreshDataset` invents sync evidence after a fake spinner — inside a panel whose own banner declares *"Strict Data Integrity Policy… Synthetic or simulated data is strictly forbidden"* and *"zero synthetic numbers."* Directly contradicts the durable no-fabrication principle.

---

## Tab: directory_rules (renders `DirectoryAdminPanel`, `src/components/admin/DirectoryAdminPanel.tsx`, 770 lines)

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| 3 master toggles (Public Directory Engine, Self-Publishing Allowed, Admin Approval Required) + automation switches | `handleSaveSettings` (`~:112`) | `POST /api/admin/directory/settings` (`server.ts:17037`) | WORKS | Real: `dbService.updateDirectorySettings(req.body)` + `invalidateDirectoryListingsCache()`. Admin-gated |
| Allowed-countries add/remove | `handleAddCountry` / `handleRemoveCountry` (`~:138/:147`) → `handleSaveSettings` | `POST /api/admin/directory/settings` (`server.ts:17037`) | WORKS | Same real write |
| Search input + filter tabs (all/published/suspended/unpublished/verified) | `setSearchQuery` / `setActiveFilterTab` | none (local) | UNWIRED | Client-side filtering; fine |
| Row actions: Publish / Unpublish / Suspend / Restore / Verify / Unverify | `handleModerateProfile(businessId, action)` (`~:157`) | `POST /api/admin/directory/profiles/:businessId/moderate` (`server.ts:17190`) | WORKS | Real drizzle writes: `businessesTable.isPublishedInDirectory` + `status`, upsert `directoryProfilesTable` (`status`, `isVerified`, `publishedAt`), cache invalidation, in-memory sync. Admin-gated |
| Delete listing (trash → confirm "Remove permanently") | `setListingToDelete` → `handleModerateProfile(...,'remove')` (`:759`) | same moderate route (`server.ts:17190`) | WORKS | Same real backend; `remove` → `isPublished=false`, `UNPUBLISHED` |
| (no control) Safe Directory Backfill | — | `GET/POST /api/admin/directory/backfill` (`server.ts:17307/17320`) exist | UNWIRED | Endpoints real (dry-run audit / non-destructive backfill) but no UI control invokes them |

**Data layer:** Real DB — drizzle `businessesTable`, `directoryProfilesTable`, `dbService.getDirectorySettings/updateDirectorySettings`. All mutating routes admin-gated via `verifyAdminAccessAsync`.

**Most suspicious:** Nothing faked — most honest tab. Only gap: orphaned backfill endpoints with no UI path.

---

## Tab: payments (`AdminView.tsx` ~4241–4537)

| Control | Frontend handler | Backend endpoint | Verdict | Evidence |
|---|---|---|---|---|
| "Refresh Transactions" | `fetchTransactionsData` (`:448`) | `GET /api/admin/transactions` (`server.ts:11838`) | WORKS | Real: merges in-memory `transactionsDb` + Postgres (`dbService.getTransactions()`), dedupes, live KPI stats. Admin-gated |
| Search input + status filter tabs | `setTransactionSearch` / `setTransactionFilter` | none (local) | UNWIRED | Client-side filtering; fine |
| Row delete (trash → confirm → "Delete") | `handleConfirmDeleteTransaction` (`:553`) | `POST /api/admin/transactions/delete` (`server.ts:12018`) | WORKS | Real: removes from memory, disk JSON, Postgres (`dbService.deleteTransaction`); tombstone in `deletedTransactionIds`. Admin-gated |
| (no control) Refund flow | `handleProcessRefund` (`:490`) → `POST /api/admin/transactions/refund` (`server.ts:11910`) | endpoint exists | UNWIRED | `setSelectedTxnForRefund` **never called from any JSX** — dead handler, no button/modal reaches it |
| (no control) Status update | `handleUpdateTxnStatus` (`:528`) → `POST /api/admin/transactions/update-status` (`server.ts:11969`) | endpoint exists | UNWIRED | No UI control calls it — dead handler |

**Data layer:** Hybrid — in-memory `transactionsDb` Map + disk JSON + Postgres merge. KPI stats computed live from real records.

**Most suspicious:** The refund endpoint (`server.ts:11910`) marks transactions `'refunded'` and emails the customer "has been issued to your original payment method" **without any Whop/gateway refund API call** — claims to move money without moving money. Safe today only because no UI reaches it.

---

## Cross-tab security & integrity notes

- **Admin auth gaps:** `/api/newsletter/send-weekly-dispatch` (`server.ts:14946`, `app.all`, no check), `POST /api/email/send-test` (`:3030`), `GET /api/admin/email-status` (`:3065`) skip `verifyAdminAccess`/`verifyAdminAccessAsync`, unlike every other `/api/admin/*` route. Frontend `isAuthenticatedAdmin` is `useState(true)` (`AdminView.tsx:80`) with no setter path — the UI gate is permanently open; only the backend checks provide real protection.
- **Stale Gemini references:** `PlanProviderAccessSummary` registry ("Google Gemini Basic Engine") and `AdminEmailActivityPanel` ("Gemini AI Copy" / "Yes (Gemini)") reference a provider removed 2026-10-02.
- **Honest tabs:** `directory_rules`, `payments` (wired parts), `email_activity`, `users`, `database_tables`, `logo` — all hit real drizzle/Postgres/disk writes with no fakes found.
- **Dishonest tabs:** `datasets` (fabricates sync state), `email_server` (fake test-success + hardcoded "Active" badges), `provider_access` (unverified "Unlocked" badges), `ai_tokens` partial (fake Perplexity validation, blind SEO-key storage, overstated "Test All").
- **Data-loss hazards:** import-restore asymmetry (workspaces), key-wipe-on-save (ai_tokens), slider persistence inconsistency (logo), Postgres-row resurrection (subscribers).
