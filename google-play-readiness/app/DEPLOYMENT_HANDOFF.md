# Victor deployment handoff

1. Pull branch `agent/google-play-age-safety-layer`.
2. Run the reference app and tests in `google-play-readiness/app`.
3. Port `lib/policy.js` and `middleware/auth.js` into the production API layer first.
4. Replace the in-memory `store.js` with Supabase repositories and apply the SQL schema already provided in `google-play-readiness`.
5. Guard all production live/chat/DM/gift/marketplace/creator endpoints with the same server-side age permissions.
6. Wire LiveKit token issuance only after age/audience checks.
7. Keep Google Play digital-goods billing separate from physical-goods/services payment flows.
8. Map the frontend age band to the current TryAMM navigation/feed components instead of duplicating the UI.
9. Add production deletion processing, data retention, reviewer demo accounts, and policy URLs.
10. Build/sign the Android AAB only from the real production app after the above is integrated.

## Definition of done

- CHILD cannot reach adult live/chat/DM/marketplace/gift routes by direct API calls.
- TEEN cannot enter adult-only discovery or adult direct-message flows.
- ADULT cannot directly message protected minor accounts unless a specifically reviewed product rule permits it.
- moderation works server-side even when frontend controls are bypassed.
- account deletion is reachable in-app and via web workflow.
- no production secrets are committed.
- Play Console declarations match the actual shipped SDKs and data flows.
