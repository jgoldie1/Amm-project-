import type {PerformanceCategory,PerformanceSpecies,RightsState} from '../data/StreetVersePerformanceRegistry'

export type DiscoveryCandidate={
 id:string;sourceUrl:string;sourceDomain:string;title:string;creator?:string
 category:PerformanceCategory;species:PerformanceSpecies;styles:string[];era?:string
 rights:RightsState;licenseUrl?:string;downloadAllowed:boolean;commercialUse:boolean
 discoveredAt:string;referenceOnly?:boolean
}

export type OracleDecision={candidateId:string;decision:'approve-processing'|'reference-only'|'manual-rights-review'|'reject';reasons:string[]}

export function oracleReview(candidate:DiscoveryCandidate):OracleDecision{
 const reasons:string[]=[]
 if(!/^https:\/\//.test(candidate.sourceUrl))reasons.push('invalid-source-url')
 if(candidate.rights==='blocked')reasons.push('rights-blocked')
 if(candidate.rights==='permission-required')reasons.push('permission-required')
 if(!candidate.downloadAllowed)reasons.push('download-not-authorized')
 if(!candidate.commercialUse)reasons.push('commercial-use-not-authorized')
 if(candidate.referenceOnly)reasons.push('reference-only')
 if(reasons.includes('rights-blocked'))return {candidateId:candidate.id,decision:'reject',reasons}
 if(reasons.length)return {candidateId:candidate.id,decision:candidate.rights==='permission-required'?'manual-rights-review':'reference-only',reasons}
 return {candidateId:candidate.id,decision:'approve-processing',reasons:['source-and-rights-metadata-present']}
}

export function buildQuantumDiscoveryPlan(input:{cities:string[];eras:string[];styles:string[];categories:PerformanceCategory[]}){
 const jobs=[] as Array<{key:string;city:string;era:string;style:string;category:PerformanceCategory;mode:'metadata-discovery'}>
 for(const city of input.cities)for(const era of input.eras)for(const style of input.styles)for(const category of input.categories)
  jobs.push({key:[city,era,style,category].join(':'),city,era,style,category,mode:'metadata-discovery'})
 return jobs
}

export type AssetReferenceCandidate={
 id:string
 sourceUrl:string
 sourceDomain:string
 title:string
 rights:RightsState
 licenseUrl?:string
 downloadAllowed:boolean
 commercialUse:boolean
 referenceOnly?:boolean
 discoveredBy:'quantum-crawler'|'manual'|'partner-api'
 metadataOnly:boolean
}

export type AssetReferenceOracleDecision={
 candidateId:string
 decision:'approve-processing'|'reference-only'|'manual-rights-review'|'reject'
 reasons:string[]
}

export function oracleAssetReferenceReview(candidate:AssetReferenceCandidate):AssetReferenceOracleDecision{
 const reasons:string[]=[]
 if(!/^https:\/\//.test(candidate.sourceUrl))reasons.push('invalid-source-url')
 if(candidate.discoveredBy==='quantum-crawler'&&!candidate.metadataOnly)reasons.push('crawler-must-remain-metadata-only')
 if(candidate.rights==='blocked')reasons.push('rights-blocked')
 if(candidate.rights==='permission-required')reasons.push('permission-required')
 if(!candidate.downloadAllowed)reasons.push('download-not-authorized')
 if(!candidate.commercialUse)reasons.push('commercial-use-not-authorized')
 if(candidate.referenceOnly)reasons.push('reference-only')
 if(reasons.includes('rights-blocked')||reasons.includes('crawler-must-remain-metadata-only'))
  return{candidateId:candidate.id,decision:'reject',reasons}
 if(candidate.rights==='permission-required')
  return{candidateId:candidate.id,decision:'manual-rights-review',reasons}
 if(reasons.length)
  return{candidateId:candidate.id,decision:'reference-only',reasons}
 return{candidateId:candidate.id,decision:'approve-processing',reasons:['asset-reference-source-and-rights-metadata-present']}
}
