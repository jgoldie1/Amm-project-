// StreetVerse quality gates for desktop, mobile, AR, VR and business simulations.
// Registry only; evidence must be supplied by real device/build testing.
export type QualityTarget='desktop3d'|'mobile3d'|'immersive-ar'|'immersive-vr'
export type GateStatus='not-tested'|'pass'|'fail'|'blocked'
export const QUALITY_GATES=[
 'authentic-bj-rig','character-fidelity','enterable-interiors','walking-driving-reentry',
 'cooking-baking-crafting','persistent-jobs-wallet','verified-real-checkout',
 'npc-dialogue','business-mission-loop','audio-lighting','multiplayer-moderation',
 'vr-comfort-controls','ar-placement','one-hand-accessibility','automated-release-recovery'
] as const
export type QualityGate=typeof QUALITY_GATES[number]
export type GateEvidence={gate:QualityGate;target:QualityTarget;status:GateStatus;testId:string;testedAt:string;notes?:string}
export function assessQuality(evidence:GateEvidence[],target:QualityTarget){
 const matching=evidence.filter(e=>e.target===target && QUALITY_GATES.includes(e.gate) && e.testId.trim() && !Number.isNaN(Date.parse(e.testedAt)))
 const latest=new Map<QualityGate,GateEvidence>()
 for(const e of matching){const prev=latest.get(e.gate);if(!prev||Date.parse(e.testedAt)>Date.parse(prev.testedAt))latest.set(e.gate,e)}
 const passed=QUALITY_GATES.filter(g=>latest.get(g)?.status==='pass')
 return {target,passed:passed.length,total:QUALITY_GATES.length,ready:passed.length===QUALITY_GATES.length,missing:QUALITY_GATES.filter(g=>latest.get(g)?.status!=='pass'),evidenceCount:latest.size}
}
export const XR_REQUIREMENTS={
 'immersive-ar':['secure-context','immersive-ar-session','hit-test','tracking-permission','placement-feedback','fallback-3d'],
 'immersive-vr':['secure-context','immersive-vr-session','comfort-turn','recenter','controller-remapping','fallback-3d']
} as const
export const PERFORMANCE_BUDGETS={mobile3d:{targetFps:30},desktop3d:{targetFps:60},'immersive-ar':{targetFps:60},'immersive-vr':{targetFps:72}} as const
// Budgets are aspirations, not measured performance. Device capabilities take precedence.
