# Jinn Tap Pay — Tax Responsibility + Paperless Receipt Operating Model

## Core rule
Jinn/Tap Pay is the payment experience, not a blanket tax-liability shield.

For every transaction, TryAMM must determine and record:
- seller of record / merchant of record
- marketplace-facilitator status for the jurisdiction
- who calculates tax
- who collects tax
- who remits tax
- who issues tax documents / reporting where required
- who bears refunds/chargebacks
- who receives the merchant payable

## Marketplace sellers
Where law treats TryAMM as a marketplace facilitator and requires TryAMM to collect/remit marketplace tax, TryAMM must do so and issue the seller the required certification/statement where applicable.

Where the merchant remains responsible for tax, the merchant onboarding agreement and dashboard must clearly say so.

Never show businesses a generic promise that “TryAMM handles all your taxes.”

## Jinn/Tap Pay checkout flow
Customer taps card/phone or pays through another PayRouter rail
→ server creates payment intent/order
→ Tax Responsibility Engine resolves jurisdiction + seller type + product/service tax class
→ tax calculation applied by approved provider/rules
→ verified payment succeeds
→ receipt generated
→ customer chooses SMS / email / in-app receipt
→ merchant payable + TryAMM revenue + tax liability + processor fees posted separately
→ refund/chargeback reversals post back to the same accounting dimensions

## Paperless receipts
Default receipt channels:
1. SMS link
2. Email
3. In-app receipt wallet
4. Optional QR view
5. Optional printer integration if merchant wants paper

The business should be able to operate without a receipt printer.

Receipt should include, as applicable:
- merchant legal/display name
- business/location address or required contact information
- transaction date/time
- order/transaction ID
- line items
- discounts / HoloCoupons
- subtotal
- taxes and required fees
- tip
- total
- payment method descriptor (masked)
- refund/cancellation policy link
- support contact
- tax registration information where required
- digital receipt verification link / QR

## Merchant dashboard tax center
Each merchant should see:
- gross sales
- taxable sales
- non-taxable/exempt sales
- tax collected
- tax remitted by TryAMM where applicable
- tax merchant remains responsible for
- marketplace-facilitated sales
- direct/off-platform sales if imported
- downloadable monthly statements
- export for accountant/bookkeeper

## No-printer benefit
Paperless-first checkout reduces printer hardware, paper, ink, maintenance, receipt loss, and support friction. Customers receive searchable receipts on their phones, while merchants retain an auditable digital record.

## Business requirements still needed
- merchant legal/business verification
- tax classification by product/service
- jurisdiction rules
- tax-engine/provider integration
- marketplace facilitator analysis by launch jurisdiction
- refund/chargeback handling
- accounting exports
- tax-document/reporting workflow
- privacy/consent policy for SMS/email receipts

## Africa
Do not assume U.S. marketplace-tax rules apply. Each African launch country needs its own tax/VAT, invoicing, e-receipt/e-invoice, withholding, payment, and reporting configuration.
