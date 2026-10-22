# TRYAMM business separation register — authoritative development boundaries

## Business identity and operations
| Workspace key | Business | Owner / role | Scope | Payments |
| --- | --- | --- | --- | --- |
| raymond-jarreau | Raymond Jarreau independent business | Raymond, owner | Financial education, podcast, template store, advertising and inquiries | Raymond's own merchant account and contractual royalties |
| jacobie-vision | Jacobie Vision Cybersecurity | Jacobie's independent business | Security assessments, monitoring, security training, AI/call-center security | Jacobie's own merchant account and service contracts |
| omnicare360 | OmniCare360 | TRYAMM operation; Raymond proposed delegated operations lead | Provider onboarding, admin coordination and customer support | OmniCare360 / TRYAMM merchant account; separate approved compensation |
| middleverse-ai | MiddleVerse AI / AI Call Center | TRYAMM platform service | Multi-tenant AI and communications tools for licensed business customers | TRYAMM platform subscriptions, separate from customer business revenue |

## Mandatory separation rules
1. Each business gets its own website/domain, logo, brand, contact details, customer workspace, product catalog, contracts, payments, reporting and privacy policy.
2. Cross-business links are optional referrals only, never ownership, automatic co-branding, merged customer databases or shared payments.
3. No automatic owner account grants: OmniCare360 access for Raymond requires explicit TRYAMM authorization and least-privilege roles.
4. The AI Call Center must keep each business's approved knowledge, call queue, caller records and recording permissions isolated by tenant ID.
5. No healthcare patient information in Raymond or Jacobie workspaces; review HIPAA and provider agreements before any OmniCare360 PHI processing.
6. No Jacobie Vision paid services or revenue share without a signed customer agreement and confirmed payments.
7. Every business gets essential security controls even without buying Jacobie Vision's optional services.
8. No public claims of regulated insurance, securities, legal, medical or cybersecurity certification without verification.
9. StreetVerse participation is a separate entertainment integration and does not grant access to real customer or healthcare data.
10. Do not alter existing TRYAMM production routes, owners, or billing while adding independent business previews.

## Implementation state
- Raymond static website, podcast preview, template catalog and browser-only builder exist in source; no verified public deployment or checkout.
- Jacobie Vision static service preview exists in source; no verified public deployment, monitoring subscriptions or paid orders.
- OmniCare360 administrative operations and MiddleVerse AI call center are documented but not integrated as operational services.
- Passive security audit workflow exists in source; no successful workflow result or production stress test verified.

## Release acceptance tests
- Attempt cross-tenant read/write as each role; every unauthorized request must be denied and audited.
- Verify webhook transaction business ID and merchant ownership before ledger updates.
- Confirm referral links do not expose or transfer personal customer data.
- Verify all domains, business contacts and consent wording independently.
- Stage and load-test each business separately before rollout.
