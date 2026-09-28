export type LibraryAssetKind='motion'|'model'|'texture'|'audio'|'vfx'|'sfx'|'video'|'image'|'environment'
export type LibraryRights='owned'|'licensed'|'public-domain'|'permission-required'|'unknown'|'blocked'
export type LibraryAsset={
 id:string;kind:LibraryAssetKind;uri:string;bytes?:number;hash?:string;rights:LibraryRights
 licenseId?:string;creatorId?:string;source?:string;skeletonFamily?:string;species?:'humanoid'|'quadruped'|'bird'|'creature'
 cities?:string[];styles?:string[];mobileCost?:'low'|'medium'|'high';ageLane?:'all'|'teen'|'adult';containsBiometricData?:boolean
}
export type AssetAssessment={
 id:string;route:'production'|'optimize'|'reference'|'rights-review'|'quarantine'|'duplicate'
 reasons:string[];score:number;variants:Array<'full'|'mobile'|'crowd'|'thumbnail'|'stream'>
 retention:'catalog'|'short-lived-source'|'discard'
}
export function assessLibraryAsset(a:LibraryAsset,seenHashes=new Set<string>()):AssetAssessment{
 const reasons:string[]=[];let score=100
 if(a.hash&&seenHashes.has(a.hash))return {id:a.id,route:'duplicate',reasons:['duplicate-content-hash'],score:0,variants:[],retention:'discard'}
 if(a.rights==='blocked')return {id:a.id,route:'quarantine',reasons:['rights-blocked'],score:0,variants:[],retention:'discard'}
 if(a.rights==='unknown'||a.rights==='permission-required'){reasons.push('rights-not-production-cleared');score-=60}
 if(!a.source){reasons.push('missing-provenance');score-=25}
 if(a.kind==='motion'&&!a.skeletonFamily){reasons.push('missing-skeleton-profile');score-=20}
 if(a.species!=='humanoid'&&a.species&&String(a.skeletonFamily||'').includes('humanoid')){reasons.push('species-rig-mismatch');score-=50}
 if(a.mobileCost==='high'){reasons.push('needs-mobile-optimization');score-=15}
 if(a.containsBiometricData){reasons.push('minimize-biometric-source-retention');score-=10}
 let route:AssetAssessment['route']='production'
 if(a.rights==='unknown'||a.rights==='permission-required')route='rights-review'
 else if(score<50)route='quarantine'
 else if(a.mobileCost==='high')route='optimize'
 const variants:AssetAssessment['variants']=route==='production'||route==='optimize'
  ?(a.kind==='motion'||a.kind==='model'?['full','mobile','crowd','thumbnail']:a.kind==='video'?['stream','thumbnail']:['full','mobile']):[]
 return {id:a.id,route,reasons,score:Math.max(0,score),variants,retention:a.containsBiometricData?'short-lived-source':route==='production'||route==='optimize'?'catalog':'discard'}
}
export function assessLibrary(assets:LibraryAsset[]){
 const seen=new Set<string>(),results:AssetAssessment[]=[]
 for(const a of assets){const r=assessLibraryAsset(a,seen);results.push(r);if(a.hash&&!seen.has(a.hash))seen.add(a.hash)}
 return {results,summary:results.reduce((m,r)=>({...m,[r.route]:(m[r.route]||0)+1}),{} as Record<string,number>)}
}
