/**
 * Source-of-truth identifiers for original character GLB bytes recovered from
 * StreetVerse_Real_GLBS_Repo_Install.zip in private Google Drive (2026-11-16).
 *
 * IMPORTANT: Recording a verified digest does not put a binary in the public
 * app. The exact files remain private until publication is approved.
 * Never substitute a different person's rig or a procedural body and call it
 * the original character.
 */
export const STREETVERSE_RECOVERED_HERO_ASSETS={
 bj:{
  characterId:'bj-stubbs',filename:'BJ_STUBBS_V15_RECOVERED.glb',
  sourceBytes:6214772,
  sha256:'122e77b243bb9feac9c6e835a500207d034ef8ee710f52751a89ee917e685258',
  privateRecoveryFolder:'StreetVerse Development/Original GLB Recovery 2026-11-16',
  publicUrl:'/assets/characters/BJ_STUBBS_V15_RECOVERED.glb',
  deploymentStatus:'private-source-recovered-public-binary-not-certified'
 },
 lateasia:{
  characterId:'lateasia-monroe',filename:'LaTeasia_RIGGED_DIAGNOSTIC.glb',
  sourceBytes:871880,
  sha256:'96faef46205295d16cdf6c8d21a0e216438141f053cf0601800d62d3020998af',
  privateRecoveryFolder:'StreetVerse Development/Original GLB Recovery 2026-11-16',
  publicUrl:'/assets/characters/LaTeasia_RIGGED_DIAGNOSTIC.glb',
  deploymentStatus:'private-source-recovered-public-binary-not-certified'
 },
} as const
export function fingerprintMatchesVerifiedAsset(key:keyof typeof STREETVERSE_RECOVERED_HERO_ASSETS,bytes:number,sha256:string):boolean{
 const asset=STREETVERSE_RECOVERED_HERO_ASSETS[key];
 return bytes===asset.sourceBytes&&typeof sha256==='string'&&sha256.toLowerCase()===asset.sha256;
}
