# Omniverse After Dark — Haptics + Money Engine

Status: DEVELOPMENT SPECIFICATION

This extends TRYAMM's locked architecture without creating a disconnected payment system.

## Boundary and safety

Omniverse After Dark is an adult-only lane. Access requires an 18+ gate appropriate to territory and product policy. Haptic/intimate-device integrations require explicit per-session consent and remain disabled for minors.

Device commands must pass through a Haptic Permission Broker. Creators, viewers, games, AI agents, and rooms do not receive unrestricted hardware control.

Required controls:
- explicit opt-in and session expiration
- user-owned intensity ceiling
- instant stop / disconnect
- block/report and revocation
- territory/provider feature flags
- minimal telemetry retention
- intimate-device telemetry excluded from advertising profiles
- audit events for consent and command authorization without storing unnecessary intimate content

## Device architecture

AFTER DARK → AGE/TERRITORY GATE → CONSENT GATE → HAPTIC PERMISSION BROKER → DEVICE ADAPTER → USER DEVICE

Adapters may include a Lovense-compatible integration where its API, platform rules, user authorization, and applicable law permit it, plus generic supported wearable/haptic adapters.

The reusable haptic engine may also support non-adult experiences such as racing feedback, music/bass feedback, accessibility cues, training, sports, concerts, VR/AR/MR, and OmniWear.

## Payment authority

All After Dark revenue uses the existing TRYAMM Money Engine. The browser/client never calculates an authoritative payout.

PURCHASE → PAYMENT PROVIDER → SERVER WEBHOOK VERIFICATION → GROSS RECEIPT → FEES/TAX/REFUND RESERVE → ELIGIBLE NET REVENUE → VERSIONED RIGHTS/SPLIT CONTRACT → DOUBLE-ENTRY LEDGER → PAYABLE BALANCES → KYC/TAX/PAYOUT GATE → SETTLEMENT.

Each economic event has one immutable transaction/event ID and one authoritative settlement record. Retried webhooks must be idempotent.

## Split contract

Do not hard-code one percentage for every product. Each product/event references a versioned SplitContract containing:
- effective date/version
- revenue lane and product/event ID
- gross amount definition
- taxes and payment-processing treatment
- refund/dispute reserve policy
- platform share
- creator/host share
- collaborator/agency/rights-owner shares when applicable
- designated restricted allocations when applicable
- rounding/remainder rule
- territory/currency
- signatures/acceptance and audit metadata

Changing a split creates a new version and never rewrites historical settlements.

Invariant: all allocated basis points for the applicable distribution base must total 10,000 (100%).

## Recommended revenue lanes

Keep independent split contracts for subscriptions, tickets/PPV, gifts/tips, premium rooms, marketplace merchandise, sponsorship/advertising, licensing/royalties, and eligible designated events. This allows economics to change by lane without corrupting historical accounting.

Designated event allocations already present in TRYAMM policy direction — including 20% Kenosha Legacy and 10% ministry allocations — apply only when the event is explicitly configured as eligible. They are not silently deducted from unrelated creator earnings.

## Ledger accounts

Use the canonical accounts: settlement cash, platform revenue, creator payable, collaborator payable, master payable, publishing payable, processing fees, tax payable, refund reserve, sponsor restricted, charity restricted, Kenosha Legacy restricted, ministry restricted, prize liabilities, and operating reserve.

For every posted transaction: total debits = total credits.

## Earnings states

pending settlement → cleared → held/payable → sent → paid/reversed

The All American Wallet displays balances and history; the Money Engine remains accounting authority. Promotional/game credits must never appear withdrawable.

## Payout gate

Real payouts remain disabled until identity/KYC, tax onboarding, payment-provider/Stripe Connect onboarding where used, verified webhooks, fraud controls, reconciliation, refunds/disputes, sanctions/territory/provider requirements, and applicable legal/accounting review pass release gates.

## What this creates

This architecture turns After Dark from a standalone feature into another governed TRYAMM commerce lane. A purchase can automatically preserve creator and rights-owner obligations, platform revenue, reserves, restricted allocations, and payout state while producing an auditable ledger trail. It also lets the same economic engine serve LIVE, Omni Box, Marketplace, music, games, sponsorships, and other TRYAMM products without maintaining incompatible payout systems.
