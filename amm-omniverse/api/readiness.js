export default async function handler(req, res) {
  const present = (name) => Boolean(process.env[name] && String(process.env[name]).trim());
  const enabled = (name) => String(process.env[name] || '').trim().toLowerCase() === 'true';
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabasePublicKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || '';
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || '';
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '';
  const appUrl = process.env.VITE_APP_URL || 'https://tryamm.online';

  const checks = {
    app_https: /^https:\/\//.test(appUrl),
    supabase_url: Boolean(supabaseUrl),
    supabase_public_key: Boolean(supabasePublicKey),
    supabase_service_role: Boolean(supabaseServiceRole),
    twilio_account_sid: /^AC[a-f0-9]{32}$/i.test(twilioSid),
    twilio_auth_token: Boolean(twilioToken),
    twilio_phone_number: /^\+[1-9]\d{7,14}$/.test(twilioPhone),
    call_webhook_secret: present('TRYAMM_CALL_CENTER_WEBHOOK_SECRET'),
    compliance_secret: present('TRYAMM_INTERNAL_COMPLIANCE_SECRET'),
    retention_secret: present('TRYAMM_RETENTION_JOB_SECRET'),
    recording_archive_secret: present('TRYAMM_RECORDING_ARCHIVE_SECRET'),
    stt_provider: present('TRYAMM_STT_ENDPOINT') && present('TRYAMM_STT_API_KEY'),
    tts_provider: present('TRYAMM_TTS_ENDPOINT') && present('TRYAMM_TTS_API_KEY'),
    hologpt_provider: present('OPENAI_API_KEY') || present('TRYAMM_AI_API_KEY') || present('TRYAMM_AI_PROVIDER_KEY')
  };

  const commerceChecks = {
    stripe_secret: present('STRIPE_SECRET_KEY'),
    stripe_webhook_secret: present('STRIPE_WEBHOOK_SECRET'),
    live_charging_enabled: enabled('TRYAMM_LIVE_CHARGING_ENABLED'),
    seller_transfers_verified: enabled('TRYAMM_SELLER_TRANSFERS_VERIFIED'),
    reconciliation_verified: enabled('TRYAMM_RECONCILIATION_VERIFIED')
  };

  const criticalKeys = [
    'app_https','supabase_url','supabase_public_key','supabase_service_role',
    'twilio_account_sid','twilio_auth_token','twilio_phone_number',
    'call_webhook_secret','compliance_secret','retention_secret','recording_archive_secret'
  ];
  const criticalPassed = criticalKeys.filter((key) => checks[key]).length;

  let supabaseReachable = false;
  let supabaseStatus = null;
  if (supabaseUrl && supabasePublicKey) {
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, {
        headers: {
          apikey: supabasePublicKey,
          Authorization: `Bearer ${supabasePublicKey}`
        }
      });
      supabaseStatus = response.status;
      supabaseReachable = response.ok;
    } catch (_) {}
  }

  let supabaseServiceRoleValid = false;
  let supabaseServiceRoleStatus = null;
  if (supabaseUrl && supabaseServiceRole) {
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/admin/users?page=1&per_page=1`, {
        headers: {
          apikey: supabaseServiceRole,
          Authorization: `Bearer ${supabaseServiceRole}`
        }
      });
      supabaseServiceRoleStatus = response.status;
      supabaseServiceRoleValid = response.ok;
    } catch (_) {}
  }

  let commerceSchemaReachable = false;
  let commerceSchemaStatus = null;
  if (supabaseUrl && supabaseServiceRole) {
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/commerce_payment_transactions?select=id&limit=1`, {
        headers: {
          apikey: supabaseServiceRole,
          Authorization: `Bearer ${supabaseServiceRole}`,
          Accept: 'application/json'
        }
      });
      commerceSchemaStatus = response.status;
      commerceSchemaReachable = response.ok;
    } catch (_) {}
  }

  let twilioAccountValid = false;
  let twilioAccountStatus = null;
  let twilioNumberOwned = false;
  let twilioNumberStatus = null;
  if (checks.twilio_account_sid && twilioToken) {
    const authorization = `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`;
    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(twilioSid)}.json`, {
        headers: { Authorization: authorization }
      });
      twilioAccountStatus = response.status;
      twilioAccountValid = response.ok;
    } catch (_) {}

    if (twilioAccountValid && checks.twilio_phone_number) {
      try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(twilioSid)}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(twilioPhone)}&PageSize=1`, {
          headers: { Authorization: authorization }
        });
        twilioNumberStatus = response.status;
        if (response.ok) {
          const payload = await response.json();
          twilioNumberOwned = Array.isArray(payload.incoming_phone_numbers) && payload.incoming_phone_numbers.length === 1;
        }
      } catch (_) {}
    }
  }

  const providerValidationPassed =
    supabaseReachable &&
    supabaseServiceRoleValid &&
    twilioAccountValid &&
    twilioNumberOwned;

  const commerceReady =
    commerceSchemaReachable &&
    Object.values(commerceChecks).every(Boolean);

  const ready = criticalPassed === criticalKeys.length && providerValidationPassed;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(ready ? 200 : 503).json({
    release: 'live-vite-readiness-5',
    site: 'tryamm.online',
    ready,
    criticalPassed,
    criticalTotal: criticalKeys.length,
    checks,
    liveChecks: {
      supabaseReachable,
      supabaseStatus,
      supabaseServiceRoleValid,
      supabaseServiceRoleStatus,
      twilioAccountValid,
      twilioAccountStatus,
      twilioNumberOwned,
      twilioNumberStatus
    },
    commerce: {
      ready: commerceReady,
      checks: commerceChecks,
      liveChecks: {
        commerceSchemaReachable,
        commerceSchemaStatus
      },
      authority: 'checkout -> verified Stripe event -> transaction -> entitlement -> ledger',
      gateRule: 'Charging is ready only when Stripe secrets, webhook verification, seller-transfer verification, reconciliation verification, and the authoritative payment schema are all ready.'
    },
    gateRule: 'Green requires all critical variables plus successful live Supabase public/service-role and Twilio account/number validation.',
    note: 'Secret values and provider response bodies are never returned.'
  });
}
