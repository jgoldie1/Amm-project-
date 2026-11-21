# November 19 — dual-host recovery runbook

Owner: TRYAMM LLC. Source of truth: GitHub issue #724 and launch issue #718.

## Verified baseline (2026-11-15)
- Existing Vercel project `amm-omniverse`: Vite, Node 24, `live:false`, latest production deployment `CANCELED`.
- Vercel preview subdomains have SSO protection. A generated URL alone does not establish public access.
- StreetVerse guided Chicago → creator marketplace offline test passed; full release fails missing BJ V15 GLB binary. Never disable the verification gate.

## Lane A — recover existing Vercel
1. Owner checks Vercel billing/invoice and account standing in the official account dashboard; record invoice number and paid/pending state privately, not in repo.
2. Contact support from authorized account. Ask whether restriction is billing, usage, policy, SSO or deployment configuration, and request specific reinstatement steps and expected time.
3. Do not open another Vercel account to evade restrictions. Do not deploy to production until account standing and build checks are confirmed.
4. Once cleared, test a preview using the correct project/team, branch, environment and domain settings. Verify unauthenticated visitor access, form delivery and mobile behavior.

## Lane B — independent hosting (only if account is in good standing)
1. Choose provider and record cost, allowed commercial use, DNS support, rollback, static SPA rewrites and environment handling. Obtain owner authorization before any charge.
2. Use GitHub as the source; build in a reviewed CI environment with Node 24, `npm ci --ignore-scripts`, `npm run typecheck`, and `npm run build` (verify scripts and dependencies first).
3. Never move secrets to `VITE_*` client variables, commit .env files or export private databases to static hosting.
4. Stage separate verified public previews for TRYAMM, Jacobie and BeautyVerse; stage StreetVerse as beta only.
5. Verify each URL in a signed-out browser, mobile and Chromebook, including forms reaching the owner. Keep quote-only mode until server-side checkout is independently verified.
6. Keep current DNS unchanged until new destination passes and rollback is documented. Record TTL, original records and exact revert procedure privately.

## Four independent launch gates
| Site | Required evidence | If blocked |
|---|---|---|
| TRYAMM | Public mobile URL, accurate packages, successful inquiry and operator receipt | Static information/quote-only; never claim checkout |
| Jacobie | Birthday page URL, working media, RP preview link, mobile buttons | Birthday landing page; clearly label RP preview |
| BeautyVerse | LaTeasia Monroe name, Tampa presence, Chicago connection accurately described, tested inquiry | Static brand/services page; no unverified bookings or address |
| StreetVerse | Verified BJ V15 model, movement/vehicle/NPC/mission/reward/save Chromebook receipt | Beta-only offline preview, no full 3D certification |

## Provider-agnostic evidence log
Record for each site: target provider, Git SHA, build result, public URL, anonymous access result, screenshot/time, contact form delivery, mobile acceptance, rollback location, release decision. A passing build alone is not proof of launch.

## Stop conditions
- Account suspension remains unresolved and deployment would circumvent provider restrictions.
- Unverified payment processor, missing backend authorization, or leaked client secret.
- Missing BJ V15 release binary for StreetVerse 3D release.
- No owner-approved new provider account, costs or DNS changes.
