/** StreetVerse career, reputation and creator economy — fictional credits only.
 * No real-money payouts, tokens, cash-out, investment returns or transferable balances.
 */
export type Career='student'|'delivery'|'mechanic'|'business'
export type Skill='learning'|'logistics'|'repair'|'enterprise'
export type PlayerCareerState={
 playerId:string;career:Career;xp:number;credits:number;
 skills:Record<Skill,number>;reputation:Record<Career,number>;
 completedMissionIds:string[];ownedMods:string[];ledger:LedgerEntry[]
}
export type LedgerEntry={id:string;kind:'mission'|'mod-purchase'|'creator-royalty';creditsDelta:number;reason:string}
export type MissionReceipt={id:string;career:Career;xp:number;credits:number;skill:Skill;reputation:number}
export type CreatorMod={id:string;creatorId:string;title:string;priceCredits:number;approved:boolean;version:string}
const skills:Record<Career,Skill>={student:'learning',delivery:'logistics',mechanic:'repair',business:'enterprise'}
const cap=(value:number,max:number)=>Math.max(0,Math.min(max,value))
export const createCareerState=(playerId:string,career:Career):PlayerCareerState=>({
 playerId,career,xp:0,credits:0,
 skills:{learning:0,logistics:0,repair:0,enterprise:0},
 reputation:{student:0,delivery:0,mechanic:0,business:0},
 completedMissionIds:[],ownedMods:[],ledger:[]
})
export function completeCareerMission(state:PlayerCareerState,receipt:MissionReceipt):PlayerCareerState{
 if(!receipt.id||state.completedMissionIds.includes(receipt.id))return state
 if(receipt.career!==state.career||receipt.skill!==skills[receipt.career])throw new Error('Mission career/skill mismatch')
 for(const n of [receipt.xp,receipt.credits,receipt.reputation])if(!Number.isSafeInteger(n)||n<0)throw new Error('Invalid mission reward')
 if(receipt.xp>500||receipt.credits>250||receipt.reputation>25)throw new Error('Mission reward exceeds approved cap')
 return {...state,xp:state.xp+receipt.xp,credits:state.credits+receipt.credits,
 skills:{...state.skills,[receipt.skill]:cap(state.skills[receipt.skill]+receipt.xp,10000)},
 reputation:{...state.reputation,[receipt.career]:cap(state.reputation[receipt.career]+receipt.reputation,1000)},
 completedMissionIds:[...state.completedMissionIds,receipt.id],
 ledger:[...state.ledger,{id:receipt.id,kind:'mission',creditsDelta:receipt.credits,reason:receipt.career+' mission completed'}]}
}
export const careerLevel=(state:PlayerCareerState)=>1+Math.floor(state.xp/500)
export const unlockedOpportunities=(state:PlayerCareerState)=>{
 const score=state.reputation[state.career],level=careerLevel(state)
 return ['entry missions',...(level>=2?['advanced contracts']:[]),...(score>=50?['trusted community jobs']:[]),...(level>=5&&score>=100?['career mentor and shop permits']:[])]
}
/** Creator marketplace: vetted cosmetic/content mods, not arbitrary executable scripts. */
export function purchaseApprovedMod(buyer:PlayerCareerState,creator:PlayerCareerState,mod:CreatorMod){
 if(!mod.approved||!mod.id||!mod.creatorId||mod.creatorId!==creator.playerId)throw new Error('Mod not approved or creator mismatch')
 if(buyer.playerId===creator.playerId)throw new Error('Self-purchase prohibited')
 if(buyer.ownedMods.includes(mod.id))throw new Error('Mod already owned')
 if(!Number.isSafeInteger(mod.priceCredits)||mod.priceCredits<1||mod.priceCredits>10000)throw new Error('Invalid mod price')
 if(buyer.credits<mod.priceCredits)throw new Error('Insufficient fictional credits')
 const royalty=Math.floor(mod.priceCredits*0.7)
 const tx='mod:'+mod.id+':'+buyer.playerId
 return {
  buyer:{...buyer,credits:buyer.credits-mod.priceCredits,ownedMods:[...buyer.ownedMods,mod.id],ledger:[...buyer.ledger,{id:tx,kind:'mod-purchase' as const,creditsDelta:-mod.priceCredits,reason:mod.title}]},
  creator:{...creator,credits:creator.credits+royalty,ledger:[...creator.ledger,{id:tx,kind:'creator-royalty' as const,creditsDelta:royalty,reason:mod.title}]},
  platformSink:mod.priceCredits-royalty
 }
}
