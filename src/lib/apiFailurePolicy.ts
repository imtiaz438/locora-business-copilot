/**
 * API FAILURE POLICY ENGINE
 * 
 * Strict Error Handling & Data Integrity Standard for Every External Provider:
 * 
 * SUCCESS
 * → normalize data
 * → save data
 * → display data
 * 
 * NO API KEY
 * → provider_status = not_configured
 * → display connection/configuration state
 * 
 * INVALID API KEY
 * → provider_status = authentication_error
 * → display error
 * 
 * QUOTA EXCEEDED
 * → provider_status = quota_exceeded
 * → display error
 * 
 * NETWORK ERROR
 * → provider_status = unavailable
 * → display error
 * 
 * NO DATA
 * → provider_status = connected_no_data
 * → display empty state
 * 
 * NEVER:
 * - API failure → fake data
 * - API unavailable → demo data
 * - No records → sample records
 */

export type ProviderStatus =
  | 'success'
  | 'not_configured'
  | 'authentication_error'
  | 'quota_exceeded'
  | 'unavailable'
  | 'connected_no_data';

export interface ProviderExecutionResult<T = any> {
  provider_status: ProviderStatus;
  provider: string;
  providerName: string;
  data: T | null;
  message: string;
  error?: string;
  statusCode?: number;
  timestamp: string;
}

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  google_maps: 'Google Maps & Places API',
  google_places: 'Google Places API',
  dataforseo: 'DataForSEO API',
  serpapi: 'SerpApi Search Engine',
  serper: 'Serper.dev API',
  gemini: 'Google Gemini AI',
  openai: 'OpenAI GPT Models',
  anthropic: 'Anthropic Claude',
  perplexity: 'Perplexity AI',
  deepseek: 'DeepSeek AI',
  groq: 'Groq LPU Acceleration',
  apollo: 'Apollo.io B2B Intelligence',
  hunter: 'Hunter.io Email Discovery',
  millionverifier: 'MillionVerifier Deliverability API',
  pagespeed: 'Google PageSpeed Insights API',
};

/**
 * Classifies an API execution into a strict ProviderStatus
 */
export function determineProviderStatus(params: {
  apiKey?: string | null;
  statusCode?: number;
  errorMessage?: string;
  hasData?: boolean;
  dataCount?: number;
}): { status: ProviderStatus; message: string } {
  const { apiKey, statusCode, errorMessage, hasData, dataCount } = params;

  // 1. NO API KEY → not_configured
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return {
      status: 'not_configured',
      message: 'API key not configured. Please add your credentials in Settings to enable live provider data.',
    };
  }

  const errStr = (errorMessage || '').toLowerCase();

  // 2. INVALID API KEY (HTTP 401, 403, or auth messages) → authentication_error
  if (
    statusCode === 401 ||
    statusCode === 403 ||
    errStr.includes('401') ||
    errStr.includes('403') ||
    errStr.includes('unauthorized') ||
    errStr.includes('forbidden') ||
    errStr.includes('invalid api key') ||
    errStr.includes('invalid_api_key') ||
    errStr.includes('request_denied') ||
    errStr.includes('api_key_invalid') ||
    errStr.includes('authentication failed') ||
    errStr.includes('bad_credentials')
  ) {
    return {
      status: 'authentication_error',
      message: 'Authentication failed. The configured API key was rejected by the provider (HTTP 401/403 or REQUEST_DENIED).',
    };
  }

  // 3. QUOTA EXCEEDED (HTTP 429, out of balance/credits) → quota_exceeded
  if (
    statusCode === 429 ||
    errStr.includes('429') ||
    errStr.includes('quota') ||
    errStr.includes('rate limit') ||
    errStr.includes('rate_limit_exceeded') ||
    errStr.includes('resource_exhausted') ||
    errStr.includes('over_query_limit') ||
    errStr.includes('balance') ||
    errStr.includes('insufficient_quota') ||
    errStr.includes('credits exhausted')
  ) {
    return {
      status: 'quota_exceeded',
      message: 'Provider quota or rate limit exceeded. Your account has exhausted available query credits or hit request thresholds.',
    };
  }

  // 4. NETWORK ERROR (5xx, timeout, unreachable, connection reset) → unavailable
  if (
    (statusCode && statusCode >= 500) ||
    errStr.includes('timeout') ||
    errStr.includes('aborterror') ||
    errStr.includes('econnrefused') ||
    errStr.includes('enotfound') ||
    errStr.includes('network') ||
    errStr.includes('unavailable') ||
    errStr.includes('bad gateway') ||
    errStr.includes('gateway timeout') ||
    errStr.includes('fetch failed')
  ) {
    return {
      status: 'unavailable',
      message: 'Provider service is temporarily unavailable or encountered a network connection failure.',
    };
  }

  // Check if error message indicates general failure
  if (errStr && !hasData && dataCount === 0) {
    return {
      status: 'unavailable',
      message: errorMessage || 'Provider request failed. Service is currently unavailable.',
    };
  }

  // 5. NO DATA (Successfully called provider, but query returned 0 records) → connected_no_data
  if (hasData === false || dataCount === 0) {
    return {
      status: 'connected_no_data',
      message: 'Connected to provider successfully, but no matching records were found for this query.',
    };
  }

  // 6. SUCCESS → success
  return {
    status: 'success',
    message: 'Data successfully retrieved and normalized from provider.',
  };
}

/**
 * Formats a clean standard provider execution payload
 */
export function createProviderExecutionResult<T>(params: {
  provider: string;
  providerName?: string;
  apiKey?: string | null;
  data?: T | null;
  dataCount?: number;
  statusCode?: number;
  error?: any;
}): ProviderExecutionResult<T> {
  const providerKey = params.provider.toLowerCase();
  const providerName = params.providerName || PROVIDER_DISPLAY_NAMES[providerKey] || params.provider;
  const errorMessage = params.error ? (params.error.message || String(params.error)) : undefined;

  let hasData = false;
  let count = 0;

  if (params.dataCount !== undefined) {
    count = params.dataCount;
    hasData = count > 0;
  } else if (Array.isArray(params.data)) {
    count = params.data.length;
    hasData = count > 0;
  } else if (params.data && typeof params.data === 'object' && Object.keys(params.data).length > 0) {
    hasData = true;
    count = 1;
  }

  const { status, message } = determineProviderStatus({
    apiKey: params.apiKey,
    statusCode: params.statusCode,
    errorMessage,
    hasData: params.error ? false : hasData,
    dataCount: params.error ? 0 : count,
  });

  return {
    provider_status: status,
    provider: params.provider,
    providerName,
    data: status === 'success' ? (params.data ?? null) : null,
    message,
    error: errorMessage,
    statusCode: params.statusCode,
    timestamp: new Date().toISOString(),
  };
}
