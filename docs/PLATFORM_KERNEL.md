# TryAMM Platform Kernel

The Platform Kernel is the mandatory shared foundation for every TryAMM product, world, game, media channel, business tool and hardware client.

## Kernel services

1. Identity and authentication
2. Age lanes and guardian controls
3. Roles and permissions
4. Accessibility profile
5. Wallet and separated balance ledger
6. Notifications and messaging
7. Search and discovery
8. Media sessions
9. World and teleport sessions
10. Asset registry and rights records
11. Commerce and order state
12. AI orchestration and permissions
13. Moderation, fraud and trust signals
14. Audit logs
15. Analytics and event collection
16. Feature flags and partner approval registry
17. Backup, restore and incident controls

## Non-negotiable rules

- No product creates a second identity system.
- No module writes wallet balances directly.
- No child, teen or adult lane bypasses policy checks.
- No AI agent accesses production secrets without an approved tool and audit entry.
- No generated script runs outside a sandbox.
- No external partner feature enables without an approval record.
- No world publishes an unregistered asset.
- No high-impact employment, education, payment, moderation or safety decision is final without the required human review.

## Canonical service boundaries

### Identity Service

Owns users, sessions, linked devices, verification state and recovery.

### Policy Service

Owns age lanes, jurisdiction rules, feature eligibility, guardian controls and consent records.

### Wallet Service

Owns purchased credits, promotional credits, creator earnings, pending balances, reserves and immutable transaction entries. Available creator balances cannot become negative.

### World Service

Owns world definitions, timelines, arrival bubbles, teleport sessions, version snapshots and rollback metadata.

### Asset Service

Owns asset IDs, licenses, owners, formats, performance tiers, age permissions, device compatibility and approval status.

### Media Service

Owns livestream rooms, recordings, Isaiah AI TV channels, OmniBox episodes, captions, translations and call-safe interruption state.

### Commerce Service

Owns stores, products, Holo Menu records, carts, orders, returns, marketplace fees and external marketplace connection status.

### AI Gateway

Routes approved AI tasks, applies cost budgets, safety policies, model permissions, logging and human escalation.

### Trust and Safety Service

Owns reports, moderation cases, appeals, fraud signals, brand-safety classification and enforcement history.

### Audit Service

Records privileged actions, policy changes, payout changes, asset approvals, partner enablement and release evidence changes.

## Required shared events

- user.created
- session.started
- age_lane.changed
- consent.updated
- accessibility_profile.updated
- wallet.credit_purchased
- wallet.credit_spent
- creator.earning_pending
- creator.earning_available
- world.teleport_requested
- world.arrival_ready
- world.version_published
- media.live_started
- media.live_ended
- store.order_created
- store.order_refunded
- asset.approved
- policy.version_published
- moderation.case_opened
- appeal.resolved
- release.evidence_added

## First implementation slice

1. Identity Service
2. Policy Service
3. Accessibility Profile
4. Feature Registry
5. World Registry
6. Wallet Ledger
7. Audit Service
8. API Gateway
9. Enter Globe shell
10. One teleport journey

## Definition of done

A kernel service is complete only when it has:

- Typed API contract
- Database schema and migrations
- Authentication and authorization
- Validation and error model
- Audit events
- Unit and integration tests
- Monitoring and health checks
- Backup and restore handling where applicable
- Privacy and retention rules
- Release evidence
