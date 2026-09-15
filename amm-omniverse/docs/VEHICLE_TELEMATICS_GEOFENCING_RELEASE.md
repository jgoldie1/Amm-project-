# TRYAMM Vehicle Telematics + Geofencing

Status: BUILDING / NOT LIVE

This module defines the production boundary for consent-based vehicle tracking and geofencing across TRYAMM Car Share, fleet operations, delivery, roadside assistance, and approved mobility services.

## Required before real live tracking

1. Select an authorized GPS/telematics provider or authorized vehicle/device integration.
2. Obtain provider approval and credentials; keep credentials server-side.
3. Capture explicit vehicle-owner consent and permitted tracking purposes.
4. Implement server-side ingestion with authentication, replay protection, rate limits, validation, and provider-signature verification where supported.
5. Implement role-based access and an audit trail for precise-location access.
6. Configure retention so raw precise location is deleted or irreversibly de-identified when no longer required for the permitted purpose, except records required for legal/security/transaction obligations.
7. Implement geofence event processing for pickup, return, service-area, and approved restricted-zone operations.
8. Add provider outage/failover behavior and prohibit fabricated location updates.
9. Complete privacy, terms, insurance/protection, jurisdiction, and operational review.
10. Pass production end-to-end tests using an authorized enrolled vehicle before changing status to LIVE.

## Safety and privacy contract

- No covert person tracking.
- No public precise-location feed.
- Owner consent can be revoked, subject to legitimate active-trip/legal requirements.
- StreetVerse may visualize authorized operational state but is not the source of truth for physical vehicle location.
- Turo vehicles are not assumed trackable. Turo-related tracking requires separately authorized provider capabilities and permissions.
- Client applications cannot authoritatively declare a vehicle's physical location for payments, disputes, return verification, or enforcement decisions.

## Reusable platform flow

Authorized vehicle/device -> telematics provider -> authenticated TRYAMM server ingestion -> consent/purpose check -> normalized location event -> geofence engine -> operational event -> Mobility dashboard / permitted StreetVerse visualization.

## Initial geofence events

- ENTER_PICKUP_ZONE
- EXIT_PICKUP_ZONE
- ENTER_RETURN_ZONE
- EXIT_RETURN_ZONE
- ENTER_SERVICE_AREA
- EXIT_SERVICE_AREA

Restricted-zone events must be used only for lawful operational/safety purposes and must not automatically impose penalties without server-side policy evaluation and appropriate human/dispute safeguards.
