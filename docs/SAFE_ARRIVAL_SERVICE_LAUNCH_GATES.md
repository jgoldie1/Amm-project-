# TRYAMM Safe Arrival / Community Accompaniment Service

Status: LAUNCH-GATED CONTRACTABLE SERVICE SPECIFICATION

## Purpose
Provide non-law-enforcement, non-vigilante accompaniment and journey-watch services focused on safe arrival, visibility, dispatch support, accessibility and documented service levels. The service does not impersonate police, private security, emergency medical services or licensed protective services where those licenses are required.

## Core service packages
1. Senior / disability accompaniment journeys.
2. Closing-shift employee accompaniment / journey watch.
3. Student / campus arrival support where permitted by partner policy.
4. Event arrival / departure support.
5. Safe-walk / safe-ride coordination through approved transport partners.
6. Dispatcher-backed remote journey watch with check-ins and escalation.
7. Employer / housing / campus / community contracts for recurring coverage.

## Core journey state machine
REQUESTED → ELIGIBILITY / SERVICE-AREA CHECK → ASSIGNED → CHECK-IN STARTED → JOURNEY ACTIVE → ARRIVAL PENDING → SAFE ARRIVAL CONFIRMED → CLOSED.

Exception states: NO-SHOW | MEMBER CANCELLED | COVERAGE UNAVAILABLE | CONCERN REPORTED | ESCALATED | EMERGENCY SERVICES REFERRED.

## Service-level agreement dimensions
Every contract defines:
- coverage geography
- service windows
- response-time target
- staffing/capacity assumptions
- availability target
- dispatch support hours
- safe-arrival confirmation method
- missed-check-in procedure
- escalation procedure
- accessibility support commitments
- privacy/data-retention commitments
- complaint/incident response time
- training currency requirements
- reporting cadence
- exclusions and emergency limitations

Never guarantee crime prevention or personal safety. Promise only the defined service process and service-level metrics.

## Launch target example
Pilot objective: 500 senior/disability accompaniment journeys plus selected closing-shift employer coverage.

Pilot evidence package:
- requested journeys
- completed journeys
- safe-arrival confirmations
- cancellations/no-shows
- median/95th percentile assignment time
- median/95th percentile response time
- availability rate
- escalations
- accessibility satisfaction
- member satisfaction
- privacy incidents
- training compliance
- partner renewal intent
- cost per completed journey
- contribution margin per journey/contract

## Staffing model
Roles can include:
- dispatcher / journey coordinator
- trained accompaniment worker
- accessibility support specialist
- operations supervisor
- trust/safety reviewer
- partner account manager

Workers must receive role-appropriate screening/training where lawful and relevant. Training can include de-escalation, boundaries, accessibility etiquette, disability communication preferences, situational awareness, emergency escalation, privacy, incident documentation and non-intervention limits.

## Non-vigilante boundary
Workers do NOT:
- detain, search, interrogate or pursue people
- carry out law-enforcement functions
- initiate confrontations
- conduct armed patrols under this service
- promise physical protection beyond the permitted service scope
- collect intelligence on individuals outside service needs

If a situation becomes dangerous, the workflow prioritizes distance, safety, communication and appropriate emergency/public-service escalation.

## Privacy model
Journey data class: RESTRICTED.
Collect minimum necessary data. Precise location is used only while needed for the journey/service and retained under a disclosed retention policy. Do not sell journey, disability, crisis or safety data for advertising. Mask contact information where possible. Access is least-privilege and audited.

## Accessibility model
Safe Arrival consumes Accessibility Passport preferences only with user permission. Examples: one-handed app operation, voice control, text-first communication, larger controls, captions, communication preference, mobility-access notes relevant to the journey and pickup/drop-off accessibility information.

Do not infer diagnosis and do not expose disability details to workers beyond the minimum required to deliver the requested service.

## Contract pricing model
Price contracts using measurable cost drivers:
- dispatcher minutes
- accompaniment worker minutes/hours
- mileage/transport/provider cost where applicable
- insurance/compliance overhead
- technology/messaging cost
- supervision/quality cost
- reserve/incident overhead
- target contribution margin

Pricing can be per journey, per covered shift/site, monthly retainer, institutional contract, or sponsored/mission-funded package. Do not promise a fixed public price until local labor, insurance, licensing and transport/provider costs are known.

## Contribution margin
Contribution Margin = Eligible Contract Revenue - Direct Service Delivery Costs.

Direct costs include labor attributable to the service, transport/provider charges, per-journey messaging/mapping, direct insurance allocation and other usage-based service costs.

Contract-level contribution margin must be positive before scale unless the contract is deliberately subsidized by a restricted sponsor/mission budget.

## 3.00x sustainability integration
Safe Arrival feeds Platform Sustainability Engine as its own business line.
Track:
- eligible service revenue
- direct service cost
- gross contribution
- infrastructure allocation
- contract acquisition cost
- renewal rate
- target ratio to shared infrastructure

The platform-wide 3.00x target remains separate from any single service contract. A Safe Arrival contract can be healthy even if its own revenue-to-infrastructure ratio differs, provided its contribution margin is positive and shared platform sustainability remains on target.

## Contract readiness gates
Before selling institutional coverage:
1. legal/licensing review for jurisdiction and service wording;
2. insurance requirements confirmed;
3. worker classification and screening process documented;
4. training curriculum and retraining cadence approved;
5. dispatcher workflow tested;
6. mobile journey flow tested;
7. escalation procedure tested;
8. privacy/retention policy approved;
9. incident reporting and audit logging live;
10. accessibility QA completed;
11. pilot capacity model validated;
12. partner contract/SLA template reviewed;
13. contribution-margin model validated;
14. customer support/complaint process live.

## Pilot-to-scale path
SIMULATION → INTERNAL TEST → SMALL PILOT → 500-JOURNEY PILOT → EVIDENCE REVIEW → CONTRACT RENEWAL → MULTI-SITE EXPANSION → CITY/REGION EXPANSION.

Expansion happens only after service quality, staffing capacity, privacy compliance and positive contribution margin are demonstrated.

## Dashboard
SAFE ARRIVAL OPERATIONS
- Active journeys
- Waiting assignment
- Coverage availability
- Median response time
- Safe-arrival confirmations
- Escalations
- Accessibility satisfaction
- Member satisfaction
- Training compliance
- Privacy incidents
- Contribution margin
- Contract renewal / pipeline

## What remains before LIVE
CODED journey state model → dispatcher UI → worker/mobile UI → authenticated member flow → location/privacy controls → notification provider → incident/escalation records → analytics → SLA reporting → pilot partner → insurance/licensing review → trained staffing → real-world pilot evidence.
