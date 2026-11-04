# StreetVerse Chromebook pilot v0.2 — start here
Updated 2026-11-03 | Source branch: `streetverse-chromebook-workbench`

## Open without Linux or installed VS Code

1. Visit `https://github.com/jgoldie1/Amm-project-/blob/streetverse-chromebook-workbench/amm-omniverse/public/chromebook-streetverse-pilot.html`.
2. Choose **Download raw file** (GitHub raw view) to save the small HTML file to the Chromebook Downloads folder.
3. In ChromeOS Files, double-click or Open with Chrome. This game prototype needs no installed dependencies and does not require GitHub Codespaces.
4. Choose **Play / Build**, use the touch/one-hand direction buttons or keyboard WASD/arrows, then press **Interact** near the blue car or pink NPC.
5. Drive/walk to the gold Taylor Street objective; a completion message and 100 demo XP are displayed.
6. Choose **Demo Store** to add a fake cosmetic item. **No real purchase, Stripe billing, token sale, or cash-out exists**. Open **Cost Guardian** and enter estimated future resources manually.
7. Choose **Creator Tools > Export city JSON** to save a layout. Keep a copy in Google Drive.

## Verified and NOT verified

- The HTML file was saved and read back successfully on the workbench branch.
- JavaScript syntax was validated inside the assistant's JavaScript runner.
- Eight simulated DOM-behavior checks passed: page initialization, local persistence, vehicle interaction, demo inventory add/remove, cost arithmetic, budget alert, and no payment API.
- A source-contract check passed for map, mission, interaction, store, cost dashboard, local storage, export, no-charge labeling, and no remote JavaScript dependency.
- **Not yet tested in Chromebook Chrome, mobile Safari, or the full Three.js app.** This prototype is 2D, not the real 3D engine. Car movement is an interaction prototype, not physics.
- The game saves progress in localStorage only and uses manual estimates. It is NOT a persistent multiplayer economy, payment ledger or cloud-cost reconciliation.
- No new cloud hosting, payment account, subscriptions or production deployments were configured.

## Existing game source and required integration points

- Existing real Three.js game: `amm-omniverse/src/components/StreetVerseMobileWorld.tsx`.
- Lower-fidelity fallback: `amm-omniverse/src/components/StreetVerseMobilePlayableWorld.tsx`.
- BJ avatar runtime: `amm-omniverse/src/runtime/StreetVerseMeshyBJHeroRuntime.ts`.
- Original character folder: `https://drive.google.com/drive/folders/1QZHgdav1g0v22raXRDyGBx9hFBAZ_7JP`.
- The repository's public Meshy character drop location currently contains a README rather than the production BJ GLB. The README expects `SV_HERO_BJ_STUBBS_V6.glb`; other BJ variants are referenced by game source, but must be verified as actual assets. Do NOT claim 3D BJ is live because the loader contains paths.
- GitHub's existing `amm-omniverse/tests/streetverse-vehicle-control-contract.mjs` tests event listeners/scene-object binding, not end-user driving acceptance.
- Existing Drive folder has NPC GLB variants. Validate rights, hash integrity, skeleton, and animations before importing. Do not copy personal/private source assets to a public repo without approval.

## Current operational blockers
- The production Release Monitor and Convergence Health GitHub Actions failed on 2026-11-03. Release Monitor explicitly raises failure when the production probe is blocked; do not silence this release gate.
- The Today Autopilot full security/readiness/type/build job also failed. These are separate from the isolated Chromebook pilot.
- The connected Metricool brand `jamesstubbs007` points at TikTok `@jamesstubbs007`, Instagram `@theammonmiverse` and a YouTube channel. Do not schedule `@tryammLLC` posts through a different account accidentally; verify the target and authorization.
- Metricool TikTok-post and Instagram-reel analytics for Oct 27–Nov 3 returned no rows, and the account evolution snapshot returned zeros; do not present that as verified zero followers or zero views.
- Stripe's Oct 31 email requested completion of a business profile before live payment processing. The Stripe connector currently reports sandbox contexts; do not treat checkout as active.

## Next real 3D integration (no purchases yet)
1. Verify actual BJ GLB source and loading asset path on cloud, from authorized originals, with unmodified archived copies.
2. Trace and repair Circle Park camera/one-hand input, enter/exit vehicle, NPC walk and Taylor mission in `StreetVerseMobileWorld.tsx` and safe fallback.
3. Run targeted contract checks and real Chromebook browser checks (mission, drive, NPC, inventory).
4. Build a server-side, provider-authoritative purchase/entitlement service only after Stripe business verification; use Stripe test mode until then, process verified webhooks, refunds, idempotency, creator splits, and marketplace ledger.
5. Link approved owned or properly licensed LIVE streams; verify copyright permission for music, artist promotional photography and use of likeness. No third-party broadcast rebroadcast by default.
6. Compare actual service usage with the Cost Guardian budget. Require explicit approval before cloud spend or main-branch merge.

The goal is to make **one playable, testable game loop + one proven revenue service**, not to buy more subscriptions.
