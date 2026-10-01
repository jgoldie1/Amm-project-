export type OmniBoardPlatform='tryamm'|'youtube'|'twitch'|'custom-rtmp'|'tiktok'|'bigo'|'kick'|'facebook'|'instagram'
export type OmniBoardEventKind='comment'|'gift'|'tip'|'follow'|'share'|'like'|'pk'|'system'

export type OmniBoardEvent={
 id:string
 platform:OmniBoardPlatform
 kind:OmniBoardEventKind
 userId?:string
 userName:string
 userAvatarUrl?:string
 platformIconKey:string
 originalText?:string
 originalLanguage?:string
 translatedText?:string
 translatedLanguage?:string
 amount?:number
 currency?:string
 verified:boolean
 receivedAt:string
}

export function normalizeOmniBoardEvent(event:OmniBoardEvent){
 return{
  ...event,
  displayText:event.translatedText||event.originalText||'',
  showTranslation:Boolean(event.translatedText&&event.translatedText!==event.originalText),
  financialDisplayOnly:(event.kind==='gift'||event.kind==='tip')&&!event.verified,
  contributesToPk:event.kind!=='system'&&(event.kind!=='gift'&&event.kind!=='tip'||event.verified)
 }
}

export const OMNI_BOARD_FEATURES={
 unifiedAllFeed:true,
 platformFilter:true,
 avatar:true,
 platformIcon:true,
 username:true,
 originalMessage:true,
 translatedMessage:true,
 verifiedGiftTipBadge:true,
 pkContribution:true,
 timestamp:true,
 textToSpeechHook:true,
 moderationHook:true,
 creatorReplyHook:true
} as const
