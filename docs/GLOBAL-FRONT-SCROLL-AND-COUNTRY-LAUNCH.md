# TryAMM Global Front Scroll + Country Launch Architecture

## Front-scroll experience

TryAMM should open into one full-screen vertical swipe feed with a sticky top tab row:

- For You
- Following
- Live
- Shop Live
- Business Live
- Reels
- Threads
- News/TV
- HoloMusic
- Games
- Local

Each card may be short video, live video, shoppable live, business livestream, text/thread, news clip, licensed TV/original programming, music video, game clip, or local offer.

## Shared card actions

Every supported card can expose the actions that make sense for that content:

- like/comment/share/save
- follow
- shop/buy
- open HoloMenu
- apply HoloCoupon
- reserve/book
- request Ride/Delivery
- translate with HoloLingo
- accessibility controls through HoloAccess
- report/block

## Shop Live

Business or creator goes live with linked catalog/menu/products.
Viewer watches -> taps product/coupon -> server-authoritative cart -> Jin/PayRouter -> verified payment -> Revenue Waterfall -> merchant/creator/platform attribution -> HoloPass rewards.

## Business Live

Restaurants and businesses can run:
- flash sales
- cooking demos
- grand openings
- product launches
- service demonstrations
- auctions where lawful/configured
- HoloCoupon drops
- reservation/appointment pushes

## Threads

Text-first social surface with replies, repost/share, media attachments, community moderation, HoloLingo translation, HoloGuardian safety, and links into Live/Shop/HoloMusic/Games/Business pages.

## Global country layer

The app may be globally viewable, but monetized capabilities activate country-by-country.

Each country configuration must define:
- legal entity/market status
- supported language(s)
- default currency
- permitted payment rails
- merchant and creator payout rails
- tax/VAT/GST responsibility rules
- marketplace-facilitator status where applicable
- digital receipt/invoice requirements
- consumer protection/refund rules
- privacy/data residency requirements
- age/minor requirements
- Ride/Delivery licensing state
- music/TV territorial rights
- prohibited/restricted goods

Feature gating examples:
- viewing content may be GLOBAL_VIEW
- buying may require PAYMENTS_VERIFIED
- seller onboarding may require MARKETPLACE_VERIFIED
- Ride may require RIDE_VERIFIED
- third-party TV may require RIGHTS_VERIFIED

## Feed ranking architecture

Ranking service consumes eligible content only after policy filtering.

Policy eligibility -> age safety -> territory/rights -> availability -> language/country -> ranking.

Ranking inputs may include watch time, completion, legitimate engagement, follow graph, freshness, user interests, local relevance, creator quality, and business relevance.

Never optimize minors solely for compulsive engagement. HoloGuardian safety rules take priority.

## Required backend feed contract

Recommended unified feed API:

`GET /api/feed?tab=for-you&cursor=...&country=...&language=...`

Response items should use a normalized envelope:
- id
- contentType
- creator/business identity
- media/text payload
- rights/territory eligibility
- commerce payload if any
- HoloCoupon payload if any
- live state if any
- accessibility metadata
- translation metadata
- ranking explanation/debug fields only for authorized admin use

## Truth status

The repository has historical commits for video feed/live-stream interfaces, but a fully unified front-scroll covering all tabs above was not verified before this integration registry was added. Treat this as a consolidation target, not a claim that every tab is already production-wired.
