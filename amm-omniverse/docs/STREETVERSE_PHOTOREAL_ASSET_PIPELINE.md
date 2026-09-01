# StreetVerse Photoreal Asset Pipeline

## Goal
Build a repeatable production pipeline that can raise StreetVerse from procedural placeholders to film/game-quality assets without destroying mobile performance, licensing traceability, or iteration speed.

## Core rule
REFERENCE -> RIGHTS -> HIGH POLY -> RETOPO -> UV -> PBR -> BAKE -> RIG -> FACE -> ANIMATION -> COLLISION/NAV -> LOD/HLOD -> COMPRESS -> LIGHT QA -> DEVICE BUDGET -> VISUAL QA -> SPAWN -> REGISTER.

An asset is not production-ready just because it looks good in one screenshot. It must pass visual quality, runtime performance, rights/provenance, interaction, and device gates.

## Quality tiers

### HERO
Use for player characters, major story characters, signature vehicles, showcase interiors, and cinematic closeups.
- Up to 120k triangles before LOD reduction.
- Up to 4K source/runtime textures where device tier permits.
- Full PBR material set.
- Rig + animation; facial blendshapes for hero humans.
- Four LOD levels.
- 60 FPS target on desktop/console-class profiles.

### PREMIUM
Use for recurring NPCs, premium vehicles, storefronts, major buildings and props.
- Up to 65k triangles.
- 2K textures.
- Four LOD levels.
- PBR, collision, provenance required.

### CROWD
Use for pedestrians, background traffic, common props and animals.
- Up to 22k triangles.
- 1K textures.
- Three LOD levels.
- Animation retarget ready.

### MOBILE
Use as a fallback profile for older phones and dense scenes.
- Up to 12k triangles.
- 1K compressed textures.
- Three LOD levels.
- Minimal materials/draw calls.
- 45 FPS minimum target for the current mobile slice.

## Character pipeline
1. Reference sheet and style target.
2. Source-rights and likeness consent gate.
3. High-poly sculpt/source model.
4. Retopology for deformation.
5. UV unwrap and texel-density validation.
6. PBR maps: base color, normal, roughness, metallic, AO.
7. Skin/hair/eye material response validation.
8. Skeleton, skin weights and retarget mapping.
9. Hero facial blendshapes and lip-sync targets.
10. Locomotion set: idle, walk, run, turn, interact, enter/exit vehicle.
11. LOD0-LOD3 plus mobile fallback.
12. GLB/glTF export and KTX2/WebP texture compression.
13. StreetVerse spawn, animation and phone smoke test.

## Vehicle pipeline
1. Accurate proportions and clean body topology.
2. Separate wheel/steering/door components where interaction needs them.
3. PBR paint, glass, rubber, metal and light materials.
4. Correct forward axis and pivot/origin contract.
5. Collision proxy.
6. Headlight/taillight emissive and runtime light hooks.
7. LOD0-LOD3 and mobile traffic proxy.
8. Enter/exit and driving validation.

## Building + interior pipeline
1. Modular facade/interior kits.
2. Trim sheets and atlas materials to cut draw calls.
3. Window emissive masks and day/night variants.
4. Collision + navigation volumes.
5. HLOD for district streaming.
6. Interior activation only when player is near/inside.

## Animation quality
- Root-motion and in-place variants where needed.
- Animation retarget profile shared across residents.
- Motion matching can be added later, but the first production target is a clean locomotion blend tree with believable starts/stops/turns.
- Facial animation is reserved for hero/conversation distance; crowd NPCs use cheaper head-look and gesture layers.

## Lighting + rendering
- ACES tone mapping.
- Image-based/environment lighting when approved HDRI assets are available.
- Physically plausible material response.
- Reflection probes/environment maps for premium zones.
- Baked/static lighting where possible; dynamic lights reserved for gameplay-critical sources.
- Night emissive signage and windows must be balanced against bloom/exposure rather than simply made brighter.

## Mobile performance gate
Every production asset must have a phone-safe path. The current web slice prioritizes:
- compressed textures,
- limited transparent materials,
- capped draw calls,
- distance-based LOD,
- HLOD/instancing for repeated environment pieces,
- reduced shadow casters,
- lazy loading/streaming,
- procedural fallback if a premium model fails to load.

## Rights + provenance gate
Every imported or generated production asset must record source/provider, license/ownership status, author/creator attribution when required, likeness consent when applicable, and allowed commercial-use scope. Unknown-rights assets stay quarantined and never become the production default.

## Release gate
A photoreal asset is GREEN only when:
- provenance is valid,
- files load with no missing textures,
- scale/pivots/forward axis are correct,
- collision/navigation requirements pass,
- LODs exist,
- animation/rig requirements pass,
- visual QA passes under StreetVerse lighting,
- target device budget passes,
- production spawn validation passes.

## StreetVerse first-wave priority
1. Player hero body.
2. Three premium resident archetypes + crowd variants.
3. AI Spirit hero shell + optimized variants.
4. Sedan, SUV, supercar and motorcycle.
5. Chicago street kit: asphalt, curbs, lane paint, traffic signals, lamps, hydrants, signs.
6. Signature storefront/building kit.
7. Trees/foliage with wind + LOD.
8. Dogs/birds/deer with low-cost animation sets.

This pipeline improves StreetVerse by replacing one-off asset work with a controlled quality ladder: hero quality where the player notices it, aggressive optimization where density matters, and automatic fallback where a device cannot sustain the premium tier.