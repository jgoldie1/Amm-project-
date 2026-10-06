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
  busShelter:{id:'bus-shelter',url:'/generated-assets/native/kit/bus-shelter.glb',state:'PREVIEW',semantic:'transit-shelter',collisionAuthority:'visual-only'},
  basketballHoop:{id:'basketball-hoop',url:'/generated-assets/native/kit/basketball-hoop.glb',state:'PREVIEW',semantic:'park-sports-equipment',collisionAuthority:'visual-only'},
  bikeRack:{id:'bike-rack',url:'/generated-assets/native/kit/bike-rack.glb',state:'PREVIEW',semantic:'street-furniture',collisionAuthority:'visual-only'},
  storefrontAwning:{id:'storefront-awning',url:'/generated-assets/native/kit/storefront-awning.glb',state:'PREVIEW',semantic:'storefront-detail',collisionAuthority:'visual-only'},
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
  {asset:'busShelter',position:[-16,0,-6],rotationY:Math.PI/2,label:'circle-park-bus-shelter-west'},
  {asset:'basketballHoop',position:[-10,0,27],rotationY:Math.PI,label:'circle-park-basketball-hoop-a'},
  {asset:'basketballHoop',position:[10,0,27],label:'circle-park-basketball-hoop-b'},
  {asset:'bikeRack',position:[-3,0,25],rotationY:Math.PI/2,label:'circle-park-bike-rack'},
  {asset:'storefrontAwning',position:[-25,0,-6],rotationY:Math.PI/2,label:'circle-park-storefront-awning-west'},

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

export const NATIVE_RUNTIME_POLICY={
  generatedBeforeViteBuild:true,
  generatedAssetsArePublicBuildInputs:true,
  previewAssetsRemainVisualOnlyUntilCertified:true,
  primitiveGameplayCollisionRemainsAuthoritative:true,
  loadFailureMustNotBreakStreetVerse:true,
  assetPassportRequiredForRuntimeCollisionPromotion:true,
  targetDevicePerformanceRequiredForRuntimeCollisionPromotion:true,
} as const