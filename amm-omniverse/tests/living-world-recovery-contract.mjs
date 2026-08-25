import fs from 'node:fs'

const registry=new URL('../src/data/livingWorldRecoveryRegistry.ts',import.meta.url)
const assets=new URL('../src/data/streetverseAssetRegistry.ts',import.meta.url)
const release=new URL('../src/data/gameVerseReleaseRegistry.ts',import.meta.url)
for(const file of [registry,assets,release]){if(!fs.existsSync(file))throw new Error(`Missing required world contract: ${file.pathname}`)}
const recovery=fs.readFileSync(registry,'utf8')
const street=fs.readFileSync(assets,'utf8')
const game=fs.readFileSync(release,'utf8')
for(const token of ['archive-first','verify-license-before-import','create-only-when-missing','puerto-rico','chicago','characters','animals','vehicles','holo-xr','judah','audio','spaceverse','creator','legacy','one-world-memory','deep-link-back-to-world','performance-budget-passed']){
  if(!recovery.includes(token))throw new Error(`Recovery contract missing ${token}`)
}
for(const token of ['player-default','npc-citizen-a','reward-coin-gold','city-tree']){if(!street.includes(token))throw new Error(`StreetVerse registry missing ${token}`)}
for(const token of ['streetverse','shared-state','clip-capture','save','accessibility','multiplayer']){if(!game.includes(token))throw new Error(`Game release contract missing ${token}`)}
console.log('Living World recovery contract PASS')
