# Cloudflare Pages isolated HoloFon + Quantum Boost preview

This branch is designed to deploy **only** five static customer-facing pages plus an index. It never updates `tryamm.online`, changes its DNS, or publishes StreetVerse.

## Cloudflare Pages Git setup (Cloudflare account owner)
1. Cloudflare Dashboard → Workers & Pages → Create application → Pages → connect to GitHub.
2. Select repository `jgoldie1/Amm-project-` and choose production branch `release/holofon-quantum-pages-20261029` for this **separate Pages project**. This setting does not affect Vercel or GitHub main.
3. Build command: `node scripts/build-holofon-pages-preview.cjs`
4. Build output directory: `dist-holofon-pages`
5. Root directory: repository root. Framework preset: None. Environment secrets: none.
6. Deploy and verify the generated `*.pages.dev` URL in the Cloudflare dashboard.

## Release gates
- Test home index and five HTML routes on desktop and phone.
- Customer email buttons only open the user's own email app; messages are not automatically sent.
- HoloFon SIM activation, carrier billing, and payments remain explicitly disabled.
- All plans/prices shown are examples or proposals, not carrier-approved offers.
- No remote control, login collection, or claim of provider speed changes.
- Do not enable a custom domain or copy DNS records without separate approval.

## Local build check
Run `node scripts/build-holofon-pages-preview.cjs`, then review `dist-holofon-pages`.
