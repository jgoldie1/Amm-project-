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

export function reelPublishEvent(draft:StreetVerseReelDraft){
 if(draft.state!=='PUBLISHED'||!draft.publicReelId)throw new Error('Reel is not published')
 return new CustomEvent('tryamm:reel-published',{detail:{reelId:draft.publicReelId,shareUrl:draft.shareUrl,source:draft.source,communityAreaNumber:draft.communityAreaNumber,missionId:draft.missionId,publishedAt:draft.publishedAt}})
}
