# StreetVerse / TRYAMM GitHub Technology Intake

Purpose: identify external GitHub projects that can strengthen StreetVerse without creating another disconnected stack or bypassing licensing, security, production-readiness, or real-commerce authority boundaries.

## Intake rules

1. Do not copy, fork, vendor, or add a dependency until its license and maintenance state are reviewed.
2. Prefer package-level integration over copying source.
3. Keep real payments, inventory, customs, logistics, settlement, and seller balances server-authoritative.
4. Third-party game/world libraries may affect simulation and presentation only unless separately approved for backend authority.
5. Third-party assets must pass `assetRightsRegistry` and provenance review before replacing procedural fallbacks.
6. Do not import example/demo assets merely because the code repository is permissively licensed; asset licenses are reviewed separately.
7. Every adopted dependency needs a narrow contract test and rollback path.

## Tier 1 — evaluate first

### donmccurdy/glTF-Transform
- Role: optimize Blender GLB exports after the existing StreetVerse Blender gate.
- Value: reproducible mesh/material/texture cleanup, compression, validation, and batch optimization.
- License: MIT.
- Proposed use: OFFLINE ASSET PIPELINE.
- First integration: post-export `player/car/building.glb` optimization with size-before/after QA and no rights mutation.
- Status: CANDIDATE — high priority.

### gkjohnson/three-mesh-bvh
- Role: accelerate raycasting and spatial mesh queries in Three.js.
- Value: faster world picking, line-of-sight, ground checks, collision/query acceleration for larger Chicago scenes.
- License: MIT.
- Proposed use: STREETVERSE CLIENT PERFORMANCE.
- First integration: benchmark against dense building/environment geometry before adoption.
- Status: CANDIDATE — high priority.

### dimforge/rapier.js
- Role: production-grade 2D/3D WASM physics; deterministic builds are available.
- Value: replace selected hand-rolled collision/vehicle-body logic with tested rigid-body/collider behavior where it materially improves gameplay.
- License: Apache-2.0.
- Proposed use: PHYSICS PILOT, not a wholesale rewrite.
- First integration: isolated vehicle/collision sandbox before touching LivingWorld traffic.
- Status: CANDIDATE — high priority.

### isaac-mason/recast-navigation-js
- Role: Recast/Detour navigation meshes for JavaScript.
- Value: NPC walking routes, crowd navigation, avoidance around buildings/roadblocks, responder path planning.
- License: MIT.
- Proposed use: NPC NAVIGATION PILOT.
- First integration: one Chicago block navmesh with 10–20 NPCs; compare against current scripted routes.
- Status: CANDIDATE — high priority.

## Tier 2 — evaluate after local gameplay foundation

### colyseus/colyseus
- Role: authoritative multiplayer rooms and synchronized state.
- Value: structured race/co-op/session state if Supabase broadcast channels become insufficient for higher-frequency gameplay.
- License: MIT.
- Proposed use: MULTIPLAYER LOAD TEST ONLY at first.
- Guardrail: do not replace existing Supabase/session architecture until measured latency/load evidence justifies it.
- Status: CANDIDATE — medium priority.

### maplibre/maplibre-gl-js
- Role: GPU-accelerated vector maps in browser/webviews.
- Value: StreetVerse world map, seller/logistics maps, Chicago-to-world navigation, accessible geographic UI.
- License: BSD-3-Clause.
- Proposed use: MAP/PASSPORT/TWIN-EARTH 2D/2.5D layer.
- Guardrail: map data/provider licensing is separate from the library license.
- Status: CANDIDATE — medium priority.

### CesiumGS/cesium
- Role: 3D globe/geospatial visualization.
- Value: future Twin Earth, ports, trade corridors, flights, logistics visualization and planet-scale terrain/tiles.
- License: Apache-2.0.
- Proposed use: SEPARATE HIGH-END GEO CLIENT/SANDBOX first.
- Guardrail: avoid adding Cesium to the core mobile StreetVerse bundle until bundle/performance budgets prove acceptable.
- Status: CANDIDATE — medium priority.

## Tier 3 — reference and QA sources

### KhronosGroup/glTF-Sample-Assets
- Role: known glTF feature fixtures.
- Value: test StreetVerse loader/exporter behavior against representative glTF features.
- License: asset-specific; review each model independently before use.
- Proposed use: CI/QA fixtures only unless an individual asset is separately cleared.
- Status: REFERENCE/TEST CANDIDATE.

### mrdoob/three.js
- Role: upstream Three.js source, examples, release behavior and regression reference.
- Value: StreetVerse already uses Three.js; use upstream examples/issues to keep rendering/WebXR behavior aligned.
- License: MIT.
- Proposed use: UPSTREAM REFERENCE, not a copied fork.
- Status: EXISTING STACK UPSTREAM.

### blender/blender
- Role: official Blender source mirror and implementation reference for the content-creation toolchain.
- Value: authoritative Blender behavior/reference when maintaining `tools/blender` automation.
- License: GPL-3.0 for Blender as a whole.
- Proposed use: TOOLING/REFERENCE ONLY.
- Guardrail: do not copy Blender GPL engine/source code into TRYAMM application code. Exported original StreetVerse assets remain governed by their own provenance/rights evidence.
- Status: TOOLCHAIN UPSTREAM.

## Do not add yet

- A second rendering framework solely for convenience if the current raw Three.js architecture can do the job.
- A second realtime backend before Supabase/LiveKit load evidence shows a measurable need.
- Large city/world repositories with unclear asset provenance.
- GTA clones or fan recreations as production content sources; gameplay ideas may be studied, but copyrighted assets/code require independent license review.
- Repositories that package trademarked vehicles, characters, music, buildings, likenesses, or ripped game assets without clear commercial rights.

## Recommended adoption order

1. glTF-Transform — optimize Blender-to-GLB pipeline.
2. three-mesh-bvh — benchmark large-scene raycast/spatial performance.
3. Rapier.js — isolated vehicle/collision physics pilot.
4. recast-navigation-js — one-block NPC navmesh pilot.
5. MapLibre — accessible Chicago/world map layer.
6. Colyseus — only if multiplayer load evidence requires a dedicated gameplay state server.
7. Cesium — future planet-scale Twin Earth/geospatial client after mobile/performance budgets are protected.

## Definition of adopted

A repository is not considered adopted until:
- license is documented,
- exact package/version is pinned,
- security/readiness checks pass,
- a narrow integration contract test exists,
- performance impact is measured,
- rollback is documented,
- and any assets have independent provenance/rights clearance.
