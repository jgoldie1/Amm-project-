# La Teasia BeautyVerse × StreetVerse Tampa × CrossVerse integration specification
Status: PROPOSED — not deployed or verified playable. 2026-10-22.

## Owner-approved identity and branding
- La Teasia's approved portrait and Florida/Chicago character artwork are brand-specific; never substitute unrelated stock portraits or sell them as a generic template.
- Separate Vercel project `la-teasia-beauty-house` under owner's account until migration. Current project creation is blocked by Vercel 403; do not modify TRYAMM production.
- Website preview ZIP is available in conversation artifacts, not committed here.

## CrossVerse identity contract
`creator_id` (UUID), `account_id`, `brand_id`, `avatar_asset_id`, `consent_record_id`, `world_id`, `session_id`. Identity and ownership verified server-side. Explicit opt-in for cross-world visibility.
World destinations: `streetverse-tampa-fl`, `streetverse-chicago-il`, `beautyverse-florida`. Reuse current game world's actual IDs after auditing runtime; do not assume these placeholder IDs exist.
Portal request: check session, ownership, destination readiness, moderation/age rules, inventory/XP ledger; server issues short-lived signed travel ticket; destination consumes once; on failure return to original world without losing progression.
No live crossverse teleport or Tampa map is asserted.

## Tampa RP/RPG milestone
1. Playable Tampa arrival zone and beauty shop exterior/interior with optimized assets, collision, spawn and mobile controls.
2. La Teasia character using approved art as reference; avatar rig and animation need actual asset pipeline and approval.
3. Beauty-business missions: customer consultation, styling, stock sourcing, safe deliveries, creator event, live fashion show.
4. Server-authoritative inventory, XP, rewards, cosmetics, purchase verification, and moderation.
5. CrossVerse Tampa ↔ Chicago portal, fallback and regression tests; do not connect incomplete maps to production.

## Multi-platform streaming
One creator session to Twitch and other approved endpoints using an RTMP/RTMPS relay or authorized multistream provider. Store OAuth tokens server-side encrypted; never in static HTML or client bundle. Twitch/YouTube/Facebook/TikTok capabilities, stream-key permissions, policies and account eligibility must be verified individually. Support independent destination toggles, live-status heartbeat, chat aggregation only where authorized, moderation, replay consent, latency/cost monitoring and clear stop-all control.
The existing website's 'watch live' action is a placeholder until verified profile/channel URLs are supplied. No Twitch connection or simulcast is asserted.

## Commerce and editable brand
Product sample catalog is not real inventory. Choose ONE commerce backend (Shopify or WooCommerce) initially; connect verified stock, prices, taxes, shipping, order webhooks and payment confirmations. Admin editing requires authenticated roles, persistent storage and published revisions. Do not accept real orders until end-to-end tests pass.

## Acceptance tests
- Approved real/character art renders on mobile and desktop; accessible alt text.
- Brand owner can log in, edit and publish safely with rollback.
- Tampa spawn works, travel ticket is single-use, XP persists after crossing, disconnect returns safely.
- Simulcast to authorized test destinations, stop-all, token revocation, no stream-key leaks.
- Store purchase only marked paid after verified server webhook.
- Separate Vercel project has a public reachable URL; no production TRYAMM changes.
