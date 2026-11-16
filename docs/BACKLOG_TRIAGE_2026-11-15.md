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
