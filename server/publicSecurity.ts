import dns from 'dns';
import { URL } from 'url';

// ---------------------------------------------------------------------------
// PUBLIC CHECKUP SECURITY & SSRF PROTECTION ENGINE
// ---------------------------------------------------------------------------

// 1. IP Range Checker Helpers
function isPrivateOrReservedIp(ip: string): boolean {
  // Normalize IPv4-mapped IPv6 (e.g., ::ffff:127.0.0.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // IPv4 Checks
  const ipv4Parts = ip.split('.').map((p) => parseInt(p, 10));
  if (ipv4Parts.length === 4 && ipv4Parts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
    const [b0, b1, b2, b3] = ipv4Parts;

    // 0.0.0.0/8 (Current network)
    if (b0 === 0) return true;

    // 127.0.0.0/8 (Loopback / localhost)
    if (b0 === 127) return true;

    // 10.0.0.0/8 (Private RFC 1918)
    if (b0 === 10) return true;

    // 172.16.0.0/12 (Private RFC 1918)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

    // 192.168.0.0/16 (Private RFC 1918)
    if (b0 === 192 && b1 === 168) return true;

    // 169.254.0.0/16 (Link-Local & Cloud Metadata: e.g. 169.254.169.254)
    if (b0 === 169 && b1 === 254) return true;

    // 100.64.0.0/10 (Carrier-Grade NAT)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

    // 192.0.0.0/24, 192.0.2.0/24 (IETF Protocol Assignments & TEST-NET-1)
    if (b0 === 192 && b1 === 0 && (b2 === 0 || b2 === 2)) return true;

    // 198.51.100.0/24 (TEST-NET-2)
    if (b0 === 198 && b1 === 51 && b2 === 100) return true;

    // 203.0.113.0/24 (TEST-NET-3)
    if (b0 === 203 && b1 === 0 && b2 === 113) return true;

    // 224.0.0.0/4 (Multicast)
    if (b0 >= 224 && b0 <= 239) return true;

    // 240.0.0.0/4 (Reserved / Future Use)
    if (b0 >= 240) return true;

    // 255.255.255.255 (Broadcast)
    if (b0 === 255 && b1 === 255 && b2 === 255 && b3 === 255) return true;

    return false;
  }

  // IPv6 Checks
  const lowerIp = ip.toLowerCase();
  if (lowerIp === '::1' || lowerIp === '::' || lowerIp === '0:0:0:0:0:0:0:1') {
    return true; // Loopback
  }
  if (lowerIp.startsWith('fc00:') || lowerIp.startsWith('fd')) {
    return true; // Unique Local Address (ULA)
  }
  if (lowerIp.startsWith('fe80:') || lowerIp.startsWith('fe9') || lowerIp.startsWith('fea') || lowerIp.startsWith('feb')) {
    return true; // Link-Local Unicast
  }

  return false;
}

// 2. Blacklisted Hostnames & Domains
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'metadata.google.internal',
  'metadata',
  'instance-data',
  'local',
]);

const BLOCKED_HOSTNAME_PATTERNS = [
  /\.localhost$/i,
  /\.internal$/i,
  /\.local$/i,
  /\.lan$/i,
  /\.home$/i,
  /\.corp$/i,
  /\.onion$/i,
  /\.arpa$/i,
  /169\.254\./,
  /metadata\.google/i,
  /aws-metadata/i,
  /127\.\d+\.\d+\.\d+/,
];

export interface ValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  hostname?: string;
  error?: string;
  statusCode?: number;
}

// 3. URL Normalization & Validation
export function validateAndNormalizeUrl(rawInput: string): ValidationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      valid: false,
      error: 'Please enter a valid website URL.',
      statusCode: 400,
    };
  }

  let cleaned = rawInput.trim();
  if (cleaned.length < 3 || cleaned.length > 2000) {
    return {
      valid: false,
      error: 'Website URL must be between 3 and 2,000 characters.',
      statusCode: 400,
    };
  }

  // Remove potential dangerous schemes or tags
  if (/^(javascript|data|file|vbscript|ftp|gopher):/i.test(cleaned)) {
    return {
      valid: false,
      error: 'Security Error: Only HTTP and HTTPS protocols are permitted.',
      statusCode: 400,
    };
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    return {
      valid: false,
      error: 'The provided URL could not be parsed. Please check the spelling (e.g., example.com).',
      statusCode: 400,
    };
  }

  // Only allow http and https protocols
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: 'Invalid protocol: Only standard HTTP and HTTPS websites can be audited.',
      statusCode: 400,
    };
  }

  // Disallow userinfo (e.g. https://user:pass@example.com)
  if (parsed.username || parsed.password) {
    return {
      valid: false,
      error: 'Security restriction: URLs containing credentials are not permitted.',
      statusCode: 400,
    };
  }

  // Port restrictions: Only allow standard 80, 443, or empty
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    return {
      valid: false,
      error: `Security restriction: Non-standard port :${parsed.port} is blocked. Only ports 80 and 443 are supported.`,
      statusCode: 403,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check explicit blacklisted hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      valid: false,
      error: 'Access Forbidden: Localhost and internal server targets cannot be audited.',
      statusCode: 403,
    };
  }

  for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
    if (pattern.test(hostname)) {
      return {
        valid: false,
        error: 'Access Forbidden: Internal infrastructure and metadata endpoints cannot be crawled.',
        statusCode: 403,
      };
    }
  }

  // Domain format validation: must have at least one dot (unless public TLD check, e.g. example.com)
  if (!hostname.includes('.') || hostname.endsWith('.')) {
    return {
      valid: false,
      error: 'Please provide a valid fully-qualified domain name (e.g., yourbusiness.com).',
      statusCode: 400,
    };
  }

  return {
    valid: true,
    normalizedUrl: parsed.href,
    hostname,
  };
}

// 4. DNS Asynchronous Resolution & SSRF Guard
export async function verifyDnsAndSsrfSafety(hostname: string): Promise<{ safe: boolean; error?: string }> {
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });

    if (!addresses || addresses.length === 0) {
      return {
        safe: false,
        error: `DNS resolution failed: Domain "${hostname}" does not appear to exist or has no active DNS A/AAAA records.`,
      };
    }

    for (const record of addresses) {
      if (isPrivateOrReservedIp(record.address)) {
        return {
          safe: false,
          error: `Security Policy Violation: Host "${hostname}" resolves to private/internal network IP (${record.address}). Connection aborted.`,
        };
      }
    }

    return { safe: true };
  } catch (err: any) {
    return {
      safe: false,
      error: `DNS lookup failed for "${hostname}": ${err.message || 'Unable to resolve domain'}`,
    };
  }
}

// 5. In-Memory Client Rate Limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 12; // 12 audits per 15 mins per IP

export function checkPublicRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
} {
  const cleanIp = ip || 'anonymous';
  const now = Date.now();
  const record = rateLimitMap.get(cleanIp);

  // Clean old records periodically if map grows
  if (rateLimitMap.size > 5000) {
    rateLimitMap.forEach((val, key) => {
      if (val.resetAt < now) rateLimitMap.delete(key);
    });
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(cleanIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - record.count,
  };
}

// 6. Concurrency Limiter to protect server resources
let activePublicCrawlsCount = 0;
const MAX_CONCURRENT_PUBLIC_CRAWLS = 3;

export function acquireCrawlSlot(): boolean {
  if (activePublicCrawlsCount >= MAX_CONCURRENT_PUBLIC_CRAWLS) {
    return false;
  }
  activePublicCrawlsCount += 1;
  return true;
}

export function releaseCrawlSlot(): void {
  activePublicCrawlsCount = Math.max(0, activePublicCrawlsCount - 1);
}
