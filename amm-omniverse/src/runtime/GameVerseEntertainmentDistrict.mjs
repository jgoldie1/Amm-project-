/**
 * All American Entertainment District, free-play RP only.
 * Casino-themed venue is a non-wagering social lounge; there are no chance
 * games, stakes, casino chips, buy-ins, real/virtual prizes, cashouts or
 * creator-payout hooks. Saved records have no financial or entitlement value.
 */
export const ENTERTAINMENT_DISTRICT_KEY='tryamm.gameverse.entertainment-district.v1'
export const ENTERTAINMENT_VENUES=Object.freeze([
 {id:'casino-lounge',name:'All American Casino Lounge',kind:'social',activity:'Meet the concierge and tour the casino-themed entertainment lounge.',mission:'Meet concierge',dialogue:'Welcome! This is a free-play social lounge. No wagers or prize games are available.'},
 {id:'nightclub',name:'All American Nightclub',kind:'music',activity:'Meet the DJ and explore the performance venue.',mission:'Meet the DJ',dialogue:'Welcome to the club! Choose a performance showcase. The admission preview is free.'},
 {id:'hotel',name:'All American Hotel',kind:'hospitality',activity:'Meet the front desk to preview a fictional roleplay room.',mission:'Tour the lobby',dialogue:'Welcome! Your room tour is fictional. This does not create a real booking.'},
 {id:'theater',name:'All American Theater',kind:'cinema',activity:'Meet the usher and preview a creator showcase.',mission:'Meet the usher',dialogue:'Enjoy the creator showcase preview. Streaming licenses and ticketing are not activated.'},
])
export function safeDistrictState(value){
 const visited=Array.isArray(value?.visited)?value.visited.filter(id=>ENTERTAINMENT_VENUES.some(v=>v.id===id)).slice(0,4):[]
 return {version:1,visited:[...new Set(visited)],lastVenue:ENTERTAINMENT_VENUES.some(v=>v.id===value?.lastVenue)?value.lastVenue:null}
}
export function visitEntertainmentVenue(state,id){
 const venue=ENTERTAINMENT_VENUES.find(v=>v.id===id)
 if(!venue)return {ok:false,state:safeDistrictState(state),venue:null,duplicate:false}
 const prior=safeDistrictState(state)
 return {ok:true,state:{version:1,visited:prior.visited.includes(id)?prior.visited:[...prior.visited,id],lastVenue:id},venue,duplicate:prior.visited.includes(id)}
}
export const ENTERTAINMENT_MONEY_RULES=Object.freeze({
 mode:'free-play-social-only',wagers:false,buyIns:false,paidChips:false,randomizedPrizeGames:false,
 prizes:false,cashOut:false,gameCreditWagering:false,redeemableRewards:false,realBookings:false,
 stripeGamblingPayments:false,payouts:false,serverMoneyMovement:false,
})
