# StreetVerse realistic world staging — Circle Park vertical slice

This branch is **not deployed** and does not switch any production route. The existing West Side visible world, player saves, mobile controls, missions and fallback must remain authoritative until real assets have passed inspection.

## What has been added

- `src/runtime/StreetVerseRealAssetStaging.ts` — an isolated GLB loader for reviewed Circle Park courtyard, gate, BJ avatar, starter car, and Taylor Street meshes.
- All five entries are **PENDING**, so no unlicensed, missing, or unverified models can load.
- The loader requires explicit `enabled: true`, verifies positive Content-Length and size caps, skips missing assets and continues after individual failures, and returns a cleanup function.
- No currently running CityView or ImmersiveWorldViewport route imports this module. No visible game upgrade is claimed yet.

## Required real asset import process

1. Obtain a commercially usable 3D GLB model with a recorded provenance, creator and license. Do not use photographs, people's likenesses or game franchise models without the necessary rights.
2. Optimize meshes for mobile; use compressed textures and low-poly collision proxies. Keep a mobile-friendly LOD and fallback for each model.
3. Place model files at `public/streetverse/real-assets/<manifest-name>.glb`; verify the deployment serves correct bytes with a HEAD response and Content-Length.
4. Set `license` and `source` in the manifest only after confirming use rights, target device performance and the file size.
5. In a **preview-only** integration, call `stageRealAssets(scene, realAssetManifest, {enabled: true,signal})` and retain the returned `dispose()` handler for scene teardown.
6. **Do not overlay environment meshes over the existing world** until transforms, collision maps, occlusion and navigation are tested. When a mesh replaces placeholder geometry, remove only the corresponding placeholder in the preview scene.
7. Independently validate animated BJ, passenger seating and vehicle entry/exit; the loader alone does not provide working animation controllers, vehicle physics or missions.

## Acceptance gates

- Circle Park and Taylor Street load on Chromebook and iPhone without blank screens or hidden controls.
- One-handed joystick moves BJ; dialogue works; entering, steering, braking and exiting the starter car works.
- Mission start, complete, XP/reward, Reel capture and save/restore survive a reload.
- Performance: a practical target is 30 FPS on target phone, no major memory spikes, and a graceful low-effects fallback.
- Automatic tests and BJ Family browser journey pass; preview screenshot and real-device recording reviewed.
- The storefront and Stripe test payment remain isolated from this game build.
- PR review + staging deployment + rollback test before production promotion.

## What remains

Actual licensed GLBs, rigged/animated characters, vehicle system wiring, art-direction review, mobile performance testing and scene integration. Do not claim they exist because their manifest entries are named.
