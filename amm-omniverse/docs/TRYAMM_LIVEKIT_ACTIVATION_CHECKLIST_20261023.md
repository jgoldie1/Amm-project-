# TRYAMM two-device LIVE activation, account safety and release gates

Development-only implementation; never mistake a successful GitHub test for a real phone broadcast.

## Installed
1. Host creates a Supabase live_rooms record with status planned.
2. Existing owner auth token allows the host to connect to LiveKit, not any arbitrary viewer.
3. Once the host's camera/mic is published, server RoomServiceClient.getParticipant checks the same host identity and an unmuted track before marking room live.
4. Only live rooms issue viewer tokens; /live?room=...&role=viewer link never grants publishing.
5. Leave closes the room in Supabase; signed LiveKit webhook participant_left/room_finished also closes live room when its owner leaves or room finishes.
6. Old delayed webhooks are checked against started_at; unsupported stage media schema must not be written.

## External setup still required
- Fix Vercel account deployment blocked status using official dashboard. Do not bypass service/account billing restrictions.
- Confirm Vercel project root, frontend www origin, and where serverless /api/live/* endpoints are deployed.
- Set server-only LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY on the actual API project (never in VITE_ browser settings).
- Configure authorized Supabase client URL/anon key for frontend sign in, without exposing service-role key.
- Register webhook target https://<API-ORIGIN>/api/live/webhook inside the LiveKit Cloud project under Settings -> Webhooks. LiveKit signed payload validation requires raw body.
- Verify host and viewer are different signed-in people on separate devices, permissions, camera and mic, host publishes tracks, viewer joins and sees real video, subscriber count, record recovery, host disconnect produces ended status, and gift/payout buttons stay behind verified payment rules.
- Confirm no live Stripe payments or creator payout commission yet; test verified Stripe Checkout server flow and webhook separately before making earning promises.
- Budget and abuse controls: start with LiveKit free tier, monitor participant-minutes, data transfer and concurrent rooms; prohibit anonymous token minting; keep Cloudflare R2 uploads off until Worker hard limits and credentials set. Backend webhook cannot cure a disconnected frontend without proper operational monitoring.

## External and operational limitations
- Vercel account recently returned `why-is-my-account-deployment-blocked` on new preview; no new paid service is authorized by this code.
- The webhook endpoint and provider room check are source-backed but NOT verified against a real LiveKit project until configured.
- Webhooks are retried but can be delayed or dropped; production monitoring should reconcile stranded live_rooms with provider rooms periodically.