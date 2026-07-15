# Googolplex Memory Production Gate

## Implemented in code

- Authenticated memory CRUD routes under `/api/memory`.
- AI chat retrieval from consented user memory.
- Optional embedding generation and vector search with lexical fallback.
- Secret, token, payment-number, email, phone and SSN-style redaction.
- Memory Control Center at `/memory-control.html`.
- View, edit, export, expire and forget actions.
- NPC interaction and arena match persistence endpoints.
- Conflict detection for same-subject and same-title memories.
- Working-memory retention cleanup and expired-memory cleanup.
- Memory-quality and answer-hallucination evaluations.
- Audit events for create, update, export, forget, expire, cleanup and evaluations.
- Supabase migrations for memory, links, vector search, audit and evaluations.
- Manual GitHub Actions migration workflow.

## API routes

- `GET /api/memory/status`
- `GET /api/memory`
- `POST /api/memory`
- `GET /api/memory/search?q=`
- `GET /api/memory/export`
- `PATCH /api/memory/:id`
- `POST /api/memory/:id/forget`
- `POST /api/memory/:id/expire`
- `GET /api/memory/:id/conflicts`
- `POST /api/memory/events/npc`
- `POST /api/memory/events/arena`
- `POST /api/memory/evaluate/memory/:id`
- `POST /api/memory/evaluate/answer`
- `POST /api/memory/maintenance/cleanup`
- `GET /api/memory/audit/events`

All routes except status require a valid Supabase bearer token.

## Live Supabase activation

The repository cannot apply migrations without project credentials. Add these GitHub environment secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

Then manually run the `Apply Supabase migrations` workflow. Add runtime deployment secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service-role key in browser code.

## Embeddings

Configure an OpenAI-compatible embedding endpoint:

- `EMBEDDING_API_URL`
- `EMBEDDING_API_KEY`
- `EMBEDDING_MODEL`

When unavailable, retrieval falls back to owner-scoped lexical, importance and recency scoring.

## Retention

The database cleanup function forgets:

- memories whose explicit expiration has passed;
- working memories not updated for 30 days.

Production should schedule cleanup daily and add tier-specific retention policies approved by legal and privacy review.

## Remaining production work

- Configure the real Supabase project and execute migrations.
- Add a complete browser sign-in page so users do not paste access tokens manually.
- Schedule cleanup through Supabase Cron or a secure worker.
- Add a production PII classifier beyond regular-expression redaction.
- Add embedding dimension validation for the chosen model.
- Add end-to-end API tests against a Supabase test project.
- Add administrator review workflow for public/shared memory.
- Add encrypted exports and account-deletion orchestration.
- Connect actual NPC and arena completion events to their persistence endpoints.

## Status

- Memory service and routes: 90% code complete.
- Database migrations and RLS: 90% code complete.
- Memory Control Center: 80% Alpha complete.
- Live project deployment: blocked until Supabase secrets and project are supplied.
- End-to-end production readiness: approximately 65%.
