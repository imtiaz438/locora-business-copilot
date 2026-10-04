/**
 * LocoraAI Unified AI Engine — the SINGLE entry point for all AI text generation.
 *
 * Provider policy (decided Oct 2026, after a full codebase audit):
 *   - PRIMARY: Groq (openai/gpt-oss-120b) — free tier, very fast, no region
 *     restrictions. Used for every AI feature by default.
 *   - PREMIUM (opt-in): Claude (claude-3-7-sonnet-20250219) — used ONLY when the
 *     caller explicitly selects it AND a funded ANTHROPIC_API_KEY exists
 *     (user-supplied key or platform key).
 *   - REMOVED: Google Gemini — region restrictions produced failures that users
 *     cannot understand or fix. Deliberately excluded from all runtime paths.
 *
 * Hard invariants:
 *   1. NEVER fabricate content. On any failure the result is ok:false with a
 *      machine-readable errorCode and a human-actionable errorMessage.
 *   2. Callers may deduct credits ONLY when realApiExecuted === true.
 *   3. Every request has a timeout; one retry on 429/5xx; then fail fast & honest.
 *   4. Model IDs come from a verified allowlist — never from free-form user input.
 */

export type AiEngineProvider = 'groq' | 'claude';

export interface AiEngineMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiEngineRequest {
  messages: AiEngineMessage[];
  /** Convenience: prepended as a system message (equivalent to messages[0] with role 'system'). */
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  /** Ask the model for strict JSON output (Groq: response_format; Claude: instruction). */
  jsonMode?: boolean;
  /** Explicit provider choice. Only 'claude' is honored; everything else → Groq. */
  providerOverride?: AiEngineProvider;
  /** End-user supplied key. Takes precedence over the platform key. */
  providerKey?: string;
  /** Only honored when present in the verified allowlist below. */
  modelOverride?: string;
  timeoutMs?: number;
}

export type AiEngineErrorCode =
  | 'not_configured'
  | 'auth_error'
  | 'rate_limited'
  | 'timeout'
  | 'unavailable';

export interface AiEngineResult {
  ok: boolean;
  text: string;
  providerUsed: AiEngineProvider;
  modelUsed: string;
  realApiExecuted: boolean;
  tokensUsed: number;
  errorCode?: AiEngineErrorCode;
  errorMessage?: string;
}

export const AI_NOT_CONFIGURED_NOTICE =
  'AI is temporarily unavailable right now. Please try again in a moment.';

/**
 * Central platform Groq key registry.
 * The platform key is the SINGLE source of AI for every tier and every feature —
 * users never supply keys. server.ts pushes the live key here on boot and on
 * every admin key update, so the engine always sees it even if env sync lags.
 */
let platformGroqKey = '';
export function setPlatformGroqKey(key: string) {
  platformGroqKey = (key || '').trim();
}
export function getPlatformGroqKey(): string {
  return platformGroqKey || (process.env.GROQ_API_KEY || '').trim();
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_VERSION = '2023-06-01';

const GROQ_DEFAULT_MODEL = 'openai/gpt-oss-120b';
const CLAUDE_DEFAULT_MODEL = 'claude-3-7-sonnet-20250219';

/** Verified model IDs. Anything else falls back to the provider default (logged).
 *  NOTE (Oct 2026): Groq decommissioned llama-3.3-70b-versatile and
 *  llama-3.1-8b-instant on 2026-08-16. Current production IDs below. */
const ALLOWED_MODELS: Record<AiEngineProvider, string[]> = {
  groq: ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'],
  claude: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022'],
};

const DEFAULT_TIMEOUT_MS = 20000;
const RETRY_DELAY_MS = 1200;

function pickModel(provider: AiEngineProvider, override?: string): string {
  const fallback = provider === 'claude' ? CLAUDE_DEFAULT_MODEL : GROQ_DEFAULT_MODEL;
  if (override && ALLOWED_MODELS[provider].includes(override)) return override;
  if (override) {
    console.warn(`[aiEngine] Unverified model "${override}" rejected for ${provider}; using ${fallback}.`);
  }
  return fallback;
}

interface ResolvedProvider {
  provider: AiEngineProvider;
  key: string;
  model: string;
  isCustomKey: boolean;
  error?: { code: AiEngineErrorCode; message: string };
}

function resolveProvider(req: AiEngineRequest): ResolvedProvider {
  const wantsClaude = req.providerOverride === 'claude';
  const userKey = (req.providerKey || '').trim();

  if (wantsClaude) {
    const key = userKey || (process.env.ANTHROPIC_API_KEY || '').trim();
    if (!key) {
      return {
        provider: 'claude', key: '', model: CLAUDE_DEFAULT_MODEL, isCustomKey: false,
        error: {
          code: 'not_configured',
          message: 'Claude was selected but no Anthropic API key is configured. Add one in Settings → AI Providers, or switch back to Groq (free).',
        },
      };
    }
    return { provider: 'claude', key, model: pickModel('claude', req.modelOverride), isCustomKey: !!userKey };
  }

  const key = userKey || getPlatformGroqKey();
  if (!key) {
    return {
      provider: 'groq', key: '', model: GROQ_DEFAULT_MODEL, isCustomKey: false,
      error: { code: 'not_configured', message: AI_NOT_CONFIGURED_NOTICE },
    };
  }
  return { provider: 'groq', key, model: pickModel('groq', req.modelOverride), isCustomKey: !!userKey };
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function mapHttpError(status: number, bodyText: string): { code: AiEngineErrorCode; message: string } {
  if (status === 401 || status === 403) {
    return { code: 'auth_error', message: `AI provider rejected the API key (HTTP ${status}). Check the key in Settings → AI Providers.` };
  }
  if (status === 429) {
    return { code: 'rate_limited', message: 'AI provider rate limit reached. Please wait a moment and try again.' };
  }
  return { code: 'unavailable', message: `AI provider error (HTTP ${status}): ${bodyText.slice(0, 200)}` };
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 3.8));
}

async function callGroq(
  resolved: ResolvedProvider,
  req: AiEngineRequest,
  timeoutMs: number,
): Promise<AiEngineResult> {
  const base = {
    ok: false as const,
    text: '',
    providerUsed: 'groq' as const,
    modelUsed: resolved.model,
    realApiExecuted: false,
    tokensUsed: 0,
  };
  const allMessages: AiEngineMessage[] = [
    ...(req.systemInstruction ? [{ role: 'system' as const, content: req.systemInstruction }] : []),
    ...req.messages,
  ];
  const body: Record<string, any> = {
    model: resolved.model,
    messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
    temperature: req.temperature ?? 0.7,
    // gpt-oss models are reasoning models; 'low' keeps responses fast and
    // prevents reasoning tokens from consuming the completion budget.
    reasoning_effort: 'low',
  };
  if (typeof req.maxTokens === 'number') body.max_tokens = req.maxTokens;
  if (req.jsonMode) body.response_format = { type: 'json_object' };

  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resolved.key}` },
    body: JSON.stringify(body),
  };

  let lastErr: { code: AiEngineErrorCode; message: string } = { code: 'unavailable', message: 'Unknown error' };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(GROQ_API_URL, init, timeoutMs);
      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        lastErr = mapHttpError(res.status, bodyText);
        if ((res.status === 429 || res.status >= 500) && attempt === 0) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          continue;
        }
        return { ...base, errorCode: lastErr.code, errorMessage: lastErr.message };
      }
      const data: any = await res.json();
      const text = (data?.choices?.[0]?.message?.content || '').trim();
      if (!text) {
        return { ...base, errorCode: 'unavailable', errorMessage: 'Groq returned an empty completion.' };
      }
      return {
        ...base,
        ok: true,
        text,
        realApiExecuted: true,
        tokensUsed: data?.usage?.total_tokens || estimateTokens(text),
      };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { ...base, errorCode: 'timeout', errorMessage: 'AI request timed out. Please try again.' };
      }
      lastErr = { code: 'unavailable', message: `Groq connection failed: ${err?.message || err}` };
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
    }
  }
  return { ...base, errorCode: lastErr.code, errorMessage: lastErr.message };
}

async function callClaude(
  resolved: ResolvedProvider,
  req: AiEngineRequest,
  timeoutMs: number,
): Promise<AiEngineResult> {
  const base = {
    ok: false as const,
    text: '',
    providerUsed: 'claude' as const,
    modelUsed: resolved.model,
    realApiExecuted: false,
    tokensUsed: 0,
  };
  const systemMsg =
    req.systemInstruction || req.messages.find((m) => m.role === 'system')?.content;
  const convo = req.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  const body: Record<string, any> = {
    model: resolved.model,
    max_tokens: req.maxTokens ?? 2000,
    messages: convo.length > 0 ? convo : [{ role: 'user', content: 'Hello' }],
  };
  if (systemMsg) body.system = systemMsg;
  if (req.jsonMode) {
    body.messages.push({ role: 'user', content: 'Respond with ONLY a valid JSON object, no markdown fences, no commentary.' });
  }

  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': resolved.key,
      'anthropic-version': CLAUDE_API_VERSION,
    },
    body: JSON.stringify(body),
  };

  let lastErr: { code: AiEngineErrorCode; message: string } = { code: 'unavailable', message: 'Unknown error' };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(CLAUDE_API_URL, init, timeoutMs);
      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        lastErr = mapHttpError(res.status, bodyText);
        if ((res.status === 429 || res.status >= 500) && attempt === 0) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          continue;
        }
        return { ...base, errorCode: lastErr.code, errorMessage: lastErr.message };
      }
      const data: any = await res.json();
      const blocks = Array.isArray(data?.content) ? data.content : [];
      const text = blocks.filter((b: any) => b?.type === 'text').map((b: any) => b.text || '').join('').trim();
      if (!text) {
        return { ...base, errorCode: 'unavailable', errorMessage: 'Claude returned an empty completion.' };
      }
      const usage = data?.usage || {};
      return {
        ...base,
        ok: true,
        text,
        realApiExecuted: true,
        tokensUsed: (usage.input_tokens || 0) + (usage.output_tokens || 0) || estimateTokens(text),
      };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { ...base, errorCode: 'timeout', errorMessage: 'AI request timed out. Please try again.' };
      }
      lastErr = { code: 'unavailable', message: `Claude connection failed: ${err?.message || err}` };
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
    }
  }
  return { ...base, errorCode: lastErr.code, errorMessage: lastErr.message };
}

/**
 * Generate text with the unified engine. Never throws for provider problems —
 * those come back as ok:false. Never fabricates content.
 */
/**
 * Token-usage reporter hook. server.ts registers its recorder here so that
 * EVERY successful AI call — no matter which feature or code path invoked the
 * engine — reports real token consumption. Without this, paths calling
 * generateCompletion directly would silently skip usage tracking.
 */
let tokenUsageReporter: ((modelId: string, tokensUsed: number) => void) | null = null;
export function setTokenUsageReporter(fn: (modelId: string, tokensUsed: number) => void) {
  tokenUsageReporter = fn;
}

export async function generateCompletion(req: AiEngineRequest): Promise<AiEngineResult> {
  const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const resolved = resolveProvider(req);
  if (resolved.error) {
    return {
      ok: false,
      text: '',
      providerUsed: resolved.provider,
      modelUsed: resolved.model,
      realApiExecuted: false,
      tokensUsed: 0,
      errorCode: resolved.error.code,
      errorMessage: resolved.error.message,
    };
  }
  const result = resolved.provider === 'claude'
    ? await callClaude(resolved, req, timeoutMs)
    : await callGroq(resolved, req, timeoutMs);
  // Report real usage for every successful call, regardless of caller.
  if (result.ok && tokenUsageReporter) {
    try {
      tokenUsageReporter(result.modelUsed, result.tokensUsed);
    } catch { /* telemetry only — never break the AI call */ }
  }
  return result;
}

/** Strip ```json fences some models add despite jsonMode. Shared by JSON consumers. */
export function stripCodeFences(text: string): string {
  return (text || '').replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
}

/** Which provider would serve a request right now (for status UIs). No network calls. */
export function describeAiEngineState(providerOverride?: AiEngineProvider): {
  provider: AiEngineProvider;
  model: string;
  configured: boolean;
} {
  const wantsClaude = providerOverride === 'claude';
  if (wantsClaude) {
    const key = (process.env.ANTHROPIC_API_KEY || '').trim();
    return { provider: 'claude', model: CLAUDE_DEFAULT_MODEL, configured: key.length > 0 };
  }
  const key = (process.env.GROQ_API_KEY || '').trim();
  return { provider: 'groq', model: GROQ_DEFAULT_MODEL, configured: key.length > 0 };
}

/* ============================================================================
 * PROVIDER LANES + LIVE HEALTH CHECKS
 *
 * Two lanes, explicit and honest:
 *   - FREE lane  → Groq (openai/gpt-oss-120b). Platform-funded key,
 *                  metered by Locora AI credits. The default for every feature.
 *   - PAID lane  → Claude (claude-3-7-sonnet-20250219). Requires a funded
 *                  Anthropic key (user-supplied or platform). Opt-in only;
 *                  never silently falls back to it, never bills platform credits.
 *
 * Health probes are cheap (1-token completions), time-boxed, cached for 60s,
 * and NEVER throw — a failed probe is data, not an exception.
 * ========================================================================== */

export type AiLaneId = 'free' | 'paid';

export interface AiProviderHealth {
  provider: AiEngineProvider;
  lane: AiLaneId;
  keyConfigured: boolean;
  healthy: boolean;
  latencyMs: number | null;
  httpStatus: number | null;
  error: string | null;
  checkedAt: string;
}

export interface AiLaneStatus {
  lane: AiLaneId;
  provider: AiEngineProvider;
  model: string;
  label: string;
  metering: string;
  health: AiProviderHealth;
}

const HEALTH_TIMEOUT_MS = 8000;
const HEALTH_CACHE_TTL_MS = 60000;

async function probeGroq(key: string): Promise<{ healthy: boolean; latencyMs: number | null; httpStatus: number | null; error: string | null }> {
  const started = Date.now();
  try {
    const res = await fetchWithTimeout(
      GROQ_API_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: GROQ_DEFAULT_MODEL,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      },
      HEALTH_TIMEOUT_MS,
    );
    const latencyMs = Date.now() - started;
    if (res.ok) return { healthy: true, latencyMs, httpStatus: res.status, error: null };
    const text = await res.text().catch(() => '');
    return { healthy: false, latencyMs, httpStatus: res.status, error: `Groq HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ''}` };
  } catch (err: any) {
    return {
      healthy: false,
      latencyMs: null,
      httpStatus: null,
      error: err?.name === 'AbortError' ? 'Groq probe timed out' : `Groq unreachable: ${err?.message || err}`,
    };
  }
}

async function probeClaude(key: string): Promise<{ healthy: boolean; latencyMs: number | null; httpStatus: number | null; error: string | null }> {
  const started = Date.now();
  try {
    const res = await fetchWithTimeout(
      CLAUDE_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': CLAUDE_API_VERSION,
        },
        body: JSON.stringify({
          model: CLAUDE_DEFAULT_MODEL,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      },
      HEALTH_TIMEOUT_MS,
    );
    const latencyMs = Date.now() - started;
    if (res.ok) return { healthy: true, latencyMs, httpStatus: res.status, error: null };
    const text = await res.text().catch(() => '');
    return { healthy: false, latencyMs, httpStatus: res.status, error: `Claude HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ''}` };
  } catch (err: any) {
    return {
      healthy: false,
      latencyMs: null,
      httpStatus: null,
      error: err?.name === 'AbortError' ? 'Claude probe timed out' : `Claude unreachable: ${err?.message || err}`,
    };
  }
}

async function checkProviderHealth(provider: AiEngineProvider): Promise<AiProviderHealth> {
  const checkedAt = new Date().toISOString();
  const lane: AiLaneId = provider === 'groq' ? 'free' : 'paid';
  const key = provider === 'groq'
    ? (process.env.GROQ_API_KEY || '').trim()
    : (process.env.ANTHROPIC_API_KEY || '').trim();
  const base = { provider, lane, keyConfigured: key.length > 0, checkedAt };
  if (!key) {
    return { ...base, healthy: false, latencyMs: null, httpStatus: null, error: 'No API key configured' };
  }
  const probe = provider === 'groq' ? await probeGroq(key) : await probeClaude(key);
  return { ...base, ...probe };
}

let lanesCache: { at: number; lanes: AiLaneStatus[] } | null = null;

/**
 * Live health for both lanes. Cached 60s. Never throws.
 * forceRefresh bypasses the cache (e.g. admin "recheck" button).
 */
export async function getAiLanes(forceRefresh = false): Promise<AiLaneStatus[]> {
  const now = Date.now();
  if (!forceRefresh && lanesCache && now - lanesCache.at < HEALTH_CACHE_TTL_MS) {
    return lanesCache.lanes;
  }
  const [groqHealth, claudeHealth] = await Promise.all([
    checkProviderHealth('groq'),
    checkProviderHealth('claude'),
  ]);
  const lanes: AiLaneStatus[] = [
    {
      lane: 'free',
      provider: 'groq',
      model: GROQ_DEFAULT_MODEL,
      label: 'Free lane — Groq (default)',
      metering: 'Platform key · costs 1 AI credit per use',
      health: groqHealth,
    },
    {
      lane: 'paid',
      provider: 'claude',
      model: CLAUDE_DEFAULT_MODEL,
      label: 'Paid lane — Claude (opt-in)',
      metering: 'Requires a funded Anthropic key · no platform credits used',
      health: claudeHealth,
    },
  ];
  lanesCache = { at: now, lanes };
  return lanes;
}
