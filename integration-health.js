'use strict';

const { readiness } = require('./deployment-readiness');
const supabase = require('./lib/supabase-rest');
const providers = require('./lib/africa-provider-clients');

module.exports = function registerIntegrationHealth({ app, auth, admin }) {
  app.get('/api/integrations/health', auth, admin, (_req, res) => {
    const status = readiness();
    res.json({
      generatedAt: new Date().toISOString(),
      releaseTruth: status.releaseTruth,
      environment: status.environment,
      coreReady: status.core.configured,
      supabase: { configured: supabase.configured() },
      nigeriaPayments: {
        paystackConfigured: providers.paystackConfigured(),
        flutterwaveConfigured: providers.flutterwaveConfigured(),
        productionEnabled: status.productionPaymentsEnabled
      },
      media: { configured: status.integrations.media.configured, productionEnabled: status.productionMediaEnabled },
      blockers: status.blockers
    });
  });
};
