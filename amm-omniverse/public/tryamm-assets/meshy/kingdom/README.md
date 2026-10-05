# Kingdom of Yahisrael production architecture slots

The playable Kingdom always keeps a lightweight walkable fallback shell so mobile/iPhone gameplay does not disappear when an external model is missing.

When a production GLB exists at this folder, `07-yahisrael-living-world.js` loads it at the same district anchor while preserving:
- destination ID / map waypoint
- walkable district coordinates
- mission/activity hotspot
- Kingdom citizens and role metadata
- portal route
- server-authoritative mission/reward bridge
- mobile fallback geometry

Expected production filenames:
- `KY_ASSEMBLY_PRAYER_COURT.glb`
- `KY_SERVANTS_SERVICE_CENTER.glb`
- `KY_FAMILY_LEGACY_HALL.glb`
- `KY_METAVERSE_BIBLE_HEBREW_SCHOOL.glb`
- `KY_KINGDOMS_PRESS_AI_CAFE.glb`
- `KY_ALL_AMERICAN_NETWORK_BROADCAST.glb`

Production model requirements:
- glTF/GLB, optimized for mobile web
- real-world scale in meters
- origin at ground level near the primary entrance
- no copied GTA/Rockstar/third-party protected architecture
- original or properly licensed materials/textures
- separate collision proxy preferred
- LOD / texture compression preferred
- interiors must preserve a clear front entrance and the mission hotspot area
- accessibility paths should remain traversable
- no baked-in personally identifying likenesses without authorization

The procedural Kingdom geometry is a fallback and layout contract, not a claim that these production GLBs already exist.
