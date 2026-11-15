import {createCareerState,completeCareerMission,purchaseApprovedMod} from './StreetVerseCareerEconomy'
import type {PlayerCareerState} from './StreetVerseCareerEconomy'
import {createAccessibleModDraft,reviewCreatorMod,submitCreatorMod,decideCreatorMod,REAL_MONEY_PAYOUTS_ENABLED} from './StreetVerseCreatorProgram'
import type {CreatorSubmission} from './StreetVerseCreatorProgram'
/** Explicitly simulated offline acceptance journey. Never issues server-authoritative rewards or public listings. */
export type JourneyStep='enter-chicago'|'play-bj'|'complete-mission'|'earn-credits'|'open-studio'|'customize-jacket'|'submit-review'|'approve-demo'|'find-approved'|'buy-cosmetic'|'complete'
export const JOURNEY_STEPS:readonly JourneyStep[]=['enter-chicago','play-bj','complete-mission','earn-credits','open-studio','customize-jacket','submit-review','approve-demo','find-approved','buy-cosmetic','complete']
export type JourneyState={step:JourneyStep;player:PlayerCareerState;creator:PlayerCareerState;color:string;submission:CreatorSubmission|null;listed:boolean;receiptId:string;message:string}
const preset={id:'streetverse-jacket',category:'clothing' as const,label:'StreetVerse Jacket',palette:['#ff69b4','#151515','#2845a7','#a31b30','#e0b64b']}
export function startFreePlayJourney():JourneyState{
 return {step:'enter-chicago',player:createCareerState('bj-demo','delivery'),creator:createCareerState('creator-demo','business'),color:preset.palette[0],submission:null,listed:false,receiptId:'chicago-delivery-demo-001',message:'Offline demonstration; no live 3D mission, account credit or public sale.'}
}
export function advanceFreePlayJourney(s:JourneyState,action:JourneyStep,color?:string):JourneyState{
 if(action!==s.step)throw new Error('Finish the current journey step first')
 switch(action){
  case 'enter-chicago':return {...s,step:'play-bj',message:'Chicago demo entered; BJ movement is simulated in this test.'}
  case 'play-bj':return {...s,step:'complete-mission',message:'BJ selected for the offline Chicago delivery simulation.'}
  case 'complete-mission':return {...s,step:'earn-credits',message:'Delivery objective marked complete. Confirm the fictional mission reward.'}
  case 'earn-credits':return {...s,step:'open-studio',player:completeCareerMission(s.player,{id:s.receiptId,career:'delivery',skill:'logistics',xp:100,credits:100,reputation:10}),message:'Earned 100 fictional demo credits once; no cash value.'}
  case 'open-studio':return {...s,step:'customize-jacket',message:'Creator Studio demo opened.'}
  case 'customize-jacket':{
   const selected=color??s.color
   if(!preset.palette.includes(selected))throw new Error('Select an approved jacket color')
   return {...s,step:'submit-review',color:selected,message:'Jacket color selected. This is not a fitted 3D garment.'}
  }
  case 'submit-review':{
   const draft={...createAccessibleModDraft(s.creator.playerId,preset,s.color),rightsConfirmed:true}
   const review=reviewCreatorMod(draft)
   if(!review.approved)throw new Error(review.reasons.join('; '))
   return {...s,step:'approve-demo',submission:submitCreatorMod(draft),message:'Pending demo moderation; not publicly published.'}
  }
  case 'approve-demo':{
   if(!s.submission)throw new Error('Missing submission')
   const submission=decideCreatorMod(s.submission,'independent-demo-moderator',true,'Offline simulation approval; not a production decision')
   return {...s,step:'find-approved',submission,message:'Approved locally by separate demo reviewer; not a real moderator.'}
  }
  case 'find-approved':{
   if(s.submission?.status!=='approved')throw new Error('Item is not approved')
   return {...s,step:'buy-cosmetic',listed:true,message:'Approved jacket found in offline demo marketplace.'}
  }
  case 'buy-cosmetic':{
   if(!s.listed||s.submission?.status!=='approved')throw new Error('Approved listing required')
   const mod={id:s.submission.draft.id,creatorId:s.creator.playerId,title:s.submission.draft.title,priceCredits:s.submission.draft.priceCredits,approved:true,version:'1.0'}
   const sale=purchaseApprovedMod(s.player,s.creator,mod)
   return {...s,step:'complete',player:sale.buyer,creator:sale.creator,message:'Demo jacket acquired for 25 fictional credits. No payment, public listing or cash-out.'}
  }
  case 'complete':throw new Error('Journey already completed')
 }
}
export const JOURNEY_REAL_MONEY_ENABLED=REAL_MONEY_PAYOUTS_ENABLED
