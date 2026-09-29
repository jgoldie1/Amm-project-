# TRYAMM / StreetVerse Launch Engineering Tracker

This file is the branch-local launch clock and evidence ledger. It tracks engineering effort without pretending elapsed wall-clock time equals verified engineering hours.

## Clock
- Session clock started: 2026-09-28T16:52:00-05:00
- Branch: `feat/tryamm-world-tv-clean`
- Launch PR: #414 (keep draft until gates pass)
- Starting head for this session: `310e0bfb67f13f26f8285ffc1d9705d5273a123e`
- Morning mega-action baseline head: `cd2dad2fbf03c781b57479bdcecaaac3d0c457d8`
- Starting deployment checks: Vercel amm-project SUCCESS; Vercel amm-omniverse SUCCESS
- Current PR size at mega-action checkpoint: 264 commits / 168 changed files / 7,863 additions / 66 deletions
- Current reconciliation risk: branch 264 commits ahead / 33 behind main
- Elapsed session window at mega-action checkpoint: approximately 6h 33m
- Verified active engineering hours: NOT CLOSED YET — the session is still ACTIVE and wall-clock waiting is not counted as engineering time.

## Engineering-hour rules
1. Record actual active engineering sessions only; do not convert calendar waiting into engineer-hours.
2. Every entry needs start/end timestamps, engineer/agent, scope, commit(s), verification evidence and blockers.
3. Estimates are labeled ESTIMATE until replaced by actual time.
4. Launch readiness is determined by gates, not accumulated hours.

## Active launch gates
| Gate | State | Evidence / next proof |
|---|---|---|
| Core StreetVerse playable loop | VERIFY | mega-action certifies spawn → mission → repair → enter → drive → finish → verified reward contracts |
| NPC social / dance runtime | BUILDING | bind approved animation clips + world update loop |
| Performance + motion catalog | BUILDING | rights-safe registry/oracle/edit pipeline exists; real approved assets still need runtime proof |
| IRL / low-tech access | BUILDING | opt-in access modes + hub/QR/SMS capability registry |
| Payments / entitlements / ledger | VERIFY | server-authoritative contracts included in mega-action |
| Accessibility | VERIFY | one-hand, mobile controls, accessibility Passport and journey contracts included |
| Chicago certification | VERIFY | Circle Park → Roosevelt → Taylor → Pilsen AAA benchmark locked; physical phone proof still required |
| Circle Park reality pilot | READY_FOR_FOOTAGE | 60–90 minute source-footage requirement + confessionals + rights + 22-minute edit + 8–10 Reels + LIVE + AAN/Holo Drama + movie + game bridge locked |
| Lagos + Abuja reuse | PLANNED | reuse certified City Kit/shared templates after Chicago |
| Global seven-wave certification | PLANNED | per-city compiler gates |
| Branch reconciliation | BLOCKED | branch is 33 commits behind main; reconcile/test before merge |
| App-store / launch certification | BLOCKED | requires green mega-action + release artifacts + policy/store evidence + physical-device checks |

## Session log
| Start | End | Engineer/agent | Scope | Actual hours | Commits | Verification |
|---|---|---|---|---:|---|---|
| 2026-09-28 16:52 CDT | ACTIVE | ChatGPT engineering session | launch tracking + StreetVerse Chicago/global convergence + mobile/accessibility + media/AAA release orchestration | ACTIVE | through `cd2dad2` at checkpoint | Vercel checks green at checkpoint; mega-action created; PR remains draft/non-mergeable |

## Launch rule
Do not mark LIVE, PRODUCTION-COMPLETE, or RELEASED from architecture alone. Require executable evidence and passing gates.

## 2026-09-28 session evidence
- Added rights-safe Quantum performance discovery planner. It discovers metadata/references; it does not authorize copying.
- Added Oracle rights gate: approve-processing / reference-only / manual-rights-review / reject.
- Added approved clip processing recipe: trim, root-motion normalization, loop seam, foot lock, retarget, full/mobile/crowd LOD, compression, preview, attribution manifest.
- Mind Over Matter v1 added: transformed motion blueprints + similarity/originality review gate.
- Revenue product intents added for motion packs, creator licenses, business experiences, tickets, production services, bookings, sponsored missions, training and device access. Settlement remains server-authoritative.
- Library Assessor added for motion, models, textures, audio, VFX/SFX, video, images and environments, with duplicate hashing, provenance/rights, compatibility, mobile optimization and data-minimization decisions.
- StreetVerse Chicago character scale/camera normalization added.
- Circle Park spawn/progression and Roosevelt–Taylor–Pilsen grid foundations added.
- Mission → repair → vehicle entry/drive/reward evidence path added.
- One-hand accessibility, handedness-neutral controls, Passport persistence, language/sign bridge and Googloplex vocabulary/memory foundations added.
- NPC/social, multiplayer/presence, Living City and Global CityVerse foundations expanded.
- Business Passport/storefront, authoritative inventory/ledger and creator-economy contracts expanded.
- Holo LIVE/PK, Reel handoff/return-to-world, PWA/Google Play and mobile navigation/carousel contracts added or preserved.
- Circle Park reality production pipeline locked: phone shoot → confessionals → 22-minute episode → 8–10 Reels → LIVE aftershow → All American Network/Holo Drama → separate StreetVerse Chicago Movie Chapter 1 edit → playable mission/digital-twin bridge.
- Circle Park/Roosevelt/Taylor/Pilsen AAA benchmark locked with production geometry, PBR, lighting, density, character/vehicle animation, living population/traffic, weather, camera, audio, Chicago authenticity, interiors, LOD/streaming, mobile quality tiers and automated visual validation.
- Added `.github/workflows/streetverse-chicago-morning-mega-convergence.yml` to run root checks, full Omniverse checks/build, playable/mobile contracts, AAA evidence, media production contract and a founder morning phone checklist.

## Remaining hard blockers
1. Reconcile the branch that is still 33 commits behind `main`.
2. Get the mega-action green on the current head.
3. Perform physical iPhone checks: spawn, scale, joystick/one-hand control, mission marker, repair, enter/drive/park/exit, map/grid, Reel save/share, carousel destinations.
4. Replace/verify placeholder visual assets with rights-cleared production assets and validate real performance on target devices.
5. Shoot the actual Circle Park source footage and secure releases/permissions before editorial certification.
6. Runtime-test AAN/Holo Drama upload/player/distribution before calling those surfaces LIVE.

## Completion-grade mega-action expansion — 2026-09-28/29
- Commit: `cde466c351f030742987a4b2def00f8fab101917`
- Branch reconciliation is now a hard gate instead of a warning.
- Added Supabase migration-version uniqueness gate.
- Added full `amm-backend` authority/economic/financial checks.
- Added branch-safe Playwright desktop + mobile E2E for core launchers, Holo Delivery and Chicago production gameplay.
- Added Android API 36 shell generation, sync, debug APK and release AAB build.
- Added iOS native shell generation/sync + unsigned simulator compile on macOS.
- Added live Supabase Security Advisor gate using `SUPABASE_ACCESS_TOKEN` secret and project ref `fxluchtdfpediivhoksl`.
- Morning release gate now requires every completion lane, including source-truth/reconciliation.

### Newly verified live database blockers
Supabase project is ACTIVE_HEALTHY, but the current Security Advisor is not release-clean:
- 2 WARN findings: anonymous users can execute SECURITY DEFINER functions.
- 14 WARN findings: authenticated users can execute SECURITY DEFINER functions.
- 19 INFO findings: RLS enabled with no policy; each must be reviewed against intended internal/deny-by-default access.
Performance Advisor currently also reports WARN classes for RLS init-plan usage, multiple permissive policies and duplicate indexes; these are optimization/review items, while security WARN/ERROR findings remain hard blockers.

### Repository migration blocker
The branch currently contains duplicate numeric migration versions, including:
- `20260818_*` (2 files)
- `20260928_*` (2 files)
- `202608120011_*` (2 files)

Do not rename already-applied migration files blindly. Reconcile repository migration history against the live Supabase migration history before changing versions.

## Genie-in-the-Bottle asset transformation tournament — 2026-09-29
- Added `GenieBottleAssetTransformationEngine.ts`.
- Added exactly four reviewed transformation recipes:
  1. Reality Restore
  2. Chicago Documentary
  3. Holo Reality Fusion
  4. Cinematic Hero
- Weighted production scoring prioritizes realism, Chicago authenticity, holographic depth, gameplay readability, mobile performance, accessibility and originality.
- Reviewed recipe winner: **Holo Reality Fusion**.
- Added Circle Park production asset wave: hero character, park/ground, Roosevelt street kit, Taylor/Pilsen building kit, street furniture/signage, vegetation, vehicles, crowd, repair/garage interactions, interiors, night/wet-surface kit and holographic/AR interaction anchors.
- Added Quantum Asset Tournament Buffer: four-way parallel software scheduling, content-addressed caching, winner-first optimization and bounded retry policy.
- Quantum Crawler remains metadata-first/approved-source only; Oracle/rights review remains fail-closed.
- Mind Over Matter motion generation/originality review is part of the animation transformation path.
- Added tournament evidence script and contract.
- Added mega-action lane `asset-transformation-tournament` that uploads all four scores + selected winner as evidence.
- Production truth remains fail-closed: the recipe winner cannot publish until a real artifact URL, Asset Passport certification, performance evidence and human visual review exist.

## TRYAMM Native Asset Foundry — self-contained baseline
- TRYAMM Native Asset Foundry is now the default asset baseline; optional external generators are accelerators, not required dependencies.
- Native foundry generates four actual GLB scene candidates in CI with zero generation credits and no external API.
- Native reviewed direction remains Holo Reality Fusion.
- Native modular GLB resource pack now includes:
  - street-and-sidewalk
  - brick-building-module
  - street-lamp
  - bench
  - hydrant
  - tree
  - vehicle-blockout
  - holo-wayfinder
- Together with four scene candidates + reviewed-winner copy, the CI lane requires at least 13 actual GLB outputs.
- Every generated GLB is inspected and optimized with glTF Transform before artifact upload.
- Native generator embeds semantic/collision metadata, PBR material parameters and holographic interaction anchors.
- Native Chicago output is labeled Chicago-inspired / not an exact digital twin unless source-backed certification exists.
- Asset publish remains fail-closed pending human visual review, Asset Passport certification and target-device performance evidence.
- Meshy remains available as an optional server-side provider; baseline generation works without `MESHY_API_KEY`.

## Native Foundry → live Circle Park runtime integration
- Native Foundry is now part of the actual web build, not only a CI artifact.
- `npm run build` now runs `npm run native:assets` first and generates assets into `public/generated-assets/native`.
- Added runtime catalog with deterministic URLs for:
  - brick building module
  - street lamp
  - tree
  - bench
  - hydrant
  - holo wayfinder
  - vehicle blockout
  - street-and-sidewalk module
- Added resilient GLTFLoader runtime that:
  - loads unique assets in parallel
  - clones them into Circle Park placements
  - records failed loads
  - never crashes StreetVerse when a generated asset is missing
  - marks preview assets visual-only
  - preserves existing gameplay primitives as collision authority
  - disposes GPU resources when leaving the world
- Circle Park now loads the TRYAMM native GLB preview layer and exposes visible NATIVE ASSETS state: LOADING / READY / FALLBACK.
- Added native asset certification registry: PREVIEW cannot become CERTIFIED without human visual review, Asset Passport, runtime performance evidence, evidence refs and explicit collision-promotion review.
- Added `tryamm-native-runtime-asset-contract.mjs` to prove Foundry output names match runtime catalog URLs and Circle Park loader integration.
- Morning Mega Convergence now requires the native Foundry contract + runtime integration contract.
- Generated public assets are ignored from Git so normal builds do not dirty the working tree.

## Self-contained runtime resource completion
- Native Foundry now participates in the actual Vite build through `npm run native:assets`.
- Circle Park runtime catalog + GLTFLoader consume generated same-origin GLBs.
- Runtime placements cover buildings, lamps, trees, benches, hydrants, holo wayfinders and vehicle blockouts.
- Existing gameplay primitives remain authoritative collision/mission geometry until native assets are certified.
- Runtime failures fall back safely instead of blocking StreetVerse.
- Circle Park HUD reports native asset state: LOADING / READY / FALLBACK.
- Native runtime certification registry requires visual review, Asset Passport, performance evidence, evidence refs and collision-promotion review.
- PWA service worker now caches GLB/GLTF/BIN assets after fetch and falls back to cached copies offline.
- Service worker release advanced to `20260929-native-asset-foundry-v1`.
- Morning Mega Convergence now requires native Foundry, runtime integration and PWA asset-cache contracts.

## TRYAMM Red Hat Sentinel — defensive deception + attacker telemetry
- Added defensive-only Red Hat Sentinel under Jacobie Cybersecurity.
- Detects privacy-safe signals for:
  - canary/decoy route contact
  - secret-file probing
  - path traversal probes
  - SQL injection probe patterns
  - XSS probe patterns
  - shell/command probe patterns
  - common framework/admin scanning
  - unusual TRACE/CONNECT methods
  - excessive request velocity
- High-risk requests can receive a temporary 429 block.
- Canary endpoints always return ordinary 404 responses and do not reveal that they are defensive decoys.
- Event telemetry intentionally stores:
  - event type / risk score / signal codes
  - route class and HTTP method
  - HMAC source fingerprint (not raw IP)
  - HMAC user-agent fingerprint + coarse user-agent class
  - request fingerprint
  - payload SHA-256 + byte count, never raw payload
  - request ID and expiry timestamp
- Explicitly does NOT store:
  - passwords or credentials
  - Authorization headers
  - cookies/session tokens
  - raw IP addresses
  - raw exploit bodies
- Default retention: 14 days with opportunistic expiry cleanup.
- Service-role-only telemetry table with RLS and no client-facing policies.
- Owner/admin/security/release roles can read a 24-hour aggregate summary through Jacobie Vision.
- Dashboard treats signals as indicators, not proof that a person is malicious.
- `RED_HAT_TELEMETRY_PEPPER` is a server-only optional stable HMAC secret; without it, process-ephemeral hashing prevents cross-restart correlation.
- Red Hat Sentinel is defensive only and has no hack-back capability.

## Jacobie Edge DDoS + Origin Shield — 2026-09-29
- Vercel remains the public edge for TRYAMM and provides platform-level automatic DDoS mitigation.
- Removed public direct Render rewrites from `amm-omniverse/vercel.json` for:
  - `/api/payments/status`
  - `/api/checkout`
  - `/api/payments/verify-checkout`
  - `/api/creator/earnings`
  - `/api/stripe/webhook`
- Added same-origin Vercel Functions for those legacy routes.
- Added HMAC-SHA-256 Vercel → Render Origin Shield with timestamp, request ID and raw-body digest binding.
- Added staged monitor/enforce mode so the deployment does not break before the shared secret is configured on both Vercel and Render.
- Added root Render swarm throttling for auth, commerce, realtime, admin and normal traffic classes.
- Added Vercel static security headers and CDN caching for generated native GLBs.
- Added `tryamm-edge-ddos-contract.mjs`: no direct Render rewrite, signed proxy contract, timeout, security headers, log-first WAF, no automatic firewall publish.
- Added manual workflow `tryamm-edge-ddos-firewall-stage.yml`:
  - inspect current Vercel Firewall state
  - optionally stage log-first exploit/API burst rules
  - show firewall diff
  - never publish automatically
- Added runbook `docs/security/JACOBIE_EDGE_DDOS_RUNBOOK.md`.
- Emergency Vercel Attack Mode remains a human-confirmed production action.
- Hard Origin Shield enforcement remains pending the same `TRYAMM_EDGE_ORIGIN_SECRET` on Vercel + Render, followed by `TRYAMM_EDGE_ORIGIN_SHIELD_ENFORCE=true` on Render.

## MiddleWear Security Gateway → Middleverse
- Added one ordered security doorway in front of `/api/middleverse`.
- Request order: Jacobie security headers → Red Hat Sentinel → Jacobie Swarm Shield → server-validated Supabase identity → route risk classification → provider readiness gate → durable audit → operator review → Middleverse.
- Removed duplicated per-endpoint auth from the Middleverse router; the router now consumes the verified MiddleWear security context.
- Live Middleverse route metadata is used for policy:
  - high-impact routes require explicit non-green risk review;
  - money-sensitive routes are treated as provider-dependent + human-review-required;
  - high-impact/money-sensitive mutations fail closed if security-audit persistence is unavailable.
- High-impact handoffs cannot be marked completed by a normal member; an authorized owner/admin/security/ops/release role is required.
- Added a 128 KiB MiddleWear mutation ceiling to reduce resource-abuse risk.
- Ordinary safe reads do not create durable audit noise; mutations and high-impact decisions do.
- Middleverse responses are now `Cache-Control: no-store, private`.
- Added `middlewear-security-gateway.test.js` to backend authority checks.
- Current runtime health exposes `middleWearSecurity:true`.

## Industry-tough MiddleWear resilience stack — 2026-09-29
- MiddleWear Security Gateway is the enforced doorway for Middleverse.
- Ordered controls now include:
  - Jacobie security headers
  - Red Hat Sentinel
  - Jacobie Swarm Shield
  - request-class resilience bulkhead/deadline/circuit breaker
  - Supabase identity verification
  - Middleverse route risk policy
  - provider readiness gate
  - security audit persistence
  - distributed idempotency/replay protection for high-impact creation
  - authorized operator review for high-impact completion
- Added backend liveness and readiness endpoints:
  - `/api/livez` = process alive
  - `/api/readyz` = critical Supabase/config readiness + resilience state
- Added HTTP server durability:
  - request timeout 30s
  - headers timeout 35s
  - keep-alive timeout 65s
  - max 1000 requests per socket
  - graceful SIGTERM/SIGINT shutdown with 15s forced-exit ceiling
- Added MiddleWear bulkheads, request deadlines, overload shedding and circuit breakers.
- Added distributed high-impact request idempotency using backend-only hashed keys.
  - migration: `20260929120000_middlewear_idempotency_keys.sql`
  - public/anon/authenticated access revoked; backend service role only
  - raw idempotency keys are never persisted
- Added provider isolation:
  - Meshy: timeout + max concurrency + circuit breaker; GET status retry only
  - Gemini/OpenAI: timeout + max concurrency + circuit breaker; generative POSTs do not blindly retry
  - Stripe: bounded network retries + 10s timeout
- Expanded Vercel WAF log-first staging for:
  - AI
  - media
  - commerce
  - security
  - Asset Forge
  - Middleverse
  - LIVE token creation
  - legacy protected origin routes
- Added `tryamm-industry-resilience-contract.mjs`, now part of `npm run security`.
- Production truth:
  - Vercel platform DDoS mitigation is the edge baseline.
  - Custom WAF rules remain log-first drafts until traffic is reviewed and a human publishes them.
  - Origin Shield enforcement requires shared secret configuration + enforcement toggle.
  - MiddleWear idempotency table is committed but must be applied through the normal database migration path before production high-impact handoffs depend on it.
  - No claim that TRYAMM is unhackable.

## Industry-tough MiddleWear resilience across Middleverse / Multiverse / Metaverse
- Added backend bulkheads, circuit breakers, request deadlines, overload shedding and graceful degradation.
- Added /api/livez and /api/readyz plus graceful SIGTERM/SIGINT shutdown and HTTP server timeout limits.
- Added distributed, backend-only idempotency locks for high-impact Middleverse handoff creation; raw idempotency keys are never persisted.
- Added provider-resilience wrapper with per-provider concurrency, timeouts, bounded safe retries and circuit breakers.
- Meshy / Asset Forge now uses provider isolation.
- Stubbs AI Gemini/OpenAI providers now use provider isolation; unsafe POST generation calls are not automatically retried.
- Stripe networking now has bounded timeout/retry settings.
- Added TRYAMM World Resilience Fabric covering Middleverse AI, Multiverse, Metaverse, StreetVerse, Holoverse and GameVerse.
- Middleverse AI Hub shows READY/DEGRADED resilient-routing state.
- GameVerse/Living Worlds surfaces isolated-world failure semantics.
- Metaverse Business Builder surfaces MiddleWear-protected/idempotent/provider-isolated semantics.
- Morning Mega Convergence now requires the world resilience contract.

## TRYAMM Pocket Edge Node — phone-size edge compute continuum
- Added truthful "phone-size data center" vision as TRYAMM Pocket Edge Node; phones are edge compute/cache/sync nodes, not hyperscale data centers.
- Node continuum: pocket → tablet → workstation → AI cafe → business server → cloud.
- Phone runtime detects CPU concurrency, optional device memory, WebGPU, WebCodecs, storage estimate, network state and optional battery state.
- Low-battery uncharged devices pause edge leasing below 25%.
- Edge work is opt-in by default; no hidden background mining.
- Browser Pocket Edge only accepts an allowlist of safe work classes.
- Same-origin cache prefetch is built in; other approved work types require explicit app handlers.
- Unknown work classes are rejected.
- Pocket Edge v1 leases same-owner jobs only and does not claim hardware attestation.
- Raw secrets, auth tokens, private keys, raw biometric/health data and unrestricted customer data are forbidden from Pocket Edge job metadata.
- Added backend Edge Node coordinator: register, heartbeat, enqueue, lease and complete.
- Installation identifiers are random locally; only HMAC hashes are persisted.
- Added live Supabase backend-only tables: tryamm_edge_nodes and tryamm_edge_jobs.
- RLS enabled; anon/authenticated SELECT denied; service role verified.
- Added 24-hour job expiry, expired lease recovery, expired data disposal and stale-node offline marking.
- Added Swarm Shield edge-compute budget and dedicated MiddleWear resilience bulkhead.
- Added log-first Vercel WAF observation for /api/edge-node.
- Middleverse AI now exposes Pocket Edge ON/OFF and capability status.
- Morning Mega Convergence now requires the Pocket Edge contract.
