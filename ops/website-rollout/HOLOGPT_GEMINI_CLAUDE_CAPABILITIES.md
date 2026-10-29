# HoloGPT / Cross AI Capability Roadmap — Oct 2026
This records requested Gemini-inspired and Claude-inspired capabilities. It is NOT evidence of activated vendor APIs or built-in access to proprietary products.

## Gemini-inspired capabilities
- Multimodal ingest: images/video/audio/PDF with explicit file consent, size limits, malware checks, retention and per-provider disclosure.
- Extended-context document/code review with source citations and scoped retrieval.
- Grounded travel and merchant lookups via approved search/map APIs; no invented geolocation or live availability.
- Speech: one-handed voice, real-time captions, verified translation packs and user-configured language choice.
- Structured JSON output with schema validation and strict per-merchant tool authorization.
- Agent interaction logs, context lifecycle and provider quotas; platform-specific endpoints behind adapters.

## Claude-inspired capabilities
- Repo-aware code diagnostics: branch-only patches, automated tests, PR review and no silent deployment.
- Interactive artifacts: business forms, dashboards and editable previews with isolated sandbox.
- Multi-document research: citation-backed extraction and human verification for high-stakes documents.
- Computer/browser assistance only in isolated authorized sessions with human sign-off for submissions, account changes and payment.
- Prompt caching and long-task checkpoints gated by actual provider support and expense policy.

## Priority build stages
1. Read-only capability registry and UX feature selector
2. Free-first budget guard and runtime cost telemetry (never fake free token balances)
3. Server-side adapters for one provider at a time, with error isolation and no exposed credentials
4. Authorized media upload, consent, moderation and privacy boundaries
5. Voice/captions and one-handed control test on actual mobile devices
6. Permission-scoped external tools, audit logs, per-business data isolation and rollbacks
7. End-to-end provider testing and documented production release approval

## Key constraints
- ChatGPT subscription and OpenAI API are separate; no automatic access to private ChatGPT history or plugins.
- Claude/Gemini product UI features do not transfer automatically to their APIs; implement comparable original UX using licensed APIs.
- Never route medical, financial, identity or customer data to multiple vendors without explicit disclosure, permissions and legal review.
- For paid API access require actual budget approval, server-metered quotas and an explicit paid fallback opt-in.
- Model differences, token limits, pricing and feature availability must be checked at implementation time.
