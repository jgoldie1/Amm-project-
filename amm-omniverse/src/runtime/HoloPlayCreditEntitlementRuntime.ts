export type HoloPlayEntitlement={type:string;itemId:string;label:string;channel:string;effect:string;sourceId:string;cashValueMinor:number;withdrawable:boolean;creatorCashPayout?:boolean}
let installed=false

const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

function apply(entitlement:HoloPlayEntitlement){
 const base={source:'holo-play-card',entitlementId:entitlement.sourceId,itemId:entitlement.itemId,label:entitlement.label,closedLoop:true,cashValueMinor:0,withdrawable:false}
 switch(entitlement.effect){
  case 'holo-spark':emit('tryamm:holo-gift',{...base,giftType:'spark',previewOnly:true,moneyMoved:false});break
  case 'crowd-burst':emit('tryamm:holo-gift',{...base,giftType:'confetti',previewOnly:true,moneyMoved:false});emit('tryamm:live-hype-effect',{...base,effect:'crowd-burst'});break
  case 'sound-drop':emit('tryamm:streetverse-sound-preview',{...base,key:'beat_drop'});break
  case 'poll-pack':emit('tryamm:live-poll-open',base);break
  case 'stage-skin':emit('tryamm:live-stage-skin-unlock',base);break
  case 'live-highlight':emit('tryamm:open-reel-creator',{...base,source:'holo-play-live-highlight'});break
  case 'caption-translation':emit('tryamm:live-caption-translation-request',base);break
  case 'backstage-room':emit('tryamm:live-backstage-room-open',base);break
  case 'pk-arena-fx':emit('tryamm:pk-fx-unlock',base);break
  case 'creator-support-badge':emit('tryamm:live-support-badge',{...base,nonCash:true});break
  case 'spectator-reactions':emit('tryamm:gameverse-spectator-reactions-unlock',base);break
  case 'arena-skin':emit('tryamm:gameverse-arena-skin-unlock',base);break
  case 'cinematic-replay':emit('tryamm:gameverse-cinematic-replay',{...base,openReel:true});emit('tryamm:open-reel-creator',{...base,source:'gameverse-cinematic-replay'});break
  case 'practice-room':emit('tryamm:gameverse-practice-room-open',base);break
  case 'team-clubhouse':emit('tryamm:gameverse-team-clubhouse-open',base);break
  case 'creator-game-room':emit('tryamm:gameverse-creator-room-open',base);break
  case 'quickslots-8':emit('tryamm:pocket-dimension-entitlement',{...base,quickSlots:8});break
  case 'showcase-room':emit('tryamm:pocket-dimension-entitlement',{...base,showcaseRoom:true});break
  case 'portal-theme':emit('tryamm:pocket-dimension-entitlement',{...base,portalTheme:true});break
  case 'wardrobe-wing':emit('tryamm:pocket-dimension-entitlement',{...base,wardrobeWing:true});break
  case 'collectible-gallery':emit('tryamm:pocket-dimension-entitlement',{...base,collectibleGallery:true});break
  case 'broadcast-booth':emit('tryamm:pocket-dimension-entitlement',{...base,broadcastBooth:true});break
  case 'starverse-audition':emit('tryamm:starverse-audition-render',{...base});break
  case 'episode-render':emit('tryamm:movie-studio-render-request',{...base,format:'episode'});break
  case 'movie-render':emit('tryamm:movie-studio-render-request',{...base,format:'movie'});break
  case 'broadcast-graphics':emit('tryamm:broadcast-graphics-unlock',base);break
  case 'rp-scene-compile':emit('tryamm:rp-genii-request',{...base,query:'premium RP scene compile',mode:'scene'});break
  case 'open-reel-render':emit('tryamm:open-reel-creator',{...base,source:'holo-play-premium-reel'});break
  case 'vr-scene-render':emit('tryamm:meta-quest-request-immersive',{...base,mode:'immersive-vr'});break
  case 'virtual-vehicle-rental':emit('tryamm:streetverse-virtual-vehicle-rental',base);break
  case 'holo-world-skin':emit('tryamm:streetverse-world-skin-unlock',base);break
  case 'creator-tool-pack':emit('tryamm:star-studio-tool-pack-unlock',base);break
  case 'omnibox-storage-boost':emit('tryamm:omnibox-storage-boost-unlock',base);break
  default:emit('tryamm:holo-play-entitlement-applied',base);break
 }
 emit('tryamm:holo-play-entitlement-applied',{...base,effect:entitlement.effect,channel:entitlement.channel})
}

export function installHoloPlayCreditEntitlementRuntime(){
 if(installed||typeof window==='undefined')return()=>{}
 installed=true
 const onEntitlement=(event:Event)=>{const e=(event as CustomEvent<HoloPlayEntitlement>).detail;if(e?.effect)apply(e)}
 addEventListener('tryamm:holo-play-entitlement',onEntitlement)
 emit('tryamm:holo-play-entitlement-runtime-ready',{channels:['LIVE','GAMEVERSE','POCKET_DIMENSION','STAR_STUDIO','STREETVERSE','REELS','VR_MR','OMNIBOX']})
 return()=>{removeEventListener('tryamm:holo-play-entitlement',onEntitlement);installed=false}
}