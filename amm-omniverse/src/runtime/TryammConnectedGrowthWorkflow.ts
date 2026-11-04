/**
 * TRYAMM connected growth funnel. Catalog/guardrails only: payments,
 * publication, AI execution and ad settlement require server verification.
 */
export type TryammGrowthOfferId=
  'website-preview'|'website-experience'|'digital-twin'|'holo-ads'|'holo-reel'|'product-placement'
export type TryammGrowthOffer={
 id:TryammGrowthOfferId;title:string;summary:string;priceUsd:number|null;
 status:'quote-required'|'preview-offer';delivery:string;includes:readonly string[]
}
export const TRYAMM_GROWTH_OFFERS:readonly TryammGrowthOffer[]=[
 {id:'website-preview',title:'Website Preview',summary:'Start with one customer-ready digital front door.',priceUsd:499,status:'preview-offer',delivery:'Scope and schedule confirmed before payment',includes:['Mobile-friendly website preview','One promotional Reel','QR business link','Branding and contact CTA']},
 {id:'website-experience',title:'Website Experience',summary:'A landing page and coordinated creator media.',priceUsd:1250,status:'preview-offer',delivery:'Final scope, approval and payment required',includes:['Landing page','Three promotional Reels','Customer inquiry pathway']},
 {id:'digital-twin',title:'StreetVerse Digital Twin',summary:'A business website plus a proposed in-world showcase.',priceUsd:2500,status:'preview-offer',delivery:'3D placement and asset availability verified case by case',includes:['Landing page','Five Reels','StreetVerse digital-twin proposal']},
 {id:'holo-ads',title:'Holographic Advertising',summary:'Approved brand placements across TRYAMM digital experiences.',priceUsd:null,status:'quote-required',delivery:'Advertising inventory, disclosure and rights approval first',includes:['Campaign draft','Creative and audience review','Placement proposal','Server-verified delivery required before billing']},
 {id:'holo-reel',title:'Holo Reel / Creator Production',summary:'Capture a short video and connect it to a business inquiry.',priceUsd:null,status:'quote-required',delivery:'Media upload, review and publication rights verified',includes:['Reel brief','Media Studio handoff','Caption and CTA','OmniBox eligible destination after moderation']},
 {id:'product-placement',title:'Holographic Product Placement',summary:'An approved product can appear in a Reel, showcase or StreetVerse scene.',priceUsd:null,status:'quote-required',delivery:'Brand rights, model fit, product accuracy and scene approval required',includes:['Product brief','Trademark and media permission check','Scene/storyboard placement','Merchant CTA','Approved publishing and measurement']}
] as const

export type TryammGrowthStage='discover'|'inquiry'|'scope'|'verified-payment'|'produce'|'approve'|'publish'|'verify-delivery'
export const TRYAMM_GROWTH_STAGES:readonly {id:TryammGrowthStage;label:string;gate:string}[]=[
 {id:'discover',label:'Discover',gate:'Show accurate capabilities and examples'},
 {id:'inquiry',label:'Inquire',gate:'Customer opts in and receives an inquiry reference'},
 {id:'scope',label:'Confirm scope',gate:'Written deliverables, rights and timeline agreed'},
 {id:'verified-payment',label:'Secure checkout',gate:'Only server-confirmed Stripe payment may release paid work'},
 {id:'produce',label:'Create',gate:'Creator tools use approved assets, people and providers'},
 {id:'approve',label:'Review',gate:'Customer approval, music and likeness/product rights verified'},
 {id:'publish',label:'Publish',gate:'Rights/moderation approval plus authorized destination'},
 {id:'verify-delivery',label:'Report',gate:'Evidence and provider-verified impressions or fulfillment, no fake events'}
]
export const TRYAMM_AI_CONNECTIONS=[
 {id:'hologpt',name:'HoloGPT',status:'interface-present',role:'Guidance and creator navigation; external provider readiness must be checked'},
 {id:'jarvis',name:'Jarvis',status:'bounded-routing',role:'Open approved TRYAMM tools; not autonomous payment or ad publishing'},
 {id:'science-agi5',name:'Five-Sense AGI / AGI 5',status:'research-unverified',role:'Historical five-sense and symbiotic AI architecture; no verified perception model or autonomous runtime'},
 {id:'science-agi',name:'Science AGI',status:'research-unverified',role:'Research-oriented module proposal; no independently verified scientific agent available to customers'},
 {id:'science-agic',name:'AGI-C / Science AGI-C',status:'research-unverified',role:'Proposed coordination architecture; not a deployed AGI or approved decision authority'},
 {id:'omnibox',name:'OmniBox',status:'limited-workflow',role:'Story drafts and rights-gated creator destinations; publishing requires secure backend'},
 {id:'reels',name:'Holo Reels',status:'creator-studio',role:'Capture, compose, render and prepare authorized releases'},
 {id:'holo-ads',name:'Holo Ads',status:'draft-only',role:'Campaign setup; advertiser billing and qualified delivery are server-gated'}
] as const
export type TryammGrowthInquiry={name:string;email:string;businessName:string;offerId:TryammGrowthOfferId;notes:string;consent:boolean}
const clean=(value:string,max:number)=>String(value||'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,max)
export function prepareTryammGrowthInquiry(input:TryammGrowthInquiry){
 const name=clean(input.name,100),email=clean(input.email,180),businessName=clean(input.businessName,150),notes=clean(input.notes,900)
 if(!input.consent)throw new Error('Please authorize TRYAMM to contact you about this request.')
 if(name.length<2||businessName.length<2)throw new Error('Enter your name and business or creator name.')
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid contact email address.')
 const offer=TRYAMM_GROWTH_OFFERS.find(x=>x.id===input.offerId)
 if(!offer)throw new Error('Choose an available service.')
 return {name,email,businessName,plan:offer.id,notes:'Offer: '+offer.title+'\nRequest: '+notes+'\nCustomer authorized contact; no order/payment taken.',source:'tryamm-connected-growth'}
}
