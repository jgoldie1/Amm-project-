# TryAMM Africa Payment Mesh

## Purpose

Use multiple approved payment providers behind one TryAMM payment router so Nigeria and future African markets are not locked to one processor.

## Initial providers

### Flutterwave
Use for supported collections, bank-transfer payments, payouts, mobile-money flows, cross-border settlement tools, and broader African market coverage after account approval.

### Paystack
Use for supported Nigeria-first collections, card and bank channels, USSD, pay-with-transfer, subscriptions, refunds, and local or regional transfers after account approval.

## Routing model

```text
Payment intent
→ country and currency validation
→ service eligibility check
→ merchant and user verification
→ risk and fraud checks
→ provider capability check
→ provider selection
→ provider authorization
→ webhook confirmation
→ TryAMM ledger posting
→ settlement reconciliation
```

## Provider-selection rules

The router may consider:

- Country and currency
- Collection or payout transaction type
- Supported payment channel
- Provider production approval
- Provider health and incident state
- Expected fee and settlement time
- Refund and dispute support
- Transaction limits
- User or merchant eligibility
- Compliance restrictions

The cheapest provider must not be selected when it lacks required functionality, approval, or reliability.

## Nigeria payment methods

Subject to provider approval and current availability:

- Cards
- Bank transfer or virtual account
- Bank-account payment
- USSD
- Recurring subscriptions where supported
- Creator and seller bank payouts
- Refunds
- Business settlements

Mobile money should only appear in markets and networks actually supported by the selected provider.

## Ledger rule

No webhook directly edits a visible wallet balance.

```text
Provider event
→ signature verification
→ event deduplication
→ provider transaction verification
→ internal payment record update
→ double-entry ledger transaction
→ balance projection update
→ audit record
```

## Required data

Each payment and payout must store:

- TryAMM transaction ID
- Idempotency key
- Provider
- Provider transaction or transfer ID
- Provider reference
- Country
- Currency
- Gross amount
- Provider fee
- Tax where applicable
- Net amount
- Customer or recipient reference
- Transaction type
- Status
- Webhook event IDs
- Created, updated, settled, refunded, failed, or reversed timestamps
- Reconciliation batch

## Webhook security

- Verify provider signature or secret hash exactly as required by the provider.
- Read the raw request body before JSON mutation where necessary.
- Reject invalid signatures.
- Record and deduplicate event IDs.
- Return quickly and process asynchronously.
- Re-query the provider for final status before releasing value when required.
- Match currency, amount, customer, reference, and transaction state.
- Never trust browser redirects as payment confirmation.

## Payment status model

```text
created
pending
requires_action
processing
successful
failed
cancelled
refunded
partially_refunded
reversed
disputed
settled
```

Provider-specific states must map into these canonical TryAMM states without discarding the original state.

## Payout controls

- Creator available balance cannot become negative.
- Payouts must use an approved recipient record.
- Recipient changes require step-up authentication and risk review.
- Every payout receives a unique immutable reference.
- A retry must reuse the original transfer record instead of creating duplicate value.
- Failed or reversed transfers return funds to the correct internal payable account.
- High-risk or high-value payouts require manual approval.

## Provider failover

Failover is allowed only before the user completes a payment or before a payout is submitted.

Never submit the same payout simultaneously to Flutterwave and Paystack.

If provider state is uncertain:

1. Mark the transaction `processing`.
2. Query the original provider.
3. Wait for the signed webhook or final status.
4. Reconcile before retrying.

## HoloCredits and Reloaded Credits

Credits are issued only after a verified successful collection and ledger posting.

- Purchased credits reflect settled or sufficiently confirmed customer payments.
- Promotional credits are not redeemable cash unless a funded campaign explicitly says otherwise.
- Creator earnings are separate from purchased and promotional credit balances.
- Refunds reverse only the related economic value and must not create an unlimited negative creator balance.

## Reconciliation

Run automated daily reconciliation comparing:

- Provider transactions
- Provider payouts
- Provider fees
- Provider settlements
- Refunds and reversals
- TryAMM payment records
- TryAMM ledger entries
- Bank settlement totals

Any mismatch creates an operations case and blocks final accounting close for that batch.

## Compliance boundaries

TryAMM uses approved providers for regulated payment processing and payout rails. TryAMM must not describe itself as a bank, remittance company, or licensed money transmitter unless it obtains the required authority.

Production activation requires:

- Approved business accounts
- Production API credentials
- Provider contracts and permitted use cases
- KYC/KYB process
- AML and sanctions controls appropriate to the service
- Nigeria-specific legal review
- Privacy and data-processing review
- Tax and accounting review
- Security review
- Sandbox and live pilot evidence

## First Nigeria acceptance journey

```text
Nigerian user selects a TryAMM product
→ NGN quote shown
→ payment router selects approved provider
→ user completes card, bank, transfer, or USSD flow
→ signed webhook received
→ server verifies amount, currency, reference, and final state
→ ledger posts purchased credits or order payment
→ receipt issued
→ provider settlement reconciled
```

## Creator payout acceptance journey

```text
Creator completes verification
→ earnings become available
→ approved Nigerian bank recipient saved
→ payout requested
→ risk and limits checked
→ one provider selected
→ transfer submitted with unique reference
→ signed webhook or status query confirms outcome
→ ledger and payout statement updated
```

## Launch rule

Flutterwave and Paystack remain `sandbox` until each has production approval and successful live pilot evidence. One provider may become `open` while the other remains `sandbox`, `paused`, or `blocked`.