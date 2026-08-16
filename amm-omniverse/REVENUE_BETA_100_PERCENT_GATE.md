# TryAMM Revenue Beta — 100% Acceptance Gate

Status: IN PROGRESS

This document defines what “100% complete” means for the first public money-making software release. It does not claim that later physical hardware, vehicles, factories, satellites, advanced holographic hardware, or the entire long-term Omniverse roadmap are complete.

## Release rule
No item is marked complete because a UI mock or placeholder exists. Provider-dependent functions must be configured and exercised in the target environment. Real-money flows require test-mode verification before live mode.

## 25 release gates

### Money and commerce
- [ ] 01 Stripe server SDK/configuration and environment validation
- [ ] 02 Authenticated Checkout Session creation with server-owned prices
- [ ] 03 Signed Stripe webhook endpoint with idempotent event processing
- [ ] 04 Orders + line items persisted in Supabase
- [ ] 05 OmniCash double-entry ledger; immutable balanced journal entries
- [ ] 06 Creator/platform revenue allocation accounting
- [ ] 07 Refund/reversal/dispute accounting without deleting history
- [ ] 08 Customer receipts/order history
- [ ] 09 Creator earnings dashboard + payout-status accounting
- [ ] 10 Marketplace checkout uses the common commerce core
- [ ] 11 LIVE gifts use the common commerce core
- [ ] 12 Subscription membership lifecycle and entitlement sync
- [ ] 13 PPV/Isaiah AI TV entitlement checks

### Media and creators
- [ ] 14 LIVE recording/egress provider configured and tested
- [ ] 15 Private replay storage + signed playback access
- [ ] 16 LIVE-to-Isaiah-TV replay/catalog publishing workflow
- [ ] 17 Creator profile/follow/subscribe/storefront workflow
- [ ] 18 Clip/podcast/replay metadata pipeline

### Realtime, safety, accessibility
- [ ] 19 Shared-state multiplayer verified with two or more real sessions/devices, including reconnect
- [ ] 20 Report/block/moderation and teen/adult boundaries verified
- [ ] 21 Keyboard, screen reader, captions, one-hand/switch and reduced-motion acceptance pass

### Production hardening
- [ ] 22 Supabase migrations/RLS/security audit; no client authority over price, ledger, payout or entitlement grants
- [ ] 23 Mobile/PWA/desktop/TV-cast/controller smoke matrix
- [ ] 24 Observability, error reporting, backups/recovery and rate-limit/abuse controls
- [ ] 25 Production acceptance: clean build, automated checks, test payment + refund, LIVE + replay, entitlement denial/allow, multi-device session, rollback procedure

## Required transaction invariant
Every completed paid action must be traceable:

customer -> Stripe object -> webhook event -> TryAMM order -> balanced OmniCash journal -> entitlement/fulfillment -> creator/platform allocation -> receipt

A refund or dispute creates compensating journal entries. Historical financial rows are never silently rewritten or deleted.

## Release stages
1. Closed Beta: test accounts, Stripe test mode, controlled creators.
2. Revenue Beta: invited real users; live payments only after all money/security gates pass.
3. Public v1: all 25 gates pass and production acceptance is recorded.

## Explicitly later than public v1
Physical Volcano/Omni Box/Quantum Beat hardware manufacturing, physical Holo devices, vehicles/flying vehicles, battery manufacturing, factories, satellites, full-scale AAA games and other capital-intensive Omniverse programs are separate product programs and do not block the first TryAMM public software release.
