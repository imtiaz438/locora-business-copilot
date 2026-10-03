/**
 * Test harness for server/aiEngine.ts — runs with mocked fetch, no real API keys.
 * Usage: npx tsx scripts/test-ai-engine.ts
 */
import { generateCompletion, stripCodeFences, describeAiEngineState } from '../server/aiEngine.ts';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, detail?: string) {
  if (cond) { passed++; console.log(`  PASS ${name}`); }
  else { failed++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- Mock fetch machinery ---------------------------------------------------
type MockHandler = (url: string, init: any) => Promise<{ status: number; body: any }>;
let handler: MockHandler | null = null;
const calls: Array<{ url: string; init: any }> = [];

// @ts-ignore — replace global fetch for the test
globalThis.fetch = async (url: string, init: any) => {
  calls.push({ url: String(url), init });
  if (!handler) throw new Error('no mock handler set');
  // Honor AbortController like a real fetch would
  if (init?.signal?.aborted) {
    const e: any = new Error('The operation was aborted.');
    e.name = 'AbortError';
    throw e;
  }
  const result = await Promise.race([
    handler(String(url), init),
    new Promise<never>((_, reject) => {
      init?.signal?.addEventListener('abort', () => {
        const e: any = new Error('The operation was aborted.');
        e.name = 'AbortError';
        reject(e);
      });
    }),
  ]);
  const { status, body } = result;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 429 ? 'Too Many Requests' : 'Error',
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    json: async () => (typeof body === 'string' ? JSON.parse(body) : body),
  } as any;
};

const groqSuccess = (text = 'Hello from Groq') => async () => ({
  status: 200,
  body: { choices: [{ message: { content: text } }], usage: { total_tokens: 42 } },
});
const claudeSuccess = (text = 'Hello from Claude') => async () => ({
  status: 200,
  body: { content: [{ type: 'text', text }], usage: { input_tokens: 10, output_tokens: 12 } },
});

async function run() {
  console.log('== aiEngine tests ==');
  delete process.env.GROQ_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;

  // 1. Groq success with user-supplied key
  handler = groqSuccess();
  calls.length = 0;
  let r = await generateCompletion({
    messages: [{ role: 'user', content: 'hi' }],
    providerKey: 'gsk_test_123',
    timeoutMs: 5000,
  });
  check('groq success → ok', r.ok === true);
  check('groq success → realApiExecuted', r.realApiExecuted === true);
  check('groq success → text', r.text === 'Hello from Groq');
  check('groq success → provider', r.providerUsed === 'groq');
  check('groq success → default model', r.modelUsed === 'llama-3.3-70b-versatile');
  check('groq success → tokens', r.tokensUsed === 42);
  check('groq success → hits groq URL', calls[0]?.url.includes('api.groq.com'));
  const sentBody = JSON.parse(calls[0]?.init.body);
  check('groq success → bearer auth', calls[0]?.init.headers.Authorization === 'Bearer gsk_test_123');
  check('groq success → temperature passthrough', sentBody.temperature === 0.7);

  // 2. No key anywhere → not_configured, no HTTP call
  handler = groqSuccess();
  calls.length = 0;
  r = await generateCompletion({ messages: [{ role: 'user', content: 'hi' }], timeoutMs: 5000 });
  check('no key → !ok', r.ok === false);
  check('no key → not_configured', r.errorCode === 'not_configured');
  check('no key → no API call made', calls.length === 0);
  check('no key → actionable message', (r.errorMessage || '').includes('Groq API key'));

  // 3. Platform env key is used when no user key
  process.env.GROQ_API_KEY = 'gsk_platform_abc';
  handler = groqSuccess();
  calls.length = 0;
  r = await generateCompletion({ messages: [{ role: 'user', content: 'hi' }], timeoutMs: 5000 });
  check('platform key → ok', r.ok === true);
  check('platform key → used', calls[0]?.init.headers.Authorization === 'Bearer gsk_platform_abc');
  delete process.env.GROQ_API_KEY;

  // 4. User key beats platform key
  process.env.GROQ_API_KEY = 'gsk_platform_abc';
  handler = groqSuccess();
  calls.length = 0;
  await generateCompletion({ messages: [{ role: 'user', content: 'hi' }], providerKey: 'gsk_user_xyz', timeoutMs: 5000 });
  check('user key precedence', calls[0]?.init.headers.Authorization === 'Bearer gsk_user_xyz');
  delete process.env.GROQ_API_KEY;

  // 5. Claude selected without key → not_configured (does NOT silently fall back to groq)
  handler = groqSuccess();
  calls.length = 0;
  r = await generateCompletion({
    messages: [{ role: 'user', content: 'hi' }],
    providerOverride: 'claude',
    timeoutMs: 5000,
  });
  check('claude no key → !ok', r.ok === false);
  check('claude no key → not_configured', r.errorCode === 'not_configured');
  check('claude no key → mentions Anthropic', (r.errorMessage || '').includes('Anthropic'));
  check('claude no key → no API call', calls.length === 0);

  // 6. Claude with key → anthropic API, correct headers/body
  handler = claudeSuccess();
  calls.length = 0;
  r = await generateCompletion({
    messages: [
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'hi' },
    ],
    providerOverride: 'claude',
    providerKey: 'sk-ant-test',
    timeoutMs: 5000,
  });
  check('claude success → ok', r.ok === true);
  check('claude success → provider', r.providerUsed === 'claude');
  check('claude success → model', r.modelUsed === 'claude-3-7-sonnet-20250219');
  check('claude success → hits anthropic', calls[0]?.url.includes('api.anthropic.com'));
  check('claude success → x-api-key', calls[0]?.init.headers['x-api-key'] === 'sk-ant-test');
  check('claude success → api version', calls[0]?.init.headers['anthropic-version'] === '2023-06-01');
  const cbody = JSON.parse(calls[0]?.init.body);
  check('claude success → system extracted', cbody.system === 'sys');
  check('claude success → tokens summed', r.tokensUsed === 22);

  // 7. Groq 429 → retried once, then rate_limited
  let n429 = 0;
  handler = async () => { n429++; return { status: 429, body: { error: { message: 'rate limit' } } }; };
  r = await generateCompletion({ messages: [{ role: 'user', content: 'hi' }], providerKey: 'gsk_x', timeoutMs: 5000 });
  check('429 → !ok', r.ok === false);
  check('429 → rate_limited', r.errorCode === 'rate_limited');
  check('429 → retried once (2 calls)', n429 === 2, `got ${n429}`);

  // 8. Groq 401 → auth_error, no retry
  let n401 = 0;
  handler = async () => { n401++; return { status: 401, body: { error: { message: 'bad key' } } }; };
  r = await generateCompletion({ messages: [{ role: 'user', content: 'hi' }], providerKey: 'gsk_bad', timeoutMs: 5000 });
  check('401 → auth_error', r.errorCode === 'auth_error');
  check('401 → no retry', n401 === 1, `got ${n401}`);

  // 9. Timeout → timeout error
  handler = () => new Promise(() => {}); // never resolves
  r = await generateCompletion({ messages: [{ role: 'user', content: 'hi' }], providerKey: 'gsk_x', timeoutMs: 300 });
  check('timeout → timeout code', r.errorCode === 'timeout', r.errorCode);

  // 10. Model allowlist: unverified model rejected → verified default
  handler = groqSuccess();
  calls.length = 0;
  r = await generateCompletion({
    messages: [{ role: 'user', content: 'hi' }],
    providerKey: 'gsk_x',
    modelOverride: 'gemini-3.6-flash',
    timeoutMs: 5000,
  });
  check('bad model → ok', r.ok === true);
  check('bad model → default used', r.modelUsed === 'llama-3.3-70b-versatile');
  check('bad model → sent default', JSON.parse(calls[0]?.init.body).model === 'llama-3.3-70b-versatile');

  // 11. Allowlisted alt model honored
  handler = groqSuccess();
  calls.length = 0;
  r = await generateCompletion({
    messages: [{ role: 'user', content: 'hi' }],
    providerKey: 'gsk_x',
    modelOverride: 'llama-3.1-8b-instant',
    timeoutMs: 5000,
  });
  check('allowlisted model honored', r.modelUsed === 'llama-3.1-8b-instant');

  // 12. jsonMode → groq response_format
  handler = groqSuccess('{"a":1}');
  calls.length = 0;
  await generateCompletion({ messages: [{ role: 'user', content: 'hi' }], providerKey: 'gsk_x', jsonMode: true, timeoutMs: 5000 });
  check('jsonMode → response_format', JSON.parse(calls[0]?.init.body).response_format?.type === 'json_object');

  // 13. stripCodeFences helper
  check('stripCodeFences', stripCodeFences('```json\n{"a":1}\n```') === '{"a":1}');

  // 14. describeAiEngineState
  delete process.env.GROQ_API_KEY;
  let s = describeAiEngineState();
  check('state → groq default', s.provider === 'groq' && s.configured === false);
  process.env.GROQ_API_KEY = 'x';
  s = describeAiEngineState();
  check('state → configured', s.configured === true);
  delete process.env.GROQ_API_KEY;

  // 15. Empty groq completion → unavailable (never empty text as success)
  handler = async () => ({ status: 200, body: { choices: [{ message: { content: '   ' } }] } });
  r = await generateCompletion({ messages: [{ role: 'user', content: 'hi' }], providerKey: 'gsk_x', timeoutMs: 5000 });
  check('empty completion → !ok', r.ok === false && r.realApiExecuted === false);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => { console.error('HARNESS ERROR', e); process.exit(2); });
