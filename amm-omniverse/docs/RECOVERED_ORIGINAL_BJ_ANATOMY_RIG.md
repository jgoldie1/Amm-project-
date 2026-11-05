# Recovered Original StreetVerse BJ Anatomy / Tear-Down Rigging

Recovered from existing GitHub history on November 4, 2026.

## Original source provenance
- `f45d42d861ddfdf053e35669ea28753ab0a9a6c8`: recovered `StreetVerseAnatomySimulation.ts`, `StreetVerseCharacterInjuryRuntime.ts`, original anatomy behavior tests.
- `1ce6eb83ba69e46edaaa7435590a471897077666`: prior CI inclusion of organ behavior tests.
- The earlier work was absent from the active feature branch, not absent from the overall repository history. Original code has now been restored, not replaced by the unrelated non-graphic status prototype.

## Actual features recovered
- Fictional per-character brain, heart, lungs, liver, kidneys integrity, breathing, stamina, mobility, stunned/downed and rescue-needed states.
- Character damage reaction labels: hit-react, hurt, downed, seated, idle.
- A small bounded optional blood particle effect, with off/minimal/standard presets.
- Original 3D hero animation hook retains the object's baseline rotation and does not tilt the seated driver.
- Full local respawn/reset, character selection reset, explicit disposal of particles/materials/event listeners.

## Current integration
- `StreetVerseMobileWorld.tsx` constructs recovered injury runtime using `nativeHero || avatar`.
- It updates after BJ's existing rig/mixer tick, and disposes with the scene.
- `StreetVerseBJVitalsHUD.tsx` observes actual recovered injury and organ state. Open with `?injuryLab=1` to reveal local, nonauthoritative demo buttons.
- `tests/streetverse-anatomy-simulation.test.mjs` and `tests/streetverse-injury-rigging-contract.mjs` are in the Omniverse smoke suite.

## Not yet verified
- No full real-BJ-GLB/rig visual acceptance or cross-platform playthrough.
- No anatomical skeletal organ meshes or destructible body part GLBs. The organ system is simulation data, not actual textured organ anatomy.
- Injury rig reaction events still require animation-director mapping to specific existing GLB hit/downed clips when available.
- Blood particle demo and locally simulated injury are *not* network-authoritative multiplayer combat.
- Real crash, fracture or medical claims are not part of this fictional arcade/RPG model.

## Safe next acceptance checks
1. Run `npm run test:original-organ-rig` and full `npm run check` in `amm-omniverse`.
2. Open the **development preview only** using `/streetverse?injuryLab=1`; expand BJ's HEALTH panel.
3. Confirm hit reduces HP and chest organ values, and creates a visual hit reaction with minimal particles.
4. Verify defeat/downed and respawn; check driving does not tilt the seated BJ rig.
5. Switch characters and confirm local injury state resets; verify mobile performance and memory cleanup.
6. Verify original BJ GLB loads with real skinned meshes, skeletal animation and supported injury reaction clips before claiming production-quality game anatomy.

This restoration is committed only to the protected integration branch. No production deploy, asset generation or paid Meshy task was initiated.
