# Stubbs AI Commerce v2 — tested upgrade staging

A new isolated local package `Stubbs_AI_Central_Marketplace_v2_TESTED.zip` was produced and checked with Node 22. It is available as an attachment in the associated ChatGPT conversation. This branch documents the staged review and does **not** claim that the local zip is tracked in GitHub.

14/14 local unit tests passed: identity checks, authorization, partner attribution, Stubbs AI merchant designation, pending order guard, amount and merchant mismatch guard, idempotent simulated settlement, refund revocation, buyer-only license manifests, tenant-specific partner dashboards, draft recurring services, no unapproved commissions, input validation.

The archive contains `core.cjs`, `core.test.cjs`, and `README.md`. It uses built-in Node APIs only. To work with these files in the repository, extract and commit the archive contents inside `business-templates/nekira-frances-hr-logistics/stubbs-commerce/v2` after review.

**NOT production-ready:** Local file persistence is not concurrency-safe; the payment verification boolean is a testing-only fixture boundary, not a real signature; session tokens are in memory; no payment processor, live checkout, template file delivery, recurring billing, or actual payouts. None of these files should be exposed to public traffic without replacing these components. Real commercial use requires licensing/content rights verification as well.

The old main app routes, production payment configuration, and StreetVerse worlds remain untouched.
