# TryAMM Master Engineering Blueprint

## Purpose

This document is the single engineering source of truth for wiring the TryAMM ecosystem from login through deployment. It complements the verified pre-alpha release definition and does not replace external evidence requirements.

## 1. Product entry points

The primary navigation remains intentionally simple:

- WATCH
- LIVE
- PLAY
- ENTER GLOBE
- CREATE
- SHOP
- LEARN
- WORK

Every major module must be reachable through one of these doors. New modules should not add top-level navigation unless an architecture review approves the change.

## 2. Shared control plane

All applications and worlds must use the same control-plane services:

- Identity and authentication
- Age lanes and guardian controls
- Roles and permissions
- Accessibility profiles
- Feature flags
- Partner approval registry
- Policy versioning
- Audit logs
- Notifications
- Search
- Translation
- Analytics
- Moderation and appeals
- Rights and licensing
- Asset registry
- Wallet and ledger
- Fraud controls
- Release evidence

No game, store, AI agent, media channel, university world, workforce service, or hardware client may bypass these services.

## 3. Frontend applications

### Consumer web and mobile

Required screens:

1. Sign in and onboarding
2. Age-lane and guardian setup
3. Accessibility setup
4. Home feed
5. Live rooms and PK
6. Enter Globe
7. World destination page
8. Teleport preparation and arrival bubble
9. Game launcher
10. Isaiah AI TV
11. OmniBox
12. Marketplace
13. Store builder
14. Holo Menu
15. Music player
16. 64-track studio
17. All American University
18. University concept network
19. Middleverse Workforce
20. OmniCare 360
21. Wallet
22. Notifications
23. Settings, privacy, blocking, reporting, and appeals

### Creator Studio

- Upload and scheduling
- Livestream control room
- Video editor
- Music and studio tools
- Store and merchandise
- World builder
- Rights and split sheets
- Analytics
- Sponsorship participation
- Advertising reports
- Payout reports
- Team access

### Business Console

- Business identity verification
- Storefront
- Product catalog
- Orders and returns
- AI sales assistant
- Holographic showroom
- Advertising campaign builder
- Customer support
- CRM
- Staff access
- Workforce tools
- Digital twin administration
- Analytics and billing

### Administration Console

- User and role administration
- Age-lane enforcement
- Feature flags
- Policy versions
- Partner approvals
- Asset approvals
- Rights review
- Moderation queues
- Appeals
- Fraud review
- Financial reporting
- Incident response
- Release evidence status

## 4. Backend service boundaries

The initial implementation may be a modular monolith, but boundaries must be explicit so services can later be separated.

### Core services

- `identity-service`
- `profile-service`
- `permissions-service`
- `age-lane-service`
- `accessibility-service`
- `feature-registry-service`
- `policy-service`
- `notification-service`
- `search-service`
- `translation-service`
- `audit-service`

### Social and media

- `feed-service`
- `livestream-service`
- `pk-service`
- `messaging-service`
- `party-service`
- `isaiah-tv-service`
- `omnibox-service`
- `media-processing-service`
- `rights-service`

### Worlds and games

- `enter-globe-service`
- `teleport-service`
- `world-registry-service`
- `twin-world-service`
- `timeline-service`
- `world-state-service`
- `matchmaking-service`
- `inventory-service`
- `quest-service`
- `replay-service`
- `device-profile-service`

### Commerce and money

- `wallet-service`
- `ledger-service`
- `pricing-service`
- `store-service`
- `catalog-service`
- `order-service`
- `returns-service`
- `advertising-service`
- `campaign-attribution-service`
- `fraud-service`
- `payout-service`

### Education, workforce, care, and enterprise

- `education-service`
- `credential-service`
- `workforce-service`
- `call-center-service`
- `omnicare-service`
- `cybersecurity-service`
- `crossborder-service`
- `realestate-service`
- `business-twin-service`

### Music and creation

- `studio-project-service`
- `audio-track-service`
- `stem-service`
- `microphone-profile-service`
- `mix-assistant-service`
- `mastering-service`
- `music-distribution-service`

## 5. Canonical data model

The minimum production schema should contain these domains.

### Identity

- users
- identities
- sessions
- roles
- permissions
- guardian_relationships
- age_lane_assignments
- accessibility_profiles
- blocked_users
- consent_records

### Social and media

- creator_profiles
- posts
- media_assets
- livestreams
- live_participants
- pk_matches
- channels
- programs
- comments
- reports
- moderation_cases
- appeals

### Worlds and games

- worlds
- world_versions
- timelines
- teleport_destinations
- teleport_sessions
- world_instances
- player_world_state
- quests
- inventory_items
- player_inventory
- parties
- matches
- replays
- device_profiles
- controller_mappings

### Assets and rights

- assets
- asset_versions
- asset_formats
- licenses
- rights_evidence
- likeness_consents
- university_branding_approvals
- partner_approvals
- asset_world_permissions

### Commerce and advertising

- businesses
- stores
- products
- product_variants
- inventory
- orders
- returns
- campaigns
- ad_inventory
- ad_placements
- creator_participation
- campaign_attribution
- holographic_product_assets

### Wallet and finance

- wallets
- wallet_balances
- ledger_entries
- purchased_credit_lots
- promotional_credit_lots
- creator_earnings
- reserves
- payouts
- fees
- revenue_share_rules
- financial_events

Purchased credits, promotional credits, and creator earnings must remain separate.

### Education and workforce

- institutions
- institution_classifications
- courses
- enrollments
- credentials
- portfolios
- employers
- jobs
- applications
- training_simulations
- work_sessions
- call_center_interactions

### Music studio

- studio_projects
- tracks
- track_takes
- stems
- buses
- microphone_profiles
- cue_mixes
- plugin_instances
- mix_versions
- master_versions
- split_sheets

### Release evidence

- release_requirements
- evidence_records
- external_reviewers
- certification_records
- test_runs
- evidence_expirations

## 6. Event bus

Important events must be published to a durable event bus.

Examples:

- `user.created`
- `age_lane.assigned`
- `accessibility.updated`
- `livestream.started`
- `pk.completed`
- `teleport.requested`
- `teleport.arrival_ready`
- `world.version_published`
- `asset.approved`
- `order.created`
- `payment.settled`
- `creator.earnings_available`
- `campaign.completed`
- `credential.issued`
- `security.incident_opened`
- `release.evidence_added`

Events must be idempotent, traceable, versioned, and replayable where appropriate.

## 7. Enter Globe transaction

The reference teleport flow is:

1. User selects destination, timeline, and experience mode.
2. Client sends destination, party, device, and accessibility context.
3. Identity and age-lane checks run.
4. Destination and partner approvals are validated.
5. Asset budget is selected for the device tier.
6. World instance is located or created.
7. Arrival bubble is generated and validated.
8. Player state is saved in the origin world.
9. Transfer token is issued.
10. Client connects to the destination instance.
11. Arrival bubble loads first.
12. Remaining world content streams in.
13. Transfer is committed or rolled back.

The flow must be safe against duplicate transfers, disconnects, partial inventory movement, and unauthorized item transfer.

## 8. Game and immersive runtime

The shared gameplay contract must cover:

- Character movement
- Camera
- Interaction
- Vehicles
- Combat and nonviolent modes
- Inventory
- Quests
- AI navigation
- Save/load
- Networking
- Replay
- Controller actions
- XR interactions
- Accessibility assists

Supported clients:

- Web 2D/3D
- Unity
- Unreal
- Godot
- Mobile AR
- VR/MR headset
- Volcano console
- Battle Deck
- Laser-tag accessory
- Holographic or approved fallback display

Protected commercial franchises must not be copied. Quantum Tag, creature battles, paranormal hunting, card battles, and mischievous-creature games must use original names, designs, stories, and assets.

## 9. Media architecture

### Video and live

- Ingest
- Transcoding
- Adaptive bitrate
- CDN delivery
- Real-time WebRTC rooms
- Recording and replay
- Captions
- Translation
- Moderation hooks
- Rights controls

### Isaiah AI TV and OmniBox

Both use the same media pipeline, but maintain separate content formats, programming schedules, audience controls, and monetization rules.

## 10. 64-track studio architecture

The studio requires:

- 64-track minimum session model
- Expandable virtual track count
- Multi-take recording
- Stem import/export
- AI stem separation
- Multiple microphones and audio interfaces
- Per-performer cue mixes
- Talkback
- Plugin hosting boundaries
- Reversible AI edits
- Versioned mixes and masters
- Rights and split-sheet metadata

Real-time audio processing must remain local or use low-latency regional infrastructure. Bluetooth audio should not be assumed suitable for live monitoring without measured latency evidence.

## 11. Advertising ownership and creator participation

TryAMM retains 100% of net revenue from TryAMM-owned inventory and service lines, including:

- AMM Billboard Showcase
- Enter Globe placements
- Portal sponsorships
- Platform-owned worlds
- Volcano interface inventory
- Isaiah AI TV owned channels
- World development
- Hosting
- Analytics
- Holographic conversion
- AI representative services

Creator participation may be up to 12% of a specifically defined creator-participation media line. Participation does not create ownership in TryAMM inventory, technology, worlds, or audiences.

## 12. Security architecture

Jacobie Vision is both an internal security program and a commercial service boundary.

Minimum controls:

- MFA
- Role-based access
- Least privilege
- Secrets manager
- Encryption in transit and at rest
- Security headers
- Dependency scanning
- SAST and DAST
- Malware scanning
- Script sandboxing
- Rate limits
- Abuse detection
- Fraud controls
- Backups
- Restore drills
- Incident response
- Immutable or tamper-evident audit trails

Generated world scripts may not access secrets, payments, host operating systems, private records, or unrestricted networks.

## 13. Deployment topology

### Environments

- Local development
- Shared development
- Staging
- Production
- Native-engine test environments
- Device laboratory

### Core infrastructure

- PostgreSQL
- Redis
- Object storage
- CDN
- Event bus
- Search index
- Analytics warehouse
- Media provider
- AI gateway
- Secrets manager
- Monitoring and alerting

Production must have regional backups, documented recovery targets, health checks, and a tested restore procedure.

## 14. CI/CD

Every pull request should run:

- Formatting
- Linting
- Type checking
- Unit tests
- Contract tests
- Migration validation
- Security scanning
- License scanning
- Build
- Release-evidence validation

Protected deployment workflows should require approvals for production.

Native engine workflows must archive build logs and checksums but cannot claim success without editor-generated artifacts.

## 15. Release gates

A shipped release requires genuine evidence for:

- Web and API production builds
- Unreal packaged build
- Unity player build
- Godot export
- Live backend and media deployment
- Final licensed art and performed audio
- Real controller and XR/device tests
- Accessibility participant testing
- Independent security review
- Legal and regulatory review
- Store, game-rating, radio, hardware, and other applicable certifications

File count, generated scaffolding, or unit tests alone cannot override these gates.

## 16. Delivery sequence

### Release 0: integrated shell

- Identity
- Age lanes
- Accessibility profiles
- Feature and world registries
- Enter Globe shell
- One feed
- One livestream room
- One store
- Release gate

### Release 1: proof journey

- Enter Globe
- Herrin twin
- StarVerse destination
- One Quantum Tag prototype
- One Battle Deck prototype
- Isaiah AI TV test channel
- AAU training simulation
- Middleverse supervised work simulation

### Release 2: creator and business economy

- Creator Studio
- Store builder
- AMM Billboard Showcase
- Holographic product conversion
- Wallet and transparent revenue rules
- Business subscriptions

### Release 3: immersive expansion

- Unity, Unreal, and Godot clients
- AR, VR, and MR support
- Controller matrix
- Native device testing
- Volcano and Battle Deck prototypes

### Release 4: regulated expansion

- Food delivery
- Rideshare
- Cross-border commerce
- Real-estate services
- OmniCare integrations
- Public blockchain only after audits and legal approval

## 17. Definition of done

A feature is done only when:

- The user flow works end to end.
- Authentication and permissions are enforced.
- Age-lane behavior is verified.
- Accessibility requirements are tested.
- Data is persisted and recoverable.
- Analytics and audit events exist.
- Moderation and appeals are covered.
- Security tests pass.
- Costs and margins are measured.
- Documentation is current.
- Rollback exists.
- Required external approvals and evidence are present.
