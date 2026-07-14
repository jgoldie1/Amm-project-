# TryAMM Global Commerce Completion

## Implemented

- Nigeria and Africa market profiles under `/api/memory/africa`.
- Localized pricing and feature plans under `/api/memory/global/plans`.
- Translation routing under `/api/memory/global/translate`.
- Authenticated escrow creation under `/api/memory/global/escrow`.
- Tax reserve previews under `/api/memory/global/tax/preview`.
- Authenticated compliance cases under `/api/memory/global/compliance/cases`.
- Supabase schema for escrow and compliance records.

## Tax and escrow rules

Tax reserve amounts are configurable only after the applicable seller, transaction, and jurisdiction rules are approved. A reserve is not automatically treated as tax paid. Release, remittance, refund, and reporting require ledger records and professional review.

Escrow releases may depend on buyer confirmation, carrier delivery, digital fulfillment, milestone approval, or a configured time release. Provider webhooks and idempotent ledger posting remain mandatory before money is released.

## AI legal and compliance boundary

The assistant can organize checklists, identify missing documents, draft templates, summarize rules, and route cases for review. It must not claim to be a licensed lawyer, guarantee compliance, or replace local counsel, tax professionals, regulators, or authorized identity providers.

## Production gate

1. Apply Supabase migrations.
2. Configure payment, translation, KYC, sanctions-screening, and tax providers.
3. Add dual-control approval for escrow release and tax remittance.
4. Add refund, dispute, chargeback, and appeal workflows.
5. Add country-specific legal and tax rule packs reviewed by qualified professionals.
6. Add recurring reconciliation, audit exports, monitoring, and incident response.
7. Publish current pricing, taxes, fees, plan limits, and regional availability in the customer interface.
