/** Original free-play Spades trick prototype, one human seat vs three deterministic bots.
 * No chips, wagering, prizes, purchases, ranked results or multiplayer. */
export const SUITS=['C','D','H','S']
export const RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K','A']
export const SPADE_TRICK_RULES=Object.freeze({mode:'practice-only',paidEntry:false,wagers:false,credits:false,prizes:false,leaderboard:false,payout:false,networkPlay:false})
const compare=(a,b,lead)=>{
 const point=c=>(c.suit==='S'?100: c.suit===lead?50:0)+RANKS.indexOf(c.rank)
 return point(a)-point(b)
}
export function deck(){return SUITS.flatMap(suit=>RANKS.map(rank=>({suit,rank})))}
export function deal(seed=1){
 let n=Number.isFinite(Number(seed))?Number(seed)>>>0:1
 const cards=deck()
 for(let i=cards.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[cards[i],cards[j]]=[cards[j],cards[i]]}
 return Array.from({length:4},(_,seat)=>cards.filter((_,i)=>i%4===seat))
}
export function legal(hand,lead,spadesBroken=false){
 if(!lead){const non=hand.filter(c=>c.suit!=='S');return spadesBroken||non.length===0?hand:non}
 const follow=hand.filter(c=>c.suit===lead)
 return follow.length?follow:hand
}
export function newSpadesPractice(seed=1){
 return {schema:'tryamm.gameverse.spades-practice.v1',seed,hands:deal(seed),leader:0,turn:0,plays:[],tricks:[0,0,0,0],completed:0,spadesBroken:false,finished:false,history:[],mode:'free-practice',cashValue:0}
}
export function playCard(state,seat,card){
 if(state.finished||seat!==state.turn)return {ok:false,error:'Not this player turn',state}
 const hand=state.hands[seat]
 const index=hand.findIndex(c=>c.suit===card?.suit&&c.rank===card?.rank)
 if(index<0)return {ok:false,error:'Card not in hand',state}
 const lead=state.plays[0]?.card.suit
 if(!legal(hand,lead,state.spadesBroken).some(c=>c.suit===card.suit&&c.rank===card.rank))return {ok:false,error:'Follow suit; do not lead spades until broken.',state}
 const hands=state.hands.map(h=>[...h]);hands[seat].splice(index,1)
 const plays=[...state.plays,{seat,card:{suit:card.suit,rank:card.rank}}]
 let next={...state,hands,plays,spadesBroken:state.spadesBroken||card.suit==='S'}
 if(plays.length===4){
  const winner=plays.reduce((a,b)=>compare(b.card,a.card,lead)>0?b:a).seat
  const tricks=[...state.tricks];tricks[winner]++
  const completed=state.completed+1
  next={...next,turn:winner,leader:winner,plays:[],tricks,completed,finished:completed===13,history:[...state.history,{winner,cards:plays}]}
 }else next.turn=(seat+1)%4
 return {ok:true,state:next}
}
export function autoPlayToHuman(state){
 let next=state,steps=0
 while(!next.finished&&next.turn!==0&&steps<50){
  const seat=next.turn,options=legal(next.hands[seat],next.plays[0]?.card.suit,next.spadesBroken)
  const choice=[...options].sort((a,b)=>SUITS.indexOf(a.suit)-SUITS.indexOf(b.suit)||RANKS.indexOf(a.rank)-RANKS.indexOf(b.rank))[0]
  if(!choice)break
  const result=playCard(next,seat,choice)
  if(!result.ok)break
  next=result.state;steps++
 }
 return next
}
export function practiceReceipt(state){
 return {schema:'tryamm.gameverse.spades-practice-receipt.v1',seed:state.seed,rounds:state.completed,finished:state.finished,teamPlayerTricks:state.tricks[0]+state.tricks[2],teamBotsTricks:state.tricks[1]+state.tricks[3],history:state.history,simulated:true,cashValue:0,payoutAllowed:false,verifiedRanked:false}
}
