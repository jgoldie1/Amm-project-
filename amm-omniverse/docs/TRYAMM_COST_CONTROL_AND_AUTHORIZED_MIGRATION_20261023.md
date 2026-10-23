# TRYAMM cost control and authorized host migration

## Ground truth on Oct 23 2026
- `tryamm.online` and `www.tryamm.online` are attached to the `amm-omniverse` Vercel Vite project, NOT the `amm-project` Express project.
- The current linked Vercel team is Pro with a separately billed additional team seat (confirmed in an individual daily FOCUS bill period); provider says recent preview deployment for `amm-project` was account-blocked.
- `amm-omniverse` has Supabase frontend client env names, but no LiveKit server keys nor server Supabase service-role key.
- Do NOT change DNS or initiate a new paid account to bypass billing/account restrictions. Resolve account status with provider and owner first.

## Server-only operator knobs on the real API project
- `LIVE_NEW_ROOMS_ENABLED` (default true): false pauses NEW room registration.
- `LIVE_NEW_VIEWERS_ENABLED` (default true): false pauses new viewer/guest admission, but permits already-connected identity to rejoin.
- `LIVE_MAX_ACTIVE_ROOMS` (default 1, integer clamp 1–100): database preflight before LIVE activation.
- `LIVE_MAX_PARTICIPANTS_PER_ROOM` (default 12, integer clamp 2–100): provider participant count preflight at viewer/guest token issuance.
- `LIVE_VIDEO_QUALITY` (default economy): economy 640×360/15fps, balanced 960×540/20fps, hd 1280×720/24fps.
- Video capture profile is supplied by the authenticated server token endpoint; the client applies it when enabling camera.

These are admission/quality **safeguards**, not guaranteed hard monthly spending caps. Concurrent token requests, previously issued tokens and sessions already connected can exceed an application preflight. Use LiveKit Cloud's free Build hard quotas or provider project quotas, plus Vercel spend management and billing alerts; monitor usage. Avoid claiming a user count equals a dollar limit.

## Staged migration plan
1. Review current Vercel account's deployment block with Vercel support/account notifications. Do not evade an account limitation through a second account.
2. Review organization ownership, team-seat billing, domains, DNS, and source GitHub repo access. Remove unneeded paid seats only with explicit team-owner authorization.
3. Create a test deployment of the reviewed `amm-omniverse` project on a legitimate destination account/team and a temporary hostname; configure only necessary environment values securely there. Never put LiveKit secrets or Supabase service-role in VITE_ variables.
4. Run smoke tests: sign-in, StreetVerse/mobile FPS, LIVE host and viewer on different devices, signed webhooks, moderation, payouts disabled by default, Stripe test checkout, cloud storage and backup recovery.
5. If green, use Vercel's supported project transfer, or controlled DNS cutover via Cloudflare with rollback and no downtime where possible. Do NOT redirect tryamm.online before a proven replacement is operational.
6. Preserve owner access, DNS provenance, API authentication and secrets. Rotate copied secrets at cutover; verify HTTPS, CORS, webhooks and payments. Document a rollback endpoint. No duplicate paid services without an explicit user decision.

## Spending and capacity
- Vercel Spend Management is Pro-team scoped; limit applies to metered on-demand usage; subscriptions/seats have separate charges. Pausing a deployment makes the app unavailable with HTTP 503, so start with warnings where service continuity matters.
- LiveKit Build starts free with an included WebRTC participant-minute and data transfer quota; its hard quotas and per-project limits are separate from our API's participant cap.
- Cloudflare R2 Standard free tier includes a modest storage/operations allowance and egress-free storage, not free real-time WebRTC delivery.
- Estimate participant-minutes as (number of connected participants × minutes connected); count the broadcaster too. Also review downstream gigabytes: quality and layout change usage.
- Never enable real money gifting, payouts or marketplace 'paid' order state from browser-only events. Merchant verification, webhook authenticity, settlement and refund flows must be tested first.