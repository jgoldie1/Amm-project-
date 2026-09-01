import { runHoloGen } from '../services/holoGen'
import { installStreetVerseHoloForgeOverlay } from './StreetVerseHoloForgeOverlay'
import { createStreetVerseAssetRequirements,STREETVERSE_PHOTOREAL_STAGES,type StreetVerseAssetClass,type StreetVerseAssetTier } from './StreetVersePhotorealPipeline'

export type HoloForgeAssetKind='character'|'vehicle'|'building'|'prop'|'animal'|'road'|'mission'|'fx'|'audio'|'ui'
export type HoloForgeAssetRequest={kind:HoloForgeAssetKind;prompt:string;worldSessionId?:string|null;missionId?:string|null;tags?:string[];priority?:'low'|'normal'|'high'|'critical';requirements?:Record<string,unknown>;qualityTier?:StreetVerseAssetTier}
export type HoloForgeAssetManifest={id:string;kind:HoloForgeAssetKind;prompt:string;worldSessionId:string|null;missionId:string|null;tags:string[];status:'queued'|'generated'|'degraded'|'failed';provider:string;generatedAt:number;requirements:Record<string,unknown>;integration:{collision:boolean;navigation:boolean;lod:boolean;animation:boolean;audio:boolean;spawnable:boolean};qualityTier:StreetVerseAssetTier;pipeline:string[];output?:unknown;message:string}

let installed=false
const queue:HoloForgeAssetManifest[]=[]
function makeId(){return typeof crypto!=='undefined'&&'randomUUID' in crypto?`hf-${crypto.randomUUID()}`:`hf-${Date.now()}-${Math.random().toString(36).slice(2,9)}`}
function dispatch(name:string,detail:unknown){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))}
function integrationFor(kind:HoloForgeAssetKind){return {collision:['character','vehicle','building','prop','animal','road'].includes(kind),navigation:['character','vehicle','animal','road','building'].includes(kind),lod:['character','vehicle','building','prop','animal','road'].includes(kind),animation:['character','vehicle','animal','fx'].includes(kind),audio:['character','vehicle','animal','fx','audio'].includes(kind),spawnable:kind!=='ui'&&kind!=='audio'}}
function assetClassFor(kind:HoloForgeAssetKind):StreetVerseAssetClass|null{return ['character','vehicle','building','prop','animal','road','fx'].includes(kind)?kind as StreetVerseAssetClass:null}

async function generate(request:HoloForgeAssetRequest){
 const qualityTier=request.qualityTier||((request.priority==='critical'||request.tags?.includes('hero'))?'hero':'premium')
 const assetClass=assetClassFor(request.kind)
 const photoreal=assetClass?createStreetVerseAssetRequirements(assetClass,qualityTier):null
 const requirements={...(photoreal||{}),...(request.requirements||{})}
 const pipeline=assetClass?[...STREETVERSE_PHOTOREAL_STAGES]:['concept','generate','optimize','validate','release-register']
 const manifest:HoloForgeAssetManifest={id:makeId(),kind:request.kind,prompt:request.prompt,worldSessionId:request.worldSessionId||null,missionId:request.missionId||null,tags:request.tags||[],status:'queued',provider:'pending',generatedAt:Date.now(),requirements,integration:integrationFor(request.kind),qualityTier,pipeline,message:`Queued in HoloForge ${qualityTier.toUpperCase()} quality lane.`}
 queue.push(manifest);dispatch('tryamm:holoforge-queued',manifest)
 const result=await runHoloGen({mode:request.kind==='audio'||request.kind==='mission'?'simulation':'world',prompt:request.prompt,sessionId:request.worldSessionId||undefined,context:{holoforge:true,assetId:manifest.id,assetKind:request.kind,missionId:request.missionId||null,tags:request.tags||[],priority:request.priority||'normal',qualityTier,requirements,pipeline}})
 manifest.provider=result.provider;manifest.output=result.output;manifest.status=result.ok?(result.degraded?'degraded':'generated'):'failed';manifest.generatedAt=Date.now();manifest.message=result.message
 dispatch('tryamm:holoforge-asset-ready',manifest);if(manifest.integration.spawnable)dispatch('tryamm:streetverse-asset-spawn-request',manifest);return manifest
}
export function requestHoloForgeAsset(request:HoloForgeAssetRequest){return generate(request)}
export function getHoloForgeQueue(){return [...queue]}
export function installHoloForgeRuntime(){if(installed||typeof window==='undefined')return;installed=true;installStreetVerseHoloForgeOverlay();window.addEventListener('tryamm:holoforge-request',(event:Event)=>{const detail=(event as CustomEvent<HoloForgeAssetRequest>).detail;if(detail?.kind&&detail?.prompt)void generate(detail)});window.addEventListener('tryamm:streetverse-gameplay-context',(event:Event)=>{const detail=(event as CustomEvent<{worldSessionId?:string;activeMission?:string}>).detail;dispatch('tryamm:holoforge-context',{worldSessionId:detail?.worldSessionId||null,missionId:detail?.activeMission||null,queueDepth:queue.length})});dispatch('tryamm:holoforge-ready',{installed:true,capabilities:['characters','vehicles','buildings','props','animals','roads','missions','fx','audio','ui','photoreal-quality-tiers','pbr-validation','rights-provenance','retopology','texture-bake','rigging','facial-blendshapes','collision','navigation','lod','hlod','texture-compression','device-budget','visual-qa','spawn','mission-binding','live-streetverse-materialization']})}
