# Main synchronization checkpoint: authoritative StreetVerse rewards

Inspected reconciled branch head: `9670782563995c0f2222a484812f960c44b7db06`

Inspected current `main`: `07b4e4a61dccd94ed0e8fc326057c3f79baeefaf`

Observed current divergence remains broad; PR #171 remains open, unmerged, and GitHub reports `mergeable=false`. A blanket merge/rebase is still unsafe.

## Reconciliation status: AUTHORITY PATH RECONCILED; CURRENT HEAD CI PREFLIGHT FAILED

The authoritative Founder Alpha Chicago StreetVerse reward path has been reconciled onto PR #171 as one authority-preserving unit. The branch contains the required runtime bridge, server route hardening, server-synced progression update, zero-cash reward contract, server smoke coverage, and Omniverse smoke-gate wiring.

Canonical authority invariants that must remain true during synchronization:

- server-authoritative mission completion and reward state;
- idempotent reward claims;
- revision-checked player state;
- 200 XP + 500 Holo Credits, and zero cash;
- do not enable real payouts or provider actions;
- do not permit localStorage or client events to become authoritative;
- inventory, customs, settlements, payouts, and logistics remain server-authoritative.

The complete reviewed authority path is: server validation + idempotent claim reservation + authoritative returned player state + client read/sync bridge + contract test.

The sequencing rule remains: Add the authoritative reward contract to the Omniverse smoke gate only after the complete authority path is present. That condition is now satisfied by the reconciled six-file authority unit, so the contract is intentionally attached to the smoke gate.

## Reconciled atomic manifest

These six paths were treated as one authority-preserving reconciliation unit:

- `amm-omniverse/package.json`
- `amm-omniverse/src/runtime/StreetVerseMissionLedgerBridge.ts`
- `amm-omniverse/src/runtime/StreetVerseUnifiedProgressionRuntime.ts`
- `amm-omniverse/tests/streetverse-authoritative-reward-contract.mjs`
- `lib/get-paid-to-play-routes.js`
- `test/get-paid-to-play-smoke.js`

## Verification evidence

Exact reconciled branch head: `9670782563995c0f2222a484812f960c44b7db06`.

TryAMM Full CI run `34671932142` completed successfully on that exact reconciled head. This verifies that historical reconciled head only; it is not production-runtime release evidence.

On branch head `bfc31841587c55b74ad82cdc0adb102477004295`, TryAMM Full CI run `34692417087` showed:

- Root platform checks: success;
- Omniverse install, lint, security, readiness/provider gates, typecheck: success;
- StreetVerse entry repair and hero-spawn injection: success;
- legacy smoke contracts: success;
- commerce + Illinois release contracts: success;
- Vision-assisted AAA QA contracts: success;
- expansion-domain contracts: success;
- production-bible persistence contracts: success;
- main synchronization preflight contract: failure;
- authoritative reward contract: skipped because the preflight failed first;
- Vite production build: skipped;
- release gate: failure;
- production deploy: skipped.

The preflight failure was caused by its documentation invariant checks expecting canonical authority phrases that the checkpoint described semantically but did not contain verbatim. This increment adds those canonical invariant phrases without weakening any test, release gate, commerce authority boundary, or provider restriction.

Current `main` remains `07b4e4a61dccd94ed0e8fc326057c3f79baeefaf`, so there is no newer main commit to synchronize in this increment.

## Current blocker

CI must rerun on this documentation-only increment. Release readiness remains false until the exact new head passes the required validation lanes, then deployment/runtime evidence must still be verified separately.

After CI is restored, resume this release-blocker order:

1. Golden Order authority and founder commerce KPI telemetry;
2. Vision-assisted AAA QA and Illinois-first rollout gates;
3. StreetVerse runtime/performance/accessibility paths;
4. deployment/runtime verification evidence.

Unrelated feature/UI batches remain deferred. Do not merge PR #171 to `main`, enable real-money providers, purchase assets, or claim production release readiness without separate runtime evidence.
