# TryAMM Advanced Alpha and Beta

## Advanced Alpha — implemented in this branch

- Green syntax-validation CI before the Alpha additions
- AMM Intelligence with Claude and local fallback
- Holo Menu, Holo Search, Lottie overlays and creator launchpad
- Stripe, Flutterwave and Paystack adapters
- LiveKit token endpoint and Meshy task adapter
- Playable Yogihoo browser vertical slice with touch and controller input
- Mobility onboarding, dispatch, trip-event and safety prototypes
- Work-from-home workstation page at `/workstation.html`
- Call-center agent, queue and customer-interaction records
- AI-safe interaction summarization scaffold
- DAW project and plugin-agent records
- Shopify connection and product-import scaffolding

Alpha remains a controlled demonstration. JSON storage, demo identities and mock providers must not be treated as production customer systems.

## Advanced Alpha exit gate

Alpha is complete only when all of these are true:

1. GitHub Actions passes on the current head commit.
2. `npm install`, `npm run check` and `npm start` succeed.
3. `/api/health`, `/`, `/platform.html`, `/holo.html`, `/yogihoo.html` and `/workstation.html` load.
4. No secret is committed to source control.
5. Mock and connected-provider states are labeled accurately.
6. Core accessibility checks pass by keyboard and one-handed operation.

## Beta build gate

Beta requires production-grade replacements for the demo layer:

### Identity and database
- Supabase Auth
- PostgreSQL migrations
- Row-level security
- Roles for user, creator, agent, supervisor, vendor, driver, courier and administrator
- Audit logging and account deletion/export

### Call center
- Approved telephony/WebRTC provider
- Consent-aware recording
- Real queues, presence, routing and escalation
- CRM and ticket persistence
- Supervisor monitoring with legal and policy controls
- Quality reviews, workforce scheduling and payroll integration

### Workstation and DAW
- Plugin sandbox and permission model
- Audio upload, waveform, non-destructive edits and export
- Approved VST/AU bridge strategy for desktop builds
- Cloud project versions and collaboration
- AI outputs labeled and reviewed before publishing

### Shopify and commerce
- Shopify OAuth
- Webhook verification
- Product, inventory, order and fulfillment synchronization
- Variant support, tax, shipping, refunds and conflict reconciliation
- Stripe/Flutterwave/Paystack transaction ledger

### Games and Holo systems
- Authenticated saves and collectible ownership
- Authoritative multiplayer server
- Matchmaking, anti-cheat and moderation
- Cast receiver application
- WebXR scene rendering and tracked input
- Final original art, audio and licensing records

### Mobility
- Licensed operating entities and jurisdiction review
- Commercial insurance
- Real identity/background-check providers
- Maps, routing, geocoding and live location
- Driver/courier contracts, inspections and training
- Emergency response, incident handling and customer support

### Operations
- Staging and production environments
- Automated API, accessibility and security tests
- Monitoring, alerting, backups and disaster recovery
- Privacy policy, terms, community rules and data-retention policy

## Beta acceptance target

A limited invited cohort can create accounts, use the major flows, complete test payments, save data persistently, report issues and receive support without manual database edits or unsafe mock behavior.