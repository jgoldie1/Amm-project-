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
  circleParkHoop:{id:'sv-circle-park-hoop',url:'/generated-assets/overnight-kit/sv-circle-park-hoop.glb',state:'PREVIEW',semantic:'sports-park-prop',collisionAuthority:'visual-only'},
  circleParkEntry:{id:'sv-circle-park-entry',url:'/generated-assets/overnight-kit/sv-circle-park-entry.glb',state:'PREVIEW',semantic:'park-wayfinding',collisionAuthority:'visual-only'},
  westSideGuardGate:{id:'sv-westside-guard-gate',url:'/generated-assets/overnight-kit/sv-westside-guard-gate.glb',state:'PREVIEW',semantic:'guarded-entry-visual',collisionAuthority:'visual-only'},
  taylorBikeRack:{id:'sv-taylor-bike-rack',url:'/generated-assets/overnight-kit/sv-taylor-bike-rack.glb',state:'PREVIEW',semantic:'street-furniture',collisionAuthority:'visual-only'},
  taylorPlanter:{id:'sv-taylor-planter',url:'/generated-assets/overnight-kit/sv-taylor-planter.glb',state:'PREVIEW',semantic:'urban-greenery',collisionAuthority:'visual-only'},
  westSideBusShelter:{id:'sv-westside-bus-shelter',url:'/generated-assets/overnight-kit/sv-westside-bus-shelter.glb',state:'PREVIEW',semantic:'transit-furniture',collisionAuthority:'visual-only'},
  westSideBench:{id:'sv-westside-bench',url:'/generated-assets/overnight-kit/sv-westside-bench.glb',state:'PREVIEW',semantic:'street-furniture',collisionAuthority:'visual-only'},
  westSideFoodKiosk:{id:'sv-westside-food-kiosk',url:'/generated-assets/overnight-kit/sv-westside-food-kiosk.glb',state:'PREVIEW',semantic:'small-business-kiosk',collisionAuthority:'visual-only'},
  circleParkWaterFountain:{id:'sv-circle-park-water-fountain',url:'/generated-assets/overnight-kit/sv-circle-park-water-fountain.glb',state:'PREVIEW',semantic:'park-amenity',collisionAuthority:'visual-only'},
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
  // New 2026-10-15 art pass; static visual-only placements, no gameplay collision overrides.
  {asset:'circleParkEntry',position:[0,0,-29],label:'circle-park-new-entrance'},
  {asset:'circleParkHoop',position:[-6,0,6],label:'circle-park-new-basketball-hoop'},
  {asset:'circleParkWaterFountain',position:[9,0,15],label:'circle-park-new-drinking-water'},
  {asset:'westSideBench',position:[-9,0,19],label:'circle-park-new-bench'},
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
  // Original asset-forge geometry: Circle Park, Taylor Street and West Side paths.
  // Coordinate values are game-space placements pending city-survey accuracy review.
  {asset:'circleParkEntry',position:[-880,0,812],label:'circle-park-westside-new-entry'},
  {asset:'circleParkHoop',position:[-865,0,845],label:'circle-park-westside-new-hoop'},
  {asset:'circleParkWaterFountain',position:[-840,0,830],label:'circle-park-westside-water'},
  {asset:'westSideBench',position:[-825,0,840],label:'circle-park-westside-new-bench'},
  {asset:'westSideGuardGate',position:[-575,0,700],rotationY:Math.PI/2,label:'taylor-westside-guarded-entrance'},
  {asset:'taylorBikeRack',position:[-535,0,695],label:'taylor-new-bike-rack'},
  {asset:'taylorPlanter',position:[-510,0,685],label:'taylor-new-planter'},
  {asset:'westSideBusShelter',position:[-700,0,920],label:'roosevelt-new-bus-shelter'},
  {asset:'westSideFoodKiosk',position:[-695,0,930],label:'roosevelt-new-food-kiosk'},
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

  // Roosevelt expansion: denser blocks, street furniture, parked cars and visible life.
  {asset:'building',position:[-760,0,900],rotationY:Math.PI/2,scale:[2.45,1.6,1.7],label:'roosevelt-native-building-west-a'},
  {asset:'building',position:[-710,0,900],rotationY:Math.PI/2,scale:[2.25,1.45,1.6],label:'roosevelt-native-building-west-b'},
  {asset:'building',position:[-650,0,940],rotationY:0,scale:[2.7,1.35,1.55],label:'roosevelt-native-storefront-central'},
  {asset:'building',position:[-590,0,940],rotationY:0,scale:[2.5,1.4,1.55],label:'roosevelt-native-storefront-east'},
  {asset:'tree',position:[-745,0,885],scale:1.15,label:'roosevelt-native-tree-a'},
  {asset:'tree',position:[-705,0,885],scale:1.0,label:'roosevelt-native-tree-b'},
  {asset:'tree',position:[-625,0,920],scale:1.1,label:'roosevelt-native-tree-c'},
  {asset:'streetLamp',position:[-735,0,910],label:'roosevelt-native-lamp-b'},
  {asset:'streetLamp',position:[-675,0,910],label:'roosevelt-native-lamp-c'},
  {asset:'bench',position:[-700,0,918],rotationY:Math.PI,label:'roosevelt-native-bench'},
  {asset:'hydrant',position:[-720,0,890],label:'roosevelt-native-hydrant'},
  {asset:'trashCan',position:[-690,0,920],label:'roosevelt-native-trash'},
  {asset:'residentE',position:[-735,0,915],rotationY:.15,label:'roosevelt-native-resident-e'},
  {asset:'residentF',position:[-675,0,915],rotationY:-.2,label:'roosevelt-native-resident-f'},

  // Taylor / Little Italy expansion: more storefront rhythm and people.
  {asset:'building',position:[-620,0,650],rotationY:0,scale:[2.5,1.28,1.55],label:'taylor-native-storefront-far-west'},
  {asset:'building',position:[-520,0,650],rotationY:0,scale:[2.45,1.35,1.55],label:'taylor-native-storefront-center'},
  {asset:'building',position:[-420,0,650],rotationY:0,scale:[2.55,1.3,1.55],label:'taylor-native-storefront-far-east'},
  {asset:'tree',position:[-600,0,700],scale:1.0,label:'taylor-native-tree-a'},
  {asset:'tree',position:[-540,0,700],scale:1.08,label:'taylor-native-tree-b'},
  {asset:'tree',position:[-480,0,700],scale:1.04,label:'taylor-native-tree-c'},
  {asset:'bench',position:[-535,0,690],rotationY:Math.PI,label:'taylor-native-bench'},
  {asset:'trashCan',position:[-500,0,690],label:'taylor-native-trash'},
  {asset:'recyclingBin',position:[-485,0,690],label:'taylor-native-recycling'},
  {asset:'residentG',position:[-585,0,690],rotationY:.4,label:'taylor-native-resident-g'},
  {asset:'residentH',position:[-455,0,690],rotationY:-.4,label:'taylor-native-resident-h'},
  {asset:'sportSedan2027',position:[-520,0,715],rotationY:Math.PI/2,label:'taylor-native-sedan-c'},
  {asset:'boxTruckCustom2027',position:[-430,0,715],rotationY:-Math.PI/2,label:'taylor-native-delivery-truck'},

  // UIC / Medical approach adds visual continuity beyond Taylor Street.
  {asset:'building',position:[-900,0,690],rotationY:Math.PI/2,scale:[3.0,1.55,1.8],label:'uic-east-native-building-a'},
  {asset:'building',position:[-1040,0,900],rotationY:Math.PI/2,scale:[3.1,1.7,1.85],label:'medical-native-building-a'},
  {asset:'streetLamp',position:[-860,0,700],label:'uic-native-lamp-a'},
  {asset:'streetLamp',position:[-1000,0,910],label:'medical-native-lamp-a'},
  {asset:'tree',position:[-875,0,720],scale:1.18,label:'uic-native-tree-a'},
  {asset:'tree',position:[-1010,0,880],scale:1.12,label:'medical-native-tree-a'},
  {asset:'residentA',position:[-840,0,690],rotationY:.2,label:'uic-native-resident-a'},
  {asset:'residentB',position:[-995,0,905],rotationY:-.3,label:'medical-native-resident-b'},
  {asset:'holoWayfinder',position:[-820,0,700],label:'uic-native-wayfinder'},
  {asset:'holoWayfinder',position:[-970,0,900],label:'medical-native-wayfinder'},
]

export const CIRCLE_PARK_OVERNIGHT_MOBILE_PLACEMENTS:NativePlacement[]=[
  // Loaded after the BJ hero becomes ready so old iPhones prioritize the face.
  {asset:'circleParkHoop',position:[-9,0,8],label:'mobile-circle-park-hoop-20261015'},
  {asset:'circleParkEntry',position:[0,0,23],label:'mobile-circle-park-entry-20261015'},
  {asset:'circleParkWaterFountain',position:[10,0,16],label:'mobile-circle-park-water-20261015'},
  {asset:'taylorPlanter',position:[13,0,29],label:'mobile-taylor-planter-20261015'},
  {asset:'westSideBench',position:[-13,0,30],label:'mobile-circle-park-bench-20261015'},
  {asset:'westSideGuardGate',position:[-20,0,67],label:'mobile-taylor-guard-20261015'},
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