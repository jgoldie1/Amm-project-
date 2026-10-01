export type LiveHypeSignal='gift'|'follow'|'share'|'chat'|'mission-complete'|'pk-score'|'viewer-milestone'
export type LiveHypeEvent={id:string;signal:LiveHypeSignal;platform:string;actorId?:string;value?:number;verified:boolean;at:number}
export type LiveHypeState={score:number;level:0|1|2|3|4|5;streak:number;lastAt:number;recentIds:string[]}

const WEIGHT:Record<LiveHypeSignal,number>={gift:18,follow:5,share:8,chat:2,'mission-complete':15,'pk-score':12,'viewer-milestone':20}
export const EMPTY_LIVE_HYPE:LiveHypeState={score:0,level:0,streak:0,lastAt:0,recentIds:[]}

export function applyLiveHype(state:LiveHypeState,event:LiveHypeEvent):LiveHypeState{
 if(state.recentIds.includes(event.id))return state
 const now=event.at||Date.now(),active=state.lastAt>0&&now-state.lastAt<45_000
 const base=WEIGHT[event.signal],verifiedMultiplier=event.verified?1:0.35
 const score=Math.min(100,Math.max(0,state.score+(base*verifiedMultiplier)+(active?2:0)))
 const level=Math.min(5,Math.floor(score/20)) as LiveHypeState['level']
 return{score,level,streak:active?state.streak+1:1,lastAt:now,recentIds:[event.id,...state.recentIds].slice(0,100)}
}

export function decayLiveHype(state:LiveHypeState,now=Date.now()):LiveHypeState{
 if(!state.lastAt)return state
 const quiet=Math.max(0,now-state.lastAt),drop=Math.floor(quiet/30_000)*5
 const score=Math.max(0,state.score-drop)
 return{...state,score,level:Math.min(5,Math.floor(score/20)) as LiveHypeState['level'],streak:quiet>90_000?0:state.streak}
}

export function liveHypePresentation(state:LiveHypeState){
 return{level:state.level,triggerHolographicBurst:state.level>=3,triggerCrowdReaction:state.level>=2,triggerGiftCombo:state.streak>=3,featureMomentForReel:state.level>=4,neverFabricateViewersOrGifts:true,neverAutoSpendViewerFunds:true}
}
