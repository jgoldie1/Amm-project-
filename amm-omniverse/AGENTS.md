# StreetVerse App Agent Instructions

Follow [root AGENTS.md](../AGENTS.md) and [Regression and Release Policy](docs/REGRESSION_RELEASE_POLICY.md).

Before any app/game change:
- Inspect current scene, route and asset loaders. Preserve original BJ GLB and existing playable fallback.
- Add a regression test for a bug before or alongside the fix.
- Run `npm run test:app-game-regressions`, `npm run typecheck`, `npm run build`; report real exit codes.
- For mobile/3D behavior, also validate gameplay in a browser on a mobile viewport. Static contract checks alone are insufficient.
- Never disable CI checks to pass. No production deployment while billing is blocked.

Release-critical user journey: Circle Park -> BJ walk -> repair -> enter vehicle -> drive -> exit -> NPC -> complete -> reward -> Taylor Street, including one-hand controls and collision-safe building access.
