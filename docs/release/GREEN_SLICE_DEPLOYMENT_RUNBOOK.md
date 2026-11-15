# Green Slice Deployment Runbook

## Goal
Promote one proven StreetVerse/District 01 slice without carrying the historical branch divergence forward.

## Sequence
1. **RECOVER** — use `agent/green-slice-recovery-20261114`, created from current `main`.
2. **ADAPT** — reconcile only release-critical interfaces required by current main.
3. **WIRE** — connect recovered proof/security/runtime modules to current app entry points.
4. **MIGRATE** — apply only reviewed migrations required by the active slice.
5. **TEST** — security, typecheck, build, smoke, runtime, mission, controller, save/rejoin, Panic.
6. **REPAIR** — fix RED failures; do not bypass.
7. **BENCHMARK** — mobile >=30 FPS target and XR >=72 FPS target remain targets until device evidence exists.
8. **DEPLOY** — only after all required internal gates and external provider/device gates are GREEN.

## Provider recovery order
1. Vercel 402: restore valid production availability.
2. Render 503: restore backend health endpoint.
3. Supabase: confirm required services are unrestricted and credentials are valid.
4. LIVE: verify real provider configuration and two authenticated devices.
5. Commerce sandbox: verify provider receipt and entitlement idempotency.

## Offline/current-build proof order
1. StreetVerse core cast + Meet the Stubbs mission definitions.
2. Canonical player/world state.
3. Server-authoritative movement.
4. Guardian/Panic boundaries.
5. Controller normalization and safe disconnect/reconnect.
6. Quantum network degradation rules.
7. Quantum performance degradation rules.
8. District evidence ingestion/proof orchestrator.
9. Save/rejoin.
10. Money/security boundaries.

## Stop conditions
Stop deployment on any RED gate, stale evidence, build/commit mismatch, missing provider receipt, missing two-device LIVE evidence, missing physical mobile/XR evidence, security regression, or money-authority violation.
