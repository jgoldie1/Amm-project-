# TryAMM Sign Language Engine

This branch adds a production-shaped accessibility layer for sign language without pretending that word-for-word text conversion is full ASL.

## Included now

- Frontend Sign Language Hub with text-to-sign, browser speech-to-text, live translation refresh, language/mode controls, camera preview, system-status indicators, accessible dialog semantics, and privacy-forward camera handling.
- Typed frontend API client.
- Backend capability, translation, and recognition service with input limits, normalized languages/modes, provider timeouts, provider fallback, and honest confidence/capability reporting.
- Provider-agnostic API contract so TryAMM is not locked to Google or another vendor.
- Offline-safe lexical/fingerspelling fallback when no sign-language AI provider is configured.
- Avatar-sequence output contract ready for a 3D signer/avatar renderer.

## API

- `GET /api/accessibility/sign/capabilities`
- `POST /api/accessibility/sign/translate`
- `POST /api/accessibility/sign/recognize`

Example translation body:

```json
{ "text": "Welcome to TryAMM", "signLanguage": "asl", "mode": "avatar" }
```

## Provider adapter

Set these backend environment variables to connect a specialized sign-language model service:

- `SIGN_LANGUAGE_PROVIDER_URL`
- `SIGN_LANGUAGE_PROVIDER_KEY` (optional)

The provider should expose `POST /translate` and `POST /recognize` and return sign gloss, optional fingerspelling, avatar motion sequence, or recognized text/confidence.

## Production-complete criteria

Do not advertise this as fully accurate ASL recognition/translation until a model is connected and validated with Deaf/native-signing testers. Production validation should measure handshape, movement, location, orientation, two-hand interaction, facial grammar/non-manual markers, signer diversity, lighting, occlusion, latency, and dialect/register variation.

The architectural advantage over a single-vendor implementation is control: TryAMM can switch or ensemble models, add on-device processing, preserve privacy, share the engine across LIVE/games/education, and keep text/caption fallbacks available during provider outages.
