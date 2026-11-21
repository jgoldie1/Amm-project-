/** StreetVerse creator program MVP. Real-money payout and community fund are disabled
 * until independent legal, tax, payments, KYC and fraud approvals are completed.
 */
export type ModCategory='clothing'|'hair'|'building'|'mission'|'animation'
export type CreatorLesson={id:string;category:ModCategory;title:string;task:string}
export const CREATOR_ACADEMY:readonly CreatorLesson[]=[
 {id:'clothing-101',category:'clothing',title:'Design an outfit',task:'Create an original jacket colorway and preview it'},
 {id:'hair-101',category:'hair',title:'Create hairstyles',task:'Build a hair preset with inclusive texture choices'},
 {id:'building-101',category:'building',title:'Create a storefront',task:'Arrange a safe building layout with entrances'},
 {id:'mission-101',category:'mission',title:'Create a mission',task:'Choose a start, objective and non-exploit reward'},
 {id:'animation-101',category:'animation',title:'Create a gesture',task:'Select a licensed animation and validate rig compatibility'}
]
export type ModDraft={id:string;creatorId:string;category:ModCategory;title:string;description:string;license:'original'|'licensed';rightsConfirmed:boolean;assetPath:string;triangleCount:number;textureBytes:number;rewardCredits:number;priceCredits:number}
export type ReviewResult={approved:boolean;reasons:string[]}
export function reviewCreatorMod(mod:ModDraft):ReviewResult{
 const reasons:string[]=[]
 if(!/^[a-z0-9-]{3,64}$/.test(mod.id)||!mod.creatorId)reasons.push('Invalid mod or creator identifier')
 if(!mod.title.trim()||mod.title.length>80||mod.description.length>500)reasons.push('Invalid title or description')
 if(!mod.rightsConfirmed||!['original','licensed'].includes(mod.license))reasons.push('Creator rights not confirmed')
 if(!mod.assetPath.startsWith('/assets/mods/')||mod.assetPath.includes('..')||!/^\/assets\/mods\/[a-zA-Z0-9/_-]+\.(glb|json)$/.test(mod.assetPath))reasons.push('Only reviewed local GLB or JSON assets are permitted')
 if(!Number.isSafeInteger(mod.triangleCount)||mod.triangleCount<0||mod.triangleCount>30000)reasons.push('Geometry exceeds device budget')
 if(!Number.isSafeInteger(mod.textureBytes)||mod.textureBytes<0||mod.textureBytes>2_000_000)reasons.push('Textures exceed device budget')
 if(!Number.isSafeInteger(mod.rewardCredits)||mod.rewardCredits<0||mod.rewardCredits>250)reasons.push('Mission reward exceeds cap')
 if(!Number.isSafeInteger(mod.priceCredits)||mod.priceCredits<1||mod.priceCredits>10000)reasons.push('Price outside approved range')
 return {approved:reasons.length===0,reasons}
}
export type CreatorSubmission={draft:ModDraft;status:'pending'|'approved'|'rejected';reviewerId?:string;reviewNotes?:string}
export function submitCreatorMod(draft:ModDraft):CreatorSubmission{return {draft,status:'pending'}}
export function decideCreatorMod(submission:CreatorSubmission,reviewerId:string,approve:boolean,reviewNotes:string):CreatorSubmission{
 if(submission.status!=='pending'||!reviewerId.trim()||!reviewNotes.trim())throw new Error('Independent review required')
 if(reviewerId===submission.draft.creatorId)throw new Error('Creators cannot approve their own mods')
 const checks=reviewCreatorMod(submission.draft)
 if(approve&&!checks.approved)throw new Error('Mod failed automated safety review: '+checks.reasons.join('; '))
 return {...submission,status:approve?'approved':'rejected',reviewerId,reviewNotes}
}
export type PayoutReadiness={customerRevenueVerified:boolean;creatorContractSigned:boolean;paymentProcessorReady:boolean;taxAndIdentityChecksReady:boolean;fraudReviewPassed:boolean;legalApproval:boolean}
export const REAL_MONEY_PAYOUTS_ENABLED=false
export function canDistributeRealMoney(readiness:PayoutReadiness){return REAL_MONEY_PAYOUTS_ENABLED&&Object.values(readiness).every(Boolean)}
export type FundPolicy={percentageBasisPoints:number;approvedBy:string;effectiveDate:string}
export function proposeCommunityFundAllocation(eligibleNetRevenueCents:number,policy:FundPolicy){
 if(!Number.isSafeInteger(eligibleNetRevenueCents)||eligibleNetRevenueCents<0)throw new Error('Invalid eligible revenue')
 if(!Number.isSafeInteger(policy.percentageBasisPoints)||policy.percentageBasisPoints<0||policy.percentageBasisPoints>10000)throw new Error('Invalid fund allocation rate')
 if(!policy.approvedBy||!/^\d{4}-\d{2}-\d{2}$/.test(policy.effectiveDate))throw new Error('Fund policy needs approval and effective date')
 return {proposedCents:Math.floor(eligibleNetRevenueCents*policy.percentageBasisPoints/10000),disbursementAuthorized:false}
}
export type AccessibleModPreset={id:string;category:'clothing'|'hair'|'building'|'mission';label:string;palette:string[]}
export function createAccessibleModDraft(creatorId:string,preset:AccessibleModPreset,color:string):ModDraft{
 if(!preset.palette.includes(color)||!/^#[0-9a-fA-F]{6}$/.test(color))throw new Error('Select a permitted preset color')
 const id=(creatorId+'-'+preset.id).toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,64)
 return {id,creatorId,category:preset.category,title:preset.label+' '+color,description:'Accessible preset; color '+color,license:'original',rightsConfirmed:false,assetPath:'/assets/mods/'+preset.id+'.json',triangleCount:0,textureBytes:0,rewardCredits:0,priceCredits:25}
}
