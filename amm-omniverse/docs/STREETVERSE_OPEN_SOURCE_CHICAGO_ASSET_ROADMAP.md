# StreetVerse legal open-source engine and Chicago visual upgrade map — Oct 20, 2026

## Reality check
The production browser game already uses React and Three.js, plus locally authored StreetVerse Chicago worlds and GLB loaders. This PR fixes a cinematic mission interaction and Holo Drama story planning, but **does not import or claim to install any third-party models or licensed game code**. Rendering realism and BJ rig quality still need separate device evidence.

## Approved for evaluation (NOT downloaded or shipped by this PR)

- **Kenney City Kit (Roads), CC0** — modular roads, barriers, streetlights and traffic props. Source: https://kenney-assets.itch.io/city-kit-roads . Import selected glTF/GLB only with the included per-pack license; no bundling unrelated assets. Good for mobile and replacing roads/curbs quickly.
- **Kenney City Kit (Suburban), CC0** — fences, trees, driveways and modular buildings. Source: https://kenney.nl/assets/city-kit-suburban . Quality target is low-poly placeholder upgrade; does not itself provide photo-realistic Chicago.
- **Poly Haven, CC0** — PBR brick, concrete, asphalt, store window and weathered wall textures, HDRIs for world lighting. License: https://polyhaven.com/license . Retain per-asset inventory and sizes, prefer resized/mobile compressed texture maps.
- **Quaternius, current QAL 1.0 notice dated August 28 2026** — free commercial game incorporation is allowed by license but stand-alone redistribution/asset template resale restricted. Read each asset's current terms before bundling, as catalogs quoting universal CC0 may be stale. https://github.com/Quaternius/quaternius.github.io/blob/main/license.html
- **Godot, MIT** — possible parallel authoring/game-engine toolchain for rigged cutscenes and crowd behavior; does not drop into an existing Three.js game automatically. https://godotengine.org/license/
- **MicropolisCore, GPL-3** — informative reference for population/business/city systems; no code copied or linked into TRYAMM pending deliberate license compliance and architecture review. https://github.com/SimHacker/MicropolisCore
- **OpenStreetMap ODbL** — useful reference for street network geometry, labels and layout; public derived map use requires attribution and potentially share-alike DB obligations. https://osmfoundation.org/wiki/Licence/Attribution_Guidelines

## First neighborhood visual release
1. Establish actual Circle Park / Taylor Street reference with lawful imagery and permissions; make road alignment / guarded entrance recognizable, no inaccurate claims of an official photoreal digital twin.
2. Replace crude primitives using authorized PBR brick, sidewalks, crossings and Chicago facade meshes. Mobile WebGL load budget and licensing manifest first.
3. Validate BJ model is a real articulated, textured avatar with correct animation retargeting, scale and face reference permission on a physical iPhone.
4. Add pedestrian and vehicle signal state, object pooling, distant LOD and instancing. Avoid GLB storage 402 loops with deduplicated requests and backoff.
5. Upgrade the cinematic script cards in this PR to actual three-dimensional camera motion, timed blocking, dialogue audio/captions and mission triggers only after game state, animations and provenance are reliable.
6. Build city-builder gameplay as an original, server-verified economy: store upgrades, district services, traffic, reputation, supply chains and neighborhood objectives. Do not mix hypothetical simulated earnings with real payouts.

## Film and media licensing
Rely on original StreetVerse character art/film footage or assets licensed for incorporation in films. Get actor likeness, voice, music, brand and location permissions; include captions/credits. Plans are downloadable locally from Omni Box; rendering or selling content requires a licensed media pipeline, cloud quota and working payment verification.

**No Rockstar GTA/SimCity assets, source repository clones, scraped textures or unauthorized game copies are included in this branch.**