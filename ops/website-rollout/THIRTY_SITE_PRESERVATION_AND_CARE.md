# TRYAMM Site Preservation — 30-site program
Status: Protective development policy; does NOT mean backups, restores, billing or customer sites have been verified.

## Program commitments
- Preserve 30-site roster and labels: **free/community**, **accessibility/disability-supported**, and **commercial**. Never silently convert free or accessibility commitments into paid subscriptions.
- No paying customer confirmed yet. Advertise available assistance truthfully; request consent before billing.
- Each business retains its own website content, media, customer data, access and agreed export rights.
- PHP fatal errors usually stop a site from loading rather than deleting content; independently investigate any actual content loss, overwrite, upgrade or misconfigured deployment.

## Critical release protocol
1. Identify exact client-site owner and production repository/deployment, plus all persisted content locations (database, uploads, domain, DNS, hosting, third-party).
2. Save versioned, encrypted, access-restricted backups of **database AND uploads/files AND config**, in a distinct failure domain; define retention and ownership. A Git commit is NOT a database or uploaded-media backup.
3. Perform a **restoration drill** into an isolated test environment: pages, links, forms, media and owner access must be validated. Record timestamp and evidence.
4. Staging-only PHP/plugin/theme/runtime updates. Run version compatibility checks, static checks, site snapshots, smoke tests and comparison before approval.
5. Deploy with immutable versioned releases, health checks and rollback of code; for destructive schema changes require forward/backward-compatible migration and separate tested database restore.
6. Disable bulk overwrite, bulk deletion, auto-upgrades of critical plugins, and cross-tenant editing until safe controls and tested approvals exist. Never rely on a single admin or tenant shared credentials.
7. Monitor errors, expiry and site uptime; alert owners but never promise 100% uptime.
8. For a broken WordPress site, use official recovery mode and logs, then restore from a verified backup when required; never promise a PHP crash alone caused data loss.

## Business lines — proposed, not operational
- **Free preservation starter:** education, documented backup checklist and manual export guidance, including no-charge accessibility/community support as authorized by TRYAMM.
- **Website Health Check:** potential one-time assessment (price after pilot/cost validation), audit backups, updates, security, availability and recovery readiness.
- **Website Care:** optional subscription for *actually scheduled* monitored backups, staging tests, approved updates, restoration drills and reporting; a plan must not be sold before capacity and restore verification.
- **Emergency recovery:** separately quoted best-effort service after prework and clear data-loss limits; no guaranteed restoration when no valid backup exists.
- **Migration to TRYAMM Website OS:** opt-in, proven export, owner approval and acceptance before switching DNS; no forced migration.
- Separate customer ledger/hosting/merchant account/permissions per business; service charges never tied to disability benefits or free-template access.
## Next concrete acceptance gates
- Inventory the 30 websites: site URL, platform, owners, free/paid status, backup locations, failure history, permission, recovery priority.
- Pilot protection on ONE consenting nonproduction or owner-controlled website; generate a backup and prove recovery.
- Record redacted before-and-after evidence before introducing preservation as a billable service.
