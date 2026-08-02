'use strict';

const fs = require('fs');
const path = require('path');

function loadRegistry() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'config/transit-accessibility.json'), 'utf8'));
}

function normalizeNeeds(input = {}) {
  return {
    stepFree: Boolean(input.stepFree),
    wheelchair: Boolean(input.wheelchair),
    lowVision: Boolean(input.lowVision),
    blind: Boolean(input.blind),
    deaf: Boolean(input.deaf),
    hardOfHearing: Boolean(input.hardOfHearing),
    oneHand: Boolean(input.oneHand),
    voiceControl: Boolean(input.voiceControl),
    switchControl: Boolean(input.switchControl),
    cognitiveSupport: Boolean(input.cognitiveSupport),
    reducedMotion: Boolean(input.reducedMotion),
    serviceAnimal: Boolean(input.serviceAnimal),
    locale: String(input.locale || 'en-US').slice(0, 20)
  };
}

module.exports = function registerTransitAccessibility({ app, auth, clean, id, getStore, saveStore }) {
  const registry = loadRegistry();

  app.get('/api/transit/systems', (_req, res) => {
    res.json({ systems: registry.systems, translation: registry.translation });
  });

  app.get('/api/accessibility/capabilities', (_req, res) => {
    res.json({ profile: registry.universalProfile, translation: registry.translation });
  });

  app.post('/api/transit/plan', auth, async (req, res) => {
    const systemId = clean(req.body.systemId, 40);
    const origin = clean(req.body.origin, 160);
    const destination = clean(req.body.destination, 160);
    const system = registry.systems.find(item => item.id === systemId);
    if (!system) return res.status(404).json({ error: 'Transit system not found' });
    if (!origin || !destination) return res.status(400).json({ error: 'Origin and destination are required' });

    const needs = normalizeNeeds(req.body.accessibility);
    const plan = {
      id: id('trip'),
      userId: req.user.id,
      systemId,
      origin,
      destination,
      locale: needs.locale,
      accessibility: needs,
      status: 'requires-live-provider-data',
      routePolicy: {
        preferStepFree: needs.stepFree || needs.wheelchair,
        avoidElevatorOutages: true,
        requireTextAndAudioInstructions: needs.lowVision || needs.blind || needs.deaf || needs.hardOfHearing,
        allowParatransitFallback: true,
        allowExtraTransferTime: needs.cognitiveSupport || needs.wheelchair,
        preserveOriginalAndTranslatedText: true
      },
      provider: system.officialData,
      createdAt: new Date().toISOString()
    };

    const store = getStore();
    store.transitPlans = store.transitPlans || [];
    store.transitPlans.push(plan);
    await saveStore();
    res.status(201).json({ plan });
  });

  app.put('/api/profile/accessibility-universal', auth, async (req, res) => {
    req.user.universalAccessibility = normalizeNeeds(req.body || {});
    req.user.communicationPreferences = {
      captions: req.body.captions !== false,
      audioDescription: Boolean(req.body.audioDescription),
      liveTranscript: Boolean(req.body.liveTranscript),
      visualAlerts: req.body.visualAlerts !== false,
      textToSpeech: Boolean(req.body.textToSpeech),
      signLanguagePreferred: Boolean(req.body.signLanguagePreferred)
    };
    await saveStore();
    res.json({
      accessibility: req.user.universalAccessibility,
      communication: req.user.communicationPreferences
    });
  });
};
