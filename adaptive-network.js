'use strict';

const fs = require('fs');

const registry = JSON.parse(fs.readFileSync('config/adaptive-radio-network.json', 'utf8'));

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function scoreBand(band, metrics, useCase) {
  let score = 0;
  if (band.id === 'low-band') score += metrics.distanceKm > 3 || metrics.indoor ? 35 : 10;
  if (band.id === 'mid-band') score += metrics.distanceKm <= 10 ? 30 : 10;
  if (band.id === 'millimeter-wave') score += metrics.distanceKm < 0.5 && metrics.lineOfSight ? 45 : -30;
  if (band.id === 'above-100-ghz-research') score += metrics.distanceKm < 0.05 && metrics.lineOfSight && metrics.experimental ? 50 : -100;
  if (band.id === 'non-terrestrial') score += metrics.remote || metrics.disaster ? 40 : 0;
  if (useCase === 'push-to-talk' && ['low-band', 'mid-band', 'non-terrestrial'].includes(band.id)) score += 20;
  if (useCase === 'xr-holographic' && ['millimeter-wave', 'above-100-ghz-research'].includes(band.id)) score += 20;
  score += Math.max(0, 20 - metrics.packetLossPercent * 5);
  score += Math.max(0, 20 - metrics.latencyMs / 5);
  return score;
}

module.exports = function registerAdaptiveNetwork({ app, auth, clean, id, getStore, saveStore }) {
  app.get('/api/network/config', (_req, res) => res.json(registry));

  app.post('/api/network/select', auth, (req, res) => {
    const metrics = {
      distanceKm: number(req.body.distanceKm, 1),
      indoor: Boolean(req.body.indoor),
      lineOfSight: Boolean(req.body.lineOfSight),
      experimental: Boolean(req.body.experimental),
      remote: Boolean(req.body.remote),
      disaster: Boolean(req.body.disaster),
      latencyMs: number(req.body.latencyMs, 60),
      packetLossPercent: number(req.body.packetLossPercent, 1)
    };
    const useCase = clean(req.body.useCase, 40) || 'livestream';
    const ranked = registry.bands
      .map(band => ({ id: band.id, score: scoreBand(band, metrics, useCase), role: band.role }))
      .sort((a, b) => b.score - a.score);
    res.json({ useCase, metrics, selected: ranked[0], alternatives: ranked.slice(1), policy: 'best-lawful-available-transport' });
  });

  app.post('/api/chirp/groups', auth, async (req, res) => {
    const store = getStore();
    store.chirpGroups = store.chirpGroups || [];
    const group = {
      id: id('chirp-group'),
      ownerUserId: req.user.id,
      name: clean(req.body.name, 80) || 'My World Group',
      members: [req.user.id],
      priority: clean(req.body.priority, 20) || 'normal',
      emergencyOverride: false,
      recordingPolicy: 'visible-and-consent-controlled',
      createdAt: new Date().toISOString()
    };
    store.chirpGroups.push(group);
    await saveStore();
    res.status(201).json({ group });
  });

  app.post('/api/chirp/groups/:groupId/transmissions', auth, async (req, res) => {
    const store = getStore();
    store.chirpGroups = store.chirpGroups || [];
    store.chirpTransmissions = store.chirpTransmissions || [];
    const group = store.chirpGroups.find(item => item.id === req.params.groupId);
    if (!group || !group.members.includes(req.user.id)) return res.status(403).json({ error: 'Group membership required' });
    const transmission = {
      id: id('chirp'),
      groupId: group.id,
      userId: req.user.id,
      kind: ['voice', 'text', 'image', 'alert'].includes(req.body.kind) ? req.body.kind : 'voice',
      emergency: Boolean(req.body.emergency),
      encrypted: true,
      replayProtected: true,
      status: 'queued-for-approved-media-transport',
      createdAt: new Date().toISOString()
    };
    store.chirpTransmissions.push(transmission);
    await saveStore();
    res.status(202).json({ transmission });
  });

  app.get('/api/chirp/capabilities', auth, (_req, res) => res.json(registry.pushToTalk));
};
