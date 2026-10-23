// TRYAMM LIVE early revenue pilot: deliberately conservative defaults.
// App-level limits are admission controls, NOT provider billing hard stops.
const clamp=(value,fallback,min,max)=>{
 const n=Number(value)
 return Number.isFinite(n)&&Number.isInteger(n)?Math.max(min,Math.min(max,n)):fallback
}
export function liveBudgetPolicy(){
 const quality=['economy','balanced','hd'].includes(process.env.LIVE_VIDEO_QUALITY)
  ?process.env.LIVE_VIDEO_QUALITY:'economy'
 const presets={
  economy:{label:'Data saver',width:640,height:360,frameRate:15,maxBitrate:300000},
  balanced:{label:'Balanced',width:960,height:540,frameRate:20,maxBitrate:650000},
  hd:{label:'HD',width:1280,height:720,frameRate:24,maxBitrate:1200000},
 }
 return {
  allowNewRooms:process.env.LIVE_NEW_ROOMS_ENABLED!=='false',
  allowNewViewers:process.env.LIVE_NEW_VIEWERS_ENABLED!=='false',
  maxParticipants:clamp(process.env.LIVE_MAX_PARTICIPANTS_PER_ROOM,12,2,100),
  maxActiveRooms:clamp(process.env.LIVE_MAX_ACTIVE_ROOMS,1,1,100),
  quality,
  videoProfile:presets[quality],
  enforcement:'best-effort token-admission; rely on LiveKit provider quota for hard connection limit',
 }
}
