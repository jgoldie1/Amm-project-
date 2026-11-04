export type StreamPlatform='tryamm'|'twitch'|'tiktok'|'kick'|'bigo'|'youtube'|'facebook'|'instagram'|'snapchat'|'steam'|'douyin'|'kuaishou'|'bilibili'|'line'|'wechat'|'niconico'|'custom-rtmp'

export type StreamDestination={
 id:string;platform:StreamPlatform;label:string;enabled:boolean;connected:boolean;
 ingestMode:'native'|'oauth-api'|'rtmp';
 monetization:'tryamm-gifts'|'platform-native'|'platform-native-plus-tryamm';
}

export type ExternalGiftEvent={
 platform:StreamPlatform;eventId:string;channelId:string;senderId?:string;senderName?:string;
 nativeGiftId?:string;nativeGiftName?:string;nativeAmount?:number;nativeCurrency?:string;
 receivedAt:string;verified:boolean;
}

export const UNIVERSAL_STREAM_POLICY={
 gameplayNeverDependsOnExternalPlatform:true,
 keepPlatformNativeMonetizationNative:true,
 neverConvertExternalGiftsToWithdrawableTryammBalanceWithoutVerifiedSettlement:true,
 deduplicateExternalEvents:true,
 serverVerifyWebhooks:true,
 creatorCanDisableAnyDestination:true,
 recordOnlyWithCreatorConsent:true,
} as const

export const DEFAULT_STREAM_DESTINATIONS:readonly StreamDestination[]=[
 {id:'tryamm',platform:'tryamm',label:'TRYAMM LIVE',enabled:true,connected:true,ingestMode:'native',monetization:'tryamm-gifts'},
 {id:'twitch',platform:'twitch',label:'Twitch',enabled:false,connected:false,ingestMode:'oauth-api',monetization:'platform-native-plus-tryamm'},
 {id:'tiktok',platform:'tiktok',label:'TikTok LIVE',enabled:false,connected:false,ingestMode:'oauth-api',monetization:'platform-native'},
 {id:'kick',platform:'kick',label:'Kick',enabled:false,connected:false,ingestMode:'oauth-api',monetization:'platform-native'},
 {id:'bigo',platform:'bigo',label:'BIGO LIVE',enabled:false,connected:false,ingestMode:'oauth-api',monetization:'platform-native'},
 {id:'youtube',platform:'youtube',label:'YouTube Live',enabled:false,connected:false,ingestMode:'oauth-api',monetization:'platform-native'},
 {id:'facebook',platform:'facebook',label:'Facebook Live',enabled:false,connected:false,ingestMode:'oauth-api',monetization:'platform-native'},
 {id:'instagram',platform:'instagram',label:'Instagram LIVE (eligibility required)',enabled:false,connected:false,ingestMode:'rtmp',monetization:'platform-native'},
 {id:'snapchat',platform:'snapchat',label:'Snapchat Stories / Spotlight (clips only)',enabled:false,connected:false,ingestMode:'oauth-api',monetization:'platform-native'},
 {id:'steam',platform:'steam',label:'Steam Broadcast (Steamworks access required)',enabled:false,connected:false,ingestMode:'rtmp',monetization:'platform-native'},
 {id:'douyin',platform:'douyin',label:'Douyin (regional approval required)',enabled:false,connected:false,ingestMode:'rtmp',monetization:'platform-native'},
 {id:'kuaishou',platform:'kuaishou',label:'Kuaishou (regional approval required)',enabled:false,connected:false,ingestMode:'rtmp',monetization:'platform-native'},
 {id:'bilibili',platform:'bilibili',label:'Bilibili (regional approval required)',enabled:false,connected:false,ingestMode:'rtmp',monetization:'platform-native'},
 {id:'line',platform:'line',label:'LINE (clips and notifications, not assumed LIVE)',enabled:false,connected:false,ingestMode:'oauth-api',monetization:'platform-native'},
 {id:'wechat',platform:'wechat',label:'WeChat / Channels (approval required)',enabled:false,connected:false,ingestMode:'oauth-api',monetization:'platform-native'},
 {id:'niconico',platform:'niconico',label:'Niconico (approval required)',enabled:false,connected:false,ingestMode:'rtmp',monetization:'platform-native'},
 {id:'custom-rtmp',platform:'custom-rtmp',label:'Other RTMP/SRT destination',enabled:false,connected:false,ingestMode:'rtmp',monetization:'platform-native'},
] as const

export function normalizeExternalGift(event:ExternalGiftEvent){
 return{
  schema:'tryamm.external-live-value.v1',
  ...event,
  displayOnly:!event.verified,
  moneyMoved:false,
  withdrawable:false,
  settlementAuthority:event.platform,
 }
}

export function streamSessionDestinations(destinations:readonly StreamDestination[]){
 return destinations.filter(d=>d.enabled&&d.connected)
}
