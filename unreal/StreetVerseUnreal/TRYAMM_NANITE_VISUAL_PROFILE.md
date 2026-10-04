# TRYAMM Unreal Visual Profile

Use Unreal Engine 5.8 for the highest-fidelity StreetVerse client.

## Recommended visual stack

- Nanite for dense buildings, scanned assets, props, roads, architecture, and high-instance geometry
- Lumen for dynamic global illumination and reflections where supported
- Virtual Shadow Maps for high-detail dynamic shadows
- Temporal Super Resolution for performance scaling
- PCG for district/world population and procedural placement
- World Partition for large-world streaming
- HLOD/fallback content for unsupported or lower-end platforms

## Nanite policy

Prefer Nanite for:
- architecture
- scanned/photogrammetry buildings
- dense props
- rock/concrete/statues
- repeated high-poly environment assets

Profile carefully for:
- foliage
- skeletal/deforming content
- transparent/material-heavy assets
- XR
- unsupported rendering paths

The web/mobile client must keep conventional optimized GLB/LOD fallbacks. Nanite is an Unreal-side feature, not a browser feature.
