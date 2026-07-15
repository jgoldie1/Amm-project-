# Stubbs AI / Lyons Tech AI Brand Handoff

## Official identity

- Primary brand: **Stubbs AI**
- Technology endorsement: **Powered by Lyons Tech AI**
- Primary crest: Lion of Judah with American-flag face treatment, crown, and lamb
- Platform: TryAMM / All American Marketplace

## Required production files

Copy the approved binary assets into `public/brand/`:

- `favicon.ico`
- `stubbs-ai-rounded-180.png`
- `stubbs-ai-rounded-512.png`
- `stubbs-ai-icon-192.png`
- `stubbs-ai-icon-512.png`
- `stubbs-ai-maskable-192.png`
- `stubbs-ai-maskable-512.png`
- `stubbs-ai-social-card.jpg`

The text-safe fallback is `public/brand/stubbs-ai-fallback.svg`.

## Animation stack

- `public/brand.css` provides glow, depth, float, scan, watermark, and reduced-motion behavior.
- `public/brand-hologram.json` provides the reusable Lottie energy-ring composition.
- `public/brand-lottie.js` mounts the animation around the crest.
- `public/brand.js` injects manifest/favicon/social metadata, repairs missing images, adds header lockups, and adds stream/video watermarks.

The crest image must remain readable and undistorted. Lottie effects sit around the image rather than replacing it.

## Usage rules

1. Do not stretch, skew, rotate, recolor, or redraw the official crest.
2. Preserve clear space equal to at least 10% of the mark width.
3. Use the simplified square icon under 96px.
4. Use the full crest for splash screens, posters, social cards, stream backgrounds, and major hero sections.
5. Keep `Stubbs AI` and `Powered by Lyons Tech AI` together on official AI surfaces.
6. Do not place the full crest over visually busy content without a dark backing plate.
7. Honor `prefers-reduced-motion`; essential information cannot depend on animation.
8. Livestream watermarks must remain visible but must not cover captions, faces, controls, or sponsor disclosures.
9. Store ownership, source, licensing, and approval records in the Reusable Asset Library.
10. Export light, dark, monochrome, and print-safe variants before App Store, Play Store, broadcast, or merchandise production.

## Pages already wired

- HoloGPT homepage
- Holo ecosystem
- Creator and Streaming Launchpad
- Holo News and Weather

## Remaining page pass

- Login and registration
- Creator Portal
- Music Studio
- DramaBox
- Anime
- Marketplace
- Wallet and Aniyah
- Streaming Academy
- Gaming and Arena
- CEO/Admin dashboards
- Transactional email templates
- Discord announcements

## Acceptance checks

- Favicon appears in browser tabs.
- PWA install uses the correct 192px, 512px, and maskable icons.
- Apple touch icon is correct.
- Social preview displays the official crest.
- Lottie overlay loads without obscuring the lion or lamb.
- Reduced-motion mode disables decorative movement.
- Missing PNG assets fall back to the SVG.
- Stream watermark is readable on light and dark video.
- No page refers to the assistant only as AMM Intelligence when the branded experience is Stubbs AI.
