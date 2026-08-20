# TRYAMM Safe Passage Guardian

Status: LOCKED BUSINESS / OPERATING SPECIFICATION

## Purpose
A non-vigilante community safety and support service focused on presence, escort, de-escalation, reporting, resource connection and rapid escalation to licensed security, law enforcement, EMS or other qualified professionals when needed.

The service must not encourage chasing, detaining, searching, threatening or confronting people. Workers do not represent themselves as police or security guards unless separately licensed/authorized for that role.

## Contractable customer types
- hospitals and health systems
- universities and colleges
- senior communities / assisted-living campuses
- employers / industrial campuses
- hotels / hospitality
- malls and commercial districts
- event venues
- schools / after-school programs subject to safeguarding rules
- faith/community organizations
- transit-adjacent or business improvement districts
- residential communities

## Service packages
1. Safe Passage Escort — scheduled or on-demand walking accompaniment between defined locations.
2. Community Ambassador — visible, trained non-enforcement presence, directions, welfare check-ins, de-escalation and reporting.
3. Senior Companion Safety — check-in, escort, wayfinding and handoff to approved care/support providers; not medical care.
4. Hospital Visitor Ambassador — arrival help, de-escalation support, wayfinding, family liaison and rapid escalation to hospital security/clinical staff.
5. Campus Night Walk — booked escort within approved campus boundaries.
6. Employer Shift Escort — arrival/departure escort for late or early shifts.
7. Event Safe Passage — wayfinding, crowd-support, reunification and escalation support.
8. Community Mission Patrol — non-enforcement visibility and resource navigation under a defined contract.

## Dispatcher UI
- live map of opted-in active workers and active assignments
- open requests / priority queue
- worker status: available, assigned, en route, arrived, accompanying, completed, break, offline
- contract/site boundaries and post instructions
- escalation contacts per site
- incident reporting
- shift gaps
- check-in overdue alerts
- worker safety alerts
- member assistance queue
- audit timeline

Dispatcher cannot remotely activate cameras/microphones or disclose precise worker/member locations beyond authorized operational need.

## Worker mobile UI
- start/end shift
- receive/accept eligible assignment
- navigation to pickup/checkpoint
- member name or approved alias + minimum necessary info
- site-specific instructions
- one-tap arrived / started accompaniment / completed
- safety check-in timer
- emergency escalation button
- incident report with structured reason codes
- accessibility preferences inherited from Accessibility Passport
- earnings/time summary where applicable

No pursuit mode, detention mode, weapon prompts or vigilante scoring.

## Member booking/check-in UI
- request escort now or schedule later
- pickup + destination within eligible service area
- accessibility/mobility needs voluntarily supplied
- communication preference
- live arrival ETA
- worker card when permitted
- verification code / QR check-in
- share-trip link with trusted contact where enabled
- cancel/report/problem
- post-service feedback

## Real-time location
Use a provider abstraction so mapping/geolocation can be changed without rewriting the product.
Location rules:
- explicit opt-in while on assignment/shift
- coarse location when precision is unnecessary
- precise location retained only for disclosed operational/safety periods
- no sale of location data
- customer and worker addresses/phones masked where possible

## Notifications
Push/SMS/email/provider abstraction for:
- worker assigned
- worker arriving
- member checked in
- escort started/completed
- shift reminders
- missed check-in
- site incident escalation
- contract service report ready

Paid SMS is metered into Platform Sustainability Engine.

## Shift scheduling
- recurring and one-off shifts
- site/contract eligibility
- required training/credential gates
- worker availability
- overtime/maximum-hours warnings
- break requirements where applicable
- open-shift marketplace
- call-off/replacement workflow
- supervisor approval

## Background-check / identity provider abstraction
Where legally permitted and appropriate to role/contract:
- identity verification
- background screening through approved provider
- driving record for driving assignments
- license/certification verification when role requires it
- re-check/expiration dates

Do not treat criminal history as an automatic universal disqualifier; rules vary by jurisdiction, contract and role. Results are restricted HR data.

## Licensing boundary
In Illinois, private security contractor and related security professions are regulated by IDFPR. TRYAMM must classify each contract and actual worker activity before representing the service as private security. If the activities cross into regulated security work, use appropriately licensed entities/workers and required registrations/training. Non-security ambassador services must still follow local contracting, insurance, labor, privacy and site rules.

## Insurance / risk review
Before LIVE contract deployment:
- general liability
- workers compensation where applicable
- auto/non-owned auto if transportation involved
- professional/errors & omissions where appropriate
- cyber/privacy coverage
- abuse/molestation coverage for programs involving minors where appropriate
- contract indemnity review
- site-specific risk assessment

## Contract model
Client contract stores:
- site(s)
- service type
- staffing plan
- service hours
- response/escalation scope
- excluded activities
- pricing method
- insurance requirements
- reporting metrics
- data/privacy terms
- term / renewal
- SLA
- cancellation

## Pricing model
Possible recurring structures:
- monthly site retainer + staffed-hour charges
- per-shift / per-worker-hour
- per-member subscription for eligible communities
- university/hospital annual contract
- event package
- enterprise multi-site contract

Do not price below fully loaded labor + payroll burden + insurance + supervision + technology + support + margin.

## Sustainability target
Every contract feeds Platform Sustainability Engine.
Target service contribution must support the broader 3.00× TRYAMM sustainability goal, but labor-heavy services should be measured separately from software gross margin.

Recommended dashboard:
CONTRACT REVENUE → DIRECT LABOR → INSURANCE/SCREENING → DISPATCH/SMS/MAPS → SUPERVISION → CONTRIBUTION MARGIN → PLATFORM SHARE.

## Contractable recurring-revenue flywheel
CLIENT CONTRACT → STAFFING → SAFE PASSAGE SERVICE → VERIFIED COMPLETION → INCIDENT/OUTCOME REPORTING → MONTHLY IMPACT REPORT → RENEWAL/EXPANSION.

## Impact metrics
- escorts completed
- average arrival time
- completion rate
- missed check-ins
- incidents escalated appropriately
- participant satisfaction
- staff-reported safety perception where collected
- repeat utilization
- contract renewals
- training completion
- accessibility accommodations fulfilled

Avoid claiming that the program reduces crime unless supported by appropriate evidence. Measure service outcomes first.

## Pilot path
1. Choose one narrow service (e.g. employee night-shift escort or campus night walk).
2. Recruit 1–3 pilot partners.
3. Complete legal/licensing/insurance classification.
4. Configure contract/site boundaries.
5. Integrate background/identity provider as required.
6. Deploy dispatcher UI + worker mobile UI + member booking/check-in UI.
7. Add realtime location + notifications.
8. Implement server persistence/RLS and audit trail.
9. Train 5–20 pilot workers.
10. Run 30–90 day pilot with weekly review.
11. Produce client impact report.
12. Convert to annual recurring contract if metrics support renewal.

## Evidence note
Hospital ambassador models have shown promising reductions in some workplace-violence-related calls/incidents in pilot research, but outcomes are setting-specific and should not be generalized as guaranteed crime reduction.
