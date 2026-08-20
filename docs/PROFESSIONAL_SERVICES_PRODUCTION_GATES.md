# Professional Services Production Gates

Status: REQUIRED BEFORE TELE-LAW / TELE-HEALTH / TELE-TAX / TELE-INSURANCE / TELE-REALTY / REMOTE NOTARY GO LIVE

## Core booking sequence
LOCATION → RELEVANT JURISDICTION → PROFESSIONAL CREDENTIAL VERIFICATION → AVAILABILITY → LANGUAGE → INTERPRETER/SIGN-LANGUAGE AVAILABILITY IF NEEDED → ACCESSIBILITY REQUIREMENTS → PRICE → SECURE SESSION → HUMAN CONFIRMATION/BOOKING.

A provider is not shown as `READY TO BOOK` for a regulated service unless every mandatory gate passes.

## Gate 1 — Location and jurisdiction
- Resolve the user's selected service location and the jurisdiction relevant to the professional service.
- Never assume device GPS alone establishes legal jurisdiction.
- Store jurisdiction basis and verification timestamp.
- For cross-border matters, route to `VERIFY JURISDICTION` rather than guessing.

## Gate 2 — Credential verification
- Verify current professional credential against an authoritative source or approved verification partner where available.
- Store credential type, jurisdiction, masked identifier, verification source/date and expiration.
- Expired/unverified credentials cannot produce a `READY TO BOOK` match.
- Marketplace identity verification is not a substitute for professional licensure.

## Gate 3 — Availability
- Use actual provider availability, not generic "online now" badges.
- Support scheduled and on-demand queues.
- Urgent legal/medical needs must distinguish ordinary booking from emergencies/crisis situations.

## Gate 4 — Language and communication
Correct pipeline:
`NATIVE UI → MACHINE TRANSLATION (ASSISTIVE) → CAPTIONS → QUALIFIED HUMAN INTERPRETER WHEN REQUIRED → SIGN-LANGUAGE PROVIDER/INTEGRATION WHEN REQUESTED`.

Rules:
- Native/localized UI is the first layer.
- Machine translation assists navigation and ordinary communication but is not represented as a certified interpreter.
- Automatic captions are assistive and may be inaccurate.
- Consequential legal/medical/tax/insurance communications can require a qualified human interpreter depending on context and jurisdiction.
- Sign-language access uses qualified provider/integration pathways where required or requested; do not claim automatic sign-language translation is perfect.
- User communication preferences come from Accessibility Passport only with permission.

## Gate 5 — Accessibility
Before booking, users can request: captions, interpreter, sign-language provider, screen-reader compatible documents, larger text, one-handed controls, alternate communication, extra processing time where appropriate, or other functional accommodations.

Accessibility preferences must not lower provider ranking except when the provider cannot satisfy a user-selected requirement.

## Gate 6 — Price and fee transparency
Display separately:
- professional/provider fee
- TRYAMM platform/service fee
- interpreter/captioning fee if any
- taxes/government fees where applicable
- estimated total

Do not fee-share with lawyers, physicians, insurance producers, real-estate licensees, tax professionals or other regulated professionals where prohibited. Use jurisdiction-specific marketplace/referral/platform pricing rules.

## Gate 7 — Secure session
Regulated sessions require an approved secure-session path appropriate to the service. Requirements can include encrypted transport, access control, session identity, consent, retention controls, document privacy and audit events. Do not route regulated confidential work through ordinary public LIVE rooms.

## Gate 8 — Documentation and consent
Capture appropriate consent, terms, conflict disclosures where applicable, professional engagement terms, interpreter acknowledgement where needed, privacy notices and records required by the provider/jurisdiction.

## Tele-law emergency/police-stop pathway
`I AM BEING PULLED OVER / I NEED A LAWYER NOW` can open a safety-first screen that:
1. tells the user not to interact with the app while driving;
2. allows hands-free/basic safe routing when lawful and technically available;
3. captures location/jurisdiction only when safe/authorized;
4. matches verified attorneys for the jurisdiction and service category;
5. shows availability/language/interpreter/price;
6. starts a secure consultation only after acceptance.

TRYAMM/JARVIS does not instruct users to resist police, conceal evidence or interfere with lawful commands. Emergency danger routes to appropriate emergency/public services.

## Related verticals
The same gated matcher supports tele-health, tele-tax/bookkeeping, tele-insurance, tele-realty, remote notarization where permitted, tutoring, interpreting/sign-language services, HR/recruiting, technical/cybersecurity support, and non-medical beauty consultations. Each vertical has its own credential/jurisdiction policy.

## Medicaid / insurance billing boundary
TRYAMM may support workflow/software for eligible qualified providers only after payer enrollment, coding/billing rules, privacy/security requirements and provider eligibility are verified. Claims must be submitted under properly enrolled/authorized providers/entities. The platform must not bill Medicaid merely because a service exists in TRYAMM.

## Production readiness score
A vertical cannot move to LIVE until all mandatory categories are evidenced:
1. provider verification;
2. jurisdiction rules;
3. secure communications/data handling;
4. pricing/payment/legal model;
5. accessibility/language/interpreter flow;
6. complaint/dispute/escalation;
7. audit/monitoring;
8. provider terms and insurance/compliance as applicable;
9. end-to-end test evidence;
10. external approvals/contracts where required.

Status remains `GATED` until evidence exists.

## Goal
Make professional services more reliable, understandable and accessible by reducing the distance between `I need help` and a verified qualified human, while keeping AI in a navigation/preparation role and professionals responsible for regulated advice and services.
