import type {NativePlacement} from '../data/TryammNativeRuntimeAssetCatalog'

export type BuildSite='student-union'|'laflin'
export type BuildAsset='bench'|'streetLamp'|'tree'|'holoWayfinder'
export type WorldRequest={site:BuildSite;assets:BuildAsset[]}
const slots:Record<BuildAsset,{side:number;forward:number;suffix:string}>={
 bench:{side:-4,forward:1,suffix:'entrance-bench'},
 streetLamp:{side:4,forward:1,suffix:'entrance-lamp'},
 tree:{side:-9,forward:-2,suffix:'approach-tree'},
 holoWayfinder:{side:3,forward:2,suffix:'lobby-wayfinder'},
}
export function validateRequest(value:unknown):WorldRequest{
 const v=value as Partial<WorldRequest>|null
 if(!v||!['student-union','laflin'].includes(String(v.site))||!Array.isArray(v.assets)||v.assets.length<1||v.assets.length>4||
  v.assets.some(a=>typeof a!=='string'||!Object.prototype.hasOwnProperty.call(slots,a))||new Set(v.assets).size!==v.assets.length)
  throw Error('Choose Student Union or Laflin and one to four distinct supported props.')
 return {site:v.site as BuildSite,assets:v.assets}
}
export function draftWorldRequest(text:string):WorldRequest|null{
 if(!/\b(put|place|add|build)\b/i.test(text))return null
 const site=/student union/i.test(text)?'student-union':/laflin/i.test(text)?'laflin':null
 const assets:BuildAsset[]=[]
 for(const [name,re] of [['bench',/\bbench\b/i],['streetLamp',/\blamp\b/i],['tree',/\btree\b/i],['holoWayfinder',/\bwayfinder\b/i]] as const)if(re.test(text))assets.push(name)
 return site&&assets.length?{site,assets}:null
}
export function applyWorldRequests(base:NativePlacement[],site:BuildSite,anchor:{x:number;z:number;front:number},requests:unknown[]){
 const result=new Map(base.map(p=>[p.label,p]))
 const prefix=site==='laflin'?'chicago':'greenville'
 for(const value of requests){
  const req=validateRequest(value)
  if(req.site!==site)continue
  for(const asset of req.assets){
   const slot=slots[asset],label=prefix+'-plaza-'+slot.suffix
   const previous=result.get(label)
   result.set(label,{...previous,asset,label,position:[anchor.x+slot.side*2,0,anchor.z+anchor.front*(slot.forward+5)],
    ...(asset==='bench'?{rotationY:anchor.front===1?Math.PI:0}:{})})
  }
 }
 return [...result.values()]
}
export function requestLink(request:WorldRequest){
 const name=request.site+'-'+[...request.assets].sort().join('-')+'-'+Date.now().toString(36)
 const params=new URLSearchParams({filename:'amm-omniverse/src/world-requests/'+name+'.json',value:JSON.stringify(request,null,2)+'\n',message:'Build '+request.site+' scenery'})
 return 'https://github.com/jgoldie1/Amm-project-/new/main?'+params
}
