/**
 * Stubbs Motion Fusion — standalone, provider-neutral input decision core.
 * No camera permission, external SDK, raw-video capture, networking or game-state writes.
 * A renderer/game adapter may consume these commands after explicit owner integration.
 */
export type MotionAction='move'|'look'|'interact'|'emote'|'pause'
export type MotionSource='touch'|'keyboard'|'gamepad'|'switch'|'voice'|'camera'
export type MotionCommand={playerId:string;action:MotionAction;value:number;source:MotionSource;atMs:number;confidence?:number}
export type MotionConfiguration={
 enabled:boolean;cameraOptIn:boolean;cameraConfidenceMin:number;cameraStaleMs:number;
 maxAxis:number;allowCameraMove:boolean;allowCameraInteract:boolean
}
export const DEFAULT_MOTION_CONFIGURATION:Readonly<MotionConfiguration>=Object.freeze({
 enabled:false,cameraOptIn:false,cameraConfidenceMin:.8,cameraStaleMs:300,
 maxAxis:1,allowCameraMove:false,allowCameraInteract:false,
})
export type MotionDecision={accepted:boolean;reason:string;command?:MotionCommand}
const clamp=(x:number,m:number)=>Math.max(-m,Math.min(m,x))
/** Normalize untrusted plugin/camera output before any gameplay component sees it. */
export function normalizeMotionCommand(
 value:unknown,config:MotionConfiguration=DEFAULT_MOTION_CONFIGURATION,nowMs=Date.now(),
):MotionDecision{
 if(!config.enabled)return{accepted:false,reason:'feature_disabled'}
 if(!value||typeof value!=='object')return{accepted:false,reason:'invalid_command'}
 const c=value as Partial<MotionCommand>
 if(typeof c.playerId!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(c.playerId))return{accepted:false,reason:'invalid_player'}
 if(!(['move','look','interact','emote','pause'] as unknown[]).includes(c.action))return{accepted:false,reason:'invalid_action'}
 if(!(['touch','keyboard','gamepad','switch','voice','camera'] as unknown[]).includes(c.source))return{accepted:false,reason:'invalid_source'}
 if(typeof c.value!=='number'||!Number.isFinite(c.value)||typeof c.atMs!=='number'||!Number.isFinite(c.atMs))return{accepted:false,reason:'invalid_sample'}
 if(c.atMs>nowMs+50||nowMs-c.atMs>1000)return{accepted:false,reason:'stale_sample'}
 if(c.source==='camera'){
  if(!config.cameraOptIn)return{accepted:false,reason:'camera_not_authorized'}
  if(!Number.isFinite(c.confidence)||c.confidence!<config.cameraConfidenceMin)return{accepted:false,reason:'low_confidence'}
  if(nowMs-c.atMs>config.cameraStaleMs)return{accepted:false,reason:'tracking_lost'}
  if(c.action==='interact'&&!config.allowCameraInteract)return{accepted:false,reason:'camera_confirmation_required'}
  if(c.action==='move'&&!config.allowCameraMove)return{accepted:false,reason:'camera_movement_disabled'}
 }
 return{accepted:true,reason:'ok',command:{
  playerId:c.playerId,action:c.action!,source:c.source!,atMs:c.atMs,
  value:clamp(c.value,Math.max(0,Math.min(1,Number.isFinite(config.maxAxis)?config.maxAxis:1))),
  ...(c.confidence===undefined?{}:{confidence:c.confidence}),
 }}
}
/** Server-authoritative actions are deliberately excluded. No rewards/payouts/PvP here. */
export function releasePlayerControls(playerId:string,nowMs=Date.now()):MotionCommand{
 return{playerId,action:'move',value:0,source:'switch',atMs:nowMs}
}
