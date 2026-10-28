# Frontend Integration

Use the backend as the source of truth for age permissions.

## On login/onboarding
1. Collect DOB once where legally/product appropriate.
2. POST to `/api/onboarding/age-band`.
3. Store only the returned age band in client session state; do not trust client calculations for authorization.
4. Route users to Family, Teen, or Adult navigation.

## UI policy
- Hide inaccessible features for clarity.
- The backend must still deny inaccessible requests.
- Child navigation should omit adult livestreams, adult DMs, mature content, adult marketplace, unrestricted gifts, and creator monetization.
- Teen navigation should omit adult-only live/content/marketplace and unrestricted adult communications.
- Adult navigation can expose eligible full-platform functionality.

## Every UGC surface
Render Report, Block, and Mute controls where applicable and send actions to `/api/safety`.

## Account settings
Add a visible Delete Account action wired to `/api/safety/account-deletion-request` and provide a public web deletion/request URL for Play Console disclosure.
