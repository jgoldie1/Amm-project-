# TryAMM Lottie + Hologram Asset Library

## Verified foundation
The development branch already included `lottie-web` and the `AMM Motion + HoloFX` architecture. This integration adds an app-facing asset registry, runtime loader, hologram preview page, accessibility fallback, and three starter/recreated Lottie assets.

## Asset IDs
- `tryamm-hologram-splash`
- `hebrew-shalom-glow`
- `america-250-happy-birthday`

## Important authorship note
The exact original user-created source files for the previously created Hebrew Lotties and `250 Happy Birthday America` animation were not present in the connected GitHub repository at audit time. The JSON files in this branch are functional starter recreations/placeholders under the requested permanent asset IDs. When the original `.json`/`.lottie` files are recovered, replace these files at the same paths after visual comparison; do not claim the recreations are the original artwork.

## Runtime behavior
`public/js/tryamm-lottie.js` loads the asset registry, respects `prefers-reduced-motion`, attempts a local Lottie runtime first, then falls back to the pinned CDN runtime. Production should serve the installed `lottie-web` build locally or bundle it, with CDN fallback optional.

## App route
Open `/hologram` to preview the hologram splash, Hebrew animation and America 250 animation.

## Next asset buckets
Brand/logo, Hebrew/faith, America 250, gifts, badges, holidays, creator overlays, broadcast graphics, Living Worlds/game HUD, accessibility status animations.
