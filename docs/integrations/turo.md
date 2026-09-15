# Turo integration status

Status: PLANNED / ADAPTER REQUIRED

TRYAMM should expose peer-to-peer vehicle rental/car-sharing through a provider-adapter layer. Turo is the first named provider target, but this repository must not claim an official Turo API integration until approved credentials/API access exist.

## Product flow

1. User opens Mobility / Car Rental in TRYAMM.
2. User enters pickup location, dates, vehicle class, and filters.
3. TRYAMM mobility service queries enabled rental/car-sharing provider adapters.
4. Turo results may be shown only when an authorized integration or permitted linking mechanism is configured.
5. Booking, identity checks, insurance/protection, deposits, cancellations, taxes, and host/guest rules remain provider-controlled unless TRYAMM separately implements and legally supports those functions.
6. TRYAMM records only the minimum referral/booking metadata needed for attribution, support, analytics, and lawful accounting.

## Required production configuration

- Provider approval / authorized Turo integration method
- Server-side credentials if supplied by provider
- Redirect/deep-link allowlist
- Attribution/referral configuration if available
- Privacy/retention review
- Terms and trademark/brand review
- Error, timeout, rate-limit, and provider-outage handling

## Architecture contract

Use a generic `MobilityRentalProvider` adapter so Turo does not become a hard dependency. The adapter should support search, vehicle details, booking handoff, booking-status lookup when authorized, and provider health. Keep provider secrets server-side.

## Release gate

Do not label Turo `LIVE` until an end-to-end production test verifies a real permitted search-to-booking handoff. Until then the Founder Command Center should report `Turo: PLANNED / PROVIDER ACCESS REQUIRED`.
