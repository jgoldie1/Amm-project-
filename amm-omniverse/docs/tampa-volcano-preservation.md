# Tampa BeautyVerse and VolcanoVerse: preservation runbook

## Integration scope
Draft PR only. New routes: `/streetverse/tampa`, `/streetverse/volcano`.
Existing `/streetverse`, twin-world, safe-mode, logins, inventory, databases, and payment code must not be overwritten.
The Tampa route contains concept destinations for La Taeasia's salon, boutique, academy and streamer studio; no real payments/bookings or broadcasting are active.
Volcano is a local practice challenge. Gamepad API controls are input-only and require a compatible paired controller. TV casting depends on the device and browser/OS. No multiplayer or save synchronization.

## Pre-merge checklist (required)
1. Record current production deployment ID and main commit SHA; obtain a recoverable database snapshot where applicable.
2. Run `npm --prefix amm-omniverse run lint:strict` and `npm --prefix amm-omniverse run build`.
3. Run `node amm-omniverse/tests/tampa-volcano-preservation-contract.mjs`.
4. Run `npm --prefix amm-omniverse run smoke` and existing release/security/UI tests.
5. Review compiled output sizes; confirm routes are lazy loaded.
6. In a Vercel preview test `/streetverse`, `/streetverse?safe=1`, `/streetverse/tampa`, `/streetverse/volcano`, and existing business routes.
7. Test Chrome keyboard, touchscreen, gamepad paired via OS, Android/iOS display, TV screen mirroring, and low-memory Chromebook performance.
8. Check browser console errors, frame rate, navigation back to world, and account data unaffected.
9. Keep this PR in draft if deployment checks fail; do not merge or force-push.
10. Release behind a feature flag and test first with owner accounts only. Make an immediate rollback available.

## Recovery
- If a beta route fails, navigate to `/streetverse`; if the canonical world fails, use `/streetverse?safe=1` if available in that deployment.
- If a preview fails, leave main unchanged and repair the draft branch.
- If a future production release fails, roll back to the recorded prior successful deployment and disable route links or feature flags. Do not delete player data or rebuild the game.
- Never force push main or run destructive database migrations as part of this beta.

## Pending connections
Actual airport map transitions; shared avatar and persistent player state; backend-authoritative mission rewards; verified salon licensing and calendar; streamer channel ownership/rights; real checkout, inventory and customer handoff; device-specific casting QA.
