# Main synchronization checkpoint: authoritative StreetVerse rewards

Inspected branch head: `a8dbf926d9defc50c03e4d3a047d35022d5995e9`

Inspected current `main`: `07b4e4a61dccd94ed0e8fc326057c3f79baeefaf`

Observed divergence before this checkpoint: 378 commits ahead / 116 commits behind, merge base `ec6918c8204fd0ca3c5b9bad992851f23762f7e1`. PR #171 remains open, unmerged, and GitHub reports `mergeable=false`.

The newest `main` commit is release-relevant. It connects the Founder Alpha Chicago StreetVerse mission to server-authoritative mission completion and reward state, with idempotent reward claims, revision-checked player state, 200 XP + 500 Holo Credits, and zero cash. It also adds a client bridge that only reflects server-returned reward state and a contract that prohibits client-side balance writes or cash crediting.

This change must not be blindly cherry-picked onto PR #171 because the foundation branch does not currently contain `amm-omniverse/src/runtime/StreetVerseMissionLedgerBridge.ts`, and the main commit spans runtime, server, validation, and package smoke-test surfaces. Pulling only one file would create a partial authority path and could weaken the release boundary.

## Atomic reconciliation manifest

Treat these six paths from main commit `07b4e4a61dccd94ed0e8fc326057c3f79baeefaf` as one authority-preserving reconciliation unit. Do not enable the new smoke contract until the implementation paths are present together and reviewed:

- `amm-omniverse/package.json`
- `amm-omniverse/src/runtime/StreetVerseMissionLedgerBridge.ts`
- `amm-omniverse/src/runtime/StreetVerseUnifiedProgressionRuntime.ts`
- `amm-omniverse/tests/streetverse-authoritative-reward-contract.mjs`
- `lib/get-paid-to-play-routes.js`
- `test/get-paid-to-play-smoke.js`

The manifest is intentionally exact. If current `main` changes any of these paths before reconciliation lands, re-inspect the new main head and refresh this checkpoint rather than copying a stale patch.

## Required targeted reconciliation

1. Preserve the foundation branch Golden Order and founder-commerce authority separation.
2. Port the StreetVerse mission-to-ledger path as one reviewed unit: server validation + idempotent claim reservation + authoritative returned player state + client read/sync bridge + contract test.
3. Keep cash rewards disabled for this mission path; do not enable real payouts or provider actions.
4. Do not permit localStorage or client events to become authoritative for XP, Holo Credit balances, cash, inventory, customs, settlements, payouts, or logistics.
5. Add the authoritative reward contract to the Omniverse smoke gate only after the complete authority path is present.
6. Require an attached passing TryAMM Full CI run on the resulting exact head before moving to the next reconciliation increment.

## Verification before this increment

TryAMM Full CI run `34666590264` completed successfully on exact prior head `a8dbf926d9defc50c03e4d3a047d35022d5995e9`. Both Vercel status contexts on that head also report success. These are branch/preview checks only and are not production-runtime release evidence.

## Blocker

The branch remains broadly diverged from `main`, and the authoritative reward commit is cross-cutting enough that a partial port is unsafe. The next safe code increment should reconcile the six-path manifest above as one authority-preserving unit; until then, do not force a blanket merge/rebase and do not claim release readiness.
