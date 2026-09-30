export type StreetVerseLiveEvent='hype'|'supply-drop'|'vehicle-boost'|'mission-vote'|'pk-score'|'reel-moment'
export const STREETVERSE_LIVE_RP={
 worlds:['circle-park','streetverse-global'],
 modes:['solo-live','rp-party','pk-1v1','pk-team'],
 audienceActions:[
  {id:'hype',event:'hype',effect:'Crowd/lighting celebration only'},
  {id:'supply',event:'supply-drop',effect:'Spawn approved non-weapon mission supplies'},
  {id:'boost',event:'vehicle-boost',effect:'Temporary game vehicle boost'},
  {id:'vote',event:'mission-vote',effect:'Audience votes on next RP mission branch'},
  {id:'pk',event:'pk-score',effect:'Add server-validated PK team score'},
  {id:'reel',event:'reel-moment',effect:'Mark the previous gameplay window for Reel capture'},
 ] as const,
 platformSafety:{broadcastSafeDefault:true,disableWeaponInteraction:true,hitFx:'off',noGamblingLikeRewards:true,noGiftPressure:true},
 economy:'External-platform gifts/tips are never treated as game currency until a permitted server integration validates the event and applicable platform rules.'
} as const
export const requestLiveAudienceAction=(event:StreetVerseLiveEvent,payload:Record<string,unknown>={})=>window.dispatchEvent(new CustomEvent('tryamm:live-audience-action-request',{detail:{event,payload,source:'streetverse-live-rp'}}))
