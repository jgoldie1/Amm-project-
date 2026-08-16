export type CommerceMode='fixed'|'auction'|'offer'|'live'|'preorder'|'service'|'digital'|'wholesale'

export type CommerceCapability={
  id:CommerceMode
  label:string
  description:string
  buyerAction:string
  sellerValue:string
}

export const COMMERCE_CAPABILITIES:CommerceCapability[]=[
  {id:'fixed',label:'Buy Now',description:'Fast one-tap marketplace checkout for standard products.',buyerAction:'Buy now',sellerValue:'High-conversion direct sales'},
  {id:'auction',label:'Auction',description:'Timed bidding with reserve, buy-now and anti-sniping support.',buyerAction:'Place bid',sellerValue:'Price discovery and collectibles'},
  {id:'offer',label:'Make Offer',description:'Buyer/seller negotiation with accept, decline and counter offers.',buyerAction:'Make offer',sellerValue:'Flexible conversion without manual DMs'},
  {id:'live',label:'LIVE Shopping',description:'Pin products inside TRYAMM LIVE, chat, clips and replays.',buyerAction:'Shop LIVE',sellerValue:'QVC-style selling plus creator/social distribution'},
  {id:'preorder',label:'Preorder',description:'Sell future inventory, launches and limited drops before stock arrives.',buyerAction:'Reserve',sellerValue:'Demand validation and launch funding'},
  {id:'service',label:'Book a Service',description:'Sell appointments, estimates, consultations and local services.',buyerAction:'Book',sellerValue:'Marketplace plus service-business operating layer'},
  {id:'digital',label:'Digital',description:'Instant delivery for media, education, downloads, tickets and licenses.',buyerAction:'Get access',sellerValue:'Zero-shipping creator commerce'},
  {id:'wholesale',label:'Wholesale / B2B',description:'Company catalogs, volume pricing, payment terms and custom rules.',buyerAction:'Request / order',sellerValue:'DTC and B2B from the same inventory'},
]

export const COMMERCE_OS_DIFFERENTIATORS=[
  'One Living Worlds Passport for buyer, creator, seller, worker, rider and business identity',
  'One inventory usable in marketplace, LIVE, Reels, creator storefronts, ads, games and holographic experiences',
  'One checkout and attribution graph across creators, affiliates, ads and LIVE hosts',
  'Fixed price, auctions, offers, wholesale, services, digital goods and preorders in one listing model',
  'TRYAMM LIVE product pinning, chat, replay shopping and creator revenue attribution',
  'Stubbs AI shopping concierge for natural-language discovery, comparison and seller assistance',
  'Buyer protection, seller trust, disputes and misconduct reporting tied to the same Trust & Safety system',
  'Holo/3D product previews and Living Worlds storefront placement',
  'Global/local fulfillment hooks for shipping, pickup, Holo Food, Holo Ride and future logistics',
  'Second Chance workforce pathways for fulfillment, support, delivery and merchant operations',
] as const

export function commerceActionLabel(mode:CommerceMode){
  return COMMERCE_CAPABILITIES.find(item=>item.id===mode)?.buyerAction||'View'
}
