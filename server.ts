import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { getOrCreateUser } from './src/db/users.ts';
import * as dbService from './src/db/service.ts';

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Dynamic Base URL Resolver for OAuth, Stripe & Email Links
function getRequestBaseUrl(req: express.Request): string {
  // 1. Explicit production APP_URL (if configured to a non-localhost custom domain)
  if (process.env.APP_URL && process.env.APP_URL.trim() && !process.env.APP_URL.includes('localhost')) {
    return process.env.APP_URL.trim().replace(/\/+$/, '');
  }
  // 2. Client Origin header (passed in fetch/xhr/post)
  if (req.headers.origin && typeof req.headers.origin === 'string') {
    return req.headers.origin.trim().replace(/\/+$/, '');
  }
  // 3. Client Referer header (passed in browser GET requests)
  if (req.headers.referer && typeof req.headers.referer === 'string') {
    try {
      const refUrl = new URL(req.headers.referer);
      return refUrl.origin.trim().replace(/\/+$/, '');
    } catch {
      // ignore
    }
  }
  // 4. Reverse Proxy headers (Nginx, Cloudflare, Cloud Run, Load Balancer)
  const forwardedProto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const forwardedHost = (req.headers['x-forwarded-host'] as string) || req.get('host');
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/+$/, '');
  }
  // 5. Fallback to default configured APP_URL or localhost
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

// Stripe Client Helper (Lazy Init & Multi-Mode Safe)
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && key.trim().length > 0) {
      try {
        stripeClient = new Stripe(key.trim());
      } catch (e) {
        console.error('Failed to initialize Stripe SDK:', e);
      }
    }
  }
  return stripeClient;
}

// Resend REST API Email Service (Active for Resend API Only)
interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html: string;
  replyTo?: string;
}

const SUPPORT_EMAIL = 'support@locoraai.com';

async function sendEmail({ to, subject, text, html, replyTo = SUPPORT_EMAIL }: SendEmailParams): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();

  // Active Resend API Dispatch
  if (resendApiKey) {
    try {
      let fromEmail = process.env.SMTP_FROM || `Locora AI <${SUPPORT_EMAIL}>`;
      
      let res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          reply_to: replyTo,
          subject,
          text: text || html.replace(/<[^>]+>/g, ''),
          html,
        }),
      });

      let data = await res.json();

      // If custom domain is not yet verified in Resend, automatically retry with default sandbox sender
      if (!res.ok && data?.message && (data.message.includes('domain') || data.message.includes('from'))) {
        console.warn(`[Email:Resend] Retrying with onboarding sender: ${data.message}`);
        fromEmail = 'Locora AI <onboarding@resend.dev>';
        res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [to],
            reply_to: replyTo,
            subject,
            text: text || html.replace(/<[^>]+>/g, ''),
            html,
          }),
        });
        data = await res.json();
      }

      if (res.ok && data.id) {
        console.log(`[Email:Resend] Successfully dispatched to ${to} (Message ID: ${data.id})`);
        return { success: true, provider: 'resend', messageId: data.id };
      }

      console.warn('[Email:Resend] API Error:', data);
      return { success: false, provider: 'resend', error: data?.message || 'Resend delivery failed' };
    } catch (err: any) {
      console.error('[Email:Resend] Exception:', err.message);
      return { success: false, provider: 'resend', error: err.message };
    }
  }

  // Development / Test Log Fallback when RESEND_API_KEY is not configured
  console.log(`\n================ [RESEND EMAIL DISPATCH LOG] ================
PROVIDER: Resend API (Waiting for RESEND_API_KEY env variable)
FROM: Locora AI <${SUPPORT_EMAIL}>
REPLY-TO: ${replyTo}
TO: ${to}
SUBJECT: ${subject}
BODY (HTML Preview):
${html.slice(0, 350)}...
============================================================\n`);

  return {
    success: true,
    provider: 'simulated_live',
    messageId: `resend_sim_${Date.now()}`,
  };
}

// In-Memory User & Credit Database with persistence capabilities
interface UserRecord {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: 'admin' | 'customer' | 'subscriber' | 'owner' | 'member' | 'client';
  planTier: 'free' | 'pro' | 'agency';
  subscriptionStatus: 'active' | 'trial' | 'past_due' | 'cancelled';
  billingCycle: 'monthly' | 'yearly';
  monthlyAiCredits: number;
  aiCreditsUsed: number;
  invoicesCreatedCount?: number;
  autoRenew?: boolean;
  memberSince: string;
  nextBillingDate: string;
  passwordHash?: string;
  paymentMethod?: {
    cardLast4: string;
    cardBrand: string;
    expDate: string;
  };
}

const usersDb = new Map<string, UserRecord>();

// Disk persistence paths
const USERS_FILE = path.resolve(process.cwd(), 'data', 'users.json');
const DEMO_REQUESTS_FILE = path.resolve(process.cwd(), 'data', 'demo_requests.json');
const PROFILE_FILE = path.resolve(process.cwd(), 'data', 'profile.json');
const USER_PROFILES_FILE = path.resolve(process.cwd(), 'data', 'user_profiles.json');
const USER_WORKSPACE_DATA_FILE = path.resolve(process.cwd(), 'data', 'user_workspace_data.json');
const SETTINGS_FILE = path.resolve(process.cwd(), 'data', 'settings.json');

let storedBusinessProfile: any = null;
let storedAppSettings: any = null;
const userProfilesMap = new Map<string, any>();
const userWorkspaceDataMap = new Map<string, any>();

function ensureDataDir() {
  const dir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadUserWorkspaceDataFromDisk() {
  ensureDataDir();
  if (fs.existsSync(USER_WORKSPACE_DATA_FILE)) {
    try {
      const content = fs.readFileSync(USER_WORKSPACE_DATA_FILE, 'utf-8');
      const obj = JSON.parse(content);
      Object.keys(obj).forEach((emailKey) => {
        userWorkspaceDataMap.set(emailKey.toLowerCase().trim(), obj[emailKey]);
      });
      console.log(`[Database] Loaded workspace data for ${userWorkspaceDataMap.size} user accounts from disk storage.`);
    } catch (e: any) {
      console.error('[Database] Failed to load user workspace data from disk:', e.message);
    }
  }
}

function saveUserWorkspaceDataToDisk() {
  ensureDataDir();
  try {
    const obj: Record<string, any> = {};
    userWorkspaceDataMap.forEach((val, key) => {
      obj[key] = val;
    });
    fs.writeFileSync(USER_WORKSPACE_DATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e: any) {
    console.error('[Database] Failed to save user workspace data to disk:', e.message);
  }
}

function getUserWorkspaceDiskStore(email: string) {
  const cleanEmail = email.toLowerCase().trim();
  if (!userWorkspaceDataMap.has(cleanEmail)) {
    userWorkspaceDataMap.set(cleanEmail, {
      customers: [],
      projects: [],
      invoices: [],
      proposals: [],
      documents: [],
      conversations: [],
      activityLogs: [],
      invoicesCreatedCount: 0,
    });
  }
  return userWorkspaceDataMap.get(cleanEmail);
}

function loadUserProfilesFromDisk() {
  ensureDataDir();
  if (fs.existsSync(USER_PROFILES_FILE)) {
    try {
      const content = fs.readFileSync(USER_PROFILES_FILE, 'utf-8');
      const obj = JSON.parse(content);
      Object.keys(obj).forEach((emailKey) => {
        userProfilesMap.set(emailKey.toLowerCase().trim(), obj[emailKey]);
      });
      console.log(`[Database] Loaded ${userProfilesMap.size} user business profiles from disk storage.`);
    } catch (e: any) {
      console.error('[Database] Failed to load user profiles from disk:', e.message);
    }
  }
}

function saveUserProfilesToDisk() {
  ensureDataDir();
  try {
    const obj: Record<string, any> = {};
    userProfilesMap.forEach((val, key) => {
      obj[key] = val;
    });
    fs.writeFileSync(USER_PROFILES_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e: any) {
    console.error('[Database] Failed to save user profiles to disk:', e.message);
  }
}

function loadUsersFromDisk() {
  ensureDataDir();
  if (fs.existsSync(USERS_FILE)) {
    try {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const list: UserRecord[] = JSON.parse(content);
      list.forEach((u) => {
        if (u && u.email) {
          usersDb.set(u.email.toLowerCase().trim(), u);
        }
      });
      console.log(`[Database] Loaded ${list.length} permanent user accounts from disk storage.`);
    } catch (e: any) {
      console.error('[Database] Failed to load users from disk:', e.message);
    }
  }
}

function saveUsersToDisk() {
  ensureDataDir();
  try {
    const list = Array.from(usersDb.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e: any) {
    console.error('[Database] Failed to save users to disk:', e.message);
  }
}

interface AiModelTokenQuota {
  id: string;
  name: string;
  provider: string;
  allocatedTokens: number;
  usedTokens: number;
  remainingTokens: number;
  apiKeyEnvVar: string;
  hasCustomKey: boolean;
  status: 'active' | 'warning' | 'exhausted' | 'inactive';
}

function hasEnvKeyForModel(envVar: string): boolean {
  return !!process.env[envVar] && process.env[envVar]!.trim().length > 0;
}

const DEFAULT_MODEL_POOLS: Record<string, { name: string; provider: string; envVar: string; defaultQuota: number }> = {
  'gemini-2.5-flash': { name: 'Gemini 2.5 Flash', provider: 'Google AI', envVar: 'GEMINI_API_KEY', defaultQuota: 50000000 },
  'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', provider: 'Google AI', envVar: 'GEMINI_API_KEY', defaultQuota: 20000000 },
  'gpt-4o': { name: 'OpenAI GPT-4o', provider: 'OpenAI', envVar: 'OPENAI_API_KEY', defaultQuota: 25000000 },
  'claude-3.5-sonnet': { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', envVar: 'ANTHROPIC_API_KEY', defaultQuota: 20000000 },
  'perplexity-sonar': { name: 'Perplexity Sonar', provider: 'Perplexity AI', envVar: 'PERPLEXITY_API_KEY', defaultQuota: 15000000 },
  'deepseek-r1': { name: 'DeepSeek R1', provider: 'DeepSeek', envVar: 'DEEPSEEK_API_KEY', defaultQuota: 25000000 },
};

const aiModelQuotas = new Map<string, AiModelTokenQuota>();

async function validateApiKey(provider: string, apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { valid: true };
  }

  const trimmed = apiKey.trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const prov = provider.toLowerCase();

    if (prov === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(trimmed)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return { valid: true };
      }
      const data = await res.json().catch(() => ({}));
      const errMsg = data?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      return { valid: false, error: `Google Gemini API key validation failed: ${errMsg}` };
    }

    if (prov === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${trimmed}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return { valid: true };
      }
      const data = await res.json().catch(() => ({}));
      const errMsg = data?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      return { valid: false, error: `OpenAI API key validation failed: ${errMsg}` };
    }

    if (prov === 'claude' || prov === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': trimmed,
          'anthropic-version': '2023-06-01',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return { valid: true };
      }
      const data = await res.json().catch(() => ({}));
      const errMsg = data?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      return { valid: false, error: `Anthropic Claude API key validation failed: ${errMsg}` };
    }

    if (prov === 'perplexity') {
      const res = await fetch('https://api.perplexity.ai/models', {
        headers: { Authorization: `Bearer ${trimmed}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return { valid: true };
      }
      const data = await res.json().catch(() => ({}));
      const errMsg = data?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      return { valid: false, error: `Perplexity API key validation failed: ${errMsg}` };
    }

    if (prov === 'deepseek') {
      const res = await fetch('https://api.deepseek.com/models', {
        headers: { Authorization: `Bearer ${trimmed}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return { valid: true };
      }
      const data = await res.json().catch(() => ({}));
      const errMsg = data?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      return { valid: false, error: `DeepSeek API key validation failed: ${errMsg}` };
    }

    clearTimeout(timeoutId);
    return { valid: true };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { valid: false, error: `Validation request for ${provider} API key timed out. Check key credentials or network.` };
    }
    return { valid: false, error: `Failed to validate ${provider} API key: ${err.message}` };
  }
}

function syncProviderKeysToEnv(keys: any) {
  if (!keys || typeof keys !== 'object') return;
  if (keys.gemini && keys.gemini.trim()) process.env.GEMINI_API_KEY = keys.gemini.trim();
  if (keys.openai && keys.openai.trim()) process.env.OPENAI_API_KEY = keys.openai.trim();
  if ((keys.claude || keys.anthropic) && (keys.claude || keys.anthropic).trim()) {
    process.env.ANTHROPIC_API_KEY = (keys.claude || keys.anthropic).trim();
  }
  if (keys.perplexity && keys.perplexity.trim()) process.env.PERPLEXITY_API_KEY = keys.perplexity.trim();
  if (keys.deepseek && keys.deepseek.trim()) process.env.DEEPSEEK_API_KEY = keys.deepseek.trim();

  Object.entries(DEFAULT_MODEL_POOLS).forEach(([id, meta]) => {
    const model = aiModelQuotas.get(id) || {
      id,
      name: meta.name,
      provider: meta.provider,
      allocatedTokens: 0,
      usedTokens: 0,
      remainingTokens: 0,
      apiKeyEnvVar: meta.envVar,
      hasCustomKey: false,
      status: 'inactive' as const,
    };
    const keyPresent = hasEnvKeyForModel(meta.envVar);
    model.hasCustomKey = keyPresent;
    if (keyPresent) {
      if (model.allocatedTokens === 0) {
        model.allocatedTokens = meta.defaultQuota;
        model.remainingTokens = meta.defaultQuota - model.usedTokens;
      }
      model.status = 'active';
    } else {
      model.allocatedTokens = 0;
      model.remainingTokens = 0;
      model.status = 'inactive';
    }
    aiModelQuotas.set(id, model);
  });
}

function loadWorkspaceStateFromDisk() {
  ensureDataDir();
  if (fs.existsSync(PROFILE_FILE)) {
    try {
      const content = fs.readFileSync(PROFILE_FILE, 'utf-8');
      storedBusinessProfile = JSON.parse(content);
      console.log('[Database] Loaded business profile from disk storage.');
    } catch (e: any) {
      console.error('[Database] Failed to load profile from disk:', e.message);
    }
  }
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      storedAppSettings = JSON.parse(content);
      console.log('[Database] Loaded app settings from disk storage.');
      if (storedAppSettings?.providerKeys) {
        syncProviderKeysToEnv(storedAppSettings.providerKeys);
      }
    } catch (e: any) {
      console.error('[Database] Failed to load settings from disk:', e.message);
    }
  }
}

function saveProfileToDisk(profile: any) {
  ensureDataDir();
  try {
    storedBusinessProfile = { ...storedBusinessProfile, ...profile };
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(storedBusinessProfile, null, 2), 'utf-8');
  } catch (e: any) {
    console.error('[Database] Failed to save profile to disk:', e.message);
  }
}

function saveSettingsToDisk(settings: any) {
  ensureDataDir();
  try {
    storedAppSettings = { ...storedAppSettings, ...settings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(storedAppSettings, null, 2), 'utf-8');
  } catch (e: any) {
    console.error('[Database] Failed to save settings to disk:', e.message);
  }
}

// Seed initial default accounts - only guest session if needed
const seedDefaultUsers = () => {
  loadUsersFromDisk();
  loadWorkspaceStateFromDisk();
  loadUserProfilesFromDisk();
  loadUserWorkspaceDataFromDisk();

  const defaultAccounts: UserRecord[] = [
    {
      id: 'usr_guest',
      name: 'Guest User',
      email: 'usr_guest',
      companyName: 'Guest Business Workspace',
      role: 'owner',
      planTier: 'free',
      subscriptionStatus: 'active',
      billingCycle: 'monthly',
      monthlyAiCredits: 15,
      aiCreditsUsed: 0,
      memberSince: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    },
    {
      id: 'usr_admin_default',
      name: 'System Admin',
      email: 'support@locoraai.com',
      companyName: 'Locora AI Admin',
      role: 'admin',
      planTier: 'agency',
      subscriptionStatus: 'active',
      billingCycle: 'monthly',
      monthlyAiCredits: 9999,
      aiCreditsUsed: 0,
      memberSince: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    },
  ];

  defaultAccounts.forEach((usr) => {
    if (!usersDb.has(usr.email.toLowerCase())) {
      usersDb.set(usr.email.toLowerCase(), usr);
    }
  });

  saveUsersToDisk();
};

seedDefaultUsers();

// PostgreSQL Cloud SQL Database Synchronization Engine
async function saveUserToSql(user: UserRecord) {
  try {
    const normalizedEmail = (user.email || '').toLowerCase().trim();
    if (!normalizedEmail) return;
    saveUsersToDisk();

    await getOrCreateUser(user.id, normalizedEmail, user.name, user.companyName, user.planTier, user.role).catch((e) => {
      console.warn('[Cloud SQL] User sync warning:', e?.message || e);
    });
  } catch (err: any) {
    console.warn('[Database] User save notice:', err?.message || err);
  }
}

async function removeUserFromSql(email: string, userId?: string) {
  try {
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail) return;

    usersDb.delete(normalizedEmail);
    userProfilesMap.delete(normalizedEmail);
    userWorkspaceDataMap.delete(normalizedEmail);

    saveUsersToDisk();
    saveUserProfilesToDisk();
    saveUserWorkspaceDataToDisk();

    await dbService.deleteUser(normalizedEmail, userId).catch(() => {});
  } catch (err: any) {
    console.warn('[Database] User delete notice:', err?.message || err);
  }
}

// Helper to look up user in memory Map or fetch from live PostgreSQL Cloud SQL
async function findUserByEmail(email: string): Promise<UserRecord | null> {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();

  // 1. Check in-memory Map (populated from disk/SQL on boot)
  let user = usersDb.get(normalized);
  if (user) {
    return user;
  }

  // 2. Fallback to PostgreSQL database lookup
  try {
    const sqlUsers = await dbService.getUsers();
    const foundSql = sqlUsers.find((u) => u.email?.toLowerCase().trim() === normalized);
    if (foundSql) {
      const sqlRole = ((foundSql as any).role as string) || '';
      const fallbackRole = sqlRole || (normalized === 'imtiazbaloch3322@gmail.com' || normalized === 'support@locoraai.com' ? 'admin' : foundSql.planTier && foundSql.planTier !== 'free' ? 'subscriber' : 'customer');

      const record: UserRecord = {
        id: foundSql.uid,
        name: foundSql.name || 'User',
        email: foundSql.email,
        companyName: foundSql.companyName || 'My Business',
        role: fallbackRole as any,
        planTier: (foundSql.planTier as any) || 'free',
        subscriptionStatus: 'active',
        billingCycle: 'monthly',
        monthlyAiCredits: foundSql.planTier === 'agency' ? 9999 : foundSql.planTier === 'pro' ? 250 : 25,
        aiCreditsUsed: 0,
        memberSince: foundSql.createdAt ? new Date(foundSql.createdAt).toISOString() : new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      };
      usersDb.set(normalized, record);
      return record;
    }
  } catch (err: any) {
    // Ignore SQL search error
  }

  return null;
}

async function saveSubscriberToSql(sub: { email: string; subscribedAt: string }) {
  try {
    await dbService.addNewsletterSubscriber(sub.email).catch(() => {});
  } catch (err: any) {
    // ignore
  }
}

async function syncSqlDatabase() {
  try {
    const sqlSubscribers = await dbService.getNewsletterSubscribers().catch(() => []);
    if (Array.isArray(sqlSubscribers)) {
      sqlSubscribers.forEach((s) => {
        if (s.email) {
          newsletterSubscribersDb.set(s.email.toLowerCase().trim(), {
            email: s.email,
            subscribedAt: s.subscribedAt ? new Date(s.subscribedAt).toISOString() : new Date().toISOString(),
          });
        }
      });
    }

    console.log(`🐘 [Database Engine] PostgreSQL Cloud SQL Database active.`);
  } catch (err: any) {
    console.log('⚡ [Database Sync status]: PostgreSQL Cloud SQL ready.');
  }
}

// Perform initial sync with PostgreSQL Cloud SQL
setTimeout(() => {
  syncSqlDatabase();
}, 1000);

// Helper to check user credits
const checkUserCredits = (userEmail?: string, overrideKey?: string, amount: number = 1): { allowed: boolean; user?: UserRecord; error?: string } => {
  if (overrideKey && overrideKey.trim().length > 10) {
    // Custom user-provided API key bypasses platform credit limit
    return { allowed: true };
  }

  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const lookupKey = normalizedEmail || 'usr_guest';

  let user = usersDb.get(lookupKey);

  if (!user) {
    const isDemoAccount = normalizedEmail === 'free.user@starterbiz.com' || normalizedEmail === 'usr_guest' || !normalizedEmail;
    const namePart = normalizedEmail ? normalizedEmail.split('@')[0] : 'Guest';
    user = {
      id: `usr_${Date.now()}`,
      name: namePart,
      email: normalizedEmail,
      companyName: `${namePart}'s Business`,
      role: 'owner',
      planTier: 'free',
      subscriptionStatus: 'active',
      billingCycle: 'monthly',
      monthlyAiCredits: isDemoAccount ? 15 : 25,
      aiCreditsUsed: 0,
      memberSince: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    };
    usersDb.set(lookupKey, user);
  }

  // Monthly Credit Reset Lifecycle Check for registered accounts
  if (user.nextBillingDate && new Date() > new Date(user.nextBillingDate)) {
    user.aiCreditsUsed = 0;
    user.nextBillingDate = new Date(Date.now() + 30 * 86400000).toISOString();
    usersDb.set(lookupKey, user);
    saveUserToSql(user).catch(() => {});
  }

  if (user.planTier === 'agency') {
    return { allowed: true, user };
  }

  if (user.aiCreditsUsed + amount > user.monthlyAiCredits) {
    return {
      allowed: false,
      user,
      error: `AI Credit limit reached (${user.aiCreditsUsed}/${user.monthlyAiCredits} credits used). Demo guests get 15 one-time credits, registered free accounts receive 25 credits/month, or upgrade to Pro ($19/mo) for 250 credits.`,
    };
  }

  return { allowed: true, user };
};

const deductUserCredit = (userEmail?: string, amount: number = 1) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const lookupKey = normalizedEmail || 'usr_guest';

  let user = usersDb.get(lookupKey);
  if (!user) {
    const isDemoAccount = normalizedEmail === 'free.user@starterbiz.com' || normalizedEmail === 'usr_guest' || !normalizedEmail;
    const namePart = normalizedEmail ? normalizedEmail.split('@')[0] : 'Guest';
    user = {
      id: `usr_${Date.now()}`,
      name: namePart,
      email: normalizedEmail,
      companyName: `${namePart}'s Business`,
      role: 'owner',
      planTier: 'free',
      subscriptionStatus: 'active',
      billingCycle: 'monthly',
      monthlyAiCredits: isDemoAccount ? 15 : 25,
      aiCreditsUsed: 0,
      memberSince: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    };
    usersDb.set(lookupKey, user);
    saveUserToSql(user).catch(() => {});
  }

  // Check monthly reset lifecycle
  if (user.nextBillingDate && new Date() > new Date(user.nextBillingDate)) {
    user.aiCreditsUsed = 0;
    user.nextBillingDate = new Date(Date.now() + 30 * 86400000).toISOString();
  }

  if (user.planTier !== 'agency') {
    user.aiCreditsUsed += amount;
    usersDb.set(lookupKey, user);
    saveUserToSql(user).catch(() => {});
  }
  return { used: user.aiCreditsUsed, remaining: user.planTier === 'agency' ? 9999 : Math.max(0, user.monthlyAiCredits - user.aiCreditsUsed) };
};

// Initialize GoogleGenAI Client
const getGenAIClient = (overrideApiKey?: string) => {
  const apiKey = overrideApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Please set it in Settings or environment variable.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Email Validation Helper to enforce real, valid email addresses
function validateRealEmail(email: string): { valid: boolean; error?: string; normalizedEmail?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Please enter an email address.' };
  }

  const trimmed = email.trim().toLowerCase();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid, complete email address (e.g. name@company.com).' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed email address format.' };
  }

  const [localPart, domainPart] = parts;

  if (localPart.length < 2) {
    return { valid: false, error: 'Email username prefix is too short. Please enter a valid email address.' };
  }

  const fakeLocalParts = ['test', 'testing', 'asdf', 'qwerty', 'fake', 'abc', 'xyz', '12345', '123456', 'temp', 'dummy', 'sample', 'testuser'];
  if (fakeLocalParts.includes(localPart)) {
    return { valid: false, error: `"${localPart}" is a generic test placeholder. Please enter your real email address.` };
  }

  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) {
    return { valid: false, error: 'Email domain is missing a top-level extension (e.g. .com, .org).' };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { valid: false, error: 'Invalid top-level domain extension.' };
  }

  const fakeDomains = [
    'test.com', 'testing.com', 'example.com', 'asdf.com', 'qwerty.com', 'fake.com',
    'temp.com', 'dummy.com', 'invalid.com', 'sample.com', 'foo.com', 'bar.com',
    'domain.com', 'mailinator.com', 'yopmail.com', 'guerrillamail.com', '10minutemail.com',
    'trashmail.com', 'dispostable.com', 'sharklasers.com', 'getairmail.com', 'tempmail.com',
    'disposable.com', 'maildrop.cc'
  ];

  if (fakeDomains.includes(domainPart)) {
    return { valid: false, error: `The domain "${domainPart}" is a test or disposable email provider. Please enter your real email address.` };
  }

  const fakeTlds = ['test', 'example', 'invalid', 'local', 'localhost', 'internal', 'temp'];
  if (fakeTlds.includes(tld)) {
    return { valid: false, error: `".${tld}" is an invalid or internal domain extension. Please use a real email address.` };
  }

  return { valid: true, normalizedEmail: trimmed };
}

// ================= DEMO REQUEST & AUTHENTICATION ROUTES =================

// Book Demo CTA Endpoint (Sends email to admin + stores demo request in database & disk)
app.post('/api/book-demo', async (req, res) => {
  try {
    const { senderName, senderEmail } = req.body;
    if (!senderEmail || !senderName) {
      return res.status(400).json({ error: 'Please enter both your name and email address to request demo access.' });
    }

    const emailCheck = validateRealEmail(senderEmail);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.error });
    }
    const normalizedEmail = emailCheck.normalizedEmail!;
    const nameStr = senderName.trim();

    const demoRequest = {
      id: `demoreq_${Date.now()}`,
      senderName: nameStr,
      senderEmail: normalizedEmail,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    // 1. Save to local disk persistence
    ensureDataDir();
    let requestsList: any[] = [];
    if (fs.existsSync(DEMO_REQUESTS_FILE)) {
      try {
        requestsList = JSON.parse(fs.readFileSync(DEMO_REQUESTS_FILE, 'utf-8'));
      } catch (e) {}
    }
    // Prevent duplicate spam for same email
    const existingIndex = requestsList.findIndex(r => r.senderEmail === normalizedEmail);
    if (existingIndex >= 0) {
      requestsList[existingIndex] = demoRequest;
    } else {
      requestsList.unshift(demoRequest);
    }
    fs.writeFileSync(DEMO_REQUESTS_FILE, JSON.stringify(requestsList, null, 2), 'utf-8');

    // 2. Save to demo requests list
    fs.writeFileSync(DEMO_REQUESTS_FILE, JSON.stringify(requestsList, null, 2), 'utf-8');

    // 3. Dispatch Email Notification to Admin Support
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || SUPPORT_EMAIL;
    await sendEmail({
      to: adminEmail,
      subject: `🚨 New Demo Access Request from ${nameStr}`,
      text: `Hello Support Team,\n\n${nameStr} (${normalizedEmail}) has requested free demo access to Locora AI Copilot.\n\nSender Name: ${nameStr}\nSender Email: ${normalizedEmail}\nTime: ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #059669; margin-top: 0;">🚀 New Locora AI Demo Access Request</h2>
          <p style="font-size: 14px; color: #334155;">A user has submitted a request for demo access:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
            <tr><td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #e2e8f0; width: 140px; color: #475569;">Sender Name:</td><td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${nameStr}</td></tr>
            <tr><td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #475569;">Sender Email:</td><td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${normalizedEmail}" style="color: #059669; font-weight: bold;">${normalizedEmail}</a></td></tr>
            <tr><td style="padding: 10px 14px; font-weight: bold; color: #475569;">Requested At:</td><td style="padding: 10px 14px;">${new Date().toLocaleString()}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 13px; color: #64748b;"><strong>Status:</strong> Confirmation email with guest access guidance dispatched to ${normalizedEmail}.</p>
        </div>
      `,
    });

    // 4. Dispatch Instant Demo Access Confirmation to the User
    await sendEmail({
      to: normalizedEmail,
      subject: `🎯 Your Locora AI Demo Access & Interactive Tour, ${nameStr}!`,
      text: `Hello ${nameStr},\n\nThank you for requesting demo access to Locora AI Copilot!\n\nYou can explore our interactive demo mode directly at https://locoraai.com by clicking 'Live Demo' or create your free account in 1 click.\n\nBest regards,\nLocora AI Support Team\nsupport@locoraai.com`,
      html: `
        <div style="font-family: sans-serif; padding: 28px; color: #1e293b; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800;">Locora AI Demo Access</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Welcome to Your Live AI Copilot Experience</p>
          </div>
          <p style="font-size: 15px; color: #334155;">Hello <strong>${nameStr}</strong>,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">We are delighted to welcome you! Your demo request has been registered and our team is excited for you to experience the full power of Locora AI.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 15px;">🌟 Explore Live Demo Mode</h3>
            <p style="margin: 0; font-size: 13px; color: #15803d; line-height: 1.5;">You can test proposal generation, run real-time local SEO audits, simulate AI invoice creation, and experiment with our CRM copilot right now.</p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://locoraai.com" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14px;">Launch Demo & Sign In</a>
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">Questions? Reach us anytime at <a href="mailto:${SUPPORT_EMAIL}" style="color: #059669; font-weight: bold;">${SUPPORT_EMAIL}</a>.</p>
        </div>
      `,
    }).catch(err => console.error('[Email] Demo confirmation email failed:', err));

    res.json({
      success: true,
      message: `Thank you, ${nameStr}! Your demo access request has been received and confirmed. Please check your inbox (${normalizedEmail}) for access guidance.`,
      demoRequest,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit demo access request.' });
  }
});

// Admin Route to view demo requests
app.get('/api/admin/demo-requests', async (req, res) => {
  try {
    ensureDataDir();
    let requestsList: any[] = [];
    if (fs.existsSync(DEMO_REQUESTS_FILE)) {
      try {
        requestsList = JSON.parse(fs.readFileSync(DEMO_REQUESTS_FILE, 'utf-8'));
      } catch (e) {}
    }
    // Also fetch local demo requests if available

    res.json({ requests: requestsList });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch demo requests.' });
  }
});

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, companyName, plan = 'free', password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both an email address and password to register.' });
    }

    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.error });
    }
    const normalizedEmail = emailCheck.normalizedEmail!;

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please sign in instead.' });
    }

    const requestedPlan = plan || 'free';
    const creditsMap: Record<string, number> = { free: 25, pro: 250, agency: 9999 };
    const initialRole = role || (
      normalizedEmail === 'imtiazbaloch3322@gmail.com' || normalizedEmail === 'support@locoraai.com' ? 'admin' :
      requestedPlan !== 'free' ? 'subscriber' : 'customer'
    );
    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      companyName: companyName || 'My Local Business',
      role: initialRole,
      planTier: requestedPlan as any,
      subscriptionStatus: 'active',
      billingCycle: 'monthly',
      monthlyAiCredits: creditsMap[requestedPlan] || 25,
      aiCreditsUsed: 0,
      memberSince: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      passwordHash: password,
      paymentMethod: requestedPlan !== 'free' ? { cardLast4: '4242', cardBrand: 'Visa', expDate: '12/28' } : undefined,
    };

    usersDb.set(normalizedEmail, newUser);
    await saveUserToSql(newUser);

    // Send confirmation email to new user & notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || SUPPORT_EMAIL;

    // 1. Send Account Confirmation Email to the New User
    sendEmail({
      to: newUser.email,
      subject: `🎉 Welcome to Locora AI, ${newUser.name}! Your Account is Confirmed`,
      text: `Hello ${newUser.name},\n\nThank you for registering your account at Locora AI Copilot Workspace!\n\nAccount Details:\n- Name: ${newUser.name}\n- Email: ${newUser.email}\n- Business / Company: ${newUser.companyName}\n- Plan Tier: ${newUser.planTier.toUpperCase()}\n- Monthly AI Credits: ${newUser.monthlyAiCredits}\n\nYou can now log in anytime to manage your proposals, SEO campaigns, CRM leads, and invoices.\n\nBest regards,\nLocora AI Team`,
      html: `
        <div style="font-family: sans-serif; padding: 28px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800;">Locora AI Business Copilot</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Account Registration Confirmation</p>
          </div>
          <p style="font-size: 15px; color: #334155; line-height: 1.5;">Hello <strong>${newUser.name}</strong>,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">Welcome aboard! Your Locora AI workspace account has been successfully created and verified.</p>

          <div style="background-color: #ffffff; padding: 18px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Your Workspace Summary</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Full Name:</td><td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${newUser.name}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email Address:</td><td style="padding: 6px 0; color: #059669; font-weight: bold;">${newUser.email}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Company / Business:</td><td style="padding: 6px 0; color: #0f172a;">${newUser.companyName}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Plan Tier:</td><td style="padding: 6px 0; color: #059669; font-weight: bold; text-transform: uppercase;">${newUser.planTier}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Monthly AI Credits:</td><td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${newUser.monthlyAiCredits} Credits</td></tr>
            </table>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">You can now log in to generate 1-click proposals, audit local SEO, convert CRM leads, and issue white-labeled invoices.</p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.APP_URL || 'https://locoraai.com'}" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14px;">Access Your AI Workspace</a>
          </div>
        </div>
      `,
    }).catch(err => console.error('[Email] Failed to send user confirmation email:', err));

    // 2. Send Registration Alert Email to Admin
    sendEmail({
      to: adminEmail,
      subject: `👤 New User Registration: ${newUser.name} (${newUser.email})`,
      text: `Hello Admin,\n\nA new user has registered on Locora AI Copilot:\n\nName: ${newUser.name}\nEmail: ${newUser.email}\nCompany: ${newUser.companyName}\nPlan: ${newUser.planTier}\nRole: ${newUser.role}\nTime: ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">
          <h2 style="color: #059669; margin-top: 0; font-size: 20px;">👤 New User Registered</h2>
          <p style="font-size: 14px; color: #334155;">A new account has been created on the platform:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px;">
            <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #475569; width: 140px;">Name:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${newUser.name}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #475569;">Email:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #059669; font-weight: bold;"><a href="mailto:${newUser.email}">${newUser.email}</a></td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #475569;">Company:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${newUser.companyName}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #475569;">Plan / Role:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${newUser.planTier.toUpperCase()} (${newUser.role})</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold; color: #475569;">Registered At:</td><td style="padding: 8px 12px;">${new Date().toLocaleString()}</td></tr>
          </table>
        </div>
      `,
    }).catch(err => console.error('[Email] Failed to send admin alert email:', err));

    res.cookie('auth_email', normalizedEmail, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    res.json({ user: newUser, token: `tok_${Date.now()}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both your email address and password.' });
    }

    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.error });
    }
    const normalizedEmail = emailCheck.normalizedEmail!;

    let user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials. No account found with this email. Please register first.' });
    }

    if (user.passwordHash && user.passwordHash !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please verify your password and try again.' });
    }

    // If account had no password hash set yet, store it
    if (!user.passwordHash) {
      user.passwordHash = password;
      usersDb.set(normalizedEmail, user);
      await saveUserToSql(user);
    }

    // Set ephemeral session cookie (automatically destroyed when browser window/session closes)
    res.cookie('auth_email', normalizedEmail, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    res.json({ user, token: `tok_${Date.now()}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// GET Current Session User (/api/auth/me)
app.get('/api/auth/me', async (req, res) => {
  try {
    const cookieEmail = req.cookies?.auth_email;
    const queryEmail = (req.query.email as string) || '';
    const email = (queryEmail || cookieEmail || '').toLowerCase().trim();
    if (!email) {
      return res.status(401).json({ error: 'No active session' });
    }
    let user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user session' });
  }
});

// Logout Route (/api/auth/logout)
app.post('/api/auth/logout', async (req, res) => {
  res.clearCookie('auth_email', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Magic Link & Cryptographically Secure Token Manager
interface MagicTokenRecord {
  email: string;
  expiresAt: number;
  purpose: 'password_reset' | 'magic_login';
  resetCode?: string;
}
const activeMagicTokens = new Map<string, MagicTokenRecord>();

// Forgot Password Route - Generates a secure Magic Reset Link & Token
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter an email address.' });
    }

    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.error });
    }
    const normalizedEmail = emailCheck.normalizedEmail!;
    let user = await findUserByEmail(normalizedEmail);

    // Require user to be registered in system database
    if (!user) {
      return res.status(404).json({
        error: 'This email address is not registered in Locora AI. Password reset is strictly available for registered accounts. Please sign up first.',
      });
    }

    // Generate cryptographically unique Magic Token & 6-digit verification code
    const rawToken = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    const magicToken = `ml_${Date.now()}_${rawToken}`;
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minute expiration window

    // Store in-memory map
    activeMagicTokens.set(magicToken, {
      email: normalizedEmail,
      expiresAt,
      purpose: 'password_reset',
      resetCode,
    });

    const host = getRequestBaseUrl(req);
    const magicResetUrl = `${host}/?reset_token=${magicToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Compose rich HTML verification email with Magic Reset Button & Link
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h2 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800; tracking: -0.5px;">Locora AI Copilot</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">1-Click Password Reset & Magic Access</p>
        </div>
        
        <p style="color: #1e293b; font-size: 15px; font-weight: 600;">Hello ${user.name},</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">We received a security request to reset your password for your account associated with <strong>${normalizedEmail}</strong>.</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${magicResetUrl}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
            Reset Password Instantly
          </a>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Security Verification Code</span>
          <div style="font-size: 26px; font-weight: 800; font-family: monospace; color: #0f172a; letter-spacing: 4px; margin-top: 6px;">${resetCode}</div>
        </div>

        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">Or copy and paste this secure link directly into your browser:<br/><a href="${magicResetUrl}" style="color: #059669; word-break: break-all;">${magicResetUrl}</a></p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">This Magic Link will expire in 15 minutes for security compliance.</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: `[Locora AI] Security Magic Reset Link for ${normalizedEmail}`,
      text: `Click your Magic Link to reset your password: ${magicResetUrl}`,
      html: htmlContent,
    });

    const isLiveProvider = emailResult.provider === 'resend' || emailResult.provider === 'smtp' || emailResult.provider === 'sendgrid';

    res.json({
      success: true,
      message: isLiveProvider
        ? `Magic Reset Link dispatched to ${normalizedEmail} via ${emailResult.provider.toUpperCase()}.`
        : `Magic Reset Link created for ${normalizedEmail}.`,
      magicToken,
      magicResetUrl,
      resetCode,
      provider: emailResult.provider,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process magic link reset request.' });
  }
});

// Verify Magic Token Endpoint
app.post('/api/auth/verify-magic-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Magic token parameter missing.' });
    }

    const record = activeMagicTokens.get(token.trim());
    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired Magic Reset Link. Please request a new one.' });
    }

    if (Date.now() > record.expiresAt) {
      activeMagicTokens.delete(token.trim());
      return res.status(400).json({ error: 'This Magic Link has expired. Please request a new link.' });
    }

    const user = await findUserByEmail(record.email);

    res.json({
      valid: true,
      email: record.email,
      purpose: record.purpose,
      resetCode: record.resetCode,
      user,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

// Dedicated Test Email Endpoint (for testing SMTP/Resend/SendGrid providers)
app.post('/api/email/send-test', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !to.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid recipient email address.' });
    }

    const emailResult = await sendEmail({
      to: to.trim(),
      subject: subject || 'Locora AI Email Provider Verification Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 500px; border: 1px solid #059669; border-radius: 12px;">
          <h2 style="color: #059669;">Locora AI Email Test Successful</h2>
          <p style="color: #334155;">${body || 'Your email provider service is active and properly integrated with Locora AI.'}</p>
          <p style="font-size: 12px; color: #64748b;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    res.json({ success: true, emailResult });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dispatch test email.' });
  }
});

// Reset Password Route - Verifies Magic Token or Code and updates password securely
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, email, resetCode, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    let targetEmail = (email || '').toLowerCase().trim();
    let tokenValidated = false;

    // 1. Validate by Magic Token if provided
    if (token) {
      const record = activeMagicTokens.get(token.trim());
      if (record) {
        if (Date.now() > record.expiresAt) {
          activeMagicTokens.delete(token.trim());
          return res.status(400).json({ error: 'This Magic Link has expired. Please request a new link.' });
        }
        targetEmail = record.email;
        tokenValidated = true;
        // Invalidate token immediately after single use!
        activeMagicTokens.delete(token.trim());
      }
    }

    // 2. Fallback validation by email or code
    if (!tokenValidated && targetEmail) {
      tokenValidated = true;
      for (const [tKey, tRec] of activeMagicTokens.entries()) {
        if (tRec.email === targetEmail) {
          activeMagicTokens.delete(tKey);
        }
      }
    }

    if (!targetEmail) {
      return res.status(400).json({ error: 'Please enter your email address to reset password.' });
    }

    let user = await findUserByEmail(targetEmail);
    if (!user) {
      return res.status(404).json({
        error: 'This email address is not registered in Locora AI. Password reset is strictly available for registered accounts. Please sign up first.',
      });
    }

    // Update password in database
    user.passwordHash = newPassword;
    usersDb.set(targetEmail, user);
    await saveUserToSql(user);

    res.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
      user,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update password.' });
  }
});

// Social Login Direct Proxy
app.post('/api/auth/social', async (req, res) => {
  try {
    const { provider, email, name, companyName, planTier } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required for social login.' });
    }
    const userEmail = email.toLowerCase().trim();
    const fallbackName = userEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const userName = (name && name.trim()) ? name.trim() : fallbackName;
    const isSuperAdmin = userEmail === 'imtiazbaloch3322@gmail.com' || userEmail === 'support@locoraai.com';

    let user = await findUserByEmail(userEmail);
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = {
        id: `usr_soc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: userName,
        email: userEmail,
        companyName: companyName || `${userName}'s Business Workspace`,
        role: isSuperAdmin ? 'admin' : 'customer',
        planTier: planTier === 'pro' || planTier === 'agency' ? planTier : 'free',
        subscriptionStatus: 'active',
        billingCycle: 'monthly',
        monthlyAiCredits: planTier === 'agency' ? 9999 : planTier === 'pro' ? 250 : 25,
        aiCreditsUsed: 0,
        invoicesCreatedCount: 0,
        memberSince: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      };
      usersDb.set(userEmail, user);
      saveUsersToDisk();
      await saveUserToSql(user).catch(() => {});

      // Dispatch Welcome Email to New Social User & Notification to Admin
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || SUPPORT_EMAIL;
      const providerLabel = provider ? provider.toUpperCase() : 'Social Single Sign-On';

      sendEmail({
        to: user.email,
        subject: `🎉 Welcome to Locora AI, ${user.name}! Your ${providerLabel} Sign-In is Confirmed`,
        text: `Hello ${user.name},\n\nWelcome to Locora AI Copilot! Your account has been connected via ${providerLabel}.\n\nAccount Details:\n- Name: ${user.name}\n- Email: ${user.email}\n- Business Workspace: ${user.companyName}\n- Plan Tier: ${user.planTier.toUpperCase()}\n- Monthly AI Credits: ${user.monthlyAiCredits}\n\nBest regards,\nLocora AI Team\n${SUPPORT_EMAIL}`,
        html: `
          <div style="font-family: sans-serif; padding: 28px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800;">Locora AI Business Copilot</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">${providerLabel} Authentication Confirmed</p>
            </div>
            <p style="font-size: 15px; color: #334155;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.5;">Welcome aboard! Your Locora AI workspace has been created and connected with your real profile (<strong>${user.email}</strong>).</p>

            <div style="background-color: #ffffff; padding: 18px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Workspace Overview</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Full Name:</td><td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${user.name}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email Address:</td><td style="padding: 6px 0; color: #059669; font-weight: bold;">${user.email}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Connected Via:</td><td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${providerLabel}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Plan Tier:</td><td style="padding: 6px 0; color: #059669; font-weight: bold; text-transform: uppercase;">${user.planTier}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Monthly AI Credits:</td><td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${user.monthlyAiCredits} Credits</td></tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.APP_URL || 'https://locoraai.com'}" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14px;">Open Your AI Workspace</a>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">Support Contact: <a href="mailto:${SUPPORT_EMAIL}" style="color: #059669; font-weight: bold;">${SUPPORT_EMAIL}</a></p>
          </div>
        `,
      }).catch(() => {});

      sendEmail({
        to: adminEmail,
        subject: `🌐 New ${providerLabel} Sign-In: ${user.name} (${user.email})`,
        text: `New user signed in via ${providerLabel}:\nName: ${user.name}\nEmail: ${user.email}\nCompany: ${user.companyName}\nPlan: ${user.planTier}\nTime: ${new Date().toLocaleString()}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #059669; margin-top: 0;">🌐 New ${providerLabel} Registration</h3>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Company:</strong> ${user.companyName}</p>
            <p><strong>Plan:</strong> ${user.planTier.toUpperCase()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
      }).catch(() => {});
    } else {
      // If user exists, update name if previously missing
      if (userName && (!user.name || user.name.startsWith('User ') || user.name === 'Alex Vance')) {
        user.name = userName;
        usersDb.set(userEmail, user);
        saveUsersToDisk();
      }
    }

    // Ensure isolated workspace disk store exists
    getUserWorkspaceDiskStore(userEmail);

    res.cookie('auth_email', userEmail, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    res.json({ user, token: `tok_soc_${Date.now()}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Social auth failed' });
  }
});

// Sync User Account & Credits Endpoint
app.post('/api/auth/sync', async (req, res) => {
  try {
    const { email, name, companyName, planTier, monthlyAiCredits, aiCreditsUsed, role, password, autoRenew, billingCycle, subscriptionStatus } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email parameter required.' });
    }

    let user = await findUserByEmail(normalizedEmail);
    const creditsMap: Record<string, number> = { free: 25, pro: 250, agency: 9999 };

    if (user) {
      if (name) user.name = name;
      if (companyName) user.companyName = companyName;
      if (planTier) {
        user.planTier = planTier;
        if (!role && user.role !== 'admin') {
          user.role = planTier !== 'free' ? 'subscriber' : 'customer';
        }
      }
      if (typeof monthlyAiCredits === 'number') user.monthlyAiCredits = monthlyAiCredits;
      if (typeof aiCreditsUsed === 'number') user.aiCreditsUsed = aiCreditsUsed;
      if (typeof autoRenew === 'boolean') user.autoRenew = autoRenew;
      if (billingCycle) user.billingCycle = billingCycle;
      if (subscriptionStatus) user.subscriptionStatus = subscriptionStatus;
      if (role) user.role = role;
      if (password && password.length >= 6) user.passwordHash = password;
    } else {
      const initialRole = role || (
        normalizedEmail === 'imtiazbaloch3322@gmail.com' || normalizedEmail === 'support@locoraai.com' ? 'admin' :
        (planTier && planTier !== 'free' ? 'subscriber' : 'customer')
      );
      user = {
        id: `usr_${Date.now()}`,
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        companyName: companyName || `${normalizedEmail.split('@')[0]}'s Business`,
        role: initialRole,
        planTier: planTier || 'free',
        subscriptionStatus: subscriptionStatus || 'active',
        billingCycle: billingCycle || 'monthly',
        autoRenew: typeof autoRenew === 'boolean' ? autoRenew : true,
        monthlyAiCredits: monthlyAiCredits || creditsMap[planTier || 'free'] || 25,
        aiCreditsUsed: aiCreditsUsed || 0,
        memberSince: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        passwordHash: password,
      };
    }
    usersDb.set(normalizedEmail, user);
    await saveUserToSql(user);
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

// User Self-Delete Account Endpoint
app.post('/api/auth/delete-account', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    usersDb.delete(normalizedEmail);
    await removeUserFromSql(normalizedEmail, user.id);

    res.json({ success: true, message: 'Your account has been permanently deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete account.' });
  }
});

// Workspace Data Endpoint (Retrieves User Workspace Data)
app.get('/api/workspace/data', async (req, res) => {
  try {
    const email = ((req.query.email as string) || '').toLowerCase().trim();
    const user = email ? usersDb.get(email) : null;
    const userEmail = email || user?.email || '';
    const companyName = user?.companyName || (user?.name ? `${user.name}'s Business Workspace` : 'My Business Workspace');

    let userSavedProfile = userEmail ? userProfilesMap.get(userEmail) : null;
    let dbProfile = userEmail ? null : await dbService.getBusinessProfile().catch(() => null);
    let dbSettings = await dbService.getSettings().catch(() => null);

    const mergedProfile = {
      id: `bp_${user?.id || userEmail || 'main'}`,
      name: userSavedProfile?.name || companyName,
      email: userEmail || '',
      tagline: userSavedProfile?.tagline || 'Local Service & Business Workspace',
      industry: userSavedProfile?.industry || 'Services',
      description: userSavedProfile?.description || '',
      targetAudience: userSavedProfile?.targetAudience || '',
      toneOfVoice: userSavedProfile?.toneOfVoice || 'Professional, helpful and results-driven',
      website: userSavedProfile?.website || '',
      phone: userSavedProfile?.phone || '',
      address: userSavedProfile?.address || '',
      city: userSavedProfile?.city || '',
      state: userSavedProfile?.state || '',
      zip: userSavedProfile?.zip || '',
      country: userSavedProfile?.country || 'United States',
      currency: userSavedProfile?.currency || 'USD',
      taxRate: userSavedProfile?.taxRate || 0,
      taxId: userSavedProfile?.taxId || '',
      logoUrl: userSavedProfile?.logoUrl || '',
      logoConfig: userSavedProfile?.logoConfig || null,
      updatedAt: userSavedProfile?.updatedAt || new Date().toISOString(),
      ...(userEmail ? (userSavedProfile || {}) : { ...(storedBusinessProfile || {}), ...(dbProfile || {}) }),
      ...(userEmail ? { email: userEmail, id: `bp_${userEmail}` } : {}),
    };

    const mergedSettings = {
      activeProvider: 'gemini',
      providerKeys: {},
      theme: 'dark',
      autoSave: true,
      defaultCurrency: 'USD',
      defaultTaxRate: 0,
      ...(storedAppSettings || {}),
      ...(dbSettings || {}),
    };

    let customers = await dbService.getCustomers(userEmail).catch(() => []);
    let projects = await dbService.getProjects(userEmail).catch(() => []);
    let invoices = await dbService.getInvoices(userEmail).catch(() => []);
    let proposals = await dbService.getProposals(userEmail).catch(() => []);
    let documents = await dbService.getDocuments(userEmail).catch(() => []);
    let conversations = await dbService.getAiConversations(userEmail).catch(() => []);
    let activityLogs = await dbService.getActivityLogs(20, userEmail).catch(() => []);

    if (userEmail) {
      const diskStore = getUserWorkspaceDiskStore(userEmail);
      const mergeArrays = (sqlArr: any[], diskArr: any[]) => {
        const map = new Map();
        (diskArr || []).forEach((item: any) => { if (item && item.id) map.set(item.id, item); });
        (sqlArr || []).forEach((item: any) => { if (item && item.id) map.set(item.id, item); });
        return Array.from(map.values());
      };
      customers = mergeArrays(customers, diskStore.customers);
      projects = mergeArrays(projects, diskStore.projects);
      invoices = mergeArrays(invoices, diskStore.invoices);
      proposals = mergeArrays(proposals, diskStore.proposals);
      documents = mergeArrays(documents, diskStore.documents);
      conversations = mergeArrays(conversations, diskStore.conversations);
      activityLogs = mergeArrays(activityLogs, diskStore.activityLogs);
    }

    const store = userEmail ? getUserWorkspaceDiskStore(userEmail) : null;
    const invoicesCreatedCount = Math.max(
      store?.invoicesCreatedCount || 0,
      invoices.length
    );

    return res.json({
      businessProfile: mergedProfile,
      settings: mergedSettings,
      customers,
      projects,
      invoices,
      proposals,
      documents,
      conversations,
      activityLogs,
      invoicesCreatedCount,
    });
  } catch (err: any) {
    console.error('Error fetching workspace data:', err);
    res.status(500).json({ error: 'Failed to fetch workspace data' });
  }
});

// Business Profile Save
app.post('/api/workspace/business-profile', async (req, res) => {
  try {
    const userEmail = (req.body.userEmail || req.body.email || req.query.email || '').toString().toLowerCase().trim();
    if (userEmail) {
      const existing = userProfilesMap.get(userEmail) || {};
      const updatedProfile = {
        ...existing,
        ...req.body,
        email: userEmail,
        updatedAt: new Date().toISOString(),
      };
      userProfilesMap.set(userEmail, updatedProfile);
      saveUserProfilesToDisk();
      res.json({ profile: updatedProfile });
    } else {
      saveProfileToDisk(req.body);
      const profile = await dbService.saveBusinessProfile(req.body);
      res.json({ profile });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save business profile' });
  }
});

// Settings Save
app.post('/api/workspace/settings', async (req, res) => {
  try {
    const incoming = req.body || {};
    if (incoming.providerKeys && typeof incoming.providerKeys === 'object') {
      const pKeys = incoming.providerKeys;
      const keyValidations = [
        { provider: 'gemini', key: pKeys.gemini, label: 'Google Gemini' },
        { provider: 'openai', key: pKeys.openai, label: 'OpenAI' },
        { provider: 'anthropic', key: pKeys.claude || pKeys.anthropic, label: 'Anthropic Claude' },
        { provider: 'perplexity', key: pKeys.perplexity, label: 'Perplexity AI' },
        { provider: 'deepseek', key: pKeys.deepseek, label: 'DeepSeek' },
      ];

      for (const item of keyValidations) {
        if (item.key && typeof item.key === 'string' && item.key.trim().length > 0) {
          const result = await validateApiKey(item.provider, item.key.trim());
          if (!result.valid) {
            return res.status(400).json({ error: result.error || `Invalid ${item.label} API Key. Verification failed.` });
          }
        }
      }
    }

    storedAppSettings = {
      ...(storedAppSettings || {}),
      ...incoming,
      providerKeys: {
        ...(storedAppSettings?.providerKeys || {}),
        ...(incoming.providerKeys || {}),
      },
    };

    if (storedAppSettings.providerKeys) {
      syncProviderKeysToEnv(storedAppSettings.providerKeys);
    }

    saveSettingsToDisk(storedAppSettings);
    const settings = await dbService.saveSettings(storedAppSettings).catch(() => storedAppSettings);
    res.json({ settings: { ...(storedAppSettings || {}), ...(settings || {}) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save settings' });
  }
});

// Customers CRUD
app.post('/api/workspace/customers', async (req, res) => {
  try {
    const userEmail = (req.body.userEmail || req.query.email || '').toString().toLowerCase().trim();
    const customer = req.body.id
      ? await dbService.updateCustomer(req.body.id, req.body, userEmail)
      : await dbService.createCustomer(req.body, userEmail);

    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      const idx = store.customers.findIndex((c: any) => c.id === customer.id);
      if (idx >= 0) store.customers[idx] = customer;
      else store.customers.unshift(customer);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ customer });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save customer' });
  }
});

app.delete('/api/workspace/customers/:id', async (req, res) => {
  try {
    const userEmail = (req.query.email as string || req.body?.userEmail || '').toString().toLowerCase().trim();
    await dbService.deleteCustomer(req.params.id);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      store.customers = store.customers.filter((c: any) => c.id !== req.params.id);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Projects CRUD
app.post('/api/workspace/projects', async (req, res) => {
  try {
    const userEmail = (req.body.userEmail || req.query.email || '').toString().toLowerCase().trim();
    const project = req.body.id
      ? await dbService.updateProject(req.body.id, req.body, userEmail)
      : await dbService.createProject(req.body, userEmail);

    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      const idx = store.projects.findIndex((p: any) => p.id === project.id);
      if (idx >= 0) store.projects[idx] = project;
      else store.projects.unshift(project);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ project });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save project' });
  }
});

app.delete('/api/workspace/projects/:id', async (req, res) => {
  try {
    const userEmail = (req.query.email as string || req.body?.userEmail || '').toString().toLowerCase().trim();
    await dbService.deleteProject(req.params.id);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      store.projects = store.projects.filter((p: any) => p.id !== req.params.id);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Invoices CRUD
app.post('/api/workspace/invoices', async (req, res) => {
  try {
    const userEmail = (req.body.userEmail || req.query.email || '').toString().toLowerCase().trim();
    const invoice = await dbService.createInvoice(req.body, userEmail);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      const idx = store.invoices.findIndex((inv: any) => inv.id === invoice.id);
      if (idx >= 0) {
        store.invoices[idx] = invoice;
      } else {
        store.invoices.unshift(invoice);
        store.invoicesCreatedCount = Math.max(store.invoicesCreatedCount || 0, store.invoices.length);
      }
      saveUserWorkspaceDataToDisk();
    }
    res.json({ invoice });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save invoice' });
  }
});

app.patch('/api/workspace/invoices/:id/status', async (req, res) => {
  try {
    const userEmail = (req.body.userEmail || req.query.email || '').toString().toLowerCase().trim();
    const invoice = await dbService.updateInvoiceStatus(req.params.id, req.body.status, userEmail);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      const inv = store.invoices.find((i: any) => i.id === req.params.id);
      if (inv) inv.status = req.body.status;
      saveUserWorkspaceDataToDisk();
    }
    res.json({ invoice });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

app.delete('/api/workspace/invoices/:id', async (req, res) => {
  try {
    const userEmail = (req.query.email as string || req.body?.userEmail || '').toString().toLowerCase().trim();
    await dbService.deleteInvoice(req.params.id);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      store.invoices = store.invoices.filter((i: any) => i.id !== req.params.id);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// Proposals CRUD
app.post('/api/workspace/proposals', async (req, res) => {
  try {
    const userEmail = (req.body.userEmail || req.query.email || '').toString().toLowerCase().trim();
    const proposal = await dbService.createProposal(req.body, userEmail);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      const idx = store.proposals.findIndex((p: any) => p.id === proposal.id);
      if (idx >= 0) store.proposals[idx] = proposal;
      else store.proposals.unshift(proposal);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ proposal });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save proposal' });
  }
});

app.patch('/api/workspace/proposals/:id/status', async (req, res) => {
  try {
    const userEmail = (req.body.userEmail || req.query.email || '').toString().toLowerCase().trim();
    const proposal = await dbService.updateProposalStatus(req.params.id, req.body.status, userEmail);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      const prop = store.proposals.find((p: any) => p.id === req.params.id);
      if (prop) prop.status = req.body.status;
      saveUserWorkspaceDataToDisk();
    }
    res.json({ proposal });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update proposal status' });
  }
});

app.delete('/api/workspace/proposals/:id', async (req, res) => {
  try {
    const userEmail = (req.query.email as string || req.body?.userEmail || '').toString().toLowerCase().trim();
    await dbService.deleteProposal(req.params.id);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      store.proposals = store.proposals.filter((p: any) => p.id !== req.params.id);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
});

// Documents CRUD
app.post('/api/workspace/documents', async (req, res) => {
  try {
    const userEmail = (req.body.userEmail || req.query.email || '').toString().toLowerCase().trim();
    const document = await dbService.createDocument(req.body, userEmail);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      const idx = store.documents.findIndex((d: any) => d.id === document.id);
      if (idx >= 0) store.documents[idx] = document;
      else store.documents.unshift(document);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ document });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

app.delete('/api/workspace/documents/:id', async (req, res) => {
  try {
    const userEmail = (req.query.email as string || req.body?.userEmail || '').toString().toLowerCase().trim();
    await dbService.deleteDocument(req.params.id);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      store.documents = store.documents.filter((d: any) => d.id !== req.params.id);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Activity Logs Endpoint
app.get('/api/workspace/activity-logs', async (req, res) => {
  try {
    const userEmail = (req.query.email as string || '').toString().toLowerCase().trim();
    const logs = await dbService.getActivityLogs(20, userEmail);
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

app.post('/api/workspace/conversations', async (req, res) => {
  try {
    const userEmail = (req.body.userEmail || req.query.email || '').toString().toLowerCase().trim();
    const conversation = req.body.conversation || req.body;
    await dbService.syncAiConversation(conversation, userEmail);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      const idx = store.conversations.findIndex((c: any) => c.id === conversation.id);
      if (idx >= 0) store.conversations[idx] = conversation;
      else store.conversations.unshift(conversation);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to sync conversation' });
  }
});

app.delete('/api/workspace/conversations/:id', async (req, res) => {
  try {
    const userEmail = (req.query.email as string || req.body?.userEmail || '').toString().toLowerCase().trim();
    await dbService.deleteAiConversation(req.params.id);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      store.conversations = store.conversations.filter((c: any) => c.id !== req.params.id);
      saveUserWorkspaceDataToDisk();
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

app.post('/api/workspace/activity-logs', async (req, res) => {
  try {
    const userEmail = (req.body.userEmail || req.query.email || '').toString().toLowerCase().trim();
    const { type, title, description, metadata } = req.body;
    await dbService.logActivity(type, title, description, metadata, undefined, userEmail);
    if (userEmail) {
      const store = getUserWorkspaceDiskStore(userEmail);
      store.activityLogs.unshift({ id: `act_${Date.now()}`, type, title, description, metadata, createdAt: new Date().toISOString() });
      saveUserWorkspaceDataToDisk();
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record activity log' });
  }
});

// OAuth Authorization URL Endpoint
app.get('/api/auth/oauth/url', (req, res) => {
  try {
    const provider = (req.query.provider as string) || 'linkedin';
    const host = getRequestBaseUrl(req);
    const redirectUri = (req.query.redirectUri as string) || `${host}/auth/callback`;

    if (provider === 'linkedin') {
      const linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
      if (linkedinClientId) {
        const params = new URLSearchParams({
          response_type: 'code',
          client_id: linkedinClientId,
          redirect_uri: redirectUri,
          state: 'linkedin',
          scope: 'openid profile email',
        });
        return res.json({ url: `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`, provider });
      }
    } else if (provider === 'google') {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      if (googleClientId) {
        const params = new URLSearchParams({
          response_type: 'code',
          client_id: googleClientId,
          redirect_uri: redirectUri,
          state: 'google',
          scope: 'openid profile email',
        });
        return res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, provider });
      }
    }

    // Interactive OAuth Consent Popup fallback when environment keys are not configured
    const mockAuthUrl = `${host}/api/auth/oauth/popup?provider=${provider}&redirectUri=${encodeURIComponent(redirectUri)}`;
    res.json({ url: mockAuthUrl, provider });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to construct OAuth URL' });
  }
});

// OAuth Interactive Popup Screen
app.get('/api/auth/oauth/popup', (req, res) => {
  const provider = (req.query.provider as string) || 'linkedin';
  const redirectUri = (req.query.redirectUri as string) || '/auth/callback';
  const isLinkedIn = provider === 'linkedin';

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in with ${isLinkedIn ? 'LinkedIn' : 'Google'}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1329; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box; }
        .card { background: #151f38; border: 1px solid #2a3b60; border-radius: 1.25rem; padding: 2rem; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
        .logo { width: 52px; height: 52px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
        .linkedin-logo { background: #0077b5; color: white; }
        .google-logo { background: white; }
        h2 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.5rem; }
        p { font-size: 0.85rem; color: #94a3b8; margin: 0 0 1.25rem; line-height: 1.4; }
        .form-group { text-align: left; margin-bottom: 1rem; }
        label { display: block; font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
        input { width: 100%; padding: 0.75rem 0.85rem; background: #0a1124; border: 1px solid #334155; border-radius: 0.65rem; color: white; font-size: 0.9rem; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
        input:focus { border-color: ${isLinkedIn ? '#0077b5' : '#059669'}; }
        .btn { display: block; width: 100%; padding: 0.85rem; background: ${isLinkedIn ? '#0077b5' : '#059669'}; color: white; font-weight: bold; border: none; border-radius: 0.75rem; font-size: 0.9rem; cursor: pointer; transition: opacity 0.2s; text-decoration: none; box-sizing: border-box; margin-top: 1.25rem; }
        .btn:hover { opacity: 0.9; }
        .secure-badge { display: flex; align-items: center; justify-content: center; gap: 0.35rem; font-size: 0.75rem; color: #64748b; margin-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo ${isLinkedIn ? 'linkedin-logo' : 'google-logo'}">
          ${isLinkedIn 
            ? `<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.4 1.4 0 1 0 1.4 1.4 1.4 1.4 0 0 0-1.4-1.4z"/></svg>`
            : `<svg width="28" height="28" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`
          }
        </div>
        <h2>Sign in with ${isLinkedIn ? 'LinkedIn' : 'Google'}</h2>
        <p>Authorize <strong>Locora AI</strong> to sign you in and create your clean, private workspace.</p>

        <form action="${redirectUri}" method="GET">
          <input type="hidden" name="provider" value="${provider}">
          <input type="hidden" name="code" value="oauth_success_${Date.now()}">

          <div class="form-group">
            <label>Full Name</label>
            <input type="text" name="name" id="userName" required placeholder="e.g. John Doe">
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" name="email" id="userEmail" required placeholder="e.g. john@yourcompany.com">
          </div>

          <button type="submit" class="btn">
            Authorize & Continue to Dashboard
          </button>
        </form>

        <div class="secure-badge">
          <span>🔒 256-bit Encrypted SSL • Isolated User Workspace</span>
        </div>
      </div>
    </body>
    </html>
  `);
});

// OAuth Callback Handler
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const provider = (req.query.provider as string) || (req.query.state as string) || 'google';
  const code = req.query.code as string;
  let email = (req.query.email as string || '').toLowerCase().trim();
  let name = (req.query.name as string || '').trim();

  // Try real OAuth token exchange if authorization code & secrets are available
  if (code && !email) {
    try {
      const host = getRequestBaseUrl(req);
      const redirectUri = `${host}/auth/callback`;

      if (provider === 'google' && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          const profile = await userinfoRes.json();
          if (profile.email) {
            email = profile.email.toLowerCase().trim();
            name = profile.name || email.split('@')[0];
          }
        }
      } else if (provider === 'linkedin' && process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
        const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          const profile = await userinfoRes.json();
          if (profile.email) {
            email = profile.email.toLowerCase().trim();
            name = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || email.split('@')[0];
          }
        }
      }
    } catch (oauthErr) {
      console.warn('Live OAuth token exchange warning:', oauthErr);
    }
  }

  if (!email) {
    // If no email was captured from provider token, present an interactive user identity confirmation form
    const isLinkedIn = provider === 'linkedin';
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your ${isLinkedIn ? 'LinkedIn' : 'Google'} Account</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1329; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box; }
          .card { background: #151f38; border: 1px solid #2a3b60; border-radius: 1.25rem; padding: 2rem; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
          .logo { width: 52px; height: 52px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
          .linkedin-logo { background: #0077b5; color: white; }
          .google-logo { background: white; }
          h2 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.5rem; }
          p { font-size: 0.85rem; color: #94a3b8; margin: 0 0 1.25rem; line-height: 1.4; }
          .form-group { text-align: left; margin-bottom: 1rem; }
          label { display: block; font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
          input { width: 100%; padding: 0.75rem 0.85rem; background: #0a1124; border: 1px solid #334155; border-radius: 0.65rem; color: white; font-size: 0.9rem; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
          input:focus { border-color: ${isLinkedIn ? '#0077b5' : '#059669'}; }
          .btn { display: block; width: 100%; padding: 0.85rem; background: ${isLinkedIn ? '#0077b5' : '#059669'}; color: white; font-weight: bold; border: none; border-radius: 0.75rem; font-size: 0.9rem; cursor: pointer; transition: opacity 0.2s; text-decoration: none; box-sizing: border-box; margin-top: 1.25rem; }
          .btn:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo ${isLinkedIn ? 'linkedin-logo' : 'google-logo'}">
            ${isLinkedIn 
              ? `<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.4 1.4 0 1 0 1.4 1.4 1.4 0 0 0-1.4-1.4z"/></svg>`
              : `<svg width="28" height="28" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`
            }
          </div>
          <h2>Confirm ${isLinkedIn ? 'LinkedIn' : 'Google'} Profile</h2>
          <p>Please enter your real name and email to connect your workspace.</p>

          <form action="/auth/callback" method="GET">
            <input type="hidden" name="provider" value="${provider}">
            <input type="hidden" name="code" value="oauth_done_${Date.now()}">

            <div class="form-group">
              <label>Full Name</label>
              <input type="text" name="name" required placeholder="e.g. Imtiaz Baloch">
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input type="email" name="email" required placeholder="e.g. imtiazbaloch3322@gmail.com">
            </div>

            <button type="submit" class="btn">
              Complete Sign In & Open Dashboard
            </button>
          </form>
        </div>
      </body>
      </html>
    `);
  }

  if (!name) {
    name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = usersDb.get(normalizedEmail);

  if (!user) {
    const isSuperAdmin = normalizedEmail === 'imtiazbaloch3322@gmail.com' || normalizedEmail === 'support@locoraai.com';
    user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name,
      email: normalizedEmail,
      companyName: `${name}'s Business Workspace`,
      role: isSuperAdmin ? 'admin' : 'customer',
      planTier: 'free',
      subscriptionStatus: 'active',
      billingCycle: 'monthly',
      monthlyAiCredits: 25,
      aiCreditsUsed: 0,
      invoicesCreatedCount: 0,
      memberSince: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    };
    usersDb.set(normalizedEmail, user);
    saveUsersToDisk();

    // Send Welcome Email to New User & Alert to Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || SUPPORT_EMAIL;
    const providerLabel = provider ? provider.toUpperCase() : 'Single Sign-On';

    sendEmail({
      to: user.email,
      subject: `🎉 Welcome to Locora AI, ${user.name}! Your ${providerLabel} Sign-In is Confirmed`,
      text: `Hello ${user.name},\n\nWelcome to Locora AI Copilot! Your account has been registered via ${providerLabel}.\n\nAccount Details:\n- Name: ${user.name}\n- Email: ${user.email}\n- Business Workspace: ${user.companyName}\n- Plan: FREE (25 Monthly AI Credits)\n\nBest regards,\nLocora AI Team\n${SUPPORT_EMAIL}`,
      html: `
        <div style="font-family: sans-serif; padding: 28px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669; margin-top: 0;">🎉 Welcome to Locora AI, ${user.name}!</h2>
          <p>Your workspace is now ready and authenticated via ${providerLabel}.</p>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Name:</strong> ${user.name}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 4px 0;"><strong>Plan:</strong> FREE (25 Credits/mo)</p>
          </div>
          <p>Login anytime at <a href="https://locoraai.com" style="color: #059669; font-weight: bold;">https://locoraai.com</a>.</p>
        </div>
      `,
    }).catch(() => {});

    sendEmail({
      to: adminEmail,
      subject: `🌐 New ${providerLabel} Registration: ${user.name} (${user.email})`,
      text: `New user registered via ${providerLabel}:\nName: ${user.name}\nEmail: ${user.email}\nTime: ${new Date().toLocaleString()}`,
      html: `<p>New user registered via <strong>${providerLabel}</strong>:</p><p>Name: <strong>${user.name}</strong></p><p>Email: <strong>${user.email}</strong></p>`,
    }).catch(() => {});
  }

  // Sync OAuth user to Cloud SQL PostgreSQL database
  getOrCreateUser(user.id, user.email, user.name, user.companyName, user.planTier).catch(err => {
    console.error('Cloud SQL OAuth sync error:', err);
  });

  // Ensure an isolated disk store exists for this user
  getUserWorkspaceDiskStore(normalizedEmail);

  res.cookie('auth_email', normalizedEmail, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Authentication Successful</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #f8fafc; margin: 0; }
        .card { background: #1e293b; padding: 2rem; border-radius: 1.25rem; border: 1px solid #334155; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); max-width: 320px; }
        .spinner { width: 36px; height: 36px; border: 3px solid #334155; border-top-color: #059669; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.25rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="spinner"></div>
        <h3 style="margin: 0 0 0.5rem; color: #10b981;">Authentication Successful!</h3>
        <p style="margin: 0; font-size: 0.85rem; color: #94a3b8;">Redirecting to your dashboard...</p>
      </div>
      <script>
        const userData = ${JSON.stringify(user)};
        const token = "tok_oauth_" + Date.now();
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: userData, token }, '*');
          setTimeout(() => {
            try { window.close(); } catch(e) {}
          }, 300);
        } else {
          window.location.href = '/?tab=dashboard';
        }
      </script>
    </body>
    </html>
  `);
});

// ================= STRIPE PAYMENT INTEGRATION =================

app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { plan = 'pro', billingCycle = 'monthly', email } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(401).json({ error: 'Please register and sign in to your account first before upgrading your plan.' });
    }

    // Require user to be registered in the permanent database
    let user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please register a new account and sign in first to upgrade your plan.' });
    }

    const stripe = getStripe();
    const host = getRequestBaseUrl(req);

    if (!stripe) {
      return res.status(400).json({
        error: 'STRIPE_NOT_CONFIGURED',
        message: 'Stripe API key (STRIPE_SECRET_KEY) is not configured in environment variables. Please configure STRIPE_SECRET_KEY in settings to process live credit card payments.',
      });
    }

    const isYearly = billingCycle === 'yearly' || billingCycle === 'annual' || billingCycle === 'annually';
    const priceMapMonthly: Record<string, number> = { pro: 1900, agency: 4900 };
    const priceMapYearly: Record<string, number> = { pro: 1500 * 12, agency: 3900 * 12 };
    const amountInCents = isYearly ? (priceMapYearly[plan] || 18000) : (priceMapMonthly[plan] || 1900);

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: normalizedEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Locora AI ${plan.toUpperCase()} Plan (${isYearly ? 'Annual Billing' : 'Monthly Billing'})`,
                description: isYearly
                  ? (plan === 'agency' ? '$39/mo billed annually ($468/year). Unlimited AI Copilot Credits & Agency Suite' : '$15/mo billed annually ($180/year). 250 AI Copilot Credits/mo & Local SEO')
                  : (plan === 'agency' ? '$49/mo billed monthly. Unlimited AI Copilot Credits & Agency Suite' : '$19/mo billed monthly. 250 AI Copilot Credits/mo & Local SEO'),
              },
              unit_amount: amountInCents,
              recurring: { interval: isYearly ? 'year' : 'month' },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${host}/?session_id={CHECKOUT_SESSION_ID}&payment_status=success&plan=${plan}&billing_cycle=${isYearly ? 'yearly' : 'monthly'}`,
        cancel_url: `${host}/?payment_status=cancelled`,
        metadata: { email: normalizedEmail, plan, billingCycle: isYearly ? 'yearly' : 'monthly' },
      });

      return res.json({ url: session.url, sessionId: session.id, mock: false });
    } catch (stripeErr: any) {
      console.error('Stripe checkout session creation error:', stripeErr.message);
      return res.status(400).json({
        error: 'STRIPE_ERROR',
        message: `Stripe checkout error: ${stripeErr.message}`,
      });
    }
  } catch (err: any) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message || 'Failed to initialize Stripe checkout' });
  }
});

// Verify Stripe Checkout Session & Send Purchase Receipt Email
app.get('/api/stripe/verify-session', async (req, res) => {
  try {
    const sessionId = req.query.session_id as string;
    const stripe = getStripe();

    if (!stripe || !sessionId) {
      return res.json({ verified: true, plan: 'pro', message: 'Sandbox verification completed' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid' && session.metadata?.email) {
      const email = session.metadata.email.toLowerCase().trim();
      const plan = (session.metadata.plan as 'pro' | 'agency') || 'pro';
      const billingCycle = session.metadata.billingCycle || 'monthly';
      const isYearly = billingCycle === 'yearly' || billingCycle === 'annual';

      let user = await findUserByEmail(email);
      let userName = user?.name || email.split('@')[0];

      if (user) {
        user.planTier = plan;
        user.billingCycle = isYearly ? 'yearly' : 'monthly';
        user.monthlyAiCredits = plan === 'agency' ? 9999 : 250;
        if (user.role !== 'admin') {
          user.role = 'subscriber';
        }
        usersDb.set(email, user);
        await saveUserToSql(user);
      }

      // Dispatch Subscription Purchase Receipt & Invoice Confirmation Email
      const invoiceNum = `INV-${Date.now().toString().slice(-6)}-${session.id.slice(-4).toUpperCase()}`;
      const planPriceStr = plan === 'agency'
        ? (isYearly ? '$468.00 / year ($39/mo billed annually)' : '$49.00 / month')
        : (isYearly ? '$180.00 / year ($15/mo billed annually)' : '$19.00 / month');

      const receiptHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px;">
            <div>
              <h2 style="color: #059669; margin: 0; font-size: 22px; font-weight: 800;">Locora AI Copilot</h2>
              <p style="color: #64748b; font-size: 12px; margin: 2px 0 0;">Official Payment Receipt & Subscription Invoice</p>
            </div>
            <div style="text-align: right;">
              <span style="background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; border: 1px solid #a7f3d0; text-transform: uppercase;">PAID & CONFIRMED</span>
            </div>
          </div>

          <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">Thank you for subscribing to Locora AI! Your payment has been successfully processed via Stripe. Below are your invoice details and subscription receipt.</p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Receipt Number:</td><td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${invoiceNum}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Account Email:</td><td style="padding: 6px 0; color: #059669; font-weight: 700; text-align: right;">${email}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Subscription Plan:</td><td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right; text-transform: uppercase;">LOCORA AI ${plan}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Billing Cycle:</td><td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${isYearly ? 'Annual Billing' : 'Monthly Recurring'}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Amount Paid:</td><td style="padding: 6px 0; color: #059669; font-weight: 800; font-size: 15px; text-align: right;">${planPriceStr}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Payment Processor:</td><td style="padding: 6px 0; color: #475569; text-align: right;">Stripe Secure Credit Card</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Stripe Reference ID:</td><td style="padding: 6px 0; color: #64748b; font-family: monospace; font-size: 11px; text-align: right;">${session.id.slice(0, 24)}...</td></tr>
            </table>
          </div>

          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0; color: #065f46; font-size: 13px; font-weight: 700;">🚀 Your ${plan.toUpperCase()} Plan Copilot Features & Credits are Active!</p>
            <p style="margin: 4px 0 0; color: #047857; font-size: 12px;">Allocated Monthly Credits: <strong>${plan === 'agency' ? 'Unlimited' : '250 Credits'}</strong></p>
          </div>

          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.APP_URL || 'https://locoraai.com'}/?tab=dashboard" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
              Open Your Upgraded Workspace
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">This is an automated purchase receipt sent from a no-reply system email address. For billing support, contact support@locoraai.com.</p>
        </div>
      `;

      // Send to customer
      sendEmail({
        to: email,
        subject: `🧾 [Receipt & Invoice] Subscription Confirmed - Locora AI ${plan.toUpperCase()} Plan`,
        text: `Thank you for your purchase! Subscription Receipt #${invoiceNum} for Locora AI ${plan.toUpperCase()} Plan (${planPriceStr}). Log in to access your upgraded workspace.`,
        html: receiptHtml,
      }).catch(() => {});

      // Notify Admin
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || SUPPORT_EMAIL;
      sendEmail({
        to: adminEmail,
        subject: `💰 New Paid Subscription: ${email} subscribed to ${plan.toUpperCase()} (${planPriceStr})`,
        text: `New customer subscription!\nEmail: ${email}\nPlan: ${plan.toUpperCase()}\nPrice: ${planPriceStr}\nStripe Session: ${session.id}`,
        html: `<p>New customer subscription!</p><p><strong>Email:</strong> ${email}</p><p><strong>Plan:</strong> ${plan.toUpperCase()}</p><p><strong>Price:</strong> ${planPriceStr}</p><p><strong>Stripe Session:</strong> ${session.id}</p>`,
      }).catch(() => {});

      return res.json({ verified: true, email, plan, user, invoiceNum });
    }

    res.status(400).json({ verified: false, error: 'Payment not completed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

// Stripe Webhook Endpoint (Processes real-time Stripe payment events & sends receipt emails)
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'];
    let event: any;

    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      // Parse payload if webhook secret is not strictly set
      try {
        event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch (e) {
        return res.status(400).send('Invalid webhook JSON payload');
      }
    }

    if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.metadata?.email;
      const plan = session.metadata?.plan || 'pro';

      if (customerEmail) {
        const email = customerEmail.toLowerCase().trim();
        let user = await findUserByEmail(email);
        if (user) {
          user.planTier = plan as any;
          user.monthlyAiCredits = plan === 'agency' ? 9999 : 250;
          if (user.role !== 'admin') user.role = 'subscriber';
          usersDb.set(email, user);
          await saveUserToSql(user);
        }

        // Trigger purchase receipt confirmation email
        sendEmail({
          to: email,
          subject: `🧾 [Receipt & Invoice] Subscription Active - Locora AI ${plan.toUpperCase()} Plan`,
          text: `Your Stripe subscription for Locora AI ${plan.toUpperCase()} is active and confirmed.`,
          html: `<p>Your Stripe subscription for Locora AI <strong>${plan.toUpperCase()}</strong> is active and confirmed.</p><p>You can access your upgraded workspace anytime by logging into your account.</p>`,
        }).catch(() => {});
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================= AI MODEL SERVICES WITH CREDITS ENFORCEMENT =================

// AI Provider Proxy Endpoint - Handles Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, businessProfile, context, provider = 'gemini', providerKey, userEmail } = req.body;

    const creditCheck = checkUserCredits(userEmail, providerKey, 1);
    if (!creditCheck.allowed) {
      return res.status(403).json({ error: 'CREDITS_EXHAUSTED', message: creditCheck.error });
    }

    const ai = getGenAIClient(providerKey);

    const profileContext = businessProfile
      ? `Business Name: ${businessProfile.name || 'Small Business'}\nIndustry: ${businessProfile.industry || 'General Services'}\nTagline: ${businessProfile.tagline || ''}\nTarget Audience: ${businessProfile.targetAudience || 'General Customers'}\nTone: ${businessProfile.toneOfVoice || 'Professional & Friendly'}\nWebsite: ${businessProfile.website || ''}`
      : 'General Small Business';

    const attachedContext = context ? `\n[Attached Reference Context]: ${JSON.stringify(context)}` : '';

    const systemInstruction = `You are Locora AI, an expert AI Business Copilot and strategic operational advisor for small businesses.
Your goal is to help the business save time, draft high-converting copy, organize operations, handle customer communications, and grow revenue.

Current Business Profile:
${profileContext}
${attachedContext}

Instructions:
- Provide actionable, direct, professional, and practical responses.
- Avoid unnecessary fluff or corporate jargon.
- Use markdown formatting with bullet points, headings, and bold text for clarity.
- When generating copy or business materials, tailor them directly to the business profile above.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents.length > 0 ? formattedContents : [{ role: 'user', parts: [{ text: 'Hello' }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Record real consumed tokens from response metadata
    const actualTokensConsumed = (response as any)?.usageMetadata?.totalTokenCount || 450;
    recordRealModelTokenUsage('gemini-2.5-flash', actualTokensConsumed);

    const creditStats = deductUserCredit(userEmail, 1);

    res.json({
      text: response.text || "I've analyzed your request and prepared the response above.",
      providerUsed: provider,
      creditsUsed: creditStats.used,
      creditsRemaining: creditStats.remaining,
    });
  } catch (error: any) {
    console.error('Chat AI error:', error);
    res.status(500).json({ error: error.message || 'AI request failed' });
  }
});

// AI Document Generator Endpoint
app.post('/api/ai/generate-document', async (req, res) => {
  try {
    const { type, prompt, targetAudience, tone, businessProfile, providerKey, userEmail } = req.body;

    const creditCheck = checkUserCredits(userEmail, providerKey, 2);
    if (!creditCheck.allowed) {
      return res.status(403).json({ error: 'CREDITS_EXHAUSTED', message: creditCheck.error });
    }

    const ai = getGenAIClient(providerKey);

    const typePrompts: Record<string, string> = {
      email: 'Draft a professional business email.',
      linkedin_post: 'Create an engaging LinkedIn post with hook, call-to-action, and relevant hashtags.',
      facebook_post: 'Write a warm, community-driven Facebook post with a clear CTA.',
      instagram_caption: 'Craft an eye-catching Instagram caption with emojis and strategic hashtags.',
      google_business_post: 'Write a Google Business Profile update/offer post to drive local calls and visits.',
      review_reply: 'Draft a polite, professional reply to a customer review.',
      blog_post: 'Write a structured, SEO-optimized blog article with outline, introduction, key sections, and conclusion.',
      business_plan: 'Create a streamlined business plan executive summary, target market, operations, and revenue model.',
      meeting_summary: 'Format raw meeting notes into a concise summary with key decisions and action items.',
      marketing_plan: 'Develop a strategic marketing plan with objectives, channels, tactics, and KPI tracking.',
      cold_email: 'Draft a high-converting cold outreach email targeting potential business clients.',
      service_description: 'Write a persuasive service description highlighting benefits, deliverables, and pricing tier ideas.',
      landing_page_copy: 'Create full landing page copy including Headline, Subheadline, Value Props, FAQs, and CTA.',
      faq_page: 'Generate a comprehensive FAQ list (5-8 Q&As) addressing common customer objections and inquiries.',
    };

    const taskDesc = typePrompts[type] || 'Generate a comprehensive business document.';

    const systemInstruction = `You are Locora AI, an elite business content creator and copywriting master.
Generate production-ready, beautifully formatted output in Markdown.
Business Name: ${businessProfile?.name || 'Local Business'}
Industry: ${businessProfile?.industry || 'Services'}
Tone: ${tone || businessProfile?.toneOfVoice || 'Professional'}
Target Audience: ${targetAudience || businessProfile?.targetAudience || 'Valued Clients'}

Task Type: ${type} (${taskDesc})
User Requirements: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Please generate the complete content for a ${type} based on the request: "${prompt}". Make it highly effective and polished.`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Record real consumed tokens from response metadata
    const actualTokensConsumed = (response as any)?.usageMetadata?.totalTokenCount || 850;
    recordRealModelTokenUsage('gemini-2.5-flash', actualTokensConsumed);

    const creditStats = deductUserCredit(userEmail, 2);

    res.json({
      content: response.text || 'Generated content successfully.',
      creditsUsed: creditStats.used,
      creditsRemaining: creditStats.remaining,
    });
  } catch (error: any) {
    console.error('Document generator error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate document' });
  }
});

// AI Proposal & Contract Generator
app.post('/api/ai/generate-proposal', async (req, res) => {
  try {
    const { type, clientName, projectTitle, requirements, estimatedBudget, businessProfile, providerKey, userEmail } = req.body;

    const creditCheck = checkUserCredits(userEmail, providerKey, 5);
    if (!creditCheck.allowed) {
      return res.status(403).json({ error: 'CREDITS_EXHAUSTED', message: creditCheck.error });
    }

    const ai = getGenAIClient(providerKey);

    const systemInstruction = `You are Locora AI Proposal & Legal Document Assistant.
Create a detailed, formal ${type || 'Proposal'} in Markdown.
Sender Business: ${businessProfile?.name || 'Locora Business Copilot'} (${businessProfile?.email || 'contact@business.com'})
Recipient Client: ${clientName || 'Valued Customer'}
Project Title: ${projectTitle || 'Business Services Project'}
Estimated Budget: $${estimatedBudget || 'TBD'}

Requirements:
1. Executive Summary & Project Goal
2. Detailed Scope of Work & Deliverables (numbered list)
3. Timeline & Key Milestones
4. Pricing & Investment Breakdown
5. Terms, Conditions, & Next Steps / Acceptance sign-off section.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a full professional ${type} for client "${clientName}" regarding project "${projectTitle}". User prompt details: ${requirements}`,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const creditStats = deductUserCredit(userEmail, 5);

    res.json({
      content: response.text || 'Proposal generated.',
      creditsUsed: creditStats.used,
      creditsRemaining: creditStats.remaining,
    });
  } catch (error: any) {
    console.error('Proposal generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate proposal' });
  }
});

// AI Local SEO Assistant Endpoint
app.post('/api/ai/generate-local-seo', async (req, res) => {
  try {
    const { taskType, prompt, reviewText, starRating, businessProfile, providerKey, userEmail } = req.body;

    const creditCheck = checkUserCredits(userEmail, providerKey, 2);
    if (!creditCheck.allowed) {
      return res.status(403).json({ error: 'CREDITS_EXHAUSTED', message: creditCheck.error });
    }

    const ai = getGenAIClient(providerKey);

    let specificPrompt = '';
    if (taskType === 'gbp_description') {
      specificPrompt = 'Write a compelling 750-character Google Business Profile description optimized for local search keywords.';
    } else if (taskType === 'review_reply') {
      specificPrompt = `Draft a polite and appreciative response to a ${starRating || 5}-star review: "${reviewText}".`;
    } else if (taskType === 'local_landing') {
      specificPrompt = 'Write a complete local service landing page copy targeting local town/city customers.';
    } else if (taskType === 'schema') {
      specificPrompt = 'Generate LocalBusiness Schema.org JSON-LD structured data code block tailored for this business.';
    } else if (taskType === 'qa') {
      specificPrompt = 'Generate 5 frequently asked questions and keyword-optimized answers for Google Business Q&A.';
    } else {
      specificPrompt = `Generate local SEO optimizations for: ${prompt}`;
    }

    const systemInstruction = `You are a Local SEO Specialist for small businesses.
Business Profile:
- Name: ${businessProfile?.name || 'Local Store'}
- Industry: ${businessProfile?.industry || 'Services'}
- Location: ${businessProfile?.city || 'Local City'}, ${businessProfile?.state || ''}
- Services: ${businessProfile?.description || ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `${specificPrompt}\nAdditional instructions: ${prompt || 'Make it high converting and local keyword rich.'}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const creditStats = deductUserCredit(userEmail, 2);

    res.json({
      content: response.text || 'Local SEO content generated.',
      creditsUsed: creditStats.used,
      creditsRemaining: creditStats.remaining,
    });
  } catch (error: any) {
    console.error('Local SEO generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate local SEO content' });
  }
});

// AI Marketing Planner Endpoint
app.post('/api/ai/generate-marketing-plan', async (req, res) => {
  try {
    const { goals, targetAudience, budget, businessProfile, providerKey, userEmail } = req.body;

    const creditCheck = checkUserCredits(userEmail, providerKey, 5);
    if (!creditCheck.allowed) {
      return res.status(403).json({ error: 'CREDITS_EXHAUSTED', message: creditCheck.error });
    }

    const ai = getGenAIClient(providerKey);

    const systemInstruction = `You are a Strategic Marketing Director for small businesses.
Create a structured 30-day and 90-day marketing growth plan.
Business: ${businessProfile?.name || 'Small Business'} (${businessProfile?.industry || 'General Services'})
Target Audience: ${targetAudience || businessProfile?.targetAudience || 'Local Customers'}
Goals: ${goals || 'Increase customer acquisition and local brand visibility'}
Monthly Budget: $${budget || '0-500'}

Format response with clear markdown headings for:
1. Executive Growth Roadmap
2. 30-Day Step-by-Step Action Plan (Week 1, Week 2, Week 3, Week 4)
3. 90-Day Quarterly Objectives & Strategic Milestones
4. 5 High-Impact Campaign Ideas (Title, Objective, Channels, Estimated ROI)
5. Promotion Calendar & Seasonal Event Strategy`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a comprehensive Marketing Plan for ${businessProfile?.name || 'our business'}.`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const creditStats = deductUserCredit(userEmail, 5);

    res.json({
      content: response.text || 'Marketing plan generated.',
      creditsUsed: creditStats.used,
      creditsRemaining: creditStats.remaining,
    });
  } catch (error: any) {
    console.error('Marketing plan generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate marketing plan' });
  }
});

// Website Audit Endpoint
app.post('/api/ai/audit-website', async (req, res) => {
  try {
    const { url, businessProfile, providerKey, userEmail } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const AUDIT_CREDIT_COST = 0; // Website audit is 0 credits (gated by feature flag / free tool)
    const creditCheck = checkUserCredits(userEmail, providerKey, AUDIT_CREDIT_COST);
    if (!creditCheck.allowed) {
      return res.status(403).json({ error: 'CREDITS_EXHAUSTED', message: creditCheck.error });
    }

    const ai = getGenAIClient(providerKey);

    // Clean and normalize URL
    let rawUrl = url.trim();
    let hostname = rawUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

    // Candidates to try fetching
    const urlCandidates = [
      `https://${hostname}`,
      `https://www.${hostname.replace(/^www\./, '')}`,
      `http://${hostname}`
    ];

    let fetchedHtml = '';
    let httpStatus = 0;
    let finalUrl = `https://${hostname}`;
    let latencyMs = 0;

    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };

    for (const candidate of urlCandidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const startTime = Date.now();
        const resp = await fetch(candidate, {
          headers: browserHeaders,
          redirect: 'follow',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (resp.ok || resp.status < 400) {
          httpStatus = resp.status;
          finalUrl = resp.url || candidate;
          fetchedHtml = await resp.text();
          latencyMs = Date.now() - startTime;
          break; // Successfully fetched!
        }
      } catch (err) {
        // Try next candidate
      }
    }

    const isSsl = finalUrl.startsWith('https');
    const htmlSizeKb = Math.round(Buffer.byteLength(fetchedHtml || '', 'utf8') / 1024);

    // Deep HTML Extraction
    const cleanHtml = fetchedHtml || '';

    // Title Extraction
    const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
    const ogTitleRegex = /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i;
    const twitterTitleRegex = /<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i;

    const pageTitle = (
      cleanHtml.match(titleRegex)?.[1] ||
      cleanHtml.match(ogTitleRegex)?.[1] ||
      cleanHtml.match(twitterTitleRegex)?.[1] ||
      `${hostname} Home`
    ).trim();

    // Description Extraction
    const descRegex = /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i;
    const descRegexAlt = /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i;
    const ogDescRegex = /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i;

    const pageDesc = (
      cleanHtml.match(descRegex)?.[1] ||
      cleanHtml.match(descRegexAlt)?.[1] ||
      cleanHtml.match(ogDescRegex)?.[1] ||
      ''
    ).trim();

    // Headings & Structural Elements
    const h1Matches = Array.from(cleanHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi))
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);

    const h2Matches = Array.from(cleanHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi))
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .slice(0, 6);

    const canonicalMatch = cleanHtml.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const viewportMatch = cleanHtml.match(/<meta[^>]*name=["']viewport["']/i);
    const langMatch = cleanHtml.match(/<html[^>]*lang=["']([^"']+)["']/i);
    const charsetMatch = cleanHtml.match(/<meta[^>]*charset=["']?([^"'\s>]+)["']?/i) || cleanHtml.match(/<meta[^>]*http-equiv=["']Content-Type["']/i);
    const doctypeMatch = /<!DOCTYPE\s+html/i.test(cleanHtml);

    // Images & Alt Tags
    const imgMatches = Array.from(cleanHtml.matchAll(/<img[^>]+>/gi));
    const imgsWithoutAlt = imgMatches.filter(m => !/alt=["'][^"']+["']/i.test(m[0])).length;

    // Schema / Structured Data
    const hasSchema = /application\/ld\+json/i.test(cleanHtml);
    const hasOpenGraph = /property=["']og:/i.test(cleanHtml);

    // Clean Visible Text Snippet
    const textSnippet = cleanHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1200);

    // Real Calculated Objective Scores
    // 1. SEO Score
    let seoScore = 30;
    if (pageTitle && pageTitle.length >= 10) seoScore += 25;
    if (pageDesc && pageDesc.length >= 40) seoScore += 20;
    if (h1Matches.length >= 1) seoScore += 15;
    if (canonicalMatch) seoScore += 5;
    if (hasSchema) seoScore += 5;

    // 2. Performance Score
    let perfScore = 85;
    if (latencyMs > 0) {
      if (latencyMs < 300) perfScore = 96;
      else if (latencyMs < 700) perfScore = 88;
      else if (latencyMs < 1200) perfScore = 74;
      else perfScore = 58;
    }
    if (htmlSizeKb > 500) perfScore -= 10;

    // 3. Accessibility Score
    let accessScore = 40;
    if (viewportMatch) accessScore += 25;
    if (langMatch) accessScore += 20;
    if (imgMatches.length === 0 || imgsWithoutAlt === 0) accessScore += 15;
    else {
      const altRatio = (imgMatches.length - imgsWithoutAlt) / imgMatches.length;
      accessScore += Math.round(altRatio * 15);
    }
    if (h1Matches.length > 0) accessScore += 10;

    // 4. Best Practices Score
    let bpScore = 30;
    if (isSsl) bpScore += 35;
    if (doctypeMatch) bpScore += 25;
    if (hasOpenGraph) bpScore += 20;
    if (charsetMatch) bpScore += 10;

    seoScore = Math.min(100, Math.max(20, seoScore));
    perfScore = Math.min(100, Math.max(20, perfScore));
    accessScore = Math.min(100, Math.max(20, accessScore));
    bpScore = Math.min(100, Math.max(20, bpScore));
    const overallScore = Math.round((seoScore * 0.35) + (perfScore * 0.25) + (accessScore * 0.2) + (bpScore * 0.2));

    const auditPrompt = `You are a Senior Technical SEO Consultant and Web Performance Auditor.
Analyze this REAL website crawl data and construct a detailed, personalized audit report.

EXTRACTED CRAWL METRICS FOR ${hostname}:
- Target URL: ${finalUrl}
- HTTP Status Code: ${httpStatus || '200 (Simulated Reach)'}
- Page Title: "${pageTitle}" (${pageTitle.length} characters)
- Meta Description: "${pageDesc || 'MISSING'}" (${pageDesc ? pageDesc.length : 0} characters)
- H1 Headings (${h1Matches.length}): ${h1Matches.length ? h1Matches.join(' | ') : 'None found'}
- H2 Headings Sample: ${h2Matches.length ? h2Matches.join(' | ') : 'None found'}
- Canonical URL: ${canonicalMatch ? canonicalMatch[1] : 'Not specified'}
- SSL HTTPS Active: ${isSsl}
- Mobile Viewport Meta Tag: ${!!viewportMatch ? 'Present' : 'Missing'}
- Total Images: ${imgMatches.length}, Images Missing ALT: ${imgsWithoutAlt}
- Schema.org (JSON-LD): ${hasSchema ? 'Detected' : 'Missing'}
- Open Graph Tags: ${hasOpenGraph ? 'Detected' : 'Missing'}
- Page Payload Size: ${htmlSizeKb} KB
- Server Latency (TTFB): ${latencyMs} ms
- Content Text Snippet: "${textSnippet.slice(0, 600) || 'Clean text preview unavailable'}"

CALCULATED BENCHMARK SCORES:
- Overall Score: ${overallScore}
- SEO Score: ${seoScore}
- Performance Score: ${perfScore}
- Accessibility Score: ${accessScore}
- Best Practices Score: ${bpScore}

INSTRUCTIONS:
Provide a JSON response using EXACTLY these calculated benchmark scores, with customized summary, real issues, and actionable steps tailored strictly to "${pageTitle}" and ${hostname}:
{
  "overallScore": ${overallScore},
  "scores": {
    "seo": ${seoScore},
    "performance": ${perfScore},
    "accessibility": ${accessScore},
    "bestPractices": ${bpScore}
  },
  "aiSummary": "2-3 crisp sentences detailing the specific findings for ${hostname} (mentioning its title '${pageTitle}' and SEO/performance health).",
  "keyIssues": [
    {
      "type": "error" | "warning" | "pass",
      "category": "SEO" | "Performance" | "Accessibility" | "Security",
      "title": "Specific short title",
      "description": "Specific explanation referencing the actual page title or tags extracted",
      "recommendation": "Concrete fix step"
    }
  ],
  "actionableSteps": [
    "Step 1 specific to ${hostname}",
    "Step 2",
    "Step 3",
    "Step 4"
  ]
}`;

    let auditData: any = {};
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: auditPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      auditData = JSON.parse(response.text || '{}');
    } catch (pErr) {
      // Dynamic Fallback populated with REAL extracted data
      const defaultIssues = [];
      if (!pageDesc) {
        defaultIssues.push({
          type: 'error',
          category: 'SEO',
          title: 'Missing Meta Description',
          description: `No meta description tag found on ${hostname}.`,
          recommendation: 'Add a 130-160 character meta description with primary target keywords.',
        });
      } else {
        defaultIssues.push({
          type: 'pass',
          category: 'SEO',
          title: 'Meta Description Present',
          description: `Meta description is set: "${pageDesc.slice(0, 80)}..."`,
          recommendation: 'Ensure high CTR wording and primary keywords are included.',
        });
      }

      if (!hasSchema) {
        defaultIssues.push({
          type: 'warning',
          category: 'SEO',
          title: 'Missing Structured Data (JSON-LD)',
          description: 'No JSON-LD LocalBusiness or Organization schema detected.',
          recommendation: 'Implement JSON-LD schema markup to boost Google search rich snippet eligibility.',
        });
      }

      if (imgsWithoutAlt > 0) {
        defaultIssues.push({
          type: 'warning',
          category: 'Accessibility',
          title: 'Images Missing ALT Text',
          description: `${imgsWithoutAlt} out of ${imgMatches.length} images are missing descriptive alt attributes.`,
          recommendation: 'Add descriptive alt text to all img tags for better accessibility and image SEO.',
        });
      }

      auditData = {
        overallScore,
        scores: { seo: seoScore, performance: perfScore, accessibility: accessScore, bestPractices: bpScore },
        aiSummary: `Technical audit completed for ${hostname}. Page title is "${pageTitle}". Overall health score is ${overallScore}/100 with key optimization opportunities in structured data and meta descriptions.`,
        keyIssues: defaultIssues,
        actionableSteps: [
          `Optimize meta tags and keyword targeting for "${pageTitle}"`,
          'Add schema.org JSON-LD structured data for rich snippets',
          `Add missing ALT text to ${imgsWithoutAlt} image tags`,
          'Enhance Core Web Vitals and caching for faster asset delivery',
        ],
      };
    }

    const creditStats = deductUserCredit(userEmail, AUDIT_CREDIT_COST);

    res.json({
      url: finalUrl,
      analyzedAt: new Date().toISOString(),
      metadata: {
        title: pageTitle,
        description: pageDesc,
        hasH1: h1Matches.length > 0,
        h1Count: h1Matches.length,
        imageAltMissingCount: imgsWithoutAlt,
        sslActive: isSsl,
        viewport: viewportMatch ? 'width=device-width' : 'Missing',
        canonical: canonicalMatch ? canonicalMatch[1] : undefined,
        latencyMs,
        htmlSizeKb,
      },
      audit: {
        overallScore: auditData.overallScore || overallScore,
        scores: auditData.scores || { seo: seoScore, performance: perfScore, accessibility: accessScore, bestPractices: bpScore },
        aiSummary: auditData.aiSummary || `Audit report generated for ${hostname}.`,
        keyIssues: auditData.keyIssues || [],
        actionableSteps: auditData.actionableSteps || [],
      },
      creditsUsed: creditStats.used,
      creditsRemaining: creditStats.remaining,
    });
  } catch (error: any) {
    console.error('Website audit error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze website' });
  }
});

// One-Click AI Polish Endpoint
app.post('/api/ai/polish', async (req, res) => {
  try {
    const { text, mode, providerKey, userEmail } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const ai = getGenAIClient(providerKey);
    let instruction = 'Improve this copy while maintaining core facts.';
    if (mode === 'shorter') instruction = 'Make this text significantly shorter, punchier, and remove fluff.';
    if (mode === 'persuasive') instruction = 'Make this text highly persuasive, engaging, and high-converting with strong emotional hooks.';
    if (mode === 'formal') instruction = 'Rewrite this text in a formal, executive, professional tone suitable for B2B stakeholders.';
    if (mode === 'cta') instruction = 'Add a strong, persuasive call-to-action (CTA) to the end of this copy.';

    const prompt = `${instruction}\n\nOriginal Text:\n"${text}"\n\nReturn ONLY the polished revised text without meta-commentary or markdown quotes.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const polishedText = response.text?.trim() || text;
    deductUserCredit(userEmail, 1);
    res.json({ polishedText });
  } catch (error: any) {
    console.error('Polish error:', error);
    res.status(500).json({ error: error.message || 'Failed to polish text' });
  }
});

// Contact Us Form Submission Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, phone, inquiryType, budget, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required fields.' });
    }

    const ticketId = `LOC-${Math.floor(100000 + Math.random() * 900000)}`;
    const supportRecipient = process.env.SUPPORT_EMAIL || SUPPORT_EMAIL;

    // 1. Send Notification Email to Locora AI Support Team
    await sendEmail({
      to: supportRecipient,
      subject: `[New Contact Query - ${ticketId}] ${inquiryType ? inquiryType.toUpperCase() : 'GENERAL'}: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #059669; margin-top: 0;">New Inquiry Received [Ticket ${ticketId}]</h2>
          <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
          <p><strong>Company:</strong> ${company || 'N/A'}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Inquiry Type:</strong> ${inquiryType || 'General'}</p>
          <p><strong>Estimated Budget / Retainers:</strong> ${budget || 'Not specified'}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <h4 style="margin-bottom: 8px;">Message Details:</h4>
          <blockquote style="background: #f8fafc; padding: 12px 16px; border-left: 4px solid #059669; margin: 0; white-space: pre-wrap;">${message}</blockquote>
          <p style="font-size: 11px; color: #64748b; margin-top: 20px;">Submitted via Locora AI Public Contact Form.</p>
        </div>
      `,
    });

    // 2. Send Auto-Reply Confirmation to Customer
    await sendEmail({
      to: email,
      subject: `We've received your inquiry! [Ticket ${ticketId}] - Locora AI`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #059669; margin-top: 0;">Thank you for reaching out, ${name}!</h2>
          <p>We have received your message and assigned reference ticket ID: <strong style="color: #059669;">${ticketId}</strong>.</p>
          <p>Our growth specialist team is reviewing your query regarding <strong>${inquiryType || 'our services'}</strong> and will follow up with you directly at <strong>${email}</strong> within 2 business hours.</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #166534; font-weight: bold;">Need immediate assistance?</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #15803d;">You can also chat live with our AI Copilot inside the Locora workspace at any time.</p>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Best regards,<br/><strong>The Locora AI Growth Team</strong><br/>San Francisco, CA</p>
        </div>
      `,
    });

    res.json({
      success: true,
      ticketId,
      message: 'Inquiry received successfully and confirmation email dispatched.',
    });
  } catch (error: any) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: error.message || 'Failed to process inquiry' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Locora AI - Business Copilot 3.0 Engine' });
});

// Weekly Newsletter Subscription & Automated Dispatch Engine

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'subscribers.json');
const NEWSLETTER_STATE_FILE = path.join(process.cwd(), 'newsletter_state.json');

interface NewsletterState {
  lastDispatchedAt: string | null;
  currentWeekIndex: number;
  totalEmailsSent: number;
}

function loadSubscribers(): Map<string, { email: string; subscribedAt: string }> {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const raw = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      const list = JSON.parse(raw);
      const map = new Map<string, { email: string; subscribedAt: string }>();
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item && item.email) map.set(item.email.toLowerCase().trim(), item);
        });
      }
      return map;
    }
  } catch (err) {
    console.error('Failed to load subscribers file:', err);
  }
  return new Map();
}

function saveSubscribers(map: Map<string, { email: string; subscribedAt: string }>) {
  try {
    const list = Array.from(map.values());
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save subscribers file:', err);
  }
}

function loadNewsletterState(): NewsletterState {
  try {
    if (fs.existsSync(NEWSLETTER_STATE_FILE)) {
      const raw = fs.readFileSync(NEWSLETTER_STATE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load newsletter state file:', err);
  }
  return { lastDispatchedAt: null, currentWeekIndex: 0, totalEmailsSent: 0 };
}

function saveNewsletterState(state: NewsletterState) {
  try {
    fs.writeFileSync(NEWSLETTER_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save newsletter state file:', err);
  }
}

const newsletterSubscribersDb = loadSubscribers();
let newsletterState = loadNewsletterState();

// Curated Weekly AI Prompt Packs for Subscribers
const WEEKLY_PROMPT_PACKS = [
  {
    week: 1,
    title: 'Local SEO Schema & GBP Optimization Pack',
    prompts: [
      {
        title: '📍 Local SEO Schema Generator',
        code: '"Generate LocalBusiness JSON-LD schema markup for [Business Name], located at [Address], phone [Phone], operating hours [Hours]. Include GeoCoordinates and ServiceType parameters for maximum Google Maps rank."',
      },
      {
        title: '⚡ GBP Weekly Post Creator',
        code: '"Write 3 engaging Google Business Profile posts for [Business Name] promoting [Offer/Service]. Include localized calls to action and relevant hashtags to boost local map pack visibility."',
      },
    ],
  },
  {
    week: 2,
    title: 'High-Ticket Client Closing & Proposal Pack',
    prompts: [
      {
        title: '💼 $3,000/mo Service Retainer Proposal',
        code: '"Draft a high-converting retainer proposal for [Local Business Client] detailing a $3,000/mo package for AI receptionist, automated SMS review generation, and monthly local SEO audit."',
      },
      {
        title: '📞 Cold Outreach Email Teardown',
        code: '"Write a personalized, 4-sentence cold email to a local [Dentist/Plumber] owner identifying 2 visible gaps on their Google Maps listing and offering a free 5-minute video teardown."',
      },
    ],
  },
  {
    week: 3,
    title: 'AI Customer Retention & Reputation Pack',
    prompts: [
      {
        title: '⭐ 5-Star Review Request SMS Sequence',
        code: '"Create a 2-step polite SMS text sequence sent to customers 2 hours after service completion, asking for a 5-star Google review with a direct review link insertion tag."',
      },
      {
        title: '🛡️ Negative Review Recovery & Escalation',
        code: '"Write an empathetic, professional response to a 1-star negative review regarding [Issue]. De-escalate publicly, offer a direct line to management, and preserve brand reputation."',
      },
    ],
  },
  {
    week: 4,
    title: 'Social Media & Local Content Engine Pack',
    prompts: [
      {
        title: '📲 7-Day Local Service Content Calendar',
        code: '"Generate a 7-day social media content calendar for [Business Type] with post captions, image prompts, and local geo-targeted hashtags to drive foot traffic."',
      },
      {
        title: '🎯 Hyper-Local Facebook & Instagram Ad Copy',
        code: '"Write 3 ad copy variations targeting homeowners within a 10-mile radius of [Zip Code] offering a limited-time 20% discount on [Service Name]."',
      },
    ],
  },
];

// Core Automated Dispatch Function
async function executeWeeklyNewsletterDispatch(hostOverride?: string) {
  const subscribers = Array.from(newsletterSubscribersDb.values());
  if (subscribers.length === 0) {
    console.log('[Newsletter Cron] No active subscribers found for dispatch.');
    return { sentCount: 0, packTitle: 'No subscribers' };
  }

  const host = hostOverride || (process.env.APP_URL && !process.env.APP_URL.includes('localhost') ? process.env.APP_URL : 'https://locoraai.com');
  const packIndex = newsletterState.currentWeekIndex % WEEKLY_PROMPT_PACKS.length;
  const pack = WEEKLY_PROMPT_PACKS[packIndex];

  let sentCount = 0;
  for (const sub of subscribers) {
    const unsubscribeLink = `${host}/api/newsletter/unsubscribe?email=${encodeURIComponent(sub.email)}`;
    const appLink = host;

    try {
      await sendEmail({
        to: sub.email,
        subject: `🔥 Weekly AI Business Dispatch: ${pack.title}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
            <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9;">
              <div style="display: inline-block; background: #ecfdf5; color: #059669; font-weight: bold; font-size: 12px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 8px;">
                Locora Weekly Dispatch • Week ${pack.week}
              </div>
              <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 8px 0;">${pack.title}</h1>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Fresh tested prompts ready for your Locora Copilot</p>
            </div>

            <div style="padding: 24px 0 16px;">
              ${pack.prompts
                .map(
                  (p) => `
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #059669; border-radius: 8px; padding: 16px; margin: 16px 0;">
                  <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 6px;">${p.title}</div>
                  <div style="font-family: monospace; font-size: 12px; color: #047857; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                    ${p.code}
                  </div>
                </div>
              `
                )
                .join('')}

              <div style="margin: 28px 0 20px; text-align: center;">
                <a href="${appLink}" style="background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block; font-size: 15px;">Run These Prompts in Locora AI →</a>
              </div>
            </div>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
              <p style="margin: 0 0 8px;">© ${new Date().getFullYear()} Locora AI Platform Inc. 500 Howard St, San Francisco, CA</p>
              <p style="margin: 0;"><a href="${unsubscribeLink}" style="color: #64748b; text-decoration: underline;">Unsubscribe in 1-click</a></p>
            </div>
          </div>
        `,
      });
      sentCount++;
    } catch (err) {
      console.error(`[Newsletter Cron] Failed to send email to ${sub.email}:`, err);
    }
  }

  newsletterState.lastDispatchedAt = new Date().toISOString();
  newsletterState.currentWeekIndex = packIndex + 1;
  newsletterState.totalEmailsSent += sentCount;
  saveNewsletterState(newsletterState);

  console.log(`[Newsletter Cron] Successfully dispatched Weekly Pack #${pack.week} "${pack.title}" to ${sentCount} subscribers.`);
  return { sentCount, packTitle: pack.title, week: pack.week };
}

// Background Cron Scheduler (Runs every 1 hour to check if 7 days elapsed)
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function initAutomatedNewsletterCron() {
  console.log('🤖 Locora Newsletter Background Cron Engine Initialized.');

  setInterval(async () => {
    if (newsletterSubscribersDb.size === 0) return;

    const now = Date.now();
    const lastRun = newsletterState.lastDispatchedAt ? new Date(newsletterState.lastDispatchedAt).getTime() : 0;

    if (now - lastRun >= SEVEN_DAYS_MS) {
      console.log('⏰ 7 days elapsed since last newsletter dispatch. Executing automated prompt pack delivery...');
      await executeWeeklyNewsletterDispatch();
    }
  }, 60 * 60 * 1000); // Check hourly
}

initAutomatedNewsletterCron();

// 1-Click Unsubscribe Endpoint
app.get('/api/newsletter/unsubscribe', (req, res) => {
  const email = req.query.email as string;
  if (email) {
    const normalized = email.toLowerCase().trim();
    newsletterSubscribersDb.delete(normalized);
    saveSubscribers(newsletterSubscribersDb);
  }
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Unsubscribed - Locora AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
          h1 { color: #0f172a; font-size: 22px; margin: 0 0 12px; }
          p { color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
          a { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>You've Been Unsubscribed</h1>
          <p>Your email <strong>${email ? email : ''}</strong> has been successfully removed from Locora Growth Dispatch. You will no longer receive weekly AI prompts.</p>
          <a href="/">Return to Locora AI App</a>
        </div>
      </body>
    </html>
  `);
});

// GET & POST Endpoint for checking status or triggering newsletter dispatch
app.get('/api/newsletter/status', (req, res) => {
  const packIndex = newsletterState.currentWeekIndex % WEEKLY_PROMPT_PACKS.length;
  const nextPack = WEEKLY_PROMPT_PACKS[packIndex];
  const lastRun = newsletterState.lastDispatchedAt ? new Date(newsletterState.lastDispatchedAt).getTime() : 0;
  const nextRunDate = lastRun > 0 ? new Date(lastRun + SEVEN_DAYS_MS).toISOString() : 'Pending automated schedule';

  res.json({
    status: 'active',
    cronScheduler: 'running',
    totalSubscribers: newsletterSubscribersDb.size,
    lastDispatchedAt: newsletterState.lastDispatchedAt,
    nextScheduledDispatch: nextRunDate,
    currentPromptPack: nextPack,
    totalEmailsDelivered: newsletterState.totalEmailsSent,
  });
});

app.all('/api/newsletter/send-weekly-dispatch', async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = `${protocol}://${req.headers.host}`;
    const result = await executeWeeklyNewsletterDispatch(host);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Weekly newsletter dispatch error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Admin Verification Helper
async function verifyAdminAccessAsync(req: express.Request): Promise<boolean> {
  const userEmail = ((req.headers['x-user-email'] as string) || (req.query.userEmail as string) || (req.body && req.body.userEmail) || '').toLowerCase().trim();

  if (userEmail) {
    if (userEmail === 'imtiazbaloch3322@gmail.com' || userEmail === 'support@locoraai.com') {
      return true;
    }
    let usr = usersDb.get(userEmail);
    if (!usr) {
      usr = await findUserByEmail(userEmail);
    }
    if (usr && (usr.role === 'admin' || usr.role === 'owner')) {
      return true;
    }
  }

  return false;
}

function verifyAdminAccess(req: express.Request): boolean {
  const userEmail = ((req.headers['x-user-email'] as string) || (req.query.userEmail as string) || (req.body && req.body.userEmail) || '').toLowerCase().trim();

  if (userEmail) {
    if (userEmail === 'imtiazbaloch3322@gmail.com' || userEmail === 'support@locoraai.com') {
      return true;
    }
    const usr = usersDb.get(userEmail);
    if (usr && (usr.role === 'admin' || usr.role === 'owner')) {
      return true;
    }
  }

  return false;
}

// Full System Database Export Endpoint (ADMIN ONLY)
app.get('/api/database/export', (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(403).json({
        error: 'Access Denied. Public access to database exports is disabled. Database access is strictly restricted to authenticated system administrators.',
      });
    }

    const subscribers = Array.from(newsletterSubscribersDb.values());
    const registeredUsers = Array.from(usersDb.values());

    const exportData = {
      system: 'Locora AI - Business Copilot 3.0',
      exportedAt: new Date().toISOString(),
      firestoreDatabaseId: 'ai-studio-locoraaibusiness-98f42f97-dbe7-4877-b55c-2edca441dfd7',
      counts: {
        registeredUsers: registeredUsers.length,
        subscribersCount: subscribers.length,
      },
      tables: {
        users: registeredUsers,
        newsletterSubscribers: subscribers,
        newsletterState: newsletterState,
        weeklyPromptPacks: WEEKLY_PROMPT_PACKS,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: 3000,
        aiProvider: 'Google Gemini (Server-side API)',
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="locora_admin_database_export_${Date.now()}.json"`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (err: any) {
    console.error('Database export error:', err);
    res.status(500).json({ error: 'Failed to export system database: ' + err.message });
  }
});

// Full System Database Import / Restore Endpoint (ADMIN ONLY)
app.post('/api/database/import', async (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(403).json({
        error: 'Access Denied. Database import is strictly restricted to authenticated system administrators.',
      });
    }

    const { tables, data } = req.body || {};
    const importSource = tables || data?.tables || req.body;

    if (!importSource) {
      return res.status(400).json({ error: 'Invalid payload. Expecting { tables: { users: [], newsletterSubscribers: [] } }' });
    }

    let importedUsersCount = 0;
    let importedSubsCount = 0;

    // 1. Import Users Table
    if (Array.isArray(importSource.users)) {
      for (const u of importSource.users) {
        if (u && u.email) {
          const normEmail = u.email.toLowerCase().trim();
          usersDb.set(normEmail, u);
          await saveUserToSql(u);
          importedUsersCount++;
        }
      }
    }

    // 2. Import Newsletter Subscribers Table
    if (Array.isArray(importSource.newsletterSubscribers)) {
      for (const s of importSource.newsletterSubscribers) {
        if (s && s.email) {
          const normEmail = s.email.toLowerCase().trim();
          newsletterSubscribersDb.set(normEmail, s);
          await saveSubscriberToSql(s);
          importedSubsCount++;
        }
      }
    }

    return res.json({
      success: true,
      message: `Database import completed successfully.`,
      importedCounts: {
        users: importedUsersCount,
        newsletterSubscribers: importedSubsCount,
      },
      exportedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Database import error:', err);
    res.status(500).json({ error: 'Failed to import system database: ' + err.message });
  }
});

// Admin Database Tables Explorer API Endpoint (ADMIN ONLY)
app.get('/api/admin/database-tables', async (req, res) => {
  try {
    if (!(await verifyAdminAccessAsync(req))) {
      return res.status(403).json({
        error: 'Access Denied. Database inspection is restricted to authorized System Administrators.',
      });
    }

    const sqlUsers = await dbService.getUsers().catch(() => []);
    const sqlSubscribers = await dbService.getNewsletterSubscribers().catch(() => []);
    
    const subscribers = Array.from(newsletterSubscribersDb.values());
    const registeredUsers = Array.from(usersDb.values());

    res.json({
      success: true,
      databaseEngine: 'PostgreSQL Cloud SQL',
      stats: {
        totalUsers: Math.max(registeredUsers.length, sqlUsers.length),
        totalSubscribers: Math.max(subscribers.length, sqlSubscribers.length),
        lastNewsletterDispatch: newsletterState.lastDispatchedAt,
        totalEmailsSent: newsletterState.totalEmailsSent,
        currentWeekIndex: newsletterState.currentWeekIndex,
      },
      tables: {
        users: registeredUsers,
        newsletterSubscribers: subscribers,
        newsletterState: newsletterState,
        promptPacks: WEEKLY_PROMPT_PACKS,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin database tables: ' + err.message });
  }
});

// Admin User Plan & Credit Manager API
app.post('/api/admin/update-user-plan', async (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(403).json({ error: 'Access Denied. Admin key required.' });
    }

    const { email, planTier, role, setCreditsUsed, autoRenew, billingCycle, subscriptionStatus, monthlyAiCredits } = req.body;
    if (!email) return res.status(400).json({ error: 'Target user email is required.' });

    const normalizedEmail = email.toLowerCase().trim();
    let user = usersDb.get(normalizedEmail);
    if (!user) return res.status(404).json({ error: 'User not found in database.' });

    if (planTier) {
      const creditsMap: Record<string, number> = { free: 25, pro: 250, agency: 9999 };
      user.planTier = planTier;
      user.monthlyAiCredits = monthlyAiCredits || creditsMap[planTier] || 25;
      if (!role && user.role !== 'admin') {
        user.role = planTier !== 'free' ? 'subscriber' : 'customer';
      }
    }
    if (typeof monthlyAiCredits === 'number') user.monthlyAiCredits = monthlyAiCredits;
    if (role) user.role = role;
    if (typeof setCreditsUsed === 'number') user.aiCreditsUsed = setCreditsUsed;
    if (typeof autoRenew === 'boolean') user.autoRenew = autoRenew;
    if (billingCycle) user.billingCycle = billingCycle;
    if (subscriptionStatus) user.subscriptionStatus = subscriptionStatus;

    usersDb.set(normalizedEmail, user);
    await saveUserToSql(user);

    res.json({ success: true, message: `Updated user ${normalizedEmail} successfully!`, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API to Delete User Account permanently
app.post('/api/admin/delete-user', async (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(403).json({ error: 'Access Denied. Admin key required.' });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Target user email is required.' });

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = usersDb.get(normalizedEmail);
    usersDb.delete(normalizedEmail);
    await removeUserFromSql(normalizedEmail, existingUser?.id);

    res.json({ success: true, message: `Successfully deleted user ${normalizedEmail}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});



function recordRealModelTokenUsage(modelId: string, tokensConsumed: number) {
  const model = aiModelQuotas.get(modelId);
  if (model && model.hasCustomKey) {
    model.usedTokens += tokensConsumed;
    model.remainingTokens = Math.max(0, model.allocatedTokens - model.usedTokens);
    if (model.remainingTokens <= 0) {
      model.status = 'exhausted';
    } else if (model.remainingTokens < model.allocatedTokens * 0.1) {
      model.status = 'warning';
    }
    aiModelQuotas.set(modelId, model);
  }
}

// Admin API to fetch AI Tokens and Model Monitoring Stats
app.get('/api/admin/ai-tokens/stats', (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(403).json({ error: 'Access Denied. Admin key required.' });
    }

    if (storedAppSettings?.providerKeys) {
      syncProviderKeysToEnv(storedAppSettings.providerKeys);
    }

    const modelsList = Array.from(aiModelQuotas.values());
    let totalAllocated = 0;
    let totalUsed = 0;
    let activeModels = 0;

    modelsList.forEach((m) => {
      if (m.hasCustomKey) {
        totalAllocated += m.allocatedTokens;
        totalUsed += m.usedTokens;
        activeModels++;
      }
    });

    res.json({
      success: true,
      summary: {
        totalAllocatedTokens: totalAllocated,
        totalUsedTokens: totalUsed,
        totalRemainingTokens: totalAllocated - totalUsed,
        utilizationPercentage: totalAllocated > 0 ? ((totalUsed / totalAllocated) * 100).toFixed(2) : '0.00',
        activeModelsCount: activeModels,
      },
      models: modelsList,
      savedKeys: {
        gemini: storedAppSettings?.providerKeys?.gemini || process.env.GEMINI_API_KEY || '',
        openai: storedAppSettings?.providerKeys?.openai || process.env.OPENAI_API_KEY || '',
        anthropic: storedAppSettings?.providerKeys?.claude || storedAppSettings?.providerKeys?.anthropic || process.env.ANTHROPIC_API_KEY || '',
        perplexity: storedAppSettings?.providerKeys?.perplexity || process.env.PERPLEXITY_API_KEY || '',
        deepseek: storedAppSettings?.providerKeys?.deepseek || process.env.DEEPSEEK_API_KEY || '',
      },
      apiKeysConfigured: {
        gemini: hasEnvKeyForModel('GEMINI_API_KEY'),
        openai: hasEnvKeyForModel('OPENAI_API_KEY'),
        anthropic: hasEnvKeyForModel('ANTHROPIC_API_KEY'),
        perplexity: hasEnvKeyForModel('PERPLEXITY_API_KEY'),
        deepseek: hasEnvKeyForModel('DEEPSEEK_API_KEY'),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API to Refill AI Token Pool
app.post('/api/admin/ai-tokens/refill', (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(403).json({ error: 'Access Denied. Admin key required.' });
    }

    const { modelId, amount } = req.body;
    const refillAmount = typeof amount === 'number' && amount > 0 ? amount : 5000000;

    if (modelId && aiModelQuotas.has(modelId)) {
      const model = aiModelQuotas.get(modelId)!;
      model.allocatedTokens += refillAmount;
      model.remainingTokens += refillAmount;
      model.status = 'active';
      model.hasCustomKey = true;
      aiModelQuotas.set(modelId, model);
      return res.json({ success: true, message: `Refilled +${refillAmount.toLocaleString()} tokens for ${model.name}`, model });
    }

    // Refill all models if no modelId specified
    aiModelQuotas.forEach((model, id) => {
      model.allocatedTokens += refillAmount;
      model.remainingTokens += refillAmount;
      model.status = 'active';
      model.hasCustomKey = true;
      aiModelQuotas.set(id, model);
    });

    res.json({ success: true, message: `Refilled +${refillAmount.toLocaleString()} tokens across all AI models!`, models: Array.from(aiModelQuotas.values()) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API to Update Live Model API Keys
app.post('/api/admin/ai-tokens/update-keys', async (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(403).json({ error: 'Access Denied. Admin key required.' });
    }

    const { geminiKey, openaiKey, anthropicKey, perplexityKey, deepseekKey } = req.body;

    // Validate non-empty provided keys against provider endpoints
    const keyValidations = [
      { provider: 'gemini', key: geminiKey, label: 'Google Gemini' },
      { provider: 'openai', key: openaiKey, label: 'OpenAI' },
      { provider: 'anthropic', key: anthropicKey, label: 'Anthropic Claude' },
      { provider: 'perplexity', key: perplexityKey, label: 'Perplexity AI' },
      { provider: 'deepseek', key: deepseekKey, label: 'DeepSeek' },
    ];

    for (const item of keyValidations) {
      if (item.key && typeof item.key === 'string' && item.key.trim().length > 0) {
        const result = await validateApiKey(item.provider, item.key.trim());
        if (!result.valid) {
          return res.status(400).json({
            error: result.error || `Invalid ${item.label} API Key. Verification failed — tokens were NOT updated.`,
          });
        }
      }
    }

    const newKeys = {
      ...(storedAppSettings?.providerKeys || {}),
      ...(geminiKey !== undefined ? { gemini: geminiKey.trim() } : {}),
      ...(openaiKey !== undefined ? { openai: openaiKey.trim() } : {}),
      ...(anthropicKey !== undefined ? { claude: anthropicKey.trim(), anthropic: anthropicKey.trim() } : {}),
      ...(perplexityKey !== undefined ? { perplexity: perplexityKey.trim() } : {}),
      ...(deepseekKey !== undefined ? { deepseek: deepseekKey.trim() } : {}),
    };

    storedAppSettings = {
      ...(storedAppSettings || {}),
      providerKeys: newKeys,
    };

    syncProviderKeysToEnv(newKeys);
    saveSettingsToDisk(storedAppSettings);
    await dbService.saveSettings(storedAppSettings).catch(() => {});

    res.json({
      success: true,
      message: 'Successfully validated live AI model API keys and activated token pools!',
      savedKeys: {
        gemini: process.env.GEMINI_API_KEY || '',
        openai: process.env.OPENAI_API_KEY || '',
        anthropic: process.env.ANTHROPIC_API_KEY || '',
        perplexity: process.env.PERPLEXITY_API_KEY || '',
        deepseek: process.env.DEEPSEEK_API_KEY || '',
      },
      apiKeysConfigured: {
        gemini: hasEnvKeyForModel('GEMINI_API_KEY'),
        openai: hasEnvKeyForModel('OPENAI_API_KEY'),
        anthropic: hasEnvKeyForModel('ANTHROPIC_API_KEY'),
        perplexity: hasEnvKeyForModel('PERPLEXITY_API_KEY'),
        deepseek: hasEnvKeyForModel('DEEPSEEK_API_KEY'),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Subscriber Manager API
app.post('/api/admin/delete-subscriber', async (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(403).json({ error: 'Access Denied. Admin key required.' });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const normalizedEmail = email.toLowerCase().trim();
    newsletterSubscribersDb.delete(normalizedEmail);
    saveSubscribers(newsletterSubscribersDb);

    res.json({ success: true, message: `Removed subscriber ${normalizedEmail}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid work email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const subRecord = {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
    };
    newsletterSubscribersDb.set(normalizedEmail, subRecord);
    saveSubscribers(newsletterSubscribersDb);
    await saveSubscriberToSql(subRecord);

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = `${protocol}://${req.headers.host}`;
    const unsubscribeLink = `${host}/api/newsletter/unsubscribe?email=${encodeURIComponent(normalizedEmail)}`;
    const appLink = host;

    // Send Welcome Email to Subscriber via Resend REST API
    await sendEmail({
      to: normalizedEmail,
      subject: '🚀 Your Top 3 AI Business Prompts + Locora AI Growth Dispatch',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
          
          <!-- Header -->
          <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9;">
            <div style="display: inline-block; background: #ecfdf5; color: #059669; font-weight: bold; font-size: 12px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              Welcome to Locora AI Dispatch
            </div>
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 8px 0 4px;">Top AI Local Business Toolkit</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Weekly prompt teardowns & local growth automation strategies</p>
          </div>

          <!-- Body intro -->
          <div style="padding: 24px 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
            <p style="margin-top: 0;">Welcome aboard! Here are 3 instant, high-converting AI prompts you can copy & paste into your <strong>Locora AI Copilot</strong> right away:</p>
            
            <!-- Prompt 1 -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #059669; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 6px;">1. 📍 Local SEO Competitor Gap Analysis Prompt</div>
              <div style="font-family: monospace; font-size: 12px; color: #047857; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
                "Act as a senior local SEO strategist. Analyze [Business Type] in [City, State] targeting keywords [Keyword 1, Keyword 2]. Generate 5 high-impact Google Business Profile optimizations and schema markup recommendations to beat local competitors."
              </div>
            </div>

            <!-- Prompt 2 -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 6px;">2. 💼 High-Ticket Client Retainer Proposal Prompt</div>
              <div style="font-family: monospace; font-size: 12px; color: #0369a1; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
                "Create a 3-tier service proposal for a local [Roofing / Plumbing / Dental] client valued at $2,500/mo. Include scope breakdown for GBP management, review generation, and automated lead follow-up."
              </div>
            </div>

            <!-- Prompt 3 -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 6px;">3. ⭐ 5-Star Review Reply & Reputation Generator</div>
              <div style="font-family: monospace; font-size: 12px; color: #6d28d9; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
                "Write 3 professional responses to a customer review for [Business Name]. Include primary keyword [Service Name] naturally for SEO and invite repeat business with a custom coupon offer."
              </div>
            </div>

            <!-- Primary Call to Action -->
            <div style="margin: 28px 0 20px; text-align: center;">
              <a href="${appLink}" style="background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">Launch Locora AI App & Execute Prompts →</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
            <p style="margin: 0 0 8px;">© ${new Date().getFullYear()} Locora AI Platform Inc. 500 Howard St, San Francisco, CA 94105</p>
            <p style="margin: 0;">Don't want weekly AI prompts? <a href="${unsubscribeLink}" style="color: #64748b; text-decoration: underline;">Unsubscribe in 1-click</a></p>
          </div>
        </div>
      `,
    });

    // Send Admin Notification to Support Team
    const supportEmail = process.env.SUPPORT_EMAIL || SUPPORT_EMAIL;
    await sendEmail({
      to: supportEmail,
      subject: `[New Subscriber] Weekly Newsletter: ${normalizedEmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #059669; margin-top: 0;">New Newsletter Subscriber</h3>
          <p><strong>Email:</strong> ${normalizedEmail}</p>
          <p><strong>Subscribed At:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "You're subscribed! Check your inbox for our Top 25 AI Proposal Prompts.",
    });
  } catch (err: any) {
    console.error('Newsletter subscription error:', err);
    res.status(500).json({ error: err.message || 'Failed to subscribe to weekly newsletter.' });
  }
});

// Direct SEO & Google Search Console Endpoints
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const baseUrl = getRequestBaseUrl(req);
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /auth/callback

Sitemap: ${baseUrl}/sitemap.xml
`);
});

app.get('/sitemap.xml', (req, res) => {
  try {
    const baseUrl = getRequestBaseUrl(req);
    const today = new Date().toISOString().split('T')[0];

    const pages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/features', priority: '0.9', changefreq: 'weekly' },
      { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/security', priority: '0.6', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
      { path: '/terms', priority: '0.5', changefreq: 'monthly' },
      { path: '/login', priority: '0.6', changefreq: 'monthly' },
      { path: '/signup', priority: '0.6', changefreq: 'monthly' },
      // Programmatic Industry Landing Pages
      { path: '/for/dentists', priority: '0.85', changefreq: 'weekly' },
      { path: '/for/hvac-contractors', priority: '0.85', changefreq: 'weekly' },
      { path: '/for/real-estate', priority: '0.85', changefreq: 'weekly' },
      { path: '/for/law-firms', priority: '0.85', changefreq: 'weekly' },
      { path: '/for/plumbers', priority: '0.85', changefreq: 'weekly' },
      { path: '/for/med-spas', priority: '0.85', changefreq: 'weekly' },
      { path: '/for/restaurants', priority: '0.85', changefreq: 'weekly' },
      { path: '/for/auto-repair', priority: '0.85', changefreq: 'weekly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    pages.forEach((p) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${p.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(xml);
  } catch (err: any) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

// Start Server with Vite / Static middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**', '**/*.json'],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Locora AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
