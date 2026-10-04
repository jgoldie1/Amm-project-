export type ProductionAssetKind='character'|'vehicle'|'building'|'interior'|'street'|'prop'|'audio'
export type ProductionAssetState='required'|'generated'|'validated'|'published'|'device-verified'

export interface StreetVerseProductionAsset{
 id:string;kind:ProductionAssetKind;label:string;district:string;priority:'P0'|'P1'|'P2';state:ProductionAssetState;
 requiredCapabilities:string[];publishPath?:string
}

export const STREETVERSE_PRODUCTION_ASSETS:StreetVerseProductionAsset[]=[
 {id:'sv-bj-stubbs-v6',kind:'character',label:'BJ Stubbs V6',district:'Circle Park',priority:'P0',state:'required',publishPath:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb',requiredCapabilities:['rigged-humanoid','idle','walk','run','talk-lipsync','blink-look','sit-drive','enter-exit','mobile-lod']},
 {id:'sv-resident-female-a',kind:'character',label:'Circle Park Woman A',district:'Circle Park',priority:'P0',state:'required',requiredCapabilities:['rigged-humanoid','idle','walk','talk-lipsync','sit-passenger','mobile-lod']},
 {id:'sv-resident-male-a',kind:'character',label:'Circle Park Man A',district:'Circle Park',priority:'P0',state:'required',requiredCapabilities:['rigged-humanoid','idle','walk','talk-lipsync','sit-passenger','mobile-lod']},
 {id:'sv-starter-sedan-v2',kind:'vehicle',label:'First Ride Sedan',district:'Circle Park',priority:'P0',state:'required',requiredCapabilities:['five-seats','doors','steering','wheels','lights','collision','mobile-lod']},
 {id:'sv-circle-park-homes',kind:'building',label:'Circle Park Homes',district:'Circle Park',priority:'P0',state:'required',requiredCapabilities:['pbr-exterior','entrance','collision','nav','mobile-lod']},
 {id:'sv-circle-park-interior',kind:'interior',label:'Circle Park Apartment Interior',district:'Circle Park',priority:'P1',state:'required',requiredCapabilities:['rooms','doors','stairs','lighting','collision','nav']},
 {id:'sv-roosevelt-street',kind:'street',label:'Roosevelt Road',district:'Near West Side',priority:'P0',state:'required',requiredCapabilities:['two-way-lanes','sidewalks','curbs','crosswalks','traffic-routes','collision']},
 {id:'sv-taylor-street',kind:'street',label:'Taylor Street',district:'Near West Side',priority:'P0',state:'required',requiredCapabilities:['two-way-lanes','sidewalks','curbs','crosswalks','traffic-routes','collision']},
 {id:'sv-pilsen-core',kind:'street',label:'Pilsen Core',district:'Pilsen',priority:'P1',state:'required',requiredCapabilities:['street-grid','sidewalks','business-fronts','traffic-routes','mobile-lod']},
 {id:'sv-city-audio',kind:'audio',label:'Chicago Living Soundscape',district:'West Side',priority:'P1',state:'required',requiredCapabilities:['traffic','crowd','weather','vehicle','mission','captions','ios-unlock']}
]

export const productionAssetReady=(asset:StreetVerseProductionAsset)=>asset.state==='published'||asset.state==='device-verified'
export const p0ProductionAssets=()=>STREETVERSE_PRODUCTION_ASSETS.filter(asset=>asset.priority==='P0')
export const productionReadiness=()=>{
 const p0=p0ProductionAssets(),ready=p0.filter(productionAssetReady)
 return {required:p0.length,ready:ready.length,blocked:p0.filter(asset=>!productionAssetReady).map(asset=>asset.id)}
}
