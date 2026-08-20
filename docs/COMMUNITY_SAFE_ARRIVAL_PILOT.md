# TRYAMM Community Safe Arrival Pilot

Status: INTEGRATED/GATED → PILOT-READY PATH

## Purpose
Create a non-vigilante, non-law-enforcement community safety service focused on accompaniment, safe-arrival support, visible presence, de-escalation, resource navigation and rapid connection to emergency/public services when needed.

The service does NOT authorize chasing suspects, detaining people, carrying weapons on behalf of TRYAMM, impersonating police/security, conducting searches, traffic stops, investigations, punishment, surveillance of private individuals, or physical intervention outside ordinary lawful self-defense/emergency assistance.

## Core flow
REQUEST → AUTHENTICATE → DISPATCHER REVIEW → RESPONDER ASSIGNED → EN ROUTE → ARRIVED → JOURNEY ACTIVE → SAFE ARRIVAL → CLOSEOUT → AUDIT/FEEDBACK.

## Request types
- walk-with-me / escort-to-destination
- transit stop / parking-lot accompaniment
- elder or disabled-person accompaniment
- student/family safe-arrival support where age/guardian rules permit
- employee closing-shift accompaniment
- event/church/community exit accompaniment
- stranded-person resource navigation
- wait-with-me until approved ride/family arrives
- non-emergency welfare check-in request
- community visibility/presence shift

Emergency/crime-in-progress situations are routed to appropriate emergency/public services first. TRYAMM responders do not replace 911, police, fire, EMS, licensed security, clinicians, or social workers.

## Dispatcher authorization
A responder is NEVER dispatched solely by an AI recommendation.

Dispatcher requirements:
- authenticated dispatcher account
- role/permission verification
- request review and risk classification
- emergency/public-service escalation check
- responder availability/eligibility check
- conflict/relationship check where relevant
- route/geography validation
- audit record of assignment

Stubbs AI may summarize, prioritize, translate and surface risks but cannot independently authorize field deployment.

## Responder eligibility
Before PILOT eligibility, each responder record needs:
- verified identity
- age eligibility
- signed code of conduct
- background/vetting process appropriate to jurisdiction and role
- training completion
- emergency-contact information
- role limitations acknowledged
- insurance/worker classification reviewed by operator
- current status: trainee | eligible | suspended | expired

Training baseline:
- de-escalation and non-confrontation
- situational awareness
- bystander safety
- disability/accessibility awareness
- trauma-informed communication
- youth/elder safeguarding where applicable
- boundaries / anti-harassment
- emergency escalation
- incident reporting
- privacy/location-data handling
- first aid/CPR optional or required by pilot policy; never represent unlicensed medical capability

## Journey safety state machine
REQUESTED → REVIEWED → ASSIGNED → EN_ROUTE → ARRIVED → ACTIVE → SAFE_ARRIVAL → CLOSED.
Exception states: CANCELLED | EMERGENCY_ESCALATED | NO_CONTACT | INCIDENT_REVIEW | RESPONDER_REMOVED.

Every transition stores actor, timestamp, role, reason and correlation ID.

## Field protections
- requester can cancel at any time
- responder cannot force a requester to continue
- masked/proxied contact methods where feasible
- least-necessary live location sharing
- automatic location-sharing expiration after closeout
- visible responder identity/verification in app
- check-in timer during active journey
- one-tap emergency escalation
- dispatcher can terminate assignment
- no public map of vulnerable requesters
- no public crime accusation or suspect labeling

## Live authenticated field test
Pilot cannot be marked TESTED until a controlled field test proves:
1. requester authentication works;
2. dispatcher sees/reviews request;
3. only eligible responder can be assigned;
4. responder receives limited journey data;
5. requester sees responder verification;
6. EN ROUTE/ARRIVED/ACTIVE/SAFE ARRIVAL state changes synchronize;
7. location data expires as designed;
8. emergency escalation works;
9. cancellation works;
10. audit events exist for each state transition;
11. inaccessible/one-handed/screen-reader flows are tested;
12. incident/feedback closeout works.

Use consenting adults and a controlled, low-risk scenario first. Do not use a live dangerous incident as the first test.

## Pilot verification evidence
Required evidence bundle:
- build/version identifier
- environment
- test participants/roles (internal IDs, not public PII)
- start/end timestamps
- state-transition log
- screenshots/video where privacy-safe
- accessibility QA notes
- dispatcher authorization proof
- responder eligibility proof
- emergency-escalation result
- defects found
- fixes/retest evidence
- go/no-go decision

## Build gate
Current state remains `INTEGRATED/GATED` until automated/build verification and controlled field evidence pass.

Status promotion rules:
INTEGRATED/GATED → PILOT only when:
- build/typecheck/tests pass;
- dispatcher authorization is server-enforced;
- responder eligibility is server-enforced;
- location/privacy controls pass;
- audit logging passes;
- emergency escalation is verified;
- controlled field test passes;
- operator signs pilot go-live decision.

PILOT → LIVE requires separate legal/insurance/jurisdiction review, incident-response readiness, staffing, support coverage and successful pilot metrics.

## Business model
This may be a profitable service, but revenue cannot create incentives to escalate conflict.

Possible lawful revenue lanes:
- individual/family membership for non-emergency accompaniment
- employer safe-close/shift packages
- university/campus/community organization contracts
- church/event safe-arrival packages
- senior/disability accompaniment programs
- sponsored community safety memberships
- municipal/nonprofit service contracts where eligible
- training/certification administration for participating organizations

Do not pay responders based on arrests, confrontations, incidents found, citations, suspicious-person reports or physical interventions.

## Pilot metrics
Safety: incident rate, emergency escalations, complaints, responder removals.
Reliability: assignment acceptance, arrival time, journey completion, cancellation rate.
Trust: requester satisfaction, responder satisfaction, accessibility satisfaction.
Impact: completed safe-arrival journeys, employer/community coverage hours, repeat usage.
Economics: revenue per completed journey/member, responder compensation, insurance/support cost, contribution margin, subsidy rate.

## JARVIS integration
Personal JARVIS: `Walk with me / help me get there safely.`
Dispatcher JARVIS: summarizes request, checks gates, never self-dispatches.
Responder JARVIS: navigation/check-in/status only within assigned scope.
Vehicle JARVIS/Holo Ride: can coordinate approved ride handoff.
Emergency Path: receives escalation/resource-navigation handoff.
Platform Sustainability Engine: measures whether the service is self-supporting without compromising safety.
