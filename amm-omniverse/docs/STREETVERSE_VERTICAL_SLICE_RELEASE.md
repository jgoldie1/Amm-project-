# StreetVerse Vertical Slice Release Contract

## Goal
Prove one end-to-end loop before labeling the ecosystem complete:

PLAYER -> LIVING WORLD -> PRODUCT DISCOVERY -> CART -> GUARDIAN -> REAL PAYMENT -> FULFILLMENT/TRACKING -> XP/WALLET -> RECORD -> EDIT -> PRODUCT TAG -> PUBLISH -> CREATOR ATTRIBUTION -> MERCHANT SALE -> REORDER

## Completion rule
A system is GREEN only when all applicable gates pass:
1. Source exists.
2. Dependencies compile/build.
3. Runtime integration works in a test scene/app route.
4. Persistence/server authority is proven where required.
5. External provider integration is live where required.
6. Smoke test passes on target device/runtime.
7. Production deployment is verified.

Code presence alone is not completion.

## Unity / Living World gates
- [ ] Unity project compiles with zero blocking errors.
- [ ] Canonical player state owns health, stamina, XP, wallet, inventory, reputation, vehicles, missions and world position.
- [ ] Player controller, vehicles, NPCs, animals, prison, bosses, crew, Battle Royale and missions use shared state/contracts.
- [ ] World streaming/chunk activation is implemented and profiled.
- [ ] NPC schedules and traffic are integrated.
- [ ] Server-authoritative multiplayer owns damage, rewards, inventory, economy, match state and vehicle ownership.
- [ ] Save/load survives restart and reconnect.

## Commerce gates
- [ ] Real catalog API/database is source of truth.
- [ ] Supplier inventory feed updates stock confidence and available-to-promise inventory.
- [ ] Floor price = verified landed cost + required contribution margin.
- [ ] Holo Coupon cannot reduce price below approved floor unless funded by sponsor/acquisition budget.
- [ ] Guardian authorization runs server-side.
- [ ] Stripe/platform payment is server-created and webhook/receipt verified.
- [ ] Order ledger persists independently of the Unity client.
- [ ] Fulfillment rail selection uses cost, SLA, compliance and inventory truth.
- [ ] Real carrier/partner tracking is stored and displayed.
- [ ] Delivery completion is verified before final loyalty/creator settlement when required.
- [ ] Reorder creates a real approved PO/request, not only a UI notification.

## Creator gates
- [ ] Real video capture/encoding works on supported runtime.
- [ ] Edit/export produces a valid playable media file.
- [ ] Product and location tags persist server-side.
- [ ] Upload goes to real object storage/CDN.
- [ ] Feed publish creates a retrievable public/private post according to visibility.
- [ ] Creator attribution survives click/world-entry/checkout.
- [ ] Creator earnings are calculated from verified transactions, not views or local PlayerPrefs.
- [ ] Save/share-to-device is verified on target phones.

## Revenue model rule
Revenue projections are scenarios, not booked revenue or profit.

Contribution profit per order should be measured as:
SELLING PRICE - PRODUCT COST - FREIGHT/DUTY - PICK/PACK - PAYMENT FEES - RETURNS/SPOILAGE RESERVE - DELIVERY SUBSIDY - CREATOR COMMISSION - MARKETPLACE/PLATFORM VARIABLE COSTS - TAXES/REQUIRED REMITTANCES = CONTRIBUTION PROFIT

Do not double-count retail margin, wholesale margin and marketplace commission on the same transaction unless the contractual structure truly earns all three.

## Target monetization lanes
- Retail/product margin
- Marketplace commission
- Merchant subscription
- Business-in-a-Box/services
- Delivery/fulfillment orchestration
- Sponsored Holo Coupons
- Advertising
- Creator/affiliate commerce
- Live commerce
- Software/SaaS services
- Inventory/reorder services

## Release sequence
1. Unity compile.
2. One integrated test scene.
3. Save/load proof.
4. One server-authoritative multiplayer session.
5. One real product with verified inventory.
6. One real Stripe/platform payment and webhook verification.
7. One fulfillment/tracking flow.
8. One gameplay recording -> edit -> save -> publish flow.
9. One creator-attributed purchase.
10. One verified merchant reorder.
11. Deploy canonical build to tryamm.online.
12. Run phone/PWA/public smoke test and mark GREEN only from evidence.

## Scale path
After the vertical slice passes, reuse the same contracts across StreetVerse, My World, Kingdom, AI Cafe, Middleverse, Holoverse and future Unity/Unreal/Godot clients.

BUILD ONCE -> VERIFY ONCE -> REGISTER -> REUSE EVERYWHERE -> PARALLELIZE VARIANTS -> TEST DELTAS -> DEPLOY
