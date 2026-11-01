import type {GraphicsTier} from './StreetVerseNextGenGraphics';
export type VideoQualityReport={tier:GraphicsTier;pixelRatioCap:number;targetFps:number;hdrToneMapping:boolean;realtimeRayTracing:boolean;hardwareUpscaling:boolean;notes:string[]};
export function streetVerseVideoQuality(tier:GraphicsTier):VideoQualityReport{
 const profiles={mobile:[1,30],balanced:[1.5,60],cinematic:[2,60]} as const;
 const [pixelRatioCap,targetFps]=profiles[tier];
 return {tier,pixelRatioCap,targetFps,hdrToneMapping:true,realtimeRayTracing:false,hardwareUpscaling:false,notes:[
  'ACES filmic tone mapping is not the same as HDR display output.',
  'NVIDIA DLSS, RTX ray tracing and frame generation are not enabled by this Three.js WebGL preset.',
  'Actual frame rate depends on GPU, assets, browser and scene complexity.'
 ]};
}
