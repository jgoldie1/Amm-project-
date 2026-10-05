import crypto from 'node:crypto'
import {adminRpc,json} from '../_lib/supabase-admin.js'
import {requireUser,audit} from '../_lib/security.js'

const CATALOG=new Map([
 ['rp-scene-compile',{label:"RP Genii Scene Compile",costUnits:25,kind:'creator-tool',channel:'STREETVERSE',effect:'rp-scene-compile'}],
 ['premium-reel-render',{label:"Premium Reel Render",costUnits:40,kind:'media-tool',channel:'REELS',effect:'open-reel-render'}],
 ['vr-scene-render',{label:"VR / MR Scene Render",costUnits:75,kind:'media-tool',channel:'VR_MR',effect:'vr-scene-render'}],
 ['virtual-vehicle-rental',{label:"StreetVerse Virtual Vehicle Rental",costUnits:100,kind:'game-utility',channel:'STREETVERSE',effect:'virtual-vehicle-rental'}],
 ['holo-world-skin',{label:"Holo World Skin",costUnits:150,kind:'world-utility',channel:'STREETVERSE',effect:'holo-world-skin'}],
 ['creator-tool-pack',{label:"Creator Tool Pack",costUnits:60,kind:'creator-tool',channel:'STAR_STUDIO',effect:'creator-tool-pack'}],
 ['omni-storage-boost',{label:"OmniBox Storage Boost",costUnits:80,kind:'creator-tool',channel:'OMNIBOX',effect:'omnibox-storage-boost'}],
 ['live-holo-spark',{label:"LIVE Holo Spark",costUnits:10,kind:'live-engagement',channel:'LIVE',effect:'holo-spark'}],
 ['live-crowd-burst',{label:"LIVE Crowd Burst",costUnits:20,kind:'live-engagement',channel:'LIVE',effect:'crowd-burst'}],
 ['live-sound-drop',{label:"LIVE Sound Drop",costUnits:15,kind:'live-engagement',channel:'LIVE',effect:'sound-drop'}],
 ['live-poll-pack',{label:"LIVE Poll Pack",costUnits:15,kind:'live-engagement',channel:'LIVE',effect:'poll-pack'}],
 ['live-stage-skin',{label:"LIVE Holo Stage Skin",costUnits:120,kind:'live-engagement',channel:'LIVE',effect:'stage-skin'}],
 ['live-highlight-clip',{label:"LIVE Highlight Clip",costUnits:40,kind:'media-tool',channel:'LIVE',effect:'live-highlight'}],
 ['live-caption-translation-pack',{label:"LIVE Caption + Translation Pack",costUnits:45,kind:'live-engagement',channel:'LIVE',effect:'caption-translation'}],
 ['live-backstage-room',{label:"Creator Backstage Room",costUnits:150,kind:'live-engagement',channel:'LIVE',effect:'backstage-room'}],
 ['live-pk-arena-fx',{label:"PK Arena FX Pack",costUnits:50,kind:'live-engagement',channel:'LIVE',effect:'pk-arena-fx'}],
 ['live-holo-support-badge',{label:"Holo Support Badge",costUnits:25,kind:'live-engagement',channel:'LIVE',effect:'creator-support-badge'}],
 ['gameverse-spectator-reactions',{label:"GameVerse Spectator Reactions",costUnits:30,kind:'gameverse',channel:'GAMEVERSE',effect:'spectator-reactions'}],
 ['gameverse-arena-skin',{label:"GameVerse Arena Skin",costUnits:75,kind:'gameverse',channel:'GAMEVERSE',effect:'arena-skin'}],
 ['gameverse-cinematic-replay',{label:"GameVerse Cinematic Replay",costUnits:40,kind:'gameverse',channel:'GAMEVERSE',effect:'cinematic-replay'}],
 ['gameverse-practice-room',{label:"Private Practice Room",costUnits:60,kind:'gameverse',channel:'GAMEVERSE',effect:'practice-room'}],
 ['gameverse-team-clubhouse',{label:"Team Clubhouse Session",costUnits:80,kind:'gameverse',channel:'GAMEVERSE',effect:'team-clubhouse'}],
 ['gameverse-creator-room',{label:"Creator-Hosted Game Room",costUnits:100,kind:'gameverse',channel:'GAMEVERSE',effect:'creator-game-room'}],
 ['pocket-quickslots-8',{label:"Pocket Dimension • 8 Quick Slots",costUnits:50,kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'quickslots-8'}],
 ['pocket-showcase-room',{label:"Pocket Dimension Showcase Room",costUnits:100,kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'showcase-room'}],
 ['pocket-portal-theme',{label:"Pocket Dimension Portal Theme",costUnits:75,kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'portal-theme'}],
 ['pocket-wardrobe-wing',{label:"Pocket Dimension Wardrobe Wing",costUnits:80,kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'wardrobe-wing'}],
 ['pocket-collectible-gallery',{label:"Pocket Dimension Collectible Gallery",costUnits:90,kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'collectible-gallery'}],
 ['pocket-broadcast-booth',{label:"Pocket Dimension Broadcast Booth",costUnits:120,kind:'pocket-dimension',channel:'POCKET_DIMENSION',effect:'broadcast-booth'}],
 ['starverse-audition-render',{label:"StarVerse Audition Render",costUnits:40,kind:'star-studio',channel:'STAR_STUDIO',effect:'starverse-audition'}],
 ['episode-render-pack',{label:"TV Episode Render Pack",costUnits:150,kind:'media-tool',channel:'STAR_STUDIO',effect:'episode-render'}],
 ['movie-render-pack',{label:"Movie Render Pack",costUnits:300,kind:'media-tool',channel:'STAR_STUDIO',effect:'movie-render'}],
 ['broadcast-graphics-pack',{label:"Broadcast Graphics Pack",costUnits:100,kind:'star-studio',channel:'STAR_STUDIO',effect:'broadcast-graphics'}],
 ['crossverse-portal-skin',{label:"CrossVerse Portal Skin",costUnits:60,kind:'world-utility',channel:'CROSSVERSE',effect:'crossverse-portal-skin'}],
 ['crossverse-showcase-projection',{label:"CrossVerse Showcase Projection",costUnits:80,kind:'creator-tool',channel:'CROSSVERSE',effect:'crossverse-showcase-projection'}],
 ['crossverse-creator-stage',{label:"CrossVerse Creator Stage",costUnits:120,kind:'world-utility',channel:'CROSSVERSE',effect:'crossverse-creator-stage'}],
 ['crossverse-cinematic-replay',{label:"CrossVerse Cinematic Replay",costUnits:40,kind:'media-tool',channel:'CROSSVERSE',effect:'crossverse-cinematic-replay'}],
 ['crossverse-holo-fx-pack',{label:"CrossVerse Holo FX Pack",costUnits:50,kind:'world-utility',channel:'CROSSVERSE',effect:'crossverse-holo-fx'}],
])

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const itemId=String(req.body?.itemId||'').trim()
 const item=CATALOG.get(itemId)
 if(!item)return json(res,400,{error:'Unknown or ineligible TRYAMM credit item'})
 const clientReference=String(req.body?.clientReference||'').trim().replace(/[^a-zA-Z0-9:_-]/g,'').slice(0,96)
 const sourceId=clientReference||('credit-spend-'+crypto.randomUUID())
 try{
  const result=await adminRpc('spend_tryamm_credits',{
   p_user_id:user.id,
   p_units:item.costUnits,
   p_source_id:sourceId,
   p_metadata:{
    itemId,label:item.label,kind:item.kind,channel:item.channel,effect:item.effect,
    closedLoop:true,deterministic:true,randomizedReward:false,wager:false,
    withdrawable:false,cashValueMinor:0
   }
  })
  await audit(user.id,'tryamm_credit_spend','info',{itemId,costUnits:item.costUnits,channel:item.channel,effect:item.effect,sourceId})
  return json(res,200,{
   ok:true,
   item:{id:itemId,...item},
   result,
   entitlement:{
    type:'closed-loop-digital-utility',
    itemId,label:item.label,channel:item.channel,effect:item.effect,sourceId,
    cashValueMinor:0,withdrawable:false,creatorCashPayout:false
   }
  })
 }catch(error){
  const code=String(error?.message||error)
  await audit(user.id,'tryamm_credit_spend_failed','medium',{itemId,sourceId,error:code})
  if(code.includes('insufficient_tryamm_credits'))return json(res,409,{ok:false,state:'INSUFFICIENT_CREDITS',error:'Not enough Holo + Play Credits.'})
  if(code.includes('credit_wallet_not_spendable'))return json(res,423,{ok:false,state:'WALLET_FROZEN',error:'Credit wallet is temporarily not spendable.'})
  return json(res,500,{ok:false,error:'Unable to apply TRYAMM credit spend safely.'})
 }
}