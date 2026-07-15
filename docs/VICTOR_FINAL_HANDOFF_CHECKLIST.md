# Victor Final Handoff Checklist

## Ready in code

- Stubbs AI and Lyons Tech AI universal brand loader
- Lion of Judah crest paths, SVG fallback, favicon, Apple icon and PWA manifest
- Lottie holographic energy rings, scan beam and reduced-motion fallback
- HoloGPT multi-provider router for OpenAI, Claude, Gemini and DeepSeek
- Quantum Zapier and Discord automation routes
- Stripe, Paystack and Flutterwave payment foundations
- LiveKit role-based token routes
- Meshy persistent 3D job pipeline
- Supabase migrations through 202607140014
- Aniyah cross-border and Africa commerce foundations
- Creator workstation, 64-track studio entry point and call-center tools
- Holo News, reusable assets, crawler/oracle, SEO and backlink systems
- Referral, campaign, social sharing and hashtag growth foundations
- Brand verification command

## Required binary asset installation

Extract `stubbs-ai-brand-assets.zip` into `public/brand/` and confirm these files exist:

- favicon.ico
- stubbs-ai-rounded-180.png
- stubbs-ai-rounded-512.png
- stubbs-ai-icon-192.png
- stubbs-ai-icon-512.png
- stubbs-ai-maskable-192.png
- stubbs-ai-maskable-512.png
- stubbs-ai-social-card.jpg

Run:

```bash
npm install
npm run brand:verify
npm run ci
```

## Required external activation

1. Merge pull request #3 after CI passes.
2. Apply every Supabase migration to the live project.
3. Add encrypted deployment secrets for Stripe, Paystack, Flutterwave, LiveKit, OpenAI, Claude, Gemini, DeepSeek, Meshy and Supabase.
4. Register signed production webhooks.
5. Create Stripe products and prices with `npm run stripe:bootstrap`.
6. Complete merchant, KYC, settlement and payout approval.
7. Configure the production LiveKit project.
8. Set provider budgets and usage alerts.
9. Run `npm run acceptance` against staging.
10. Test two-device livestreaming, payment idempotency, AI fallback and Meshy asset persistence.
11. Confirm the watermark does not cover captions, disclosures or controls.
12. Deploy the approved branch to tryamm.online.

## Final branding acceptance

- The exact supplied Lion of Judah, American flag and lamb artwork appears on the homepage.
- Small icons remain readable at 16, 32 and 48 pixels.
- The crest is not stretched, recolored or cropped improperly.
- Lottie effects surround the image without replacing or distorting it.
- Reduced-motion mode disables decorative animation.
- Social cards render correctly on Facebook, X, LinkedIn, Discord and messaging apps.
- Installed PWA icon uses the maskable safe zone.
- Stubbs AI is the product identity and Lyons Tech AI is the technology endorsement.

## Still external, not code defects

- Provider credentials
- Provider account approvals
- Settlement bank verification
- App Store and Google Play submission
- Professional legal, tax and financial review
- Licensed live news and weather feeds
- Final human translation review
- Production load, accessibility and security testing
