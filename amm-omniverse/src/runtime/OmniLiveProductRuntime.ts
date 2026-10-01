export const OMNI_LIVE_PRODUCT={
  names:{suite:'TRYAMM Omni LIVE',board:'Omni Board',pk:'Omni PK',cast:'OmniCast',translate:'Omni Translate'},
  tosVersion:'0.1',
  launchPlatforms:['tryamm','youtube','twitch','custom-rtmp'] as const,
  adapterRoadmap:['tiktok','bigo','kick','facebook','instagram'] as const,
  qaLanguages:['en','es','fr','pt','ar','ha','yo','ig'] as const,
  creatorAlphaSize:10,
  hardwarePriority:['iphone','android','desktop','tv-cast','holo-cube','xr'] as const,
  invariants:{
    externalMoneyStaysExternalUntilSettled:true,
    pkPointsAreNotCash:true,
    noFakeViewers:true,
    noFakeGifts:true,
    noAutoSpend:true,
    gameplayMustContinueIfStreamFails:true,
    youthAndAdultLanesSeparated:true,
    recordingRequiresConsent:true
  }
} as const

export type OmniPkSignal='verified-gift'|'follow'|'share'|'like'|'mission-complete'|'viewer-poll'|'pk-score'
export const OMNI_PK_POINTS:Record<OmniPkSignal,number>={
  'verified-gift':20,
  follow:5,
  share:8,
  like:1,
  'mission-complete':15,
  'viewer-poll':4,
  'pk-score':12
}

export function scoreOmniPk(signal:OmniPkSignal,verified:boolean){
  if(signal==='verified-gift'&&!verified)return 0
  return OMNI_PK_POINTS[signal]
}
