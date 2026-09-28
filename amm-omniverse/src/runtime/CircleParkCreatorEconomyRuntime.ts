export const CIRCLE_PARK_STARTER_HOME = {
  entitlement: 'free-instanced-starter-home',
  furniture: [
    'bed','sofa','table','chairs','lamp','dresser','basic-kitchen','wall-art-frame'
  ],
  principle: 'A new player receives a functional home without purchase.',
} as const

export const CIRCLE_PARK_CREATOR_MARKET = {
  allowed: [
    'furniture','decor','art','fashion','music','creator-media','food-cosmetics',
    'virtual-services','collectibles','home-upgrades'
  ],
  channels: ['all-american-marketplace','home-store','holo-live-shopping','reels'],
  rules: {
    purchaseRequiredForCoreProgression: false,
    creatorListingRequiresRights: true,
    serverVerifiedPurchaseBeforeEntitlement: true,
    ledgerRequiredBeforePayout: true,
  },
} as const

// Circle Park is a community/creator economy, not an arms market.
// Weapons, weapon parts and real-world weapon commerce are excluded. Any
// fictional gameplay props must remain non-functional/non-tradable cosmetics.
export const CIRCLE_PARK_RESTRICTED_COMMERCE = [
  'weapons','weapon-parts','ammunition','real-world-weapon-services'
] as const

export type CreatorListing = {
  id:string
  creatorId:string
  title:string
  category:(typeof CIRCLE_PARK_CREATOR_MARKET.allowed)[number]
  priceCents:number
  rightsAttested:boolean
}

export function canPublishCircleParkListing(listing:CreatorListing){
  return Boolean(
    listing.id &&
    listing.creatorId &&
    listing.title &&
    listing.rightsAttested &&
    Number.isInteger(listing.priceCents) &&
    listing.priceCents >= 0 &&
    CIRCLE_PARK_CREATOR_MARKET.allowed.includes(listing.category)
  )
}

export function emitCircleParkLiveCommerceIntent(listing:CreatorListing){
  if(typeof window==='undefined'||!canPublishCircleParkListing(listing))return false
  window.dispatchEvent(new CustomEvent('tryamm:creator-commerce-intent',{detail:{
    source:'circle-park',
    channel:'holo-live-shopping',
    listing,
    // This is an intent only. Existing server-authoritative checkout/webhook/
    // entitlement/ledger infrastructure remains responsible for real payment.
    requiresServerVerification:true,
  }}))
  return true
}
