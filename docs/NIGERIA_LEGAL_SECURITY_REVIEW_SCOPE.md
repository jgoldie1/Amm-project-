# Nigeria Legal and Independent Security Review Scope

## Legal review

A qualified Nigeria-focused lawyer or compliance firm must review the actual launch scope before production payments are enabled. The reviewer should provide a dated written opinion covering at minimum:

- TRYAMM, LLC's role: platform, marketplace operator, merchant, agent, or technology provider
- payment-provider contracts and prohibited uses
- consumer disclosures, refunds, chargebacks, complaints and dispute handling
- privacy notices, lawful processing, retention, cross-border transfers and incident notification
- youth accounts, age assurance, guardian controls and restricted content
- advertising, promotions, influencer disclosures and prize/lottery features
- creator and seller onboarding, KYC/KYB, sanctions and fraud escalation
- tax, invoicing and permanent-establishment risk
- digital goods, HoloCredits, promotional credits and withdrawal restrictions
- marketplace product restrictions, customs and cross-border trade
- employment, contractor and Middleverse Workforce rules
- music, film, likeness, university branding and user-generated-content rights
- required registrations, licenses, local representatives or partner arrangements

The legal reviewer must list assumptions, excluded services, jurisdictions covered, unresolved issues, launch conditions and renewal/review dates.

## Independent security review

The security reviewer must be independent from the person who implemented the payment system. Scope includes:

- Express API authentication and authorization
- administrator-role enforcement
- secret storage and rotation
- Paystack and Flutterwave signature validation
- raw-body/signature correctness
- provider transaction reverification
- amount, currency and reference matching
- duplicate webhook and replay protection
- idempotency for intents, ledger postings and payouts
- Supabase service-role isolation
- RLS and Data API exposure
- financial ledger balance and immutability controls
- refund, dispute and reversal state transitions
- settlement reconciliation
- logs, audit records and sensitive-data redaction
- rate limiting, abuse protection and denial-of-service resilience
- dependency and supply-chain review
- staging/production separation
- backup, restore and incident response

## Required evidence

The final release package must include:

- reviewer identity and organization
- independence statement
- scope and test dates
- environment and commit reviewed
- methodology
- findings with severity
- remediation evidence
- retest results
- residual risks
- formal recommendation: blocked, conditional pilot, limited launch, or production approved

A checklist completed by the TryAMM implementation team is not an independent approval.
