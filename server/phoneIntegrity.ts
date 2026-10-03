/**
 * Phone-number integrity guards.
 *
 * A stored or generated phone number is only treated as REAL when it is
 * plausibly dialable. Placeholder-shaped values — all zeros, +1 followed by
 * zeros, every digit identical, or the fictional 555-01XX range — are never
 * persisted to the database and never presented as the business's number.
 * This is the deterministic backstop behind the zero-hallucination policy:
 * prompts alone cannot be trusted to keep invented numbers out of AI copy.
 */

// Placeholder shapes, as a regex source (no delimiters, no flags).
const FAKE_PHONE_PATTERN =
  String.raw`(?:\+?1[\s\-.]?)?(?:\(?000\)?[\s\-.]?000[\s\-.]?0{4}|\(?555\)?[\s\-.]?01\d[\s\-.]*\d{4})`;

/**
 * True when the value is missing or shaped like a placeholder rather than a
 * real dialable number. Real numbers (any country, any format) pass.
 */
export function isPlaceholderPhone(phone?: string | null): boolean {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 7) return true; // too short to dial (covers '' too)
  if (/^1?0+$/.test(digits)) return true; // +1 followed by zeros, or all zeros
  if (/^(\d)\1+$/.test(digits)) return true; // every digit identical
  if (/^(?:1)?55501\d/.test(digits)) return true; // fictional 555-01XX range
  return false;
}

/**
 * Write-time guard for the database. Returns '' for placeholder-shaped input
 * so an invented number can never be stored as a business fact.
 */
export function sanitizePhoneForStorage(phone?: string | null): string {
  const p = String(phone || '').trim();
  return isPlaceholderPhone(p) ? '' : p;
}

/**
 * Removes placeholder-shaped phone numbers from AI-generated copy.
 * A stored phone that is itself placeholder-shaped is treated as missing —
 * it is never trusted, never substituted.
 */
export function stripFakePhones(text: string, realPhone?: string): string {
  if (!text) return text;
  const effectivePhone =
    realPhone && !isPlaceholderPhone(realPhone) ? realPhone : undefined;
  const connectors =
    String.raw`\s+(?:at|on)\s+` + FAKE_PHONE_PATTERN + String.raw`|\s*:\s*` + FAKE_PHONE_PATTERN;
  let out = text.replace(
    new RegExp(connectors, 'gi'),
    effectivePhone ? ' ' + effectivePhone : ''
  );
  out = out.replace(new RegExp(FAKE_PHONE_PATTERN, 'g'), effectivePhone || '');
  // Tidy double spaces left behind (but never collapse intentional formatting).
  out = out.replace(/ {2,}/g, ' ');
  return out;
}
