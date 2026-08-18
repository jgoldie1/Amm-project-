# TRYAMM Launch Readiness

This document is the evidence-based source of truth for readiness. Do not infer readiness from old filenames containing COMPLETE, FINAL, MVP or LAUNCH.

| Capability | Internal target | External gate before LIVE |
|---|---|---|
| Canonical UX | TESTED | none beyond deployment QA |
| Unified account/profile | TESTED | production auth configuration |
| Passport achievements | TESTED | none for TRYAMM-issued achievements |
| Algorithm Studio | TESTED | real-data tuning after launch |
| Creator Project/Studio | TESTED | production storage/media capacity |
| Rights/splits | TESTED | contract/legal review for production terms |
| Money Engine ledger | TESTED | production accounting/reconciliation signoff |
| Checkout | TESTED in sandbox | payment-provider production activation |
| Creator payouts | TESTED in sandbox | Connect/KYC/tax/fraud/provider activation |
| Wallet UI | TESTED | regulated rails only for real funds/card functions |
| Reels/social | TESTED | production storage/moderation capacity |
| LIVE/PK | TESTED against adapter | production realtime/video provider and load test |
| Games/player state | TESTED | production multiplayer/load infrastructure where required |
| Prize tournaments | TESTED with non-cash/demo prizes | official rules/legal/geographic/store gates for real money |
| Mobile/PWA | TESTED packages | Apple/Google review for store distribution |
| Music distribution | TESTED export/delivery adapter | DSP/distributor/licensing agreements |
| Government credential display | TESTED adapter | approved issuer/verifier integration |
| Tap/card | TESTED adapter/UI | approved processor/issuing program |

## Definition of TESTED
- build/typecheck passes;
- authorization/RLS behavior verified where applicable;
- happy path and failure paths exercised;
- persistent state verified;
- observability exists;
- no production secret embedded in client code;
- documentation matches behavior.

## Definition of PRODUCTION-READY
TESTED plus production configuration, security/performance review, monitoring, backups/recovery, support path and all applicable external gates satisfied.

## Definition of LIVE
PRODUCTION-READY and intentionally enabled in production with post-deploy verification.
