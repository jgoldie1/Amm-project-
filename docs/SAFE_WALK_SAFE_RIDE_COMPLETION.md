# Safe Walk / Safe Ride / Community Ambassador Completion

Status: SPECIFIED / NOT YET PRODUCTION-READY

## Purpose
Create a non-vigilante, non-law-enforcement community safety service focused on presence, accompaniment, de-escalation, visibility, check-ins, safe arrival, youth Peace Missions, late-shift support, and community/business corridor confidence.

## Core products
- Safe Walk: escorted walk between approved origin/destination points.
- Safe Ride: transportation or ride-coordination through approved providers.
- Community Ambassador: visible, trained, unarmed support presence unless a separately licensed security service is explicitly contracted and regulated.
- Business Corridor Coverage: scheduled ambassador presence/check-ins for participating merchants.
- Late-Shift Program: employer-funded escorts/check-ins for workers leaving late.
- School/Community Coverage: arrival/dismissal/event support under contract.
- Event/Hospitality Support: wayfinding, crowd-assistance, check-in, safe-departure support; not crowd-control policing.
- Youth Peace Missions: sponsor-funded programs using mentoring, sports, arts, service, education, conflict-resolution training and opportunity pathways.

## Safety boundaries
- No vigilantism, chasing suspects, weapons enforcement, detention, searches, impersonating police, or physical intervention except lawful self-defense/emergency necessity.
- Ambassadors call emergency services when required and follow escalation protocols.
- Background checks, training, supervision, insurance, incident reporting and jurisdiction-specific licensing requirements are mandatory where applicable.
- Never market an ambassador as a security guard unless the role/provider is properly licensed for that jurisdiction.

## User workflow
REQUEST → ORIGIN/DESTINATION → SERVICE TYPE → ELIGIBILITY/AVAILABILITY → PRICE/SPONSOR → MATCH/ASSIGN → CHECK-IN → EN ROUTE → ARRIVING → ARRIVED/SAFE → RATING/INCIDENT REPORT → AUDIT.

## Safe Walk / Safe Ride UI
User-facing state:
1. Request help getting from A to B.
2. Choose WALK / RIDE / CHECK-IN ONLY / GROUP.
3. Show ETA, assigned ambassador/provider, verified profile state and support contact.
4. Live status: MATCHED → ON THE WAY → ARRIVED AT PICKUP → EN ROUTE → ARRIVING → SAFE ARRIVAL.
5. Trusted-contact sharing is opt-in.
6. Emergency button routes to appropriate emergency guidance, not private vigilante response.
7. Accessibility Passport applies globally.

## Ambassador dispatch dashboard
Dispatcher view:
- open requests
- coverage zones/corridors
- ambassador availability and training/credential state
- assignment queue
- ETA and route status
- missed check-in alerts
- incident/escalation queue
- supervisor status
- contract coverage windows
- service-level metrics

## Check-in / arrival tracking
Event model:
REQUESTED | ACCEPTED | EN_ROUTE_TO_PICKUP | ARRIVED_PICKUP | USER_CHECKED_IN | JOURNEY_ACTIVE | ARRIVING | SAFE_ARRIVAL_CONFIRMED | CANCELLED | ESCALATED | INCIDENT_REPORTED.

Location data is minimized, permissioned and retained only as needed for safety, billing, dispute and legal obligations.

## Revenue model
Eligible revenue sources:
- business corridor subscriptions
- property/community contracts
- event staffing
- employer late-shift programs
- school/community organization contracts
- venue/hospitality support
- sponsor-funded youth Peace Missions
- eligible government/nonprofit service contracts
- training/dashboard subscriptions

## Sustainability accounting
For each contract/service line:
REVENUE
→ ambassador/courier labor
→ payroll taxes/contractor costs as applicable
→ insurance/licensing/background-check provider costs
→ maps/messaging/communications
→ supervision/dispatch
→ training/equipment
→ support/refunds/incidents
→ payment/provider fees
= CONTRIBUTION MARGIN.

Only positive contribution margin counts toward TRYAMM Platform Sustainability Engine eligible contribution.

## KPIs
- completed safe arrivals
- average response time
- missed/failed assignments
- incident rate
- customer/worker satisfaction
- ambassador utilization
- cost per completed service
- contract gross margin and contribution margin
- sponsor-funded missions delivered
- youth/mentor participation
- repeat business-corridor contract rate

## What is still left to build
1. Database schema for requests, ambassadors, contracts, shifts, check-ins, incidents and trusted-contact shares.
2. Authentication/RLS for user, ambassador, dispatcher, supervisor and organization roles.
3. Safe Walk/Safe Ride React UI.
4. Ambassador mobile/driver workflow.
5. Dispatcher dashboard and zone map adapter.
6. Real-time location/check-in events.
7. Notification service for SMS/push/in-app with consent and quiet-hour rules.
8. Trusted-contact sharing and revocation.
9. Incident/escalation workflow and supervisor handoff.
10. Contract/subscription billing model through approved payment provider.
11. Sustainability Engine integration using actual labor/provider costs.
12. Training/credential/background-check verification states.
13. Insurance/licensing/legal review by jurisdiction before public service.
14. Accessibility QA and disabled-user testing.
15. Abuse/fraud controls, rate limits and audit events.
16. Pilot metrics dashboard.
17. End-to-end tests, red-team review and production launch gate.

## Launch path
CONCEPT → SPECIFIED → CODED → INTEGRATED → PILOT → TESTED → JURISDICTION VERIFIED → GATED → LIVE.

Recommended first pilot: one small business corridor or one employer late-shift contract, with bounded hours, trained ambassadors, supervisor coverage, explicit insurance/licensing review, and measured unit economics before expansion.
