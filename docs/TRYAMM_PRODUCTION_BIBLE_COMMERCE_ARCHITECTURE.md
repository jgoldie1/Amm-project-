# TRYAMM Production Bible + Holographic Commerce Architecture

Status: foundation specification for PR #171 branch. This document extends existing TRYAMM / StreetVerse / Holo Drama / creator systems rather than creating a disconnected application.

## 1. Production formats

One shared studio pipeline supports:
- Reel / short-form video
- Episode / Holo Drama
- 30-minute feature
- 60-minute feature
- 90-minute feature
- 120-minute feature

Long-form productions are assembled from controlled scenes and shots; the system must not assume a single generative model can reliably create an uninterrupted two-hour movie.

## 2. Production Bible Engine

Every production owns a versioned Production Bible. Approved footage is immutable unless explicitly reopened; Bible revisions guide future shots without silently rewriting approved masters.

### Story Bible
World rules, lore, chronology, plot, acts, scenes, episode arcs and franchise canon.

### Character Bible
Character identity, age, appearance, voice, personality, relationships, wardrobe, props and permitted transformations. Character age must be explicit for mature productions.

### Visual Bible
Cinematography, framing, lenses, lighting, locations, sets, palette language, VFX rules and virtual-production rules.

### Audio Bible
Approved voices/consents, dialogue rules, soundtrack, Holo Music, ambience, SFX and accessibility mixes.

### Continuity Bible
Scene state: characters, wardrobe, props, injuries, vehicles, weather, time, location and previous-scene consequences.

### Production Bible
Script -> storyboard -> shot list -> generation/tool selection -> takes -> review -> approved shot -> edit -> VFX -> audio -> master.

### Rights Bible
Ownership, performer/voice consent, music rights, likeness permissions, brand permissions, licensing, territories, expiration and revenue attribution.

### Ratings, Safety & Accessibility Bible
Target audience and content descriptors are metadata from development through distribution. General movie targets include G, PG, PG-13 and R-style lanes, while any platform-specific labels must not falsely imply an official third-party rating unless actually obtained. Adult-only/After Dark material is separated from minors and general-audience discovery. Explicit sexual-content generation is not a studio capability. Sexual content involving minors is prohibited.

Accessibility requirements include captions, transcripts, audio description where supported, readable UI, dialogue clarity and accessible controls. Game experiences also carry structured descriptors such as violence, language, mature themes, flashing lights, simulated gambling, online interactions and user-generated content.

## 3. Movie Memory / continuity retrieval

For every generated shot:

Production Bible -> current scene -> current shot -> retrieve relevant character/location/wardrobe/prop/continuity state -> generate candidate takes -> continuity and rights checks -> director approval -> lock shot -> update scene state.

This persistent memory layer is model-independent so new video, image, voice and editing providers can be swapped in without losing the production's canon.

## 4. AI Reel Extend -> long-form production

Reel Extend is a shot-generation tool, not the entire studio. Supported concepts include realistic continuation, cinematic continuation, image-to-video, seamless looping, background/set replacement and authorized product-ad extensions. Generated continuations must obey Production Bible identity, wardrobe, location, camera, lighting, story and rights constraints.

The same shot engine feeds Reels, Holo Drama and long-form Movie Studio projects.

## 5. Commerce & Placement Bible

Product placement is first-class production inventory.

Placement types:
- physical/photographed prop
- background/environment placement
- virtual 3D product
- StreetVerse interactive object
- holographic overlay/display
- designated post-production/dynamic placement zone

Each placement records at minimum:
- campaign/brand/product identifiers
- authorized product assets and 3D models
- SKU or commerce reference when applicable
- scene/shot and placement coordinates
- duration and prominence
- creator/director approval
- rights/consent evidence
- campaign dates and territories
- disclosure requirements
- prohibited-category checks
- compensation/revenue terms
- attribution identifiers
- replacement/expiration behavior

## 6. Holographic dynamic product placement

Preserve a clean archival master. Dynamic advertising is permitted only in explicitly designated placement zones and must never silently rewrite story-critical footage.

Conceptual flow:

clean movie master -> authorized placement zone -> campaign eligibility -> approved product/3D asset -> territory/audience/content-policy checks -> render holographic/virtual placement -> impression/interaction -> optional commerce -> authoritative attribution.

Eligible surfaces can include holographic billboards, virtual storefronts, displays, arena boards, tables, vehicles and non-story-critical environmental inventory.

## 7. Shoppable viewing

Where the playback environment supports interaction, an authorized placement may expose a non-disruptive product action:

viewer selects product -> product details/3D or AR preview -> save to Omni Box or Marketplace -> checkout through supported payment provider -> server verification -> authoritative ledger -> attribution/revenue accounting.

The movie client never becomes authoritative for payment, settlement or payable balances.

## 8. Stubbs AI Placement Director

A future Placement Director can analyze scripts/storyboards for natural inventory such as phones, vehicles, restaurants, apparel, food/beverage or technology. It may recommend opportunities but cannot insert a brand without rights, campaign eligibility and creator/director approval.

Potential future marketplace flow:

eligible placement inventory -> approved advertisers/sponsors -> proposal/bid -> rights/compliance review -> creator approval -> campaign lock -> rendering/distribution -> measurement.

## 9. Distribution cuts

A production can maintain multiple authorized cuts derived from the master, including trailers, reels, accessibility variants and territory/audience-appropriate promotional cuts. Mature productions must not leak restricted scenes, thumbnails or previews into minor/general-audience discovery.

## 10. Shared Omniverse placement engine

The same rights-aware placement contract can eventually serve Movie Studio, Holo Drama, Reels, StreetVerse, LIVE, games, virtual concerts and StarVerse. Reusable 3D product assets remain governed by the Rights and Commerce Bibles rather than copied without provenance between experiences.

## 11. Separation of authority

Creative clients may visualize products and estimated analytics. Authoritative commerce remains server-side:
- price/inventory source of truth
- checkout/payment verification
- refunds
- settlements
- creator/seller payable balance
- campaign budget consumption
- revenue allocation
- financial ledger

This follows PR #171's existing rule: real commerce underneath, immersive visualization above it.

## 12. Implementation order

1. Versioned Production Bible schema and validation.
2. Character/continuity/rights retrieval contract for each shot.
3. Commerce & Placement Bible schema.
4. Placement-zone representation with clean-master preservation.
5. Content/rating/accessibility metadata contract.
6. Reel Extend adapter interface for interchangeable generation providers.
7. Holo placement renderer prototype using non-financial demo assets.
8. Marketplace/Omni Box deep-link contract.
9. Server-authoritative attribution events.
10. Test fixtures covering continuity, minors/adult separation, rights expiration, unauthorized placement rejection and duplicate commerce events.

No real-money provider action, advertiser billing, settlement or automatic brand insertion should be enabled until the corresponding server-authoritative contracts, security controls, rights evidence and tests are verified.
