# TryAMM Global Compliance and Launch Path

## Purpose

TryAMM launches by country and trade corridor. There is no single worldwide launch switch.

Each market remains blocked until all required evidence is complete, current, and approved by the responsible reviewer or authority.

## Global launch gates

1. Technology readiness
2. Localization readiness
3. Privacy and data protection
4. Consumer protection
5. Payments and settlement
6. Taxes and invoicing
7. Customs and trade
8. Age lanes and content rules
9. Accessibility
10. Employment and workforce rules
11. Advertising and sponsorship rules
12. Partner approvals
13. Security review
14. Legal sign-off
15. Operational readiness

## Country profile

Each country must have a machine-readable profile containing:

- country and region
- currencies
- supported languages
- launch wave
- launch status
- allowed products and services
- blocked products and services
- payment providers
- settlement currencies
- tax handling
- customs and importer requirements
- required disclosures
- age rules
- content restrictions
- advertising restrictions
- accessibility obligations
- employment restrictions
- data location and retention notes
- required partner approvals
- required legal reviews
- evidence links
- approver and approval date
- expiry or re-review date

## Launch status model

- `blocked`: required evidence or approval missing
- `sandbox`: internal and provider testing only
- `pilot`: limited invited users and controlled volume
- `limited`: production with restricted services or regions
- `open`: approved production launch
- `paused`: temporarily disabled
- `revoked`: approval withdrawn

## Service-level approval

A country may approve some services while others remain blocked.

Example:

- social viewing: approved
- creator uploads: pilot
- physical marketplace: blocked
- digital products: limited
- HoloCredits purchase: sandbox
- creator payout: blocked
- rideshare: blocked
- food delivery: blocked
- cross-border trade: pilot

## Trade-corridor gate

Every corridor requires:

- approved origin country
- approved destination country
- permitted product category
- verified seller
- buyer disclosures
- product classification
- origin records
- duties and tax estimate
- carrier integration
- customs-document checklist
- payment-provider approval
- settlement reconciliation
- sanctions and denied-party screening through approved providers
- return and dispute workflow
- successful test order
- successful test return or documented exception

## Launch waves

### Wave 1

United States and Canada.

Goal: validate production identity, localization, payments, taxes, seller onboarding, shipping, returns, customer support, security, and accessibility.

### Wave 2

Nigeria, Ghana, South Africa, Japan, South Korea, Philippines, and Singapore.

Goal: activate approved African and Asian corridors after partner, legal, tax, customs, localization, and settlement evidence is complete.

### Wave 3

Additional African, Asian, European, Latin American, Middle Eastern, and Oceania markets.

No country enters Wave 3 solely because another country in the same region passed.

## Global commerce journey

1. Seller selects home jurisdiction.
2. Business and beneficial-owner information is verified as required.
3. Seller selects product category and origin.
4. TryAMM evaluates destination eligibility.
5. Restrictions and required documents are displayed.
6. Landed cost is estimated.
7. Buyer accepts pricing, duties, taxes, delivery, and return terms.
8. Approved provider processes payment.
9. Required shipping and customs records are generated or collected.
10. Carrier accepts shipment.
11. Delivery and customs events are recorded.
12. Settlement becomes eligible after required checks.
13. Returns, disputes, and refunds use corridor-specific rules.
14. Audit and evidence records are retained.

## Compliance ownership

- Platform engineering owns enforcement mechanisms.
- Operations owns procedures and provider workflows.
- Security owns technical and fraud controls.
- Privacy owns data inventories, retention, and user rights.
- Finance owns reconciliation, taxes, reserves, and reporting.
- Regional counsel owns legal interpretation and sign-off.
- Licensed partners own regulated services delegated to them.
- Executive approval is required before a market changes to `open`.

## Regulated-service boundary

TryAMM must not present itself as a bank, money transmitter, customs broker, freight forwarder, insurer, healthcare provider, real-estate broker, transportation carrier, or accredited university unless the required authority has been obtained.

Approved providers should perform regulated functions until TryAMM has the appropriate licenses, contracts, staff, insurance, and controls.

## Evidence needed before launch

- current country legal matrix
- privacy and data-flow review
- tax configuration and test invoices
- payment-provider production approval
- payout and reconciliation tests
- logistics-provider approval
- customs and restricted-product tests
- localization and translation review
- accessibility test evidence
- child and teen safety review
- advertising review
- employment and contractor review
- incident-response coverage
- customer-support readiness
- successful pilot orders
- successful return and refund tests
- executive launch sign-off

## Automatic launch protection

The system must automatically block:

- unsupported currencies
- unapproved sellers
- unapproved destinations
- prohibited product categories
- expired partner approvals
- missing tax configuration
- missing customs data
- unsupported payout destinations
- missing age-lane controls
- missing privacy disclosures
- missing legal sign-off
- services marked blocked, paused, or revoked

## Definition of launched

A country is not launched because its flag appears in the interface.

A country is launched only when approved users can complete the intended production journey, operations can support it, external providers are active, and the evidence registry shows every required gate as passed.
