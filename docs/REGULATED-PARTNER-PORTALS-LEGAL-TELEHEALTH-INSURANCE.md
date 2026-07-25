# TryAMM Regulated Partner Portals

## Purpose
Provide separate portals for licensed professionals and organizations while TryAMM remains the technology, marketplace, call-center, scheduling, accessibility, security and payment-orchestration platform.

## Initial portals
- Raymond Jarreau Partner Portal
- Telehealth Provider Portal
- Lawyer / Law Firm Portal
- Auto Insurance Producer / Agency Portal
- Benefits and Care Navigation Portal

## License-first activation
Each professional submits license/credential number, issuing authority, jurisdiction, legal name, organization, expiration date, service categories and supporting documents. Status values: draft, submitted, pending-review, verified, rejected, expired, suspended.

No regulated service is published until the relevant credential and jurisdiction are verified. A credential in one state or profession does not imply nationwide authority.

## User-facing flow
1. User selects service and location.
2. Wallet Passport confirms identity and captures consent.
3. Platform checks jurisdiction, service type and verified partner capability.
4. AI/call-center may collect non-clinical or non-legal intake and route the request.
5. Licensed professional accepts the matter/case/appointment.
6. Professional service is delivered under that professional or organization's responsibility.
7. Payments, receipts, records and follow-up are separated according to the approved fee model.

## Payment model
TryAMM may charge separately disclosed and contractually approved fees for software subscriptions, portal seats, advertising, scheduling, call-center services, translation, accessibility tools, payment processing, document workflow, analytics, white-label deployment and other administrative technology services where lawful.

Professional fees are not automatically shared with TryAMM. Legal, medical and insurance compensation rules vary by jurisdiction and must be configured separately. The ledger must classify professional-service revenue, platform revenue, processor fees, taxes, refunds, reserves and partner payables separately.

## Raymond portal
Raymond can review the app first, then submit license details and organization information. Until verified, his portal remains demo/onboarding-only. After verification, only authorized services and jurisdictions activate. Raymond can invite staff with roles such as intake, scheduler, supervisor, billing, licensed professional and compliance reviewer.

## Telehealth portal
Capabilities: provider profile, license jurisdictions, NPI and payer-enrollment references where applicable, appointment calendar, consent, private video/audio handoff, secure messaging, care-navigation cases, documents, referrals, transport, follow-up, billing references and audit logs.

Clinical diagnosis, prescribing, treatment decisions and emergency decisions remain with appropriately licensed clinicians. Use HIPAA-appropriate vendors and business associate agreements where required. Country/state launch gates control licensure, consent, prescribing, malpractice, privacy and billing.

## Legal portal
Capabilities: lawyer/law-firm profiles, bar jurisdictions, practice areas, consultation scheduling, intake, conflicts-check workflow, engagement-letter workflow, secure documents, messaging, matter status, invoices and client trust-account references where applicable.

TryAMM does not practice law. AI may provide intake summaries, document organization and general educational information, but legal advice and representation remain with licensed lawyers. Nonlawyer fee-sharing and referral/advertising rules are jurisdiction-specific and must be reviewed before activation.

## Auto insurance portal
Capabilities: licensed producer/agency profiles, states and lines of authority, quote-request intake, carrier/agency integrations, policy-document workflow, renewal reminders, claims-navigation links, call-center support and compliant advertising disclosures.

TryAMM does not bind, underwrite, sell or advise on insurance unless the responsible licensed entity and approved carrier/agency workflow authorizes it. Compensation, referral and lead-generation rules must be configured by state and carrier agreement.

## Frontend
- Partner onboarding wizard
- Credential submission and verification status
- Jurisdiction/service matrix
- Staff invitations and RBAC
- Cases/leads/appointments queue
- Secure document inbox
- AI/call-center handoff
- Billing/payout/fee statements
- Compliance alerts and renewals
- Audit and security activity
- Founder Control Tower status

## Backend
- regulated_partner_organizations
- regulated_partner_members
- professional_credentials
- partner_service_authorizations
- partner_cases
- partner_appointments
- partner_documents
- partner_consents
- partner_fee_schedules
- partner_financial_events
- partner_audit_events

## Security
Passkeys/MFA for sensitive roles, step-up authentication for payout or credential changes, encrypted storage, minimum-necessary access, consent records, immutable audit events, tenant isolation, retention/deletion rules, incident response and emergency feature disable controls.

## Release blockers
Do not mark any portal production-ready until credentials are verified, contracts are signed, fee structures are reviewed for the launch jurisdiction, privacy/security requirements are satisfied, payment flows reconcile, staff roles are tested and staging validation passes.
