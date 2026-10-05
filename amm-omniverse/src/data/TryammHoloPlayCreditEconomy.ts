export type TryammCreditBucket='HOLO_EARNED'|'PLAY_PURCHASED'
export type TryammCreditPack={id:string;label:string;units:number;priceMinor:number}
export type TryammCreditSpendItem={id:string;label:string;costUnits:number;description:string;kind:'creator-tool'|'world-utility'|'media-tool'|'game-utility'}

export const TRYAMM_CREDIT_PACKS:readonly TryammCreditPack[]=[
 {id:'holo-play-500',label:'500 Play Credits',units:500,priceMinor:499},
 {id:'holo-play-1100',label:'1,100 Play Credits',units:1100,priceMinor:999},
 {id:'holo-play-2400',label:'2,400 Play Credits',units:2400,priceMinor:1999},
 {id:'holo-play-6500',label:'6,500 Play Credits',units:6500,priceMinor:4999},
] as const

export const TRYAMM_CREDIT_SPEND_CATALOG:readonly TryammCreditSpendItem[]=[
 {id:'rp-scene-compile',label:'RP Genii Scene Compile',costUnits:25,description:'Compile one premium RP scene package from existing approved assets.',kind:'creator-tool'},
 {id:'premium-reel-render',label:'Premium Reel Render',costUnits:40,description:'Premium creator render/export utility for one Reel job.',kind:'media-tool'},
 {id:'vr-scene-render',label:'VR / MR Scene Render',costUnits:75,description:'Immersive scene processing utility. Adult After Dark content remains separately age/consent gated.',kind:'media-tool'},
 {id:'virtual-vehicle-rental',label:'StreetVerse Virtual Vehicle Rental',costUnits:100,description:'Closed-loop virtual vehicle rental entitlement; not a real-world vehicle rental.',kind:'game-utility'},
 {id:'holo-world-skin',label:'Holo World Skin',costUnits:150,description:'Cosmetic world/room skin entitlement.',kind:'world-utility'},
 {id:'creator-tool-pack',label:'Creator Tool Pack',costUnits:60,description:'Deterministic creator-tool utility bundle. No randomized loot or gambling.',kind:'creator-tool'},
 {id:'omni-storage-boost',label:'OmniBox Storage Boost',costUnits:80,description:'TRYAMM creator-storage utility entitlement.',kind:'creator-tool'},
] as const

export const TRYAMM_CREDIT_POLICY={
 holoCredits:'earned non-cash loyalty/reward units',
 playCredits:'purchased closed-loop TRYAMM utility units',
 spendOrder:['HOLO_EARNED','PLAY_PURCHASED'] as const,
 cashValueMinor:0,
 withdrawable:false,
 peerToPeerTransfer:false,
 interestBearing:false,
 investment:false,
 appreciates:false,
 bankAccount:false,
 creditCard:false,
 famePurchasable:false,
 creatorCashPayoutsUseRealMoneyLedger:true,
 realCardFunding:'Stripe/provider verified checkout only',
 label:'HOLO PLAY CARD • IN-APP ONLY • NOT A BANK OR CREDIT CARD',
} as const

export const formatCreditUnits=(n:number)=>new Intl.NumberFormat('en-US').format(Math.max(0,Math.floor(n)))