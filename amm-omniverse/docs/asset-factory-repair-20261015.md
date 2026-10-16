# Factory repair — October 15 UTC

Implemented: in-page email/password and Google/Apple authentication returning to
/asset-factory; account creation with email confirmation; auth-driven refresh;
public configuration status; disabled generation until storage is configured;
request timeouts without automatic paid retries; visible provider errors;
single-flight polling; server-owned role checks; explicit ?bj=published preview
so new saved models are not masked by the default V15 model.

Read-only setup observations: connected Supabase project fxluchtdfpediivhoksl
has a meshy_asset_jobs table, zero auth users and zero factory jobs. Production
has MESHY_API_KEY and public Supabase configuration, but its environment list
has no SUPABASE_SERVICE_ROLE_KEY, MESHY_FACTORY_WORKER_SECRET or CRON_SECRET.
No key values were retrieved. Configured is not a successful provider call.

Required secure setup: create and verify the owner's TRYAMM account; assign
asset-admin through trusted app_metadata to that verified account; provision
the server storage credential through secure Vercel settings. Configure a
background worker separately for unattended processing. Do not put credentials
in chat, source, logs or the browser. Do not authorize from user_metadata.

Nine local tests cover request and authorization boundaries, errors, timeout,
poll coalescing, public readiness and the published-model selector. They use
simulated responses, not paid provider generation. TypeScript and existing
rig/import/V15 contracts are also checked. Real photo-to-generation-to-rig-to-
storage testing is blocked until secure account and server setup is complete.
