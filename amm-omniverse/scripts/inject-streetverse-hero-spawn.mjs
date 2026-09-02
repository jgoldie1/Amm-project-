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

const newSpawn="const avatar=new THREE.Group();const avatarFallback=person(0x55e4ff,0xba7b52);avatar.add(avatarFallback);avatar.position.set(saved.x??0,0,saved.z??58);scene.add(avatar);materializeStreetVerseCharacter({assetId:STREETVERSE_CHARACTER_PACK.hero.id,fallback:avatarFallback,scene,parent:avatar,position:new THREE.Vector3(0,0,0),scale:1.25,applySavedHeroMorph:true}).then(ok=>{if(ok)setMsg('Customized Hero avatar materialized • StreetVerse controls remain attached to your player root.');else setMsg('Hero asset unavailable or not cleared • safe procedural avatar fallback active.')}).catch(()=>setMsg('Hero avatar load failed • safe procedural avatar fallback active.'))"

const candidates=[
  "const avatar=person(0x55e4ff,0xba7b52);avatar.scale.setScalar(1.25);avatar.position.set(saved.x??0,0,saved.z??58);scene.add(avatar)",
  /const avatar=person\(0x55e4ff,0xba7b52\);avatar\.scale\.setScalar\([^)]*\);avatar\.position\.set\(saved\.x\?\?0,0,saved\.z\?\?58\);scene\.add\(avatar\)/
]

if(!src.includes('Customized Hero avatar materialized')){
  let replaced=false
  for(const candidate of candidates){
    if(typeof candidate==='string'&&src.includes(candidate)){src=src.replace(candidate,newSpawn);replaced=true;break}
    if(candidate instanceof RegExp&&candidate.test(src)){src=src.replace(candidate,newSpawn);replaced=true;break}
  }
  if(!replaced){
    const anchor='avatar.position.set(saved.x??0,0,saved.z??58)'
    if(src.includes(anchor)) console.warn('StreetVerse Hero spawn injection skipped: avatar structure changed but player spawn anchor still exists.')
    else console.warn('StreetVerse Hero spawn injection skipped: no compatible spawn anchor found; build will continue with current avatar implementation.')
  }
}

fs.writeFileSync(file,src)
console.log('StreetVerse Hero spawn injection: GREEN')
