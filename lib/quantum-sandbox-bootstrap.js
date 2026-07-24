'use strict';

const { QuantumProviderGateway } = require('./quantum-provider-gateway');
const { createQuantumSandboxStore } = require('./quantum-sandbox-store');
const { registerQuantumSandboxRoutes } = require('./quantum-sandbox-routes');
const { createClassicalSimulatorProvider } = require('./classical-simulator-provider');

function installQuantumSandbox({ app, auth, appendAudit }) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return { enabled: false, reason: 'SUPABASE_NOT_CONFIGURED' };
  }

  const gateway = new QuantumProviderGateway({
    maxJobBudgetUsd: Number(process.env.QUANTUM_MAX_JOB_BUDGET_USD || 25),
    audit: async (event, details) => appendAudit?.({ event, ...details, at: new Date().toISOString() })
  });

  gateway.registerProvider('tryamm-classical', createClassicalSimulatorProvider());

  // Real quantum hardware providers are intentionally not auto-registered.
  // They must be enabled through a reviewed provider adapter and explicit feature flag.
  const store = createQuantumSandboxStore({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  });

  registerQuantumSandboxRoutes({
    app,
    authenticate: auth.authenticate,
    gateway,
    store,
    appendAudit
  });

  return {
    enabled: true,
    gateway,
    store,
    providers: ['tryamm-classical'],
    realQuantumHardwareEnabled: false
  };
}

module.exports = { installQuantumSandbox };
