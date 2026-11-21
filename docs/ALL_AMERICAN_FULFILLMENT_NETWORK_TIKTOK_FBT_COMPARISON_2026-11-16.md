# Fulfilled by All American (FBAA) — compare with Fulfilled by TikTok
2026-11-16 | Working name subject to trademark review | Integration draft, NOT an active 3PL contract.

## Verified benchmark
TikTok Shop US official documentation (reviewed Nov 16 2026):
- FBT stores, picks, packs and dispatches eligible sellers' inventory from warehouses.
- It can coexist with seller/third-party warehouse fulfillment.
- Hub routing and direct-fulfillment-center inbound routes both exist, with specific handling and charges.
- Current fee structures/eligibility vary by product dimensions and service; no universal low-cost promise.
Sources: https://seller-us.tiktok.com/university/essay?knowledge_id=8644984183162670 ; https://seller-us.tiktok.com/university/essay?knowledge_id=6734735776089869 ; https://seller-us.tiktok.com/university/essay?knowledge_id=3507056320268087

## TRYAMM differentiation and scope
- Name: FBAA / All American Fulfillment Network (working name, trademark clearance required).
- Seller-controlled inventory ownership, item-level traceability, exportable listing/order/customer records subject to privacy law, fully disclosed costs and returns.
- Unified seller choice: certified 3PL warehouse, seller fulfillment, local pickup, later marketplace partner distribution; no obligation to send all inventory into TRYAMM stock.
- Channels: All American Marketplace, StreetVerse-linked catalog (no fake commerce state), All American Records music merch/vinyl and CDs, Holo LIVE shopping, Yahavah Grocery with strict separate food-safe workflows. External TikTok/Shopify/other channels via authorized APIs only.
- Logistics: seller/artist owns goods → inbound ASN and barcode/lot → warehouse WMS accepted receipt → Virtual Warehouse projection → available-to-promise → paid order with provider-confirmed receipt → warehouse reservation → pick/pack → carrier tracking → delivery proof/returns → reconciled settlement.
- Global Supply Chain order-of-authority and Layer 2 blockchain SHA-256 evidence anchor already documented; no public chain proof, identity secrets or wallet/payments in raw chain.
- Merch kits: album + shirt + signed poster + authorized digital concert ticket; video/watch-to-shop is promotional consent, not automatic purchase. Merch artist earnings and contracts separate from label 25% master recordings.
- Yahavah Grocery: verified cold-chain, food handling, expiry FEFO, recalls and local delivery. Nonfood 3PLs cannot fulfill temperature-sensitive food.
- Memphis TN candidate versus Atlanta GA and Savannah GA import corridor; Chicago demand/local grocery pilot. Do not claim delivery savings or 3-day SLA until actual bids and samples.
- Research partner quotes for receiving/storage/pick-pack/packaging/returns/insurance/fuel/zone, integrations, monthly minimums, cold chain and contract term; compare apples-to-apples via `amm-omniverse/src/commerce/threePlQuotePilot.mjs`.
- Caution: "FBA" could be confused with Amazon's Fulfillment by Amazon; use a differentiated brand after legal name clearance, e.g. All American Fulfillment Network, not imply affiliation with TikTok or Amazon.

## Start small and prove it
1. One partner 3PL (Memphis or Atlanta based on real bids); start with 10 synthetic SKUs and a single merchant/account.
2. Pass the 3PL quote regression test and fulfillment authority hold tests.
3. Connect API to a real partner sandbox WMS, with idempotent events, no customer information in public ledgers.
4. Run nonfood merchandise parcel first (vinyl, shirts), verify end-to-end tracking and cost.
5. Onboard Yahavah grocery in separate food-safe pilot; add a regional node only with enough sales density to justify split stock.
6. Marketing and checkout only after vendor agreement, carrier SLAs, payment rails, insurance, returns handling and privacy controls verified.
Nothing here authorizes purchase, shipping, signing, money movement or external API access.
