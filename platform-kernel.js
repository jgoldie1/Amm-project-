'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadJson(relativePath, fallback) {
  try {
    const fullPath = path.join(__dirname, relativePath);
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    console.warn(`Kernel registry unavailable: ${relativePath}`, error.message);
    return fallback;
  }
}

function safeLane(value) {
  return ['child', 'teen', 'adult'].includes(value) ? value : 'adult';
}

function safeModes(value) {
  const allowed = new Set(['2d', '3d', 'ar', 'vr', 'mr', 'holographic']);
  const values = Array.isArray(value) ? value : [value || '3d'];
  return [...new Set(values.filter(mode => allowed.has(mode)))];
}

module.exports = function registerPlatformKernel({ app, auth, clean, id, getStore, saveStore }) {
  const admin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access required' });
  require('./nigeria-payments')({ app, auth, admin, clean, id, getStore, saveStore });
  require('./integration-health')({ app, auth, admin });

  const features = loadJson('config/features.json', loadJson('packages/config/features.json', []));
  const worlds = loadJson('config/worlds.json', loadJson('packages/config/worlds.json', []));
  const nigeria = loadJson('config/global-launch/nigeria.json', {
    countryCode: 'NG', currency: 'NGN', launchState: 'sandbox', priority: 'active-build'
  });
  const africaProviders = loadJson('config/payments/africa-providers.json', {
    providers: [{ id: 'flutterwave', state: 'sandbox' }, { id: 'paystack', state: 'sandbox' }]
  });

  app.get('/api/platform/v1', (_req, res) => res.json({
    name: 'TryAMM Operating System', version: '1.0.0-prealpha', releaseTruth: 'verified-pre-alpha',
    doors: ['watch', 'live', 'play', 'enter-globe', 'create', 'shop', 'learn', 'work'],
    systems: { features: features.length, worlds: worlds.length, nigeriaLaunchState: nigeria.launchState || nigeria.status || 'sandbox' }
  }));

  app.get('/api/platform/features', (req, res) => {
    const lane = safeLane(clean(req.query.ageLane, 20));
    const domain = clean(req.query.domain, 60).toLowerCase();
    const visible = features.filter(feature => {
      const laneAllowed = !Array.isArray(feature.ageLanes) || feature.ageLanes.includes(lane);
      const domainAllowed = !domain || String(feature.domain || '').toLowerCase() === domain;
      return laneAllowed && domainAllowed;
    });
    res.json({ ageLane: lane, count: visible.length, features: visible });
  });

  app.get('/api/platform/worlds', (req, res) => {
    const mode = clean(req.query.mode, 20).toLowerCase();
    const visible = worlds.filter(world => !mode || (world.modes || []).includes(mode));
    res.json({ mode: mode || null, count: visible.length, worlds: visible });
  });

  app.get('/api/platform/nigeria', (_req, res) => {
    const providers = Array.isArray(africaProviders.providers)
      ? africaProviders.providers
      : Object.entries(africaProviders).map(([providerId, config]) => ({ providerId, ...config }));
    res.json({
      country: nigeria,
      providers: providers.map(provider => ({
        id: provider.id || provider.providerId || provider.name,
        state: provider.state || provider.status || 'sandbox',
        productionEnabled: Boolean(provider.productionEnabled)
      })),
      productionPaymentsEnabled: false,
      reason: 'Provider approval, legal/security review and live pilot evidence are required.'
    });
  });

  app.get('/api/profile/experience', auth, (req, res) => res.json({
    ageLane: safeLane(req.user.ageLane),
    accessibility: req.user.accessibility || {
      oneHandMode: false, captions: true, reducedMotion: false,
      screenReaderOptimized: false, highContrast: false
    }
  }));

  app.put('/api/profile/experience', auth, async (req, res) => {
    const ageLane = safeLane(clean(req.body.ageLane, 20));
    const input = req.body.accessibility || {};
    req.user.ageLane = ageLane;
    req.user.accessibility = {
      oneHandMode: Boolean(input.oneHandMode), captions: input.captions !== false,
      reducedMotion: Boolean(input.reducedMotion), screenReaderOptimized: Boolean(input.screenReaderOptimized),
      highContrast: Boolean(input.highContrast)
    };
    await saveStore();
    res.json({ ageLane: req.user.ageLane, accessibility: req.user.accessibility });
  });

  app.post('/api/enter-globe/prepare', auth, async (req, res) => {
    const worldId = clean(req.body.worldId, 80);
    const world = worlds.find(item => item.id === worldId);
    if (!world) return res.status(404).json({ error: 'World not found' });
    const requestedModes = safeModes(req.body.mode);
    const supportedMode = requestedModes.find(mode => (world.modes || []).includes(mode));
    if (!supportedMode) return res.status(400).json({ error: 'Requested mode is not supported by this world' });
    const store = getStore(); store.events = store.events || [];
    const session = {
      id: id('teleport'), userId: req.user.id, worldId: world.id, worldName: world.name,
      mode: supportedMode, ageLane: safeLane(req.user.ageLane), state: 'arrival-bubble-ready',
      checks: { authenticated: true, ageLane: true, accessibilityProfile: true, featureFlag: true, assetBudget: 'pending-runtime-validation' },
      createdAt: new Date().toISOString()
    };
    store.events.push({ id: crypto.randomUUID(), type: 'teleport.prepared', ...session });
    await saveStore();
    res.status(201).json({ session });
  });

  app.get('/api/experience/v1', auth, (req, res) => {
    const store = getStore();
    const liveRoom = (store.rooms || []).find(room => room.status === 'live') || null;
    const firstWorld = worlds.find(world => world.id === 'herrin') || worlds[0] || null;
    res.json({
      user: { id: req.user.id, displayName: req.user.displayName, ageLane: safeLane(req.user.ageLane) },
      journey: {
        world: firstWorld, liveRoom,
        game: features.find(feature => feature.id === 'gaming.quantum-tag') || null,
        store: features.find(feature => feature.id === 'commerce.store-builder') || null,
        learning: features.find(feature => feature.id === 'education.aau') || null,
        work: features.find(feature => feature.id === 'workforce.middleverse') || null
      }
    });
  });
};
