# Nigeria Payment Implementation Contract

## Purpose

This document defines the provider-neutral backend contract for Flutterwave and Paystack inside TryAMM. It converts the Africa Payment Mesh architecture into concrete API, ledger, webhook, payout, reconciliation, and release requirements.

## Non-negotiable rules

1. Provider redirects are never treated as final proof of payment.
2. Every collection, refund, transfer, and payout is verified server-side.
3. Every external transaction maps to one immutable TryAMM transaction ID.
4. Every webhook is authenticated, deduplicated, persisted, and processed asynchronously.
5. No provider adapter may directly change a user-visible wallet balance.
6. Wallet changes occur only through balanced ledger entries.
7. A payout may be attempted through only one provider at a time.
8. Available creator balances may not become negative.
9. Purchased credits, promotional credits, creator earnings, business earnings, reserves, and pending settlements remain separate.
10. Provider-specific states are preserved alongside TryAMM canonical states.

## Canonical collection states

- created
- pending
- requires_action
- processing
- succeeded
- failed
- cancelled
- refunded_partial
- refunded_full
- disputed
- reversed
- expired

## Canonical payout states

- requested
- eligibility_review
- recipient_validation
- queued
- submitted
- processing
- paid
- failed
- reversed
- cancelled
- manual_review

## Provider adapter interface

Each provider adapter must implement:

- createCollectionIntent
- verifyCollection
- parseAndVerifyWebhook
- createRefund
- verifyRefund
- createRecipient
- validateRecipient
- createPayout
- verifyPayout
- fetchSettlementReport
- fetchTransaction
- getCapabilities
- getHealth

## Collection request

Required fields:

- tryammTransactionId
- idempotencyKey
- customerId
- country
- currency
- amountMinor
- purpose
- orderId or walletFundingId
- successUrl
- cancelUrl
- metadataAllowlist

No secret, private note, health record, full identity record, or raw payment credential may be placed in provider metadata.

## Collection verification

Before fulfillment, TryAMM must confirm:

- provider reference matches the stored payment intent
- provider status is successful
- amount matches exactly
- currency matches exactly
- customer or intended account matches
- transaction has not already been fulfilled
- transaction is within the approved provider capability and country scope
- fraud and compliance holds are clear

## Webhook pipeline

1. Receive raw webhook request.
2. Verify provider signature or secret hash.
3. Reject invalid requests.
4. Generate event fingerprint.
5. Check event deduplication store.
6. Persist immutable raw event and normalized metadata.
7. Return provider-appropriate acknowledgement quickly.
8. Queue event for asynchronous processing.
9. Re-fetch the transaction from the provider when required.
10. Update canonical payment or payout state.
11. Post balanced ledger entries if and only if conditions are satisfied.
12. Emit audit and domain events.

## Ledger posting examples

### Purchased HoloCredits

Debit: provider settlement receivable
Credit: customer purchased-credit liability

### Creator purchase allocation

Debit: customer purchased-credit liability
Credit: creator pending earnings liability
Credit: TryAMM earned revenue
Credit: transaction reserve where required

### Provider fee

Debit: payment-processing expense
Credit: provider settlement receivable

### Refund before creator availability

Debit: creator pending earnings liability
Debit: TryAMM refund expense or earned-revenue reversal
Credit: customer refund payable or provider settlement receivable

No posting may be represented only as an editable balance field.

## Payout workflow

1. Creator or seller submits payout request.
2. System checks available balance, verification, limits, country, recipient, holds, and provider eligibility.
3. System reserves the requested amount.
4. System selects exactly one approved provider.
5. Provider request is submitted with an idempotency key.
6. Status remains processing until verified.
7. Success moves reserve to paid.
8. Failure releases reserve back to available balance when safe.
9. Reversal creates a visible statement adjustment and manual review where required.
10. Uncertain status never triggers automatic payout through another provider.

## Routing rules

Routing considers:

- approved country and currency
- transaction type
- supported payment method
- production or sandbox approval state
- provider uptime and latency
- settlement timing
- transaction and daily limits
- refund support
- payout support
- risk level
- business rules

Failover may route only new eligible payment intents. It must not duplicate in-flight collections or payouts.

## Reconciliation

Daily reconciliation must compare:

- provider transaction list
- provider fee records
- provider payout list
- refund and reversal records
- settlement reports
- TryAMM payment records
- TryAMM ledger postings
- bank settlement deposits

Every mismatch creates a case with:

- provider
- transaction or settlement reference
- expected amount
- actual amount
- currency
- mismatch type
- owner
- severity
- investigation status
- resolution

## Required APIs

- POST /payments/intents
- GET /payments/intents/{id}
- POST /payments/{id}/verify
- POST /payments/{id}/refunds
- POST /payout-recipients
- POST /payouts
- GET /payouts/{id}
- POST /webhooks/paystack
- POST /webhooks/flutterwave
- GET /admin/payments/reconciliation
- POST /admin/payments/reconciliation/{caseId}/resolve

## Required events

- payment.intent.created
- payment.processing
- payment.succeeded
- payment.failed
- payment.refunded
- payment.disputed
- payment.reversed
- payout.requested
- payout.submitted
- payout.paid
- payout.failed
- payout.reversed
- settlement.received
- reconciliation.mismatch.opened
- reconciliation.mismatch.resolved

## Security requirements

- Production credentials stored only in an approved secret manager.
- Separate sandbox and production credentials.
- Key rotation procedure.
- Least-privilege access.
- Step-up authentication for payout-recipient changes.
- Rate limiting and abuse controls.
- Full audit trail for administrative overrides.
- No secret values in logs.
- Encrypted sensitive data at rest and in transit.

## Nigeria sandbox acceptance tests

1. Successful Paystack NGN collection.
2. Successful Flutterwave NGN collection.
3. Invalid signature rejected.
4. Duplicate webhook creates no duplicate value.
5. Amount mismatch blocks fulfillment.
6. Currency mismatch blocks fulfillment.
7. Collection verification survives delayed webhook delivery.
8. Successful Nigerian bank payout through each independently approved adapter.
9. Failed payout returns the reserved amount correctly.
10. Reversed payout produces a statement adjustment and case.
11. Provider outage routes only new payment intents.
12. Concurrent payout attempts are rejected by lock and idempotency controls.
13. Daily settlement reconciliation balances to provider and bank records.
14. Promotional credits never become withdrawable creator cash.
15. Available creator balance never becomes negative.

## Pilot gate

Nigeria payments remain in sandbox until all of the following exist:

- approved Flutterwave or Paystack business account for the specific use case
- production credentials in secret management
- Nigeria KYC/KYB and AML process
- privacy and legal sign-off
- security review
- small live collection test
- small live payout test
- refund and reversal test
- settlement and bank reconciliation
- incident rollback test
- executive pilot approval

Flutterwave and Paystack must be approved independently. One provider's approval does not authorize the other.
