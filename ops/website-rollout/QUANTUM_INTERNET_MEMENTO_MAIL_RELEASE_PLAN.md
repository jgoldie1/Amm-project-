# Quantum Internet + Memento + Quantum Mail — Release Plan

## Existing scope and nonduplication
- Earlier branches: `agent/quantum-internet-mail` and `feat/quantum-internet-convergence-hardening-20261001`. Preserve, inspect, and selectively port only validated pieces; do not blindly merge whole branches.
- New front end: `public/quantum-internet.html`; HoloGPT links to it.
- Archive planner: `lib/quantum-internet-memento.js`; test `test/quantum-internet-memento.test.js`.
- Historical Time Dial and two-year links use public archive lookups, not independent archived storage or reconstructed history.
- Memento protocol is RFC 7089; central Time Travel aggregator ended in 2025. Maintain our own archive directory and verify each provider individually.

## Verified product boundaries
- Memento is an open standard; never claim ownership of original specification or archive holdings.
- External archive links are informational, not evidence that a specific snapshot exists.
- Holographic 3D replays are future licensed-asset experiences, not recorded historical evidence.
- Current Quantum Mail composes a message in the visitor's local email app; it does not host a mailbox, send automatically or support proprietary encryption.

## Business mail activation — zero-cost-first
1. Verify ownership and DNS administration of the chosen business domain, and inspect existing MX records without changing them.
2. Evaluate Zoho Mail free custom-domain eligibility (region, 5-user limit, plan capabilities, data residency), pricing subject to live quote; do not subscribe automatically.
3. If eligible, create the provider account with explicit owner signup and domain verification, then prepare MX/SPF/DKIM/DMARC settings supplied by provider.
4. Back up existing records and ensure no existing mailboxes receive incoming mail before any MX change. Obtain owner approval and only then change DNS.
5. Test inbound delivery, outbound delivery, SPF/DKIM pass, DMARC alignment, bounce handling, phishing/spam filters and recovery controls.
6. Add mail assistants only after OAuth/provider permissions, privacy, consent, rate caps, per-tenant separation and audit logs are built.

## Future Memento upgrade
- Build server-side safe-fetch API only with SSRF restrictions, DNS/IP checks after resolution and redirects, response size/time limits, archive allowlist, caching and rate controls.
- Persist verified capture date, source archive, URL and rights metadata.
- Compare authorized snapshots with citations; HTML sanitization and sandboxing are required.
- Add 3D replay only for owned/licensed material and label reconstructed scenes.

## Acceptance before production
- Root and Omniverse CI gates green; existing carousel and birthday alpha failures investigated.
- Verify archive link tests, responsive one-handed input, screen reader labels and browser behavior.
- Preview deployment and route parity verified under correct Vercel project/team.
- Do not merge or deploy a failing draft release PR.
- Market as preview / early access until end-to-end tests pass.
