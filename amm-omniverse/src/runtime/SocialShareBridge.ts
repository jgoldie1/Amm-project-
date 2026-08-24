export type SharePlatform='native'|'tiktok'|'instagram'|'youtube'|'facebook'|'x'|'threads'|'snapchat'|'linkedin'|'whatsapp'|'telegram'

export type ShareAsset={
  title:string
  text:string
  url?:string
  mediaUrl?:string
  thumbnailUrl?:string
  sourceWorld?:string
  language?:string
  translatedText?:string
  captionsUrl?:string
  transcriptUrl?:string
  altText?:string
  audioDescription?:string
  platforms?:SharePlatform[]
}

const PLATFORM_PRESETS:Record<SharePlatform,{label:string;aspect:'9:16'|'1:1'|'16:9'|'any';maxSeconds?:number}>={
  native:{label:'Device Share',aspect:'any'},
  tiktok:{label:'TikTok',aspect:'9:16'},instagram:{label:'Instagram',aspect:'9:16'},youtube:{label:'YouTube',aspect:'9:16'},
  facebook:{label:'Facebook',aspect:'9:16'},x:{label:'X',aspect:'any'},threads:{label:'Threads',aspect:'any'},snapchat:{label:'Snapchat',aspect:'9:16'},
  linkedin:{label:'LinkedIn',aspect:'any'},whatsapp:{label:'WhatsApp',aspect:'any'},telegram:{label:'Telegram',aspect:'any'}
}

const DEFAULT_SHARE_PLATFORMS:SharePlatform[]=['native','tiktok','instagram','youtube','facebook','x','threads','snapchat','whatsapp','telegram']

export function buildSharePackage(asset:ShareAsset){
  const language=asset.language||document.documentElement.dataset.tryammLanguage||document.documentElement.lang||'en'
  const accessibility={
    captions:Boolean(asset.captionsUrl)||document.documentElement.dataset.tryammCaptions==='true',
    transcript:Boolean(asset.transcriptUrl),
    altText:asset.altText||asset.title,
    audioDescription:asset.audioDescription||'',
    language,
  }
  const platforms:SharePlatform[]=asset.platforms?.length?asset.platforms:DEFAULT_SHARE_PLATFORMS
  return {schema:'tryamm.social-share.v1',...asset,language,accessibility,platforms,presets:platforms.map(id=>({id,...PLATFORM_PRESETS[id]}))}
}

export async function shareNative(asset:ShareAsset){
  const pkg=buildSharePackage(asset)
  const text=[asset.translatedText||asset.text,asset.sourceWorld?`Enter world: ${asset.sourceWorld}`:''].filter(Boolean).join('\n')
  if(navigator.share){
    await navigator.share({title:asset.title,text,url:asset.url||asset.mediaUrl})
    window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'Share sheet opened'}}))
    return {ok:true,method:'native',package:pkg}
  }
  await navigator.clipboard?.writeText([text,asset.url||asset.mediaUrl||''].filter(Boolean).join('\n'))
  window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'Share text copied to clipboard'}}))
  return {ok:true,method:'clipboard',package:pkg}
}

export function requestPlatformPublish(platform:SharePlatform,asset:ShareAsset){
  const pkg=buildSharePackage({...asset,platforms:[platform]})
  window.dispatchEvent(new CustomEvent('tryamm:social-publish-request',{detail:{platform,package:pkg,requiresAuthorizedPlatformConnection:platform!=='native'}}))
  return pkg
}

export function installSocialShareBridge(){
  ;(window as any).__tryammShare={build:buildSharePackage,native:shareNative,publish:requestPlatformPublish,presets:PLATFORM_PRESETS}
}
