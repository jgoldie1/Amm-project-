# TRYAMM Safe Arrival — Pilot Completion

Status: INTEGRATED / GATED, with pilot-readiness code and controlled harness implemented. Not yet LIVE field service.

## Mission
Provide non-confrontational accompaniment, safe-arrival support, dispatcher coordination, accessibility-aware assistance, closing-shift support, senior/disability accompaniment, event/church/campus arrival support, and sponsored community safety services.

This is not private policing, bounty work, vigilantism, detention, pursuit, interrogation, weapons enforcement, or paid suspicious-person reporting.

## Eligible paid packages
Revenue can come from:
- individual membership
- family membership
- employer closing-shift package
- campus/community contract
- church/event safe-arrival package
- senior/disability accompaniment
- sponsored memberships
- eligible nonprofit/municipal service contracts

### Permitted compensation basis
Price for:
- reserved service availability
- dispatcher coverage
- scheduled accompaniment time
- travel/route coverage
- accessibility support
- training/compliance overhead
- account/organization seats
- approved technology/communications costs
- contract service levels

Never price, bonus, rank, or compensate based on:
- confrontations
- arrests
- suspicious-person reports
- weapons found
- incidents discovered
- police contacts generated
- number of people challenged/stopped

## Pilot journey
REQUEST → SERVER AUTHORIZATION → ELIGIBILITY CHECK → RESPONDER ASSIGNMENT → EN ROUTE → ACCOMPANYING → ARRIVAL → CLOSE.

Escalation path:
RISK/IMMINENT DANGER → DISENGAGE / CREATE DISTANCE → CONTACT APPROPRIATE EMERGENCY SERVICES → SUPERVISOR/AUDIT → CLOSE.

## Pilot prerequisites
Before an actual field pilot can be represented as PILOT:
1. authenticated server/API, not client-only domain logic;
2. durable responder eligibility records;
3. authorized dispatcher accounts and role enforcement;
4. synchronized journey-state API with optimistic/concurrency protection;
5. append-only audit sink;
6. purpose-limited precise location storage with deletion/expiry worker;
7. member consent and emergency disclaimer;
8. responder training/scope acknowledgement;
9. insurance/legal review for the launch jurisdiction and business model;
10. incident/escalation playbook;
11. controlled pilot cohort and coverage zone;
12. emergency-service handoff procedure;
13. accessibility QA;
14. support/refund/cancellation workflow;
15. field-test results signed off before broader launch.

## Controlled field-test phases
### Phase 0 — simulation only
No public responders. Exercise dispatcher, location expiry, journey states, cancellations, lost connectivity and emergency escalation using staff/test accounts.

### Phase 1 — daylight closed cohort
Small invited cohort, low-risk routes, supervisor watching all active journeys. No open public dispatch.

### Phase 2 — employer/event pilot
One approved employer/church/campus/event partner with scheduled windows and defined coverage area.

### Phase 3 — limited public pilot
Only after prior evidence and jurisdiction/insurance approval. Cap concurrent journeys and geography.

## Business model health
Safe Arrival can be profitable if utilization, insurance, staffing, support and technology costs are priced correctly. The Platform Sustainability Engine should track this product separately:
SAFE_ARRIVAL_ELIGIBLE_REVENUE / SAFE_ARRIVAL_DIRECT_COST.

Target product contribution should be positive before subsidized expansion. TRYAMM-wide goal remains 3.00× eligible platform revenue / measured infrastructure cost, but Safe Arrival must not reach that goal by underpaying workers or encouraging risk-taking.

## Membership/service pricing framework
Do not lock final public prices until pilot costs are measured. Use a simulator with:
- dispatcher labor/minute
- responder labor/minute + employer taxes/contractor overhead as applicable
- travel reimbursement
- insurance per active member/journey
- background/training amortization
- communications/maps/SMS
- support/refunds
- payment fees
- platform margin/reserve

Price = expected direct service cost + risk/operations reserve + target contribution.

## Data minimization
Precise location is temporary operational data, not a permanent social graph. Expire/delete after the disclosed retention window unless a legitimate incident/legal preservation requirement applies. Sponsored/employer accounts receive service-level proof, not a detailed permanent movement history of members.

## Promotion rule
Do not advertise `PILOT`, `LIVE`, `24/7`, `verified responders`, `background checked`, `insured`, `city approved`, or similar claims until real evidence exists for the specific jurisdiction/service cohort.

## Current truth
The repository now contains domain-level server-authority rules, eligibility checks, journey transitions, audit-event structures, location-expiry checks, pricing/compensation boundaries, pilot-readiness gates and a controlled simulation harness. External production server persistence, real identities, insurance/legal review, field operators and field validation remain prerequisites to a truthful real-world PILOT.
