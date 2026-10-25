# Stubbs AI Central Template Commerce — local workflow prototype
Run `node --test core.test.cjs` from this directory (Node 22+). Source code uses no third-party dependencies. No customer data, payments or real-world orders should be passed to this module.
Five requested features:
1. Canonical central template catalog with product SKUs.
2. Attribution partner/scout captured before checkout, readable only for that partner's view.
3. Order initially pending; a **local test fixture** simulates a verified payment and issues one nontransferable demo license. A duplicate event issues no new license; refund revokes license.
4. Draft recurring hosting, maintenance and AI call-center service records, not real billing.
5. Approved partner allowlist with Stubbs AI merchant designated for every template.
Do not expose `simulateSettledPayment` as a production route. `verifiedByFixture` only protects the demo against accidental live usage; it is not cryptographic verification. A production backend must validate webhooks using provider-signed events and trusted settlement reconciliation, persistent idempotency storage, user auth, tenant-level RBAC, fraud checks and signed license downloads. Partner commissions require written rates and cleared funds. No royalty payouts implemented.
Nekira retains her separate independent HR/freight service revenue. Stubbs AI collects reusable template sales only after a compliant processor integration.
