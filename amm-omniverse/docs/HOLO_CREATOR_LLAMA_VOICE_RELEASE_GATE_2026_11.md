# Holo Creator: owned Llama + voice/reel release gate

Status: **draft integration**, not a deployed or certified live Llama service.

## Verified integration points
- HoloGPT endpoint: `POST /api/ai/answer` (server-side provider selection and fallbacks); `GET /api/ai/health`.
- The original self-hosted adapter in `api/ai/answer.js` requests an OpenAI-compatible `/v1/chat/completions` route using server-side environment settings.
- OmniBox: `/omni-box`; HoloBox animatic and reviewed A/B/C/D dialogue are in the Holo Creator panel.
- Reel import: `tryamm:media-studio-open` with a real video Blob; publishing remains behind the existing creator authentication and media processing workflow.
- New optional original/licensed voice audio mixes into the 18-second browser animation using `AudioContext`, `MediaStreamAudioDestinationNode` and `MediaRecorder`. Human permission checkbox required before rendering with selected audio.

## Current blockers verified on November 8, 2026
1. Connected Vercel team/project returned **HTTP 402 `DEPLOYMENT_DISABLED` / account suspended**.
2. The inspected Vercel project environment has **no** `HOLOGPT_SELFHOST_BASE` or `HOLOGPT_SELFHOST_MODEL` configuration. This means an owned Llama model is **not connected and certified on that deployment**.
3. The GitHub PR is a draft. No complete TypeScript build, real Chromebook acceptance, actual multi-actor 3D animation, or end-to-end Reel publishing was certified.
4. Client-prefixed `VITE_...` API keys should be reviewed for accidental exposure. Model credentials must remain server-side.

## How to connect an owned Llama endpoint securely
Provision a server capable of running the selected Llama model (or a trusted managed inference endpoint), with a protected HTTPS OpenAI-compatible chat completion API. Do not make a raw local Ollama HTTP port reachable from the public internet.

Set these values as **server-side environment variables** on the app deployment, never inside a browser bundle:

```dotenv
HOLOGPT_SELFHOST_BASE=https://your-authenticated-inference.example/v1
HOLOGPT_SELFHOST_MODEL=your-installed-llama-model-id
HOLOGPT_SELFHOST_API_KEY=<set-in-server-secret-manager>
HOLOGPT_SELFHOST_PREFERRED=true
```

The example domain and model ID above are placeholders, not live services. Configure these only after verifying the actual model service, authentication, costs, rate limiting and access logs. Rotate exposed credentials. Restore the suspended Vercel account before attempting a production release.

## Acceptance gates
- [ ] Vercel account reactivated, production URL responds HTTP 200.
- [ ] `GET /api/ai/health` shows self-hosted **configured** (configuration is not proof of inference).
- [ ] Authorized `POST /api/ai/answer` returns a non-degraded response and the exact expected self-hosted provider/model.
- [ ] Offline dialogue remains usable after simulated inference outage and 9s request timeout.
- [ ] Audio-file rights approval blocks unauthorized voice mixing; 12 MB limit enforced.
- [ ] Browser-recorded video has both video and audio streams. Check with `ffprobe` and actual playback on Chromebook.
- [ ] All original six OmniBox acts and editable story scripts still persist.
- [ ] HoloBox → Media Studio imports the real Blob with no auto-publish; no real earnings or duplicate credits.
- [ ] Full TypeScript and build checks pass against the reviewed PR branch. Perform smoke tests and rights/creator-consent review before merge.
- [ ] Publish requires user authentication, private media storage, server moderation, and explicit user consent.
- [ ] BJ v6 and integrated v10 remain unmodified and independently playable.

## Cost controls
Use **one** approved model and small response/token limits for the first pilot, keep HoloBox rendering in the browser, record only original/licensed voices, and keep all cloud video generation disabled until monitored and explicitly budgeted. No autonomous purchasing, publishing, payments, mission rewards, or account changes from model output.
