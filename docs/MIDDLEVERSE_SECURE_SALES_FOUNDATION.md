# MiddleVerse secure sales integration (review only)

This branch is deliberately separate from Quantum Cloud PR #707. Do not deploy until tests are passed.

## Required tables
Partner accounts linked to Supabase auth.users; private customer leads, referrals, verified Stripe orders, commission ledger, and deduplicated provider event receipts. RLS on all tables, owner-only agent reads, and no direct client writes to authoritative orders or commissions. Admin modifications must be server-authorized and audited.

## Integration stages
1. Supabase Auth/HoloID verified login and owner-controlled agent approval.
2. Consent-based, private lead records with referral codes scoped to approved agents.
3. Server-created Stripe Checkout sessions; bind an immutable referral ID to server metadata.
4. Signed Stripe webhook receipt and idempotent order transitions, with exact currency/amount validation.
5. Manual commission release only after payment, delivery, dispute/refund hold, and compliance review.
6. Quantum Cloud PR #707: separately verify cloud save + cross-device restore; never mix game reward/XP with financial settlement.

## Pilot rules
UK, Canada, Mexico, select African and Caribbean markets require local reviews. Russia remains a compliance hold. Proposed agent commission 15% of eligible net receipts, with an additional $50 TRYAMM internal reserve on qualifying sales; neither is automatically paid. No live checkout or partner accounts are activated by this file.

Local implementation package includes SQL and tested commission calculation. Review schema against current production tables and apply in staging first. Continue with role-isolation and webhook replay tests before merging.