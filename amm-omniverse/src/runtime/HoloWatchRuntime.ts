export type HoloWatchMode='game'|'live'|'calls'|'missions'|'social'|'map'|'health-accessibility'
export const HOLO_WATCH={raiseToWake:true,tapToAnswer:true,voiceReply:true,quickLike:true,quickFollow:true,missionPing:true,partyPing:true,liveControls:true,oneHand:true,largeTargets:true,haptics:true,captions:true,controllerIsolation:true,micRequiresConsent:true,locationRequiresPermission:true} as const
export function openWatch(mode:HoloWatchMode='game'){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:holo-watch-open',{detail:{mode}}));return mode}
