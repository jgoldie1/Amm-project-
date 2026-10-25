# Template sale proceeds — Stubbs AI is the platform seller

**Scope:** all Nekira storefront sales of reusable Business-in-the-Box website templates (not Nekira's separate freight, HR or service invoices).

1. Template browsing and demos can be branded as Nekira Frances / Frances AI.
2. The template's canonical SKU, licensed creator and checkout are owned/operated by **Stubbs AI** under the correct legal business entity.
3. The buyer's payment must be processed in Stubbs AI's verified merchant account; no Frances AI checkout account is configured for template sales.
4. Only a verified processor webhook and server-side payment record can mark a sale paid, grant a license, provision a buyer copy, or calculate a commission.
5. Frances AI may assist with marketing/customer support, and Nekira can earn an optional partner or referral commission **only under an approved written agreement**. Do not promise a share in the UI before approval.
6. Business Scouts similarly receive only approved commissions from settled eligible sales, with attribution recorded prior to checkout and fraud/refund adjustments.
7. Customer-specific logos, licensed photos and private business data must not be included in resold base templates without rights.
8. Refunds, chargebacks, taxes, license updates and support belong to the named merchant of record under disclosed terms.
9. All business accounts, customer data, billing and funds must be logically and technically isolated.
10. No actual payments are enabled by these files. Confirm Stubbs AI legal payee, processor account, SKU terms and checkout credentials before integration.

## Acceptance tests for future backend
- Template purchase routed to Stubbs AI merchant account; Frances merchant account cannot receive this SKU.
- Customer order remains pending without verified webhook.
- Duplicate and out-of-order webhooks cannot duplicate receipts, licensing or payouts.
- Refund or chargeback reverses commissions and entitlement per terms.
- Every payout ledger amount reconciles against actual settlement, processor fee, tax and refund.
- Separate freight/HR sales remain in their own authorized business merchant accounts.

## Suggested storefront label
“Business-in-the-Box templates provided by Stubbs AI. Nekira Frances HR Logistics and Frances AI provide demonstrations and customer assistance. Final purchase, license and support terms are shown at checkout.”
