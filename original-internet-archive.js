'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const registry = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/original-internet-archive.json'), 'utf8'));

module.exports = function registerOriginalInternetArchive({ app, auth, clean, id, getStore, saveStore }) {
  app.get('/api/internet-archive/config', (_req, res) => res.json(registry));

  app.get('/api/internet-archive/timeline', (_req, res) => res.json({ eras: registry.eras }));

  app.get('/api/internet-archive/collections', (_req, res) => res.json({
    collections: registry.collections,
    policy: registry.collectionPolicy,
    accessibility: registry.accessibility
  }));

  app.get('/api/internet-archive/search', (req, res) => {
    const store = getStore();
    const query = clean(req.query.q, 160).toLowerCase();
    const era = clean(req.query.era, 40);
    const records = (store.archiveRecords || []).filter(record => {
      const matchesQuery = !query || [record.title, record.originalUrl, record.description, ...(record.tags || [])]
        .join(' ').toLowerCase().includes(query);
      const matchesEra = !era || record.era === era;
      return matchesQuery && matchesEra && record.accessStatus !== 'restricted';
    });
    res.json({ count: records.length, records });
  });

  app.post('/api/internet-archive/capture-requests', auth, async (req, res) => {
    const originalUrl = clean(req.body.originalUrl, 2048);
    if (!/^https?:\/\//i.test(originalUrl)) return res.status(400).json({ error: 'A public HTTP or HTTPS URL is required' });
    const store = getStore();
    store.archiveCaptureRequests = store.archiveCaptureRequests || [];
    const request = {
      id: id('capture'),
      userId: req.user.id,
      originalUrl,
      title: clean(req.body.title, 180),
      era: clean(req.body.era, 40) || 'ai-web',
      reason: clean(req.body.reason, 500),
      status: 'policy-review-required',
      checks: {
        robotsTxt: 'pending',
        publisherTerms: 'pending',
        copyright: 'pending',
        privacy: 'pending',
        paywallBypassAllowed: false,
        authenticatedContentAllowed: false
      },
      createdAt: new Date().toISOString()
    };
    store.archiveCaptureRequests.push(request);
    await saveStore();
    res.status(201).json({ request });
  });

  app.post('/api/admin/internet-archive/records', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const originalUrl = clean(req.body.originalUrl, 2048);
    if (!/^https?:\/\//i.test(originalUrl)) return res.status(400).json({ error: 'A valid original URL is required' });
    const store = getStore();
    store.archiveRecords = store.archiveRecords || [];
    const capturedAt = clean(req.body.capturedAt, 60) || new Date().toISOString();
    const record = {
      id: id('archive'),
      originalUrl,
      archiveUrl: clean(req.body.archiveUrl, 2048),
      title: clean(req.body.title, 180) || originalUrl,
      description: clean(req.body.description, 1000),
      era: clean(req.body.era, 40) || 'ai-web',
      language: clean(req.body.language, 20) || 'und',
      authorship: clean(req.body.authorship, 30) || 'unknown',
      license: clean(req.body.license, 120) || 'rights-status-unknown',
      contentHash: crypto.createHash('sha256').update(`${originalUrl}|${capturedAt}|${clean(req.body.archiveUrl, 2048)}`).digest('hex'),
      capturedAt,
      sourceArchive: clean(req.body.sourceArchive, 80) || 'external-link',
      accessStatus: clean(req.body.accessStatus, 30) || 'metadata-and-link',
      tags: Array.isArray(req.body.tags) ? req.body.tags.map(tag => clean(tag, 60)) : [],
      createdAt: new Date().toISOString()
    };
    store.archiveRecords.push(record);
    await saveStore();
    res.status(201).json({ record });
  });

  app.get('/api/internet-archive/records/:recordId/provenance', (req, res) => {
    const store = getStore();
    const record = (store.archiveRecords || []).find(item => item.id === req.params.recordId);
    if (!record) return res.status(404).json({ error: 'Archive record not found' });
    res.json({
      id: record.id,
      originalUrl: record.originalUrl,
      archiveUrl: record.archiveUrl,
      capturedAt: record.capturedAt,
      sourceArchive: record.sourceArchive,
      contentHash: record.contentHash,
      license: record.license,
      authorship: record.authorship,
      historicalCaptureImmutable: true,
      AITrainingPermissionImplied: false
    });
  });
};
