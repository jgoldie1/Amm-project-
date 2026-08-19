# Regulated Partner + Registrar/Reseller Onboarding

Status: REQUIRED EXTERNAL-PARTNER PATHWAY

## Partner types
- licensed telehealth
- Medicaid billing / revenue-cycle partner
- legal / lawyer-on-demand
- tax / PTIN/EA/CPA/attorney partner as applicable
- insurance producer/agency partner
- real-estate brokerage/agent partner
- remote notary partner where permitted
- domain registrar / ICANN-accredited registrar reseller

TRYAMM is the technology, discovery, workflow, scheduling, communication, checkout, document-preparation and referral/marketplace layer unless separately licensed. Professional judgment, diagnosis, representation, prescribing, regulated billing, tax signing, insurance placement, real-estate brokerage and notarization remain with appropriately authorized professionals/providers.

## Common onboarding workflow
LEAD → APPLICATION → IDENTITY/BUSINESS VERIFICATION → LICENSE/ACCREDITATION CHECK → JURISDICTIONS → INSURANCE/COMPLIANCE DOCUMENTS → COMMERCIAL TERMS → SECURITY/API REVIEW → SANDBOX → TEST TRANSACTION/CASE → APPROVAL → LIVE → PERIODIC REVERIFICATION.

## Telehealth
Verify clinician/entity licensure by jurisdiction, malpractice coverage where applicable, privacy/security obligations, prescribing scope, emergency/escalation workflow, patient consent, records handling, billing pathway and telehealth-specific rules. TRYAMM must not represent unverified providers as licensed.

## Medicaid billing
Partner must establish payer enrollment/credentialing and billing authority for the applicable provider/program. Store payer/provider identifiers and billing permissions only in restricted data. Claims should require documented service, qualified rendering provider, code validation, eligibility checks, audit trail and fraud/waste/abuse controls. TRYAMM does not bill Medicaid for unqualified services or users merely because they have Medicaid.

## Legal / Lawyer-on-Demand
Attorney profile requires bar/jurisdiction verification, practice areas, availability, conflicts workflow, engagement terms, fee model and emergency disclaimer. Traffic-stop pathway can offer immediate legal-information/navigation and connection to available counsel, but does not impersonate counsel or interfere with law enforcement.

## Tax
Tax-preparer marketplace records PTIN/credential status where applicable, service scope, jurisdictions, engagement terms, secure document flow and e-signature path. Federal/state filing occurs through authorized preparers/software/providers. PTIN fees and rules must be sourced from current IRS information at onboarding time rather than hard-coded indefinitely.

## Insurance
Verify producer/agency license and appointment/carrier requirements. TRYAMM can collect preferences and route quotes, but coverage is not bound until the authorized insurance partner confirms it.

## Realty
Verify brokerage/agent licensing and relationship. Property search, scheduling, document preparation and AI assistance may be platform features; regulated brokerage representations and trust/escrow activity remain with licensed participants.

## Remote notary
Enable only in jurisdictions and transaction types where remote online notarization is permitted and the provider satisfies identity-proofing, audiovisual-recording, journal, seal/certificate and retention requirements.

## Registrar/reseller
Low-capital path:
1. Integrate with an ICANN-accredited registrar or reputable reseller/API provider.
2. TRYAMM handles search, checkout, DNS UI, renewal reserve, reminders and customer support layer.
3. Registrar remains system-of-record for registration/registry interaction until TRYAMM separately becomes accredited.
4. Surface true registration/renewal/transfer prices and registry restrictions per TLD.
5. Support registrant ownership/transfer-out and DNS export.
6. Maintain webhook/event handling for registration, renewal, expiration, transfer and contact-verification events.
7. Run sandbox/test-domain flow before enabling customer purchases.

## Commercial models
Allowed examples subject to law/partner contract:
- fixed platform subscription
- per-lead/per-booking fee where lawful
- SaaS/workflow fee
- payment-processing/platform fee through approved providers
- marketing/advertising fee
- registrar/reseller markup or revenue share
- employer/institution contract

Do not use fee-sharing structures prohibited for lawyers, healthcare referrals, insurance, real-estate or other regulated professions. The revenue engine must support partner-type-specific commercial rules rather than one universal commission percentage.

## Launch gate
A partner is LIVE only when verification evidence, contract, jurisdictions, technical integration, sandbox test, security review and monitoring/renewal dates are recorded. Otherwise status remains APPLICATION / VERIFICATION / CONTRACTING / SANDBOX.
