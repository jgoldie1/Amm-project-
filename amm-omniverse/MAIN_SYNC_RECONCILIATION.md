# PR #171 main synchronization reconciliation

This file records the reviewed synchronization boundary before any broad merge or rebase is attempted.

## Observed baseline

- PR: #171
- Working branch: `foundation/aaa-golden-order-world-rollout`
- Branch head inspected: `acc9e3242a934283545d17ce5695d6fa13ee82d5`
- Current main inspected: `76aef876e939a2025c543678b09da5d54c515595`
- Merge base: `ec6918c8204fd0ca3c5b9bad992851f23762f7e1`
- Divergence: branch 337 commits ahead / 41 commits behind main
- GitHub mergeability: false

Because the synchronization surface is broad, PR #171 must not be force-merged or blindly rebased. Reconciliation should continue in small, behavior-preserving increments with CI attached to every new head.

## Current-main surface that requires reconciliation review

Current main changed the following release-relevant runtime/configuration surfaces since the merge base:

- root runtime/config: `.env.example`, `package.json`, `server.js`
- Omniverse runtime/build: `amm-omniverse/package.json`, `amm-omniverse/scripts/repair-streetverse-entry.mjs`
- StreetVerse launch/runtime: `amm-omniverse/src/components/GameVerseLauncher.tsx`, `amm-omniverse/src/components/HoloDirectLaunchBridge.tsx`, `amm-omniverse/src/components/LivingWorldsBridge.tsx`, `amm-omniverse/src/components/StreetVerseSafeWorld.tsx`
- business/runtime routes: `lib/ai-training-routes.js`, `lib/daily-business-boost-routes.js`, `lib/omniverse-radio-routes.js`, `lib/content-engine-preload.js`
- public business/runtime assets: `public/business-boost.css`, `public/business-boost.html`, `public/business-boost.js`, `public/streetverse-business.css`, `public/streetverse-business.html`, `public/streetverse-business.js`
- public shell/media surfaces: `public/app-shell.html`, `public/music-hub.html`, `public/music-hub.js`
- validation: `test/ai-training-smoke.js`

The remaining main-only files are documentation, business architecture, Holo platform architecture, Living Story catalog/center, training-service, and launch-review material. They should be reconciled separately so unrelated feature expansion does not get mixed into release-blocker work.

## Safe synchronization rules

1. Preserve the foundation branch's Golden Order, founder commerce telemetry, Illinois-first rollout, Vision-assisted QA, performance, accessibility, and contract-test gates.
2. Preserve current-main fixes needed for StreetVerse launch/runtime and root validation.
3. Keep payments, inventory, customs, settlements, payouts, and logistics server-authoritative.
4. Do not enable real-money provider actions while reconciling.
5. Do not merge PR #171 to main until the reconciled head has passing Root platform checks, passing Omniverse app checks, a passing Release gate, and separate runtime/deployment evidence.
6. Production deploy remaining skipped on a non-main branch is expected and is not release-runtime evidence.

## Verification state at creation

GitHub Actions run `34479820840` for head `acc9e3242a934283545d17ce5695d6fa13ee82d5` completed successfully: Root platform checks passed, Omniverse app checks passed, and the Release gate passed. Production deploy was skipped because this is not a main push.

This CI result verifies the inspected branch head's validation lanes only. It does not resolve the 41-commit main divergence and does not by itself prove production deployment/runtime readiness.
