# Money Engine Integration

Money Engine is TRYAMM's accounting authority.

## Ledger classes
Settlement cash; platform revenue; creator/master/publishing/collaborator payables; prizes; taxes; refund/chargeback reserves; sponsor-restricted funds; charity/legacy/ministry allocations; processing fees; operating reserves.

## Posting
Every posted journal balances. Use integer minor units and deterministic basis-point allocation. Store external provider/event references and idempotency keys.

## Earnings lifecycle
earned → pending settlement → cleared → payable → payout eligible → sent → paid.
Additional states include held, reversed, refunded, disputed, failed and returned.

## Integration flow
Checkout/payment confirmation → verified server webhook → balanced journal → rights/split fan-out → restricted allocations → creator earnings → settlement/reconciliation → payout eligibility → approved payout rail.

## Launch gates
Keep real payouts OFF until identity/tax onboarding, payment-provider Connect configuration, webhook signature verification, fraud controls, reconciliation, refund/dispute handling and applicable legal/accounting/store reviews are complete.
