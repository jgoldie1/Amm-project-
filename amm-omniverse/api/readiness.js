export default async function handler(req, res) {
  const present = (name) => Boolean(process.env[name] && String(process.env[name]).trim());
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabasePublicKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || '';
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || '';
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '';
  const appUrl = process.env.VITE_APP_URL || 'https://tryamm.online';
  const apiUrl = process.env.VITE_API_URL || '';
  const livekitUrl = process.env.LIVEKIT_URL || '';

  const checks = {
    app_https: /^https:\/\//.test(appUrl),
    api_https: /^https:\/\//.test(apiUrl) && !/your-amm-backend\.example/i.test(apiUrl),
    supabase_url: Boolean(supabaseUrl),
    supabase_public_key: Boolean(supabasePublicKey),
    supabase_service_role: Boolean(supabaseServiceRole),
    livekit_url: /^(wss|https):\/\//i.test(livekitUrl),
    livekit_api_key: present('LIVEKIT_API_KEY'),
    livekit_api_secret: present('LIVEKIT_API_SECRET'),
    stripe_secret: present('STRIPE_SECRET_KEY'),
    stripe_webhook_secret: present('STRIPE_WEBHOOK_SECRET'),
    money_engine_security_secret: present('TRYAMM_INTERNAL_COMPLIANCE_SECRET'),
    recording_archive_secret: present('TRYAMM_RECORDING_ARCHIVE_SECRET'),
    recording_storage: present('TRYAMM_RECORDING_BUCKET') || present('S3_BUCKET') || present('R2_BUCKET') || present('SUPABASE_RECORDING_BUCKET'),
    hologpt_provider: present('OPENAI_API_KEY') || present('TRYAMM_AI_API_KEY') || present('TRYAMM_AI_PROVIDER_KEY'),
    twilio_account_sid: /^AC[a-f0-9]{32}$/i.test(twilioSid),
    twilio_auth_token: Boolean(twilioToken),
    twilio_phone_number: /^\+[1-9]\d{7,14}$/.test(twilioPhone),
    call_webhook_secret: present('TRYAMM_CALL_CENTER_WEBHOOK_SECRET'),
    retention_secret: present('TRYAMM_RETENTION_JOB_SECRET'),
    stt_provider: present('TRYAMM_STT_ENDPOINT') && present('TRYAMM_STT_API_KEY'),
    tts_provider: present('TRYAMM_TTS_ENDPOINT') && present('TRYAMM_TTS_API_KEY')
  };

  const launchCriticalKeys = [
    'app_https','api_https','supabase_url','supabase_public_key','supabase_service_role',
    'livekit_url','livekit_api_key','livekit_api_secret',
    'stripe_secret','stripe_webhook_secret','money_engine_security_secret',
    'recording_archive_secret','recording_storage','hologpt_provider'
  ];
  const secondaryKeys = [
    'twilio_account_sid','twilio_auth_token','twilio_phone_number','call_webhook_secret','retention_secret'
  ];
  const criticalPassed = launchCriticalKeys.filter((key) => checks[key]).length;
  const secondaryPassed = secondaryKeys.filter((key) => checks[key]).length;

  let supabaseReachable = false;
  let supabaseStatus = null;
  if (supabaseUrl && supabasePublicKey) {
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, {
        headers: { apikey: supabasePublicKey, Authorization: `Bearer ${supabasePublicKey}` }
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
        headers: { apikey: supabaseServiceRole, Authorization: `Bearer ${supabaseServiceRole}` }
      });
      supabaseServiceRoleStatus = response.status;
      supabaseServiceRoleValid = response.ok;
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

  const launchProviderValidationPassed = supabaseReachable && supabaseServiceRoleValid;
  const launchReady = criticalPassed === launchCriticalKeys.length && launchProviderValidationPassed;
  const callCenterReady = secondaryPassed === secondaryKeys.length && twilioAccountValid && twilioNumberOwned;

  res.setHeader('Cache-Control', 'no-store');
  return res.status(launchReady ? 200 : 503).json({
    release: 'tryamm-release-spine-1',
    site: 'tryamm.online',
    ready: launchReady,
    launchReady,
    callCenterReady,
    criticalPassed,
    criticalTotal: launchCriticalKeys.length,
    secondaryPassed,
    secondaryTotal: secondaryKeys.length,
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
    gateRule: 'Launch GREEN requires configured Supabase/Auth, production API URL, LiveKit, Money Engine/Stripe, recording storage, AI provider, and successful live Supabase validation. Device/provider transaction tests are tracked separately and remain required.',
    note: 'Secret values and provider response bodies are never returned.'
  });
}
