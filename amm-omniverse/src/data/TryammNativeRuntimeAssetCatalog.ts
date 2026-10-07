export type NativeRuntimeAssetState='PREVIEW'|'CERTIFIED'

export interface NativeRuntimeAsset{
  id:string
  url:string
  state:NativeRuntimeAssetState
  semantic:string
  collisionAuthority:'visual-only'|'runtime'
}

export const TRYAMM_NATIVE_RUNTIME_ASSETS={
  building:{id:'brick-building-module',url:'/generated-assets/native/kit/brick-building-module.glb',state:'PREVIEW',semantic:'background-building-module',collisionAuthority:'visual-only'},
  streetLamp:{id:'street-lamp',url:'/generated-assets/native/kit/street-lamp.glb',state:'PREVIEW',semantic:'street-light',collisionAuthority:'visual-only'},
  tree:{id:'tree',url:'/generated-assets/native/kit/tree.glb',state:'PREVIEW',semantic:'vegetation',collisionAuthority:'visual-only'},
  bench:{id:'bench',url:'/generated-assets/native/kit/bench.glb',state:'PREVIEW',semantic:'street-furniture',collisionAuthority:'visual-only'},
  hydrant:{id:'hydrant',url:'/generated-assets/native/kit/hydrant.glb',state:'PREVIEW',semantic:'street-prop',collisionAuthority:'visual-only'},
  holoWayfinder:{id:'holo-wayfinder',url:'/generated-assets/native/kit/holo-wayfinder.glb',state:'PREVIEW',semantic:'holographic-wayfinder',collisionAuthority:'visual-only'},
  vehicleBlockout:{id:'vehicle-blockout',url:'/generated-assets/native/kit/vehicle-blockout.glb',state:'PREVIEW',semantic:'vehicle-visual',collisionAuthority:'visual-only'},
  sportSedan2027:{id:'tryamm-2027-sport-sedan',url:'/generated-assets/native/kit/tryamm-2027-sport-sedan.glb',state:'PREVIEW',semantic:'drivable-vehicle-visual',collisionAuthority:'visual-only'},
  boxTruckCustom2027:{id:'tryamm-2027-custom-box-truck',url:'/generated-assets/native/kit/tryamm-2027-custom-box-truck.glb',state:'PREVIEW',semantic:'commercial-custom-vehicle-visual',collisionAuthority:'visual-only'},
  heroPlayer:{id:'streetverse-hero-player',url:'/generated-assets/native/kit/streetverse-hero-player.glb',state:'PREVIEW',semantic:'hero-player-visual',collisionAuthority:'visual-only'},
  residentA:{id:'resident-archetype-a',url:'/generated-assets/native/kit/resident-archetype-a.glb',state:'PREVIEW',semantic:'crowd-resident-visual',collisionAuthority:'visual-only'},
  residentB:{id:'resident-archetype-b',url:'/generated-assets/native/kit/resident-archetype-b.glb',state:'PREVIEW',semantic:'crowd-resident-visual',collisionAuthority:'visual-only'},
  residentC:{id:'resident-archetype-c',url:'/generated-assets/native/kit/resident-archetype-c.glb',state:'PREVIEW',semantic:'crowd-resident-visual',collisionAuthority:'visual-only'},
  residentD:{id:'resident-archetype-d',url:'/generated-assets/native/kit/resident-archetype-d.glb',state:'PREVIEW',semantic:'crowd-resident-visual',collisionAuthority:'visual-only'},
  residentE:{id:'resident-archetype-e',url:'/generated-assets/native/kit/resident-archetype-e.glb',state:'PREVIEW',semantic:'crowd-resident-visual',collisionAuthority:'visual-only'},
  residentF:{id:'resident-archetype-f',url:'/generated-assets/native/kit/resident-archetype-f.glb',state:'PREVIEW',semantic:'crowd-resident-visual',collisionAuthority:'visual-only'},
  residentG:{id:'resident-archetype-g',url:'/generated-assets/native/kit/resident-archetype-g.glb',state:'PREVIEW',semantic:'crowd-resident-visual',collisionAuthority:'visual-only'},
  residentH:{id:'resident-archetype-h',url:'/generated-assets/native/kit/resident-archetype-h.glb',state:'PREVIEW',semantic:'crowd-resident-visual',collisionAuthority:'visual-only'},
  cityTransitTrain:{id:'city-transit-train',url:'/generated-assets/native/kit/city-transit-train.glb',state:'PREVIEW',semantic:'city-transit-train-visual',collisionAuthority:'visual-only'},
  streetAndSidewalk:{id:'street-and-sidewalk',url:'/generated-assets/native/kit/street-and-sidewalk.glb',state:'PREVIEW',semantic:'street-visual-module',collisionAuthority:'visual-only'},
  trashCan:{id:'trash-can',url:'/generated-assets/native/kit/trash-can.glb',state:'PREVIEW',semantic:'trash-receptacle',collisionAuthority:'visual-only'},
  recyclingBin:{id:'recycling-bin',url:'/generated-assets/native/kit/recycling-bin.glb',state:'PREVIEW',semantic:'recycling-receptacle',collisionAuthority:'visual-only'},
  dumpster:{id:'dumpster',url:'/generated-assets/native/kit/dumpster.glb',state:'PREVIEW',semantic:'garbage-disposal-dumpster',collisionAuthority:'visual-only'},
  garbageBag:{id:'garbage-bag',url:'/generated-assets/native/kit/garbage-bag.glb',state:'PREVIEW',semantic:'collectible-garbage',collisionAuthority:'visual-only'},
  litterCluster:{id:'litter-cluster',url:'/generated-assets/native/kit/litter-cluster.glb',state:'PREVIEW',semantic:'collectible-litter',collisionAuthority:'visual-only'},
} as const satisfies Record<string,NativeRuntimeAsset>

export type TryammNativeRuntimeAssetKey=keyof typeof TRYAMM_NATIVE_RUNTIME_ASSETS

export interface NativePlacement{
  asset:TryammNativeRuntimeAssetKey
  position:[number,number,number]
  rotationY?:number
  scale?:number|[number,number,number]
  label?:string
}

export const CIRCLE_PARK_NATIVE_PREVIEW_PLACEMENTS:NativePlacement[]=[
  {asset:'building',position:[-25,0,-27],rotationY:Math.PI,label:'west-building-1'},
  {asset:'building',position:[25,0,-27],rotationY:Math.PI,label:'east-building-1'},
  {asset:'building',position:[-25,0,-10],rotationY:Math.PI,label:'west-building-2'},
  {asset:'building',position:[25,0,-10],rotationY:Math.PI,label:'east-building-2'},
  {asset:'building',position:[-25,0,8],rotationY:Math.PI,label:'west-building-3'},
  {asset:'building',position:[25,0,8],rotationY:Math.PI,label:'east-building-3'},

  {asset:'tree',position:[-14,0,20],scale:1.05},
  {asset:'tree',position:[-7,0,19],scale:.95},
  {asset:'tree',position:[7,0,19],scale:1.05},
  {asset:'tree',position:[14,0,20],scale:1},

  {asset:'streetLamp',position:[-8,0,-24]},
  {asset:'streetLamp',position:[8,0,-24]},
  {asset:'streetLamp',position:[-8,0,-3]},
  {asset:'streetLamp',position:[8,0,-3]},
  {asset:'streetLamp',position:[-8,0,18]},
  {asset:'streetLamp',position:[8,0,18]},

  {asset:'bench',position:[-7,0,24],rotationY:Math.PI},
  {asset:'bench',position:[7,0,24],rotationY:Math.PI},
  {asset:'hydrant',position:[9,0,10]},
  {asset:'hydrant',position:[-9,0,-18]},

  {asset:'holoWayfinder',position:[0,0,-35]},
  {asset:'holoWayfinder',position:[-9,0,-7]},
  {asset:'holoWayfinder',position:[9,0,-7]},

  {asset:'vehicleBlockout',position:[-4,0,5],rotationY:Math.PI/2},
  {asset:'vehicleBlockout',position:[4,0,-14],rotationY:-Math.PI/2},
  {asset:'sportSedan2027',position:[3,0,-1],rotationY:Math.PI/2,label:'circle-park-repair-car-native'},
  {asset:'boxTruckCustom2027',position:[-6,0,10],rotationY:Math.PI/2,label:'circle-park-custom-box-truck'},

  {asset:'trashCan',position:[-6,0,10],label:'circle-park-trash-can'},
  {asset:'recyclingBin',position:[6,0,10],label:'circle-park-recycling-bin'},
  {asset:'dumpster',position:[5,0,27],rotationY:Math.PI,label:'circle-park-disposal-dumpster'},
  {asset:'garbageBag',position:[3,0,12],scale:.9,label:'garbage-pickup-a'},
  {asset:'garbageBag',position:[-4,0,-20],label:'garbage-pickup-b'},
  {asset:'litterCluster',position:[1,0,23],label:'garbage-pickup-c'},
]

export const CHICAGO_WEST_NATIVE_PREVIEW_PLACEMENTS:NativePlacement[]=[
  // Circle Park / ABLA visual upgrade. Gameplay collision remains in the existing world runtime.
  {asset:'building',position:[-920,0,865],rotationY:Math.PI/2,scale:[2.25,1.55,1.7],label:'circle-park-native-building-west'},
  {asset:'building',position:[-920,0,825],rotationY:Math.PI/2,scale:[2.15,1.45,1.65],label:'circle-park-native-building-south'},
  {asset:'tree',position:[-895,0,805],scale:1.15,label:'circle-park-native-tree-a'},
  {asset:'tree',position:[-875,0,790],scale:1.05,label:'circle-park-native-tree-b'},
  {asset:'tree',position:[-800,0,800],scale:1.1,label:'circle-park-native-tree-c'},
  {asset:'tree',position:[-745,0,775],scale:1.0,label:'circle-park-native-tree-d'},
  {asset:'streetLamp',position:[-885,0,815],label:'circle-park-native-lamp-a'},
  {asset:'streetLamp',position:[-820,0,805],label:'circle-park-native-lamp-b'},
  {asset:'bench',position:[-865,0,820],rotationY:Math.PI,label:'circle-park-native-bench-a'},
  {asset:'bench',position:[-835,0,820],rotationY:Math.PI,label:'circle-park-native-bench-b'},
  {asset:'hydrant',position:[-900,0,845],label:'circle-park-native-hydrant'},
  {asset:'holoWayfinder',position:[-850,0,846],label:'circle-park-native-wayfinder'},

  // Roosevelt / Taylor corridor visual upgrade.
  {asset:'building',position:[-570,0,645],rotationY:0,scale:[2.8,1.35,1.6],label:'taylor-native-storefront-west'},
  {asset:'building',position:[-470,0,645],rotationY:0,scale:[2.8,1.4,1.6],label:'taylor-native-storefront-east'},
  {asset:'streetLamp',position:[-650,0,715],label:'roosevelt-native-lamp-a'},
  {asset:'streetLamp',position:[-570,0,690],label:'taylor-native-lamp-a'},
  {asset:'streetLamp',position:[-490,0,675],label:'taylor-native-lamp-b'},
  {asset:'sportSedan2027',position:[-690,0,880],rotationY:Math.PI/2,label:'roosevelt-native-sedan-a'},
  {asset:'sportSedan2027',position:[-610,0,920],rotationY:-Math.PI/2,label:'roosevelt-native-sedan-b'},
  {asset:'boxTruckCustom2027',position:[-555,0,930],rotationY:Math.PI/2,label:'roosevelt-native-box-truck'},

  // Non-interactive crowd visuals; gameplay NPC authority stays with NEAR_WEST_NPCS.
  {asset:'residentA',position:[-885,0,832],rotationY:.25,label:'circle-park-native-resident-a'},
  {asset:'residentB',position:[-810,0,828],rotationY:-.45,label:'circle-park-native-resident-b'},
  {asset:'residentC',position:[-625,0,702],rotationY:.5,label:'taylor-native-resident-c'},
  {asset:'residentD',position:[-505,0,692],rotationY:-.35,label:'taylor-native-resident-d'},
] as const

export const NATIVE_RUNTIME_POLICY={
  generatedBeforeViteBuild:true,
  generatedAssetsArePublicBuildInputs:true,
  previewAssetsRemainVisualOnlyUntilCertified:true,
  primitiveGameplayCollisionRemainsAuthoritative:true,
  loadFailureMustNotBreakStreetVerse:true,
  assetPassportRequiredForRuntimeCollisionPromotion:true,
  targetDevicePerformanceRequiredForRuntimeCollisionPromotion:true,
} as const