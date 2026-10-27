import {QUANTUM_LAG_BUSTER} from './HoloGPTQuantumSpeedEngine'
export type LagAdvice={grade:'unknown'|'good'|'watch'|'slow';recommendedMode:'BALANCED'|'LOW_EFFECTS'|'SAFE_FALLBACK';reason:string;automaticChanges:false;preserveMissions:true}
export function adviseQuantumLagBuster(fps:number|null):LagAdvice{
 if(fps===null||!Number.isFinite(fps)||fps<=0)return{grade:'unknown',recommendedMode:'BALANCED',reason:'No reliable foreground FPS sample',automaticChanges:false,preserveMissions:true}
 if(fps<20)return{grade:'slow',recommendedMode:'SAFE_FALLBACK',reason:'Low sampled FPS: recommend manual fallback; never interrupt mission or save state',automaticChanges:false,preserveMissions:true}
 if(fps<40)return{grade:'watch',recommendedMode:'LOW_EFFECTS',reason:'Recommend lowering optional visual effects after player approval',automaticChanges:false,preserveMissions:true}
 return{grade:'good',recommendedMode:'BALANCED',reason:'Sampled performance acceptable; no change suggested',automaticChanges:false,preserveMissions:true}
}
export const STREETVERSE_LAG_BUSTER={source:QUANTUM_LAG_BUSTER.name,localDiagnosticsOnly:true,permissionRequiredForGraphicsChange:true,doNotChangeControls:true,doNotEraseSaves:true}
