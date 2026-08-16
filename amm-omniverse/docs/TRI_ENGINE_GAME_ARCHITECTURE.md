# TryAMM Tri-Engine Game Architecture

Status: ACTIVE

## Goal
Build TryAMM games once at the gameplay/data/service level, then render and ship them through three engine targets without forking business logic or player progression.

## Engine roles
- Unreal Engine: high-end PC/console/cinematic builds, advanced character rendering, large Living Worlds, broadcast-quality sports presentation.
- Unity: mobile, tablet, Web/desktop where appropriate, AR/VR/MR, rapid iteration, controller/casting companion experiences.
- Godot: open-source/lightweight desktop/mobile/web prototypes, community/mod tooling, low-spec builds and validation target.

## Canonical shared layer
The canonical source of truth stays engine-neutral:
- sport/game rules
- league definitions
- athlete/player stats
- inventory/loadouts
- quests/career/franchise progression
- matchmaking/session IDs
- economy/entitlements (server authoritative)
- save/profile state
- asset IDs and licenses
- analytics/event schemas
- accessibility settings
- localization keys

The existing TypeScript gameplay core is the reference implementation for rules. Engine ports must match the same fixtures and acceptance tests.

## Shared asset pipeline
Source vault -> normalized exports:
- GLB/glTF: web, Godot, Three.js/Holo; optional Unity/Unreal import where suitable
- FBX: Unreal/Unity/Godot humanoids and animation exchange
- USD/USDZ: spatial/AR workflows
- KTX2/WebP/PNG: textures/UI
- WAV/OGG: audio

All engines reference stable asset IDs instead of hard-coded local filenames.

## Unreal target
Recommended project layout:
- Games/Unreal/TryAMMSports/
- C++ or Blueprint adapter reads canonical JSON/game-state messages
- Enhanced Input for controller/keyboard
- Gameplay Ability System for extensible abilities where useful
- Animation Blueprints retarget recovered athlete rig
- Chaos for physics
- replicated multiplayer adapter connects to TryAMM backend/session service

## Unity target
Recommended project layout:
- Games/Unity/TryAMMSports/
- C# adapter mirrors canonical game state/actions
- Input System for controller/touch/keyboard
- Animator/Animation Rigging retargets recovered athlete rig
- URP baseline for mobile/XR, higher-quality profile optional
- XR Interaction Toolkit for AR/VR/MR lanes
- backend/session adapter uses the same TryAMM APIs

## Godot target
Recommended project layout:
- Games/Godot/TryAMMSports/
- GDScript/C# adapter mirrors canonical game state/actions
- InputMap supports keyboard/controller/touch
- AnimationTree/retarget workflow for recovered athlete rig
- CharacterBody3D/physics nodes for lightweight gameplay prototypes
- OpenXR path for supported XR builds
- backend/session adapter uses the same TryAMM APIs

## First sports vertical slice
Implement the same acceptance scenario in all three engines:
1. Load recovered `athlete.glb` or approved normalized derivative.
2. Spawn two 5-player basketball teams.
3. Support player select/switch.
4. Pass, drive, 2PT, 3PT, dunk, steal and block.
5. Quarter/game clock and 24-second shot clock.
6. Scoreboard and possession.
7. Recovered bounce/swish/rim/whistle/crowd audio.
8. Broadcast camera plus accessibility camera preset.
9. Keyboard/controller; Unity/Godot also touch profile.
10. Serialize canonical match state for backend/multiplayer/replay.

Then reuse the shared athlete/animation/session stack for Court Queens, Mixed League, Boxing, MMA, Football, Baseball, Soccer, Hockey and Track.

## Non-negotiable anti-fork rule
Do not independently invent rules inside Unreal, Unity or Godot. Any rule change is made in the canonical game specification/test fixtures first and then implemented consistently in each engine adapter.

## Production rule
A game is not marked multi-engine complete because project folders exist. Completion requires the same acceptance fixture to run successfully in each selected engine, with asset import, input, gameplay state, audio, persistence and multiplayer/service integration verified.
