// AI Export Assistant - License Verification
// Handles Gumroad license key verification and trial management
// Gumroad License Verify API: https://gumroad.com/api#licenses
// The verify endpoint is public (no seller API key needed), designed
// for third-party apps to validate licenses.

(function () {
  'use strict';

  window.AIExport = window.AIExport || {};

  /**
   * Maximum free exports before requiring a license
   */
  const MAX_FREE_EXPORTS = 5;

  /**
   * Gumroad product configuration
   * TODO: Replace YOUR_GUMROAD_PRODUCT_ID with your real product ID.
   * How to find it: open your product in Gumroad dashboard →
   * the edit page URL looks like:
   *   https://app.gumroad.com/products/<PRODUCT_ID>/edit
   * Copy the <PRODUCT_ID> part.
   */
  const GUMROAD = {
    productId: 'YOUR_GUMROAD_PRODUCT_ID',
    // Gumroad verify API (public, no auth)
    verifyUrl: 'https://api.gumroad.com/v2/licenses/verify',
    // Your Gumroad product page URL (for the Buy button)
    storeUrl: 'https://gumroad.com/l/YOUR_PRODUCT_PERMALINK'
  };

  /**
   * Validate Gumroad license key via the public API.
   * @param {string} key - License key from Gumroad
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async function checkGumroadLicense(key) {
    if (!key || !key.trim()) {
      return { ok: false, error: 'License key is empty.' };
    }
    if (!GUMROAD.productId || GUMROAD.productId === 'YOUR_GUMROAD_PRODUCT_ID') {
      return { ok: false, error: 'Product not configured. Please contact support.' };
    }

    const body = new URLSearchParams();
    body.append('product_id', GUMROAD.productId);
    body.append('license_key', key.trim());

    const response = await fetch(GUMROAD.verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    if (response.status === 404) {
      return { ok: false, error: 'Invalid license key.' };
    }
    if (!response.ok) {
      return { ok: false, error: `Gumroad error (HTTP ${response.status}). Please try again.` };
    }

    const data = await response.json();
    if (data && data.success) {
      return {
        ok: true,
        purchase: data.purchase || {}
      };
    }
    return { ok: false, error: data.message || 'License verification failed.' };
  }

  /**
   * Get current license status
   * @returns {Promise<{licensed: boolean, exportCount: number, remaining: number}>}
   */
  window.AIExport.getLicenseStatus = async function () {
    const result = await chrome.storage.local.get(['licenseKey', 'licenseVerified', 'exportCount']);
    const licensed = !!(result.licenseKey && result.licenseVerified);
    const exportCount = result.exportCount || 0;
    const remaining = Math.max(0, MAX_FREE_EXPORTS - exportCount);
    return { licensed, exportCount, remaining, maxFree: MAX_FREE_EXPORTS };
  };

  /**
   * Check if user can export
   * @returns {Promise<{canExport: boolean, reason?: string}>}
   */
  window.AIExport.canExport = async function () {
    const status = await window.AIExport.getLicenseStatus();
    if (status.licensed) {
      return { canExport: true };
    }
    if (status.exportCount >= MAX_FREE_EXPORTS) {
      return { canExport: false, reason: 'limit_reached' };
    }
    return { canExport: true };
  };

  /**
   * Increment export count (for free users)
   */
  window.AIExport.incrementExportCount = async function () {
    const result = await chrome.storage.local.get(['exportCount']);
    const count = (result.exportCount || 0) + 1;
    await chrome.storage.local.set({ exportCount: count });
    return count;
  };

  /**
   * Verify a license key with Gumroad API
   * @param {string} key - License key
   * @returns {Promise<{success: boolean, error?: string, offline?: boolean}>}
   */
  window.AIExport.verifyLicense = async function (key) {
    try {
      const res = await checkGumroadLicense(key);
      if (res.ok) {
        const normalizedKey = key.trim();
        await chrome.storage.local.set({
          licenseKey: normalizedKey,
          licenseVerified: true,
          licenseEmail: res.purchase.email || null,
          licenseProductName: res.purchase.product_name || null,
          licenseVerifiedAt: Date.now()
        });
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid license key.' };
    } catch (err) {
      // Offline fallback: if the previously stored key matches, keep access
      const stored = await chrome.storage.local.get(['licenseKey']);
      if (stored.licenseKey && stored.licenseKey === key.trim()) {
        return { success: true, offline: true };
      }
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  /**
   * Deactivate license (local only — Gumroad licenses are always valid;
   * removing the stored key effectively deactivates this device)
   */
  window.AIExport.deactivateLicense = async function () {
    await chrome.storage.local.set({
      licenseKey: null,
      licenseVerified: false,
      licenseEmail: null,
      licenseProductName: null,
      licenseVerifiedAt: null
    });
  };

  /**
   * Get purchase URL
   */
  window.AIExport.getPurchaseUrl = function () {
    return GUMROAD.storeUrl;
  };
})();