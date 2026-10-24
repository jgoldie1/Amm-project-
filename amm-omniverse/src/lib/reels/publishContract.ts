export type ReelPublishState='DRAFT'|'UPLOADING'|'PROCESSING'|'PUBLISHED'|'FAILED'

export type StreetVerseReelDraft={
 id:string
 creatorId:string
 source:'streetverse-community-mobile'|'streetverse'
 communityAreaNumber?:number
 communityAreaName?:string
 missionId?:string
 missionProgress?:string
 vehicle?:boolean
 caption?:string
 visibility:'public'|'followers'|'private'
 media:{localUrl?:string;storageKey?:string;mimeType?:string;durationMs?:number}
 state:ReelPublishState
 createdAt:string
 updatedAt:string
 publishedAt?:string
 publicReelId?:string
 shareUrl?:string
 error?:string
}

export const reelPublishStates:ReelPublishState[]=['DRAFT','UPLOADING','PROCESSING','PUBLISHED','FAILED']

export function canPublishReel(draft:StreetVerseReelDraft){
 return Boolean(draft.creatorId&&draft.media&&(draft.media.localUrl||draft.media.storageKey))
}

// Draft/device capture means "eligible to upload", not publicly distributed.
// Only the server's approved+delivered publication response may supply these
// fields. Never dispatch a public broadcast from a local preview or blob URL.
export type VerifiedReelDelivery={
 reelId:string
 shareUrl:string
 publishedAt:string
 moderationStatus:'approved'|'restored'
 deliveryStatus:'delivered'
}
export function isVerifiedReelDelivery(value:VerifiedReelDelivery){
 if(!value||!value.reelId||!value.publishedAt)return false
 if(value.deliveryStatus!=='delivered'||!['approved','restored'].includes(value.moderationStatus))return false
 try{
  const url=new URL(value.shareUrl,typeof window==='undefined'?'https://tryamm.online':window.location.origin)
  if(!['https:'].includes(url.protocol)||!/^\/reels\/[a-z0-9_-]+\/?$/i.test(url.pathname))return false
  const allowed=typeof window==='undefined'?['tryamm.online','www.tryamm.online']:['tryamm.online','www.tryamm.online',window.location.hostname]
  return allowed.includes(url.hostname)
 }catch{return false}
}
export function reelPublishEvent(draft:StreetVerseReelDraft,delivery:VerifiedReelDelivery){
 if(draft.state!=='PUBLISHED'||!draft.publicReelId||draft.publicReelId!==delivery?.reelId||!isVerifiedReelDelivery(delivery))
   throw new Error('Reel is not verified as delivered and moderation-approved')
 return new CustomEvent('tryamm:reel-published',{detail:{
  reelId:delivery.reelId,shareUrl:delivery.shareUrl,source:draft.source,
  communityAreaNumber:draft.communityAreaNumber,missionId:draft.missionId,publishedAt:delivery.publishedAt
 }})
}
