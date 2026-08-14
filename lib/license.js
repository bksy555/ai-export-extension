// AI Export Assistant - License Verification
// Handles Lemon Squeezy license key verification and trial management

(function () {
  'use strict';

  window.AIExport = window.AIExport || {};

  /**
   * Maximum free exports before requiring a license
   */
  const MAX_FREE_EXPORTS = 5;

  /**
   * Lemon Squeezy product configuration
   * TODO: Replace with your actual product ID and store URL
   */
  const LEMON_SQUEEZY = {
    productId: 'YOUR_PRODUCT_ID',
    storeUrl: 'https://yourstore.lemonsqueezy.com/checkout/buy/your-product-id'
  };

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
   * Verify a license key with Lemon Squeezy API
   * @param {string} key - License key
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  window.AIExport.verifyLicense = async function (key) {
    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: key,
          instance_name: `browser-${Date.now()}`,
          meta: { user_agent: navigator.userAgent }
        })
      });

      const data = await response.json();

      if (data.activated) {
        await chrome.storage.local.set({
          licenseKey: key,
          licenseVerified: true,
          licenseInstanceId: data.instance?.id || null,
          licenseExpiresAt: data.expires_at || null
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid license key.' };
      }
    } catch (err) {
      // Offline fallback: check if stored key matches
      const stored = await chrome.storage.local.get(['licenseKey']);
      if (stored.licenseKey === key) {
        return { success: true, offline: true };
      }
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  /**
   * Deactivate license
   */
  window.AIExport.deactivateLicense = async function () {
    const stored = await chrome.storage.local.get(['licenseKey', 'licenseInstanceId']);
    if (stored.licenseKey && stored.licenseInstanceId) {
      try {
        await fetch('https://api.lemonsqueezy.com/v1/licenses/deactivate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            license_key: stored.licenseKey,
            instance_id: stored.licenseInstanceId
          })
        });
      } catch (e) { /* ignore offline */ }
    }
    await chrome.storage.local.set({
      licenseKey: null,
      licenseVerified: false,
      licenseInstanceId: null
    });
  };

  /**
   * Get purchase URL
   */
  window.AIExport.getPurchaseUrl = function () {
    return LEMON_SQUEEZY.storeUrl;
  };
})();