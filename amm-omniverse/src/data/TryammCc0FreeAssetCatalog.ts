export type TryammCc0AssetCategory='vehicle'|'building'|'road'|'prop'|'nature'|'interior'

export type TryammCc0Asset={
  id:string
  url:string
  category:TryammCc0AssetCategory
  sourcePack:string
  license:'CC0-1.0'
}

const base='/free-assets/kenney'

export const TRYAMM_CC0_FREE_ASSETS:Readonly<Record<string,TryammCc0Asset>>={
  police:{id:'police',url:`${base}/vehicles/police.glb`,category:'vehicle',sourcePack:'Kenney Car Kit',license:'CC0-1.0'},
  firetruck:{id:'firetruck',url:`${base}/vehicles/firetruck.glb`,category:'vehicle',sourcePack:'Kenney Car Kit',license:'CC0-1.0'},
  sedan:{id:'sedan',url:`${base}/vehicles/sedan.glb`,category:'vehicle',sourcePack:'Kenney Car Kit',license:'CC0-1.0'},
  suv:{id:'suv',url:`${base}/vehicles/suv.glb`,category:'vehicle',sourcePack:'Kenney Car Kit',license:'CC0-1.0'},
  taxi:{id:'taxi',url:`${base}/vehicles/taxi.glb`,category:'vehicle',sourcePack:'Kenney Car Kit',license:'CC0-1.0'},
  van:{id:'van',url:`${base}/vehicles/van.glb`,category:'vehicle',sourcePack:'Kenney Car Kit',license:'CC0-1.0'},
  truck:{id:'truck',url:`${base}/vehicles/truck.glb`,category:'vehicle',sourcePack:'Kenney Car Kit',license:'CC0-1.0'},
  commercialA:{id:'commercial-a',url:`${base}/buildings/commercial-a.glb`,category:'building',sourcePack:'Kenney City Kit Commercial',license:'CC0-1.0'},
  commercialB:{id:'commercial-b',url:`${base}/buildings/commercial-b.glb`,category:'building',sourcePack:'Kenney City Kit Commercial',license:'CC0-1.0'},
  commercialC:{id:'commercial-c',url:`${base}/buildings/commercial-c.glb`,category:'building',sourcePack:'Kenney City Kit Commercial',license:'CC0-1.0'},
  commercialH:{id:'commercial-h',url:`${base}/buildings/commercial-h.glb`,category:'building',sourcePack:'Kenney City Kit Commercial',license:'CC0-1.0'},
  suburbanA:{id:'suburban-a',url:`${base}/buildings/suburban-a.glb`,category:'building',sourcePack:'Kenney City Kit Suburban',license:'CC0-1.0'},
  suburbanB:{id:'suburban-b',url:`${base}/buildings/suburban-b.glb`,category:'building',sourcePack:'Kenney City Kit Suburban',license:'CC0-1.0'},
  roadStraight:{id:'road-straight',url:`${base}/roads/straight.glb`,category:'road',sourcePack:'Kenney City Kit Roads',license:'CC0-1.0'},
  roadCrossroad:{id:'road-crossroad',url:`${base}/roads/crossroad.glb`,category:'road',sourcePack:'Kenney City Kit Roads',license:'CC0-1.0'},
  roadIntersection:{id:'road-intersection',url:`${base}/roads/intersection.glb`,category:'road',sourcePack:'Kenney City Kit Roads',license:'CC0-1.0'},
  roadCrossing:{id:'road-crossing',url:`${base}/roads/crossing.glb`,category:'road',sourcePack:'Kenney City Kit Roads',license:'CC0-1.0'},
  trafficLight:{id:'traffic-light',url:`${base}/props/traffic-light.glb`,category:'prop',sourcePack:'Kenney City Kit Roads',license:'CC0-1.0'},
  streetLight:{id:'street-light',url:`${base}/props/street-light.glb`,category:'prop',sourcePack:'Kenney City Kit Roads',license:'CC0-1.0'},
  dumpster:{id:'dumpster',url:`${base}/props/dumpster.glb`,category:'prop',sourcePack:'Kenney City Kit Roads',license:'CC0-1.0'},
  constructionBarrier:{id:'construction-barrier',url:`${base}/props/construction-barrier.glb`,category:'prop',sourcePack:'Kenney City Kit Roads',license:'CC0-1.0'},
  stopSign:{id:'stop-sign',url:`${base}/props/stop-sign.glb`,category:'prop',sourcePack:'Kenney City Kit Roads',license:'CC0-1.0'},
  treeOak:{id:'tree-oak',url:`${base}/nature/tree-oak.glb`,category:'nature',sourcePack:'Kenney Nature Kit',license:'CC0-1.0'},
  treeDetailed:{id:'tree-detailed',url:`${base}/nature/tree-detailed.glb`,category:'nature',sourcePack:'Kenney Nature Kit',license:'CC0-1.0'},
  bush:{id:'bush',url:`${base}/nature/bush.glb`,category:'nature',sourcePack:'Kenney Nature Kit',license:'CC0-1.0'},
  bench:{id:'bench',url:`${base}/interiors/bench.glb`,category:'interior',sourcePack:'Kenney Furniture Kit',license:'CC0-1.0'},
  chair:{id:'chair',url:`${base}/interiors/chair.glb`,category:'interior',sourcePack:'Kenney Furniture Kit',license:'CC0-1.0'},
  table:{id:'table',url:`${base}/interiors/table.glb`,category:'interior',sourcePack:'Kenney Furniture Kit',license:'CC0-1.0'},
  trashcan:{id:'trashcan',url:`${base}/interiors/trashcan.glb`,category:'interior',sourcePack:'Kenney Furniture Kit',license:'CC0-1.0'},
} as const

export const TRYAMM_CC0_FREE_ASSET_LICENSE={
  upstream:'Kenney',
  sourceMirror:'Hidencod/tge-assets',
  sourceCommit:'1f7dee9076ee848773f08fd632ab4e4e73357777',
  license:'CC0-1.0',
  commercialUse:true,
  attributionRequired:false,
  meshyCreditsUsed:0,
} as const
