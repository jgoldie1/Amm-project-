export type HoloSystemStatus='live'|'beta'|'sandbox'|'gated'
export type HoloSystemId='holoverse'|'hologpt'|'streetverse'|'delivery'|'ride'|'drone'|'gallery'|'marketplace'|'fridge'|'labs'|'services'|'core'|'music'|'drama'|'gifts'|'style'|'arena'|'social'|'ads'|'fon'|'care'|'tv'|'reels'|'omnibox'
export type HoloSystemDefinition={id:HoloSystemId;label:string;category:'world'|'mobility'|'commerce'|'creator'|'media'|'service'|'ai'|'infrastructure';status:HoloSystemStatus;revenue:('sales'|'subscription'|'gift'|'ticket'|'license'|'rental'|'ad'|'delivery-fee'|'service-fee'|'sponsorship')[]}
export const HOLO_ECOSYSTEM:HoloSystemDefinition[]=[
 {id:'holoverse',label:'Holoverse',category:'world',status:'beta',revenue:['sponsorship']},
 {id:'hologpt',label:'HoloGPT',category:'ai',status:'live',revenue:['subscription','service-fee']},
 {id:'streetverse',label:'StreetVerse',category:'world',status:'beta',revenue:['sales','rental','ticket','sponsorship']},
 {id:'delivery',label:'Holo Delivery',category:'mobility',status:'beta',revenue:['delivery-fee','service-fee']},
 {id:'ride',label:'Holo Ride Share',category:'mobility',status:'gated',revenue:['service-fee']},
 {id:'drone',label:'Holo Drone',category:'mobility',status:'gated',revenue:['delivery-fee','service-fee']},
 {id:'gallery',label:'Holographic Gallery',category:'commerce',status:'beta',revenue:['sales','ticket','license','rental','sponsorship']},
 {id:'marketplace',label:'Holo Marketplace',category:'commerce',status:'beta',revenue:['sales','service-fee']},
 {id:'fridge',label:'Holo Fridge / Cold Vault',category:'commerce',status:'beta',revenue:['sales','subscription','delivery-fee']},
 {id:'labs',label:'Holo Labs',category:'creator',status:'beta',revenue:['service-fee','license']},
 {id:'services',label:'Holo Services',category:'service',status:'beta',revenue:['service-fee']},
 {id:'core',label:'Holo Core',category:'infrastructure',status:'beta',revenue:['subscription','service-fee']},
 {id:'music',label:'Holo Music',category:'media',status:'beta',revenue:['subscription','ticket','sales','license']},
 {id:'drama',label:'Holo Drama',category:'media',status:'beta',revenue:['subscription','ticket','sales','sponsorship']},
 {id:'gifts',label:'Holo Gifts',category:'creator',status:'beta',revenue:['gift']},
 {id:'style',label:'Holo Style',category:'commerce',status:'beta',revenue:['sales','rental']},
 {id:'arena',label:'Holo Arena',category:'world',status:'beta',revenue:['ticket','gift','sponsorship']},
 {id:'social',label:'Holo Social',category:'media',status:'beta',revenue:['gift','subscription','sponsorship']},
 {id:'ads',label:'Holo Ads',category:'commerce',status:'beta',revenue:['ad','sponsorship']},
 {id:'fon',label:'Holo FON',category:'infrastructure',status:'beta',revenue:['subscription','service-fee']},
 {id:'care',label:'Holo Care',category:'service',status:'gated',revenue:['service-fee','subscription']},
 {id:'tv',label:'Holo TV / All American Network',category:'media',status:'beta',revenue:['subscription','ad','sponsorship']},
 {id:'reels',label:'Holo Reels',category:'creator',status:'beta',revenue:['sales','gift','sponsorship']},
 {id:'omnibox',label:'OmniBox',category:'creator',status:'beta',revenue:['subscription','license']},
]
export function holoRevenueChannels(id:HoloSystemId){return HOLO_ECOSYSTEM.find(x=>x.id===id)?.revenue||[]}
