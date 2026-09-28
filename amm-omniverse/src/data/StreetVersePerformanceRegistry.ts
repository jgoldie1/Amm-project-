export type PerformanceSpecies='humanoid'|'quadruped'|'bird'|'creature'
export type PerformanceCategory='dance'|'stunt'|'fighter'|'acting'|'pose'|'locomotion'|'animal'|'crowd'
export type RightsState='owned'|'licensed'|'public-domain'|'permission-required'|'blocked'

export type StreetVersePerformanceAsset={
 id:string;title:string;category:PerformanceCategory;species:PerformanceSpecies
 era?:'1990s'|'2000s'|'2010s'|'2020s'|'current'|'timeless'
 styles:string[];cities:string[];bpm?:[number,number];loop:boolean
 skeletonFamily:string;source:string;creatorId?:string;rights:RightsState
 commercialUse:boolean;streamable:boolean;reelSafe:boolean;ageLane:'all'|'teen'|'adult'
}

const assets=new Map<string,StreetVersePerformanceAsset>()

export function registerPerformanceAsset(asset:StreetVersePerformanceAsset){
 if(!asset.id||!asset.title||!asset.skeletonFamily)throw new Error('invalid-performance-asset')
 if(asset.rights==='blocked'||asset.rights==='permission-required')asset.commercialUse=false
 assets.set(asset.id,Object.freeze({...asset,styles:[...asset.styles],cities:[...asset.cities]}))
 return asset.id
}

export function findPerformanceAssets(query:{category?:PerformanceCategory;species?:PerformanceSpecies;city?:string;style?:string;commercial?:boolean}={}){
 return [...assets.values()].filter(a=>
  (!query.category||a.category===query.category)&&(!query.species||a.species===query.species)&&
  (!query.city||a.cities.includes('global')||a.cities.includes(query.city))&&
  (!query.style||a.styles.some(s=>s.toLowerCase()===query.style!.toLowerCase()))&&
  (!query.commercial||a.commercialUse&&a.rights!=='blocked'&&a.rights!=='permission-required'))
}

export function performanceCertification(asset:StreetVersePerformanceAsset){
 const failures:string[]=[]
 if(!asset.source)failures.push('source')
 if(asset.rights==='blocked'||asset.rights==='permission-required')failures.push('rights')
 if(!asset.skeletonFamily)failures.push('skeleton')
 if(asset.species!=='humanoid'&&asset.skeletonFamily.toLowerCase().includes('humanoid'))failures.push('species-rig-mismatch')
 return {certified:failures.length===0,failures}
}
