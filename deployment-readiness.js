'use strict';

const REQUIRED_CORE = ['APP_URL','ADMIN_EMAIL'];
const OPTIONAL_INTEGRATIONS = {
  supabase: ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'],
  stripe: ['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET'],
  paystack: ['PAYSTACK_SECRET_KEY','PAYSTACK_WEBHOOK_SECRET'],
  flutterwave: ['FLUTTERWAVE_SECRET_KEY','FLUTTERWAVE_WEBHOOK_HASH'],
  media: ['LIVEKIT_URL','LIVEKIT_API_KEY','LIVEKIT_API_SECRET']
};

function groupStatus(name, keys) {
  const present = keys.filter(key => Boolean(process.env[key]));
  return {
    name,
    configured: present.length === keys.length,
    present,
    missing: keys.filter(key => !process.env[key])
  };
}

function readiness() {
  const core = groupStatus('core', REQUIRED_CORE);
  const integrations = Object.fromEntries(Object.entries(OPTIONAL_INTEGRATIONS).map(([name, keys]) => [name, groupStatus(name, keys)]));
  const production = process.env.NODE_ENV === 'production';
  const requiredForProduction = ['supabase'];
  const blocked = production && (!core.configured || requiredForProduction.some(name => !integrations[name].configured));
  return {
    ok: !blocked,
    environment: process.env.NODE_ENV || 'development',
    core,
    integrations,
    productionPaymentsEnabled: production && (integrations.paystack.configured || integrations.flutterwave.configured),
    productionMediaEnabled: production && integrations.media.configured,
    blockers: blocked ? [
      ...core.missing,
      ...requiredForProduction.flatMap(name => integrations[name].missing)
    ] : [],
    releaseTruth: 'verified-pre-alpha'
  };
}

if (require.main === module) {
  const result = readiness();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

module.exports = { readiness, REQUIRED_CORE, OPTIONAL_INTEGRATIONS };
