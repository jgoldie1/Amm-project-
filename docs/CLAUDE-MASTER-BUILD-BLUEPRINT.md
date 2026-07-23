# Claude Master Parallel Build Blueprint — TryAMM

## Mission
Build isolated, production-oriented work packages that can be reviewed and merged into TryAMM without duplicating existing systems or breaking shared contracts. Do not claim completion without tests, runnable code, and a clear handoff.

## Working rules
1. Work in a new feature branch from the latest `agent/seo-search-indexing` head unless Victor provides a newer integration branch.
2. Do not overwrite shared files blindly. Search first, reuse existing managers/routes/manifests, and extend through adapters.
3. Every feature must include: frontend, backend, API contract, persistence plan, auth/RBAC assumptions, validation, error handling, tests, environment variables, README/handoff, and screenshots or test evidence where applicable.
4. Expensive AI/provider jobs must route through CostOps before execution.
5. Reuse-first: search Asset Vault before generating new media or 3D assets.
6. Every publishable reusable asset must connect to Digital DNA/provenance and rights checks.
7. Regulated financial, lending, appraisal, insurance, title, brokerage, medical, legal, and other licensed activities must be routed to qualified/licensed providers where required; do not impersonate a licensed provider.
8. Do not copy competitor code, UI, branding, proprietary prompts, or protected assets. Build original category-equivalent workflows.
9. Return a handoff containing branch, commit SHA, changed files, migrations, env vars, test commands/results, screenshots, remaining gaps, and merge risks.

# Track A — Living GameVerse / 11 Games
Goal: build one production-quality vertical slice first, then reusable systems for all 11 titles.

Deliver:
- shared player profile/Passport adapter
- lobby/session manager
- matchmaking stub or local session orchestration
- save/progression interface
- AI NPC/companion interface
- input abstraction: keyboard/mouse, controller, touch
- pause/resume on interruption
- TV/second-screen casting adapter interface
- accessibility options
- runtime telemetry + AI GameOps incident reporting
- Asset Vault lookup before asset generation
- deterministic demo content using original/free-to-use assets
- tests

Do not mark all 11 games production-ready. Clearly label foundation/prototype/production status per title.

# Track B — AR / VR / MR / HoloVerse
Goal: create a capability-based XR layer with graceful fallback.

Deliver:
- device/capability detection
- WebXR/OpenXR-oriented adapter strategy where practical
- phone AR placement path
- VR controller path
- MR passthrough/spatial UI path where supported
- non-XR fallback for browser/phone/TV
- spatial anchors abstraction
- gesture/voice hooks
- performance/LOD profiles
- HoloVerse scene manifest format
- holographic-output adapter interface for future hardware without pretending true volumetric holography exists on unsupported displays
- tests and sample scene

# Track C — Quantum Speed Engine + Asset Forge
Treat `Quantum Speed Engine` as TryAMM's orchestration/optimization engine unless real quantum hardware/services are actually integrated.

Pipeline:
request -> Asset Vault search -> reuse/adapt candidate -> CostOps quote -> credit authorization -> approved provider generation (Meshy or other adapter) -> optimize -> retopology -> texture -> rig -> animation -> validate -> Digital DNA -> Asset Vault -> optional HoloMarket listing.

Deliver:
- provider adapter interface
- reuse-first search service
- quote endpoint
- generation job queue contract
- retry/failover states
- provider cost capture
- 3D output validation metadata
- asset versioning
- rights/provenance hooks
- tests

Do not hard-code provider prices. Use CostOps. A $6-equivalent promotional starting tier may exist only when provider + compute + payment/support/reserve costs still meet configured margin.

# Track D — Jacobie Vision Cybersecurity + App Protection
Goal: defensive cybersecurity product and internal protection layer.

Deliver:
- app/security posture dashboard
- dependency vulnerability scan adapter
- secret exposure detection workflow
- MFA/RBAC configuration checks
- suspicious login/event intake
- phishing/wire-fraud education and alerts
- backup/recovery verification checklist
- security incident intake -> triage -> remediation -> closure
- immutable/auditable event records design
- provider/customer organization model
- subscription/service entitlement hooks
- TryAMM Analytics events
- tests

No offensive intrusion tooling.

## Jacobie Vision Real Estate + House Flipping
Create a separate module connected to Jacobie Vision:
- property workspace
- deal checklist
- rehab scope/budget/contingency planner
- contractor/vendor directory + verification state
- due-diligence checklist
- comps/research workspace using only properly licensed/public data
- scenario calculator: acquisition, closing, rehab, carrying, financing, taxes/fees assumptions, sale/rent outcomes
- project timeline, invoices/change orders
- AR/VR/MR/digital-twin property tour hooks
- before/after media
- listing/marketing content drafts
- legacy property inventory

## Licensed professionals as platform customers/providers
Support onboarding and subscription/service profiles for:
- real-estate brokers/agents
- licensed appraisers
- mortgage lenders/brokers
- title/escrow companies
- insurance agents/brokers
- general contractors and specialty trades
- home inspectors
- attorneys/closing professionals
- property managers
- architects/engineers where relevant

For each: business profile, jurisdiction, license/credential fields, verification status, service areas, lead/referral intake, secure document exchange, consent, audit logs, Stripe/OmniPay billing hooks, cybersecurity/App Protection upsell, analytics.

Regulated actions must be gated by jurisdiction/license/capability and professional verification.

# Track E — Aniyah Financial Literacy App
Goal: education-first financial capability platform, not a bank.

Deliver:
- user/guardian/teen profiles
- age-appropriate lesson tracks
- budgeting simulator
- savings goals
- credit education
- interest/debt calculators
- scam/fraud awareness
- entrepreneurship/creator-income lessons
- cross-border payment education
- fee/FX simulator using transparent assumptions
- Africa/Nigeria, Latin America, Asia/Japan and U.S. learning paths
- progress, quizzes, badges
- HoloGPT tutor adapter
- OmniPay handoff only for actual regulated payments
- analytics and privacy controls

# Track F — Heirs & Legacy Kids
Goal: preserve family knowledge, asset inventories, education and succession readiness without pretending software itself executes legal inheritance.

Deliver:
- family/guardian/heir profiles
- adult heir vs minor/guardian permissions
- asset/IP inventory links
- Digital DNA/Asset Vault references
- property/business inventory
- learning plans for successors
- stewardship/readiness checklists
- document checklist for attorney/CPA/trust/estate professionals
- notifications for missing ownership documents
- legacy dashboard
- exportable succession-readiness report

# Track G — 64-Track Recording Studio + Vocal Coach
Goal: browser/desktop-capable creator studio architecture with AI assistance.

Deliver:
- 64 logical audio tracks
- record/import/edit regions
- takes/comping
- mixer
- buses/sends
- plugin/insert abstraction
- automation lanes
- non-destructive editing
- project versions
- stem export
- master export
- collaboration comments
- autosave/recovery design
- storage quotas/CostOps hooks

AI Vocal Coach:
- pitch/rhythm feedback
- breath-control exercises
- diction/pronunciation
- range tracking
- warmups
- harmony suggestions
- phrasing practice
- practice plans
- safety disclaimer: educational/performance coaching, not medical diagnosis

Integrate with TryAMM Music, Music Videos, Holo Commercial Studio, HoloVerse concerts and creator monetization.

# Track H — Books / Publishing / Print-on-Demand
Goal: creator publishing workstation.

Deliver:
- manuscript project
- chapter editor/import
- cover asset workflow
- metadata/ISBN fields
- formatting/export pipeline for EPUB/PDF/print-ready PDF
- proof checklist
- rights/AI disclosure checklist
- pricing calculator hooks
- sales/royalty dashboard adapters
- Amazon KDP submission checklist/export package
- IngramSpark distribution package option
- Lulu/direct-print/API option where appropriate
- TryAMM store listing integration
- audiobook/project linkage
- Digital DNA/rights vault hooks

Do not automate account actions that require publisher acceptance unless official APIs/authorized workflows exist.

# Track I — OmniPay / Stripe / Global Regional Routing
Stripe-first where eligible, with regional adapters.

Deliver:
- Checkout Sessions for one-time web purchases
- Billing/subscription architecture
- Stripe Connect Accounts v2 integration plan
- verified webhooks
- idempotency
- ledger postings
- refunds/disputes
- creator/vendor payout states
- country/currency capability router
- Nigeria/Africa regional adapter slots
- Latin America/Brazil PIX-capable adapter slots
- Asia/Japan routing
- China-specific gated provider pathway
- fee/FX disclosure
- CostOps margin checks
- PCI/tokenization boundaries
- tests

# Track J — TryAMM Security Backbone
Protect TryAMM.online itself.

Deliver:
- threat model
- WAF/CDN/rate-limit recommendations and config where deployable
- CSP/security headers
- CSRF/CORS/session policy review
- bot/abuse protection
- login throttling and risk events
- MFA for admin/high-risk roles
- RBAC least privilege
- secrets management
- dependency/SBOM scanning
- SAST/DAST CI hooks
- malware/file upload scanning architecture
- webhook signature verification
- audit logging
- backups + restore drills
- incident runbook
- vulnerability disclosure/security contact page
- admin break-glass procedure
- data retention and privacy controls

# Track K — Claude output contract
At the end of every work package return exactly:
1. Summary of what was built
2. Branch name
3. Commit SHA(s)
4. Changed files
5. Database migrations
6. Environment variables required (names only; never secrets)
7. APIs/routes added
8. Frontend pages/components added
9. Tests run + exact results
10. Screenshots/demo evidence
11. Known limitations
12. Security/legal/regulatory gates
13. Merge conflicts/risks
14. Exact instructions for Victor
15. Exact package to bring back to ChatGPT for architecture audit

# Priority order
P0: TryAMM Security Backbone, Auth/Passport/RBAC/MFA, durable database/storage, Stripe/OmniPay ledger/webhooks.
P1: one end-to-end creator monetization flow, Asset Forge reuse-first + CostOps + Digital DNA + Asset Vault.
P1: one playable GameVerse vertical slice + AI GameOps.
P1: Jacobie Vision App Protection + licensed-provider onboarding foundation.
P2: Aniyah + Heirs/Legacy dashboards.
P2: 64-track studio/vocal coach MVP.
P2: Books/publishing workstation.
P3: broader XR/HoloVerse, remaining 10 game runtimes, regional expansions after compliance/provider validation.

Do not add new unrelated features until P0/P1 integration tests pass.