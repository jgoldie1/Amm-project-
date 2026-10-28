# TryAMM Google Play age/safety layer

## What changed
Added a runnable, isolated age/safety reference app under `google-play-readiness/app` with server-side age bands, feature guards, interaction protections, moderation/reporting, account deletion, a frontend shell, tests, and deployment handoff files.

## Why
The live TryAMM production repository is not currently connected. This gives Victor a concrete, reviewable implementation to run and transplant without overwriting the old AMM code.

## Validation
- policy tests included
- no production secrets committed
- work isolated on a dedicated branch

## Still requires real production repo
Supabase persistence, LiveKit integration, actual payment/billing flows, production Next.js UI wiring, signed Android AAB, and final Play Console submission.
