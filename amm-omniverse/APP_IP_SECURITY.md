# TRYAMM App / No-Code / Source-Code Protection Plan

This is an operational checklist, not legal advice.

## 1. Ownership and IP chain of title
- Keep written IP assignment/work-made-for-hire language for every developer, contractor, designer, agency, AI-assisted contributor and vendor where applicable.
- Keep dated source snapshots, release tags, design exports, architecture notes and authorship records.
- Register eligible software versions, original artwork, videos, music and documentation with the U.S. Copyright Office where useful.
- Use trademark protection strategy for TRYAMM and distinctive product/service names; use TM/SM before registration and the registered symbol only after registration.
- Do not claim ownership over third-party/open-source code, libraries, marketplace assets, maps, fonts or licensed content beyond the license actually granted.

## 2. No-code/vendor lock-in protection
- Export data, schemas, assets, automation definitions and configuration on a regular schedule where the vendor permits it.
- Maintain a documented migration map: domain/DNS, authentication, database, object storage, payments, email/SMS, analytics, workflows and webhooks.
- Avoid placing business-critical logic only inside a closed visual builder when the logic can be represented in version-controlled code or documented rules.
- Keep credentials and accounts under company-controlled email addresses, not a contractor's personal account.
- Record renewal dates, pricing dependencies, API limits and data-egress procedures for every SaaS dependency.

## 3. Repository and build protection
- Require MFA/2FA on GitHub, Vercel, Supabase, payment providers and domain registrar accounts.
- Use least-privilege access and remove stale collaborators promptly.
- Never commit production secrets. Use managed environment variables and rotate exposed credentials immediately.
- Enable secret scanning/dependency alerts where available.
- Pin/lock dependencies and maintain an SBOM or equivalent dependency inventory.
- Preserve signed/tagged releases, deployment SHAs and immutable backups so production provenance can be demonstrated.
- Protect main/release branches with review/status checks where practical.

## 4. Application/data security
- Use server-side authorization for money, rewards, payouts, orders, inventory adjustments and privileged actions.
- Enforce database row-level security and least-privilege service roles.
- Rate-limit authentication, AI endpoints, checkout, bids, messages and other abuse-sensitive routes.
- Log admin/financial/security-sensitive changes with actor, timestamp and before/after data where appropriate.
- Encrypt sensitive data in transit and use provider-supported encryption at rest.
- Keep backups and test restores.
- Maintain incident-response contacts and a security disclosure path.

## 5. Commercial protection
- Terms of Service, Privacy Policy, acceptable-use rules and seller/supplier terms should match actual product behavior.
- Supplier NDA/NNN/confidentiality controls should be paired with access logs and explicit permissions; a UI label alone is not legal protection.
- Use written vendor/supplier agreements covering confidentiality, ownership, quality, delivery, indemnity, insurance, recalls and dispute handling as appropriate.
- Payment, customs, carrier, warehouse and marketplace roles must be described accurately; do not imply licensing or regulatory status that has not been obtained.

## 6. Highest-priority gaps to verify
1. Confirm who legally owns every current production asset and repository contribution.
2. Confirm trademark clearance/filing strategy for TRYAMM and core sub-brands.
3. Register key software/artwork versions where strategically useful.
4. Turn on repository/provider MFA, branch protection, secret scanning and dependency alerts.
5. Produce an SBOM/dependency inventory and license review.
6. Verify Supabase authorization/RLS for every financial, user and commerce table/RPC.
7. Keep payment/reward settlement server-authoritative.
8. Add tested backup/restore and SaaS exit procedures.
9. Keep provider and regulatory status gates visible in logistics/import/export flows.
10. Schedule periodic security, privacy and IP reviews before major releases.
