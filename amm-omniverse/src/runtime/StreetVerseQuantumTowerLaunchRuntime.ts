/**
 * Quantum Tower — shared StreetVerse launch control plane.
 * "Quantum" is the brand and world-building metaphor. No physical quantum
 * computing, real energy generation, AGI consciousness or external deployment
 * is implied.
 *
 * This module is intentionally importable without browser, payment or API access.
 */
export type TowerModuleId='streetverse-game'|'livekit-gamecast'|'tiktok-distribution'|'crossverse'|'ai-operations'|'mod-sandbox'|'creator-marketplace'|'reels-marketing'|'global-transit'
export type TowerModule={
 id:TowerModuleId;label:string;zone:string;
 state:'source-present'|'integration-pending'|'provider-gated'|'review-gated';
 proofRequired:readonly string[];
 dependencies:readonly TowerModuleId[];
 monetization:'none'|'website-service'|'approved-commerce'|'future';
}
export const QUANTUM_TOWER_LAUNCH_MODULES:readonly TowerModule[]=[
 {id:'streetverse-game',label:'StreetVerse Chicago',zone:'Ground Floor • Playable City',state:'integration-pending',dependencies:[],proofRequired:['BJ or fallback avatar can walk','six-seat vehicle enter/drive/exit','mission completes in playable build','one-hand controls pass'],monetization:'future'},
 {id:'livekit-gamecast',label:'TRYAMM LIVE Gamecast',zone:'Broadcast Studio',state:'provider-gated',dependencies:['streetverse-game'],proofRequired:['LiveKit provider credentials installed server-side','authorized host + separate viewer','game screen share and microphone verified on two devices','protected pause and disconnect work'],monetization:'none'},
 {id:'tiktok-distribution',label:'TikTok LIVE Distribution',zone:'Global Broadcast Deck',state:'provider-gated',dependencies:['livekit-gamecast'],proofRequired:['account LIVE eligibility verified','official encoder or producer permissions','actual TikTok preview and live audience delivery verified'],monetization:'future'},
 {id:'crossverse',label:'CrossVerse Identity and Consent',zone:'World Passport Atrium',state:'source-present',dependencies:[],proofRequired:['approved asset and likeness consent','cross-world identity handoff tested'],monetization:'none'},
 {id:'ai-operations',label:'Stubbs AI • MiddleVerse • Lyons Tech • JARVIS',zone:'AI Operations Floor',state:'integration-pending',dependencies:[],proofRequired:['scoped tasks reviewed','no autonomous publishing or payment privileges','operator approval tested'],monetization:'none'},
 {id:'mod-sandbox',label:'Developer Packs and Mod Pass',zone:'Creator Workshop',state:'review-gated',dependencies:['streetverse-game'],proofRequired:['manifest and asset license validated','security and content review passed','mobile performance and rollback tested'],monetization:'future'},
 {id:'creator-marketplace',label:'All American Creator Marketplace',zone:'Commercial Showroom',state:'integration-pending',dependencies:['mod-sandbox'],proofRequired:['server-side checkout confirmation','seller ownership and payout rules','refunds, tax and marketplace policies verified'],monetization:'approved-commerce'},
 {id:'reels-marketing',label:'TRYAMM Reels and Business Spotlights',zone:'Marketing Studio',state:'integration-pending',dependencies:['streetverse-game'],proofRequired:['real playable demo footage','rights-cleared music and imagery','reel publishing authorized'],monetization:'website-service'},
 {id:'global-transit',label:'CrossVerse Fly-in, Train and Ride-share',zone:'Transit Terminal',state:'integration-pending',dependencies:['streetverse-game'],proofRequired:['manifest capacity checks','destination world loading','server-authorized player transition'],monetization:'future'},
] as const
export type TowerGateState={passedProofs:readonly string[]}
export type TowerReadiness={id:TowerModuleId;ready:boolean;missing:string[];blockedBy:TowerModuleId[]}
export function evaluateQuantumTowerLaunch(proofs:Partial<Record<TowerModuleId,TowerGateState>>):TowerReadiness[]{
 const passed=new Set<TowerModuleId>()
 const result:TowerReadiness[]=[]
 for(const module of QUANTUM_TOWER_LAUNCH_MODULES){
  const delivered=new Set(proofs[module.id]?.passedProofs??[])
  const missing=module.proofRequired.filter(proof=>!delivered.has(proof))
  const blockedBy=module.dependencies.filter(dep=>!passed.has(dep))
  const ready=missing.length===0&&blockedBy.length===0
  if(ready)passed.add(module.id)
  result.push({id:module.id,ready,missing,blockedBy})
 }
 return result
}
export const QUANTUM_TOWER_RELEASE_ORDER=[
 'One paid TRYAMM website or commercial reel',
 'One Circle Park-to-Taylor Street playable mission',
 'One protected LiveKit host-to-viewer gamecast',
 'One authorized TikTok LIVE gamecast and moderated audience test',
 'Creator sandbox, mod review, and marketplace commerce'
] as const
