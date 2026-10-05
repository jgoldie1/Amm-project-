export type TryammCreditBucket='HOLO_EARNED'|'PLAY_PURCHASED'
export type TryammCreditPack={id:string;label:string;units:number;priceMinor:number}
export type TryammCreditSpendKind='creator-tool'|'world-utility'|'media-tool'|'game-utility'|'live-engagement'|'gameverse'|'pocket-dimension'|'star-studio'
export type TryammCreditSpendItem={id:string;label:string;costUnits:number;description:string;kind:TryammCreditSpendKind;channel:'LIVE'|'REELS'|'VR_MR'|'GAMEVERSE'|'POCKET_DIMENSION'|'STAR_STUDIO'|'OMNIBOX'|'STREETVERSE';effect:string}

export const TRYAMM_CREDIT_PACKS:readonly TryammCreditPack[]=[
 {id:'holo-play-500',label:'500 Play Credits',units:500,priceMinor:499},
 {id:'holo-play-1100',label:'1,100 Play Credits',units:1100,priceMinor:999},
 {id:'holo-play-2400',label:'2,400 Play Credits',units:2400,priceMinor:1999},
 {id:'holo-play-6500',label:'6,500 Play Credits',units:6500,priceMinor:4999},
] as const

export const TRYAMM_CREDIT_SPEND_CATALOG:readonly TryammCreditSpendItem[]=[
 {id:'rp-scene-compile',label:'RP Genii Scene Compile',costUnits:25,description:'Compile one premium RP scene package from existing approved assets.',kind:'creator-tool',channel:'STREETVERSE',effect:'rp-scene-compile'},
 {id:'premium-reel-render',label:'Premium Reel Render',costUnits:40,description:'Premium creator render/export utility for one Reel job.',kind:'media-tool',channel:'REELS',effect:'open-reel-render'},
 {id:'vr-scene-render',label:'VR / MR Scene Render',costUnits:75,description:'Immersive scene processing utility. Adult After Dark content remains separately age/consent gated.',kind:'media-tool',channel:'VR_MR',effect:'vr-scene-render'},
 {id:'virtual-vehicle-rental',label:'StreetVerse Virtual Vehicle Rental',costUnits:100,description:'Closed-loop virtual vehicle rental entitlement; not a real-world vehicle rental.',kind:'game-utility',channel:'STREETVERSE',effect:'virtual-vehicle-rental'},
 {id:'holo-world-skin',label:'Holo World Skin',costUnits:150,description:'Cosmetic world/room skin entitlement.',kind:'world-utility',channel:'STREETVERSE',effect:'holo-world-skin'},
 {id:'creator-tool-pack',label:'Creator Tool Pack',costUnits:60,description:'Deterministic creator-tool utility bundle. No randomized loot or gambling.',kind:'creator-tool',channel:'STAR_STUDIO',effect:'creator-tool-pack'},
 {id:'omni-storage-boost',label:'OmniBox Storage Boost',costUnits:80,description:'TRYAMM creator-storage utility entitlement.',kind:'creator-tool',channel:'OMNIBOX',effect:'omnibox-storage-boost'},

 {id:'live-holo-spark',label:'LIVE Holo Spark',costUnits:10,description:'Trigger a deterministic holographic reaction in a LIVE room. Non-cash engagement effect.',kind:'live-engagement',channel:'LIVE',effect:'holo-spark'},
 {id:'live-crowd-burst',label:'LIVE Crowd Burst',costUnits:20,description:'Trigger an audience-safe crowd/confetti reaction without fabricating viewers or gifts.',kind:'live-engagement',channel:'LIVE',effect:'crowd-burst'},
 {id:'live-sound-drop',label:'LIVE Sound Drop',costUnits:15,description:'Play one approved SFX/music cue in the creator room.',kind:'live-engagement',channel:'LIVE',effect:'sound-drop'},
 {id:'live-poll-pack',label:'LIVE Poll Pack',costUnits:15,description:'Unlock one deterministic audience poll interaction for the active room.',kind:'live-engagement',channel:'LIVE',effect:'poll-pack'},
 {id:'live-stage-skin',label:'LIVE Holo Stage Skin',costUnits:120,description:'Unlock a cosmetic stage theme for LIVE, Showcase, Podcast or GameCast.',kind:'live-engagement',channel:'LIVE',effect:'stage-skin'},
 {id:'live-highlight-clip',label:'LIVE Highlight Clip',costUnits:40,description:'Send the current LIVE moment into the Reel/highlight workflow.',kind:'media-tool',channel:'LIVE',effect:'live-highlight'},
 {id:'live-caption-translation-pack',label:'LIVE Caption + Translation Pack',costUnits:45,description:'Unlock one caption/translation processing session when the provider/runtime is available.',kind:'live-engagement',channel:'LIVE',effect:'caption-translation'},
 {id:'live-backstage-room',label:'Creator Backstage Room',costUnits:150,description:'Unlock a private digital backstage-room entitlement for a creator event; moderation and age gates still apply.',kind:'live-engagement',channel:'LIVE',effect:'backstage-room'},
 {id:'live-pk-arena-fx',label:'PK Arena FX Pack',costUnits:50,description:'Deterministic PK visual/audio effects only; does not change score, odds or cash prizes.',kind:'live-engagement',channel:'LIVE',effect:'pk-arena-fx'},
 {id:'live-holo-support-badge',label:'Holo Support Badge',costUnits:25,description:'Send a visible support badge/effect to a creator. Non-cash; real creator tips remain on the verified money rail.',kind:'live-engagement',channel:'LIVE',effect:'creator-support-badge'},

 {id:'gameverse-spectator-reactions',label:'GameVerse Spectator Reactions',costUnits:30,description:'Unlock a deterministic spectator emote/reaction pack.',kind:'gameverse',channel:'GAMEVERSE',effect:'spectator-reactions'},
 {id:'gameverse-arena-skin',label:'GameVerse Arena Skin',costUnits:75,description:'Cosmetic arena presentation entitlement. No competitive advantage.',kind:'gameverse',channel:'GAMEVERSE',effect:'arena-skin'},
 {id:'gameverse-cinematic-replay',label:'GameVerse Cinematic Replay',costUnits:40,description:'Package a completed game moment into a cinematic replay/Reel workflow.',kind:'gameverse',channel:'GAMEVERSE',effect:'cinematic-replay'},
 {id:'gameverse-practice-room',label:'Private Practice Room',costUnits:60,description:'Private non-wagering practice-room utility for supported games.',kind:'gameverse',channel:'GAMEVERSE',effect:'practice-room'},
 {id:'gameverse-team-clubhouse',label:'Team Clubhouse Session',costUnits:80,description:'Digital clubhouse/session entitlement for team planning, voice and replay review.',kind:'gameverse',channel:'GAMEVERSE',effect:'team-clubhouse'},
 {id:'gameverse-creator-room',label:'Creator-Hosted Game Room',costUnits:100,description:'Creator-hosted non-wagering game room utility for supported GameVerse experiences.',kind:'gameverse',channel:'GAMEVERSE',effect:'creator-game-room'},

 {id:'pocket-quickslots-8',label:'Pocket Dimension • 8 Quick Slots',costUnits:50,description:'Expand Pocket Dimension quick access from 4 to 8 slots.',kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'quickslots-8'},
 {id:'pocket-showcase-room',label:'Pocket Dimension Showcase Room',costUnits:100,description:'Unlock a personal digital showcase room for owned/accessible assets.',kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'showcase-room'},
 {id:'pocket-portal-theme',label:'Pocket Dimension Portal Theme',costUnits:75,description:'Cosmetic portal/entry theme for the personal asset space.',kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'portal-theme'},
 {id:'pocket-wardrobe-wing',label:'Pocket Dimension Wardrobe Wing',costUnits:80,description:'Unlock a dedicated wardrobe organization view for eligible avatar items.',kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'wardrobe-wing'},
 {id:'pocket-collectible-gallery',label:'Pocket Dimension Collectible Gallery',costUnits:90,description:'Unlock a personal gallery display for owned digital collectibles.',kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'collectible-gallery'},
 {id:'pocket-broadcast-booth',label:'Pocket Dimension Broadcast Booth',costUnits:120,description:'Unlock a private creator/broadcast setup linked to LIVE and Reel workflows.',kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'broadcast-booth'},

 {id:'starverse-audition-render',label:'StarVerse Audition Render',costUnits:40,description:'Premium audition clip packaging for Anyone Can Be a Star.',kind:'star-studio',channel:'STAR_STUDIO',effect:'starverse-audition'},
 {id:'episode-render-pack',label:'TV Episode Render Pack',costUnits:150,description:'Episode packaging/render utility for eligible creator productions.',kind:'media-tool',channel:'STAR_STUDIO',effect:'episode-render'},
 {id:'movie-render-pack',label:'Movie Render Pack',costUnits:300,description:'Long-form movie packaging/render utility. Rights, safety and provider capacity remain gated.',kind:'media-tool',channel:'STAR_STUDIO',effect:'movie-render'},
 {id:'broadcast-graphics-pack',label:'Broadcast Graphics Pack',costUnits:100,description:'Lower thirds, intro/outro and network graphics utility for creator broadcasts.',kind:'star-studio',channel:'STAR_STUDIO',effect:'broadcast-graphics'},
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
 realCardFunding:'Web/PWA may use verified provider checkout. Native iOS/Android digital credit sales must follow the applicable app-store billing rules.',
 nativeMobileBillingBoundary:'Do not route native App Store/Google Play digital-credit purchases through an external card checkout when store billing is required.',
 label:'HOLO PLAY CARD • IN-APP ONLY • NOT A BANK OR CREDIT CARD',
} as const

export const creditItemsByChannel=(channel:TryammCreditSpendItem['channel'])=>TRYAMM_CREDIT_SPEND_CATALOG.filter(x=>x.channel===channel)
export const formatCreditUnits=(n:number)=>new Intl.NumberFormat('en-US').format(Math.max(0,Math.floor(n)))