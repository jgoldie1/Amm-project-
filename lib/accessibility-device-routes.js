'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function registerAccessibilityDeviceRoutes({ app, auth, clean, getStore, saveStore }) {
  const registryPath = path.join(__dirname, '..', 'config', 'device-and-accessibility-platform.json');
  const readRegistry = () => JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  function ensureStore() {
    const store = getStore();
    store.accessibilityProfiles ||= [];
    return store;
  }

  app.get('/api/platform/devices', (_req, res) => {
    const registry = readRegistry();
    res.json({ products: registry.products });
  });

  app.get('/api/platform/accessibility', (_req, res) => {
    const registry = readRegistry();
    res.json({ accessibility: registry.accessibility, translation: registry.translation });
  });

  app.get('/api/accessibility/profile', auth, (req, res) => {
    const store = ensureStore();
    const profile = store.accessibilityProfiles.find(item => item.userId === req.user.id) || {
      userId: req.user.id,
      preferredLanguage: 'en',
      captions: true,
      textScale: 'normal',
      highContrast: false,
      reducedMotion: false,
      oneHandMode: false,
      screenReaderOptimized: false,
      speechToText: false,
      textToSpeech: false,
      plainLanguage: false
    };
    res.json({ profile });
  });

  app.put('/api/accessibility/profile', auth, async (req, res) => {
    const allowedScale = ['normal', 'large', 'extra-large'];
    const profile = {
      userId: req.user.id,
      preferredLanguage: clean(req.body.preferredLanguage, 12) || 'en',
      captions: req.body.captions !== false,
      textScale: allowedScale.includes(req.body.textScale) ? req.body.textScale : 'normal',
      highContrast: req.body.highContrast === true,
      reducedMotion: req.body.reducedMotion === true,
      oneHandMode: req.body.oneHandMode === true,
      screenReaderOptimized: req.body.screenReaderOptimized === true,
      speechToText: req.body.speechToText === true,
      textToSpeech: req.body.textToSpeech === true,
      plainLanguage: req.body.plainLanguage === true,
      updatedAt: new Date().toISOString()
    };
    const store = ensureStore();
    const index = store.accessibilityProfiles.findIndex(item => item.userId === req.user.id);
    if (index >= 0) store.accessibilityProfiles[index] = profile;
    else store.accessibilityProfiles.push(profile);
    await saveStore();
    res.json({ profile });
  });

  app.post('/api/translation/prepare', auth, (req, res) => {
    const text = clean(req.body.text, 5000);
    const sourceLanguage = clean(req.body.sourceLanguage, 12) || 'auto';
    const targetLanguage = clean(req.body.targetLanguage, 12);
    const criticality = ['normal', 'financial', 'legal', 'medical', 'safety'].includes(req.body.criticality) ? req.body.criticality : 'normal';
    if (!text || !targetLanguage) return res.status(400).json({ error: 'Text and target language are required' });
    res.json({
      request: { text, sourceLanguage, targetLanguage, criticality },
      status: 'PROVIDER_NOT_CONNECTED',
      originalTextPreserved: true,
      humanReviewRequired: criticality !== 'normal',
      message: 'Translation request validated. Connect an approved translation provider before returning translated text.'
    });
  });
};
