# TryAMM Business-in-a-Box Vertical Slice

## Goal
Turn a new business into a paying, operating TryAMM storefront without requiring custom engineering for each merchant.

## User flow

Business signs up
→ verifies owner/contact information
→ selects business type and country
→ chooses plan
→ pays any configured setup/subscription fee through Jin / PayRouter
→ creates storefront or restaurant menu
→ adds products/services/menu items
→ activates pickup/delivery where eligible
→ creates promo/referral code
→ optionally buys HoloAds/GrowthOS services
→ receives orders
→ verified payment event settles through product-specific Revenue Waterfall
→ business dashboard shows sales, fees, payable balance, ads, referrals and growth metrics.

## Plan design

Starter: configurable free/basic entry plan.

Growth: example default $29/month + $49 setup fee.

Pro: example default $99/month + $199 setup fee.

These are launch examples, not permanent promises. Pricing must be configurable by market, campaign, business type and grandfathered contract.

## Revenue policies

Do not use a universal 75/25 or 85/15 split.

- RW-BUSINESS-SUBSCRIPTION-01: TryAMM subscription revenue after required taxes/processor obligations.
- RW-BUSINESS-SETUP-01: setup/service fee revenue.
- RW-MARKETPLACE-01: seller order settlement.
- RW-RESTAURANT-01: restaurant order settlement.
- RW-DELIVERY-01: delivery/courier settlement.
- RW-HOLOADS-01: advertising campaign revenue.
- RW-CREATOR-SPONSORSHIP-01: creator-attributed sponsorship, adjustable up to qualifying 85% creator/host share.

## Restaurant pathway

Restaurant
→ menu/catalog
→ pickup or delivery availability
→ customer order
→ Jin/PayRouter selects approved rail
→ verified payment confirmation
→ restaurant payable + TryAMM fee + delivery payable + taxes/reserves as configured
→ order fulfillment
→ payout on configured schedule.

Suggested seller/restaurant payout launch policy: every two weeks for new/high-risk merchants, graduating to weekly after trust/performance criteria.

## Qualified referral program

Default marketing message: Earn $1 for each Qualified Referral.

Qualification requires configurable checks such as:
- verified account
- duplicate/fraud screening
- qualifying activation event

Admin can change reward to $0, $0.50, $1, $2, $5 or campaign-specific value without rewriting code. Previously-earned rewards must not be retroactively reduced.

## HoloAds

Business can buy:
- sponsored Holo Menu tile
- boosted storefront/product
- creator campaign
- HoloMusic/HoloTV sponsorship
- local Ride/Delivery promotion
- HoloVerse/GameVerse placement where appropriate
- external campaign-management services

Creator-attributed ad revenue and general platform ad revenue must use separate policies.

## Jin / PayRouter

One checkout interface routes to approved payment providers based on market/channel/product.

Examples:
- Stripe online
- Tap to Pay where supported
- Paystack
- Flutterwave or other approved local provider
- mobile money where supported
- bank transfer where supported
- Apple/Google billing when platform rules require it

Never treat an internal ledger as a bank or money-transmission substitute. External regulated providers move real funds; TryAMM records entitlements, payables and accounting events.

## Africa

Every merchant record stores country/currency. Market activation is country-by-country.

Priority markets tracked separately:
- Nigeria
- Ghana
- Kenya
- South Africa

Before activating real-money commerce in a market, verify supported payment/payout rails, taxes, consumer protection, privacy, prohibited goods, fraud controls and local operating requirements.

## Dashboard metrics

- gross sales
- net sales
- orders
- average order value
- subscription/setup fees paid
- TryAMM fees
- merchant payable
- refunds/chargebacks
- HoloAds spend and attributable results
- qualified referrals
- promo-code conversions
- delivery/pickup mix
- GrowthOS recommendations

## Production acceptance

Do not mark production-ready until:
- authenticated business onboarding works
- plan pricing comes from configuration
- verified payment webhook creates order settlement idempotently
- storefront/menu persists in Supabase
- merchant cannot alter server-calculated settlement
- refund/chargeback flow tested
- promo/referral fraud checks tested
- HoloAds attribution tested
- RLS/permissions tested
- one U.S. test merchant and one Africa-market sandbox merchant flow pass staging where provider support exists
