import * as THREE from 'three';
export type GraphicsTier='mobile'|'balanced'|'cinematic';
export type GraphicsPreset={pixelRatio:number;shadowMapSize:number;shadowEnabled:boolean;exposure:number;fogDensity:number;anisotropy:number};
export const STREETVERSE_GRAPHICS_PRESETS:Record<GraphicsTier,GraphicsPreset>={
 mobile:{pixelRatio:1,shadowMapSize:512,shadowEnabled:false,exposure:1.05,fogDensity:.007,anisotropy:2},
 balanced:{pixelRatio:1.5,shadowMapSize:1024,shadowEnabled:true,exposure:1.1,fogDensity:.005,anisotropy:4},
 cinematic:{pixelRatio:2,shadowMapSize:2048,shadowEnabled:true,exposure:1.15,fogDensity:.004,anisotropy:8}
};
export function detectStreetVerseGraphicsTier():GraphicsTier{
 if(typeof window==='undefined')return 'mobile';
 const mobile=window.matchMedia?.('(pointer: coarse)').matches;
 const memory=(navigator as Navigator&{deviceMemory?:number}).deviceMemory;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 return mobile||reduced||(memory!==undefined&&memory<=4)?'mobile':'balanced';
}
export function configureStreetVerseRenderer(renderer:THREE.WebGLRenderer,tier:GraphicsTier){
 const p=STREETVERSE_GRAPHICS_PRESETS[tier];
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,p.pixelRatio));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=p.exposure;
 renderer.shadowMap.enabled=p.shadowEnabled;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 return p;
}
export function installStreetVerseLighting(scene:THREE.Scene,tier:GraphicsTier){
 const p=STREETVERSE_GRAPHICS_PRESETS[tier];
 scene.fog=new THREE.FogExp2(0x9fb5c7,p.fogDensity);
 const sun=new THREE.DirectionalLight(0xffe6bf,3);
 sun.position.set(-12,22,10);sun.castShadow=p.shadowEnabled;
 sun.shadow.mapSize.set(p.shadowMapSize,p.shadowMapSize);
 sun.shadow.camera.left=-24;sun.shadow.camera.right=24;
 sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;
 sun.shadow.normalBias=.025;
 scene.add(sun);
 return ()=>{scene.remove(sun);sun.dispose();scene.fog=null};
}
export function upgradeStreetVerseMaterials(root:THREE.Object3D,tier:GraphicsTier,renderer:THREE.WebGLRenderer){
 const p=STREETVERSE_GRAPHICS_PRESETS[tier];
 root.traverse(object=>{
  if(!(object instanceof THREE.Mesh))return;
  object.castShadow=p.shadowEnabled;object.receiveShadow=p.shadowEnabled;
  const mats=Array.isArray(object.material)?object.material:[object.material];
  for(const mat of mats){
   if(!(mat instanceof THREE.MeshStandardMaterial))continue;
   for(const map of [mat.map,mat.normalMap,mat.roughnessMap,mat.metalnessMap,mat.aoMap]){
    if(map){map.anisotropy=Math.min(p.anisotropy,renderer.capabilities.getMaxAnisotropy());map.needsUpdate=true}
   }
   mat.needsUpdate=true;
  }
 });
}
