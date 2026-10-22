# StreetVerse Chicago — FiveM proposal compatibility and regression lock

Source: owner-provided master technical integration plan (October 2026).

## Architecture decision
TRYAMM's existing StreetVerse at tryamm.online is a **browser Three.js/React** game. The supplied `hud_toggle.lua`, `nfc_twin.lua`, FiveM `server.cfg`, `.ymap/.ybn/.ytyp`, `oxmysql`, `ox_lib`, and OneSync resources are **FiveM-specific**. They cannot be loaded into the existing browser game or Vercel runtime as-is. Do not install these in the browser app or change production routing.

The proposed 77-neighborhood FiveM game is a **separate optional server product**, requiring its own rights review, hosting, licensing and client installation. No Rockstar affiliation is implied. The uploaded cost and timeline estimates are unverified and are not a release commitment.

## Compatible, incremental browser-game additions
1. **AR discovery HUD (client-only):** accessible toggle; 15m proximity filtering of approved, server-provided storefront anchors; no NFC/QR data embedded in code; opt-in and performance throttling. Show only verified merchant links.
2. **PK visual events:** provider-specific, authenticated ingestion service; verify signatures/authorization, rate-limit and deduplicate; normalize to allowlisted visual-event types; publish to scoped game sessions, not every user. Never use unauthenticated `io.emit` or wildcard CORS from the pasted example.
3. **Digital twins:** server verifies an order and one-time claim token, stores a unique claim transaction, then grants a cosmetic entitlement to the authenticated user. NFC tag IDs alone are not purchase proof. Never accept arbitrary client `licenseKey` or `itemCode` to grant items.
4. **Commerce:** use TRYAMM's existing payment verification and commission ledger; evaluate WooCommerce/Tebex separately before introducing extra payment processors or revenue splits. Never grant rewards based on an unverified webhook.
5. **Neighborhood content:** load optimized browser GLB assets via existing asset runtime and content registry. FiveM asset formats cannot be rendered directly in Three.js.

## Release safety requirements
- Keep all work on a draft PR until build, typecheck, lint, security, smoke, and existing V8 no-regression tests pass.
- Preserve the current 3D renderer, safe HTML fallback, login, movement, vehicles, missions, reels, marketplace and authoritative ledger.
- Add each subsystem behind a disabled-by-default flag; include keyboard/touch accessibility and an immediate disable path.
- Validate external payload schemas and authorization, add replay/idempotency tests, and ensure all network requests fail closed.
- Profile memory, frame time and WebGL context-loss recovery on mobile Safari and Android.
- Require owner approval before merging or deploying.

## Not yet implemented by this document
FiveM runtime, AR UI, PK provider connectors, NFC entitlement endpoints, WooCommerce/Tebex integrations, 77 detailed neighborhoods, and one-click reel publishing. This document is a guarded implementation plan, not proof of a working launch.
