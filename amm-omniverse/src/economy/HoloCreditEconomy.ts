export type HoloCreditBucket='purchased'|'earned'|'promotional'|'refunded'
export type HoloCreditUse='game-cosmetic'|'creator-tool'|'replay-edit'|'digital-collectible'|'arena-digital-upgrade'|'university-digital-lab'|'promotion'

export const HOLO_CREDIT={
 name:'Holo Credits',
 symbol:'HC',
 model:'closed-loop virtual credit',
 truth:[
  'Holo Credits are not cryptocurrency, equity, an investment, a bank deposit, wages or a promise of profit.',
  'Purchased Holo Credits are used only for eligible TRYAMM digital goods/services under applicable store/platform rules.',
  'Holo Credits cannot be redeemed for cash or transferred peer-to-peer unless a future separately licensed product explicitly supports that capability.',
  'Creator earnings, agency commissions, rebates and refunds remain separate ledger balances; do not pay them as purchased Holo Credits.',
  'Physical merchandise, venue tickets and physical services use the applicable physical-commerce payment rail rather than Holo Credits where platform rules require it.'
 ],
 buckets:{
  purchased:'Bought through an approved platform/payment rail; never expires where platform rules prohibit expiration.',
  earned:'Awarded for eligible non-purchase participation; non-cash and subject to program terms.',
  promotional:'Marketing/promotional credit with clearly disclosed terms where lawful.',
  refunded:'Accounting bucket for restored credits after eligible digital reversals.'
 } as Record<HoloCreditBucket,string>,
 uses:[
  'game-cosmetic','creator-tool','replay-edit','digital-collectible','arena-digital-upgrade','university-digital-lab','promotion'
 ] as HoloCreditUse[],
 prohibited:[
  'cash-out','crypto exchange','investment yield','gambling stake','chance-based cash prize','peer-to-peer money transmission','paying wages','hiding creator earnings','buying physical merchandise when store policy requires a physical-goods payment method'
 ],
 ledger:'PURCHASE/AWARD → PROVIDER RECEIPT OR PROGRAM EVIDENCE → SERVER VERIFY → IMMUTABLE LEDGER ENTRY → AVAILABLE BALANCE → ELIGIBLE USE → LEDGER DEBIT → RECEIPT → REFUND/RESTORE WHEN REQUIRED',
} as const

export const HOLO_CREDIT_WALLETS={
 player:'Purchased/earned/promotional HC, transaction history and restore purchases.',
 family:'Guardian controls, youth spending limits, purchase approval and activity visibility.',
 creator:'HC for eligible platform tools; creator cash earnings remain in Creator Earnings Balance.',
 agency:'Campaign/tool HC separate from agency commission/payout ledger.',
 venue:'Digital experience upgrades and replay-edit entitlements; physical tickets/merch stay on physical-commerce rails.'
} as const

export const HOLO_CREDIT_STORE_RULES={
 ios:'Digital Holo Credits and digital unlocks must follow applicable App Store in-app-purchase rules. Purchased in-app credits must not expire.',
 android:'Digital Holo Credits sold in a Google Play distributed app must follow applicable Google Play billing rules unless an allowed program/exception applies.',
 web:'Web checkout can use the approved web payment provider, with entitlements synchronized server-side subject to mobile-store linking/steering rules.',
 physical:'Physical goods, venue admission and physical services remain separate SKUs/payment rails.',
 restore:'Entitlements and restorable purchases must survive reinstall/device change through provider receipt verification + TRYAMM account ledger.'
} as const

export const HOLO_CREDIT_PROGRESSION='ADVENTURE → COMPETITION → SOCIAL SPORT → EDUCATION → CREATION → ACHIEVEMENT → EARN/AWARD HC OR BUY HC THROUGH APPROVED RAIL → DIGITAL CUSTOMIZATION/TOOLS → REPLAY/CREATION → WORLD MEMORY → RETURN'

export const HOLO_CREDIT_COMMERCE_SPLIT='HOLO CREDITS (DIGITAL CLOSED LOOP) || CREATOR EARNINGS (CASH LEDGER) || AGENCY COMMISSIONS (CASH LEDGER) || REBATES (CREDIT/PAYOUT PER TERMS) || PHYSICAL STORE/TICKETS (PHYSICAL COMMERCE RAIL)'
