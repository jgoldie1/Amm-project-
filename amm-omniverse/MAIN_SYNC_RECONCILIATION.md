# PR #171 main synchronization reconciliation

This file records the reviewed synchronization boundary before any broad merge or rebase is attempted.

## Current release-blocker checkpoint — 2026-09-15

- PR #171 remains open and unmerged.
- Inspected foundation head before this checkpoint: `41c978b435b1a2581d18d9480c0a3ce0f6d07452`.
- Current main: `d87f635e6bfccf35b25f05892ca352462f4ab983`.
- Merge base: `ec6918c8204fd0ca3c5b9bad992851f23762f7e1`.
- GitHub compare: branch `488` commits ahead / `182` commits behind main.
- GitHub reports PR mergeability false.
- Commit-associated pull-request workflow lookup returned no CI run for the inspected exact head.

### Reviewed synchronization boundary

The numeric 182-behind count is not a safe instruction to import 182 commits. The compare surface mixes release-critical runtime/configuration changes with unrelated feature expansion. A blanket merge/rebase remains prohibited while the PR is non-mergeable and exact-head CI is unattached.

Release-critical surfaces visible in the current compare include:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-tryamm-production.yml`
- `.github/workflows/tryamm-today-autopilot.yml`
- root `package.json` and `server.js`
- `amm-omniverse/package.json`
- `amm-omniverse/src/App.tsx`
- StreetVerse launch/safe-world bridges
- foundation Golden Order, founder-commerce telemetry, Illinois rollout, and Vision QA gates
- contract tests and main-sync preflight validation

The foundation branch also contains substantial branch-only functionality. Reconciliation must therefore continue path-by-path and preserve branch-only behavior instead of replacing whole runtime files simply because main changed them.

### Authority and release rules

1. Real payments, inventory, customs, settlements, payouts, and logistics remain server-authoritative.
2. No provider real-money action is enabled by synchronization work.
3. PR #171 is not merged to main by this workstream.
4. Release readiness requires exact-head passing Root platform checks, Omniverse app checks, Release gate, and explicit deployment/runtime evidence.
5. Vercel/preview success alone is not production-runtime proof.
6. If CI is missing from an exact head, release certification is blocked even when prior heads were green.

### Next safe increment

Use this documentation-only checkpoint to retrigger the configured branch/PR CI path. On the resulting exact head, first verify CI attachment and the release-gate jobs. If CI is green, continue with one release-critical main overlap at a time, preferring equivalence checks or targeted ports over whole-file replacement. If CI does not attach or fails, fix that CI blocker before any broader synchronization.

## Historical reconciliation notes

Earlier checkpoints established that PR #171 has repeatedly carried passing TryAMM Full CI on exact heads while remaining intentionally unmerged, and that main drift frequently contains unrelated feature work. Those observations remain valid guidance: do not reduce the behind counter at the cost of overwriting Golden Order, founder commerce KPI telemetry, Illinois-first rollout, Vision-assisted QA, accessibility, performance gates, or branch-only StreetVerse runtime behavior.
