# TRYAMM / StreetVerse Coding Agent Rules

This file applies to changes in this repository. Read [the regression and release policy](amm-omniverse/docs/REGRESSION_RELEASE_POLICY.md) before editing gameplay, routing, assets, commerce, or infrastructure.

## Mandatory workflow
1. Inspect existing source, assets, route wiring, tests, and GitHub CI failure logs before making changes. Do not replace existing gameplay with a demo.
2. Reproduce the bug with a regression test where feasible; fix the root cause, not the test assertion. Preserve current GLBs and a fallback path.
3. From `amm-omniverse/`, run `npm run test:app-game-regressions`, `npm run typecheck`, and `npm run build`. For gameplay changes also run appropriate existing StreetVerse tests and perform a browser/device acceptance test. Report executed results, not planned tests.
4. Do not merge with failed/missing required checks. Do not deploy while the Vercel invoice blocks releases. Never claim static string contracts prove working character animation, driving, elevators, or payments.
5. Keep work on a feature branch, avoid unrelated edits, and provide commit SHA, failing commands, and remaining blockers.

## Known regression
`src/game/runtime/StreetVerseBuildingReconstructionCompiler.ts` must declare `heightM:number` in `Level` because validation reads `l.heightM`. Guard: `tests/building-level-height-regression.mjs`.

## Definition of done
A green typecheck and build; passing relevant tests; demonstrated gameplay or commerce acceptance where applicable; no asset replacement or unintended production changes. Source-only verification must be labeled incomplete.
