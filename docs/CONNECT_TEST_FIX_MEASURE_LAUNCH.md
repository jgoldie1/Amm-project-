# TRYAMM Unified Release Path

Status: ACTIVE LAUNCH PLAN

## Operating sequence
CONNECT → TEST → FIX → MEASURE → LAUNCH.

No subsystem is considered launch-ready simply because a screen or model exists. Every major capability must move through status labels:
CONCEPT | SPECIFIED | CODED | INTEGRATED | TESTED | GATED | LIVE.

## Authoritative Living Games catalog
GameVerse Nexus bridges these 11 standalone games:
1. Living City
2. Living Flight
3. HoloBeasts: Living Wilds
4. Living Ops: Shadow Front
5. Paranormal Unit: Rift Hunters
6. Holo Battle: Omniverse
7. Living Racing
8. Living Sports
9. Living Laser
10. Living Quest
11. Creator World

Living Mischief: Nibblins remains a connected companion system, not one of the 11. The separate 13 Living Worlds registry remains the environmental/world layer.

## Game completion contract
Each game needs:
- canonical game ID/slug and route
- start/resume/save state
- controller/input abstraction
- accessibility metadata and one-handed/remappable support where appropriate
- backend-authoritative account, owned items, rankings, bans and purchases
- local presentation/runtime state only for non-authoritative moment-to-moment play
- matchmaking/multiplayer state when multiplayer is enabled
- telemetry/crash reporting
- moderation/safety hooks where social play exists
- monetization state clearly sandbox vs live
- launch status badge

Current launch expectation: Living City and Living Sports may expose prototypes where existing routes support them; the remaining games stay PLANNED until a real playable vertical slice is connected.

## Lottie / hologram animation layer
Stable TRYAMM asset IDs previously defined:
- tryamm-hologram-splash
- hebrew-shalom-glow
- america-250-happy-birthday

Rules:
- Search/recover original `.json`/`.lottie` assets before replacing them.
- Any starter recreation must be labeled as a recreation, not as the recovered original.
- Animation layer must respect Accessibility Passport reduced-motion settings.
- Lottie assets receive version, owner/source, license/provenance, fallback image and performance budget metadata.
- Failed animation must degrade gracefully instead of blocking splash/navigation.

## Holographic UI integration
JARVIS/HoloGPT is the front door. Shared launchers/modules must inherit:
- Accessibility Passport
- JARVIS Permission Firewall
- audit events
- feature gates
- account identity
- design tokens/holographic style
- reduced-motion fallback

## Platform connections that must converge
PERSONAL JARVIS
→ Student / Creator / Business / Vehicle / Home JARVIS
→ Learning Passport + Opportunity Match
→ Stubbs Harmony + Business Launch OS
→ Holo Marketplace + Holo Coupons
→ Jin Pay sandbox + Money Engine
→ Holo Delivery / Package tracking
→ Supplier Exchange + HR
→ Quantum Zapier + Quantum Community
→ Company Digital Twin + Business Pulse + Simulator
→ Platform Sustainability Engine.

## Sustainability release gate
TRYAMM target: 3.00× eligible platform revenue / measured infrastructure cost.

Dashboard must display actual measured values, not projections disguised as actuals:
- eligible platform revenue
- AI/data cost
- database/storage/bandwidth
- LIVE/video/rendering cost
- maps/delivery/messaging cost
- security/moderation/support cost
- refunds/reserves/provider obligations separately
- self-support ratio
- 3.00× target gap

Do not count creator earnings, restricted mission funds, taxes, provider settlement balances or other liabilities as available platform revenue.

## Test matrix
### Core shell
- splash never traps user
- all global launchers open/close
- keyboard navigation
- mobile layouts
- reduced-motion
- error boundaries/fallbacks

### GameVerse
- exactly 11 authoritative games visible
- Living City routes to city prototype
- Living Sports routes to sports prototype
- planned games cannot falsely launch
- Middleverse handoff works
- shared Passport state remains isolated from client-authoritative financial/ownership truth

### Commerce
- Marketplace → cart → coupon → checkout preview
- package/food tracking state progression
- proof/problem/refund UI path
- real-money gates remain off until provider approval

### JARVIS
- read/suggest/prepare/approval/execute boundaries
- no autonomous high-impact action when gate disabled
- action audit event creation

### Accessibility
- keyboard completion
- focus order
- screen-reader semantics
- large text/targets
- one-handed modes where relevant
- captions/transcripts for authored media
- reduced motion disables nonessential Lottie/Holo animation

### Security
- authentication/authorization
- RLS/data isolation
- secret scan
- abuse/rate-limit paths
- upload validation
- webhook replay protection when providers are connected
- payout/ledger idempotency before real money

## Measure before scale
Core launch metrics:
- successful session/start rate
- crash/error rate
- task completion rate
- accessibility success rate
- GameVerse prototype starts/completions
- checkout funnel in sandbox/production separately
- delivery tracking success
- JARVIS approval/action completion
- paying conversion
- cost per active user
- revenue per paying account
- platform self-support ratio

## Launch definition
PUBLIC LAUNCH does not require every planned game or regulated provider to be live. It requires the public shell, truthful status labels, stable prototypes, working user journeys, security/accessibility gates, observability and a clear sandbox/live distinction.

The remaining planned systems can ship progressively after launch without misleading users.