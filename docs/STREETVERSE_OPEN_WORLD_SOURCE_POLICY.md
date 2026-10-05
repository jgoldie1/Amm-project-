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
