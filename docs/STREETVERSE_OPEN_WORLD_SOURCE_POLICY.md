# TRYAMM StreetVerse Open-World / City-Simulation Source Policy

## Production code in this branch
TRYAMM uses its own TypeScript/Three.js/Rapier runtime for StreetVerse. The living-city simulation and Holo city bridge in this branch are TRYAMM-native implementations.

## Permissive assets integrated
- Kenney asset packs mirrored as pinned GLB files through `Hidencod/tge-assets`.
- Catalog reports those selected packs as CC0-1.0.
- TRYAMM pins the mirror commit and records source/license metadata in the generated manifest.
- These assets are used for generic vehicles, buildings, roads, props, nature and interiors.

## Architecture/reference repositories
### OllieDaWrench/city-builder
- License: MIT.
- Used as an architecture reference for keeping simulation state separate from rendering and for city-system categories such as roads, zoning, utilities, services, traffic, land value and budgets.
- TRYAMM does not vendor the repository wholesale; StreetVerse uses its own state model, event fabric and world runtime.

### OpenSA / GTA-compatible open-world projects
- Architecture/reference only.
- Do not copy Rockstar/Take-Two maps, models, textures, audio, scripts or other proprietary game data into TRYAMM.
- Do not import AGPL code into TRYAMM production unless a deliberate licensing review approves the obligations.

## Holographic / XR
- TRYAMM already has its own WebXR gateway and Quantum Holo Lens runtime.
- The StreetVerse Holo City Bridge publishes the same living-city state to TRYAMM XR/Holo/OmniFabric events.
- Hardware-specific holographic adapters may be added separately after device testing and license review.

## Design rule
Use:
1. CC0/permissive generic assets for world population and scenery.
2. TRYAMM-native gameplay/simulation code for product logic.
3. Meshy credits for unique named characters and signature assets.
4. External open-source engines as references or isolated adapters only when license-compatible.


## RP / RPG / future-world references
### YarnSpinnerTool/YarnSpinner
- Core license: MIT.
- Suitable as a dialogue-authoring/branching-conversation reference.
- TRYAMM currently keeps its own event-driven dialogue, relationship, mission and RPG state so it can share consequences with StreetVerse, CrossVerse and city simulation.

### jeffbeene/synthcity
- Repository license: MIT.
- Useful as a procedural cyber-city rendering reference.
- Do not automatically import the repository's third-party visual/audio assets; individual credited assets can have separate terms.
- TRYAMM uses its own Neon Future layer and its own CC0 asset catalog.

### jhonatan98rios/Procedural-cyberpunk-city
- Public repository currently does not expose a clear open-source license in the project root.
- Reference-only unless a compatible license is added and verified.

### over2take/CITY_NET
- License: AGPL-3.0.
- Architecture/reference only unless a deliberate copyleft licensing review approves direct code use.

## Historical-web / Time Machine references
### Webrecorder replayweb.page / wabac.js / pywb
- Useful technical references for WARC/WACZ replay, archive provenance and browser replay.
- replayweb.page/wabac.js are AGPL-family and pywb is GPL-family in current upstream listings.
- TRYAMM does not vendor that code into production.
- TRYAMM keeps its own historical-internet API and uses Internet Archive/Common Crawl observations with evidence labels.

## Holographic-gallery / XR references
### Looking-Glass/looking-glass-webxr
- Package license: Apache-2.0.
- Candidate optional hardware adapter for actual Looking Glass holographic displays.
- Requires compatible desktop browser/display environment; do not treat unsupported phones as Looking Glass hardware.

### google/model-viewer
- Source is Apache-2.0.
- Useful reference/optional adapter for portable GLB presentation and AR.
- TRYAMM currently renders the Holographic Gallery with its own Three.js GLTF viewport to avoid unnecessary runtime duplication.
