# Use existing TRYAMM assets first — West Side World Builder repair (October 20, 2026)

## Grounded findings

- The repo already contains StreetVerseWestSideWorldBuilder, StreetVerseWorldForger, StreetVerseQuantumWorldBuilderOrchestrator, HoloForgeAssetRuntime, original native GLB foundry, Meshy import/recovery and preview loaders.
- The native foundry is already included in the Vite production build pre-step. It generates scene kits into public/generated-assets/native/kit when that **branch** is built; generated binary outputs are not persisted in the ordinary Git tree.
- Native assets are registered as PREVIEW in TryammNativeRuntimeAssetCatalog and placed by TryammNativeAssetRuntime in the West Side/near-West 3D scene. That is distinct from fully production-ready, animated or collision-authoritative BJ and NPC assets.
- Supabase-backed residents/animation may fail with HTTP 402 even if the self-contained native kit generated successfully. The World Builder also originally represented many queued/future tasks, not automatic deployed world geometry.
- Previous saved 12 GLB originals are in an October 2026 GitHub Actions artifact rather than ordinary public app source. Do not replace, delete, re-generate or claim deployed proof for those originals without inspection and permission.
- Do NOT copy or merge a proprietary GTA/SimCity source tree or replace the existing primary browser Three.js runtime without a deliberate compatibility/license check.

## What changed on this branch

1. Builder BUILD tab has a concrete Existing TRYAMM Forge Assets status panel instead of only a conceptual build queue.
2. A **user-triggered only** four-asset HEAD probe checks the URLs for native brick building, tree, sport sedan and hero. It shows failures (including 402/404). It does not download large GLBs repeatedly or use Meshy credits.
3. Real native-loader mounted-count events from West Side and Taylor/UIC are shown as loaded vs failed. HoloForge provider output is expressly labeled separately from mounted geometry.
4. The World Builder's ENTER TAYLOR 3D button opens the **existing** enhanced Near West Three.js world and its native GLB placement layer directly. No new asset provider or shader library.
5. Builder mission buttons now enter scripted cinematic story choice on PR #649 rather than sending silent/unhandled mission-start events.

## Not complete

- This branch does not itself install additional external 3D asset packs, guarantee the public Vercel domain carries generated binaries, make high-res BJ's facial likeness production-certified or fix Supabase's HTTP 402 quota state.
- The safe HTML fallback does not create WebGL. Press Retry 3D Chicago after an actual usable WebGL session is available.
- Merge this branch only after reconciling PRs #649 (cinematics) and the preserved production/storefront branches. Maintain a tested rollback and verify on the user's iPhone.

## QA evidence needed

- Existing GLB pack probe returns four successful non-HTML HEAD responses on a Vercel preview.
- Press World Builder → BUILD → ENTER TAYLOR 3D, and confirm a real canvas with a native load count greater than zero.
- Press World Builder → MAP → START MISSION and confirm fade/dialogue and first waypoint.
- Test Safari iOS 16 with one-handed controls and blocked Supabase storage, no missing-account charge.
