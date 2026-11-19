# TRYAMM — Soul Ascension Mobile RP, Raymond Jarreau, and StreetVerse acceptance
Date: 2026-11-18. Branch only; no production deployment.

## Product boundaries
Soul Ascension is an original All American Showcase production concept. "Soul Train 2.0" is informal comparison only. Soul Train trademarks and show format protections must be reviewed and licensed if the project intends affiliation or use of protected elements. Recreate original show branding, dances, artwork and music—not third-party recordings, logos, music, or footage.

## Mobile roleplay MVP — implemented on branch
- Entry from existing All American Showcase, connected to existing Star Studio / Isaiah AI TV / TRYAMM LIVE.
- One-hand accessible rehearsal UI with four role selections: artist, host, dancer, producer.
- Six cues: opening, interview, artist performance, dance spotlight, commercial, finale.
- Next/previous cue, manual rehearsal cue, captions on/off, local checkpoint saved to browser, JSON receipt export.
- These are **rehearsal states only**, not real 3D humanoid animation, recorded performance, audio playback, monetized ad insertion or a live stream.

## Missing to graduate MVP to an actual episode
1. Link and validate a licensed humanoid rigged GLB for each participant. Verify skeleton skin, animation clips, appearance consent, outfit rights, mobile render, mouth/facial animation and complete motion transitions; retain fallback geometry.
2. Create producer timeline with synchronized audio, multi-camera switching, role authority, spectator seat, host cue cards, dance floor and distinct 9:16 / 16:9 output.
3. Connect server-authoritative episode, casting and role records; age-based access controls, parental consent for minors, content moderation, upload scanning, and durable private media storage.
4. Connect consent and licenses for master recordings, musical compositions, synchronization, public performance, advertising, and user-generated artwork. Never stream nonlicensed music.
5. Connect LiveKit/OBS once account project, URL, token server, scopes, secure participant roles, private stream test, egress recording, playback, and stage permissions have been verified.
6. Commercial workflow: sponsor brief, approved creative, disclosures, spend cap, no targeting based on health data, ad placement review, reporting, creator payment terms, human-approved publication and charge. No claims of live ad sales until executed contracts.
7. Paid production: customer intake, business registration/terms, quote/approval, invoice and payment provider webhook, refund, payout ledgers and accounting.
8. Acceptance: one tap enter -> host intro -> agent/NPC response -> artist rig walks and performs -> licensed music -> dance cue -> approved commercial -> final cut -> record -> export vertical & horizontal -> verified playback -> protected preview -> report.
9. Test iPhone/Chromebook one-handed UI, keyboard focus, audio/captions, low bandwidth, crash recover, touch target sizes, rendering FPS, and saved progress.

## Raymond Jarreau website
- A design preview is wired from the Showcase. Do not publish a live standalone site or use invented background, portrait, services, phone, address, bio, testimonials or permissions.
- Obtain Raymond's approved business positioning, portrait and media, preferred contact, domain, booking needs, business/legal details and public appearance release.
- Then implement a real branded responsive page, booking and inquiry backend, spam/rate-limit protections, privacy/terms, analytics consent, creator/producer integration, QA and production launch.
- Existing `raymond-jarreau` tenant is defined in `lib/business-tenant-boundaries.js`, which explicitly notes the authorization policy is not installed in live routes. Do not assume that tenant authorization or isolation is deployed.

## Real StreetVerse asset verification
- `scripts/streetverse-asset-evidence.mjs` catalogs committed GLB/GLTF/FBX/OBJ files, checks GLB binary headers and glTF skins/animations/meshes where possible, and emits `asset-evidence/streetverse-asset-audit.json`.
- The GitHub workflow uploads a report; a rig/animation reference in a file is NOT proof BJ, Jacobie or LaTeasia visually renders or animates correctly in ChromeOS/iOS.
- Prior release failures include iPhone visual evidence, integrated storefront/delivery contract, and a dependency audit; track each independently and do not merge while critical gates fail.
- When assets are missing, retrieve from the authorized asset repository, uploads or creator export rather than substituting an unlabeled likeness.

## OmniCare360 boundary
Only public nonclinical care access exists in TRYAMM. Do not reuse social identity, ads, video channels, analytics or trading databases for patient data. Provider agreements, secure partner portals, HIPAA role determination, risk analysis and independent approvals are separate required work. A checklist checkmark is not proof of completion.
