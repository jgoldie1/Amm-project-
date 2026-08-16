export type PlayerAssetStatus='planned'|'reference-ready'|'rig-ready'|'engine-ready'

export const DOLO_PLAYER={
  id:'dolo-ai-player',
  displayName:'Dolo',
  role:'AI creator / HoloGPT player',
  identityType:'original-virtual-character',
  description:'Original TryAMM virtual AI player used across GameVerse, Living Worlds, Holo experiences, media productions and creator tools.',
  visual:{
    palette:['#04050E','#4FE3FF','#E8B944','#FFFFFF'],
    silhouette:'athletic-neutral',
    wardrobe:['black-gold-founder','holo-cyan','game-combat','sports-neutral','creator-studio'],
    views:['front','left','right','back','head-closeup'],
  },
  variants:['standard','holographic','ar','vr','mr','cinematic','low-poly-mobile'],
  rig:{
    humanoid:true,
    tPose:true,
    facialBlendshapes:true,
    handRig:true,
    eyeLook:true,
    lipSync:true,
  },
  exportTargets:['glb','gltf','fbx','usd','usdz'],
  engines:['web-threejs','unity','unreal','godot','quantum-speed-engine'],
  animationSets:['idle','walk','run','jump','interact','dance','creator-present','combat-neutral','sports-neutral','holo-transform'],
  integrationHooks:['holo-overlay','quantum-beat','quantum-lag-buster','voice-ui','sign-language','omniplayer','living-worlds','gameverse'],
  assetStatus:{
    turnaround:'reference-ready' as PlayerAssetStatus,
    mesh:'planned' as PlayerAssetStatus,
    textures:'planned' as PlayerAssetStatus,
    rig:'planned' as PlayerAssetStatus,
    animations:'planned' as PlayerAssetStatus,
    engineExports:'planned' as PlayerAssetStatus,
  },
  rules:{
    originalIP:true,
    biometricInputRequired:false,
    noThirdPartyCharacterCopying:true,
    progressionSeparatedFromAvatar:true,
  }
} as const

export type DoloPlayer=typeof DOLO_PLAYER
