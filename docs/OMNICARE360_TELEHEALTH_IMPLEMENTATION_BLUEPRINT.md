# OmniCare360 — Telehealth implementation and procurement checklist
Date: 2026-11-18. STATUS: design and guardrails only. No clinical features authorized; do not enter PHI into TRYAMM.

## Current code and responsibilities
- AI Commons opens a nonclinical OmniCare360 information view.
- `lib/omnicare360-telehealth-gates.js` keeps clinical actions disabled and defines 17 evidence gates.
- `lib/omnicare360-integration-contracts.js` holds provider credential, vendor diligence, directory approval and data isolation contracts. It does not store real provider or patient details.
- `lib/tryamm-compliance-policy.js` rejects clinical tasks, legal representation and live trading.
- Patient records, video, appointments, provider credentials, agreements and clinical identity must be implemented inside an isolated, audited provider-controlled service rather than the current generic JSON datastore or general-game React frontend.

## What must be acquired, implemented, and verified
| Workstream | Deliverable | Approval/evidence owner |
| --- | --- | --- |
| Operating model | Written determination whether TRYAMM is a covered entity, business associate, subcontractor or nonclinical referral service; state-specific privacy analysis | Qualified counsel |
| Clinical operator | Partner agreement with an eligible provider organization, state licensing/credentials checks, malpractice insurance, clinical escalation policies | Clinical director and counsel |
| Vendor/BAA | Inventory of cloud, video, EHR, booking, analytics, support, AI, transcription, messaging providers; legal BAA determination and executed documents as required | Privacy officer and counsel |
| Identity | Isolated patient/clinician authentication, MFA, guardian/age policy, least privilege, session expiration, admin impersonation control, identity proofing and access reviews | Security lead |
| Consent | Approved privacy notice and telehealth informed consent, recording restrictions, location verification, minors/guardian rules, date/versioned evidence in clinical system | Clinical operator |
| Scheduling | Secure provider calendar, time zones, availability locks, cancellations, waitlist, reminders without clinical details, audit and idempotency | Provider scheduling partner |
| Video/audio | Private rooms with scoped short-lived server-issued grants, approved vendor account/BAA, no public streams/recordings, access revocation, captions/audio-only, network tests | Video vendor and security |
| EHR | Patient records hosted by authorized clinical EHR, FHIR/HL7 integration if supported, audit, right-of-access handling, no PHI in Mycelium, game analytics or AI context | Clinical partner |
| Clinical workflow | Clinician-patient relationship, triage policy, prescriptions only by legally authorized clinicians, emergencies, follow-ups, claims/billing and state rules | Clinical director |
| Security | Risk analysis, pen test, access log review, patch SLA, key management, backups/restore, incident response, breach handling, evidence retention | Security and privacy officers |
| Accessibility | One-handed and keyboard workflows, screen readers, captions, voice/audio-only, contrast, mobile bandwidth, language access | Accessibility testers |
| Operations | Support, outage escalation, business continuity, clinical transfer, policies and workforce training | Clinical operator |
| Go-live | Independent counsel + privacy + security + clinical + executive approvals with signed evidence | Human release board |

## Secure integration boundary (future, not connected)
```
Public StreetVerse / AI Commons
   -> public provider listing (approved and nonclinical)
   -> signed handoff to approved clinical partner, without symptoms or PHI in URL/referrer
   -> partner-managed patient portal: identity -> consent -> appointment
   -> licensed provider, secure appointment video, EHR, notes and billing
   -> no patient medical data returned to StreetVerse, creator analytics or Mycelium
```
The public referral can identify which provider the visitor chose only when permitted and privacy-reviewed. Avoid associating health-service usage with game identities or advertising profiles.

## Required secure-service endpoint design (NOT deployed)
- `GET /health/readiness`: aggregate operational status only, no patient data; authorized read access
- `GET /directory`: approved providers and general service types only
- `POST /identity/verify`: implemented by approved patient identity service (never general TRYAMM server)
- `POST /consents`: signed, patient-specific consent recorded within a clinical system
- `POST /appointments`: clinician location/state eligibility, atomic availability locking, idempotent request key; requires authenticated patient in isolated service
- `POST /sessions/token`: authorized participant + appointment verification, short-lived narrowly scoped token; never a public room key
- `GET /records`: authorized patient or provider EHR integration, per-purpose audit; never accessible to HoloGPT or Mycelium
- `POST /incident`: restricted incident-response workflow with controlled evidence and notification escalation

## One-push acceptance tests (clinical pilot only AFTER approval)
1. Unauthenticated visitors cannot request session tokens, appointments or records.
2. Out-of-state provider mismatch blocks appointment; only independent licensed evidence can unblock.
3. Every BAA-required vendor has executed approved agreement; otherwise block.
4. PHI is absent from public logs, game analytics, URLs, emails and agent prompts.
5. Patient consent version and guardian rules are verified by clinical partner before visit.
6. Parallel double bookings prevented by provider transactional scheduling.
7. Revoked identity loses access to rooms and records; break-glass actions are audited.
8. Test on Chromebook/iPhone: one-handed, keyboard, subtitles, audio fallback, screen-reader, interrupted connection/rejoin.
9. Conduct independent privacy/security review, incident tabletop, and backup restore.
10. Sign off and release the clinical service separately from public TRYAMM.

## Preserved trading systems
Earlier Kevon Forex & Stock AI, World Markets, Jacobie DRIP, and V92 Finance Academy work remains distinct. No code on this branch enables brokerage execution or changes trading balances. Trading, financial advice and withdrawal actions remain blocked by default.

## Authoritative references
HHS: https://telehealth.hhs.gov/providers/telehealth-policy/hipaa-for-telehealth-technology
HHS: https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html
HHS: https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html
HHS: https://telehealth.hhs.gov/licensure/getting-started-licensure
