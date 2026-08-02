'use strict';

const token = () => localStorage.getItem('tryammToken') || localStorage.getItem('token') || '';
const headers = (json = false) => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  ...(token() ? { Authorization: `Bearer ${token()}` } : {})
});
const $ = id => document.getElementById(id);

function toast(message, error = false) {
  const node = $('toast');
  node.textContent = message;
  node.className = error ? 'show error' : 'show';
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { node.className = ''; }, 3500);
}

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...headers(Boolean(options.body)), ...(options.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

function renderJson(node, value) {
  node.textContent = JSON.stringify(value, null, 2);
}

async function loadAuthState() {
  if (!token()) {
    $('authState').textContent = 'Signed out';
    return false;
  }
  try {
    const result = await api('/api/me');
    $('authState').textContent = result.user?.displayName || 'Signed in';
    return true;
  } catch {
    $('authState').textContent = 'Session expired';
    return false;
  }
}

async function loadProfile() {
  const result = await api('/api/profile/experience');
  $('ageLane').value = result.ageLane || 'adult';
  const a = result.accessibility || {};
  for (const id of ['oneHandMode','captions','reducedMotion','screenReaderOptimized','highContrast']) $(id).checked = Boolean(a[id]);
}

async function saveProfile() {
  const accessibility = {};
  for (const id of ['oneHandMode','captions','reducedMotion','screenReaderOptimized','highContrast']) accessibility[id] = $(id).checked;
  const result = await api('/api/profile/experience', {
    method: 'PUT',
    body: JSON.stringify({ ageLane: $('ageLane').value, accessibility })
  });
  document.body.classList.toggle('reduced-motion', result.accessibility.reducedMotion);
  document.body.classList.toggle('high-contrast', result.accessibility.highContrast);
  toast('Experience profile saved');
}

async function loadJourney() {
  const result = await api('/api/experience/v1');
  $('worldState').textContent = result.journey?.world?.name || 'Not available';
  $('gameState').textContent = result.journey?.game?.name || 'Not available';
  $('commerceState').textContent = [result.journey?.store?.name, result.journey?.liveRoom?.title || 'No live room currently'].filter(Boolean).join(' · ');
  renderJson($('journeyOutput'), result);
  toast('Version 1 journey loaded');
}

async function prepareTeleport() {
  const result = await api('/api/enter-globe/prepare', {
    method: 'POST',
    body: JSON.stringify({ worldId: 'herrin', mode: '3d' })
  });
  $('teleportState').textContent = result.session?.state || 'Prepared';
  $('worldState').textContent = result.session?.worldName || 'Herrin Community Twin';
  renderJson($('journeyOutput'), result);
  toast('Herrin arrival bubble prepared');
}

async function loadProviders() {
  const result = await api('/api/payments/nigeria/providers');
  const container = $('providerCards');
  container.innerHTML = '';
  for (const provider of result.providers || []) {
    const card = document.createElement('article');
    card.innerHTML = `<h3>${provider.name || provider.id}</h3><p>State: <strong>${provider.state}</strong></p><p>Configured: ${provider.configured ? 'yes' : 'no'}</p><p>Production: ${provider.productionEnabled ? 'enabled' : 'blocked'}</p>`;
    container.appendChild(card);
  }
  if (!container.children.length) container.innerHTML = '<p>No providers registered.</p>';
}

async function createPaymentIntent(event) {
  event.preventDefault();
  const result = await api('/api/payments/nigeria/intents', {
    method: 'POST',
    body: JSON.stringify({
      provider: $('provider').value,
      purpose: $('purpose').value,
      currency: 'NGN',
      amountMinor: Number($('amountMinor').value),
      idempotencyKey: `ui-${Date.now()}-${Math.random().toString(16).slice(2)}`
    })
  });
  renderJson($('paymentOutput'), result);
  toast('Nigeria sandbox payment intent created');
}

window.addEventListener('DOMContentLoaded', async () => {
  const signedIn = await loadAuthState();
  $('saveProfile').addEventListener('click', () => saveProfile().catch(error => toast(error.message, true)));
  $('loadJourney').addEventListener('click', () => loadJourney().catch(error => toast(error.message, true)));
  $('prepareTeleport').addEventListener('click', () => prepareTeleport().catch(error => toast(error.message, true)));
  $('loadProviders').addEventListener('click', () => loadProviders().catch(error => toast(error.message, true)));
  $('paymentForm').addEventListener('submit', event => createPaymentIntent(event).catch(error => toast(error.message, true)));

  await loadProviders().catch(() => {});
  if (signedIn) {
    await loadProfile().catch(error => toast(error.message, true));
    await loadJourney().catch(() => {});
  }
});
