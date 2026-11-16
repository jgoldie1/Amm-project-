# La Taeasia BeautyVerse — production booking implementation contract

Status: design specification only. This does not enable customer intake or payments.

## Existing beta
- `/streetverse/tampa` → creator and business discovery (flagged off by default).
- `/beautyverse/book-preview` → local date/time inquiry simulation; no personal details submitted.
- `/beautyverse/owner-preview` → public **demonstration**, not a protected dashboard. DO NOT connect private owner records to it until the entire route is covered by verified server authorization.
- CrossVerse / LIVE navigation does not prove ownership of an external streaming channel.

## Launch sequence
1. Confirm the business legal identity, shop authorization, salon and professional registrations, allowable services, working hours, booking rules, and data-controller consent.
2. Add business-scoped tables for `services`, `availability`, `bookings`, `booking_events`, and `payment_events` using the existing project auth framework.
3. Enforce row-level security and server authorization: business operators may only read/write their own business records. Customers can only view their own bookings. Reject anonymous owner operations.
4. Use a transactional booking reservation: unique provider + time slot exclusion, server-side timezone conversion (America/New_York), expiry/hold state, and idempotency keys; reject double bookings.
5. Validate payments using provider-signed webhooks. Treat checkout redirects and browser events as non-authoritative; only verified settled funds may create payable balances.
6. Send confirmations, reminders and cancellation links after booked state is committed; rate limit and audit requests. No false confirmations.
7. Maintain explicit merchant isolation from TRYAMM / other client stores. No commingled customer databases or payout balances.
8. Integrate CrossVerse referrals through signed attribution tokens, deduplicate events, and do not pay commissions until the originating order or booking is settled and refund period rules permit.
9. Add live-stream URLs only after La Taeasia confirms official ownership. Apply music, likeness and platform policies.
10. Deploy to staging with owner-approved feature flag, complete end-to-end device testing, capture last-known-good deployment, and require passing CI before main merge.

## Security acceptance tests
- Unauthenticated users get 401/403 from owner APIs.
- Cross-business IDs never reveal another operator's records.
- Duplicate simultaneous booking requests result in no oversell.
- Booking cancellation and refunds are idempotent.
- Forged webhooks cannot mark bookings paid or trigger agent earnings.
- No app data stored in localStorage or URL query strings.
- Disabled flag leaves current production StreetVerse visually and behaviorally unchanged.
- VR/AR unsupported-device and lost-session events return to standard 3D mode.

## Production dependencies
Real licenses, store account, approved services/rates, shop address/hours, domain, authorized merchant account, verified creator channel, staging deployment and CI build remain to be supplied or validated.
