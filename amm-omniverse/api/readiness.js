export default async function handler(req, res) {
  const present = (name) => Boolean(process.env[name] && String(process.env[name]).trim());
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabasePublicKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  const appUrl = process.env.VITE_APP_URL || 'https://tryamm.online';

  const checks = {
    app_https: /^https:\/\//.test(appUrl),
    supabase_url: Boolean(supabaseUrl),
    supabase_public_key: Boolean(supabasePublicKey),
    supabase_service_role: present('SUPABASE_SERVICE_ROLE_KEY'),
    twilio_account_sid: present('TWILIO_ACCOUNT_SID'),
    twilio_auth_token: present('TWILIO_AUTH_TOKEN'),
    twilio_phone_number: present('TWILIO_PHONE_NUMBER'),
    call_webhook_secret: present('TRYAMM_CALL_CENTER_WEBHOOK_SECRET'),
    compliance_secret: present('TRYAMM_INTERNAL_COMPLIANCE_SECRET'),
    retention_secret: present('TRYAMM_RETENTION_JOB_SECRET'),
    recording_archive_secret: present('TRYAMM_RECORDING_ARCHIVE_SECRET'),
    stt_provider: present('TRYAMM_STT_ENDPOINT') && present('TRYAMM_STT_API_KEY'),
    tts_provider: present('TRYAMM_TTS_ENDPOINT') && present('TRYAMM_TTS_API_KEY'),
    hologpt_provider: present('OPENAI_API_KEY') || present('TRYAMM_AI_API_KEY') || present('TRYAMM_AI_PROVIDER_KEY')
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

  const ready = criticalPassed === criticalKeys.length && supabaseReachable;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(ready ? 200 : 503).json({
    release: 'live-vite-readiness-3',
    site: 'tryamm.online',
    ready,
    criticalPassed,
    criticalTotal: criticalKeys.length,
    checks,
    liveChecks: { supabaseReachable, supabaseStatus },
    note: 'Secret values are never returned.'
  });
}
