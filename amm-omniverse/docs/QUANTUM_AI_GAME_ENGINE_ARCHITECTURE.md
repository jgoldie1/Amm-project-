# Quantum AI / Game Engine Architecture

Status: recovery + production integration baseline
Branch: agent/website-recovery

## Purpose

Preserve the previously designed TryAMM / AMM Omniverse architecture for game creation, world cloning/digital twins, holographic rendering and AI orchestration without confusing brand names or future research with verified engineering capabilities.

## Recovered architecture

### Quantum Speed Engine
Brand name for the performance/orchestration layer that coordinates:
- asset streaming and prefetch
- level-of-detail management
- network prediction/interpolation
- deterministic event clocks
- async job scheduling
- cache and memory budgets
- world partition / chunk loading
- multiplayer state replication
- AI/NPC update budgets
- device capability adaptation

It does not imply quantum-computing acceleration unless real quantum hardware is later integrated and independently benchmarked.

### Quantum 3D/4D Holographic Generator
Brand name for the content pipeline that can generate or transform:
- 3D assets (GLB/GLTF/USD/FBX where supported)
- depth maps and multi-view assets
- holographic/Lottie UI layers
- AR/VR/MR scenes
- time-varying 3D scenes ("4D" = 3D + animation/time in the production software context)
- spatial audio/haptic cue timelines
- digital-twin visualizations

This is distinct from free-space volumetric holography. Physical display claims must match the actual display hardware.

### Hybrid game-engine bridge
Use each engine for its strongest role instead of attempting to merge proprietary engines into one binary:
- Web/React/Three.js: portal, lightweight worlds, dashboards, browser games
- Godot: lightweight/open mini-games and experiments
- Unity: mobile AR/VR, device integrations and selected multiplayer experiences
- Unreal Engine: high-fidelity flagship worlds, cinematic open-world and premium XR

Shared contracts:
- Omni ID / player identity
- world/instance IDs
- inventory and progression schema
- match/session protocol
- asset manifest
- telemetry
- commerce/entitlements
- accessibility profile
- translation/captions
- HoloBridge scene/event protocol

### Twin Earth / World Twin
Digital-twin/world-cloning layer using licensed mapping/geospatial providers and user-owned/cleared data. Functions:
- geospatial anchors
- portals between digital-twin locations and fictional worlds
- terrain/building streaming where provider licenses permit
- room/property scans through SpaceOS
- NPC/world simulation overlays
- persistent user-created locations

No scraping or unauthorized caching of third-party map/photogrammetry tiles.

## AI hierarchy

### HoloGPT
User-facing AI router/orchestrator. It chooses specialized services/providers, maintains context and routes requests across TryAMM verticals.

### Stubbs AI
Ecosystem intelligence layer for creator, business, game/world, accessibility and operations workflows.

### Lyons Tech AI
Underlying technology/research brand for orchestration, models, tools, device intelligence and future research.

### AGI hierarchy (engineering interpretation)
These labels are product/research tiers, not claims of verified human-level AGI:

1. Assistant AI — single-task tools and copilots.
2. Agentic AI — multi-step tool-using agents with permissions and audit logs.
3. Hierarchical AI — supervisor/router coordinating domain agents.
4. Symbiotic AI — persistent user-specific collaboration, shared workspace and human approval loops.
5. Multimodal / "five-sense" AI — software ingestion of available camera/vision, microphones/audio, touch/haptic/device sensors, spatial/location data and environmental sensors. Taste/smell require actual external sensors; the software must not claim biological senses it does not possess.
6. Self-model / "self-awareness" research — introspection metadata such as current goals, tool state, confidence, memory provenance and error monitoring. This is not evidence of consciousness or sentience.
7. AGI research tier — future experimental work; never marketed as achieved without objective evidence and independent evaluation.

## Googleplex Memory / Omni Memory
Treat "Googleplex Memory" as the original brand name for a scalable memory fabric, implemented with conventional verified systems:
- Supabase/PostgreSQL for durable structured state
- object storage for media/evidence/assets
- vector/semantic retrieval for long-term knowledge
- short-term session memory
- user/project/organization memory scopes
- provenance and versioning
- retention/deletion controls
- permissions/RLS
- audit trails
- cache tiers for high-speed game/world state

Do not describe storage capacity as mathematically googolplex-sized. The name is branding, not a literal storage claim.

## Middleverse / Metaverse / Multiverse / Holoverse

- Living Worlds: persistent playable world network.
- Metaverse: social/economic spatial layer shared by users.
- Middleverse: portal/orchestration layer connecting apps, digital twins, games and worlds.
- Multiverse: multiple fictional/alternate world families and timelines.
- Holoverse: AR/VR/MR/holographic presentation layer across all of the above.

All share Omni ID, OmniCash/ledger, accessibility, multiplayer, creator identity, commerce, moderation, analytics and HoloGPT routing.

## What this architecture does

- Lets a single user/avatar move between games and worlds without recreating identity or progression.
- Lets the same world state render on web, mobile, TV, XR and holographic-capable devices.
- Lets AI help create quests, NPC behavior, assets and world layouts while keeping human controls and auditability.
- Lets Twin Earth connect real geospatial places to fictional Living Worlds.
- Lets assets created once be reused in ads, games, HoloTV/OmniBox, AI Cafe and creator experiences.
- Reduces duplicate backend work because all engines consume shared identity, persistence, multiplayer and commerce services.
- Keeps performance-sensitive game simulation separate from durable Supabase records.
- Provides a path from current browser/mobile products to future Unreal/Unity premium experiences without replacing the whole backend.

## Production boundary

The following must be treated as research/future until demonstrated:
- true quantum-computing speedups
- free-space volumetric holographic generation
- conscious/self-aware AI
- human-equivalent AGI
- literal biological five-sense perception without the corresponding sensors
- unlimited or googolplex-scale memory

Current builds should expose these as brand/research roadmaps while shipping verified conventional implementations underneath.
