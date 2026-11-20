/** Verify practice snapshot shape only; NOT anti-cheat or authoritative gameplay. */
const suit=/^[CDHS]$/,rank=/^(?:[2-9]|10|J|Q|K|A)$/
const number=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max
function card(c){return c&&suit.test(c.suit)&&rank.test(c.rank)?{suit:c.suit,rank:c.rank}:null}
function cards(arr,max){if(!Array.isArray(arr)||arr.length>max)return null;const v=arr.map(card);return v.some(x=>!x)?null:v}
function plays(arr){if(!Array.isArray(arr)||arr.length>4)return null;const v=arr.map(p=>({seat:p?.seat,card:card(p?.card)}));return v.some(x=>!Number.isInteger(x.seat)||x.seat<0||x.seat>3||!x.card)?null:v}
export function cleanGameVersePracticeState(gameId,state){
 if(!state||typeof state!=='object'||Array.isArray(state))return null
 if(gameId==='spades-practice'){
  if(state.schema!=='tryamm.gameverse.spades-practice.v1'||!number(state.seed,0,4294967295)||!Number.isInteger(state.seed))return null
  if(!Array.isArray(state.hands)||state.hands.length!==4)return null
  const hands=state.hands.map(x=>cards(x,13)),active=plays(state.plays)
  const tricks=state.tricks
  if(hands.some(x=>!x)||!active||!Array.isArray(tricks)||tricks.length!==4||tricks.some(x=>!Number.isInteger(x)||!number(x,0,13)))return null
  if(!Number.isInteger(state.completed)||!number(state.completed,0,13)||tricks.reduce((a,b)=>a+b,0)!==state.completed)return null
  if(!Number.isInteger(state.turn)||!number(state.turn,0,3)||!Number.isInteger(state.leader)||!number(state.leader,0,3))return null
  if(!Array.isArray(state.history)||state.history.length!==state.completed||state.history.length>13)return null
  const history=state.history.map(x=>({winner:x?.winner,cards:plays(x?.cards)}))
  if(history.some(x=>!Number.isInteger(x.winner)||!number(x.winner,0,3)||x.cards?.length!==4))return null
  if(state.cashValue!==0)return null
  return {schema:state.schema,seed:state.seed,hands,plays:active,tricks,completed:state.completed,turn:state.turn,leader:state.leader,
   spadesBroken:Boolean(state.spadesBroken),finished:Boolean(state.finished),history,mode:'free-practice',cashValue:0}
 }
 if(gameId==='pool-practice'){
  if(state.schema!=='tryamm.gameverse.pool-practice.v1'||state.cashValue!==0)return null
  const ball=b=>{if(!b||!['x','y','vx','vy'].every(k=>number(b[k],-2000,2000)))return null;return {x:b.x,y:b.y,vx:b.vx,vy:b.vy}}
  const cue=ball(state.cue),target=ball(state.target)
  if(!cue||!target||!Number.isInteger(state.shots)||!number(state.shots,0,12))return null
  return {schema:state.schema,cue,target,potted:Boolean(state.potted),shots:state.shots,complete:Boolean(state.complete),cashValue:0}
 }
 return null
}
