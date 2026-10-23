/** StreetVerse original screen-to-world XR handoff.
 * Game objects are never physically projected. Preview mode works without an XR headset.
 */
export type MaterializationSource='streetverse'|'reel'|'holo-arena'|'omni-card'
export type MaterializationStage='on-screen'|'extracting'|'in-space'|'returning'
export type MaterializationRequest={entityId:string;source:MaterializationSource;assetId:string;ownerApproved:boolean;rightsCleared:boolean;isMinorSensitive?:boolean}
export type MaterializationSession={request:MaterializationRequest;stage:MaterializationStage;anchor:{x:number;y:number;z:number};renderMode:'screen-preview'|'webxr-ar';savedAt:number}
const ID=/^[a-z0-9][a-z0-9-]{2,79}$/
export function startScreenToWorld(request:MaterializationRequest):MaterializationSession{
 if(!ID.test(request?.entityId||'')||!ID.test(request?.assetId||'')||!request.ownerApproved||!request.rightsCleared||request.isMinorSensitive)throw Error('materialization_not_cleared')
 return {request:{...request},stage:'on-screen',anchor:{x:0,y:0,z:-1.5},renderMode:'screen-preview',savedAt:Date.now()}
}
export function extractIntoWorld(session:MaterializationSession,anchor:{x:number;y:number;z:number},xrVerified=false){
 if(session.stage!=='on-screen'||Object.values(anchor||{}).some(v=>!Number.isFinite(v)||Math.abs(v)>100))throw Error('invalid_xr_handoff')
 return {...session,stage:'in-space' as const,anchor:{...anchor},renderMode:xrVerified?'webxr-ar' as const:'screen-preview' as const,savedAt:Date.now()}
}
export function returnToScreen(session:MaterializationSession){
 if(session.stage!=='in-space')throw Error('entity_not_in_space')
 return {...session,stage:'on-screen' as const,renderMode:'screen-preview' as const,savedAt:Date.now()}
}
export function requestConstructMaterialization(session:MaterializationSession){
 if(typeof window==='undefined')return false
 window.dispatchEvent(new CustomEvent('tryamm:construct:materialize',{detail:{...session,hardwareProjection:false,requiresXRTracking:session.renderMode==='webxr-ar',preserveGameCheckpoint:true}}))
 return true
}
