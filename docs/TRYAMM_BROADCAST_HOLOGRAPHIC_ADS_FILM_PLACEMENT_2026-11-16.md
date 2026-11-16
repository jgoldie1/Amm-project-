# TRYAMM Broadcast Network — holographic advertising, film product placement and commercials
Date: 2026-11-16
Status: integration specification; no production activation or paid campaigns.

## Already present in repository (verified on main)
- `amm-omniverse/src/runtime/HoloAdsRevenueRuntime.ts`: `HOLO_AD_PRODUCTS` contains All American Network Sponsorship (channel/show/LIVE placement), Holo XR Brand Experience (3D StreetVerse placement), and Creator & Business Boost; billing requires server-confirmed payment state.
- `amm-omniverse/src/components/OmniBoxStoryStudio.tsx`: episodic storyboard and Holo Drama handoff; currently render status `outline-only`, not a finished video.
- `amm-omniverse/src/components/LiveCenter.tsx`: LIVE/showcase/podcast/gamecast interface using provider configuration.
- `amm-omniverse/src/runtime/VerseRadioRuntime.ts` and `amm-omniverse/src/components/VerseRadioDock.tsx`: rights-aware audio playback and station controls.
- Some production role and product-placement components have appeared on broad development PRs but were not located on main during this check; inventory and preserve rather than duplicate them.

## Shared broadcast and cinema pipeline
1. **Create**: movie/series/commercial script and storyboard, rights ledger, 3D scene and original/lawfully licensed audio.
2. **Place**: book a product or sponsor to a distinct placement slot: environmental storefront billboard, holographic floating sign, prop, in-scene product use, radio mention, commercial break, or opening/closing sponsor slate.
3. **Review**: creator, rights owner, brand and network operator preview placement; approve creative claims, placement context, duration, disclosure and audience suitability.
4. **Produce**: export preview episode/video, track placed asset IDs and scene/shot timestamps; don't claim rendered output from an outline.
5. **Schedule**: station manager schedules LIVE show, movie premiere, recurring broadcast, music video, or ad break through program guide.
6. **Distribute**: rights-cleared on-demand movie/video streaming and TV/LIVE channels, with accessible captions, playback fallback and territorial/expiration enforcement.
7. **Report**: verified playback/impression/engagement metrics linked to campaign and playback session; prevent fabricated impressions or double-counting; reconcile payouts only server-side.

## Data model and acceptance
- `production`: ID, title, episode, owner, scriptRef, masterAssetRef, status, rightsScope.
- `placement`: campaignId, productionId, sceneId, shotId, assetRef, type, coordinates/transform, startEndTime, consent, disclosureRequired, approvals, status.
- `campaign`: sponsor, advertiser account, creative, price model, contract, approved budget, billing state, allowed geography/age, reporting state.
- `channel/program`: programming schedule, host/DJ/producer/network roles, content rights, stream URL (server-authorized), captions, moderation.
- Revenue and creator royalties remain unverified until the authoritative ledger, webhooks, settlement and reconciliation pass real tests.

## First safe test: Chicago Film + Advertiser
- Original fictional Chicago film scene and local fictional business, e.g. neighborhood café.
- Story editor places café branded prop and floating holographic billboard; timeline contains a 15-second fictional commercial placeholder.
- Preview includes clearly labeled sponsored placement and correct object positioning in scene; the sponsor cannot edit the movie without creative approval.
- Network operator schedules one preview screening, verifies start/stop and captions in viewer; ad metrics are simulated, distinctly labeled, and no payment is charged.
- Regression verifies asset rights, no unauthorized brands, placement geometry and timing, disabled ad visibility where required, one-hand navigation, no ads inserted into user-created content without permission, backup of production metadata, and fail-closed streaming/payment behavior.

## Launch discipline
Keep the 111-template Business Factory, 31-business showcase, Disabled People's Freeway, StreetVerse and November 19 revenue priorities intact. Ship as **Broadcast Network Preview** until a genuine two-device stream, playable movie asset, rights approvals, and ad/ledger tests pass. Do not merge broad PRs blindly or deploy production without the release gate.
