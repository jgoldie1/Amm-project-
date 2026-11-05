# StreetVerse BJ, Family, Friends and Injury — Release Gate

Development inventory. Not certification of a finished playable 3D game.

## Recovered existing architecture
- BJ rig, 3D GLB loader, skeletal animation mixer, face morphs and gestures: src/runtime/StreetVerseMeshyBJHeroRuntime.ts
- MetaHuman-to-web optimized GLB readiness audit: src/runtime/StreetVerseBJMetaHumanBridge.ts
- Existing BJ viewer: src/components/BJStubbsV7Viewer.tsx
- Character selection and family cast integration: src/runtime/StreetVersePlayableCharactersRuntime.ts
- Family/friends/heirs roster: src/game/characters/meetTheStubbsFamilyFriends.ts
- Authorized likeness and generic stand-in policy: src/data/StreetVerseFamilyCharacterProduction.ts
- Meshy rigging request/asset publication contract: src/runtime/MeshyRigFactory.ts

## New in this branch
- Fictional HP, stamina, mobility, region-specific injury and non-graphic bleeding status: src/runtime/StreetVerseFictionalInjurySystem.ts
- Validated simulated injury, safe-zone first aid and rest events: src/runtime/StreetVerseFictionalInjuryRuntime.ts
- Compact BJ vitals and real loader/clip-count inspector: src/components/StreetVerseBJVitalsHUD.tsx
- Health runtime and HUD mounted in both safe and full StreetVerse worlds
- Character label rendering now avoids injecting dynamic names as HTML
- Smoke regression: tests/streetverse-bj-family-injury-contract.mjs

## Unverified or missing
- No committed BJ GLB binary was found in the scanned repository tree. The app references a hosted V15 preview and external/published V6/V12 assets. Full 3D usability depends on actual loader success.
- Several family likenesses still await authorized assets. A roster or generic stand-in is not a certified character likeness.
- No prior organ injury implementation was found in the examined repository tree. The new mechanic is explicitly a fictional game-state foundation, not an anatomical or medical simulator.
- Injuries still need to be connected to physical collision/combat events, rig animation changes, save/load and in-game recovery.
- No complete physical-device proof yet that BJ moves, drives, exits, speaks, earns a reward and records a Reel in one run.

## Next production acceptance sequence
1. Verify actual BJ GLB renders and its idle/walk/run animations, skinned mesh and face morphs.
2. Verify one authorized family/friend NPC GLB or a visibly marked stand-in and talk interaction.
3. Integrate fictional injury effects with movement and animations in a non-graphic mode.
4. Complete Circle Park -> car -> drive -> Taylor Street -> NPC -> reward -> Reel end-to-end.
5. Pass full CI, mobile Playwright evidence, physical device check and staged rollback.

No real customer payments, production deployment, Meshy credit spending, or assets were replaced in this task.