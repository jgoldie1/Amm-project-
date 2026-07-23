# TryAMM Delivery Growth Playbook

## Launch without a national fleet
Start with pickup plus approved third-party fulfillment adapters such as DoorDash Drive/Drive On-Demand and Uber Direct where contracts, API access and geography permit. Keep provider adapters interchangeable. Never scrape consumer apps or automate against unsupported interfaces.

## Unit economics per order
Before confirming a delivery, calculate:
- basket subtotal and merchant economics;
- taxes;
- external provider quote;
- payment processing cost;
- refunds/fraud reserve estimate;
- TryAMM service fee;
- discounts/subsidies;
- expected contribution margin.

If expected margin is below the configured floor, reprice, use another provider, offer pickup, or consume an explicitly approved promotional subsidy. Do not silently lose money to create the appearance of free delivery.

## Affordable customer experience
Use transparent small fees and optional membership rather than a large hidden markup. Possible tools: minimum-order thresholds, scheduled-delivery discounts, merchant-funded promotions, sponsored delivery zones, loyalty rewards and OmniCredits.

## TryAMM+ membership
A membership can bundle reduced platform fees, eligible free/discounted delivery, bonus OmniCredits, marketplace benefits and creator/media perks. Eligibility must be shown before checkout. Free delivery means the customer delivery charge is waived; the underlying courier cost still has to be funded.

## Merchant acquisition flywheel
1. Give merchants a TryAMM business page and directory listing.
2. Add direct ordering and pickup first.
3. Enable delivery through eligible partner adapters.
4. Offer QR ordering and creator/social campaigns.
5. Add loyalty/referrals and customer re-engagement with consent.
6. Add catering/group orders and scheduled deliveries.
7. Cross-sell marketplace goods and creator collaborations.
8. Highlight Black-owned businesses while keeping the directory and marketplace open to everyone.

## AI DeliveryOps
HoloGPT/AI may help forecast demand, flag bad addresses, compare provider quotes, detect anomalies, summarize support cases and recommend routing. It must not fabricate delivery status or override safety/compliance gates. Every automated pricing/routing decision should be auditable.

## Provider abstraction
Create a common adapter interface: quoteDelivery, createDelivery, getDelivery, cancelDelivery, webhookVerify, proofOfDelivery and healthCheck. Provider-specific credentials stay server-side. Webhooks must be signed/verified where supported and idempotent.

## Growth before owned fleet
Do not launch a TryAMM-owned driver network merely because delivery volume exists. Require a city-level readiness gate: demand density, positive unit economics, insurance, driver/courier classification review, background/safety program, commercial auto requirements, local/state licensing, incident response, dispatch reliability and support staffing.

## Additional opportunities
- Pharmacy/grocery delivery only through appropriately compliant partners and product rules.
- Same-day marketplace delivery for local sellers.
- Returns pickup.
- B2B courier/document delivery.
- Event/concert merchandise delivery.
- HoloRide + Delivery driver app reuse, but separate regulatory/product modes.
- Campus and senior-accessibility delivery programs.
- Creator-branded food/product drops.
- Africa expansion through country-specific licensed logistics/payment partners rather than assuming U.S. rules apply globally.

## Production gates
No production claims until provider contracts/credentials, payments, database, maps/geocoding, customer support, refund/dispute logic, privacy/security, webhook reliability, analytics and end-to-end QA are complete.
