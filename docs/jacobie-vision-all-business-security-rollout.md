# Jacobie Vision Cybersecurity — all-business rollout

## Actual controls in repository
- Passive security audit script: scripts/jacobie-business-security-audit.cjs
- PR / manual GitHub Action: .github/workflows/jacobie-business-security.yml
- Existing TRYAMM protections observed: lib/jacobie-root-swarm-shield.js (in-memory per-IP rate limiting) and lib/tryamm-origin-shield.js (optional edge-origin HMAC protection).
- These are partial controls, not proof that all sites are secure. Edge shield is monitor-only unless configured/enforced; in-memory rate limiting does not work globally across multiple instances.

## Minimum included security baseline for every participating business
1. HTTPS and valid TLS; secure hosting configuration and domain ownership checks.
2. Individual owner accounts with MFA, least privilege, recovery process and no shared global passwords.
3. Dependency and secret scanning; secrets stored in environment vaults, never HTML or Git.
4. Backups, restore drills, deployment rollback and uptime/incident monitoring.
5. Content Security Policy, safe headers, accessible forms, input validation, spam/rate limits.
6. Tenant isolation, secure file uploads, privacy notices and data retention.
7. Payment processor hosted checkout and verified webhooks; no card storage in websites.
8. Consent, encryption and vendor review for AI/call center/recordings; healthcare safeguards for OmniCare360.

## Optional paid Jacobie Vision products — proposed, not yet for sale
- Website Security Starter: onboarding checklist, basic configuration and monthly reporting.
- Business Shield: monitoring, vulnerability triage, backup/restore checks and incident playbooks.
- Compliance Readiness: evidence collection and qualified specialist referrals (not a certification).
- AI and Call Center Security: tenant isolation tests, prompt-injection evaluations, privacy controls and call recording consent review.
- Security training: owner education and phishing awareness using authorized accounts.
- Monthly subscription fees and one-time setup fees require Jacobie's agreement, scope of work, invoicing, SLAs and approved price list. Do not claim Jacobie already receives revenue.

## Stress test plan — permissioned and staged
- Local static tests and security checks first.
- Staging load tests with capped virtual users and test data, never unapproved production floods.
- API tests: auth brute-force resistance, rate-limit behavior, request size limits, replay prevention, idempotent checkout and webhook validation.
- Multi-tenant isolation: prove Raymond users cannot access OmniCare360 or other businesses.
- Recovery: database backup/restore, rollback, and failure injection in staging.
- Accessibility/mobile browser checks and failed-payment recovery.
- Collect p50/p95 latency, error rates, throughput, CPU/memory and costs. Set stop thresholds before execution.

## Open gaps
- Need authoritative inventory of every independent site, deployment, and owner; this repository-only audit cannot cover external hosts.
- Need confirmation of each site's permitted testing scope.
- GitHub Action added but not observed running; no test results or production load measurements claimed.
- No Jacobie Vision customer portal, signed services agreement, billing, automated reporting or live monitoring integrated yet.
- No change to existing production routes or blanket security enforcement.

## Suggested commercial model
Include baseline protections free with each site; offer opt-in paid monthly monitoring and specialized services. Use verified invoices/transactions and a signed partner agreement to assign revenue to Jacobie Vision. Never force cross-sell or represent unperformed scans as completed.
