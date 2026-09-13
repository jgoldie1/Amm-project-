# TRYAMM Owned Ad Network

Status: BUILDING.

## Ownership rule
All advertising inventory created on TRYAMM-owned virtual property is first-party TRYAMM inventory: standard billboards, digital/video billboards, holographic billboards, buildings, transit/vehicle placements, arenas, virtual storefront surfaces, Holo Drama placement slots, sponsored missions, and future AR/holographic surfaces.

For TRYAMM-owned inventory the platform contract is:
- inventory owner: TRYAMM
- publisher revenue owner: TRYAMM
- publisher share: 10000 basis points (100%)
- third-party publisher/creator share: 0 basis points

This is a platform accounting rule, not a claim that gross advertiser spend equals net profit. Payment processing fees, refunds, chargebacks, taxes, sales commissions, hosting/rendering costs, agency obligations, licenses, and other contractual/legal costs may still reduce net proceeds.

If TRYAMM later sells ads on creator-owned or third-party property, that inventory must use a separate explicit contract and must never silently inherit the 100% TRYAMM rule.

## Ad products
- static world billboard
- rotating digital billboard
- video/interactive billboard
- holographic/volumetric placement
- virtual storefront takeover
- branded vehicle/transit placement
- arena/event sponsorship
- Holo Drama/movie product placement
- sponsored mission/challenge
- future AR placement

## Commercial flow
Advertiser -> campaign builder/sales order -> inventory reservation -> creative upload -> policy/rights review -> payment/invoice -> server verification -> campaign activation -> render adapters -> validated impression/interaction events -> advertiser reporting -> TRYAMM advertising ledger.

Client code can request/display an authorized campaign but cannot activate a paid campaign, change ownership/share, or approve a payment.

## Pricing architecture
Support fixed one-time campaign packages first. Add recurring advertiser plans and reservation contracts next. Metered impression/view billing should only be enabled after viewability and anti-fraud measurement are validated. Premium inventory can use duration, location, audience lane, event, exclusivity, format and render cost as pricing inputs.

## Multi-engine rendering
One campaign/placement ID maps to engine adapters for Three.js/WebGL/WebGPU, Godot, Unity, Unreal, cloud rendering and future physical holographic/AR endpoints. The advertising ledger remains engine-independent.

## Holographic placement
A holographic placement is a semantic 3D volume/anchor with size, visibility, animation/audio limits, interaction rules, age/region policy, campaign window and fallback creative. The renderer receives only approved creative and display instructions.

## Compliance and trust
Every campaign requires advertiser identity/billing records, creative rights, category/age/region policy checks, campaign dates, placement authorization, audit events and a defined refund/chargeback path. Disclosures such as Sponsored/Ad should be shown where required or appropriate. Children's/teen experiences require stricter targeting and category controls. Sensitive targeting should not be inferred from private personal data.

## Measurement
Measure viewable impressions, qualified view time, interactions, mission conversions and commerce handoffs using privacy-minimized event records. Do not treat a loaded asset as a billable impression unless viewability rules are met. Aggregate/de-identify or delete raw telemetry on the defined retention schedule.
