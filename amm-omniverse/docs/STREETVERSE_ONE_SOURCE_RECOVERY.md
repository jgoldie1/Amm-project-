# One Source Recovery · TRYAMM StreetVerse
Source of truth: `jgoldie1/Amm-project-`; main Three.js/Vite app: `amm-omniverse`.

This additive page (`/streetverse-one-source.html`) provides private, local V10 save import/export and duplicate-safe fictional Mushroom mission events. It does not replace the main game, overwrite project modules, touch server data or deploy. Requires manual import of the user-owned V10 JSON; no private save or credentials are committed.

Preserve existing root Express/Socket.IO server, StreetVerse/Three.js/Rapier frontend, LiveKit, HoloGPT, commerce, property, FaithVerse, and accessibility modules. Do not mark code-level tests as real-device rendering.

## Next release checks
1. Run root `npm run check` and frontend `npm --prefix amm-omniverse run check` on a properly provisioned workstation/CI.
2. Test this page by importing user V10 JSON and verifying seven Chicago L receipts, 57 regions, 8+ Mushroom events, and re-export. Do not reset original save.
3. Connect V10 save through authenticated, versioned player-state API only after authorization and ownership validation.
4. Require Chromebook WebGL screenshots, real BJ skeletal animation, train boarding and seat transforms, and full LIVE provider verification before production.
5. Compare any old Linux backups in a quarantined read-only directory; ignore `.env`, key files, certificates, tokens and provider credentials. Never overwrite new repository files during recovery.
