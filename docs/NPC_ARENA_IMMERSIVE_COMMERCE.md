# TryAMM NPC, Arena and Immersive Commerce

## Conversational NPC completion gate

Implemented foundation:
- original character lore and goals
- bounded short-term memory
- retrieval-ready prompt construction
- trust and mood state
- cost estimation
- privacy, impersonation and harm boundaries

Production completion requires:
- authenticated player identity
- approved lore retrieval from Supabase
- Claude/model call with strict budgets
- moderation before and after generation
- persistent summarized memory with user controls
- voice, lip sync and animation integration
- server-authoritative quest and reward decisions
- load testing and fallback dialogue

## Arena completion gate

Implemented foundation:
- queue records
- player ratings and regions
- rating-aware match selection
- team records
- tournament brackets
- server authority flag
- event validation
- anti-cheat contracts
- replay identifiers
- spectator delay and broadcast records

Production completion requires:
- dedicated authoritative servers
- websocket state synchronization
- reconnect and migration
- ranked seasons and leaderboards
- party and invite system
- anti-cheat telemetry and sanctions
- replay storage and playback
- LiveKit spectator broadcast
- moderation and reporting
- tournament operations dashboard

## Immersive marketplace

Open `/immersive-marketplace.html`.

Implemented foundation:
- outfit, shoe, glasses and jewelry try-on modes
- furniture, art and vehicle placement modes
- device capability checks
- local camera permission workflow
- privacy rule: do not store raw camera or biometric data
- VR showroom and 3D fallback architecture
- verified limited-drop records
- quests, points, streaks and loyalty tiers
- wishlists, carts and verified social proof
- ethical urgency rules

Production completion requires:
- product GLB/GLTF asset pipeline
- body/face/hand/foot tracking SDK selection
- fit and size estimation with clear uncertainty
- WebXR room placement and anchors
- Shopify product/variant synchronization
- verified inventory reservations
- checkout, refunds and fulfillment
- creator affiliate attribution
- accessibility and reduced-motion testing
- analytics with consent and data minimization

## Ethical FOMO rules

TryAMM may show real deadlines, real stock, verified purchases, real livestream attendance and earned rewards. It must not fabricate viewers, reviews, purchases, inventory scarcity, countdowns or celebrity endorsements.

## Honest status

These modules provide validated Alpha/Beta foundations. They are not equivalent to a fully operated global commerce network, AAA multiplayer arena or unlimited autonomous NPC system. Completion is measured by the production gates above, not by the number of planned features.
