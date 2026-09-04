import fs from 'node:fs'

const registry=new URL('../src/data/livingWorldRecoveryRegistry.ts',import.meta.url)
const assets=new URL('../src/data/streetverseAssetRegistry.ts',import.meta.url)
const release=new URL('../src/data/gameVerseReleaseRegistry.ts',import.meta.url)
const livingWorld=new URL('../src/components/StreetVerseLivingWorld.tsx',import.meta.url)
const blenderExporter=new URL('../tools/blender/export_streetverse_glb.py',import.meta.url)
for(const file of [registry,assets,release,livingWorld,blenderExporter]){if(!fs.existsSync(file))throw new Error(`Missing required world contract: ${file.pathname}`)}
const recovery=fs.readFileSync(registry,'utf8')
const street=fs.readFileSync(assets,'utf8')
const game=fs.readFileSync(release,'utf8')
const living=fs.readFileSync(livingWorld,'utf8')
const blender=fs.readFileSync(blenderExporter,'utf8')
for(const token of ['archive-first','verify-license-before-import','create-only-when-missing','puerto-rico','chicago','characters','animals','vehicles','holo-xr','judah','audio','spaceverse','creator','legacy','one-world-memory','deep-link-back-to-world','performance-budget-passed']){
  if(!recovery.includes(token))throw new Error(`Recovery contract missing ${token}`)
}
for(const token of ['player-default','npc-citizen-a','reward-coin-gold','city-tree']){if(!street.includes(token))throw new Error(`StreetVerse registry missing ${token}`)}
for(const token of ['streetverse','shared-state','clip-capture','save','accessibility','multiplayer']){if(!game.includes(token))throw new Error(`Game release contract missing ${token}`)}
if(living.includes("responderNPCs.forEach((npc,i)=>"))throw new Error('Responder animation must not treat Map string keys as numeric phase offsets')
for(const token of ['responderNPCIndex=0','for(const npc of responderNPCs.values())','elapsed*9+responderNPCIndex']){if(!living.includes(token))throw new Error(`Responder animation regression guard missing ${token}`)}
for(const token of ['EXPORT_SCHEMA = "tryamm.streetverse.blender-export.v1"','output.suffix.lower() != ".glb"','scene.unit_settings.system != "METRIC"','scale_length, 1.0','export_format="GLB"','export_yup=True','export_animations=True','"proofReference"','"commercialUse"','"derivativeUse"','"grantedByExporter": False','"requiresStreetVerseRightsRegistryReview": True']){
  if(!blender.includes(token))throw new Error(`Blender export safety contract missing ${token}`)
}
if(!blender.includes('args.rights_status == "LICENSED" and not args.proof_reference'))throw new Error('Licensed Blender exports must require proof evidence')
if(blender.includes('"grantedByExporter": True'))throw new Error('Blender exporter must never self-grant StreetVerse production clearance')
console.log('Living World recovery contract PASS')
