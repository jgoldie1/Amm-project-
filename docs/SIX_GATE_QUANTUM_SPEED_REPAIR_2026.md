# TRYAMM Six-Gate Repair + Quantum Speed Engine Contract

Status: engineering foundation. A gate is not complete until its visible/runtime acceptance checks pass.

## Quantum Speed Engine (QSE)
QSE is a performance/governance layer, not quantum-computing hardware.

Shared governors:
- Performance Governor: adaptive density/LOD/update frequency before frame collapse.
- Memory Governor: unload inactive world, character, media and interior assets.
- Network Governor: prefetch likely next routes/assets; batch noncritical telemetry; tolerate weak networks.
- Release Governor: block promotion on critical regression and preserve a known-good rollback point.

Shared rules:
- joystick/input has higher priority than decorative simulation.
- mobile real-time shadow maps remain disabled unless a certified device tier permits them.
- no speed optimization may bypass auth, server-authoritative commerce/rewards, consent, moderation, or privacy.
- every gate records startup, frame-time/FPS proxy, memory proxy, bundle/asset budget, network/error and interaction-latency evidence where measurable.
- load only what the player can currently see/use or is highly likely to need next.

## Gate 1 — StreetVerse Chicago + QSE
Targets: spawn, joystick/touch, camera, collision, buildings/trees/roads, traffic/NPC visibility, mobile performance.
QSE: world/chunk streaming, LOD, instancing, pooled vehicles/NPCs, distance-based AI ticks, lazy interiors, texture budgets, adaptive density.
PASS only when visible mobile gameplay remains responsive and world geometry is present.

## Gate 2 — UI + QSE
Targets: no blocking Benny/LIVE/Reels overlays; working carousel; no dead visible buttons; accessible touch targets.
QSE: lazy panels, input-priority lane, route prefetch, UI frame budget, unload closed panels.
PASS only when joystick remains usable and every promoted navigation control resolves.

## Gate 3 — Core Journey + QSE
Path: Sign In -> Passport -> StreetVerse -> Mission -> XP -> Ledger -> Reel/Holo LIVE.
QSE: prefetch next likely route, cache safe/static metadata, defer noncritical analytics.
PASS only with an end-to-end mobile journey and authoritative identity/economy state.

## Gate 4 — HoloGPT / PK / Commerce + QSE
Targets: HoloGPT response route, PK/Holo LIVE entry, creator tools, business/marketplace, verified payment/reward chain.
QSE: lazy media/video bundles, connection reuse, backpressure, telemetry batching, bundle splitting.
PASS only when checkout/reward paths remain server authoritative: verified event -> transaction -> entitlement/reward -> ledger.

## Gate 5 — Characters / Campus / Live Events + QSE
Targets: registry-driven family/friends, birthdays, Jacobie campus, Brielle, Tattianna, Kofi and later additions.
QSE: current/nearby/event character assets only; reusable mission templates; cached safe character metadata; asset eviction.
PASS only when adding a character/event does not require rewriting core StreetVerse UI.

## Gate 6 — Global Life Engine + QSE
Targets: Year -> Season -> Month -> Week -> Day -> AM/PM -> Hour -> spontaneous approved event.
QSE: regional/time-zone shards, compact 'What's Happening Now' selection, local caches, event deltas instead of global-state downloads.
PASS only when Chicago/Greenville can run independently and future Lagos/Abuja content can plug into the same engine without copying Chicago culture/content.

## CI/build-speed contract
- align supported Node version deliberately across package engines and CI.
- prefer lockfile-backed npm ci for CI where lockfiles are valid.
- use setup-node npm dependency caching with explicit lockfile paths.
- cancel superseded CI runs.
- do not cache secrets or treat caches as trusted executable input.
- keep focused tests ahead of expensive full-build/deploy work.

## Release rule
Only one repair gate advances at a time:
RED -> REPAIR -> MOBILE/VISIBLE TEST -> GREEN CHECKPOINT -> NEXT GATE.
A later gate may not mask or waive a failed earlier gate.
