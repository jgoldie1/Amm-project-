# StreetVerse Meshy character drop folder

Place production-ready Meshy GLB exports in this folder.

## BJ Stubbs V6 hero

Required filename:

`SV_HERO_BJ_STUBBS_V6.glb`

When this file exists in production, StreetVerse will automatically prefer it over the temporary procedural/photo-shell BJ while preserving the same BJ identity, gameplay position, missions, vehicle flow, and fallback behavior.

Recommended export:
- GLB
- humanoid rig / T-pose source
- PBR textures
- mobile/web optimized topology
- embedded idle/walk/run clips when available
- facial morph targets when available (jaw open / mouth open / blink left / blink right)
- textures at 2K for the birthday/mobile build unless visual testing proves 4K is safe

The current procedural/photo-matched BJ remains the safe fallback if this file is absent or fails to load.

## NPC naming

Other reserved files are defined in `src/data/streetVerseMeshyCharacterSlots.ts`, including:
- `SV_NPC_BLACK_MAN_YOUNGADULT_01.glb`
- `SV_NPC_BLACK_WOMAN_ADULT_01.glb`
- `SV_NPC_WHITE_WOMAN_YOUNGADULT_01.glb`
- `SV_NPC_LATINO_MAN_ADULT_01.glb`
- `SV_NPC_CHILD_01.glb`
- `SV_NPC_TEEN_01.glb`

Child and teen assets remain blocked from adult/After Dark lanes.
