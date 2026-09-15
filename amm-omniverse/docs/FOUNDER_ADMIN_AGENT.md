# Founder Admin Agent

Status: BUILDING

The Founder Admin Agent is the TRYAMM control-tower policy layer. It is designed to consume evidence from Founder Command, diagnose failures across StreetVerse and release systems, and dispatch only explicitly permitted low-risk actions through orchestration infrastructure.

## Automatic authority

- Inspect system status and evidence.
- Diagnose failures and identify likely bottlenecks.
- Retry reversible test runs.
- Retry read-only health checks.

## Founder approval required

- Production deployment or promotion.
- Security or access-control changes.
- Data deletion or destructive operations.
- Real-money movement, payouts, settlement, ownership, or inventory mutation.

## Truth boundary

The agent must preserve LIVE / READY / BUILDING / LOCKED / COMING SOON distinctions. Architecture, source code, a passing unit test, or an open pull request is not sufficient evidence that a capability is LIVE in production.

## Integration direction

Founder Command -> Founder Admin Agent -> Automan / Command Nexus -> permitted action -> CI/runtime evidence -> Founder Command.

The agent should reduce release congestion by routing diagnosis and reversible repairs through one control plane rather than creating independent feature-specific administrators.
