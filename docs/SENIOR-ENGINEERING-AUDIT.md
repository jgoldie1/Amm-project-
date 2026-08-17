# TRYAMM Senior Engineering Audit — 2026-08-17

## Executive result
The branch contains substantial working foundations, but it is not yet legitimate to mark the entire public platform production-ready. Treat `agent/quantum-internet-mail` as an integration/beta branch until the RED gates below are closed and PR #66 is reviewed/merged.

## GREEN — implemented foundations
- Authenticated marketplace merchant application, approval, Stripe Connect onboarding, product/service/digital listings, checkout and order status sync foundations.
- Quantum Internet federated search/research, crawler/index models, persistent Postgres/pgvector schemas and multimodal schemas.
- Holographic runtime negotiation, OLED/multiview planning, spatial audio, HoloPresence, continuity, browser WebRTC capture/signaling and TURN configuration boundary.
- IP registry/portfolio, AI legal guardrails, regulatory graph/readiness, credential/insurance vault, trust/risk passport, disputes/appeals and provider-backed claim/hold models.
- Virtual warehouse quote/ranking/allocation and asset-light ownership trigger.

## RED — public production blockers
1. **Transactional persistence mismatch** — marketplace and Holo runtime routes still use the legacy `getStore()/saveStore()` store while Supabase schemas exist separately. Migrate authoritative transaction/session state to Postgres and test RLS.
2. **Stripe webhook source of truth missing** — paid/refunded/chargeback state must come from signature-verified, idempotent webhooks. User-triggered `/sync` can remain a reconciliation tool, not the source of truth.
3. **Inventory reservation/atomicity missing** — stock is checked before Checkout but decremented after payment reconciliation. Concurrent buyers can oversell. Add atomic reservations, expiration, fulfillment allocation and idempotent inventory events.
4. **Refund/return/cancellation lifecycle incomplete** — add partial/full refunds, return merchandise authorization, digital/service cancellation rules, seller/customer notifications and accounting events.
5. **Tax/shipping/customs production integration missing** — quoted concepts exist; live tax, carrier/rate, customs/HS/origin and tracking adapters need contracts/API credentials and error handling.
6. **Supplier integrations are adapter targets, not connected feeds** — Alibaba/US/Africa/Taiwan/Canada/etc. require approved API/commercial access, normalized catalog ingestion, inventory/order sync, attribution and provider-specific terms.
7. **Warehouse network has no live 3PL adapters** — quote/routing logic is local data. Add partner onboarding, provider APIs/EDI/SFTP adapters, inventory receipts, pick/pack events, SLAs, claims and reconciliation.
8. **Identity/KYB/trust providers not connected** — Trust Network currently models results. Add approved verification-provider adapters and webhook verification; keep raw sensitive data out of ordinary TRYAMM storage.
9. **Regulatory graph needs authoritative-source ingestion/reverification** — rules cannot be manually assumed current. Add source snapshots, effective dates, scheduled reverification and professional/legal approval records for regulated launches.
10. **PropertyVerse bank-optional/seller-financing workflow is not yet an implemented transaction system on this branch** — deal analysis can be built, but regulated brokerage/credit/closing actions must stay disabled until jurisdiction-specific approval and licensed-party integrations exist.
11. **IP Command Center generates search/filing preparation, not legal filing authority** — add evidence vault, real prior-art result ingestion, docket reminders and attorney/agent collaboration. Do not auto-file or represent patentability.
12. **Holo media is peer mesh** — current WebRTC is appropriate for small demos. Multi-user public LIVE requires an SFU/media service, TURN testing, reconnection, bandwidth adaptation, recording consent and abuse/moderation controls.
13. **Holo multi-user model is not wired to runtime sessions** — runtime session ownership currently binds a session to one user. Wire explicit room membership/roles rather than relying on standalone multi-user helper modules.
14. **Holo persistence mismatch** — session/checkpoint Supabase schemas exist but runtime routes still write to legacy store.
15. **TURN credentials should be short-lived** — do not expose permanent shared TURN credentials through `/api/holo/runtime/ice` in production. Use provider-issued ephemeral credentials.
16. **Quantum Index ingestion workers missing** — crawler/index classes and schemas exist, but distributed scheduling, embeddings, spam/malware review, moderation/takedown and continuous index-health jobs are not production infrastructure yet.
17. **Independent-search benchmarks missing** — do not claim better than Google/the most advanced internet until reproducible benchmarks measure relevance, freshness, provenance accuracy, source diversity, latency and index scale.
18. **Observability/SLOs incomplete** — add structured logs, request IDs, traces, payment/webhook audit logs, provider health, error budgets, alerts and dashboards.
19. **Backups/disaster recovery unproven** — test database backup/restore, object-storage recovery, secrets rotation and incident runbooks.
20. **End-to-end deployment tests incomplete** — production gate requires deployed-domain tests for Google/Apple/SMS auth, Stripe Connect/Checkout/webhooks/refunds, two-device WebRTC/TURN, marketplace RLS, and critical accessibility paths.

## YELLOW — architectural debt
- `content-engine-preload.js` monkey-patches Node module loading. It works as transitional wiring but should be replaced by explicit route registration in a modular server bootstrap.
- Several recent governance systems are API/library foundations without production UI.
- No durable job queue for crawl, media processing, fulfillment, email, reconciliation or regulatory reverification.
- No unified domain-event/outbox layer; cross-module updates can drift during partial failures.
- No central idempotency-key middleware for money/order/provider write operations.
- No consistent pagination/versioned API/error contract across all modules.
- Marketplace is single-product Checkout; multi-item/multi-merchant cart needs a settlement/fulfillment design.
- Media uploads need object storage, malware scanning, content moderation, retention and deletion workflows.

## Required next architecture
1. **Postgres becomes authoritative** for money, marketplace, governance, Holo state and operations.
2. Add **domain events + transactional outbox** (`order.paid`, `inventory.reserved`, `shipment.dispatched`, `dispute.opened`, `credential.expired`, `license.blocked`, etc.).
3. Add **workers/job queue** with retries, dead-letter handling and idempotency.
4. Add **verified provider webhooks** for Stripe, identity/KYB, logistics, warehouses and media infrastructure.
5. Add **release-readiness service**; no production-green state without credentials, migrations, verified webhooks, E2E, observability and backup/restore evidence.
6. Build **Command Center** from these evidence-backed states rather than static feature flags.

## Release rule
A feature is only “complete” when frontend + backend/API + persistent database + auth/RLS + provider integration (if external) + security/compliance + telemetry + automated tests + deployed E2E have all passed. Library-only or mock/provider-boundary work must be labeled `foundation`, `preview` or `beta`, never `production-live`.
