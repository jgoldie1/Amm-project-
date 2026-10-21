# AI Café execution service

First supported job: website-draft. It generates a simple standalone HTML page from public business text, persists its HTML and SHA-256 evidence, and offers download from the Website Studio. This renderer is separate from the richer local preview; no photos, checkout, deployment or model-generated content are included.

## Runtime

- Authenticated owner pilot, using existing trusted app_metadata roles or TRYAMM_TEMPLATE_OWNER_USER_IDS. Never promote a user through user_metadata.
- POST /api/agents/jobs: {kind:"website-draft",requestKey:UUID,input:{name,headline,description,services,email,phone,location,color,language}}. Retries with the same key/input return the original job. Changed input with the same key returns 409.
- GET /api/agents/jobs: last 20 jobs for the verified owner. Optional id filters to a specific job.
- PATCH /api/agents/jobs: {id:UUID}. Claims and executes one job belonging to that owner. The UI creates and executes on click, then reloads persisted status. Resume is available after interruption.
- Server-only recovery worker: node scripts/ai-cafe-worker.mjs. Each invocation processes at most 10 jobs and exits. It is not automatically scheduled.
- Configure server SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (existing URL aliases also supported), plus the existing auth publishable/anon key. Never expose the service-role key in VITE_* variables.
- Limits: 10 new jobs/account and 100 globally per rolling 24 hours; maximum three attempts; 60-second claim lease; atomic quota/idempotency checks; SKIP LOCKED claim; stale-token completion rejected.
- Zero model calls for this job. Hosting/database costs still apply. No perpetual worker, automatic outbound messages, payments or deployments.

## Database and activation

Migration 20261020235653_ai_cafe_execution_jobs.sql was applied to the connected TRYAMM Supabase project fxluchtdfpediivhoksl on October 21, 2026. Readback verified RLS enabled, authenticated table/RPC access denied, and service-role RPC execution allowed. Existing browser data events remain coordination-only; they cannot invoke privileged jobs.

The API/UI code must be deployed before the controls work on the public website. A production deployment and signed-in browser run have not been verified. No scheduled worker has been activated. Completed drafts remain private until downloaded and separately published. Retention cleanup is not scheduled in this pilot; monitor storage before expanding.

## Verification

Run node --test tests/ai-cafe-executor.test.mjs (6 unit tests: escaping, deterministic evidence, lease handling, failure sanitization, authorization, tenant binding, job allowlist).

Database integration test uses an isolated PostgreSQL-compatible PGlite instance: install @electric-sql/pglite outside the repository, set PGLITE_MODULE to its absolute dist/index.js, then run node tests/ai-cafe-database.test.mjs. It applies the actual migration and tests idempotency/conflicts, tenant claims, exclusive claims, expired leases, stale completions, attempt limits, quota, actual renderer-to-persisted-output execution, and browser table/RPC permission denials. It does not modify production customer data.

Rollback: revert the API/UI commit to stop new execution. Keep the additive table for saved drafts; do not drop customer results to roll back application code.
