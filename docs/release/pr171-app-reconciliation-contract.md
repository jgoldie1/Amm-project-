# PR #171 — App reconciliation contract

This is a release-convergence contract, not a feature request.

## Current-main behavior that must survive reconciliation

- Mobile shell uses `100dvh` rather than a fixed `100vh` viewport.
- Gameplay (`screen === 'city'`) owns vertical overflow; non-gameplay screens remain vertically scrollable.
- The shell remains available outside the login screen.
- HoloStyle remains lazy-loaded and reachable through `window.__showHoloStyle` and Command Nexus.

## Foundation-only behavior that must survive reconciliation

- `StaysAgencyFamilyHub` remains lazy-loaded.
- `window.__showStaysAgencyFamily` opens the `stays` tab.
- `window.__showSetApartPassport` opens the protected `passport` tab.
- Command Nexus retains both `STAYS · AGENCY · FAMILY` and `SET APART PASSPORT` launchers and their readiness labels.

## Release rule

`amm-omniverse/src/App.tsx` is not reconciled by choosing either side wholesale. A valid reconciliation must combine the current-main mobile/HoloStyle shell behavior with the foundation Stays/Agency/Family and Set Apart Passport routes, then pass lint, security, readiness/provider gates, typecheck, smoke/contracts, production build, and exact-head deployment checks.

Do not merge PR #171 solely to reduce the behind count. Do not activate real-money/provider actions as part of this reconciliation.
