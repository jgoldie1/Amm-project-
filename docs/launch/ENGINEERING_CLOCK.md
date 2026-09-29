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
