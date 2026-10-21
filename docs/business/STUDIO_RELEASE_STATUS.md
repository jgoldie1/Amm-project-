# Business operations release — 2026-10-21

Consolidates the connected storefront, freight, Jacobie, execution and memory changes with current main. Preserves current StreetVerse and media fixes.

## Implemented

Approved business offers snapshot services, prices and commission references into each order. Customer intake and revisions are idempotent. Owner execution uses the approved snapshot; publication requires review of the exact saved draft hash. Paid orders require matching verified live Stripe evidence; test evidence cannot unlock publication. Public sites are sandboxed static HTML. Customers can download deliverables and a handoff record.

The dashboard separates verified net receipts, unpaid commission accruals and manually recorded expenses. Paid external agent execution remains disabled. Budgets warn about recorded expenses and do not cap third-party provider invoices. API responses are scoped to the authenticated owner/customer and database tables are service-only with RLS enabled.

## Activation still required

Production Vercel project amm-omniverse needs securely configured SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET. Existing live-charge/reconciliation/transfer-verification gates remain enforced. Commission disbursement is not implemented. Do not activate real checkout until refund/dispute reconciliation and transfer verification are complete.

The private backup endpoint requires CRON_SECRET and the database server key. It is deliberately not scheduled while these are missing. Owner downloads and automated exports are capped at 3 MB and 1000 orders and fail rather than silently truncate. Automated backups retain seven days. These application exports are not a full database backup or a tested disaster-recovery service; database recovery, restore drills and external failure notification remain required before broad launch. The dashboard warns on failed/missing/stale backup evidence.

No credentials, real charges, agent transfers or owner impersonation were used in local tests. Owner login still requires the actual owner to complete secure sign-in.

## Verification

Local PGlite integration covers account isolation, intake conflict detection, approved-service retrieval, durable execution, exact review, test-payment denial, payment-gated publication, revisions, backup export and browser-role denial. Unit tests cover payment/refund commission calculations and API role checks. Existing executor and private-memory tests pass. Supabase migration 20261021150021 applied; all six studio tables have RLS enabled and browser SELECT revoked, anonymous RPC execution denied, and the backup bucket is private.
