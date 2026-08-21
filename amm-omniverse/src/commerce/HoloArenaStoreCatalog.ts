export type StoreProduct = { sku:string; name:string; category:string; channel:string[]; marginStrategy:string; gate?:string }

export const HOLOARENA_STORE_CATALOG:StoreProduct[] = [
 {sku:'BB-STARTER',name:'Battle Beck Starter Deck',category:'game',channel:['online store','venue','event'],marginStrategy:'original deck + repeat expansion sales',gate:'trademark/art/card rules and manufacturing QA'},
 {sku:'BB-EXP-01',name:'Battle Beck Expansion Pack 01',category:'game',channel:['online store','venue'],marginStrategy:'lower-ticket repeat purchase',gate:'original rights-cleared artwork'},
 {sku:'BB-GEAR',name:'Battle Beck Arena Gear Kit',category:'apparel/accessory',channel:['online store','venue'],marginStrategy:'bundle deck case + playmat + team band'},
 {sku:'HOLO-DECK',name:'TRYAMM Holographic Battle Deck Display',category:'consumer hardware',channel:['preorder/waitlist','venue demo'],marginStrategy:'premium hardware/accessory bundle',gate:'prototype, electrical/product safety, warranty and certification before sale'},
 {sku:'TAG-BLASTER',name:'TRYAMM Arena Tag Controller',category:'venue hardware',channel:['venue','future retail'],marginStrategy:'venue equipment + replacement/accessory sales',gate:'eye-safe/non-weapon appearance, radio/electrical compliance, drop testing and venue safety validation'},
 {sku:'SENSOR-KIT',name:'TRYAMM HoloArena Sensor Kit',category:'venue hardware',channel:['operator/franchise'],marginStrategy:'installation + maintenance + support',gate:'hardware validation and certification'},
 {sku:'HOLOFON-COMP',name:'HoloFon Arena Companion',category:'software/device companion',channel:['app','venue'],marginStrategy:'membership/companion services',gate:'HoloFon hardware remains future-gated'},
 {sku:'REPLAY',name:'HoloArena Cinematic Replay',category:'digital',channel:['post-session'],marginStrategy:'high-margin optional replay/highlight package'},
 {sku:'MEMBER',name:'HoloArena Membership',category:'membership',channel:['online','venue'],marginStrategy:'recurring visits + member pricing'},
 {sku:'PARTY',name:'Birthday / Group Mission Package',category:'experience',channel:['booking'],marginStrategy:'group utilization + optional F&B/merch add-ons'},
 {sku:'EDU-XR',name:'All American University XR Lab Package',category:'education',channel:['school','university','venue'],marginStrategy:'scheduled institutional sessions',gate:'education terms and accessibility'},
 {sku:'CREATOR',name:'Creator Movie Mission Package',category:'creator',channel:['venue','TRYAMM'],marginStrategy:'session + edited replay + creator tools'},
 {sku:'APPAREL',name:'HoloArena / SpaceVerse / StreetVerse Apparel',category:'merchandise',channel:['online store','venue'],marginStrategy:'print-on-demand first to reduce inventory risk'},
 {sku:'BADGES',name:'Mission Badge Collection',category:'collectible',channel:['venue','online'],marginStrategy:'low-cost achievement collectible tied to completed sessions'}
]

export const STORE_RULES = [
 'Prefer original TRYAMM/Battle Beck IP; do not market third-party names/logos as TRYAMM products without permission.',
 'Do not claim a product is certified, patented, quantum hardware, eye-safe or production-ready until independently verified.',
 'Use preorder/waitlist for unmanufactured hardware; never represent concept hardware as in-stock.',
 'Track COGS, payment fees, shipping, returns, warranty reserve, taxes and venue labor before labeling an item profitable.',
 'Digital replays, memberships, expansion content and print-on-demand merchandise are the first low-inventory-margin candidates.'
]
