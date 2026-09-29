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
  streetAndSidewalk:{id:'street-and-sidewalk',url:'/generated-assets/native/kit/street-and-sidewalk.glb',state:'PREVIEW',semantic:'street-visual-module',collisionAuthority:'visual-only'},
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
