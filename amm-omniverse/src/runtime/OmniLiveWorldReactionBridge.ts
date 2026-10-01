import {applyLiveHype,EMPTY_LIVE_HYPE,liveHypePresentation,type LiveHypeEvent,type LiveHypeState} from './LiveHypeEngine'
import {normalizeOmniBoardEvent,type OmniBoardEvent} from './OmniLiveEventBoard'

export type OmniWorldReaction={hype:LiveHypeState;crowd:boolean;holographicBurst:boolean;giftCombo:boolean;reelCandidate:boolean;pkEligible:boolean}
let hype:LiveHypeState=EMPTY_LIVE_HYPE

function signalFor(e:OmniBoardEvent):LiveHypeEvent['signal']{
 if(e.kind==='gift'||e.kind==='tip')return 'gift'
 if(e.kind==='follow')return 'follow'
 if(e.kind==='share')return 'share'
 if(e.kind==='pk')return 'pk-score'
 return 'chat'
}
export function ingestOmniLiveWorldEvent(event:OmniBoardEvent):OmniWorldReaction{
 const normalized=normalizeOmniBoardEvent(event)
 hype=applyLiveHype(hype,{id:event.id,signal:signalFor(event),platform:event.platform,actorId:event.userId,value:event.amount,verified:event.verified,at:Date.parse(event.receivedAt)||Date.now()})
 const fx=liveHypePresentation(hype)
 const reaction={hype,crowd:fx.triggerCrowdReaction,holographicBurst:fx.triggerHolographicBurst,giftCombo:fx.triggerGiftCombo,reelCandidate:fx.featureMomentForReel,pkEligible:normalized.contributesToPk}
 if(typeof window!=='undefined'){
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-live-reaction',{detail:reaction}))
  if(reaction.reelCandidate)window.dispatchEvent(new CustomEvent('tryamm:reel-moment-candidate',{detail:{source:'omni-live',eventId:event.id,platform:event.platform,hypeLevel:hype.level}}))
 }
 return reaction
}
export function resetOmniLiveHype(){hype=EMPTY_LIVE_HYPE}
