# Stubbs Mobility 360 • HoloGPT powered by Stubbs AI — integration contract
Updated October 8, 2026

## Why a two-layer architecture?
HoloGPT powered by Stubbs AI is **useful but not required to start the store**. The public-facing Mobility 360 product guide works without a paid AI provider, a login or clinical information. Its limited, locally programmed guidance is deliberately not a generative AI engine.

The existing HoloGPT React assistant in TRYAMM is now available as an **optional handoff** at:
- Store: \`/mobility360.html\` (51 proposed items, all unsellable until approved)
- Guides + planned demonstration videos: \`/mobility360-learn.html\`
- Full assistant: \`/?open=hologpt&context=mobility360\` (opens main app, generic nonprivate preset input)

## Local shopping guide features (implemented)
- One-handed accessible floating "Ask Stubbs AI" button on both public pages.
- Four no-typing shortcut questions: one-handed tasks, caregiving, prices/orders, advanced equipment.
- Product suggestions from the current 51-item **concept catalog**; exclude the clinical-gated products.
- Plain-language discussion of listing/checkout status, supplier plans, caregiver/communication/vision categories and free guides.
- Optional read-aloud using built-in device speech synthesis when supported.
- Optional browser speech recognition on a user click when supported; display provider privacy notice.
- Escape to close, focus return, keyboard Tab trap, semantic dialogue labels and live message log.
- No localStorage, server API call, account requirement or collection of patient diagnosis in this guide.
- The local guide doesn't recommend medical treatments and never shows fictional prices, verified suppliers or active shopping cart actions.

## Full HoloGPT integration (implemented code, provider live state not confirmed)
The existing TRYAMM \`HoloGPTAssistant.tsx\` supports opening from the main app; the App shell lazy-mounts it when \`?open=hologpt\` is requested, and an explicit opener keeps it reachable after it is closed. The mobility360 intent opens the store. The dedicated AI backend (/api/ai/answer) has **not** been validated in this change, so truthful status is shown via its existing /api/ai/health check. No claim of 24/7 online intelligence is made.

Important privacy: the **full** HoloGPT has separate backend requests and saves its message history in browser localStorage. Only the in-store **local guide** avoids these. Customers should avoid sharing sensitive health details in a general chat; a future privacy and healthcare/legal review would be needed for any patient-level recommendations or records.

## Add-on capabilities staged rather than falsely marked operational
- Real-time inventory and a supplier scorecard, once data feeds and supplier agreements exist.
- The authorized image/video gallery, captions and product demo scripts already prepared.
- User-consented social content/creator-affiliate program after proper disclosures and sales controls.
- Voice-guided navigation, multiple languages and accessible ordering after practical device testing.
- Community seller self-onboarding and transparent B2B purchasing when contracts, verification and checkout are operational.
- Advanced rehabilitation equipment behind clinician and FDA category review. No clinical product selection from a chat bot.
- Offline knowledge FAQ with vetted links and detailed evidence, never AI hallucinated prices or recovery claims.

## Launch and safety gates
- Product photo rights and signed-off captions.
- Actual delivered prices, supplier inventory/warranty/returns, truthful fulfillment promises.
- Clinical and device compliance review, exact U.S. device class and evidence where relevant.
- Server-authoritative checkout and accessible failure states; never create a charge from unverified chat text.
- Real device tests with people using touch, voice, assistive tech and keyboard.
- Full CI/build status and independent public deployment verification after merge.

## No new website fee
These additions reuse tryamm.online and two existing public HTML pages. The $100 first sample budget remains **unspent**.

## Existing work reused
See:
- \`docs/STUBBS_MOBILITY360_SUPPLIER_PERMISSION_PACK.md\`
- \`docs/STUBBS_MOBILITY360_BRAND_REELS_AND_STORY_PACK.md\`
- \`docs/STUBBS_MOBILITY360_COMPLETE_EXPANSION_BLUEPRINT.md\`
- \`docs/STUBBS_MOBILITY360_PHOTO_VIDEO_WORKFLOW.md\`
