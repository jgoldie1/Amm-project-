# Stubbs AI Marketplace v3 — Local Read-Only Storefront
**Status:** 19 passing local Node.js tests; not production deployed.

The runnable `Stubbs_AI_Marketplace_v3_READONLY_TESTED.zip` is provided in the ChatGPT conversation with the author. The archive includes prior v2 `core.cjs` and `core.test.cjs` plus v3 `storefront.cjs`, `storefront.test.cjs`, and `README-V3.md`.

## Implemented
- `/` Stubbs AI main template catalog (local HTTP demo).
- `/nekira` white-label Nekira Frances / Frances AI demo, retaining Stubbs AI as designated template seller.
- `/api/catalog` read-only product catalog.
- `/health` states true readiness flags: all live payment, subscription and downloads are FALSE.
- All POST requests reject with HTTP 405 to avoid unsafe fake settlement hooks.
- 19 automated Node 22 local tests pass.

## Local launch
```sh
node --test *.test.cjs
node storefront.cjs
```
Visit http://127.0.0.1:4173 and http://127.0.0.1:4173/nekira. No live customer information, Stripe payments, franchise sales, registered customers, actual license downloads or tenant-hosting is enabled.

## Before publishing
Implement account verification and durable DB; isolate tenants; cryptographically verify provider webhooks with replay protection; reconcile charges/fees/refunds; provide rights-cleared downloadable products; secure downloadable file link with expiration; consent and partner commission agreement; real subscriptions and tax treatment; private/public source license audit; staging deployment; backup/restore; mobile accessibility tests.

## Release safety
V3 package is a sandbox artifact; ZIP source has **not yet been committed to this repository branch**. This document tracks test evidence and next gates, not a deployment of v3. Preserve the existing TRYAMM and StreetVerse routes.
