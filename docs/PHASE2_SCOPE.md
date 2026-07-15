# TryAMM Phase 2 Scope

## Delivered foundation

- Stripe hosted Checkout adapter for subscriptions and token packs
- Flutterwave and Paystack provider adapter for Africa-localized checkout and payouts
- LiveKit server token endpoint for WebRTC publishing and subscribing
- Claude API adapter as the primary advanced assistant
- Meshy text-to-3D task creation and task-status endpoint
- Working `/platform.html` launchpad instead of inactive feature windows
- Draft content APIs and demo catalog for Reels, short drama, Holo Ads and livestreams
- Safe mock behavior when provider keys are absent

## Product surfaces to finish

### Livestreaming

Connect the browser LiveKit SDK to `/api/livekit/token`, publish camera and microphone, display remote participants, add mute/camera/screen controls, chat, moderation, recording and replay. Lottie JSON overlays should run in a separate pointer-events-none overlay layer so gifts, reactions, PK meters, sponsor cards and Holo Ads do not block video controls.

### Reels

Add upload/record, vertical preview, caption editor, music selection, thumbnail, moderation, publishing, feed ranking and analytics. `/api/content` currently creates draft catalog records only.

### DramaBox-style originals

Add series, seasons, episodes, vertical video, autoplay-next, locked episodes, subscriptions/token unlocks, subtitles, translation, progress tracking and cliffhanger analytics. All titles and scripts must be original or licensed.

### Holo Ads

Add advertiser campaign setup, creative upload, placement rules, budget, targeting, moderation, impression/click tracking and billing. Stream overlays must be dismissible, captioned where needed, reduced-motion compatible and frequency capped.

### Lottie holographics

Use approved Lottie JSON assets for:

- livestream countdown and entrance effects
- gifts and reactions
- PK battle meters
- Holo Ads and sponsor cards
- creator badges
- episode transitions
- loading and AI listening states

Do not load arbitrary creator-supplied animation JSON without validation. Limit animation size, duration and frame rate; provide static fallbacks and honor reduced-motion preferences.

## Required production controls

- Supabase authentication and row-level security
- PostgreSQL transaction, content and livestream records
- webhook idempotency and reconciliation
- creator/vendor KYC before payouts
- signed media uploads and malware scanning
- content rights declarations and moderation
- role-based livestream permissions
- rate limits and abuse monitoring
- CI installation, syntax, unit and integration tests

## Acceptance tests

1. Stripe test subscription completes and webhook records it once.
2. Stripe test token-pack payment credits an internal ledger only after verified webhook completion.
3. Flutterwave and Paystack test checkouts return hosted payment URLs.
4. Two browsers join one LiveKit room and exchange camera/audio.
5. Claude answers using approved TryAMM knowledge and falls back safely when unavailable.
6. Meshy creates a test task and the resulting model URL is stored only after completion.
7. A Reel, drama episode and Holo Ad draft can be created and displayed in the catalog.
8. Lottie overlays never block stream controls and reduced-motion mode disables animation.
