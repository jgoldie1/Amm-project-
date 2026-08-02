'use strict';

const { readiness } = require('./deployment-readiness');
const supabase = require('./lib/supabase-rest');
const providers = require('./lib/africa-provider-clients');

module.exports = function registerIntegrationHealth({ app, auth, admin, persistence }) {
  app.get('/api/integrations/health', auth, admin, (_req, res) => {
    const status = readiness();
    res.json({
      generatedAt: new Date().toISOString(),
      releaseTruth: status.releaseTruth,
      environment: status.environment,
      coreReady: status.core.configured,
      supabase: {
        configured: supabase.configured(),
        retryQueue: persistence?.retrySummary ? persistence.retrySummary() : null
      },
      nigeriaPayments: {
        paystackConfigured: providers.paystackConfigured(),
        flutterwaveConfigured: providers.flutterwaveConfigured(),
        productionEnabled: status.productionPaymentsEnabled
      },
      media: {
        configured: status.integrations.media.configured,
        productionEnabled: status.productionMediaEnabled
      },
      blockers: status.blockers
    });
  });

  app.post('/api/admin/integrations/persistence/retry', auth, admin, async (req, res) => {
    if (!persistence?.retryPending) return res.status(503).json({ error: 'Persistence retry service unavailable' });
    const result = await persistence.retryPending({ limit: Number(req.body?.limit || 25) });
    res.json({ generatedAt: new Date().toISOString(), ...result });
  });
};
