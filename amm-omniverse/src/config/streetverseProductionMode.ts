// StreetVerse production policy: the playable world must never wait on new external assets.
// Existing procedural geometry and approved bundled assets are the production baseline.
export const STREETVERSE_PRODUCTION_MODE = {
  proceduralFirst: true,
  externalAssetsRequired: false,
  missingAssetPolicy: 'keep-procedural-fallback',
  streamOptionalAssets: true,
  blockGameplayForMissingAsset: false,
} as const

export function announceStreetVerseProductionMode(){
  if(typeof window==='undefined')return
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-production-mode',{detail:STREETVERSE_PRODUCTION_MODE}))
}
