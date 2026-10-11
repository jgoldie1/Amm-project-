# Servants of Christ domain and launch

**Temporary ministry entry point:** `https://tryamm.online/servants-of-christ` (requires live-route verification)
**Future custom domain:** to be chosen by the owner; no domain purchase required to continue. `servantsofchrist.com` remains an unverified candidate.
**Registration status:** unverified. No purchase or DNS changes made.
**Alternatives to check:** servantsofchristministries.com, servantsofchristnetwork.com

## Current decision
Keep the TRYAMM ministry route as the temporary public entry point. Maintain the standalone website separately and move it to a new domain later without rebuilding. No DNS changes or purchases are authorized at this stage.

## Independent deployment
- Publish root: `standalone/servants-of-christ`
- Static entry: `index.html`
- Keep the TRYAMM root app and build pipeline unchanged.
- Connect a custom domain only after owner authorization, registrar verification, and successful preview testing.
- For privacy and security, configure HTTPS, content security policy, privacy/terms, backups and analytics consent as appropriate.
- Use an independent hosting project with a strict spending limit to avoid unexpected Vercel charges.

## Domain routing plan
- `/` ministry homepage
- `/watch` broadcast schedule and replay archive (planned)
- `/university` teaching and learning (planned)
- `/ofri-ai` secure assistant (planned)
- `/store` products and marketplace (planned)
- `/faithverse` links to the TRYAMM study experience (planned)

The standalone preview now includes separate static pages at `/watch/`, `/university/`, `/ofri-ai/`, `/store/` and `/faithverse/`. These are informational prelaunch pages, not production integrations. The TRYAMM ministry route is a separate React experience and does not automatically serve these static files.

## Release gate
- [ ] Domain available and authorized
- [ ] Pastor Kofi Ofori approves branding and content
- [ ] Verify official social accounts and media rights
- [ ] Deploy independent HTTPS preview
- [ ] Test navigation on iPhone and keyboard
- [ ] Verify owner contact details and privacy notices
- [ ] Implement protected AI backend and retrieval with citations
- [ ] Verify broadcast stream rights and schedule
- [ ] Verify payment merchant, products and donations before checkout
- [ ] Verify TRYAMM deep links and StreetVerse access
