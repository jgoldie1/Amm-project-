export type RecoveredAssetDisposition='reuse-now'|'upgrade-source'|'reference-only'
export interface RecoveredStreetVerseAsset{sourcePack:string;sourcePath:string;kind:'character'|'vehicle'|'environment'|'texture'|'audio'|'ui';disposition:RecoveredAssetDisposition;targetUse:string}

export const RECOVERED_STREETVERSE_ASSETS:RecoveredStreetVerseAsset[]=[
 {sourcePack:'TRYAMM-Games-Parallel-v3.0-Prefab-Integration',sourcePath:'advanced-assets/Prototype3D/Racer/Judah_GT_Prototype.obj',kind:'vehicle',disposition:'upgrade-source',targetUse:'StreetVerse vehicle forge: remesh/PBR/five-seat rig/collision/LOD'},
 {sourcePack:'TRYAMM-Games-Parallel-v3.0-Prefab-Integration',sourcePath:'advanced-assets/Prototype3D/Hoops/TRYAMM_Hoops_Athlete_Prototype.obj',kind:'character',disposition:'upgrade-source',targetUse:'generic citizen body proportion/retopo source; not BJ likeness'},
 {sourcePack:'TRYAMM-Games-Parallel-v3.0-Prefab-Integration',sourcePath:'advanced-assets/Prototype3D/Chainbreakers/Ari_Mannequin_Prototype.obj',kind:'character',disposition:'upgrade-source',targetUse:'NPC mannequin/rig validation source'},
 {sourcePack:'TRYAMM-Games-Parallel-v3.0-Prefab-Integration',sourcePath:'advanced-assets/Prototype3D/Holoverse/Holo_Portal_Prototype.obj',kind:'environment',disposition:'upgrade-source',targetUse:'Connected Verse portal mesh'},
 {sourcePack:'TRYAMM-Games-Parallel-v3.0-Prefab-Integration',sourcePath:'advanced-assets/Prototype3D/Ships/Judah_Flagship_Prototype.obj',kind:'environment',disposition:'upgrade-source',targetUse:'StarVerse/Judah vehicle environment asset'},
 {sourcePack:'TRYAMM-Games-Parallel-v3.0-Prefab-Integration',sourcePath:'production-assets/Textures/neon_asphalt.png',kind:'texture',disposition:'reuse-now',targetUse:'holographic/future street material variant'},
 {sourcePack:'TRYAMM-Games-Parallel-v3.0-Prefab-Integration',sourcePath:'production-assets/Textures/holoverse_floor.png',kind:'texture',disposition:'reuse-now',targetUse:'Holoverse floor material'},
 {sourcePack:'TRYAMM-Games-Parallel-v3.0-Prefab-Integration',sourcePath:'production-assets/Audio/SFX/portal_ping.wav',kind:'audio',disposition:'reuse-now',targetUse:'portal travel SFX'},
 {sourcePack:'TRYAMM-Games-Parallel-v3.0-Prefab-Integration',sourcePath:'production-assets/Audio/SFX/racer_nitro.wav',kind:'audio',disposition:'reuse-now',targetUse:'vehicle boost SFX'},
 {sourcePack:'TRYAMM-Games-Parallel-v3.0-Prefab-Integration',sourcePath:'production-assets/Audio/SFX/hoops_swish.wav',kind:'audio',disposition:'reuse-now',targetUse:'SportVerse basketball SFX'}
]

export const recoveredUpgradeSources=(kind?:RecoveredStreetVerseAsset['kind'])=>RECOVERED_STREETVERSE_ASSETS.filter(a=>a.disposition==='upgrade-source'&&(!kind||a.kind===kind))
