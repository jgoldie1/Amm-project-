# BJ Stubbs Original Organ + Rig Teardown Lab

Recovered source architecture: `src/runtime/StreetVerseAnatomySimulation.ts` and `src/runtime/StreetVerseCharacterInjuryRuntime.ts` (original fictional organ state + rig hit/downed reactions). Their original CI tests also remain part of the Omniverse smoke suite.

## What this update adds without replacing BJ
- `StreetVerseAnatomyRigInspector.ts` uses the actual loaded `SkinnedMesh.skeleton.bones`, when present, to display up to 96 rig-joint markers.
- Stylized non-graphic brain, heart, lungs, liver and kidneys are detachable LOOKING schematic overlay markers, not modified internal GLB geometry.
- Optional `exploded` mode offsets markers for examination without moving any original bones or corrupting skin weights.
- Organ indicator colors reflect the original fictional organ-integrity percentages.
- The original 3D character injury runtime publishes BJ HUD values so the injury system and organ simulation are visible together.
- The inspector is wired to `StreetVerseMobileWorld` and cleaned up with the world. The existing Meshy/GLB hero and family cast are preserved.

## How to try on a dev or staged game
1. Open the existing StreetVerse preview in a browser with `?injuryLab=1` (append `&injuryLab=1` if the URL already has a query).
2. Enter full 3D mode. Tap `BJ • HEALTH` to expand the compact panel.
3. Under `TEARDOWN LAB`, choose `OVERLAY` for rig/organ visual markers, `EXPLODED` for non-destructive separation or `OFF` to hide.
4. Look for `Real rig joints detected:`. Zero means the active avatar did not expose skinned bones through the loaded GLB; do not certify the mesh.
5. Use `TEST HIT −25 HP`, `TEST DEFEAT`, and `RESPAWN` to inspect fictional state transitions. Blood particles can be set `Off`, `Minimal` or `Standard`.

## Not yet proven
- BJ likeness and actual hosted model load on the user's Chromebook/phone.
- Rigged body part breakaway, internal organs embedded as sculpted production meshes, physics ragdoll, clipping-safe X-ray, surgical anatomy and multiplayer-authoritative damage.
- Complete uninterrupted 3D mission with injury, rescue, animations and legitimate rewards.
- New CI and mobile browser run still required to certify this change.

Do not publish the inspection tool to ordinary players without age/visual settings and mobile tests. This is fictional game content, not a medical system.