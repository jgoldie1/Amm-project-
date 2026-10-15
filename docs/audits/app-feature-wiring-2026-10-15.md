# TRYAMM app wiring audit — 2026-10-15

Source baseline: ee2e273 (main). Public probes were made around 21:41–21:44 UTC.
This is an initial repair pass, not certification of every app feature.

## Verified public observations

| Area | Evidence | Interpretation |
| --- | --- | --- |
| Homepage | Live browser rendered Your world. Your way. and platform controls | Startup worked in the inspected desktop cloud browser; not an iPhone certification |
| Marketplace launcher | Clicking Open Holo Marketplace displayed its dialog | Main launcher works; purchasing was not tested |
| Marketplace → delivery | Clicking OPEN DELIVERY produced no visible destination in the observed snapshot | Handoff needs repair; source used an optional global owned by multiple components |
| HoloGPT | GET /api/ai/health: 200, degraded:true, all provider booleans false, executorConfigured:false | Interface/diagnostics available; generative-provider connection not configured |
| Creator media | GET /api/media/health: 503, dataApiStatus:402, reason:supabase_402, signedUploads:false, verifiedPlayback:false | Upstream service blocks media readiness; billing cause needs account confirmation, not inference from status alone |
| LIVE / PK / panels | GET /api/live/status: configured:false, readyForPublic:false; URL, API key and secret missing | Production LiveKit configuration required, then two-device verification |
| Payments | First probe timed out; follow-up /api/payments/status returned 200, stripeConfigured:false, payoutMode:ledger_only, livePayoutsEnabled:false | Endpoint recovered; this payment route is not configured for live Stripe charges/payouts |
| Meshy | GET /api/meshy/health: configured:true, authenticationConfigured:true, durableStorageConfigured:false, backgroundWorkerConfigured:false | Authentication configuration exists; durable/background pipeline incomplete; no paid generation attempted |
| Aniyah commerce | GET /api/studio/aniyah-readiness: 401 | Authenticated test needed; 401 is not evidence of a broken route |

The guessed /api/livekit/health path returned HTML, not JSON. It is not the app's health route and is not used to judge LIVE readiness. The actual route is /api/live/status.

## Repairs in this branch

- HoloMarketplaceLauncher subscribes to the event emitted by command-dock fallback; its legacy callback is registered in an effect and removed safely on unmount.
- Marketplace ASK JARVIS now dispatches the existing HoloGPT event alias and dismisses the marketplace. Previously it had no handler.
- Marketplace OPEN DELIVERY now dispatches the delivery event and dismisses the marketplace, instead of relying on the overwritten optional global.
- /aniyah-studio and /64-track-studio are now recognized during initial app routing. Their navigation handlers existed but the initial route allowlist omitted them.

## Validation and limits

- npm ci --ignore-scripts completed.
- npm run typecheck passed after changes.
- Existing holo-marketplace-checkout-contract and aniyah-64-track-business-contract passed.
- Actual launcher effect executed in a Node VM with mocked React hooks: event launch, legacy callback and cleanup passed.
- Actual JSX handoff callbacks executed from the TypeScript AST: correct destination events and source dismissal passed.
- Added tests/e2e/marketplace-feature-wiring.spec.ts to exercise visible browser destinations and fresh studio deep links.
- New browser tests were NOT executed: local Chromium download returned invalid/truncated archives. Cloud browser verified the existing production UI only, not this branch.
- Full production build, deployment and post-deployment iPhone checks remain outstanding. No release claimed.

## Remaining app-wide work

1. Review production provider settings in the correct Vercel project and environments; do not paste secrets into audit reports.
2. Resolve Supabase service response, then verify sign-in, upload, playback and account persistence.
3. Configure an authorized AI provider and verify a real HoloGPT response; separately verify action execution permissions.
4. Restore LiveKit configuration and test host/viewer, PK, panel, reconnect and background interruptions.
5. Verify payment routes and webhook/ledger behavior in test mode before enabling real charging or payouts.
6. Wire or explicitly disable marketplace coupon APPLY, which currently has no click handler. Do not manufacture a successful discount.
7. Run browser tests on this branch, merge only after required checks, and verify the delivered build on the user's iPhone.
8. Continue feature-by-feature journeys for reels, Omni Box, Holo Fon, notifications, jobs, businesses, world navigation, character/asset loading, missions and saved progress. These are unverified, not declared broken or complete.

The repository's 23-verse source audit reports 2 LIVE, 20 BUILDING and 1 PLANNED. These are authored labels checked by text-based contracts, not measured live functionality. Registry integrity tests passing must not be reported as all features working.
