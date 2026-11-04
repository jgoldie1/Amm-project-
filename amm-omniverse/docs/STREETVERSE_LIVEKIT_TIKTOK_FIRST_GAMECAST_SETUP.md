# StreetVerse LIVE — first protected gamecast setup

This is a **runbook**, not evidence of a live deployment. Do not commit or paste API secrets into GitHub, ChatGPT, client-side Vite variables or browser JavaScript.

## Initial goal
- One authorized host on Chromebook, one viewer on a second device, one StreetVerse tab/window, one private LiveKit room.
- TikTok is the **intended first public destination**, not automatically linked to LiveKit or TRYAMM.
- Keep production unchanged until browser gamecast and moderation tests pass.

## Create LiveKit credentials (provider action required)
1. Sign in to https://cloud.livekit.io/ and create/select a project.
2. Open **Settings > Keys**, generate an API key/secret pair, and copy its project WebSocket URL.
3. In the deployed backend's **server environment only**, set:
   - `LIVEKIT_URL=wss://YOUR-PROJECT.livekit.cloud`
   - `LIVEKIT_API_KEY=<provider-generated key>`
   - `LIVEKIT_API_SECRET=<provider-generated secret>`
   - `LIVE_HOST_USER_IDS=<approved Supabase auth.users UUID>`
   - `LIVE_PUBLIC_VERIFIED=false`
4. Do not expose these through `VITE_*` or `NEXT_PUBLIC_*` or commit a real `.env`.
5. Redeploy only when hosting/billing are enabled and you intend to test. If deployment is paused, the feature remains unactivated.
6. Check GET `/api/live/status` for `configured: true`, `hostAllowlistReady: true`, and `readyForPublic: false` before validation.

## How to get the host user UUID
Sign in to the app with the authorized host account and obtain its authenticated Supabase user ID through the administrator-controlled authentication dashboard. Do not use an email address as the allowlist value or share access tokens. No default creator has host permission when the allowlist is empty.

## Chromebook → second-device smoke test
1. Sign into TRYAMM using the approved host. Open LIVE Center, select **GameVerse Cast**, set a private room.
2. Join as host. Gamecast should prompt for the microphone, not require a webcam.
3. Click **SHARE STREETVERSE GAME**. In Chrome's system screen-sharing chooser select the StreetVerse tab/window. A tab may be selected only by user gesture. Audio capture depends on browser and chooser support; test separately.
4. Sign in on a **second device** using a separate viewer account; join the exact room with Viewer role. Confirm gameplay picture, microphone audio, motion, reconnect, exit, and sound.
5. Confirm the viewer account receives 403 if it attempts to request a host token. Only the approved host should get the publish permission.
6. Test one-hand controls while the stream is publishing: walk, enter six-seat vehicle, drive, exit, RP carousel, moderation vote. The share picker should not steal or permanently disable gameplay controls.
7. Pause/stop sharing and verify no background screen transmission remains. Disconnect and verify the room ends.
8. Verify /api/live/status readiness separately from successful viewing; deployment configuration alone is not proof of readiness.

## TikTok LIVE distribution
- Confirm the TikTok account is eligible for LIVE and the officially supported desktop/encoder or producer workflow is available **in that account**.
- Use authorized TikTok LIVE Studio / LIVE Producer access and its provided streaming destination or supported workflow. **Never assume that a generic RTMP key is available**.
- First test the game feed locally and privately via LiveKit. Then use a supported encoder or capture workflow to publish to TikTok when access is granted.
- LIVEKIT_URL is for TRYAMM viewers, **not** a TikTok ingest endpoint.
- A gamecast from TRYAMM does not imply that the video is sent to TikTok. The third-party publish link and permission must be configured and measured separately.
- No scraping login sessions, hidden TikTok chat APIs, fake API keys, or unofficial gift settlement.

## Audience moderation and AI assistants
- Audience gateway starts disabled and only accepts verified, approved, session-bound allowlisted events.
- CrossVerse handles **consented** appearance/recording across worlds; Stubbs AI coordinates show plans; MiddleVerse AI routes operational handoffs; Lyons Tech AI supports diagnosis; JARVIS/HoloGPT may open approved panels.
- None of these agents obtains provider API keys, publishes video, or changes payouts by itself. No component has verified AGI or subjective self-awareness.
- Mods/dev packs may provide approved overlays and cosmetics in a sandbox. No mod may read credentials, alter payment streams, impersonate moderators, run arbitrary code on viewers, or affect public sessions without review.

## Cost controls
One host + one viewer, no automatic recording, no paid transcoding/multistreaming, limits on live duration, and no 24/7 stream before a verified demand and usage review.

## Release gate
Keep `LIVE_PUBLIC_VERIFIED=false` until provider setup, two-device tests, moderation, gamepad/one-hand controls and capture cleanup have passed. Add signed test evidence to the pull request before enabling any public route.
