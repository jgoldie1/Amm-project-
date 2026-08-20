# TRYAMM Location AR Game Platform

Status: LOCKED PRODUCT SPECIFICATION

## Provider strategy
Use a provider-agnostic spatial layer. Niantic Spatial/Scaniverse NSDK can be one adapter for VPS/localization/AR effects, but TRYAMM gameplay state, identity, matchmaking, progression, cloud saves, tournaments, accessibility, LIVE and Money Engine remain owned by TRYAMM.

Current external note: legacy Lightship.dev is deprecated/decommissioned; new development should target Niantic Spatial NSDK 4.x + Scaniverse when using Niantic Spatial.

## Core architecture
PLAYER IDENTITY → ACCESSIBILITY PASSPORT → JARVIS GAME GUIDE → MATCHMAKING → SESSION SERVER → LOCATION/SPATIAL ADAPTER → GAMEPLAY → CLOUD SAVE → PROGRESSION → LEADERBOARD → TOURNAMENT → LIVE/REPLAY → EVENT ALLOCATION LEDGER.

## Matchmaking
Inputs can include:
- game/mode
- region/latency bucket
- party/crew
- skill/rank band
- accessibility-compatible settings where user selected
- age/safety lane
- device/capability
- location-based eligibility when relevant

Do not use disability status as a negative ranking factor.

## Progression
Track XP, levels, missions, achievements, unlocks, cosmetics, story progress and verified event participation. Separate gameplay progression from spend so users cannot simply buy rank.

## Cloud saves
Server-authoritative player state with versioned save schema, conflict handling, anti-tamper checks, backup snapshots and cross-device restore.

## Tournaments
States: DRAFT → REGISTRATION → CHECK-IN → LIVE → RESULTS_PENDING → VERIFIED → COMPLETE/CANCELLED.

Requirements:
- official rules
- geography/age restrictions
- anti-cheat
- dispute/appeal path
- server-authoritative results
- audit trail
- prize/charity allocations disclosed before entry where applicable

## Leaderboards
Per game/mode/season/region/friends/crew. Use verified authoritative results. Support opt-out/private display where appropriate.

## LIVE integration
Gameplay → LIVE broadcast → moderated chat → replay → clips/Reels → creator world → sponsor/event page. Stream state must not determine gameplay authority.

## Accessibility Passport
Game accessibility metadata + user preferences drive options such as remappable controls, one-handed presets, captions, reduced motion/flashing, visual/audio cue alternatives, menu narration and switch/keyboard/controller support where technically supported.

## JARVIS game guide
JARVIS can explain missions, accessibility settings, team roles, strategy, progress and event schedules. It cannot provide hidden opponent data, bypass anti-cheat or autonomously spend money/prize balances.

## Money Engine — separated event allocations
Every event/tournament maintains separate buckets:
- platform/event revenue
- creator/host earnings
- prize pool obligation
- charity/community allocation
- sponsor-restricted funds
- refunds/reserves
- taxes/withholding where applicable
- provider/processing fees

No bucket is treated as available TRYAMM revenue until the underlying obligation is satisfied.

### Example
$100,000 event gross receipts are NOT automatically $100,000 TRYAMM revenue. Money Engine records the contractual/economic obligations first, then calculates eligible platform revenue.

## Location-based AR
TRYAMM spatial adapter interface:
- localization
- anchors/sites
- mesh/depth/occlusion where available
- geofenced mission eligibility
- scan/site assets
- provider health/status

Provider-specific SDK code stays behind adapters so a vendor change does not require rewriting matchmaking, progression or money systems.

## Safety
- no gameplay objective should direct users into roads, restricted/private property or unsafe locations
- geofence exclusions
- day/night and age-appropriate controls
- location privacy minimization
- emergency/guardian settings for minors where applicable
- report unsafe POI/location

## Viral loop
PLAY → ACHIEVE → LIVE/CLIP → SHARE → INVITE CREW → MATCH → TOURNAMENT → COMMUNITY SPOTLIGHT → NEXT SEASON.

Quantum Discord communities and Quantum Zapier automations can distribute approved event announcements, clips, crew invites, reminders and results without spamming users.

## Completion path
1. authoritative player state + cloud saves
2. matchmaking service
3. progression/season model
4. leaderboard service
5. tournament service + rules engine
6. Money Engine event-allocation ledger
7. LIVE/replay hooks
8. Accessibility Passport integration
9. provider-agnostic spatial interface
10. Niantic Spatial/other provider adapter
11. anti-cheat + red-team tests
12. production deployment and monitoring
