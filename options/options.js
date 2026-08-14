// AI Export Assistant - Options Page

(function () {
  'use strict';

  const licenseKeyInput = document.getElementById('license-key');
  const activateBtn = document.getElementById('activate-btn');
  const deactivateBtn = document.getElementById('deactivate-btn');
  const activationStatus = document.getElementById('activation-status');
  const statusText = document.getElementById('status-text');
  const usageInfo = document.getElementById('usage-info');
  const buyBtn = document.getElementById('buy-btn');

  const PURCHASE_URL = 'https://gumroad.com/l/aiexpor';

  // ---- Init ----
  document.addEventListener('DOMContentLoaded', async () => {
    buyBtn.href = PURCHASE_URL;
    await updateUI();
  });

  async function updateUI() {
    const result = await chrome.storage.local.get(['licenseKey', 'licenseVerified', 'exportCount', 'installDate']);
    const isLicensed = !!result.licenseKey && result.licenseVerified;

    if (isLicensed) {
      statusText.textContent = '✅ Activated — Full version';
      statusText.style.color = '#34c759';
      licenseKeyInput.value = result.licenseKey || '';
      activateBtn.classList.add('hidden');
      deactivateBtn.classList.remove('hidden');
      activationStatus.textContent = '';
    } else {
      statusText.textContent = '⚠️ Free version — 5 exports limit';
      statusText.style.color = '#ff9500';
      activateBtn.classList.remove('hidden');
      deactivateBtn.classList.add('hidden');
    }

    const count = result.exportCount || 0;
    const maxFree = 5;
    const remaining = Math.max(0, maxFree - count);
    usageInfo.textContent = `Exports used: ${count} / ${isLicensed ? '∞' : maxFree} (${remaining} free remaining)`;
  }

  // ---- Activate ----
  activateBtn.addEventListener('click', async () => {
    const key = licenseKeyInput.value.trim();
    if (!key) {
      activationStatus.textContent = '⚠️ Please enter a license key.';
      activationStatus.className = 'status status-err';
      return;
    }

    activationStatus.textContent = '⏳ Verifying...';
    activationStatus.className = 'status';

    const response = await chrome.runtime.sendMessage({
      action: 'verify-license',
      licenseKey: key
    });

    if (response && response.success) {
      activationStatus.textContent = '✅ License activated successfully!';
      activationStatus.className = 'status status-ok';
      await updateUI();
    } else {
      activationStatus.textContent = `❌ ${response?.error || 'Activation failed.'}`;
      activationStatus.className = 'status status-err';
    }
  });

  // ---- Deactivate ----
  deactivateBtn.addEventListener('click', async () => {
    if (!confirm('Deactivate license on this device? You can reactivate later.')) return;

    const response = await chrome.runtime.sendMessage({ action: 'deactivate-license' });
    activationStatus.textContent = '🔓 License deactivated.';
    activationStatus.className = 'status';
    await updateUI();
  });

  // ---- Enter key to activate ----
  licenseKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') activateBtn.click();
  });
})();