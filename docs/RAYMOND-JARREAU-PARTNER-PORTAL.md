# Raymond Jarreau Partner Portal

## Purpose
Create a dedicated partner portal for Raymond Jarreau and future licensed/approved partners inside OmniCare 360 and TryAMM. The portal must not assume nationwide licensure. Every service is gated by verified credentials, jurisdiction, service type and current partner status.

## Core dashboard
- credential/licensure status by state/jurisdiction
- renewal and document reminders
- assigned OmniCare cases and referral queue
- AI call center/workstation queue
- appointment/referral follow-up tasks
- provider/agent availability
- secure document requests
- notes and case summaries
- transport-to-care coordination
- approved payment/invoice/payout status
- audit/security alerts
- partner performance and service metrics

## Partner profile
Store:
- legal/business name
- contact details
- role/service domains
- states/jurisdictions served
- license/certification references
- issuing authority
- verification status
- effective/expiration dates
- insurance/bonding where applicable
- languages
- accessibility capabilities
- hours/availability
- payout/business settings

Sensitive credential files remain in private storage. Public-facing pages show only approved verification summaries.

## Access roles
Raymond may hold a Partner Admin role for his organization. He can invite staff and assign least-privilege roles such as Intake Agent, Care Coordinator, Scheduler, Licensed Agent/Provider, Supervisor and Billing/Operations. TryAMM admin/security retains the ability to suspend access, revoke sessions and disable jurisdictions.

## Workflow
OmniCare user -> consent/intake -> AI navigation -> eligibility/jurisdiction routing -> Raymond Partner Portal queue when appropriate -> licensed/authorized human action -> appointment/referral/service -> follow-up -> audit trail.

## Call center integration
Raymond's organization can receive approved calls/chats from the AI Call Center. Stubbs AI may summarize, translate, prepare scripts and suggest next actions. A human takes over for regulated decisions, binding advice or high-risk cases. Calls/records follow consent, retention and applicable recording rules.

## Business onboarding
The portal can onboard additional approved partners, but no one becomes active solely because they uploaded a document. Required verification steps include identity/business verification, credential review, jurisdiction mapping, agreements, payment/payout setup, training, security/MFA and final activation.

## Revenue and payments
Use configurable service/revenue rules rather than a universal split. Support lawful platform fees, service fees, subscriptions, call-center/operations charges and partner payouts. Jinn/PayRouter may orchestrate approved payments, but accounting must distinguish customer funds, partner payables, taxes, processor fees and TryAMM revenue.

## Compliance gates
Disable a service when credentials are missing, expired, unverified or not valid for the requested jurisdiction/service. Never represent Raymond or another partner as licensed nationwide unless current authoritative verification supports that claim.

## Security
Require MFA/passkeys for privileged users, device/session controls, audit logs, least-privilege RBAC, step-up auth for payout/bank changes, private documents, export controls and Jacobie Cybersecurity alerts.

## Portal pages
1. Overview
2. Credentials & Jurisdictions
3. Referral/Case Queue
4. Call Center
5. Appointments & Follow-up
6. Partner/Staff Directory
7. Documents
8. Billing & Payouts
9. Reports
10. Security & Audit
11. Settings

## Production blockers
Do not mark the portal production-ready until real authentication/RBAC, durable data, credential verification workflow, private storage, consent/privacy controls, partner agreements, jurisdiction rules, payment/payout reconciliation, audit logging, staging tests and required legal/compliance review are complete.
