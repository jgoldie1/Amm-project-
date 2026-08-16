# TryAMM Production Stack + GameVerse Next-Level Architecture

Status: ACTIVE

## Replit
Replit is OPTIONAL and not required for production. Do not make any runtime, build, deployment, asset, database, multiplayer, payment, or source-control path depend on Replit.

Canonical production workflow:
- GitHub: source of truth, branches, PRs, CI
- VS Code / local engine editors: development
- Vercel: web frontend deployment
- Supabase Pro: Auth, Postgres, RLS, Storage, realtime/runtime data
- Google Drive Asset Vault: large source assets, manifests, licenses, masters
- Unreal Engine: high-end PC/console/cinematic builds
- Unity: mobile, XR and broad cross-platform builds
- Godot: open-source/lightweight/web/desktop/mobile validation builds
- Web/Holo: Three.js/WebGPU/WebXR presentation and companion experiences

## One universe, not separate games
All games share canonical services and IDs rather than duplicating infrastructure.

Shared services:
- TryAMM Identity / profile / avatar
- universal player-state schema
- GameVerse title/mode registry
- achievements, XP, reputation and careers
- social/friends/crews/teams/leagues
- matchmaking/session service
- server-authoritative competitive state
- cloud saves and cross-device continuation
- inventory/loadouts/garage/stable/deck
- replay/highlight system
- accessibility profile and one-hand controls
- localization/HoloLingo
- parental/age/moderation boundaries
- OmniCash/Holo Credits entitlements (no pay-to-win competitive stats)
- Asset Vault registry and license provenance
- analytics/crash/anti-cheat/abuse telemetry

## Shared engine contract
The engine clients must consume the same canonical DTOs for:
- PlayerProfile
- AvatarDefinition
- AthleteDefinition
- VehicleDefinition
- HorseDefinition
- CreatureDefinition
- ItemDefinition
- TeamDefinition
- LeagueDefinition
- MatchDefinition
- MatchEvent
- SaveGameSnapshot
- ReplayEvent
- EntitlementDefinition
- AssetDefinition

Rules and balance data should live in versioned data/config where practical, not only inside one engine's scene/blueprint/prefab.

## Current flagship game families
1. Court Kings — men's basketball
2. Court Queens — women's basketball
3. Court Kings Mixed League — mixed basketball
4. Fight Kingdom — men's/women's boxing
5. Combat Arena — men's/women's MMA
6. Gridiron Kingdom — realistic original football
7. Mascot Evolution League — holographic football transformation mode
8. Diamond Kingdom / Diamond Legends — baseball/softball family
9. Global Kings / World Pitch — soccer
10. Ice Kingdom / Ice Storm — hockey
11. Olympic Kingdom / Track & Field World — track/field and Olympic-style events
12. Street Sports Universe
13. Volcano Racers — gadget/electric/VR racing
14. Horse Racing — track, stable, breeding/career/data systems (original)
15. Tactical Realms / Battlefront Zero — original sci-fi tactical shooter
16. Hero Realms — original fantasy RPG
17. Yogihoo Arena — original creature/evolution/card/AR battle game
18. Quantum Tag — AR/VR/MR laser/tag arena
19. HoloDeck / Faith Deck — holographic card/board battle system
20. StreetVerse / Kingdom Press Living World — original open-world living-city game
21. Kingdom Builders — world/city/farm/build/economy simulation
22. Quantum Pinball / arcade family
23. Black Anime / AnimeVerse interactive game adaptations

This registry does not collapse every league variant into a separate commercial product. A title may expose multiple leagues/modes while sharing a core executable.

## Next-level systems to add across GameVerse
### Presentation
- broadcast camera director
- instant replay / slow motion / highlight reels
- dynamic commentary event hooks
- intros, walkouts, halftime/intermission shows
- crowd simulation and adaptive chants
- Quantum Beat music-reactive presentation
- Holo overlays, volumetric scoreboards and spatial replay rooms

### Player feel
- deterministic input mapping
- gamepad, keyboard, touch, adaptive/one-hand presets
- haptics with intensity controls and disable option
- animation state machines and retargeting
- IK for feet/hands/ball/contact points
- camera assists and accessibility assists

### Simulation
- sport-specific ball/puck/vehicle/horse physics
- stamina/fatigue/injury-safe gameplay abstractions
- weather/surface effects
- AI tactics and difficulty profiles
- referee/judge/officiating rules with explainable event logs
- replayable deterministic/seeded match events where practical

### Multiplayer
- authoritative match/session host
- reconnect and resume
- latency compensation appropriate to each genre
- rollback/prediction where appropriate
- spectator/watch-party/replay modes
- anti-cheat validation and impossible-input detection
- skill/ranked and casual queues

### Living Worlds crossover
- one avatar can travel between supported worlds
- garages, stables, apartments and creator spaces persist
- trophies/achievements can display in homes/Holo rooms
- events can open portals to sports, racing, combat, anime and Holo experiences
- no cross-title pay-to-win stat purchases

## Racing: Volcano Racers next level
Keep all original features already recovered:
- original cars/drivers/tracks/garages
- city/wilderness environments
- vehicle physics
- damage LODs
- weather
- VR driving
- replay cameras
- controller rumble

Extend with original systems:
- Quantum Boost
- Jump Jets
- Grip Claws
- Energy Shield
- Repair Drone
- Scan Drone
- Terrain Mode
- Holo Decoy
- EV/solid-state-inspired fictional vehicle variants
- street/circuit/off-road/wilderness/Holo tracks
- cockpit/hood/drone/broadcast cameras
- time trial, sprint, circuit, elimination and battle-racing modes
- ghost racing and asynchronous challenges
- garage tuning that avoids pay-to-win
- Holo/AR/VR spectator rooms

## Mascot Evolution League next level
Original holographic football mode with no NFL team branding/likenesses.

Transformation archetypes may include original bear, panther, eagle, lion, dolphin and other team-mascot forms.
- bear: power/block/tackle-break archetype
- panther: cut/agility/acceleration archetype
- eagle: awareness/jump/interception archetype
- lion: leadership/power/crowd-momentum archetype
- dolphin: reaction/coordination/play-read archetype

Systems:
- transformation meter earned through gameplay
- no real-money transformation advantage
- holographic transformation sequence
- position-safe ability caps
- counters/weaknesses to avoid dominant metas
- spatial stadium effects
- 3D replay and Holo spectator mode

## Asset rule
Use this acquisition order:
1. already-owned/recovered TryAMM assets
2. existing Drive/PC Quaternius and other licensed packs
3. CC0 assets
4. original generation/modeling/retopo/rigging
5. paid assets only after a documented blocker

## Public-release gate
Do not call a game commercially complete solely because rules/UI exist. A public game mode requires:
- real engine scene
- real assets or approved fallbacks
- inputs
- audio
- persistence
- multiplayer if advertised
- accessibility
- crash/performance validation
- license provenance
- privacy/moderation controls
- platform-specific packaging tests
