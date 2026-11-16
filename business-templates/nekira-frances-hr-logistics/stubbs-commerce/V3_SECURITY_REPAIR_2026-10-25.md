# Stubbs AI Marketplace v3 security repair

October 25, 2026. Local repaired ZIP: `Stubbs_AI_Marketplace_v3_REPAIRED_20_TESTS.zip`, attached to the ChatGPT conversation, **not committed as source to this GitHub branch**.

## Verified by local Node 22 execution
- Original 19 tests reproduced as passing.
- Fixed fixed demo owner password by generating cryptographically random startup secret.
- Fixed public `register` allowing role `owner` or `partner` by limiting public registration to buyer roles and adding a separate privileged provisioning method.
- Added privileged registration regression test.
- Final test suite: 20 passed, zero failed; JavaScript syntax checks passed.
- Read-only storefront still rejects browser POSTs. Stubbs AI remains designated merchant for template sales; Frances AI remains a branded assistant and referral source.

## Remaining critical blockers
This code is a **local demo**, not production. Initial-owner provisioning must be trusted and restricted; credentials/sessions require a secure identity provider, tenant-permission enforcement and persistent session policy; payment events require provider-signed verification and concurrency-safe SQL; product bytes must be licensed, uploaded and securely delivered; subscriptions, refunds, commissions and taxes require verified ledger reconciliation. No storefront payment buttons or purchase access should be enabled until these are complete. GitHub/Vercel checks were not all green in the earlier review; do not merge or deploy based on this report alone.

Keep TRYAMM and StreetVerse production routes unchanged.