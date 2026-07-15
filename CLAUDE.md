# Claude Development Guide — TryAMM

Read `AGENTS.md` first. This file adds Claude-specific working guidance.

## Working Style
- Inspect existing files before replacing them.
- Make the smallest complete change that advances the current milestone.
- Prefer implementation over speculative architecture documents.
- State assumptions in code comments or pull-request notes.
- Do not claim a feature is complete unless it runs and has been checked.

## Primary Task Queue
1. Replace JSON persistence with Supabase/PostgreSQL.
2. Add authentication and row-level security.
3. Save conversations, messages, preferences and feedback.
4. Add an admin knowledge upload/review interface.
5. Add provider streaming and realtime voice.
6. Connect shows, episodes, music and products to real database tables.

## Backend Standards
- Keep AI provider calls server-side.
- Add timeouts and structured errors to external requests.
- Redact secrets and sensitive fields from logs.
- Validate request bodies and enforce length limits.
- Separate model prompting, retrieval and tool execution as the service grows.

## Frontend Standards
- No framework migration unless the change includes a working migration path.
- Preserve semantic HTML, keyboard navigation, readable focus states and reduced motion.
- Never inject model output using unsanitized `innerHTML`.
- Design mobile-first and support one-handed operation.

## Faith Content
Use Yahavah, Yahusha Ha Mashiach and Ruach where appropriate to the approved TryAMM faith experience. Clearly label direct Scripture, historical claims, community interpretation and fictional story material.

## Handoff
Before ending work, update `docs/HANDOFF.md` with completed work, validation performed, known limitations and the next exact task.
