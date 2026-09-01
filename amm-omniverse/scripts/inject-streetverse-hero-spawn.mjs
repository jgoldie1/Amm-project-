import fs from 'node:fs'
import path from 'node:path'

const file=path.resolve('src/components/StreetVerseOmniWorld.tsx')
let src=fs.readFileSync(file,'utf8')

const importLine="import {materializeStreetVerseCharacter,STREETVERSE_CHARACTER_PACK} from '../runtime/StreetVerseCharacterMaterialization'"
if(!src.includes(importLine)){
  src=src.replace(
    "import {appendStreetVerseRevenue,getStreetVerseRevenueSummary} from '../runtime/StreetVerseInternalChain'",
    "import {appendStreetVerseRevenue,getStreetVerseRevenueSummary} from '../runtime/StreetVerseInternalChain'\n"+importLine
  )
}

const oldSpawn="const avatar=person(0x55e4ff,0xba7b52);avatar.scale.setScalar(1.25);avatar.position.set(saved.x??0,0,saved.z??58);scene.add(avatar)"
const newSpawn="const avatar=new THREE.Group();const avatarFallback=person(0x55e4ff,0xba7b52);avatar.add(avatarFallback);avatar.position.set(saved.x??0,0,saved.z??58);scene.add(avatar);materializeStreetVerseCharacter({assetId:STREETVERSE_CHARACTER_PACK.hero.id,fallback:avatarFallback,scene,parent:avatar,position:new THREE.Vector3(0,0,0),scale:1.25,applySavedHeroMorph:true}).then(ok=>{if(ok)setMsg('Customized Hero avatar materialized • StreetVerse controls remain attached to your player root.');else setMsg('Hero asset unavailable or not cleared • safe procedural avatar fallback active.')}).catch(()=>setMsg('Hero avatar load failed • safe procedural avatar fallback active.'))"

if(src.includes(oldSpawn)) src=src.replace(oldSpawn,newSpawn)
else if(!src.includes('Customized Hero avatar materialized')) throw new Error('StreetVerse Hero spawn injection target not found')

fs.writeFileSync(file,src)
console.log('StreetVerse Hero spawn injection: GREEN')
