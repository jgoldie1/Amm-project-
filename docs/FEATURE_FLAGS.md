# TRYAMM Feature Flags and Launch Gates

## Release stages
`demo` → `internal` → `alpha` → `beta` → `public`

Every major subsystem declares a release stage independently.

## High-risk capability switches
Default OFF in every new environment:
- `REAL_MONEY`
- `REAL_PAYOUTS`
- `PAID_PRIZE_COMPETITIONS`
- `EXTERNAL_DISTRIBUTION`
- `GOVERNMENT_ID_INTEGRATION`
- `CARD_ISSUING`
- `TAP_TO_PAY`
- `CROSS_BORDER_TRANSFERS`
- `HEALTHCARE_REGULATED_DATA`

## Rule
UI visibility does not imply activation. A capability may be demonstrated with mock/sandbox data while its production switch remains OFF.

## Required gate record
Each high-risk switch must have:
1. technical owner;
2. environment;
3. automated test status;
4. security review status;
5. provider production readiness;
6. legal/compliance approval where applicable;
7. monitoring/reconciliation readiness;
8. rollback procedure;
9. explicit activation approval and timestamp.

## Money-specific activation
REAL_MONEY requires verified server-side payment processing, signed/idempotent webhook handling, ledger reconciliation, refund/dispute handling and monitoring.

REAL_PAYOUTS additionally requires connected-recipient onboarding, transfer capability checks, tax/KYC requirements, payout holds/reversals, fraud controls and reconciliation.

PAID_PRIZE_COMPETITIONS additionally requires official rules, eligibility/geography controls, age controls, applicable legal review and app-store policy compliance.

## Identity/card activation
Government ID integrations must clearly identify the external issuer. TRYAMM Passport is never a government passport. Card issuing and tap-to-pay require approved financial/payment programs.
