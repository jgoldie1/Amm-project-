# TRYAMM Telematics Provider + Revenue Architecture

Status: BUILDING / NOT LIVE

TRYAMM should support two vehicle-connectivity lanes behind one provider-neutral telematics adapter.

## Lane A — connected-vehicle API

Prefer an authorized connected-vehicle API for compatible vehicles when it provides the required signals and commercial permissions. This can avoid dedicated aftermarket hardware and reduce deployment friction.

Candidate providers must be evaluated using current commercial quotes, supported makes/models, signal availability, refresh limits, consent/authentication flow, geographic coverage, uptime/SLA, privacy terms, and permitted car-share/fleet use.

## Lane B — dedicated telematics hardware

For vehicles that cannot provide the required authorized connected-car signals, support approved GPS/telematics hardware. Cost modeling must include device cost or lease, installation, cellular/connectivity, platform subscription, replacement/RMA, maps/event processing, support, and hardware amortization.

## Revenue model

TRYAMM may offer an optional Fleet/Tracking subscription after production certification. Potential capabilities include:

- consent-based vehicle location
- pickup and return geofencing
- mileage/trip operations
- maintenance/diagnostic alerts when authorized signals exist
- fleet availability dashboard
- roadside-assistance coordination
- operational event history

Retail pricing is not locked. Founder Command Center pricing must be calculated from executed provider agreements and measured usage rather than copied from public marketing pages.

The contribution model is:

`per-vehicle contribution = retail subscription - provider - connectivity - maps/events - support reserve - hardware amortization`

Do not represent contribution as profit. Company overhead, taxes, legal/compliance, insurance/protection, fraud, customer acquisition, engineering, and other operating expenses remain outside this variable-cost calculation.

## Marketplace economics

Car Share rental marketplace fees are separate from the telematics subscription. A rental platform fee can be modeled independently from tracking revenue, but actual customer/owner fees must be disclosed and approved before launch. Payment processing, taxes, protection/insurance, refunds, disputes, and provider charges must not be hidden inside an advertised owner payout.

## Provider strategy

Keep Smartcar-like connected-vehicle APIs, Geotab/Samsara-like fleet telematics, and future providers behind replaceable adapters. Named vendors are evaluation candidates, not claims of a partnership or live integration.

The provider selection process should obtain at least two or three current commercial quotes before production pricing is locked. Prefer API connectivity when compatible and economical; use dedicated hardware when required by vehicle capability or operational reliability.

## Platform reuse

The same authorized event pipeline can serve TRYAMM Car Share, fleet operations, delivery, roadside assistance, and permitted StreetVerse visualization. Each product must use purpose-scoped authorization; access in one product does not automatically authorize location access in another.

## Release gates

Before monetizing telematics:

1. Executed/authorized provider access.
2. Real all-in cost model.
3. Consent and privacy flow.
4. Authenticated server ingestion.
5. Role-based precise-location access and audit logs.
6. Retention/deletion automation.
7. Geofence and outage tests.
8. Billing/subscription server authority.
9. Support and dispute procedures.
10. Authorized real-vehicle end-to-end production certification.

Until these pass, report `Telematics: BUILDING / NOT LIVE` and do not collect a tracking subscription fee.
