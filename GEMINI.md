# Gemini Development Guide — TryAMM

Read `AGENTS.md` first.

## Role
Use Gemini for multimodal analysis, long-context review, content metadata, accessibility review and implementation support. All production model calls must remain behind the server-side provider adapter.

## Integration Pattern
Configure an OpenAI-compatible or dedicated Gemini adapter through environment variables. Never place credentials in browser code.

Required adapter behavior:
- normalized `{answer, provider, sources}` response
- request timeout and retry policy
- structured error handling
- model and token limits configurable by environment
- no silent fallback that pretends the provider answered

## Useful Gemini Workstreams
- Review storyboards, images and trailers for metadata and accessibility descriptions.
- Generate draft catalog tags that require human approval.
- Analyze long franchise bibles for continuity conflicts.
- Assist with captions, summaries and translations while preserving original meaning.
- Evaluate UI screenshots for contrast, hierarchy and mobile usability.

## Guardrails
- Do not treat generated media descriptions as verified facts.
- Do not train on creator content without permission.
- Do not copy protected characters, scripts, songs or brand assets.
- Keep Black anime, manga and cosplay content original and culturally respectful.
- Faith answers must use approved knowledge and label interpretation.

## Validation
Run `npm run check`, test local fallback mode, then test the configured provider without exposing the key in logs or screenshots.
