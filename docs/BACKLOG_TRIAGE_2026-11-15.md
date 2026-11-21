# TRYAMM backlog triage — 2026-11-15

## Scope and verification

Repository: `jgoldie1/Amm-project-`. GitHub returned **100 open pull requests** in the first result batch, so this is a minimum, not the complete total. Branch search also returned 100 with a continuation cursor. The historical "4,000" count is unverified and must not be represented as 4,000 pending commits.

## First duplicate candidate: StreetVerse MISSION quick-start

Open pull requests #685, #710, #721, and #723 describe restoring `tryamm:streetverse-first-journey-start` while preserving the cinematic mission selector. Similar descriptions do not prove identical patches.

Current branch comparisons versus `main`:

| Branch | Ahead | Behind | Key risk |
|---|---:|---:|---|
| `fix/streetverse-mission-quickstart-2026-10-29` | 1 | 258 | Old base; rebase or cherry-pick, don't merge directly |
| `fix/streetverse-mission-quickstart-20261111` | 1 | 0 | Narrow candidate, 9 changed lines in core dock |
| `fix/streetverse-mission-quick-start-nov13` | 5 | 0 | Core dock plus e2e and contract changes; evaluate test coverage |
| `fix/streetverse-mission-quickstart-dock` | 306 | 0 | Large multi-feature batch; don't merge wholesale |

## Safe sequence

1. For each PR, inspect exact head SHA, changed-file diff, CI results and the user's active gameplay requirements.
2. Compare the narrow 20261111 and nov13 variants for behavior and tests, including one-hand MISSION click, inactive/active mission transitions and cinematic selector.
3. Integrate only the selected minimal fix and necessary regression tests into a current clean branch; run root + Omniverse CI and mobile/Chromebook acceptance.
4. Merge through reviewed PR only after passing the release requirements. Close superseded requests **only after** the replacement commit is present and cited in the closure explanation.
5. Do not delete branches until their work has been inventoried and recovered. In particular, split the 306-commit multi-feature branch by feature and preserve BeautyVerse, Holo FON, StreetVerse and release evidence.

## Launch-critical queue (do not lose)

- #729 — one-button whole-app audit; currently blocks on 15 unverified readiness checks (this is intended fail-closed behavior).
- #728 — Greenville birthday website and StreetVerse RP gateway.
- #727 — TRYAMM quick website creator.
- #726 — Holo FON storefront and RP/LIVE regression gate.
- #725 — StreetVerse screenshot evidence and recovery provenance.
- #723/#721/#710/#685 — overlapping mission-button fix candidates.
- #720 — domain registration/transfer lifecycle.

## What cleanup changes

A smaller, verified PR queue reduces conflicting changes, duplicated fixes, CI load, and accidental overwrites. It does **not** automatically deploy the website, settle payments, fix accessibility, or clear 15 whole-app blockers. Every closure requires proof of merger/supersession, and every production release still requires test evidence.

## November 16: smallest-change-first comparison (verified)

**First candidate: PR #710** — one changed file, `amm-omniverse/src/components/StreetVerseCoreGameplayDock.tsx`. Its patch adds a conditional `tryamm:streetverse-first-journey-start` event when no mission is active, shows `STARTING STREETVERSE MISSION`, and retains the existing cinematic selector event when the mission button is pressed. The same file on `main` currently only opens the cinematic selector. This is a genuine unmerged behavior difference, not proof the listener/complete journey succeeds.

Changed-file inventories checked directly on GitHub:

| PR | Number of changed paths | Triage |
|---|---:|---|
| #710 | 1 | Smallest isolated candidate; verify event receiver and tests first |
| #700 | 13 | BJ GLB, seating, NPC, vehicle, tests; keep separate |
| #713 | 14 | Asset/HTTP 402 fallback, mobile visibility, tests; keep separate |
| #696 | 77 | Broad LIVE, mobility, creative, radio, and gameplay changes; split before integration |

The earlier overlapping candidates #685/#721/#723 still require exact diff comparison before declaring any redundant.

**Release hold:** Issue #712 documents three failing mobile Playwright assertions (BJ owned GLB, resident asset proof, Taylor Street accessible travel button) and explicitly holds #710/#696/#700 unmerged until relevant regression evidence passes. Issue #714 documents incomplete BJ rig/animation proof. Do not merge #710 only because it is small. Verify the `first-journey-start` event consumer, mission-active behavior, no duplicate rewards, TypeScript/build, existing contracts and Playwright mobile mission controls; then cherry-pick the minimal patch and required tests into a fresh integration PR. No PRs closed, branches deleted, payments made, or production deployed during this comparison.
