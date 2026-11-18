/** Extracted from StreetVerse_3_Characters_Play.html, checked against GLB v2 headers and JSON chunks.
 * Binary files are NOT committed yet. The same-origin URLs must return actual GLB bytes.
 * Never represent a missing character model as a successful import.
 */
export const STREETVERSE_RECOVERED_CHARACTER_BASE='/tryamm-assets/recovered-characters';
export const STREETVERSE_RECOVERED_CAST={
  bj:{id:'bj-stubbs',name:'BJ Stubbs',filename:'BJ_STUBBS_V15_MOTION_ENHANCED.glb',bytes:6220868,sha256:'310c56801f32760d79679242c6dee10631957ca29a42d9c8e10f4934df8a8439',skins:1,animationCount:9,textured:true,diagnostic:false},
  jacobie:{id:'jacobie-stubbs',name:'Jacobie Stubbs',filename:'Jacobie_Greenville_Recovered.glb',bytes:7860680,sha256:'f0b0ada28cf343a58668d5adfd8a42aadd12f867ae87c7a24d9b749f4370ed13',skins:1,animationCount:12,textured:true,diagnostic:false},
  lateasia:{id:'lateasia-monroe',name:'LaTeasia Monroe',filename:'LaTeasia_RIGGED_DIAGNOSTIC.glb',bytes:871880,sha256:'96faef46205295d16cdf6c8d21a0e216438141f053cf0601800d62d3020998af',skins:1,animationCount:7,textured:false,diagnostic:true},
} as const;
export const recoveredCastUrl=(role:keyof typeof STREETVERSE_RECOVERED_CAST)=>STREETVERSE_RECOVERED_CHARACTER_BASE+'/'+STREETVERSE_RECOVERED_CAST[role].filename;
