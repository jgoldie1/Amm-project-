# StreetVerse release lock — October 29, 2026

## Scope
Candidate branch: `fix/streetverse-building-level-height-2026-10-29`. This is not a production release certificate.

## Verified checks on commit de698c5866472858f5d40efa30c4dc0e303c6c1d
- Building-height regression: passed.
- TypeScript typecheck: passed.
- Mission quick-start and one-hand control source contracts: passed.
- Production preview build: passed.
- Screenshot capture: still in progress at last verification.
- Mobile gameplay interactions: not verified in a real browser/device.
- Visual baseline / pixel or perceptual comparison: not established.
- No production deployment or merge was performed.

## Required evidence before release
1. Successful completed screenshot workflow with nonempty 390x844 mobile and 1440x900 desktop artifacts.
2. Inspect and approve those two images and preserve baseline with the exact commit SHA.
3. Add automated future-image comparison with explicit tolerances and artifact retention.
4. Prove MISSION button click, vehicle enter/drive/exit, one-hand controls, mission completion, and return-to-world in browser automation.
5. All required CI and release gates pass on the **same exact release candidate SHA**.
6. Review foundation/main divergence and merge conflicts. Never force merge or bypass the gate.
7. Merge only after approvals, then verify deployment separately. Rollback must retain prior known-good deployment.

## Rule
Do not mark this release LOCKED, LIVE VERIFIED, or DEPLOYED without the exact run IDs, artifacts, screenshots, gameplay results, and production URL evidence. A screenshot capture alone does not prove gameplay.
