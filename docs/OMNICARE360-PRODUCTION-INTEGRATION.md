# OmniCare 360 Production Integration

OmniCare 360 remains the existing TryAMM care-navigation and support vertical. This production pass upgrades it onto the shared TryAMM backbone rather than creating a second health product.

## Shared platform wiring
- Wallet Passport ID: identity, consent, roles and account recovery.
- Stubbs AI / HoloGPT: navigation, summarization, education, translation and workflow assistance only within approved scopes.
- AI Call Center + Workstations: intake, scheduling, benefits navigation, reminders and human escalation.
- Jacobie Cybersecurity: identity protection, audit, anomaly detection, access reviews and incident response.
- Jinn / PayRouter: only for approved non-emergency payments through configured providers; never used to imply insurance coverage or clinical eligibility.
- HoloRide / partner transport: transport-to-care requests with jurisdiction/provider gates.
- HoloAccess / HoloLingo: accessibility and multilingual support.
- Founder Control Tower: operational health, queues, incidents, partner readiness and country/state gating.

## Production data model
Use durable Supabase/Postgres tables for cases, events, appointments, transport requests, secure-document metadata and licensed-partner routing. RLS must ensure users see only authorized records. Staff/provider access must be role- and relationship-based, audited and minimum-necessary.

## Consent and privacy
Before sensitive workflows, capture a consent snapshot containing purpose, data categories, allowed recipients, duration/revocation rules and jurisdictional notices. Store large/sensitive documents in private object storage with short-lived signed access rather than public URLs.

## Regulated-service gates
Each service domain must be enabled only when the required partner/licensure configuration is verified for that jurisdiction. Telehealth, prescribing, pharmacy, home care, insurance brokerage/advice and other regulated activities remain disabled when requirements are unmet.

## AI boundaries
AI may summarize intake, organize documents, explain general information in plain language, translate, prepare appointment questions, issue reminders and route to approved partners. AI must not independently provide final diagnosis, prescribe, make emergency decisions, alter treatment, guarantee insurance coverage or determine licensure.

## Escalation
Urgent/emergency signals must trigger a clearly defined human/emergency escalation workflow. The platform must never present AI as the sole responder for emergencies.

## Call-center workflow
Wallet Passport -> consent -> AI intake -> human workstation when needed -> licensed/approved partner routing -> appointment/benefits/transport workflow -> follow-up tasks -> audit trail.

## Founder Control Tower metrics
- open cases by urgency/status
- cases awaiting human escalation
- partner/licensure readiness by jurisdiction
- appointment backlog and completion
- transport requests and failures
- call-center queue/service level
- privacy/security incidents
- AI escalations and blocked actions
- payment/claim-related support events (not presented as coverage guarantees)
- system/provider outages

## Release blockers
Do not call OmniCare 360 production-ready until durable storage, RLS/RBAC, consent capture, private document storage, encryption/key management, partner credential verification, emergency escalation, logging/monitoring, backup/restore tests, access reviews, staging validation and required legal/privacy/compliance review are complete.
