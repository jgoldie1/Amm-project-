# PR #171 App convergence blocker

Status: BLOCKED — narrow reconciliation required before broader main synchronization.

## Verified state

- Working branch: `foundation/aaa-golden-order-world-rollout`
- Current branch head inspected before this increment: `edd7aba8860e614fc5508164707e463227b8df52`
- Current main: `f654176f94be5cd644dce28c53c61830494caa5c`
- Merge base: `ec6918c8204fd0ca3c5b9bad992851f23762f7e1`
- Divergence: 515 commits ahead / 183 commits behind.
- PR #171 remains open, unmerged, and non-mergeable.
- Exact-head `TryAMM Full CI` is attached and ran. Root platform checks passed; Omniverse app checks failed at `app-release-convergence-contract.mjs`.

## Exact failing convergence surface

The branch `App.tsx` contains foundation Stays/Agency/Family and Set Apart Passport wiring, but is missing the current-main mobile shell/HoloStyle behavior required by the convergence contract:

1. `minHeight: '100dvh'`
2. gameplay `100dvh` / auto height ownership
3. gameplay-only vertical overflow ownership
4. `shellAvailable = screen !== 'login'`
5. shell launcher/dialog availability outside login
6. HoloStyle lazy route
7. HoloStyle state
8. HoloStyle global launcher
9. HoloStyle Command Nexus launcher
10. HoloStyle rendered route / center mount

The foundation-only Stays/Agency/Family and Set Apart Passport routes must remain intact during reconciliation.

## Safe reconciliation rule

Do **not** replace `App.tsx` wholesale from main and do **not** broad-merge/rebase 183 main-only commits. Reconcile only the mobile shell + HoloStyle changes into the foundation `App.tsx`, preserving Stays/Agency/Family and Set Apart Passport behavior. Then require exact-head CI to pass the convergence contract before admitting another synchronization increment.

## Authority boundary

This synchronization work must not activate or move client-side authority for real payments, inventory, customs, settlements, payouts, or logistics. Those remain server-authoritative.
