import type {AssetKind} from './TryammAssetForge'
import {createAssetFactoryJob} from './TryammAssetForge'
import {oracleAssetReferenceReview,type AssetReferenceCandidate} from '../runtime/StreetVersePerformanceOracle'

export type TransformationSampleId='sample-a-reality-restore'|'sample-b-chicago-documentary'|'sample-c-holo-reality-fusion'|'sample-d-cinematic-hero'
export type ProductionEvidenceState='recipe-only'|'artifact-generated'|'reviewed'|'certified'

export interface AssetTransformationRequest{
  id:string
  sourceAssetId:string
  kind:AssetKind
  cityId:'chicago'|string
  neighborhoodId?:string
  target:'mobile'|'web'|'cinematic'
  defects:string[]
  requestedLook:string
  holographicLevel:'subtle'|'integrated'|'hero'
  referenceIds:string[]
  oracleApprovedReferenceIds:string[]
  referenceCandidates?:AssetReferenceCandidate[]
}

export interface TransformationSample{
  id:TransformationSampleId
  label:string
  intent:string
  scores:{
    realism:number
    chicagoAuthenticity:number
    holographicDepth:number
    gameplayReadability:number
    mobilePerformance:number
    accessibility:number
    originality:number
  }
  weightedScore:number
  transformationSteps:string[]
  promptDirectives:string[]
  productionNotes:string[]
}

const WEIGHTS={
  realism:.26,
  chicagoAuthenticity:.18,
  holographicDepth:.18,
  gameplayReadability:.15,
  mobilePerformance:.11,
  accessibility:.07,
  originality:.05,
} as const

function score(sample:Omit<TransformationSample,'weightedScore'>){
  const s=sample.scores
  return Math.round((
    s.realism*WEIGHTS.realism+
    s.chicagoAuthenticity*WEIGHTS.chicagoAuthenticity+
    s.holographicDepth*WEIGHTS.holographicDepth+
    s.gameplayReadability*WEIGHTS.gameplayReadability+
    s.mobilePerformance*WEIGHTS.mobilePerformance+
    s.accessibility*WEIGHTS.accessibility+
    s.originality*WEIGHTS.originality
  )*100)/100
}

function sample(input:Omit<TransformationSample,'weightedScore'>):TransformationSample{
  return {...input,weightedScore:score(input)}
}

const COMMON_STEPS=[
  'inspect placeholder defects and intended gameplay role',
  'collect metadata-only reference candidates through approved Quantum Crawler sources',
  'Oracle rights/source review; reject or reference-only anything not authorized',
  'derive an original StreetVerse transformation brief instead of copying a commercial game asset',
  'generate candidate through a provider-neutral Asset Forge adapter',
  'mesh repair + topology cleanup + UV/PBR material pass',
  'run Mind Over Matter transformation/originality review for motion when animation is required',
  'rig/retarget/animation pass when the asset kind requires it',
  'collision + navigation + interaction anchors',
  'LOD + texture streaming + compression',
  'holographic material/lighting pass that preserves gameplay geometry',
  'mobile frame-budget + accessibility/readability validation',
  'Asset Passport provenance/rights/originality review',
  'human visual review and certification before World Compiler publish',
] as const

export function createFourTransformationSamples(request:AssetTransformationRequest):TransformationSample[]{
  const place=request.neighborhoodId?`${request.neighborhoodId}, ${request.cityId}`:request.cityId
  return [
    sample({
      id:'sample-a-reality-restore',
      label:'Reality Restore',
      intent:'Turn the placeholder into a believable production asset while keeping holographic effects restrained.',
      scores:{realism:88,chicagoAuthenticity:80,holographicDepth:58,gameplayReadability:95,mobilePerformance:92,accessibility:94,originality:92},
      transformationSteps:[...COMMON_STEPS],
      promptDirectives:[
        `Rebuild ${request.kind} for ${place} with correct physical scale and production PBR materials.`,
        'Prioritize clean silhouette, collision readability, grounded lighting and mobile-safe detail.',
        'Use only approved references as factual/style context; do not duplicate distinctive protected assets.',
      ],
      productionNotes:['best fallback for lower-end phones','holographic layer remains secondary'],
    }),
    sample({
      id:'sample-b-chicago-documentary',
      label:'Chicago Documentary',
      intent:'Maximize Chicago identity, believable wear, neighborhood detail and source-backed environmental authenticity.',
      scores:{realism:92,chicagoAuthenticity:98,holographicDepth:62,gameplayReadability:92,mobilePerformance:82,accessibility:90,originality:94},
      transformationSteps:[...COMMON_STEPS],
      promptDirectives:[
        `Rebuild ${request.kind} as a source-backed ${place} asset with authentic proportions, materials, wear and local context.`,
        'Layer decals, curb/street wear, utility detail and neighborhood-specific material variation without inventing exact private-property detail.',
        'Preserve a clean gameplay silhouette and interaction anchors.',
      ],
      productionNotes:['strongest authenticity sample','requires source-backed landmark/location evidence where exactness is claimed'],
    }),
    sample({
      id:'sample-c-holo-reality-fusion',
      label:'Holo Reality Fusion',
      intent:'Combine high physical realism with the signature StreetVerse holographic layer without sacrificing gameplay or mobile fallback.',
      scores:{realism:96,chicagoAuthenticity:95,holographicDepth:98,gameplayReadability:95,mobilePerformance:86,accessibility:94,originality:97},
      transformationSteps:[...COMMON_STEPS],
      promptDirectives:[
        `Create an original high-realism ${request.kind} for ${place}: physically grounded first, StreetVerse holographic enhancement second.`,
        'Use PBR surfaces, believable scale, contact grounding, reflection response, wear variation and cinematic lighting hooks.',
        'Add holographic edge-light, volumetric proxy, emissive interaction anchors and AR/WebXR-ready semantic points without replacing collision geometry.',
        'Produce mobile/web/cinematic quality variants from one certified master and preserve one-hand/control readability.',
      ],
      productionNotes:['balanced production target','highest StreetVerse identity','mobile must fall back to cheaper probes/emissive effects'],
    }),
    sample({
      id:'sample-d-cinematic-hero',
      label:'Cinematic Hero',
      intent:'Push maximum hero-shot fidelity for trailers, closeups and movie/reality-show transitions.',
      scores:{realism:99,chicagoAuthenticity:91,holographicDepth:96,gameplayReadability:84,mobilePerformance:54,accessibility:82,originality:95},
      transformationSteps:[...COMMON_STEPS],
      promptDirectives:[
        `Create a cinematic hero ${request.kind} for ${place} with maximum material, micro-surface, reflection and lighting detail.`,
        'Add high-detail holographic energy/reflection layers suitable for closeups and film transitions.',
        'Derive gameplay LODs from the master; never ship the hero mesh directly to low-end mobile.',
      ],
      productionNotes:['best for trailers and closeups','not the default mobile gameplay asset'],
    }),
  ]
}

export function selectProductionWinner(samples:TransformationSample[]){
  if(samples.length!==4)throw new Error('exactly-four-samples-required')
  const ranked=[...samples].sort((a,b)=>b.weightedScore-a.weightedScore||a.id.localeCompare(b.id))
  return {winner:ranked[0],ranked}
}

export const QUANTUM_ASSET_TOURNAMENT_BUFFER={
  meaning:'Software scheduling/caching buffer; no quantum-computer execution is claimed.',
  maxParallelSamples:4,
  maxAutomaticRetriesPerSample:1,
  contentAddressedCache:true,
  winnerFirstOptimization:true,
  discardUncertifiedHeavyIntermediatesAfterEvidenceRetention:true,
  neverBypass:['rights','security','accessibility','performance','human-likeness-consent','production-certification'],
} as const

export function createProductionTransformationManifest(request:AssetTransformationRequest){
  const job=createAssetFactoryJob(`${request.id}:production`,request.kind,request.target)
  const samples=createFourTransformationSamples(request)
  const {winner,ranked}=selectProductionWinner(samples)
  const oracleDecisions=(request.referenceCandidates??[]).map(oracleAssetReferenceReview)
  const approvedReferenceIds=oracleDecisions.filter(item=>item.decision==='approve-processing').map(item=>item.candidateId)
  const oracleReferenceBlockers=oracleDecisions.filter(item=>item.decision!=='approve-processing').length
  return {
    schema:'tryamm.streetverse.asset-transformation-tournament.v1',
    request,
    job,
    samples,
    rankedSampleIds:ranked.map(item=>item.id),
    recipeWinner:winner,
    oracleDecisions,
    approvedReferenceIds,
    oracleReferenceBlockers,
    promotion:{
      evidenceState:'recipe-only' as ProductionEvidenceState,
      artifactUrl:null as string|null,
      assetPassportCertified:false,
      humanVisualReview:false,
      productionPublishAllowed:false,
      reason:oracleReferenceBlockers>0
        ?'Reference review has blockers; provider generation/publish is fail-closed.'
        :'A recipe winner is not a generated/certified asset. Provider artifact + Asset Passport + human review are required.',
    },
  }
}

export function canPublishTournamentWinner(input:{
  artifactUrl?:string|null
  assetPassportCertified:boolean
  humanVisualReview:boolean
  oracleReferenceBlockers:number
}){
  return Boolean(input.artifactUrl)
    &&input.assetPassportCertified
    &&input.humanVisualReview
    &&input.oracleReferenceBlockers===0
}

export const STREETVERSE_GENIE_TRANSFORMATION_POLICY={
  nickname:'Genie in the Bottle',
  requestInspection:'Inspect what the request needs, what the current asset lacks, and what must change to satisfy the request.',
  tournament:'Always produce exactly four transformation candidates and rank them with the reviewed quality weights.',
  productionRule:'Use the recipe winner to request a real artifact, then fail closed until provenance, rights, quality, performance and human visual review certify it.',
  gtaLikeTruth:'Target modern open-world AAA visual principles without copying protected assets or claiming parity with a specific commercial game.',
  holographicTruth:'Holographic rendering enhances certified gameplay geometry; it never substitutes for collision, navigation, animation or physical-world fidelity.',
} as const