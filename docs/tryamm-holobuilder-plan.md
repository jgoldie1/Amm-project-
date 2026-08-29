# HoloBuilder Execution Plan

HoloBuilder is the AI-assisted engineering coordinator for TryAMM.

## Workflow
SPEC -> AUDIT -> PLAN -> CODE -> TEST -> SECURITY -> ACCESSIBILITY -> COST -> STAGING -> REVIEW -> PR -> DEPLOY -> MONITOR.

## Guardrails
- Never overwrite verified working code without a migration and regression plan.
- Financial, identity, authorization, moderation, database migration and provider-spend changes require review.
- No production secrets in source control.
- Every feature must map to a Master Feature Registry ID.
- Every PR must state what is implemented, partial, blocked and unverified.

## Specialist agents
- Architect Agent
- Frontend Agent
- Backend Agent
- Database Agent
- AI Integration Agent
- Economy/Ledger Agent
- QA Agent
- Security Agent
- Accessibility Agent
- DevOps/HoloOps Agent

## Immediate audit targets
1. Existing app shell and routes.
2. Authentication and age-lane logic.
3. Streaming/LiveKit integration.
4. Creator gifts, coins, wallet and payouts.
5. Supabase schema and RLS.
6. HoloGPT/model routing.
7. Agencies/families.
8. Marketplace/vendor flows.
9. Accessibility features.
10. Games/Living Worlds routes.
11. Deployment and observability.

## Definition of done
A feature is only production-ready when frontend, backend, database, auth/permissions, analytics, tests, accessibility, error states, documentation and deployment wiring are verified where applicable.
