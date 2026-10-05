import type {TryammModManifest} from '../runtime/TryammModPassRuntime'

export const TRYAMM_WEST_SIDE_CC0_STARTER_MOD:TryammModManifest={
  schema:'tryamm.modpass.v1',
  id:'tryamm.west-side-cc0-starter',
  name:'TRYAMM West Side CC0 Starter Mod',
  version:'1.0.0',
  author:'TRYAMM',
  license:'CC0-1.0',
  ownership:'cc0',
  description:'Portable CC0 West Side starter assets for StreetVerse, CrossVerse and WebXR AR overlays.',
  scopes:['asset','world-overlay','ar-overlay'],
  targets:['tryamm','streetverse','crossverse','webxr-ar'],
  assets:[
    {id:'police-car',kind:'model',url:'/free-assets/kenney/vehicles/police.glb',license:'CC0-1.0'},
    {id:'firetruck',kind:'model',url:'/free-assets/kenney/vehicles/firetruck.glb',license:'CC0-1.0'},
    {id:'traffic-light',kind:'model',url:'/free-assets/kenney/props/traffic-light.glb',license:'CC0-1.0'},
    {id:'oak-tree',kind:'model',url:'/free-assets/kenney/nature/tree-oak.glb',license:'CC0-1.0'},
    {id:'bench',kind:'model',url:'/free-assets/kenney/interiors/bench.glb',license:'CC0-1.0'},
  ],
  arPlacements:[
    {id:'place-police-car',assetId:'police-car',label:'Police Car',anchor:'floor',scale:1},
    {id:'place-firetruck',assetId:'firetruck',label:'Firetruck',anchor:'floor',scale:1},
    {id:'place-traffic-light',assetId:'traffic-light',label:'Traffic Light',anchor:'floor',scale:1},
    {id:'place-tree',assetId:'oak-tree',label:'Oak Tree',anchor:'floor',scale:1},
    {id:'place-bench',assetId:'bench',label:'Bench',anchor:'floor',scale:1},
  ],
  compatibility:{
    minTryammVersion:'1.1.0',
    adapters:['tryamm-native','webxr-ar'],
  },
}
