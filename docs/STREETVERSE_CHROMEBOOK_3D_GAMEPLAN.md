# StreetVerse Chromebook: browser-to-3D release gates
Date: 2026-11-03
Branch: `streetverse-chromebook-workbench`
Status: development only; do NOT merge into main or charge real users.

## Files ready and backed up
- 2D + Creator Studio v5: `amm-omniverse/public/chromebook-streetverse-pilot.html` (small standalone GitHub pilot), plus standalone v5 package in Google Drive.
- Real WebGL 3D proof: `amm-omniverse/public/chromebook-streetverse-3d-webgl-proof.html`, plus `StreetVerse_Chicago_3D_Chromebook_Proof_v1.html` in Google Drive.
- Google Drive folder: https://drive.google.com/drive/folders/1UqMhTp5os4kWMIQ03PmsFx1c9nf8lO_y
- Combined Chromebook starter ZIP in that folder: 2D/Studio + 3D proof + START_HERE.txt.

## First user test (no installation)
1. Download `StreetVerse_Chicago_3D_Chromebook_Proof_v1.html` from Google Drive and open from ChromeOS Files > Downloads > Open with Chrome.
2. Confirm you can see perspective 3D buildings, trees, player box, blue car, yellow repair kit and gold marker. This is a genuine WebGL scene but only procedural placeholder graphics.
3. Walk with arrow keys/WASD or one-hand directional buttons to the repair kit. Press E / INTERACT near blue car, drive to Taylor Street, talk to NPC, complete mission and check XP.
4. Test camera button and RESET, then reload the tab; local saved state should be recovered when Chrome permits local storage for local files.
5. If WebGL warning appears, inspect `chrome://gpu` and graphics acceleration settings; fall back to 2D v5. Do not install Linux or buy a GPU.

## Current automated validation
- Both standalone v5 script blocks passed Node.js syntax checks.
- The WebGL 3D proof JavaScript passed syntax check. Mocked WebGL render passed with 250 draw calls and startup/reset/camera/local-save checks.
- THESE DO NOT replace a real Chrome GPU render, real model animation, physical one-hand accessibility acceptance, security review, or live deployment verification.

## Road to real 3D game (existing source, no rebuild from scratch)
1. Audit `amm-omniverse/src/components/StreetVerseMobileWorld.tsx` and `StreetVerseMobilePlayableWorld.tsx` for Circle Park first spawn, one-hand controls, player and camera, car enter/exit, NPC interaction and Taylor Street mission. Use the development branch.
2. Recover the real BJ Stubbs GLB, animations and licensed/original textures. Verify hash, ownership, scale, skeleton and walk/idle/run clips. The current public Mes​hy characters drop path contains README only; the runtime references `SV_HERO_BJ_STUBBS_V6.glb` / variants but naming a file is not proof the file was uploaded.
3. Connect verified GLB with the existing Three.js GLTF loader and animation mixer. Keep explicit fallback and log asset load error instead of falsely declaring success. Optimize meshes, textures and animations for Chromebook + phone.
4. Use source-level checks, then actual browser check for one mission loop. Add vehicle physics and interiors only after character movement/camera are reliable.
5. Put pre-approved optimized assets in authenticated, budget-limited object storage for hosted preview; originals remain archived in Google Drive. Avoid new paid services until justified.
6. Only once Stripe onboarding is complete: add Stripe test-mode Checkout with authoritative server-side webhook, signed purchase entitlements, refunds, idempotency, creator revenue and moderation. No crypto cashouts or pay-to-win sales in pilot.
7. Only after a working test stream link and rights clearance: add safe LIVE discovery/links inside the game. Do not include third-party music recordings in commercial gameplay or promotional videos without rights.
8. Track five launch metrics: unique pilot players, mission completions, average load time, download MB/player, and verified **net** receipts. Target 25-100 invited pilot players and <=$10 optional services monthly before expanding.

## Relevant failures to fix, not silence
- Nov 3 GitHub main Release Monitor failed due blocked production probe.
- Convergence Health and Today Autopilot build/readiness workflow also failed.
- Original WebGL/Three.js game production render and streaming/payment services are not declared ready.
- No public deployed URL was issued for the WebGL proof; downloading locally in Chrome is the zero-install path.
