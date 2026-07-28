# AMM Quantum Enterprise + Partner Network

## Purpose

AMM Quantum Enterprise extends the existing TryAMM creator platform without replacing its authentication, creator, music, livestream, gift, Stripe or persistence flows.

## Wired user flows

- Create an organization and become its owner.
- Open an organization workspace and view members, plan requests and audit events.
- Add existing TryAMM users with admin, manager, member, analyst or developer roles.
- Request Business, Enterprise, Enterprise Plus or Global Enterprise review.
- Apply to the AMM Partner Network.
- Submit enterprise sales leads and estimated pipeline value.
- Enroll in AMM certifications.
- Submit marketplace listings for review.
- Open partner support tickets.
- Generate hashed partner API credentials; the raw secret is shown once.
- Browse approved partners and approved marketplace listings.
- Review Innovation Labs, Venture Network, Global Accelerator, Research Consortium, Industry Councils, Integration Marketplace, Managed Services and Accessibility Alliance concepts.
- Review commercial add-ons for AI Workforce, Digital Twins, Living Worlds, XR, analytics, security, support and training.
- Navigate into the enterprise portal from the main TryAMM homepage and signed-in creator dashboard.

## Starting commercial model

| Offering | Starting price |
| --- | ---: |
| AMM Business | $499/month |
| AMM Enterprise | $2,500/month |
| AMM Enterprise Plus | $10,000/month |
| AMM Global Enterprise | Custom multi-year agreement |
| AI Workforce | $500/month plus usage |
| Digital Twin | $25,000 implementation |
| Living World | $50,000 implementation |
| XR Collaboration | $2,500/month |
| Advanced Analytics | $1,500/month |
| Enterprise Security | $3,000/month |
| Mission-Critical Support | $5,000/month |
| Dedicated Training | $5,000/session |

These are starting estimates. High-value plans remain pending sales, security, legal, scope and contract review; the MVP does not automatically charge enterprise contracts.

## API modules

- `enterprise-api.js`: organizations, membership, subscriptions, partners, leads, certifications, listings, tickets, API keys, directory, marketplace and admin reporting.
- `enterprise-catalog-api.js`: expansion programs and optional enterprise add-ons.

## Frontend

`/enterprise.html` is a responsive command center that reuses the TryAMM bearer token stored by the main application. It exposes implemented organization and partner workflows rather than static marketing copy only.

## Validation

```bash
npm run check
npm test
```

The check command includes both enterprise backend modules and the enterprise browser controller.

## Enterprise-readiness gaps

The JSON store is an MVP persistence layer. Before representing the platform as enterprise-ready, migrate to PostgreSQL or Supabase with tenant isolation, constraints and migrations. Add SSO/SAML, MFA, invitation email, billing webhooks, usage metering, rate limiting, background jobs, backups, observability, retention controls, privacy workflows, security testing, incident response, SLAs, procurement workflows and regional data-residency controls.

## Separate Living Worlds milestone

The Living Worlds handoff requires reuse of the existing Three.js renderer, a registry-driven portal transition, budget rejection and a passing `renderer.info` memory-release assertion. This branch does not claim that separate acceptance milestone has passed.