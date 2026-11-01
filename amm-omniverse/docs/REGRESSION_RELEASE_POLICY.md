# TRYAMM / StreetVerse Regression and Release Policy

## Rule: no change ships without evidence
Every change to StreetVerse, TRYAMM commerce, assets, or routing must be verified against existing behavior before merging. **Writing a test is not the same as running it.** Do not claim a green build, working gameplay, or successful deployment without the corresponding execution result.

## Local and CI checks
From `amm-omniverse/`:
```bash
npm ci
npm run test:app-game-regressions
npm run typecheck
npm run build
```
Record command, exit code, commit SHA, and CI run URL. If any step fails, do not merge. The app-game regression command covers the floor-height TS2339 guard, StreetVerse route wiring, smoke contracts, and BJ GLB loader/fallback. These are source contracts, **not** a substitute for browser gameplay tests.

## Playable acceptance before a game release
- Load `/streetverse?safe=1&place=circle-park` and verify that Circle Park opens.
- Verify BJ's real GLB loads and animates, with a visible fallback if loading fails.
- On an iPhone-size viewport, test one-handed joystick, camera, movement, and no blocking overlay.
- Walk to the vehicle, repair, enter, drive, brake/reverse, exit, talk to an NPC, finish the mission, and navigate toward Taylor Street.
- Enter a building; test stairs, ramps, elevators, floor collision and fall prevention.
- Inspect console/network errors and asset HTTP responses; do not treat a source string check as runtime proof.

## Commerce release checks
Test an inquiry/checkout using provider sandbox or approved test mode; verify server-side payment confirmation, owner notification, fulfillment, refunds, and authorization. Never call a simulated checkout a real payment.

## Asset preservation
Use original approved BJ/vehicle/scene assets when verified. Do not overwrite original GLBs, textures, animations, or production scenes. Use feature branches and reversible changes; preserve the existing capsule fallback when the GLB cannot load.

## CI and merge gate
Make `test:app-game-regressions`, `typecheck`, and `build` required CI checks via GitHub branch protection/rulesets, after confirming workflow names. Fail closed: red or missing checks block merging. Regression tests must be added for every production bug, with the failure reproduced before the fix when possible. Do not bypass a red check or disable a test to make the build green.

## Billing and production
While Vercel deployments are paused for billing, do not attempt production deployment or add paid services. Keep work on the development branch. Merge or deploy only when required checks and manual acceptance pass and the owner authorizes release.

## Current recurring failure
`StreetVerseBuildingReconstructionCompiler.ts` previously used `l.heightM` without declaring `heightM` in the `Level` type (TS2339). The type was corrected, and `tests/building-level-height-regression.mjs` guards against its removal. A successful CI typecheck is still required.
