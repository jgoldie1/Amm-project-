# TRYAMM Car Share — production architecture

Status: BUILDING / NOT LIVE

TRYAMM Car Share is the provider-independent peer-to-peer vehicle marketplace for TRYAMM. Turo or other permitted providers can remain optional adapters; the native marketplace must not depend on any one external provider.

## Renter path
Search → vehicle details → dates/pricing → identity + driver eligibility → protection/insurance eligibility → server booking request → host acceptance where applicable → server payment authorization → pickup/check-in → trip → return/check-out → damage/dispute window → settlement/review.

## Host path
Host onboarding → identity/business checks where required → vehicle ownership/authorization → registration and required documents → vehicle condition/equipment → protection/insurance eligibility → pricing/availability → listing review → AVAILABLE → booking management → check-in/out evidence → settlement.

## Required services before LIVE
- Server-authoritative inventory, availability and booking state machine
- Identity and driver-eligibility provider(s)
- Vehicle/ownership verification
- Legally reviewed protection/insurance program for each launch jurisdiction
- Server-side payments, authorization/capture/refund and host settlement
- Taxes/fees/accounting rules
- Cancellation/no-show/refund rules
- Damage claims and dispute operations
- Roadside/emergency/support procedures
- Fraud/risk controls and account recovery
- Consent, privacy, retention and deletion controls
- Accessibility and mobile certification
- Customer support and incident escalation
- Terms, host/renter agreements and jurisdiction review

## Authority boundaries
The browser/app may quote estimates and collect intent. It must not independently approve eligibility, mark a vehicle verified, capture money, settle a host, approve a claim, or declare a booking final. Those transitions belong to authenticated server services with audit records.

## Data minimization
Do not retain raw identity documents in TRYAMM when a verification provider can retain them under an appropriate agreement. Store only the minimum verification result/reference needed for lawful operations. Apply defined retention schedules to trip, transaction, fraud, tax, claims and support records.

## Provider adapters
External providers such as Turo may be exposed through a generic adapter only when permitted. Their booking, insurance/protection, identity, cancellation and marketplace rules remain provider-controlled unless a written integration permits otherwise.

## Release gate
Founder Command Center must report `TRYAMM Car Share: BUILDING / NOT LIVE` until an end-to-end production certification verifies search, eligibility, vehicle verification, protection/insurance, payment authorization, booking, pickup, return, refund/cancellation, dispute/claim handling and settlement in the launch jurisdiction.
