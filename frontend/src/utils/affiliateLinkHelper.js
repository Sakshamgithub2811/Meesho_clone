/**
 * Affiliate & Reseller Link Helper
 * Provides obfuscation for reseller margins in shareable URLs so customers
 * never see "margin=100" in plain text, preventing price tampering and margin discovery.
 */

const SALT_MULTIPLIER = 47;
const SALT_OFFSET = 137;
const MAX_ALLOWED_MARGIN = 10000;

/**
 * Obfuscate numeric margin into an opaque token parameter (e.g., "sp_3qd_g")
 * @param {number|string} margin
 * @returns {string} Obfuscated token or empty string if 0 / invalid
 */
export function encodeMargin(margin) {
  const num = Math.round(Number(margin) || 0);
  if (num <= 0) return '';
  if (num > MAX_ALLOWED_MARGIN) return '';

  const scrambled = (num * SALT_MULTIPLIER + SALT_OFFSET).toString(36);
  const checksum = ((num * 7) % 36).toString(36);
  return `sp_${scrambled}_${checksum}`;
}

/**
 * Decode obfuscated token back into numeric margin.
 * Gracefully falls back to plain numeric for backwards compatibility with legacy links.
 * @param {string} token
 * @returns {number} Decoded numeric margin or 0
 */
export function decodeMargin(token) {
  if (!token || typeof token !== 'string') return 0;
  const trimmed = token.trim();

  try {
    // 1. Check if token is the obfuscated "sp_" format
    if (trimmed.startsWith('sp_')) {
      const parts = trimmed.split('_');
      if (parts.length >= 3) {
        const scrambled = parts[1];
        const checksum = parts[2];
        const val = parseInt(scrambled, 36);
        const num = (val - SALT_OFFSET) / SALT_MULTIPLIER;
        if (num > 0 && Math.round(num) === num && ((num * 7) % 36).toString(36) === checksum) {
          return Math.min(Math.max(0, Math.round(num)), MAX_ALLOWED_MARGIN);
        }
      }
    }

    // 2. Backwards compatibility fallback for legacy plain numeric margin
    const rawNum = Number(trimmed);
    if (!isNaN(rawNum) && rawNum > 0 && rawNum <= MAX_ALLOWED_MARGIN) {
      return Math.round(rawNum);
    }
  } catch (e) {
    console.warn('Failed to parse affiliate margin token:', e);
  }

  return 0;
}

/**
 * Extract and decode margin from URL search parameters.
 * Checks obfuscated 'sp' parameter first, then falls back to legacy 'margin' and 'm'.
 * @param {URLSearchParams|string} searchParams
 * @returns {number} Decoded margin (default 0)
 */
export function getAffiliateMarginFromParams(searchParams) {
  if (!searchParams) return 0;
  const params = typeof searchParams === 'string'
    ? new URLSearchParams(searchParams)
    : searchParams;

  const spToken = params.get('sp');
  if (spToken) {
    const decoded = decodeMargin(spToken);
    if (decoded > 0) return decoded;
  }

  // Legacy fallback
  const legacyMargin = params.get('margin') || params.get('m');
  if (legacyMargin) {
    const decoded = decodeMargin(legacyMargin);
    if (decoded > 0) return decoded;
  }

  return 0;
}

/**
 * Generate a shareable affiliate product URL with obfuscated margin
 * @param {Object} options
 * @param {string} options.productId
 * @param {string} [options.refCode]
 * @param {number|string} [options.margin]
 * @param {string} [options.origin]
 * @param {boolean} [options.isReseller]
 * @returns {string} Full share URL
 */
export function buildAffiliateProductUrl({
  productId,
  refCode = 'MSHOPPYAFF',
  margin = 0,
  origin,
  isReseller = false
}) {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const params = new URLSearchParams();

  if (productId) {
    params.set('id', productId);
  }
  if (refCode && refCode.trim()) {
    params.set('ref', refCode.trim());
  }

  const numMargin = Number(margin) || 0;
  if (numMargin > 0) {
    params.set('sp', encodeMargin(numMargin));
  }

  if (isReseller) {
    params.set('source', 'reseller');
  }

  return `${base}/product?${params.toString()}`;
}
