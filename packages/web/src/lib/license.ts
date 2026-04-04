import { createHmac } from 'crypto';

// ─────────────────────────────────────────────────────────────────────────────
// Offline License Verification for Comply AI
//
// Checks COMPLY_LICENSE_KEY env var against LICENSE_SIGNING_SECRET.
// No network calls — pure HMAC-SHA256 signature verification.
// ─────────────────────────────────────────────────────────────────────────────

export interface LicenseInfo {
  valid: boolean;
  product: string;
  plan: string;
  org: string;
  validUntil: string;
  expired: boolean;
}

function computeSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);
}

/**
 * Verify a license key offline.
 */
export function verifyLicenseKey(key: string, secret: string): LicenseInfo {
  const invalid: LicenseInfo = {
    valid: false,
    product: '',
    plan: '',
    org: '',
    validUntil: '',
    expired: false,
  };

  if (!key || !secret) return invalid;

  const parts = key.split('-');
  if (parts.length < 5) return invalid;

  const product = parts[0];
  const plan = parts[1];
  const signature = parts[parts.length - 1];
  const expiry = parts[parts.length - 2];
  const org = parts.slice(2, parts.length - 2).join('-');

  if (!product || !plan || !org || !expiry || !signature) return invalid;
  if (!/^\d{8}$/.test(expiry)) return invalid;

  const payload = `${product}-${plan}-${org}-${expiry}`;
  const expectedSignature = computeSignature(payload, secret);
  const valid = signature === expectedSignature;

  const year = expiry.slice(0, 4);
  const month = expiry.slice(4, 6);
  const day = expiry.slice(6, 8);
  const validUntil = `${year}-${month}-${day}`;
  const expiryDate = new Date(`${validUntil}T23:59:59Z`);
  const expired = expiryDate < new Date();

  return { valid, product: product.toLowerCase(), plan: plan.toLowerCase(), org, validUntil, expired };
}

/**
 * Check whether the current Comply AI deployment has a valid license.
 *
 * Returns license info. In production with no valid license, the dashboard
 * should show an "Unlicensed" banner.
 */
export function checkComplyLicense(): LicenseInfo & { licensed: boolean } {
  const key = process.env.COMPLY_LICENSE_KEY ?? '';
  const secret = process.env.LICENSE_SIGNING_SECRET ?? '';

  // No key at all
  if (!key) {
    return {
      valid: false,
      licensed: false,
      product: '',
      plan: '',
      org: '',
      validUntil: '',
      expired: false,
    };
  }

  const result = verifyLicenseKey(key, secret);
  const licensed = result.valid && !result.expired;

  return { ...result, licensed };
}

/**
 * Whether the unlicensed banner should show.
 * Only shows in production when there is no valid license.
 */
export function shouldShowUnlicensedBanner(): boolean {
  if (process.env.NODE_ENV !== 'production') return false;
  const { licensed } = checkComplyLicense();
  return !licensed;
}
