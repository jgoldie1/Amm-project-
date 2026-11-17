# GameVerse + AI Hall Pass + Creator Business launch integration — 2026-11-17
## Source recovery, never erase prior work
- `data/omni-news-and-social-games-expansion.json` is a preexisting specification for free-play Spades (partners/solo/bidding/nil/bags), poker and other social-game concepts, Crown Game Shows, room roles and anti-collusion. This PR implements *only* local Spades trick practice; it does not claim to implement the specification's multiplayer or chip economy.
- `amm-omniverse/src/components/GameVerseHub.tsx` contains 11 Living Games with source-defined PROTOTYPE/PLANNED states. The original sport-title catalog in earlier histories should be reconciled, not replaced with invented parallel production games.
- `amm-omniverse/src/components/GameVerseEntertainmentDistrict.tsx` is a four-venue *UI* roleplay demo, not physics, 3D interiors or real commercial venues.
- `amm-omniverse/src/components/GameVerseSpadesPractice.tsx` implements a single-player 13-trick practice with 3 deterministic bots, follow-suit and spades-break rules; no bidding/nil/bag/league logic yet.
- `amm-omniverse/src/components/GameVersePoolPractice.tsx` implements a two-ball practice shot with bounded toy physics; NOT a commercial 8-ball simulator.
- `amm-omniverse/src/components/HoloCreditChannelShop.tsx` is the existing catalog entry; new games do not charge, debit or credit it.
- `amm-omniverse/src/App.tsx` mounts existing AI Café, HoloLab and TRYAMM LIVE. GameVerse only launches those existing surfaces and cannot manufacture production readiness or payouts.

## Governance: run the business with operator approvals, not phantom automation
Suggested human-governed task pipeline:
1. Creator or customer opts in (consent, delivery scope, price, refund terms, allowed territories).
2. AI Café proposes job, builds/quote/campaign, without transferring money or publishing.
3. Owner approves price, licensed assets, expected delivery, taxes, privacy and provider costs.
4. Stripe server creates verified Checkout and signs webhook; server ledger idempotently books settled order. Stripe access and account verification must be restored first.
5. HoloForge/HoloLab produces *preview*; reviewer signs off generated assets and rights; one-button quality regression gates production.
6. Fulfilled service and receipt update back office. Refunds/disputes reverse entitlements and allocations. No fictional credits become money.
7. Business analytics measure qualified leads, paid conversion, retention, fulfillment time and chargebacks; AI can propose adjustments but only authorized staff approve high-impact actions.

## AI Hall Pass
Historic `PR #727` quick-site preview mentions AI Hall Pass but clearly labels AI concierge, booking and Hall Pass as **not connected**. Don't sell “front-of-line human support” until its queue, SLA, staffing, cancellation/refund terms and customer communications are real. Planned possible revenue: properly disclosed service pass or business consultation; owner approval required.

## SMS / BIGO-style creators
- Provide explicit unticked consent by channel and purpose; record who/when/source and wording, and suppress after STOP. Support HELP and reasonable opt-out latency. Handle age/accessibility/privacy; check TCPA/CTIA and provider A2P registration with counsel/provider as appropriate.
- Live social room features need actual LiveKit API credentials, short-lived signed host/viewer room tokens, moderated rooms, reconnection, consent for recording, creator safety and abuse reporting. A button to existing LIVE is NOT proof streaming is enabled.
- SMS, third-party iGaming, token cash-outs and auto-mass marketing must NOT be connected until provider approvals and compliance are satisfied.

## Optional third-party graphics technology (not copied or deployed by this PR)
- `mkkellogg/GaussianSplats3D`: Three.js splat visualization pilot; check license, render cost and scene-rights.
- `Looking-Glass/LookingGlassCoreSDK`: physical compatible light-field display only, not ordinary-screen hologram.
- `meta/immersive-web-sdk`: WebXR compatibility/integration research, avoid second competing engine.
- `maplibre-ext/protomaps-basemaps`: tile styling with MapLibre + Planetiler; map data rights and attribution separately reviewed.
- `Nyveon/Splatour`: interactive splat tour reference with code/asset licensing review.
Install/ship external packages only behind consented, reproducible separate CI/security/license/performance checks and a functional use case.

## Honest release milestones
- One push CI: node tests for venue contracts, a complete deterministic Spades practice round, pool shot, checkout isolation; typecheck, Vite build; JSON source audit artifact.
- One push UI: four-venue interactions with explicit non-3D smoke export; Spades JSON trick receipt and pool JSON shot receipt.
- Real-device: one-handed Chromebook and iPhone controls, save/reload, clear audio captions and performance.
- Blockers: cloud deployment and authenticated backend state, **published BJ rig/animation**, 3D venue geometries, matchmaking + real game lobbies, verified money, consented SMS, legal/licensed content, server-authoritative multiplayer and end-to-end source SHA release gates.
