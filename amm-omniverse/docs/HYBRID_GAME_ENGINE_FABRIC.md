# TRYAMM Hybrid Game Engine Fabric

Status: BUILDING architecture. This document defines interoperability boundaries; it does not claim that Unreal, Unity, Blender, Godot, or GPT-6 Astra are embedded into the production web build today.

## Roles

### GPT-6 Astra — agent/orchestrator layer
Astra is used as a supervised development and QA agent: generate/edit code and scenes, transform assets, run tests, compare renders, validate gameplay flows, and propose fixes. It never receives unsupervised authority over production money, payouts, secrets, or deployment. Human/CI gates remain required.

### Blender — source-of-truth content factory
Blender 5.2 LTS is the primary DCC pipeline for modeling, rigging, animation, procedural Geometry Nodes, materials, collision meshes, LODs, lightmaps, and export. Canonical exchange formats: GLB/glTF for web/Godot, USD where useful for Unreal, FBX only where a downstream tool requires it.

### Godot — fast/open gameplay and XR prototype lane
Godot is the lightweight open-source native lane for rapid gameplay systems, XR prototypes, kiosks, local installations, and lower-overhead native builds. Shared gameplay contracts keep Godot clients compatible with TRYAMM identity, missions, economy, and world-state APIs.

### Unity — broad-device native lane
Unity is the broad-platform lane for mobile/native experiments, AR, standalone clients, and hardware integrations where its device ecosystem is advantageous. It consumes the same asset manifest and server-authoritative gameplay contracts.

### Unreal Engine — cinematic/high-fidelity lane
Unreal is the AAA/cinematic renderer for dense digital twins, film/Holo Drama, large crowds, advanced lighting, high-end PC/console/cloud-render targets, and premium product-placement scenes. It is an optional renderer/client, never the authoritative source for economic state.

### TRYAMM Web/Three.js — universal access lane
The current web client remains the fastest universal entry point. It uses the Adaptive Render Fabric to scale from safe mobile HTML/WebGL to richer WebGL/WebGPU experiences.

## Hybrid engine rule

TRYAMM does not merge four engines into one executable. It creates one authoritative platform with multiple renderer/client adapters.

Authoritative services:
- identity/passport
- world/community-area IDs
- missions and checkpoints
- inventory
- XP/rewards
- purchases and payouts
- business registry
- social/Reel metadata

Portable client contract:
- scene/area manifest
- entity IDs and transforms
- animation/state names
- interactions
- mission triggers
- accessibility metadata
- render-tier hints

This prevents engine lock-in. A player can enter the same StreetVerse state from web, Godot, Unity, or Unreal without duplicating the economy.

## Holographic 3D/4D Generator

"4D" here means time/state-driven 3D experiences, not a claim of four spatial dimensions.

Pipeline:
1. Prompt/reference/CAD/map data enters a supervised generation job.
2. Astra can plan the asset or scene and produce/edit scripts, metadata, tests, and engine-specific adapters.
3. Blender builds or refines canonical meshes, rigs, animation, materials, LODs, collision, and variants.
4. Holo Generator writes a versioned Scene Manifest containing geometry references, transforms, materials, animations, lights, audio zones, NPC/business/mission anchors, timeline/state transitions, accessibility tags, and product-placement slots.
5. Adapters translate the manifest into Three.js, Godot, Unity, and Unreal scenes.
6. Each engine runs visual/gameplay contract tests.
7. Approved artifacts enter the asset registry/CDN; failed builds stay quarantined.

Time/state layers can express day/night, weather, seasons, construction changes, historical/future variants, mission consequences, live-event dressing, product-placement swaps, and replayable story timelines.

## Product placement/holographic commerce

Placement slots are semantic anchors rather than baked advertisements. A slot records surface/volume bounds, category restrictions, age-region rules, visibility metrics, campaign ID, start/end time, and fallback creative. The server selects authorized creative; the renderer only displays the result. This supports web billboards, virtual storefront items, vehicle/interior placements, Holo Drama props, and future AR/holographic displays while keeping campaign logic outside the 3D engine.

## Safety and release gates

- Astra actions are approval/CI gated.
- Generated executable code is scanned and tested before merge.
- Assets require provenance/licensing metadata.
- Engine adapters may render gameplay but may not mint rewards or approve payments.
- Raw private telemetry is minimized and short-lived.
- Frame generation remains disabled until motion/depth inputs, latency budgets, and artifact tests are validated.
- Production web certification remains independent from experimental native-engine work.
