export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  normalizedEmail?: string;
}

export function validateRealEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Please enter an email address.' };
  }

  const trimmed = email.trim().toLowerCase();

  // Basic RFC 5322 format regex check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid, complete email address (e.g. name@company.com).' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed email address.' };
  }

  const [localPart, domainPart] = parts;

  // Check local part
  if (localPart.length < 2) {
    return { valid: false, error: 'Email username prefix is too short. Please enter a valid email address.' };
  }

  // Reject obvious fake/placeholder local parts
  const fakeLocalParts = ['test', 'testing', 'asdf', 'qwerty', 'fake', 'abc', 'xyz', '12345', '123456', 'temp', 'dummy', 'sample', 'testuser'];
  if (fakeLocalParts.includes(localPart)) {
    return { valid: false, error: `"${localPart}" is a placeholder prefix. Please enter your real email address.` };
  }

  // Check domain structure
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) {
    return { valid: false, error: 'Email domain is missing a top-level extension (e.g. .com, .org, .net).' };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { valid: false, error: 'Invalid top-level domain extension.' };
  }

  // Reject fake or disposable domains
  const fakeDomains = [
    'test.com', 'testing.com', 'example.com', 'asdf.com', 'qwerty.com', 'fake.com',
    'temp.com', 'dummy.com', 'invalid.com', 'sample.com', 'foo.com', 'bar.com',
    'domain.com', 'mailinator.com', 'yopmail.com', 'guerrillamail.com', '10minutemail.com',
    'trashmail.com', 'dispostable.com', 'sharklasers.com', 'getairmail.com', 'tempmail.com',
    'disposable.com', 'maildrop.cc'
  ];

  if (fakeDomains.includes(domainPart)) {
    return { valid: false, error: `The domain "${domainPart}" is a test or temporary email provider. Please enter a valid real email address.` };
  }

  // Reject invalid TLDs
  const fakeTlds = ['test', 'example', 'invalid', 'local', 'localhost', 'internal', 'temp'];
  if (fakeTlds.includes(tld)) {
    return { valid: false, error: `".${tld}" is not a valid public domain extension. Please use a real email address.` };
  }

  return { valid: true, normalizedEmail: trimmed };
}
