# StreetVerse production assets

Drop optimized production assets here without changing game logic. Preferred format: GLB for 3D models, WebP/AVIF for textures, and compressed web audio for ambience/SFX.

Folders used by the runtime registry:
- characters/
- npcs/
- vehicles/
- buildings/
- interiors/
- animals/
- props/
- environment/
- audio/

Every model must have a stable registry id, sensible origin/pivot, web-safe texture sizes, and mobile performance budget. Missing files must fall back to procedural primitives instead of crashing StreetVerse.
