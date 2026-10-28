# Victor Handoff — TryAMM Google Play Readiness

A portable age/safety foundation has been added on branch `agent/google-play-age-safety-layer`.

## Included
- server-enforced age band derivation: CHILD / TEEN / ADULT
- feature authorization middleware
- onboarding age-band API reference
- report/block/mute/account-deletion/moderation API reference
- livestream age checks
- Supabase/Postgres schema additions
- frontend age-gate reference
- environment-variable template
- production integration checklist

## Required in the real TryAMM production repository
1. Adapt the `db` interface calls to the current Supabase/data layer.
2. Mount the routers into the current Express/Next backend/API architecture.
3. Port age-gate UI logic into the actual React/Next interface.
4. Apply feature guards to every existing livestream/chat/gift/marketplace/creator API endpoint.
5. Implement guardian/consent requirements based on final legal/product decisions and selected Play target audience.
6. Inventory current SDKs and data collection before completing Google Play Data Safety declarations.
7. Review current digital purchase flows for Google Play billing compliance.
8. Build and sign the Android AAB from the actual production frontend.
9. Do not claim this staging module alone makes the app Google Play approved; validation must be performed against the complete shipped app.
