import {getStubbsPassport} from './meetTheStubbsFamilyFriends'
import {STUBBS_FAMILY_MISSIONS} from './meetTheStubbsMissionBridge'

/** Original cross-city routing adapter for creator, family, business and mission paths.
 * This is a catalog of destinations, NOT proof of live external checkout or a server.
 */
const BUSINESS_PATHS:Record<string,{label:string;path:string;lane:string}[]>={
 'aniyah-stubbs':[{label:'Aniyah 64-Track Studio',path:'/streetverse-business.html',lane:'studio'}],
 'isaiah-stubbs':[{label:'Isaiah AI TV',path:'/streetverse-business.html',lane:'broadcast'}],
 'jacobie-stubbs':[{label:'Jacobie Vision Cybersecurity',path:'/streetverse-business.html',lane:'cybersecurity'}],
 'benny':[{label:'Omni Host / AI Café',path:'/streetverse-business.html',lane:'ai-assistant'}],
 'marcus':[{label:'The City Remembers',path:'/streetverse-marcus-meet-the-stubbs.html',lane:'story'}],
 'tae-monroe':[{label:'Tae Monroe Creator Business',path:'/streetverse-business.html',lane:'creator'}],
 'pastor-kofi':[{label:'Servants of Christ Network',path:'/streetverse-business.html',lane:'faith'}],
 'cash-bae':[{label:'Creator LIVE',path:'/crossverse-live.html',lane:'creator'}],
 'bj-stubbs':[{label:'StreetVerse Family Business',path:'/streetverse-business.html',lane:'family'}],
}
const ID=/^[a-z]{2}-[a-z0-9-]{4,70}$/
export function meetTheStubbsArrivalPath(characterId:string,cityId:string){
 if(!ID.test(cityId))return null
 const character=getStubbsPassport(characterId)
 if(!character)return null
 const missions=STUBBS_FAMILY_MISSIONS.filter(m=>m.characterId===character.id).map(m=>({id:m.id,title:m.title,objective:m.objective,action:m.action,status:'catalog-only' as const}))
 return {cityId,characterId:character.id,name:character.displayName,worlds:character.worlds,missions,
 businesses:BUSINESS_PATHS[character.id]||[],
 arrival:{cityId,spawn:'public-arrival-hub',mode:'preview' as const},
 accountPassport:'server-integration-required',
 commerce:{checkoutVerified:false,realEarnings:false,agentCommissionVerified:false},
 serverPackage:{controlPanel:'planned-adapter',userServerProvisioned:false,requiresTenantIsolation:true,payoutsRequireServerVerification:true}
 }
}
export function meetTheStubbsArrivalRoster(cityId:string){
 if(!ID.test(cityId))return []
 const ids=['bj-stubbs','marcus','benny','aniyah-stubbs','isaiah-stubbs','jacobie-stubbs','tae-monroe','pastor-kofi','cash-bae']
 return ids.map(id=>meetTheStubbsArrivalPath(id,cityId)).filter((v):v is NonNullable<typeof v>=>v!==null)
}
