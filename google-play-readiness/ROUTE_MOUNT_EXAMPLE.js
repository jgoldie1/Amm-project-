'use strict';

const express = require('express');
const { createOnboardingRouter } = require('./onboarding-api');
const { createSafetyRouter } = require('./safety-api');

function mountTryAMMSafetyLayer(app, deps) {
  if (!app || !deps) throw new Error('app and deps are required');
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/onboarding', createOnboardingRouter(deps));
  app.use('/api/safety', createSafetyRouter(deps));
}

module.exports = { mountTryAMMSafetyLayer };
