# OmniCare 360 Production Readiness

OmniCare 360 is a care-navigation and coordination layer. TryAMM must not present itself as a licensed medical, pharmacy, behavioral-health, insurance, or home-care provider unless the applicable entity and service are actually licensed in the relevant jurisdiction.

## Core user journeys
- care-navigation intake and AI summary;
- provider/partner matching;
- appointment coordination;
- benefits and insurance-document navigation;
- medication/pharmacy navigation through licensed partners;
- behavioral-health navigation through licensed providers;
- home-care and caregiver coordination through appropriately licensed/qualified partners;
- HoloRide transport-to-care requests;
- multilingual and accessibility support;
- AI call-center triage with human escalation.

## HoloGPT boundaries
Allowed: intake summarization, reminders, translation, accessibility assistance, document organization, appointment preparation, routing, FAQ/support, and non-clinical administrative assistance.

Not allowed without licensed clinical workflow: independent diagnosis, prescribing, changing medication/treatment, making emergency clinical decisions, or representing AI output as a licensed professional's judgment.

## Production gates
1. TryAMM Passport/Auth with role-based access and MFA for sensitive roles.
2. Durable encrypted database and private object storage; no health/identity documents in public folders or ordinary logs.
3. Jurisdiction-by-jurisdiction privacy/security review, including HIPAA applicability in the U.S. and equivalent local requirements elsewhere.
4. Business associate/vendor agreements where required.
5. Licensed-provider and partner credential verification with expiration monitoring.
6. Consent, privacy notices, data-minimization, retention/deletion, access logs and breach-response procedures.
7. Scheduling/provider-directory adapters and verified contact data.
8. Insurance/benefit integrations only through authorized data sources and user consent.
9. Pharmacy/e-prescribing functions only through licensed/approved partners; no direct prescribing by HoloGPT.
10. Emergency escalation: clearly direct emergencies to appropriate local emergency services and never rely only on AI.
11. AI call-center QA, human escalation, multilingual support and accessibility.
12. HoloRide transport integration with privacy-minimized destination sharing and appropriate non-emergency medical transportation rules where applicable.
13. Payments/claims/benefits flows must use properly licensed/authorized processors and partners.
14. Auditability: every sensitive access, routing decision, partner handoff and material AI action logged with least-privilege access.
15. End-to-end security, privacy, accessibility and incident-response testing before public production claims.

## Partner-first pathway
Launch administrative navigation and scheduling with licensed/authorized partners first. Expand into regulated services only when the required entity, professional, contract, credential, insurance and jurisdictional approvals are in place.

## Revenue pathways
Potential models include employer/community navigation programs, white-label care coordination, AI call-center services, subscriptions for non-clinical navigation, and contract/referral/service revenue where lawful and transparently disclosed. Avoid incentives that improperly influence clinical referrals or conflict with healthcare fraud-and-abuse rules.

## Current repository status
The connected repository contains an OmniCare 360 manifest, public informational hub, in-memory case/navigation manager, protected API routes, appointment/transport coordination records and audit hooks. It does not yet contain production authentication, encrypted durable health-data storage, licensed-provider integrations, EHR/claims/pharmacy connectivity, or validated clinical operations.
